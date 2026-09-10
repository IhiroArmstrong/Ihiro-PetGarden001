import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES,
	GROWTH_METRICS_SCHEMA_VERSION,
	growthMetricsConfigFreeze,
	parseGrowthMetricsConfigRecord,
	readGrowthMetricsConfig,
} from "./growthMetricsConfigKv.ts";

describe("growthMetricsConfigKv", () => {
	it("parses schema 1 with valid dailyScoreCapMinutes", () => {
		assert.deepEqual(
			parseGrowthMetricsConfigRecord(
				JSON.stringify({ schemaVersion: 1, dailyScoreCapMinutes: 240 }),
			),
			{ schemaVersion: 1, dailyScoreCapMinutes: 240 },
		);
	});

	it("rejects unknown schema and out-of-range caps", () => {
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
				JSON.stringify({ schemaVersion: 1, dailyScoreCapMinutes: 481 }),
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

	it("locks git freeze default at 180", () => {
		assert.equal(GROWTH_METRICS_SCHEMA_VERSION, 1);
		assert.equal(GROWTH_METRICS_FROZEN_DAILY_SCORE_CAP_MINUTES, 180);
	});
});
