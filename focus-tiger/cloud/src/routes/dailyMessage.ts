import { json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import type { DailyMessageResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Stub: daily companion message.
 * Required body: { locale, localDate } — provisional; product review pending.
 */
export async function handleDailyMessage(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	// parsed holds locale + localDate; real logic TBD after field review.
	void parsed;

	const payload: DailyMessageResponse = {
		message: "mock",
		variantSeed: "0",
	};
	return json(payload);
}
