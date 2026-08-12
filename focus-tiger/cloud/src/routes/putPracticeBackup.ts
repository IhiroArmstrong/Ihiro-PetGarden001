import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import { verifyPracticeBackupDeviceToken } from "../lib/practiceBackupDeviceToken";
import {
	parsePracticeBackupSnapshot,
	putPracticeBackupSnapshot,
} from "../lib/practiceBackupKv";
import type { Env } from "../types";

/**
 * POST /api/practice-backup/put
 * Body: { email, deviceToken, snapshot }
 */
export async function handlePutPracticeBackup(
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
	let snapshotRaw: unknown;
	try {
		const body = (await request.json()) as {
			email?: unknown;
			deviceToken?: unknown;
			snapshot?: unknown;
		};
		if (typeof body?.email === "string") email = body.email;
		if (typeof body?.deviceToken === "string") deviceToken = body.deviceToken;
		snapshotRaw = body?.snapshot;
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

	const parsed = parsePracticeBackupSnapshot(snapshotRaw);
	if (!parsed.ok) {
		return errorJson(400, "invalid_snapshot", parsed.reason);
	}

	await putPracticeBackupSnapshot(
		env.PRACTICE_BACKUP_KV,
		normalized,
		parsed.snapshot,
	);
	return json({ ok: true, savedAt: parsed.snapshot.savedAt });
}
