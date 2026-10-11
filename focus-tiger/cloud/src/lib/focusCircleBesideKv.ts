/** One-time "sit beside me" codes. Same circle as the 6-char door code. */

import {
	FOCUS_CIRCLE_CODE_CHARS,
	type FocusCircleRecord,
	addFocusCircleMember,
	isFocusCircleFull,
	isFocusCircleMemberId,
} from "./focusCircleKv.ts";
import {
	type CircleSittingSessions,
	pruneCircleSittingSessions,
} from "./focusCirclePresenceKv.ts";
import {
	type WasHereMemberEntry,
	toLocalDayKey,
} from "./focusCircleWasHereKv.ts";

export const BESIDE_SCHEMA_VERSION = 1;
export const BESIDE_CODE_LENGTH = 8;
export const BESIDE_UNUSED_QUOTA = 5;
const SAW_SITTING_CAP = 30;
const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type BesideCodeState = "unused" | "consumed" | "revoked";

export type BesideCodeEntry = {
	inviterMemberId: string;
	createdAt: number;
	state: BesideCodeState;
	consumedByMemberId?: string;
	consumedAt?: number;
};

export type BesideInvitee = {
	inviterMemberId: string;
	joinedAt: number;
	sawSittingOn: string[];
};

export type BesideRecord = {
	schemaVersion: number;
	codes: Record<string, BesideCodeEntry>;
	invitees: Record<string, BesideInvitee>;
};

export type KvLike = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
	delete(key: string): Promise<void>;
};

export function besideCircleKvKey(circleId: string): string {
	return `circle:v1:beside:${circleId.trim()}`;
}

export function besideCodeKvKey(code: string): string {
	return `circle:v1:beside-code:${code.trim().toUpperCase()}`;
}

export function normalizeBesideCode(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const code = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (code.length !== BESIDE_CODE_LENGTH) return null;
	for (const ch of code) {
		if (!FOCUS_CIRCLE_CODE_CHARS.includes(ch)) return null;
	}
	return code;
}

export function emptyBesideRecord(): BesideRecord {
	return { schemaVersion: BESIDE_SCHEMA_VERSION, codes: {}, invitees: {} };
}

export function generateBesideCode(
	randomInt: (max: number) => number = (max) => Math.floor(Math.random() * max),
): string {
	let out = "";
	for (let i = 0; i < BESIDE_CODE_LENGTH; i += 1) {
		out += FOCUS_CIRCLE_CODE_CHARS[randomInt(FOCUS_CIRCLE_CODE_CHARS.length)];
	}
	return out;
}

export function countUnusedBesideCodes(
	record: BesideRecord,
	inviterMemberId: string,
): number {
	let n = 0;
	for (const entry of Object.values(record.codes)) {
		if (entry.state === "unused" && entry.inviterMemberId === inviterMemberId) {
			n += 1;
		}
	}
	return n;
}

export function listUnusedBesideCodes(
	record: BesideRecord,
	inviterMemberId: string,
): string[] {
	return Object.entries(record.codes)
		.filter(
			([, entry]) =>
				entry.state === "unused" && entry.inviterMemberId === inviterMemberId,
		)
		.sort((a, b) => a[1].createdAt - b[1].createdAt)
		.map(([code]) => code);
}

