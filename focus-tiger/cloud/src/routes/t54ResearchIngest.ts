/**
 * POST /api/t54-research-ingest
 * Separate T54_RESEARCH_KV (not YPE / backup / funnel / tip).
 */

import { errorJson, json } from "../lib/http";
import { pickT54ResearchReceiveFields } from "../lib/t54ResearchWhitelist";
import type { Env } from "../types";

const MAX_CODE = 80;

export async function handleT54ResearchIngest(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.T54_RESEARCH_KV) {
		return errorJson(503, "misconfigured", "T54_RESEARCH_KV not bound");
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorJson(400, "invalid_json", "Request body must be valid JSON");
	}

	const picked = pickT54ResearchReceiveFields(body);
	if (!picked.ok) {
		return errorJson(400, "invalid_body", "Request body must be a JSON object");
	}
	if (picked.dropped.length > 0) {
		console.warn(
			"[t54-research-ingest] dropped extra fields",
			picked.dropped.join(","),
		);
		return errorJson(
			400,
			"extra_fields",
			`Dropped non-whitelist fields: ${picked.dropped.join(",")}`,
		);
	}

	const code =
		typeof picked.accepted.localResearchCode === "string"
			? picked.accepted.localResearchCode.trim().slice(0, MAX_CODE)
			: "";
	if (!code) {
		return errorJson(400, "bad_code", "localResearchCode required");
	}

	const key = `t54:v1:${code}`;
	try {
		await env.T54_RESEARCH_KV.put(
			key,
			JSON.stringify({
				...picked.accepted,
				storedAt: new Date().toISOString(),
			}),
		);
	} catch {
		return errorJson(500, "kv_write_failed", "Could not store research row");
	}

	return json({ ok: true, dropped: [] });
}
