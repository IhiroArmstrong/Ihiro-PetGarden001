/**
 * POST /api/lantern-presence
 * Anonymous Quiet Together / Global Lanterns — peek | heartbeat | leave.
 * No email, no account. Session id is ephemeral.
 */

import { errorJson, json } from "../lib/http";
import {
	LANTERN_PRESENCE_KV_KEY,
	LANTERN_PRESENCE_SCHEMA_VERSION,
	applyLanternHeartbeat,
	applyLanternLeave,
	countLanternSessions,
	isLanternSessionId,
	parseLanternPresenceRecord,
} from "../lib/lanternPresenceKv";
import type { Env } from "../types";

const ACTIONS = new Set(["peek", "heartbeat", "leave"]);

type KvLike = { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> };

async function loadSessions(kv: KvLike) {
	const raw = await kv.get(LANTERN_PRESENCE_KV_KEY);
	const record = parseLanternPresenceRecord(raw);
	return record.sessions;
}

async function saveSessions(kv: KvLike, sessions: Record<string, number>) {
	await kv.put(
		LANTERN_PRESENCE_KV_KEY,
		JSON.stringify({
			schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION,
			sessions,
		}),
	);
}

/**
 * @param {Request} request
 * @param {Env} env
 */
export async function handleLanternPresence(
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
	if (o.schemaVersion !== LANTERN_PRESENCE_SCHEMA_VERSION) {
		return errorJson(400, "bad_schema", "Unsupported schemaVersion");
	}
	const action = typeof o.action === "string" ? o.action : "";
	if (!ACTIONS.has(action)) {
		return errorJson(400, "bad_action", "action must be peek, heartbeat, or leave");
	}

	const kv = env.TIP_KV;
	if (!kv) {
		return errorJson(500, "kv_missing", "Presence store unavailable");
	}

	try {
		if (action === "peek") {
			const sessions = await loadSessions(kv);
			const sitting = countLanternSessions(sessions, nowMs);
			return json({
				ok: true,
				schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION,
				sitting,
			});
		}

		const sessionId =
			typeof o.sessionId === "string" ? o.sessionId.trim() : "";
		if (!isLanternSessionId(sessionId)) {
			return errorJson(400, "bad_session_id", "sessionId must be a UUID");
		}

		const sessions = await loadSessions(kv);
		const next =
			action === "heartbeat"
				? applyLanternHeartbeat(sessions, sessionId, nowMs)
				: applyLanternLeave(sessions, sessionId, nowMs);
		await saveSessions(kv, next);
		return json({
			ok: true,
			schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION,
			sitting: countLanternSessions(next, nowMs),
		});
	} catch {
		return errorJson(500, "kv_failed", "Could not update presence");
	}
}
