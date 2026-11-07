/**
 * Practice study weekly payload whitelist (schema v1).
 * Unknown keys are dropped; out-of-range or wrong types reject the whole packet.
 */

import {
	CO_PRACTICE_RESEARCH_COUNT_CAPS,
	CO_PRACTICE_RESEARCH_PRACTICE_KINDS,
	CO_PRACTICE_RESEARCH_SCHEMA_VERSION,
	CO_PRACTICE_RESEARCH_TIME_SLOTS,
	isAllowedChipId,
	isAllowedLocale,
	isAllowedPlatform,
	isAllowedRouteClass,
} from "./coPracticeResearchEnums.ts";
import { isCoPracticeResearchStudyId } from "./coPracticeResearchStudyId.ts";
import { isCoPracticeResearchWeekKey } from "./coPracticeResearchKv.ts";

const TOP_LEVEL_KEYS = new Set([
	"studyId",
	"schemaVersion",
	"week",
	"tenureWeeks",
	"locale",
	"platform",
	"consent",
	"t1",
]);

const DAY_MASK_RE = /^[01]{7}$/;

function isInt(n: unknown): n is number {
	return typeof n === "number" && Number.isInteger(n);
}

function inRangeInt(n: number, min: number, max: number): boolean {
	return n >= min && n <= max;
}

function pickUnknownKeys(
	obj: Record<string, unknown>,
	allowed: Set<string>,
	dropped: string[],
	prefix = "",
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(obj)) {
		if (allowed.has(k)) {
			out[k] = v;
		} else {
			dropped.push(prefix ? `${prefix}.${k}` : k);
		}
	}
	return out;
}

type PracticeBlock = {
	started: number;
	completed: number;
	minutes: number;
};

function parsePracticeBlock(raw: unknown): PracticeBlock | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const o = raw as Record<string, unknown>;
	if (!isInt(o.started) || !isInt(o.completed) || !isInt(o.minutes)) {
		return null;
	}
	const { practiceBlock, minutesWeek } = CO_PRACTICE_RESEARCH_COUNT_CAPS;
	if (
		!inRangeInt(o.started, 0, practiceBlock) ||
		!inRangeInt(o.completed, 0, practiceBlock) ||
		!inRangeInt(o.minutes, 0, minutesWeek)
	) {
		return null;
	}
	return { started: o.started, completed: o.completed, minutes: o.minutes };
}

function parseCountMap(
	raw: unknown,
	isAllowedKey: (k: string) => boolean,
	max: number,
	dropped: string[],
	prefix: string,
): Record<string, number> | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const out: Record<string, number> = {};
	for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
		if (!isAllowedKey(k)) {
			dropped.push(`${prefix}.${k}`);
			continue;
		}
		if (!isInt(v) || !inRangeInt(v, 0, max)) return null;
		out[k] = v;
	}
	return out;
}

export type CoPracticeResearchPayload = {
	studyId: string;
	schemaVersion: number;
	week: string;
	tenureWeeks: number;
	locale: "en" | "ja" | "zh";
	platform: "web" | "mac" | "win";
	consent: { v: number; tier2: boolean };
	t1: {
		practice: Record<
			(typeof CO_PRACTICE_RESEARCH_PRACTICE_KINDS)[number],
			PracticeBlock
		>;
		dayMask: string;
		timeSlots: Record<
			(typeof CO_PRACTICE_RESEARCH_TIME_SLOTS)[number],
			number
		>;
		companion: {
			confideOpened: number;
			confideSent: number;
			chips: Record<string, number>;
			route: Record<string, number>;
			sitWithYin: number;
		};
		retention: {
			daysSinceLastPractice: number;
			longestGapDays: number;
			comebacks: number;
		};
		flags: {
			localAi: boolean;
			focusCircle: boolean;
			reminders: boolean;
		};
	};
};

