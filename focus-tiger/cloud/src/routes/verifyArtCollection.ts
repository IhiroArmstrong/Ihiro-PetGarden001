import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/companionAddonKv";
import { consumeRestoreOtp } from "../lib/restoreOtp";
import { issueArtHdGrant } from "../lib/artCollectionHdGrant";
import { isArtPieceOwned, readArtCollection } from "../lib/artCollectionKv";
import type { Env } from "../types";

/**
 * POST /api/verify-art-collection
 * Body: { email: string, code: string }
 */
export async function handleVerifyArtCollection(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.SANCTUARY_KV) {
		return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
	}
	if (!env.OTP_KV) {
		return errorJson(503, "misconfigured", "OTP_KV not bound");
	}

	let email = "";
	let code = "";
	try {
		const body = (await request.json()) as { email?: unknown; code?: unknown };
		if (typeof body?.email === "string") email = body.email;
		if (typeof body?.code === "string") code = body.code;
		else if (typeof body?.code === "number") code = String(body.code);
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}
	if (!isPlausibleEmail(email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	if (!String(code || "").trim()) {
		return errorJson(400, "otp_required", "Restore code required");
	}

	const otp = await consumeRestoreOtp({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		purpose: "art-collection",
		email: normalizeEmail(email),
		code,
	});
	if (!otp.ok) {
		if (otp.reason === "misconfigured") {
			return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
		}
		if (otp.reason === "missing_code") {
			return errorJson(400, "otp_required", "Restore code required");
		}
		return errorJson(401, "invalid_or_expired_code", "Restore code invalid or expired");
	}

	const normalized = normalizeEmail(email);
	const record = await readArtCollection(env.SANCTUARY_KV, normalized);
	const downloads = [];
	if (env.ART_COLLECTION_HD) {
		for (const [artId, piece] of Object.entries(record.items)) {
			if (!isArtPieceOwned(record, artId)) continue;
			const hd = await issueArtHdGrant({
				kv: env.SANCTUARY_KV,
				pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
				email: normalized,
				artId,
				receiptId: piece.receiptId,
			});
			if (hd) downloads.push({ artId, receiptId: piece.receiptId, ...hd });
		}
	}
	return json({
		signedIn: true,
		email: normalized,
		items: record.items,
		downloads,
	});
}
