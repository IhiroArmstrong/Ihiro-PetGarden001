import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import {
	CALM_ACTION_OVERLAY_SCHEMA_VERSION,
	tasteCalmActionArrivePool,
	tasteCalmActionRecoverPool,
	tasteCalmActionReflectPool,
} from "../lib/tasteCalmActionCopyFreeze.ts";
import type { CalmActionCopyResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Taste-layer Calm Action Recover + Arrive + Reflect pool overlay.
 * schemaVersion 2 = freeze 14 recover + 14 arrive + 20 reflect ids per locale.
 */
export async function handleCalmActionCopy(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = parsed.locale === "ja" ? "ja" : "en";
	const recover = tasteCalmActionRecoverPool(locale);
	const arrive = tasteCalmActionArrivePool(locale);
	const reflect = tasteCalmActionReflectPool(locale);
	const payload: CalmActionCopyResponse = {
		schemaVersion: CALM_ACTION_OVERLAY_SCHEMA_VERSION,
		locale,
		recover,
		arrive,
		reflect,
		variantSeed: recover[0]?.id ?? "0",
	};
	return json(payload);
}
