import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail, readSanctuary } from "../lib/sanctuaryKv";
import { consumeRestoreOtp } from "../lib/restoreOtp";
import type { Env } from "../types";

/**
 * POST /api/verify-sanctuary
 * Body: { email: string, code: string }
 * Requires a one-time restore OTP (see /api/restore/request-otp).
 */
export async function handleVerifySanctuary(
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
		const body = (await request.json()) as {
			email?: unknown;
			code?: unknown;
		};
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
		purpose: "sanctuary",
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
		return errorJson(
			401,
			"invalid_or_expired_code",
			"Restore code invalid or expired",
		);
	}

	const record = await readSanctuary(env.SANCTUARY_KV, normalizeEmail(email));
	if (!record) {
		return json({ unlocked: false });
	}
	return json({
		unlocked: true,
		unlockedAt: record.unlockedAt,
		itemId: record.itemId,
	});
}
