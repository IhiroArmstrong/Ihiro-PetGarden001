import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import { consumeRestoreOtp } from "../lib/restoreOtp";
import { mintPracticeBackupDeviceToken } from "../lib/practiceBackupDeviceToken";
import type { Env } from "../types";

/**
 * POST /api/practice-backup/verify
 * Body: { email, code } → deviceToken (no entitlement lookup).
 */
export async function handleVerifyPracticeBackup(
	request: Request,
	env: Env,
): Promise<Response> {
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
		return errorJson(400, "otp_required", "Backup code required");
	}

	const normalized = normalizeEmail(email);
	const otp = await consumeRestoreOtp({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		purpose: "practice-backup",
		email: normalized,
		code,
	});
	if (!otp.ok) {
		if (otp.reason === "misconfigured") {
			return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
		}
		if (otp.reason === "missing_code") {
			return errorJson(400, "otp_required", "Backup code required");
		}
		return errorJson(
			401,
			"invalid_or_expired_code",
			"Backup code invalid or expired",
		);
	}

	const minted = await mintPracticeBackupDeviceToken({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		email: normalized,
	});
	if (!minted.ok) {
		return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
	}

	return json({
		ok: true,
		email: minted.email,
		deviceToken: minted.deviceToken,
		expiresAt: minted.expiresAt,
	});
}
