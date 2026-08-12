import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import {
	issueRestoreOtp,
	RESTORE_OTP_TTL_SEC,
} from "../lib/restoreOtp";
import { restoreOtpEmailCopy, sendTransactionalEmail } from "../lib/resend";
import type { Env } from "../types";

/**
 * POST /api/practice-backup/request-otp
 * Body: { email }
 * No entitlement gate — free backup binding.
 * Always { ok: true } on success path (anti-enumeration).
 */
export async function handleRequestPracticeBackupOtp(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	if (!env.OTP_KV) {
		return errorJson(503, "misconfigured", "OTP_KV not bound");
	}
	const pepper = (env.RESTORE_OTP_PEPPER || "").trim();
	if (!pepper) {
		return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
	}

	let emailRaw = "";
	try {
		const body = (await request.json()) as { email?: unknown };
		if (typeof body?.email === "string") emailRaw = body.email;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}

	if (!isPlausibleEmail(emailRaw)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	const email = normalizeEmail(emailRaw);

	const issued = await issueRestoreOtp({
		kv: env.OTP_KV,
		pepper,
		purpose: "practice-backup",
		email,
	});
	if (issued.ok) {
		const apiKey = (env.RESEND_API_KEY || "").trim();
		const from = (env.RESEND_FROM || "").trim();
		if (apiKey && from) {
			const copy = restoreOtpEmailCopy({
				purpose: "practice-backup",
				code: issued.code,
				ttlMinutes: Math.round(RESTORE_OTP_TTL_SEC / 60),
			});
			ctx.waitUntil(
				sendTransactionalEmail({
					apiKey,
					from,
					to: email,
					subject: copy.subject,
					text: copy.text,
				}).then((r) => {
					if (!r.ok) {
						console.error("[practice-backup-otp] resend failed", {
							detail: r.detail,
						});
					}
				}),
			);
		} else {
			console.warn(
				"[practice-backup-otp] RESEND_API_KEY / RESEND_FROM missing; code not emailed",
			);
		}
	}

	return json({ ok: true });
}
