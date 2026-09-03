import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import { TASTE_LAYER_SCHEMA_VERSION } from "../lib/tasteLayerFreeze.ts";
import {
	confideCopyLocale,
	tasteConfideCopyCorpus,
	tasteConfideCopyTemplates,
} from "../lib/tasteConfideCopyFreeze.ts";
import type { ConfideCopyResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Taste-layer Confide template + corpus overlay.
 * schemaVersion 1 = freeze 3 template keys + 19 corpus ids.
 * Routing / regex / Qwen stay on the client.
 */
export async function handleConfideCopy(request: Request): Promise<Response> {
	const parsed = await requireJsonFields(request, REQUIRED);
	if (parsed instanceof Response) {
		return parsed;
	}

	const locale = confideCopyLocale(String(parsed.locale || ""));
	const templates = tasteConfideCopyTemplates(locale);
	const corpus = tasteConfideCopyCorpus(locale);
	const payload: ConfideCopyResponse = {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		locale,
		templates,
		corpus,
		variantSeed: templates[0]?.key ?? "0",
	};
	return json(payload);
}