export function parseBesideRecord(raw: string | null): BesideRecord {
	if (!raw) return emptyBesideRecord();
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return emptyBesideRecord();
		}
		const o = parsed as Record<string, unknown>;
		if (o.schemaVersion !== BESIDE_SCHEMA_VERSION) return emptyBesideRecord();
		const codes: Record<string, BesideCodeEntry> = {};
		const codesRaw =
			o.codes && typeof o.codes === "object" && !Array.isArray(o.codes)
				? (o.codes as Record<string, unknown>)
				: {};
		for (const [rawCode, value] of Object.entries(codesRaw)) {
			const code = normalizeBesideCode(rawCode);
			if (!code || !value || typeof value !== "object" || Array.isArray(value)) {
				continue;
			}
			const row = value as Record<string, unknown>;
			const inviterMemberId =
				typeof row.inviterMemberId === "string" ? row.inviterMemberId.trim() : "";
			const state = row.state;
			const createdAt = Number(row.createdAt);
			if (
				!isFocusCircleMemberId(inviterMemberId) ||
				(state !== "unused" && state !== "consumed" && state !== "revoked") ||
				!Number.isFinite(createdAt)
			) {
				continue;
			}
			const entry: BesideCodeEntry = { inviterMemberId, createdAt, state };
			if (state === "consumed") {
				const consumedBy =
					typeof row.consumedByMemberId === "string"
						? row.consumedByMemberId.trim()
						: "";
				const consumedAt = Number(row.consumedAt);
				if (isFocusCircleMemberId(consumedBy)) entry.consumedByMemberId = consumedBy;
				if (Number.isFinite(consumedAt)) entry.consumedAt = consumedAt;
			}
			codes[code] = entry;
		}
		const invitees: Record<string, BesideInvitee> = {};
		const inviteesRaw =
			o.invitees && typeof o.invitees === "object" && !Array.isArray(o.invitees)
				? (o.invitees as Record<string, unknown>)
				: {};
		for (const [id, value] of Object.entries(inviteesRaw)) {
			if (!isFocusCircleMemberId(id)) continue;
			if (!value || typeof value !== "object" || Array.isArray(value)) continue;
			const row = value as Record<string, unknown>;
			const inviterMemberId =
				typeof row.inviterMemberId === "string" ? row.inviterMemberId.trim() : "";
			const joinedAt = Number(row.joinedAt);
			if (!isFocusCircleMemberId(inviterMemberId) || !Number.isFinite(joinedAt)) {
				continue;
			}
			const days = Array.isArray(row.sawSittingOn)
				? row.sawSittingOn.filter(
						(day): day is string =>
							typeof day === "string" && DAY_KEY_RE.test(day),
					)
				: [];
			invitees[id] = {
				inviterMemberId,
				joinedAt,
				sawSittingOn: days.slice(-SAW_SITTING_CAP),
			};
		}
		return { schemaVersion: BESIDE_SCHEMA_VERSION, codes, invitees };
	} catch {
		return emptyBesideRecord();
	}
}

export function issueBesideCode(
	record: BesideRecord,
	inviterMemberId: string,
	code: string,
	nowMs: number,
):
	| { ok: true; record: BesideRecord }
	| { ok: false; reason: "quota" | "duplicate" } {
	if (countUnusedBesideCodes(record, inviterMemberId) >= BESIDE_UNUSED_QUOTA) {
		return { ok: false, reason: "quota" };
	}
	if (record.codes[code]) return { ok: false, reason: "duplicate" };
	return {
		ok: true,
		record: {
			...record,
			codes: {
				...record.codes,
				[code]: { inviterMemberId, createdAt: nowMs, state: "unused" },
			},
		},
	};
}

export function revokeBesideCode(
	record: BesideRecord,
	inviterMemberId: string,
	code: string,
):
	| { ok: true; record: BesideRecord }
	| { ok: false; reason: "not_found" | "not_unused" } {
	const entry = record.codes[code];
	if (!entry || entry.inviterMemberId !== inviterMemberId) {
		return { ok: false, reason: "not_found" };
	}
	if (entry.state !== "unused") return { ok: false, reason: "not_unused" };
	return {
		ok: true,
		record: {
			...record,
			codes: {
				...record.codes,
				[code]: { ...entry, state: "revoked" },
			},
		},
	};
}

export function revokeUnusedBesideCodes(
	record: BesideRecord,
	inviterMemberId: string,
): { record: BesideRecord; revokedCodes: string[] } {
	const revokedCodes: string[] = [];
	const codes = { ...record.codes };
	for (const [code, entry] of Object.entries(codes)) {
		if (entry.state === "unused" && entry.inviterMemberId === inviterMemberId) {
			codes[code] = { ...entry, state: "revoked" };
			revokedCodes.push(code);
		}
	}
	return { record: { ...record, codes }, revokedCodes };
}

export type BesideJoinPreview =
	| { ok: true }
	| { ok: false; reason: "missing" | "used" | "self" | "already_member" };

export function previewBesideJoin(
	record: BesideRecord,
	code: string,
	memberId: string,
	circle: FocusCircleRecord,
): BesideJoinPreview {
	const entry = record.codes[code];
	if (!entry) return { ok: false, reason: "missing" };
	if (entry.state !== "unused") return { ok: false, reason: "used" };
	if (entry.inviterMemberId === memberId) return { ok: false, reason: "self" };
	if (circle.members[memberId]) return { ok: false, reason: "already_member" };
	return { ok: true };
}

export function consumeBesideJoin(
	record: BesideRecord,
	code: string,
	memberId: string,
	nowMs: number,
): BesideRecord {
	const entry = record.codes[code];
	return {
		...record,
		codes: {
			...record.codes,
			[code]: {
				...entry,
				state: "consumed",
				consumedByMemberId: memberId,
				consumedAt: nowMs,
			},
		},
		invitees: {
			...record.invitees,
			[memberId]: {
				inviterMemberId: entry.inviterMemberId,
				joinedAt: nowMs,
				sawSittingOn: record.invitees[memberId]?.sawSittingOn ?? [],
			},
		},
	};
}

