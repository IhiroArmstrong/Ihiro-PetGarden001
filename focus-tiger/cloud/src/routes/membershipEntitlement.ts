import { errorJson, json } from "../lib/http";
import {
	isMembershipWithinVerifyWindow,
	isPlausibleEmail,
	normalizeEmail,
	readMembership,
} from "../lib/membershipKv";
import { verifyMembershipDeviceToken } from "../lib/membershipDeviceToken";
import type { Env } from "../types";

/**
 * POST /api/membership-entitlement
 * Body: { email, deviceToken }
 * Provider refresh — requires device token from confirm or OTP verify.
 */
export async function handleMembershipEntitlement(
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
	if (!deviceToken.trim()) {
		return errorJson(401, "invalid_token", "deviceToken required");
	}

	const verified = await verifyMembershipDeviceToken({
		kv: env.OTP_KV,
		pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
		email,
		deviceToken,
	});
	if (!verified.ok) {
		if (verified.reason === "misconfigured") {
			return errorJson(503, "misconfigured", "RESTORE_OTP_PEPPER not configured");
		}
		return errorJson(401, "invalid_token", "device token invalid or expired");
	}

	const record = await readMembership(
		env.MEMBERSHIP_KV,
		normalizeEmail(email),
	);
	if (!record || !isMembershipWithinVerifyWindow(record.periodEndsAt)) {
		return json({
			active: false,
			unlocked: false,
			subscription: {
				active: false,
				periodEndsAt: record?.periodEndsAt ?? null,
				planId: record?.planId ?? null,
				via: null,
			},
		});
	}

	return json({
		active: true,
		unlocked: true,
		periodEndsAt: record.periodEndsAt,
		planId: record.planId,
		subscriptionId: record.subscriptionId,
		subscription: {
			active: true,
			periodEndsAt: record.periodEndsAt,
			planId: record.planId,
			via: "payment",
		},
	});
}
