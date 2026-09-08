/** Focus Circle was-here-today marks per circle in TIP_KV. */

import {
	FOCUS_CIRCLE_MAX_MEMBERS,
	isFocusCircleMemberId,
} from "./focusCircleKv.ts";
import {
	type CircleSittingSessions,
	pruneCircleSittingSessions,
} from "./focusCirclePresenceKv.ts";

export const FOCUS_CIRCLE_WAS_HERE_SCHEMA_VERSION = 1;

export type WasHereMemberEntry = {
	markedAtMs: number;
	markerDayKey: string;
};

export type FocusCircleWasHereRecord = {
	schemaVersion: number;
	members: Record<string, WasHereMemberEntry>;
};

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function circleWasHereKvKey(circleId: string): string {
	return `circle:v1:here:${circleId.trim()}`;
}

export function isWasHereDayKey(value: string): boolean {
	return DAY_KEY_RE.test(value);
}

export function toLocalDayKey(ms: number, timeZone: string): string {
	try {
		const parts = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).formatToParts(new Date(ms));
		const y = parts.find((p) => p.type === "year")?.value;
		const m = parts.find((p) => p.type === "month")?.value;
		const d = parts.find((p) => p.type === "day")?.value;
		if (y && m && d) return `${y}-${m}-${d}`;
	} catch {
		// fall through
	}
	return new Date(ms).toISOString().slice(0, 10);
}

export function parseFocusCircleWasHereRecord(
	raw: string | null,
): FocusCircleWasHereRecord {
	if (!raw) {
		return {
			schemaVersion: FOCUS_CIRCLE_WAS_HERE_SCHEMA_VERSION,
			members: {},
		};
	}
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {
				schemaVersion: FOCUS_CIRCLE_WAS_HERE_SCHEMA_VERSION,
				members: {},
			};
		}
		const o = parsed as Record<string, unknown>;
		const members =
			o.members && typeof o.members === "object" && !Array.isArray(o.members)
				? (o.members as Record<string, WasHereMemberEntry>)
				: {};
		return {
			schemaVersion: FOCUS_CIRCLE_WAS_HERE_SCHEMA_VERSION,
			members,
		};
	} catch {
		return {
			schemaVersion: FOCUS_CIRCLE_WAS_HERE_SCHEMA_VERSION,
			members: {},
		};
	}
}

function trimWasHereMembers(
	members: Record<string, WasHereMemberEntry>,
): Record<string, WasHereMemberEntry> {
	const ids = Object.keys(members).filter((id) => isFocusCircleMemberId(id));
	if (ids.length <= FOCUS_CIRCLE_MAX_MEMBERS) {
		const out: Record<string, WasHereMemberEntry> = {};
		for (const id of ids) out[id] = members[id];
		return out;
	}
	ids.sort((a, b) => members[a].markedAtMs - members[b].markedAtMs);
	const keep = ids.slice(ids.length - FOCUS_CIRCLE_MAX_MEMBERS);
	const out: Record<string, WasHereMemberEntry> = {};
	for (const id of keep) out[id] = members[id];
	return out;
}

export function applyWasHereMark(
	members: Record<string, WasHereMemberEntry>,
	memberId: string,
	markerDayKey: string,
	markedAtMs: number,
): Record<string, WasHereMemberEntry> {
	const next = { ...members };
	next[memberId] = { markedAtMs, markerDayKey };
	return trimWasHereMembers(next);
}

export function countHereTodayOthers(
	members: Record<string, WasHereMemberEntry>,
	viewerDayKey: string,
	viewerTimeZone: string,
	excludeMemberId: string,
	sittingSessions: CircleSittingSessions,
	nowMs: number,
): number {
	const sitting = pruneCircleSittingSessions(sittingSessions, nowMs);
	let count = 0;
	for (const [id, entry] of Object.entries(members)) {
		if (!isFocusCircleMemberId(id)) continue;
		if (id === excludeMemberId) continue;
		const expiry = sitting[id];
		if (Number.isFinite(expiry) && expiry > nowMs) continue;
		if (!entry || typeof entry.markedAtMs !== "number") continue;
		if (toLocalDayKey(entry.markedAtMs, viewerTimeZone) !== viewerDayKey) {
			continue;
		}
		count += 1;
	}
	return count >= 1 ? 1 : 0;
}
