import { json } from "../lib/http.ts";
import {
	readGrowthMetricsConfig,
	GROWTH_METRICS_SCHEMA_VERSION,
} from "../lib/growthMetricsConfigKv.ts";
import type { GrowthMetricsConfigResponse } from "../types";

/**
 * Growth metrics remote params overlay. schemaVersion 1 = freeze table by default.
 * Unknown client versions keep using local tables.
 */
export async function handleGrowthMetricsConfig(
	request: Request,
	env: Env,
): Promise<Response> {
	if (request.headers.get("content-type")?.includes("application/json")) {
		try {
			await request.json();
		} catch {
			return json({ error: "invalid_json" }, { status: 400 });
		}
	}

	const config = await readGrowthMetricsConfig(env.GROWTH_METRICS_KV);
	const payload: GrowthMetricsConfigResponse = {
		schemaVersion: GROWTH_METRICS_SCHEMA_VERSION,
		dailyScoreCapMinutes: config.dailyScoreCapMinutes,
		lotusFirstBloomMinutes: config.lotusFirstBloomMinutes,
		lotusEarlyStepMinutes: config.lotusEarlyStepMinutes,
		lotusEarlyBloomLast: config.lotusEarlyBloomLast,
		lotusLaterStepMinutes: config.lotusLaterStepMinutes,
		lotusRingCapacity: config.lotusRingCapacity,
	};
	return json(payload);
}
