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

/** Must match `lotusPondMath.js` freeze exports. */
export const GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES = 25;
export const GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES = 25;
export const GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST = 5;
export const GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES = 45;
export const GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY = 12;

export const GROWTH_METRICS_LOTUS_FIRST_BLOOM_MIN = 1;
export const GROWTH_METRICS_LOTUS_FIRST_BLOOM_MAX = 180;
export const GROWTH_METRICS_LOTUS_STEP_MIN = 1;
export const GROWTH_METRICS_LOTUS_STEP_MAX = 180;
export const GROWTH_METRICS_LOTUS_EARLY_BLOOM_LAST_MIN = 1;
export const GROWTH_METRICS_LOTUS_RING_CAPACITY_MIN = 1;
export const GROWTH_METRICS_LOTUS_RING_CAPACITY_MAX = 24;

export type GrowthMetricsConfigV1 = {
	schemaVersion: 1;
	dailyScoreCapMinutes: number;
	lotusFirstBloomMinutes: number;
	lotusEarlyStepMinutes: number;
	lotusEarlyBloomLast: number;
	lotusLaterStepMinutes: number;
	lotusRingCapacity: number;
};

export function normalizeDailyScoreCapMinutes(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_DAILY_SCORE_CAP_MIN) return null;
	if (floored > GROWTH_METRICS_DAILY_SCORE_CAP_MAX) return null;
	return floored;
}

function normalizeLotusFirstBloomMinutes(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_LOTUS_FIRST_BLOOM_MIN) return null;
	if (floored > GROWTH_METRICS_LOTUS_FIRST_BLOOM_MAX) return null;
	return floored;
}

function normalizeLotusStepMinutes(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_LOTUS_STEP_MIN) return null;
	if (floored > GROWTH_METRICS_LOTUS_STEP_MAX) return null;
	return floored;
}

function normalizeLotusEarlyBloomLast(
	value: unknown,
	ringCapacity: number,
): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_LOTUS_EARLY_BLOOM_LAST_MIN) return null;
	if (floored > ringCapacity) return null;
	return floored;
}

function normalizeLotusRingCapacity(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < GROWTH_METRICS_LOTUS_RING_CAPACITY_MIN) return null;
	if (floored > GROWTH_METRICS_LOTUS_RING_CAPACITY_MAX) return null;
	return floored;
}

function parseLotusStairFields(
	o: Record<string, unknown>,
): Pick<
	GrowthMetricsConfigV1,
	| "lotusFirstBloomMinutes"
	| "lotusEarlyStepMinutes"
	| "lotusEarlyBloomLast"
	| "lotusLaterStepMinutes"
	| "lotusRingCapacity"
> | null {
	const lotusKeys = [
		"lotusFirstBloomMinutes",
		"lotusEarlyStepMinutes",
		"lotusEarlyBloomLast",
		"lotusLaterStepMinutes",
		"lotusRingCapacity",
	] as const;
	const hasAny = lotusKeys.some((key) => o[key] !== undefined);
	if (!hasAny) return null;

	const lotusRingCapacity = normalizeLotusRingCapacity(o.lotusRingCapacity);
	if (lotusRingCapacity == null) return null;
	const lotusFirstBloomMinutes = normalizeLotusFirstBloomMinutes(
		o.lotusFirstBloomMinutes,
	);
	const lotusEarlyStepMinutes = normalizeLotusStepMinutes(
		o.lotusEarlyStepMinutes,
	);
	const lotusEarlyBloomLast = normalizeLotusEarlyBloomLast(
		o.lotusEarlyBloomLast,
		lotusRingCapacity,
	);
	const lotusLaterStepMinutes = normalizeLotusStepMinutes(
		o.lotusLaterStepMinutes,
	);
	if (
		lotusFirstBloomMinutes == null ||
		lotusEarlyStepMinutes == null ||
		lotusEarlyBloomLast == null ||
		lotusLaterStepMinutes == null
	) {
		return null;
	}
	return {
		lotusFirstBloomMinutes,
		lotusEarlyStepMinutes,
		lotusEarlyBloomLast,
		lotusLaterStepMinutes,
		lotusRingCapacity,
	};
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
		const lotusKeys = [
			"lotusFirstBloomMinutes",
			"lotusEarlyStepMinutes",
			"lotusEarlyBloomLast",
			"lotusLaterStepMinutes",
			"lotusRingCapacity",
		] as const;
		const hasAnyLotus = lotusKeys.some((key) => o[key] !== undefined);
		const lotus = parseLotusStairFields(o);
		if (hasAnyLotus && !lotus) return null;
		const freeze = growthMetricsConfigFreeze();
		return {
			schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
			dailyScoreCapMinutes,
			lotusFirstBloomMinutes:
				lotus?.lotusFirstBloomMinutes ?? freeze.lotusFirstBloomMinutes,
			lotusEarlyStepMinutes:
				lotus?.lotusEarlyStepMinutes ?? freeze.lotusEarlyStepMinutes,
			lotusEarlyBloomLast:
				lotus?.lotusEarlyBloomLast ?? freeze.lotusEarlyBloomLast,
			lotusLaterStepMinutes:
				lotus?.lotusLaterStepMinutes ?? freeze.lotusLaterStepMinutes,
			lotusRingCapacity:
				lotus?.lotusRingCapacity ?? freeze.lotusRingCapacity,
		};
	} catch {
		return null;
	}
}

export function growthMetricsConfigFreeze(): GrowthMetricsConfigV1 {
	return {
		schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
		dailyScoreCapMinutes: GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
		lotusFirstBloomMinutes: GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES,
		lotusEarlyStepMinutes: GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES,
		lotusEarlyBloomLast: GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST,
		lotusLaterStepMinutes: GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES,
		lotusRingCapacity: GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY,
	};
}

export async function readGrowthMetricsConfig(
	kv: KVNamespace,
): Promise<GrowthMetricsConfigV1> {
	const raw = await kv.get(GROWTH_METRICS_CONFIG_KV_KEY);
	if (!raw) return growthMetricsConfigFreeze();
	return parseGrowthMetricsConfigRecord(raw) ?? growthMetricsConfigFreeze();
}
