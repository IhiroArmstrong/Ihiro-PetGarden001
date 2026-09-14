import { json } from "../lib/http.ts";
import { TASTE_LAYER_SCHEMA_VERSION } from "../lib/tasteLayerFreeze.ts";
import { readTasteLayerConfig } from "../lib/tasteLayerConfigKv.ts";
import { requireJsonFields } from "../lib/validate.ts";
import type { EmotionWeightResponse } from "../types";
import type { Env } from "../types";

const REQUIRED = ["emotionKey", "sessionPhase"] as const;

/**
 * Taste-layer weight overlay. schemaVersion 1 = freeze tables by default.
 * Unknown client versions keep using local tables.
 */
export async function handleEmotionWeight(
	request: Request,
	env: Env,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}
	void parsed;

	const config = await readTasteLayerConfig(env.TASTE_LAYER_KV);
	const payload: EmotionWeightResponse = {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		variant: "default",
		weight: 1.0,
		riseInterruptPool: config.riseInterruptPool,
		welcomePool: config.welcomePool,
		lightCompletePool: config.lightCompletePool,
		honestyLongMinMinutes: config.honestyLongMinMinutes,
	};
	return json(payload);
}
