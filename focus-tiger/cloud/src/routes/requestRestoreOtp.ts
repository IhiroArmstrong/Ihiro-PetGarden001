import { errorJson, json } from "../lib/http";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import { readSanctuary } from "../lib/sanctuaryKv";
import { readCompanionAddon } from "../lib/companionAddonKv";
import { readMembership, isMembershipWithinVerifyWindow } from "../lib/membershipKv";
import {
	isRestorePurpose,
	issueRestoreOtp,
	RESTORE_OTP_TTL_SEC,
	type RestorePurpose,
} from "../lib/restoreOtp";
import { restoreOtpEmailCopy, sendTransactionalEmail } from "../lib/resend";
import type { Env } from "../types";

/**
 * POST /api/restore/request-otp
 * Body: { email, purpose: "sanctuary" | "membership" }
 * Always returns { ok: true } on success path (anti-enumeration).
 *
 * Timing: Resend is fire-and-forget via waitUntil — response does not wait
 * for the email API, so entitled vs non-entitled branches stay similar.
 */
export async function handleRequestRestoreOtp(
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
	let purposeRaw: unknown;
	try {
		const body = (await request.json()) as {
			email?: unknown;
			purpose?: unknown;
		};
		if (typeof body?.email === "string") emailRaw = body.email;
		purposeRaw = body?.purpose;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}

	if (!isPlausibleEmail(emailRaw)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	if (!isRestorePurpose(purposeRaw)) {
		return errorJson(
			400,
			"invalid_purpose",
			'purpose must be "sanctuary", "membership", or "companion-addon"',
		);
	}
	const purpose: RestorePurpose = purposeRaw;
	const email = normalizeEmail(emailRaw);

	let hasEntitlement = false;
	if (purpose === "sanctuary") {
		if (!env.SANCTUARY_KV) {
			return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
		}
		hasEntitlement = Boolean(await readSanctuary(env.SANCTUARY_KV, email));
	} else if (purpose === "companion-addon") {
		if (!env.SANCTUARY_KV) {
			return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
		}
		hasEntitlement = Boolean(await readCompanionAddon(env.SANCTUARY_KV, email));
	} else if (purpose === "membership") {
		if (!env.MEMBERSHIP_KV) {
			return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
		}
		const rec = await readMembership(env.MEMBERSHIP_KV, email);
		hasEntitlement = Boolean(
			rec && isMembershipWithinVerifyWindow(rec.periodEndsAt),
		);
	} else {
		hasEntitlement = false;
	}

	if (hasEntitlement) {
		const issued = await issueRestoreOtp({
			kv: env.OTP_KV,
			pepper,
			purpose,
			email,
		});
		if (issued.ok) {
			const apiKey = (env.RESEND_API_KEY || "").trim();
			const from = (env.RESEND_FROM || "").trim();
			if (apiKey && from) {
				const copy = restoreOtpEmailCopy({
					purpose,
					code: issued.code,
					ttlMinutes: Math.round(RESTORE_OTP_TTL_SEC / 60),
				});
				// Fire-and-forget: do not await Resend before responding.
				ctx.waitUntil(
					sendTransactionalEmail({
						apiKey,
						from,
						to: email,
						subject: copy.subject,
						text: copy.text,
					}).then((r) => {
						if (!r.ok) {
							console.error("[restore-otp] resend failed", {
								purpose,
								detail: r.detail,
							});
						}
					}),
				);
			} else {
				console.warn(
					"[restore-otp] RESEND_API_KEY / RESEND_FROM missing; code not emailed",
					{ purpose },
				);
			}
		}
		// cooldown / hourly_cap → still { ok: true } (anti-enumeration)
	}

	return json({ ok: true });
}
