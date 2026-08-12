import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import { verifyPracticeBackupDeviceToken } from "../lib/practiceBackupDeviceToken";
import { getPracticeBackupSnapshot } from "../lib/practiceBackupKv";
import type { Env } from "../types";

/**
 * POST /api/practice-backup/get
 * Body: { email, deviceToken }
 */
export async function handleGetPracticeBackup(
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
	let deviceToken = "";
	try {
		const body = (await request.json()) as {
			email?: unknown;
			deviceToken?: unknown;
		};
		if (typeof body?.email === "string") email = body.email;
		if (typeof body?.deviceToken === "string") deviceToken = body.deviceToken;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}

	if (!isPlausibleEmail(email)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	const normalized = normalizeEmail(email);
	const auth = await verifyPracticeBackupDeviceToken({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		email: normalized,
		deviceToken,
	});
	if (!auth.ok) {
		if (auth.reason === "misconfigured") {
			return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
		}
		return errorJson(401, "unauthorized", "Invalid or expired backup credential");
	}

	const snapshot = await getPracticeBackupSnapshot(
		env.PRACTICE_BACKUP_KV,
		normalized,
	);
	return json({ ok: true, snapshot });
}
