import { json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import type { EmotionWeightResponse } from "../types";

const REQUIRED = ["emotionKey", "sessionPhase"] as const;

/**
 * Stub: emotion variant weight for A/B or soft scheduling.
 * Required body: { emotionKey, sessionPhase } — provisional; product review pending.
 */
export async function handleEmotionWeight(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	// parsed holds emotionKey + sessionPhase; real logic TBD after field review.
	void parsed;

	const payload: EmotionWeightResponse = {
		variant: "default",
		weight: 1.0,
	};
	return json(payload);
}