export function parseCoPracticeResearchPayload(body: unknown):
	| { ok: true; accepted: CoPracticeResearchPayload; dropped: string[] }
	| { ok: false; reason: string; dropped: string[] } {
	const dropped: string[] = [];
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return { ok: false, reason: "invalid_body", dropped };
	}

	const picked = pickUnknownKeys(
		body as Record<string, unknown>,
		TOP_LEVEL_KEYS,
		dropped,
	);

	const studyId = picked.studyId;
	if (!isCoPracticeResearchStudyId(studyId)) {
		return { ok: false, reason: "bad_study_id", dropped };
	}

	if (picked.schemaVersion !== CO_PRACTICE_RESEARCH_SCHEMA_VERSION) {
		return { ok: false, reason: "bad_schema", dropped };
	}

	const week = picked.week;
	if (!isCoPracticeResearchWeekKey(week)) {
		return { ok: false, reason: "bad_week", dropped };
	}

	if (
		!isInt(picked.tenureWeeks) ||
		!inRangeInt(
			picked.tenureWeeks,
			0,
			CO_PRACTICE_RESEARCH_COUNT_CAPS.tenureWeeks,
		)
	) {
		return { ok: false, reason: "bad_tenure", dropped };
	}

	if (!isAllowedLocale(picked.locale)) {
		return { ok: false, reason: "bad_locale", dropped };
	}
	if (!isAllowedPlatform(picked.platform)) {
		return { ok: false, reason: "bad_platform", dropped };
	}

	const consentRaw = picked.consent;
	if (
		!consentRaw ||
		typeof consentRaw !== "object" ||
		Array.isArray(consentRaw)
	) {
		return { ok: false, reason: "bad_consent", dropped };
	}
	const consentObj = consentRaw as Record<string, unknown>;
	const consentPicked = pickUnknownKeys(consentObj, new Set(["v", "tier2"]), dropped, "consent");
	if (!isInt(consentPicked.v) || consentPicked.v < 1) {
		return { ok: false, reason: "bad_consent", dropped };
	}
	if (typeof consentPicked.tier2 !== "boolean") {
		return { ok: false, reason: "bad_consent", dropped };
	}

	const t1Raw = picked.t1;
	if (!t1Raw || typeof t1Raw !== "object" || Array.isArray(t1Raw)) {
		return { ok: false, reason: "bad_t1", dropped };
	}
	const t1Picked = pickUnknownKeys(
		t1Raw as Record<string, unknown>,
		new Set([
			"practice",
			"dayMask",
			"timeSlots",
			"companion",
			"retention",
			"flags",
		]),
		dropped,
		"t1",
	);

	const practiceRaw = t1Picked.practice;
	if (
		!practiceRaw ||
		typeof practiceRaw !== "object" ||
		Array.isArray(practiceRaw)
	) {
		return { ok: false, reason: "bad_practice", dropped };
	}
	const practicePicked = pickUnknownKeys(
		practiceRaw as Record<string, unknown>,
		new Set(CO_PRACTICE_RESEARCH_PRACTICE_KINDS),
		dropped,
		"t1.practice",
	);
	const practice: CoPracticeResearchPayload["t1"]["practice"] = {} as CoPracticeResearchPayload["t1"]["practice"];
	for (const kind of CO_PRACTICE_RESEARCH_PRACTICE_KINDS) {
		const block = parsePracticeBlock(practicePicked[kind]);
		if (!block) {
			return { ok: false, reason: "bad_practice", dropped };
		}
		practice[kind] = block;
	}

	const dayMask = t1Picked.dayMask;
	if (typeof dayMask !== "string" || !DAY_MASK_RE.test(dayMask)) {
		return { ok: false, reason: "bad_day_mask", dropped };
	}

	const timeSlotsRaw = t1Picked.timeSlots;
	if (
		!timeSlotsRaw ||
		typeof timeSlotsRaw !== "object" ||
		Array.isArray(timeSlotsRaw)
	) {
		return { ok: false, reason: "bad_time_slots", dropped };
	}
	const timePicked = pickUnknownKeys(
		timeSlotsRaw as Record<string, unknown>,
		new Set(CO_PRACTICE_RESEARCH_TIME_SLOTS),
		dropped,
		"t1.timeSlots",
	);
	const timeSlots: CoPracticeResearchPayload["t1"]["timeSlots"] = {} as CoPracticeResearchPayload["t1"]["timeSlots"];
	const slotMax = CO_PRACTICE_RESEARCH_COUNT_CAPS.practiceBlock;
	for (const slot of CO_PRACTICE_RESEARCH_TIME_SLOTS) {
		const v = timePicked[slot];
		if (!isInt(v) || !inRangeInt(v, 0, slotMax)) {
			return { ok: false, reason: "bad_time_slots", dropped };
		}
		timeSlots[slot] = v;
	}

	const companionRaw = t1Picked.companion;
	if (
		!companionRaw ||
		typeof companionRaw !== "object" ||
		Array.isArray(companionRaw)
	) {
		return { ok: false, reason: "bad_companion", dropped };
	}
	const companionPicked = pickUnknownKeys(
		companionRaw as Record<string, unknown>,
		new Set([
			"confideOpened",
			"confideSent",
			"chips",
			"route",
			"sitWithYin",
		]),
		dropped,
		"t1.companion",
	);
	const companionMax = CO_PRACTICE_RESEARCH_COUNT_CAPS.companion;
	if (
		!isInt(companionPicked.confideOpened) ||
		!inRangeInt(companionPicked.confideOpened, 0, companionMax) ||
		!isInt(companionPicked.confideSent) ||
		!inRangeInt(companionPicked.confideSent, 0, companionMax)
	) {
		return { ok: false, reason: "bad_companion", dropped };
	}
	const chips = parseCountMap(
		companionPicked.chips,
		isAllowedChipId,
		companionMax,
		dropped,
		"t1.companion.chips",
	);
	if (!chips) {
		return { ok: false, reason: "bad_companion", dropped };
	}
	const route = parseCountMap(
		companionPicked.route,
		isAllowedRouteClass,
		companionMax,
		dropped,
		"t1.companion.route",
	);
	if (!route) {
		return { ok: false, reason: "bad_companion", dropped };
	}
	if (
		!isInt(companionPicked.sitWithYin) ||
		!inRangeInt(
			companionPicked.sitWithYin,
			0,
			CO_PRACTICE_RESEARCH_COUNT_CAPS.sitWithYin,
		)
	) {
		return { ok: false, reason: "bad_companion", dropped };
	}

	const retentionRaw = t1Picked.retention;
	if (
		!retentionRaw ||
		typeof retentionRaw !== "object" ||
		Array.isArray(retentionRaw)
	) {
		return { ok: false, reason: "bad_retention", dropped };
	}
	const retentionPicked = pickUnknownKeys(
		retentionRaw as Record<string, unknown>,
		new Set(["daysSinceLastPractice", "longestGapDays", "comebacks"]),
		dropped,
		"t1.retention",
	);
	const dayMax = CO_PRACTICE_RESEARCH_COUNT_CAPS.retentionDays;
	const comebackMax = CO_PRACTICE_RESEARCH_COUNT_CAPS.comebacks;
	if (
		!isInt(retentionPicked.daysSinceLastPractice) ||
		!inRangeInt(retentionPicked.daysSinceLastPractice, 0, dayMax) ||
		!isInt(retentionPicked.longestGapDays) ||
		!inRangeInt(retentionPicked.longestGapDays, 0, dayMax) ||
		!isInt(retentionPicked.comebacks) ||
		!inRangeInt(retentionPicked.comebacks, 0, comebackMax)
	) {
		return { ok: false, reason: "bad_retention", dropped };
	}

	const flagsRaw = t1Picked.flags;
	if (!flagsRaw || typeof flagsRaw !== "object" || Array.isArray(flagsRaw)) {
		return { ok: false, reason: "bad_flags", dropped };
	}
	const flagsPicked = pickUnknownKeys(
		flagsRaw as Record<string, unknown>,
		new Set(["localAi", "focusCircle", "reminders"]),
		dropped,
		"t1.flags",
	);
	if (
		typeof flagsPicked.localAi !== "boolean" ||
		typeof flagsPicked.focusCircle !== "boolean" ||
		typeof flagsPicked.reminders !== "boolean"
	) {
		return { ok: false, reason: "bad_flags", dropped };
	}

	const accepted: CoPracticeResearchPayload = {
		studyId,
		schemaVersion: CO_PRACTICE_RESEARCH_SCHEMA_VERSION,
		week: week.trim(),
		tenureWeeks: picked.tenureWeeks,
		locale: picked.locale,
		platform: picked.platform,
		consent: { v: consentPicked.v, tier2: consentPicked.tier2 },
		t1: {
			practice,
			dayMask,
			timeSlots,
			companion: {
				confideOpened: companionPicked.confideOpened,
				confideSent: companionPicked.confideSent,
				chips,
				route,
				sitWithYin: companionPicked.sitWithYin,
			},
			retention: {
				daysSinceLastPractice: retentionPicked.daysSinceLastPractice,
				longestGapDays: retentionPicked.longestGapDays,
				comebacks: retentionPicked.comebacks,
			},
			flags: {
				localAi: flagsPicked.localAi,
				focusCircle: flagsPicked.focusCircle,
				reminders: flagsPicked.reminders,
			},
		},
	};

	return { ok: true, accepted, dropped };
}
