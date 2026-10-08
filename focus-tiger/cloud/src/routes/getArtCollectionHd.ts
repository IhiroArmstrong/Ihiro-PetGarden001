import { errorJson } from "../lib/http.ts";
import { artHdObjectKey, consumeArtHdGrant, takeArtHdGrant } from "../lib/artCollectionHdGrant.ts";
import { stampPngReceipt } from "../lib/pngBuyerMark.ts";
import type { Env } from "../types.ts";

/**
 * GET /api/art-collection-hd?t=...
 * The token was issued only after a paid, still-active purchase.
 */
export async function handleGetArtCollectionHd(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.SANCTUARY_KV) {
		return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
	}
	const token = new URL(request.url).searchParams.get("t") || "";
	const taken = await takeArtHdGrant({
		kv: env.SANCTUARY_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		token,
	});
	if (!taken.ok) {
		if (taken.reason === "misconfigured") {
			return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
		}
		if (taken.reason === "revoked") {
			return errorJson(403, "not_owned", "This purchase is no longer active");
		}
		return errorJson(403, "invalid_grant", "Download link is missing or expired");
	}
	if (!env.ART_COLLECTION_HD) {
		return errorJson(503, "misconfigured", "ART_COLLECTION_HD not bound");
	}
	const key = artHdObjectKey(taken.grant.hdId);
	if (!key) {
		return errorJson(404, "missing_hd", "High-resolution file is not on the shelf");
	}
	const object = await env.ART_COLLECTION_HD.get(key);
	if (!object) {
		return errorJson(404, "missing_hd", "High-resolution file is not on the shelf");
	}
	const raw = new Uint8Array(await object.arrayBuffer());
	const marked = stampPngReceipt(raw, taken.grant.receiptId);
	if (!marked) {
		return errorJson(502, "hd_unreadable", "High-resolution file could not be prepared");
	}
	await consumeArtHdGrant(env.SANCTUARY_KV, taken.tokenHash);
	return new Response(marked, {
		status: 200,
		headers: {
			"content-type": "image/png",
			"cache-control": "private, no-store",
		},
	});
}
