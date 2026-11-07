/**
 * POST /api/co-practice-research-ingest
 * DELETE /api/co-practice-research-ingest — Bearer studyId (UUIDv4)
 * Stored in CO_PRACTICE_RESEARCH_KV only (not T54 / YPE / backup / funnel).
 */

import { errorJson, json } from "../lib/http.ts";
import {
	coPracticeResearchRowKey,
	coPracticeResearchStudyPrefix,
} from "../lib/coPracticeResearchKv.ts";
import { parseCoPracticeResearchPayload } from "../lib/coPracticeResearchPayload.ts";
import { parseBearerStudyId } from "../lib/coPracticeResearchStudyId.ts";
import type { Env } from "../types.ts";

export const CO_PRACTICE_RESEARCH_INGEST_PATH =
	"/api/co-practice-research-ingest";

/** §2.5 — body size cap (32 KiB). */
export const CO_PRACTICE_RESEARCH_MAX_BODY_BYTES = 32 * 1024;

export async function readCoPracticeResearchBody(
	request: Request,
): Promise<{ ok: true; raw: unknown } | { ok: false; response: Response }> {
	const lenHeader = request.headers.get("content-length");
	if (lenHeader) {
		const n = Number(lenHeader);
		if (Number.isFinite(n) && n > CO_PRACTICE_RESEARCH_MAX_BODY_BYTES) {
			return {
				ok: false,
				response: errorJson(413, "payload_too_large", "Request body too large"),
			};
		}
	}

	let text: string;
	try {
		text = await request.text();
	} catch {
		return {
			ok: false,
			response: errorJson(400, "invalid_body", "Could not read request body"),
		};
	}

	if (text.length > CO_PRACTICE_RESEARCH_MAX_BODY_BYTES) {
		return {
			ok: false,
			response: errorJson(413, "payload_too_large", "Request body too large"),
		};
	}

	if (!text.trim()) {
		return {
			ok: false,
			response: errorJson(400, "invalid_json", "Request body must be valid JSON"),
		};
	}

	try {
		return { ok: true, raw: JSON.parse(text) as unknown };
	} catch {
		return {
			ok: false,
			response: errorJson(400, "invalid_json", "Request body must be valid JSON"),
		};
	}
}

export async function handleCoPracticeResearchIngestPost(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.CO_PRACTICE_RESEARCH_KV) {
		return errorJson(
			503,
			"misconfigured",
			"CO_PRACTICE_RESEARCH_KV not bound",
		);
	}

	const bodyRead = await readCoPracticeResearchBody(request);
	if (!bodyRead.ok) return bodyRead.response;

	const parsed = parseCoPracticeResearchPayload(bodyRead.raw);
	if (!parsed.ok) {
		return errorJson(400, parsed.reason, "Payload failed validation");
	}

	const key = coPracticeResearchRowKey(
		parsed.accepted.studyId,
		parsed.accepted.week,
	);

	try {
		await env.CO_PRACTICE_RESEARCH_KV.put(
			key,
			JSON.stringify(parsed.accepted),
		);
	} catch {
		return errorJson(500, "kv_write_failed", "Could not store research row");
	}

	if (parsed.dropped.length > 0) {
		console.warn(
			"[co-practice-research-ingest] dropped extra fields",
			parsed.dropped.join(","),
		);
	}

	return json({ ok: true, dropped: parsed.dropped });
}

export async function handleCoPracticeResearchIngestDelete(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.CO_PRACTICE_RESEARCH_KV) {
		return errorJson(
			503,
			"misconfigured",
			"CO_PRACTICE_RESEARCH_KV not bound",
		);
	}

	const studyId = parseBearerStudyId(request);
	if (!studyId) {
		return errorJson(400, "bad_study_id", "Authorization Bearer studyId required");
	}

	const prefix = coPracticeResearchStudyPrefix(studyId);
	let cursor: string | undefined;
	const keysToDelete: string[] = [];

	try {
		do {
			const listed = await env.CO_PRACTICE_RESEARCH_KV.list({
				prefix,
				cursor,
			});
			for (const k of listed.keys) {
				keysToDelete.push(k.name);
			}
			cursor = listed.list_complete ? undefined : listed.cursor;
		} while (cursor);
	} catch {
		return errorJson(500, "kv_list_failed", "Could not list research rows");
	}

	try {
		await Promise.all(
			keysToDelete.map((name) => env.CO_PRACTICE_RESEARCH_KV!.delete(name)),
		);
	} catch {
		return errorJson(500, "kv_delete_failed", "Could not delete research rows");
	}

	return json({ ok: true, deleted: keysToDelete.length });
}
