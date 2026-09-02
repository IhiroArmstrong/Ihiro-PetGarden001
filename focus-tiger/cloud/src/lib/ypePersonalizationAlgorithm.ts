/**
 * YPE L2 V2 cloud algorithm — closed transform from H.3 five keys → Pack v1.
 * @see docs/task-briefs/task-ype-v2-secret-transform.md
 */

export const YPE_PROFILE_SCHEMA_VERSION = 1;
export const YPE_PACK_SCHEMA_VERSION = 1;
export const YPE_ALGORITHM_VERSION = 2;
export const YPE_MIN_SAMPLE_COMPLETIONS = 10;
export const YPE_PACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const YPE_RETURNS_OFTEN_MIN = 0.6;
export const YPE_REFLECTS_OFTEN_MIN = 0.4;

export const YPE_COMPANION_STYLES = ["quiet", "default", "warm"] as const;
export type YpeCompanionStyle = (typeof YPE_COMPANION_STYLES)[number];

export const YPE_PATTERN_INSIGHT_TOKENS = [
	"returns_often",
	"reflects_often",
] as const;
export type YpePatternInsightToken = (typeof YPE_PATTERN_INSIGHT_TOKENS)[number];

export type YpeSignalsV1 = {
	focus_return_rate: number;
	reflection_frequency: number;
	companion_style_preference: YpeCompanionStyle;
	intervention_preference: "low" | "medium";
	practice_day_count_window: number;
};

export type PersonalizationStatePackV1 = {
	schemaVersion: 1;
	packVersion: number;
	issuedAt: string;
	expiresAt: string;
	companionStyle: YpeCompanionStyle;
	patternInsights: YpePatternInsightToken[];
};

export function normalizeCompanionStyle(value: unknown): YpeCompanionStyle {
	return value === "quiet" || value === "warm" ? value : "default";
}

export function normalizeInterventionPreference(
	value: unknown,
): "low" | "medium" {
	return value === "low" ? "low" : "medium";
}

function clampUnit(n: number): number {
	if (!Number.isFinite(n)) return 0;
	return Math.min(1, Math.max(0, n));
}

/**
 * Sanitize client signals — only H.3 V1 five keys.
 */
export function sanitizeYpeSignalsV1(raw: unknown): YpeSignalsV1 | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const o = raw as Record<string, unknown>;
	const practiceDays = Number(o.practice_day_count_window);
	if (!Number.isFinite(practiceDays) || practiceDays < 0) return null;
	return {
		focus_return_rate: clampUnit(Number(o.focus_return_rate)),
		reflection_frequency: clampUnit(Number(o.reflection_frequency)),
		companion_style_preference: normalizeCompanionStyle(
			o.companion_style_preference,
		),
		intervention_preference: normalizeInterventionPreference(
			o.intervention_preference,
		),
		practice_day_count_window: Math.min(Math.floor(practiceDays), 365),
	};
}

/**
 * Frozen V2 insight table — order is table order, not ranking.
 */
export function computePatternInsightsV2(
	signals: YpeSignalsV1,
): YpePatternInsightToken[] {
	const out: YpePatternInsightToken[] = [];
	if (signals.focus_return_rate >= YPE_RETURNS_OFTEN_MIN) {
		out.push("returns_often");
	}
	if (signals.reflection_frequency >= YPE_REFLECTS_OFTEN_MIN) {
		out.push("reflects_often");
	}
	return out;
}

/**
 * V2 closed transform. Returns null when sample gate fails.
 * companionStyle still echoes the user-chosen band; rates never retune it.
 */
export function issuePersonalizationPackV2(opts: {
	signals: YpeSignalsV1;
	windowCompletionCount: number;
	previousPackVersion?: number;
	now?: Date;
}): PersonalizationStatePackV1 | null {
	if (opts.windowCompletionCount < YPE_MIN_SAMPLE_COMPLETIONS) return null;
	const now = opts.now ?? new Date();
	const packVersion = Math.max(1, (opts.previousPackVersion ?? 0) + 1);
	return {
		schemaVersion: YPE_PACK_SCHEMA_VERSION,
		packVersion,
		issuedAt: now.toISOString(),
		expiresAt: new Date(now.getTime() + YPE_PACK_TTL_MS).toISOString(),
		companionStyle: normalizeCompanionStyle(
			opts.signals.companion_style_preference,
		),
		patternInsights: computePatternInsightsV2(opts.signals),
	};
}

export type YpeProfileRecord = {
	schemaVersion: number;
	ypeProfileId: string;
	signals: YpeSignalsV1;
	pack: PersonalizationStatePackV1 | null;
	packVersion: number;
	/** Server-only generation; never copied into Pack. */
	algorithmVersion: number;
	updatedAt: string;
};

export function normalizeStoredAlgorithmVersion(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) ? Math.floor(n) : 1;
}

export function assembleYpeProfileRecord(opts: {
	ypeProfileId: string;
	signals: YpeSignalsV1;
	pack: PersonalizationStatePackV1 | null;
	previousPackVersion: number;
	now: Date;
}): YpeProfileRecord {
	return {
		schemaVersion: YPE_PROFILE_SCHEMA_VERSION,
		ypeProfileId: opts.ypeProfileId,
		signals: opts.signals,
		pack: opts.pack,
		packVersion: opts.pack?.packVersion ?? opts.previousPackVersion,
		algorithmVersion: YPE_ALGORITHM_VERSION,
		updatedAt: opts.now.toISOString(),
	};
}
