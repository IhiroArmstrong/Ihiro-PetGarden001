/** Focus Circle sitting presence per circle in TIP_KV (never under `tip:` / `lantern:`). */

import { isFocusCircleMemberId } from "./focusCircleKv.ts";

export const FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION = 1;
export const FOCUS_CIRCLE_PRESENCE_TTL_MS = 120_000;
export const FOCUS_CIRCLE_PRESENCE_MAX_SESSIONS = 16;

export type CircleSittingSessions = Record<string, number>;

export type FocusCirclePresenceRecord = {
	schemaVersion: number;
	sessions: CircleSittingSessions;
};

export function circlePresenceKvKey(circleId: string): string {
	return `circle:v1:sit:${circleId.trim()}`;
}

export function pruneCircleSittingSessions(
	sessions: CircleSittingSessions,
	nowMs: number,
): CircleSittingSessions {
	const out: CircleSittingSessions = {};
	for (const [id, exp] of Object.entries(sessions)) {
		if (!isFocusCircleMemberId(id)) continue;
		const expiry = Number(exp);
		if (!Number.isFinite(expiry) || expiry <= nowMs) continue;
		out[id] = expiry;
	}
	return out;
}

export function countCircleSittingSessions(
	sessions: CircleSittingSessions,
	nowMs: number,
	excludeMemberId?: string,
): number {
	const pruned = pruneCircleSittingSessions(sessions, nowMs);
	let count = 0;
	for (const id of Object.keys(pruned)) {
		if (excludeMemberId && id === excludeMemberId) continue;
		count += 1;
	}
	return count;
}

function dropOldestIfNeeded(
	sessions: CircleSittingSessions,
	nowMs: number,
): CircleSittingSessions {
	let pruned = pruneCircleSittingSessions(sessions, nowMs);
	const ids = Object.keys(pruned);
	if (ids.length <= FOCUS_CIRCLE_PRESENCE_MAX_SESSIONS) return pruned;
	ids.sort((a, b) => pruned[a] - pruned[b]);
	const keep = ids.slice(ids.length - FOCUS_CIRCLE_PRESENCE_MAX_SESSIONS);
	const out: CircleSittingSessions = {};
	for (const id of keep) out[id] = pruned[id];
	return out;
}

export function applyCirclePresenceHeartbeat(
	sessions: CircleSittingSessions,
	memberId: string,
	nowMs: number,
	ttlMs = FOCUS_CIRCLE_PRESENCE_TTL_MS,
): CircleSittingSessions {
	const next = dropOldestIfNeeded(sessions, nowMs);
	next[memberId] = nowMs + ttlMs;
	return dropOldestIfNeeded(next, nowMs);
}

export function applyCirclePresenceLeave(
	sessions: CircleSittingSessions,
	memberId: string,
	nowMs: number,
): CircleSittingSessions {
	const next = pruneCircleSittingSessions(sessions, nowMs);
	delete next[memberId];
	return next;
}

export function parseFocusCirclePresenceRecord(
	raw: string | null,
): FocusCirclePresenceRecord {
	if (!raw) {
		return {
			schemaVersion: FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
			sessions: {},
		};
	}
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {
				schemaVersion: FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
				sessions: {},
			};
		}
		const o = parsed as Record<string, unknown>;
		const sessions =
			o.sessions && typeof o.sessions === "object" && !Array.isArray(o.sessions)
				? (o.sessions as CircleSittingSessions)
				: {};
		return {
			schemaVersion: FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
			sessions,
		};
	} catch {
		return {
			schemaVersion: FOCUS_CIRCLE_PRESENCE_SCHEMA_VERSION,
			sessions: {},
		};
	}
}
