import { json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import type { EmotionWeightResponse } from "../types";

const REQUIRED = ["emotionKey", "sessionPhase"] as const;

/**
 * Stub aligned with CLOUD_CONFIG_V1 A3/A4 (form 2 weight table).
 * celebrating → 50/50; other keys → empty variants (client uses local default).
 */
export async function handleEmotionWeight(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const emotionKey = String(parsed.emotionKey)
		.trim()
		.replace(/^[A-Z]/, (c) => c.toLowerCase());

	const payload: EmotionWeightResponse =
		emotionKey === "celebrating"
			? {
					schemaVersion: 1,
					variants: [
						{ id: "celebrateDance", weight: 0.5 },
						{ id: "celebrateDanceV2", weight: 0.5 },
					],
				}
			: {
					schemaVersion: 1,
					variants: [],
				};

	return json(payload);
}
