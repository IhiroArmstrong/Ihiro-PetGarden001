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
		schemaVersion: 1,
		variant: "default",
		weight: 1.0,
		// Same freeze numbers as `sceneAnimationDispatcher.js` local tables.
		pools: {
			welcome: [
				{ key: "magicBookReading", weight: 60 },
				{ key: "nodGreeting", weight: 40 },
			],
			lightComplete: [
				{ key: "sessionComplete", weight: 70 },
				{ key: "mindfulAcknowledge", weight: 30 },
				{ key: "parrotEarVisit", weight: 8 },
			],
			riseInterrupt: [
				{ key: "riseStretchCasual", weight: 60 },
				{ key: "teaDrinking", weight: 25 },
				{ key: "bookReading", weight: 15 },
			],
		},
	};
	return json(payload);
}
