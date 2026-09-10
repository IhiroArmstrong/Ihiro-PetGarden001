import { json } from "../lib/http.ts";
import { requireJsonFields } from "../lib/validate.ts";
import {
	QUIET_LINE_OVERLAY_SCHEMA_VERSION,
	tasteQuietLinePool,
} from "../lib/tasteQuietLineFreeze.ts";
import type { QuietLineResponse } from "../types";

const REQUIRED = ["locale", "localDate"] as const;

/**
 * Taste-layer Quiet Line mixed-pool overlay. schemaVersion 2 = freeze 29 keys.
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
		schemaVersion: QUIET_LINE_OVERLAY_SCHEMA_VERSION,
		locale,
		pool,
		variantSeed: first?.key ?? "0",
	};
	return json(payload);
}
