/**
 * YPE L2 V1 cloud algorithm — closed transform from H.3 five keys → Pack v1.
 * @see docs/task-briefs/task-l2-personalization-algorithm.md
 */

export const YPE_PROFILE_SCHEMA_VERSION = 1;
export const YPE_PACK_SCHEMA_VERSION = 1;
export const YPE_MIN_SAMPLE_COMPLETIONS = 10;
export const YPE_PACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const YPE_COMPANION_STYLES = ["quiet", "default", "warm"] as const;
export type YpeCompanionStyle = (typeof YPE_COMPANION_STYLES)[number];

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
	patternInsights: [];
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
 * V1 closed transform. Returns null when sample gate fails.
 */
export function issuePersonalizationPackV1(opts: {
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
		patternInsights: [],
	};
}
