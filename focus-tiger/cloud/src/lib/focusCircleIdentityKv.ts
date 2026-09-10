/** Focus Circle optional nickname + preset badge per member in TIP_KV. */

import {
	FOCUS_CIRCLE_MAX_MEMBERS,
	isFocusCircleMemberId,
} from "./focusCircleKv.ts";

export const FOCUS_CIRCLE_IDENTITY_SCHEMA_VERSION = 1;
export const FOCUS_CIRCLE_NICKNAME_MAX_LEN = 16;

export const FOCUS_CIRCLE_BADGE_KEYS = ["tiger", "yin"] as const;
export type FocusCircleBadgeKey = (typeof FOCUS_CIRCLE_BADGE_KEYS)[number];

export type FocusCircleIdentityEntry = {
	nickname?: string;
	badgeKey?: FocusCircleBadgeKey;
};

export type FocusCircleIdentityRecord = {
	schemaVersion: number;
	members: Record<string, FocusCircleIdentityEntry>;
};

export function circleIdentityKvKey(circleId: string): string {
	return `circle:v1:identity:${circleId.trim()}`;
}

export function isFocusCircleBadgeKey(
	value: string,
): value is FocusCircleBadgeKey {
	return (FOCUS_CIRCLE_BADGE_KEYS as readonly string[]).includes(value);
}

export function normalizeFocusCircleNickname(raw: unknown): string | null {
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim().replace(/[\u0000-\u001f\u007f]/g, "");
	if (!trimmed) return null;
	if (trimmed.length > FOCUS_CIRCLE_NICKNAME_MAX_LEN) return null;
	return trimmed;
}

export function parseFocusCircleIdentityRecord(
	raw: string | null,
): FocusCircleIdentityRecord {
	if (!raw) {
		return {
			schemaVersion: FOCUS_CIRCLE_IDENTITY_SCHEMA_VERSION,
			members: {},
		};
	}
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {
				schemaVersion: FOCUS_CIRCLE_IDENTITY_SCHEMA_VERSION,
				members: {},
			};
		}
		const o = parsed as Record<string, unknown>;
		const members =
			o.members && typeof o.members === "object" && !Array.isArray(o.members)
				? (o.members as Record<string, FocusCircleIdentityEntry>)
				: {};
		return {
			schemaVersion: FOCUS_CIRCLE_IDENTITY_SCHEMA_VERSION,
			members,
		};
	} catch {
		return {
			schemaVersion: FOCUS_CIRCLE_IDENTITY_SCHEMA_VERSION,
			members: {},
		};
	}
}

function trimIdentityMembers(
	members: Record<string, FocusCircleIdentityEntry>,
): Record<string, FocusCircleIdentityEntry> {
	const ids = Object.keys(members).filter((id) => isFocusCircleMemberId(id));
	if (ids.length <= FOCUS_CIRCLE_MAX_MEMBERS) return members;
	return Object.fromEntries(ids.slice(0, FOCUS_CIRCLE_MAX_MEMBERS).map((id) => [id, members[id]]));
}

export function applyIdentitySet(
	members: Record<string, FocusCircleIdentityEntry>,
	memberId: string,
	nickname: string | null,
	badgeKey: FocusCircleBadgeKey | null,
): Record<string, FocusCircleIdentityEntry> {
	const next = { ...members };
	if (!nickname && !badgeKey) {
		delete next[memberId];
		return trimIdentityMembers(next);
	}
	const row: FocusCircleIdentityEntry = {};
	if (nickname) row.nickname = nickname;
	if (badgeKey) row.badgeKey = badgeKey;
	next[memberId] = row;
	return trimIdentityMembers(next);
}

export function buildIdentityPeekMap(
	members: Record<string, FocusCircleIdentityEntry>,
	circleMemberIds: string[],
): Record<string, FocusCircleIdentityEntry> {
	const allowed = new Set(circleMemberIds.filter((id) => isFocusCircleMemberId(id)));
	const out: Record<string, FocusCircleIdentityEntry> = {};
	for (const [memberId, row] of Object.entries(members)) {
		if (!allowed.has(memberId) || !row || typeof row !== "object") continue;
		const nickname = normalizeFocusCircleNickname(row.nickname);
		const badgeKey =
			typeof row.badgeKey === "string" && isFocusCircleBadgeKey(row.badgeKey)
				? row.badgeKey
				: undefined;
		if (!nickname && !badgeKey) continue;
		out[memberId] = {
			...(nickname ? { nickname } : {}),
			...(badgeKey ? { badgeKey } : {}),
		};
	}
	return out;
}
