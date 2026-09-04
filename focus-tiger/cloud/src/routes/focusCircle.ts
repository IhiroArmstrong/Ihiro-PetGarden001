/**
 * POST /api/focus-circle
 * Focus Circle MVP — create | join | leave | status.
 * No email, no account. 3–8 members per circle via 6-char invite code.
 */

import { errorJson, json } from "../lib/http";
import {
	FOCUS_CIRCLE_SCHEMA_VERSION,
	addFocusCircleMember,
	circleCodeKvKey,
	circleIdKvKey,
	countFocusCircleMembers,
	createFocusCircleRecord,
	generateFocusCircleCode,
	isFocusCircleId,
	isFocusCircleMemberId,
	normalizeFocusCircleCode,
	parseFocusCircleRecord,
	removeFocusCircleMember,
} from "../lib/focusCircleKv";
import {
	FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
	applyCirclePresenceHeartbeat,
	applyCirclePresenceLeave,
	circlePresenceKvKey,
	countCircleSittingSessions,
	parseFocusCirclePresenceRecord,
} from "../lib/focusCirclePresenceKv";
import type { Env } from "../types";

const ACTIONS = new Set([
	"create",
	"join",
	"leave",
	"status",
	"presence_peek",
	"presence_heartbeat",
	"presence_leave",
]);
const MAX_CODE_RETRIES = 12;

type KvLike = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
};

async function loadCircle(kv: KvLike, circleId: string) {
	const raw = await kv.get(circleIdKvKey(circleId));
	return parseFocusCircleRecord(raw);
}

async function saveCircle(kv: KvLike, record: NonNullable<Awaited<ReturnType<typeof loadCircle>>>) {
	await kv.put(circleIdKvKey(record.circleId), JSON.stringify(record));
	await kv.put(circleCodeKvKey(record.code), record.circleId);
}

async function deleteCircle(kv: KvLike, record: NonNullable<Awaited<ReturnType<typeof loadCircle>>>) {
	await kv.delete(circleIdKvKey(record.circleId));
	await kv.delete(circleCodeKvKey(record.code));
	await kv.delete(circlePresenceKvKey(record.circleId));
}

async function loadCirclePresence(kv: KvLike, circleId: string) {
	const raw = await kv.get(circlePresenceKvKey(circleId));
	return parseFocusCirclePresenceRecord(raw).sessions;
}

async function saveCirclePresence(
	kv: KvLike,
	circleId: string,
	sessions: Record<string, number>,
) {
	await kv.put(
		circlePresenceKvKey(circleId),
		JSON.stringify({
			schemaVersion: FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
			sessions,
		}),
	);
}

async function clearCircleMemberPresence(
	kv: KvLike,
	circleId: string,
	memberId: string,
	nowMs: number,
) {
	const sessions = await loadCirclePresence(kv, circleId);
	const next = applyCirclePresenceLeave(sessions, memberId, nowMs);
	await saveCirclePresence(kv, circleId, next);
}

function circlePayload(record: NonNullable<Awaited<ReturnType<typeof loadCircle>>>, memberId: string) {
	return {
		ok: true as const,
		schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
		circleId: record.circleId,
		code: record.code,
		memberId,
		memberCount: countFocusCircleMembers(record),
	};
}

/**
 * @param {Request} request
 * @param {Env} env
 */
