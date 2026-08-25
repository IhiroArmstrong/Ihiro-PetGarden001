/**
 * POST /api/ype-personalization-ingest
 */

import { errorJson, json } from "../lib/http";
import {
	sanitizeYpeSignalsV1,
	YPE_MIN_SAMPLE_COMPLETIONS,
} from "../lib/ypePersonalizationAlgorithm";
import { upsertYpeProfileSignals } from "../lib/ypePersonalizationKv";
import type { Env } from "../types";

const SCHEMA_VERSION = 1;
const MAX_PROFILE_ID = 80;

/**
 * Body: { schemaVersion, ypeProfileId, consentedAt?, uploadedAt, signals, windowCompletionCount }
 */
export async function handleYpePersonalizationIngest(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.YPE_PERSONALIZATION_KV) {
		return errorJson(503, "misconfigured", "YPE_PERSONALIZATION_KV not bound");
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorJson(400, "invalid_json", "Request body must be valid JSON");
	}
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return errorJson(400, "invalid_body", "Request body must be a JSON object");
	}
	const o = body as Record<string, unknown>;
	if (o.schemaVersion !== SCHEMA_VERSION) {
		return errorJson(400, "bad_schema", "Unsupported schemaVersion");
	}
	const ypeProfileId =
		typeof o.ypeProfileId === "string"
			? o.ypeProfileId.trim().slice(0, MAX_PROFILE_ID)
			: "";
	if (!ypeProfileId || ypeProfileId.length < 8) {
		return errorJson(400, "bad_profile_id", "ypeProfileId required");
	}
	const signals = sanitizeYpeSignalsV1(o.signals);
	if (!signals) {
		return errorJson(400, "bad_signals", "signals invalid");
	}
	const windowCompletionCount = Number(o.windowCompletionCount);
	if (!Number.isFinite(windowCompletionCount) || windowCompletionCount < 0) {
		return errorJson(400, "bad_window", "windowCompletionCount invalid");
	}
	const uploadedAt =
		typeof o.uploadedAt === "string" && o.uploadedAt
			? o.uploadedAt.slice(0, 40)
			: new Date().toISOString();

	try {
		const { pack } = await upsertYpeProfileSignals(env.YPE_PERSONALIZATION_KV, {
			ypeProfileId,
			signals,
			windowCompletionCount: Math.floor(windowCompletionCount),
			now: new Date(uploadedAt),
		});
		return json({
			ok: true,
			uploadedAt,
			pack,
			insufficientSample: windowCompletionCount < YPE_MIN_SAMPLE_COMPLETIONS,
		});
	} catch {
		return errorJson(500, "kv_write_failed", "Could not store YPE profile");
	}
}
