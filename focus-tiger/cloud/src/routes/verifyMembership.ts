import { errorJson, json } from "../lib/http";
import {
	isMembershipWithinVerifyWindow,
	isPlausibleEmail,
	normalizeEmail,
	readMembership,
} from "../lib/membershipKv";
import { mintMembershipDeviceToken } from "../lib/membershipDeviceToken";
import { consumeRestoreOtp } from "../lib/restoreOtp";
import type { Env } from "../types";

/**
 * POST /api/verify-membership
 * Body: { email: string, code: string }
 * Requires a one-time restore OTP (see /api/restore/request-otp).
 *
 * Entitlement window: periodEndsAt + MEMBERSHIP_GRACE_MS (7d, aligned with
 * client ENTITLEMENT_GRACE_MS). Past that window → active:false even if KV
 * row still exists (e.g. Stripe dunning before subscription.deleted).
 * This closes the “re-verify refreshes lastVerifiedAt forever” hole.
 *
 * On success mints a deviceToken for Provider poll / Portal (same as confirm).
 */
export async function handleVerifyMembership(
	request: Request,
	env: Env,
): Promise<Response> {
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
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

	const normalized = normalizeEmail(email);
	const otp = await consumeRestoreOtp({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		purpose: "membership",
		email: normalized,
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

	const record = await readMembership(env.MEMBERSHIP_KV, normalized);
	if (!record) {
		return json({ active: false, unlocked: false });
	}

	if (!isMembershipWithinVerifyWindow(record.periodEndsAt)) {
		return json({
			active: false,
			unlocked: false,
			reason: "grace_exhausted",
			periodEndsAt: record.periodEndsAt,
			planId: record.planId,
			subscriptionId: record.subscriptionId,
		});
	}

	let deviceToken: string | null = null;
	const minted = await mintMembershipDeviceToken({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		email: normalized,
		subscriptionId: record.subscriptionId,
	});
	if (minted.ok) deviceToken = minted.deviceToken;

	return json({
		active: true,
		unlocked: true,
		periodEndsAt: record.periodEndsAt,
		planId: record.planId,
		subscriptionId: record.subscriptionId,
		email: normalized,
		deviceToken,
	});
}
