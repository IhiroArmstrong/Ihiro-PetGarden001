import { errorJson, json } from "../lib/http";
import {
	isPlausibleEmail,
	normalizeEmail,
	readMembership,
} from "../lib/membershipKv";
import { verifyMembershipDeviceToken } from "../lib/membershipDeviceToken";
import {
	createBillingPortalSession,
	customerIdFromStripeObject,
	retrieveSubscription,
} from "../lib/stripe";
import type { Env } from "../types";

/**
 * POST /api/create-membership-portal-session
 * Body: { email, deviceToken }
 * Returns Stripe Customer Portal URL (self-serve cancel / payment method).
 */
export async function handleCreateMembershipPortalSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	if (!secret) {
		return errorJson(503, "misconfigured", "Stripe secret not configured");
	}
	if (!env.MEMBERSHIP_KV) {
		return errorJson(503, "misconfigured", "MEMBERSHIP_KV not bound");
	}
	if (!env.OTP_KV) {
		return errorJson(503, "misconfigured", "OTP_KV not bound");
	}

	const portalReturn = (
		env.MEMBERSHIP_PORTAL_RETURN_URL ||
		env.MEMBERSHIP_CHECKOUT_CANCEL_URL ||
		"http://127.0.0.1:5173/?product=1"
	).trim();

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
	if (!record?.subscriptionId) {
		return errorJson(404, "not_found", "No membership subscription for email");
	}

	let customerId: string | null = null;
	try {
		const sub = await retrieveSubscription({
			secretKey: secret,
			subscriptionId: record.subscriptionId,
		});
		customerId = customerIdFromStripeObject(sub);
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		return errorJson(502, "stripe_error", detail);
	}
	if (!customerId) {
		return errorJson(502, "stripe_error", "subscription missing customer");
	}

	try {
		const session = await createBillingPortalSession({
			secretKey: secret,
			customerId,
			returnUrl: portalReturn,
		});
		return json({ url: session.url });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "portal_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
