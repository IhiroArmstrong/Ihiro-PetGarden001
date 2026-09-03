/** Focus Circle small-group membership in TIP_KV (never under `tip:` / `lantern:`). */

export const FOCUS_CIRCLE_SCHEMA_VERSION = 1;
export const FOCUS_CIRCLE_MAX_MEMBERS = 8;
export const FOCUS_CIRCLE_CODE_LENGTH = 6;
export const FOCUS_CIRCLE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CircleMember = { joinedAt: number };

export type FocusCircleRecord = {
	schemaVersion: number;
	circleId: string;
	code: string;
	createdAt: number;
	members: Record<string, CircleMember>;
};

export function isFocusCircleMemberId(value: unknown): value is string {
	return typeof value === "string" && UUID_RE.test(value.trim());
}

export function isFocusCircleId(value: unknown): value is string {
	return isFocusCircleMemberId(value);
}

export function circleIdKvKey(circleId: string): string {
	return `circle:v1:id:${circleId}`;
}

export function circleCodeKvKey(code: string): string {
	return `circle:v1:code:${code.trim().toUpperCase()}`;
}

export function normalizeFocusCircleCode(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const code = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (code.length !== FOCUS_CIRCLE_CODE_LENGTH) return null;
	for (const ch of code) {
		if (!FOCUS_CIRCLE_CODE_CHARS.includes(ch)) return null;
	}
	return code;
}

export function countFocusCircleMembers(record: FocusCircleRecord): number {
	return Object.keys(record.members).length;
}

export function isFocusCircleFull(record: FocusCircleRecord): boolean {
	return countFocusCircleMembers(record) >= FOCUS_CIRCLE_MAX_MEMBERS;
}

export function createFocusCircleRecord(
	circleId: string,
	code: string,
	creatorMemberId: string,
	nowMs: number,
): FocusCircleRecord {
	return {
		schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
		circleId,
		code,
		createdAt: nowMs,
		members: {
			[creatorMemberId]: { joinedAt: nowMs },
		},
	};
}

export type AddMemberResult =
	| { ok: true; record: FocusCircleRecord }
	| { ok: false; reason: "full" | "exists" };

export function addFocusCircleMember(
	record: FocusCircleRecord,
	memberId: string,
	nowMs: number,
): AddMemberResult {
	if (record.members[memberId]) {
		return { ok: true, record };
	}
	if (isFocusCircleFull(record)) {
		return { ok: false, reason: "full" };
	}
	return {
		ok: true,
		record: {
			...record,
			members: {
				...record.members,
				[memberId]: { joinedAt: nowMs },
			},
		},
	};
}

export function removeFocusCircleMember(
	record: FocusCircleRecord,
	memberId: string,
): FocusCircleRecord | null {
	if (!record.members[memberId]) return record;
	const nextMembers = { ...record.members };
	delete nextMembers[memberId];
	if (Object.keys(nextMembers).length === 0) return null;
	return { ...record, members: nextMembers };
}

export function parseFocusCircleRecord(raw: string | null): FocusCircleRecord | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return null;
		}
		const o = parsed as Record<string, unknown>;
		if (o.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION) return null;
		const circleId = typeof o.circleId === "string" ? o.circleId.trim() : "";
		const code = normalizeFocusCircleCode(o.code);
		const createdAt = Number(o.createdAt);
		if (!isFocusCircleId(circleId) || !code || !Number.isFinite(createdAt)) {
			return null;
		}
		const membersRaw =
			o.members && typeof o.members === "object" && !Array.isArray(o.members)
				? (o.members as Record<string, unknown>)
				: {};
		const members: Record<string, CircleMember> = {};
		for (const [id, value] of Object.entries(membersRaw)) {
			if (!isFocusCircleMemberId(id)) continue;
			const joinedAt = Number(
				value &&
					typeof value === "object" &&
					!Array.isArray(value) &&
					(value as Record<string, unknown>).joinedAt,
			);
			if (!Number.isFinite(joinedAt)) continue;
			members[id] = { joinedAt };
		}
		if (Object.keys(members).length === 0) return null;
		return {
			schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
			circleId,
			code,
			createdAt,
			members,
		};
	} catch {
		return null;
	}
}

export function generateFocusCircleCode(
	randomInt: (max: number) => number = (max) =>
		Math.floor(Math.random() * max),
): string {
	let out = "";
	for (let i = 0; i < FOCUS_CIRCLE_CODE_LENGTH; i += 1) {
		out += FOCUS_CIRCLE_CODE_CHARS[randomInt(FOCUS_CIRCLE_CODE_CHARS.length)];
	}
	return out;
}
