/**
 * Growth metrics remote params (GROWTH_METRICS_KV only).
 * @see docs/growth-metrics-kv-changelog.md
 */

export const GROWTH_METRICS_CONFIG_KV_KEY = "growth-metrics:v1:params";

export const GROWTH_METRICS_SCHEMA_VERSION = 1;

/** Worker / git freeze default — must match `scoreDailyCap.js` DAILY_SCORE_CAP_MINUTES. */
export const GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES = 180;

export const GROWTH_METRICS_DAILY_SCORE_CAP_MIN = 60;
export const GROWTH_METRICS_DAILY_SCORE_CAP_MAX = 480;

export type GrowthMetricsConfigV1 = {
	schemaVersion: 1;
	dailyScoreCapMinutes: number;
};

export function normalizeDailyScoreCapMinutes(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_DAILY_SCORE_CAP_MIN) return null;
	if (floored > GROWTH_METRICS_DAILY_SCORE_CAP_MAX) return null;
	return floored;
}

export function parseGrowthMetricsConfigRecord(
	raw: string,
): GrowthMetricsConfigV1 | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return null;
		}
		const o = parsed as Record<string, unknown>;
		if (o.schemaVersion !== GROWTH_METRICS_SCHEMA_VERSION) return null;
		const dailyScoreCapMinutes = normalizeDailyScoreCapMinutes(
			o.dailyScoreCapMinutes,
		);
		if (dailyScoreCapMinutes == null) return null;
		return {
			schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
			dailyScoreCapMinutes,
		};
	} catch {
		return null;
	}
}

export function growthMetricsConfigFreeze(): GrowthMetricsConfigV1 {
	return {
		schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
		dailyScoreCapMinutes: GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
	};
}

export async function readGrowthMetricsConfig(
	kv: KVNamespace,
): Promise<GrowthMetricsConfigV1> {
	const raw = await kv.get(GROWTH_METRICS_CONFIG_KV_KEY);
	if (!raw) return growthMetricsConfigFreeze();
	return parseGrowthMetricsConfigRecord(raw) ?? growthMetricsConfigFreeze();
}
