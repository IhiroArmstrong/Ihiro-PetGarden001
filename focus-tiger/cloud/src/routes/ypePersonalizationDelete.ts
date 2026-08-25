/**
 * POST /api/ype-personalization-delete
 */

import { errorJson, json } from "../lib/http";
import { deleteYpeProfileRecord } from "../lib/ypePersonalizationKv";
import type { Env } from "../types";

const SCHEMA_VERSION = 1;
const MAX_PROFILE_ID = 80;

/**
 * Body: { schemaVersion, ypeProfileId }
 */
export async function handleYpePersonalizationDelete(
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

	try {
		const deleted = await deleteYpeProfileRecord(
			env.YPE_PERSONALIZATION_KV,
			ypeProfileId,
		);
		return json({ ok: true, deleted });
	} catch {
		return errorJson(500, "kv_delete_failed", "Could not delete YPE profile");
	}
}
