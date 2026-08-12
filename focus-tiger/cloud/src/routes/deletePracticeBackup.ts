import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import { consumeRestoreOtp } from "../lib/restoreOtp";
import {
	revokePracticeBackupDeviceToken,
	verifyPracticeBackupDeviceToken,
} from "../lib/practiceBackupDeviceToken";
import { deletePracticeBackupSnapshot } from "../lib/practiceBackupKv";
import type { Env } from "../types";

/**
 * POST /api/practice-backup/delete
 * Body: { email, code } OR { email, deviceToken }
 * Deletes cloud snapshot (GDPR close-backup). Revokes deviceToken when provided.
 */
export async function handleDeletePracticeBackup(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.PRACTICE_BACKUP_KV) {
		return errorJson(503, "misconfigured", "PRACTICE_BACKUP_KV not bound");
	}
	if (!env.OTP_KV) {
		return errorJson(503, "misconfigured", "OTP_KV not bound");
	}

	let email = "";
	let code = "";
	let deviceToken = "";
	try {
		const body = (await request.json()) as {
			email?: unknown;
			code?: unknown;
			deviceToken?: unknown;
		};
		if (typeof body?.email === "string") email = body.email;
		if (typeof body?.code === "string") code = body.code;
		else if (typeof body?.code === "number") code = String(body.code);
		if (typeof body?.deviceToken === "string") deviceToken = body.deviceToken;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}

	if (!isPlausibleEmail(email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	const normalized = normalizeEmail(email);
	const pepper = (env.RESTORE_OTP_PEPPER || "").trim();
	const hasCode = Boolean(String(code || "").trim());
	const hasToken = Boolean(String(deviceToken || "").trim());

	if (!hasCode && !hasToken) {
		return errorJson(
			400,
			"auth_required",
			"Backup code or deviceToken required",
		);
	}

	if (hasCode) {
		const otp = await consumeRestoreOtp({
			kv: env.OTP_KV,
			pepper,
			purpose: "practice-backup",
			email: normalized,
			code,
		});
		if (!otp.ok) {
			if (otp.reason === "misconfigured") {
				return errorJson(
					503,
					"misconfigured",
					"RESTORE_OTP_PEPPER not configured",
				);
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
	} else {
		const auth = await verifyPracticeBackupDeviceToken({
			kv: env.OTP_KV,
			pepper,
			email: normalized,
			deviceToken,
		});
		if (!auth.ok) {
			if (auth.reason === "misconfigured") {
				return errorJson(
					503,
					"misconfigured",
					"RESTORE_OTP_PEPPER not configured",
				);
			}
			return errorJson(
				401,
				"unauthorized",
				"Invalid or expired backup credential",
			);
		}
	}

	const deleted = await deletePracticeBackupSnapshot(
		env.PRACTICE_BACKUP_KV,
		normalized,
	);

	if (hasToken) {
		await revokePracticeBackupDeviceToken({
			kv: env.OTP_KV,
			pepper,
			deviceToken,
		});
	}

	return json({ ok: true, deleted });
}
