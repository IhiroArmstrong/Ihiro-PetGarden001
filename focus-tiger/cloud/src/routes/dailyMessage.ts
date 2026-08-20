import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import { TASTE_LAYER_SCHEMA_VERSION } from "../lib/tasteLayerFreeze.ts";
import { tasteDailyWisdomPool } from "../lib/tasteDailyWisdomFreeze.ts";
import type { DailyMessageResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Taste-layer daily-wisdom pool overlay. schemaVersion 1 = freeze 14 ids.
 */
export async function handleDailyMessage(
	request: Request,
): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = parsed.locale === "ja" ? "ja" : "en";
	const pool = tasteDailyWisdomPool(locale);
	const first = pool[0];
	const payload: DailyMessageResponse = {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		locale,
		pool,
		message: first?.text ?? "",
		variantSeed: first?.id ?? "0",
	};
	return json(payload);
}
