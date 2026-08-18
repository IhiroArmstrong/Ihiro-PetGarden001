import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import {
	TASTE_HONESTY_LONG_MIN_MINUTES,
	TASTE_LAYER_SCHEMA_VERSION,
	TASTE_LIGHT_COMPLETE_POOL,
	TASTE_RISE_INTERRUPT_POOL,
	TASTE_WELCOME_POOL,
} from "../lib/tasteLayerFreeze.ts";
import type { EmotionWeightResponse } from "../types";

const REQUIRED = ["emotionKey", "sessionPhase"] as const;

/**
 * Taste-layer weight overlay. schemaVersion 1 = freeze tables.
 * Unknown client versions keep using local tables.
 */
export async function handleEmotionWeight(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}
	void parsed;

	const payload: EmotionWeightResponse = {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		variant: "default",
		weight: 1.0,
		riseInterruptPool: TASTE_RISE_INTERRUPT_POOL,
		welcomePool: TASTE_WELCOME_POOL,
		lightCompletePool: TASTE_LIGHT_COMPLETE_POOL,
		honestyLongMinMinutes: TASTE_HONESTY_LONG_MIN_MINUTES,
	};
	return json(payload);
}
