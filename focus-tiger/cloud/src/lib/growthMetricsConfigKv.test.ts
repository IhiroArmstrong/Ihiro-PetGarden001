import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
	GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST,
	GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES,
	GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES,
	GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES,
	GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY,
	GROWTH_METRICS_SCHEMA_VERSION,
	growthMetricsConfigFreeze,
	parseGrowthMetricsConfigRecord,
	readGrowthMetricsConfig,
} from "./growthMetricsConfigKv.ts";

describe("growthMetricsConfigKv", () => {
	it("parses schema 1 with valid dailyScoreCapMinutes and lotus stair defaults", () => {
		assert.deepEqual(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({ schemaVersion: 1, dailyScoreCapMinutes: 240 }),
			),
			{
				schemaVersion: 1,
				dailyScoreCapMinutes: 240,
				lotusFirstBloomMinutes: GROWTH_METRICS_FROZEN_LOTUS_FIRST_BLOOM_MINUTES,
				lotusEarlyStepMinutes: GROWTH_METRICS_FROZEN_LOTUS_EARLY_STEP_MINUTES,
				lotusEarlyBloomLast: GROWTH_METRICS_FROZEN_LOTUS_EARLY_BLOOM_LAST,
				lotusLaterStepMinutes: GROWTH_METRICS_FROZEN_LOTUS_LATER_STEP_MINUTES,
				lotusRingCapacity: GROWTH_METRICS_FROZEN_LOTUS_RING_CAPACITY,
			},
		);
	});

	it("parses explicit lotus stair coefficients", () => {
		assert.deepEqual(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({
					schemaVersion: 1,
					dailyScoreCapMinutes: 180,
					lotusFirstBloomMinutes: 20,
					lotusEarlyStepMinutes: 20,
					lotusEarlyBloomLast: 4,
					lotusLaterStepMinutes: 40,
					lotusRingCapacity: 10,
				}),
			),
			{
				schemaVersion: 1,
				dailyScoreCapMinutes: 180,
				lotusFirstBloomMinutes: 20,
				lotusEarlyStepMinutes: 20,
				lotusEarlyBloomLast: 4,
				lotusLaterStepMinutes: 40,
				lotusRingCapacity: 10,
			},
		);
	});

	it("rejects unknown schema, out-of-range caps, and partial lotus stair", () => {
		assert.equal(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({ schemaVersion: 2, dailyScoreCapMinutes: 240 }),
			),
			null,
		);
		assert.equal(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({ schemaVersion: 1, dailyScoreCapMinutes: 59 }),
			),
			null,
		);
		assert.equal(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({
					schemaVersion: 1,
					dailyScoreCapMinutes: 180,
					lotusFirstBloomMinutes: 25,
				}),
			),
			null,
		);
		assert.equal(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({
					schemaVersion: 1,
					dailyScoreCapMinutes: 180,
					lotusFirstBloomMinutes: 25,
					lotusEarlyStepMinutes: 25,
					lotusEarlyBloomLast: 13,
					lotusLaterStepMinutes: 45,
					lotusRingCapacity: 12,
				}),
			),
			null,
		);
	});

	it("readGrowthMetricsConfig falls back to freeze when KV empty or invalid", async () => {
		const kv = {
			async get() {
				return null;
			},
		} as unknown as KVNamespace;
		assert.deepEqual(await readGrowthMetricsConfig(kv), growthMetricsConfigFreeze());

		const badKv = {
			async get() {
				return JSON.stringify({ schemaVersion: 9, dailyScoreCapMinutes: 240 });
			},
		} as unknown as KVNamespace;
		assert.deepEqual(await readGrowthMetricsConfig(badKv), growthMetricsConfigFreeze());
	});

	it("locks git freeze defaults", () => {
		assert.equal(GROWTH_METRICS_SCHEMA_VERSION, 1);
		assert.equal(GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES, 180);
		assert.deepEqual(growthMetricsConfigFreeze(), {
			schemaVersion: 1,
			dailyScoreCapMinutes: 180,
			lotusFirstBloomMinutes: 25,
			lotusEarlyStepMinutes: 25,
			lotusEarlyBloomLast: 5,
			lotusLaterStepMinutes: 45,
			lotusRingCapacity: 12,
		});
	});
});
