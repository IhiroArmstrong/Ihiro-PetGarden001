/** Quiet Together / Global Lanterns live map in TIP_KV (never under `tip:`). */

export const LANTERN_PRESENCE_KV_KEY = "lantern:v1:live";
export const LANTERN_PRESENCE_SCHEMA_VERSION = 1;
export const LANTERN_PRESENCE_TTL_MS = 120_000;
export const LANTERN_PRESENCE_MAX_SESSIONS = 400;

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isLanternSessionId(value: unknown): value is string {
	return typeof value === "string" && UUID_RE.test(value.trim());
}

export type LanternSessions = Record<string, number>;

export type LanternPresenceRecord = {
	schemaVersion: number;
	sessions: LanternSessions;
};

export function pruneLanternSessions(
	sessions: LanternSessions,
	nowMs: number,
): LanternSessions {
	const out: LanternSessions = {};
	for (const [id, exp] of Object.entries(sessions)) {
		if (!isLanternSessionId(id)) continue;
		const expiry = Number(exp);
		if (!Number.isFinite(expiry) || expiry <= nowMs) continue;
		out[id] = expiry;
	}
	return out;
}

export function countLanternSessions(
	sessions: LanternSessions,
	nowMs: number,
): number {
	return Object.keys(pruneLanternSessions(sessions, nowMs)).length;
}

function dropOldestIfNeeded(
	sessions: LanternSessions,
	nowMs: number,
): LanternSessions {
	let pruned = pruneLanternSessions(sessions, nowMs);
	const ids = Object.keys(pruned);
	if (ids.length <= LANTERN_PRESENCE_MAX_SESSIONS) return pruned;
	ids.sort((a, b) => pruned[a] - pruned[b]);
	const keep = ids.slice(ids.length - LANTERN_PRESENCE_MAX_SESSIONS);
	const out: LanternSessions = {};
	for (const id of keep) out[id] = pruned[id];
	return out;
}

export function applyLanternHeartbeat(
	sessions: LanternSessions,
	sessionId: string,
	nowMs: number,
	ttlMs = LANTERN_PRESENCE_TTL_MS,
): LanternSessions {
	const next = dropOldestIfNeeded(sessions, nowMs);
	next[sessionId] = nowMs + ttlMs;
	return dropOldestIfNeeded(next, nowMs);
}

export function applyLanternLeave(
	sessions: LanternSessions,
	sessionId: string,
	nowMs: number,
): LanternSessions {
	const next = pruneLanternSessions(sessions, nowMs);
	delete next[sessionId];
	return next;
}

export function parseLanternPresenceRecord(
	raw: string | null,
): LanternPresenceRecord {
	if (!raw) {
		return { schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION, sessions: {} };
	}
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return { schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION, sessions: {} };
		}
		const o = parsed as Record<string, unknown>;
		const sessions =
			o.sessions && typeof o.sessions === "object" && !Array.isArray(o.sessions)
				? (o.sessions as LanternSessions)
				: {};
		return {
			schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION,
			sessions,
		};
	} catch {
		return { schemaVersion: LANTERN_PRESENCE_SCHEMA_VERSION, sessions: {} };
	}
}