export async function handleFocusCircle(
	request: Request,
	env: Env,
	nowMs = Date.now(),
): Promise<Response> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorJson(400, "invalid_json", "Request body must be valid JSON");
	}
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return errorJson(400, "invalid_body", "Request body must be a JSON object");
	}
	const o = body as Record<string, unknown>;
	if (o.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) {
		return errorJson(400, "bad_schema", "Unsupported schemaVersion");
	}
	const action = typeof o.action === "string" ? o.action : "";
	if (!ACTIONS.has(action)) {
		return errorJson(
			400,
			"bad_action",
			"action must be create, join, leave, status, presence_peek, presence_heartbeat, or presence_leave",
		);
	}

	const kv = env.TIP_KV;
	if (!kv) {
		return errorJson(500, "kv_missing", "Circle store unavailable");
	}

	try {
		if (action === "create") {
			const memberId =
				typeof o.memberId === "string" ? o.memberId.trim() : "";
			if (!isFocusCircleMemberId(memberId)) {
				return errorJson(400, "bad_member_id", "memberId must be a UUID");
			}
			const circleId = crypto.randomUUID();
			for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt += 1) {
				const code = generateFocusCircleCode();
				const existingId = await kv.get(circleCodeKvKey(code));
				if (existingId) continue;
				const record = createFocusCircleRecord(
					circleId,
					code,
					memberId,
					nowMs,
				);
				await saveCircle(kv, record);
				return json(circlePayload(record, memberId));
			}
			return errorJson(500, "code_collision", "Could not allocate invite code");
		}

		if (action === "join") {
			const code = normalizeFocusCircleCode(o.code);
			if (!code) {
				return errorJson(400, "bad_code", "code must be 6 characters");
			}
			const memberId =
				typeof o.memberId === "string" ? o.memberId.trim() : "";
			if (!isFocusCircleMemberId(memberId)) {
				return errorJson(400, "bad_member_id", "memberId must be a UUID");
			}
			const circleId = await kv.get(circleCodeKvKey(code));
			if (!circleId || !isFocusCircleId(circleId)) {
				return errorJson(404, "circle_not_found", "No circle for that code");
			}
			const record = await loadCircle(kv, circleId);
			if (!record || record.code !== code) {
				return errorJson(404, "circle_not_found", "No circle for that code");
			}
			const added = addFocusCircleMember(record, memberId, nowMs);
			if (!added.ok) {
				return errorJson(409, "circle_full", "This circle is full");
			}
			await saveCircle(kv, added.record);
			return json(circlePayload(added.record, memberId));
		}

		const circleId =
			typeof o.circleId === "string" ? o.circleId.trim() : "";
		const memberId =
			typeof o.memberId === "string" ? o.memberId.trim() : "";
		if (!isFocusCircleId(circleId)) {
			return errorJson(400, "bad_circle_id", "circleId must be a UUID");
		}
		if (!isFocusCircleMemberId(memberId)) {
			return errorJson(400, "bad_member_id", "memberId must be a UUID");
		}

		const record = await loadCircle(kv, circleId);
		if (!record) {
			return errorJson(404, "circle_not_found", "Circle not found");
		}

		if (
			action === "presence_peek" ||
			action === "presence_heartbeat" ||
			action === "presence_leave"
		) {
			if (!record.members[memberId]) {
				return errorJson(403, "not_member", "Not a member of this circle");
			}
			const sessions = await loadCirclePresence(kv, circleId);
			if (action === "presence_peek") {
				const sittingOthers = countCircleSittingSessions(
					sessions,
					nowMs,
					memberId,
				);
				return json({
					ok: true,
					schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
					sittingOthers,
				});
			}
			const next =
				action === "presence_heartbeat"
					? applyCirclePresenceHeartbeat(sessions, memberId, nowMs)
					: applyCirclePresenceLeave(sessions, memberId, nowMs);
			await saveCirclePresence(kv, circleId, next);
			const sittingOthers = countCircleSittingSessions(next, nowMs, memberId);
			return json({
				ok: true,
				schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
				sittingOthers,
			});
		}

		if (action === "status") {
			const isMember = Boolean(record.members[memberId]);
			return json({
				ok: true,
				schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
				circleId: record.circleId,
				code: record.code,
				memberId,
				memberCount: countFocusCircleMembers(record),
				isMember,
			});
		}

		const next = removeFocusCircleMember(record, memberId);
		await clearCircleMemberPresence(kv, circleId, memberId, nowMs);
		if (!next) {
			await deleteCircle(kv, record);
			return json({
				ok: true,
				schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
				left: true,
				memberCount: 0,
			});
		}
		await saveCircle(kv, next);
		return json({
			ok: true,
			schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
			left: true,
			circleId: next.circleId,
			code: next.code,
			memberId,
			memberCount: countFocusCircleMembers(next),
		});
	} catch {
		return errorJson(500, "kv_failed", "Could not update circle");
	}
}
