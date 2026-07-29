import { json } from "../lib/http";
import { requireJsonFields } from "../lib/validate";
import type { DailyMessageResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Stub aligned with CLOUD_CONFIG_V1 A1/A2 (tech-verify keys; not incense copy).
 * Path B: not wired to frontend; keep shape in sync with softScheduleConfig.
 */
export async function handleDailyMessage(
	request: Request,
): Promise<Response> {
	const clone = request.clone();
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = String(parsed.locale);
	const localDate = String(parsed.localDate);
	let slot = "tech_verify";
	try {
		const body = (await clone.json()) as { slot?: unknown };
		if (typeof body.slot === "string" && body.slot.trim()) {
			slot = body.slot.trim();
		}
	} catch {
		// optional slot only
	}
	const variantSeed = `${localDate}:${locale}:${slot}`;

	const payload: DailyMessageResponse = {
		schemaVersion: 1,
		messageKey: "MINDFUL_FOCUS_MILESTONE_1",
		variantSeed,
	};
	return json(payload);
}