export function stampBesideSitting(
	record: BesideRecord,
	memberId: string,
	dayKey: string,
): BesideRecord {
	const invitee = record.invitees[memberId];
	if (!invitee || !DAY_KEY_RE.test(dayKey)) return record;
	if (invitee.sawSittingOn.includes(dayKey)) return record;
	const sawSittingOn = [...invitee.sawSittingOn, dayKey].slice(-SAW_SITTING_CAP);
	return {
		...record,
		invitees: {
			...record.invitees,
			[memberId]: { ...invitee, sawSittingOn },
		},
	};
}

export function invitedWasHereToday(opts: {
	record: BesideRecord;
	inviterMemberId: string;
	circle: FocusCircleRecord;
	wasHere: Record<string, WasHereMemberEntry>;
	sitting: CircleSittingSessions;
	nowMs: number;
	viewerDayKey: string;
	viewerTimeZone: string;
	nicknameOf: (memberId: string) => string | null;
}): { invitedWasHere: boolean; invitedWasHereName: string | null } {
	const sitting = pruneCircleSittingSessions(opts.sitting, opts.nowMs);
	const matches: string[] = [];
	for (const [memberId, invitee] of Object.entries(opts.record.invitees)) {
		if (invitee.inviterMemberId !== opts.inviterMemberId) continue;
		if (!opts.circle.members[memberId]) continue;
		if (memberId === opts.inviterMemberId) continue;
		const expiry = sitting[memberId];
		if (Number.isFinite(expiry) && expiry > opts.nowMs) continue;
		const entry = opts.wasHere[memberId];
		if (!entry || typeof entry.markedAtMs !== "number") continue;
		if (
			toLocalDayKey(entry.markedAtMs, opts.viewerTimeZone) !== opts.viewerDayKey
		) {
			continue;
		}
		matches.push(memberId);
	}
	if (matches.length === 0) {
		return { invitedWasHere: false, invitedWasHereName: null };
	}
	if (matches.length === 1) {
		return {
			invitedWasHere: true,
			invitedWasHereName: opts.nicknameOf(matches[0]),
		};
	}
	return { invitedWasHere: true, invitedWasHereName: null };
}

export function besideStatusFields(
	record: BesideRecord,
	inviterMemberId: string,
	wasHereView: { invitedWasHere: boolean; invitedWasHereName: string | null },
) {
	const besideUnused = listUnusedBesideCodes(record, inviterMemberId);
	return {
		besideUnused,
		besideRemaining: Math.max(0, BESIDE_UNUSED_QUOTA - besideUnused.length),
		invitedWasHere: wasHereView.invitedWasHere,
		invitedWasHereName: wasHereView.invitedWasHereName,
	};
}

export async function loadBeside(kv: KvLike, circleId: string): Promise<BesideRecord> {
	return parseBesideRecord(await kv.get(besideCircleKvKey(circleId)));
}

export async function saveBeside(
	kv: KvLike,
	circleId: string,
	record: BesideRecord,
): Promise<void> {
	await kv.put(besideCircleKvKey(circleId), JSON.stringify(record));
}

export async function deleteBesideCircle(kv: KvLike, circleId: string): Promise<void> {
	const record = await loadBeside(kv, circleId);
	for (const code of Object.keys(record.codes)) {
		await kv.delete(besideCodeKvKey(code));
	}
	await kv.delete(besideCircleKvKey(circleId));
}

export async function stampBesideSittingStored(
	kv: KvLike,
	circleId: string,
	memberId: string,
	dayKey: string,
): Promise<void> {
	const record = await loadBeside(kv, circleId);
	const next = stampBesideSitting(record, memberId, dayKey);
	if (next === record) return;
	await saveBeside(kv, circleId, next);
}

export async function revokeInviterUnusedStored(
	kv: KvLike,
	circleId: string,
	inviterMemberId: string,
): Promise<void> {
	const record = await loadBeside(kv, circleId);
	const next = revokeUnusedBesideCodes(record, inviterMemberId);
	if (next.revokedCodes.length === 0) return;
	await saveBeside(kv, circleId, next.record);
}

export function tryAddBesideMember(
	circle: FocusCircleRecord,
	memberId: string,
	nowMs: number,
	opts?: { skipRosterCap?: boolean },
) {
	if (!opts?.skipRosterCap && isFocusCircleFull(circle) && !circle.members[memberId]) {
		return { ok: false as const, reason: "full" as const };
	}
	return addFocusCircleMember(circle, memberId, nowMs, opts);
}
