import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import { TASTE_LAYER_SCHEMA_VERSION } from "../lib/tasteLayerFreeze.ts";
import { tasteQuietLinePool } from "../lib/tasteQuietLineFreeze.ts";
import type { QuietLineResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Taste-layer Quiet Line mixed-pool overlay. schemaVersion 1 = freeze 21 keys.
 */
export async function handleQuietLine(request: Request): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = parsed.locale === "ja" ? "ja" : "en";
	const pool = tasteQuietLinePool(locale);
	const first = pool[0];
	const payload: QuietLineResponse = {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		locale,
		pool,
		variantSeed: first?.key ?? "0",
	};
	return json(payload);
}
