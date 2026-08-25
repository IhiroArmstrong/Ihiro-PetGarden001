import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	emailFromSubscription,
	isActiveMembershipSubscriptionStatus,
	isProProductMetadata,
	periodEndsAtFromSubscription,
	retrieveCheckoutSession,
	retrieveSubscription,
	subscriptionIdFromCheckoutSession,
} from "../lib/stripe";
import {
	normalizeEmail,
	readMembership,
	upsertActiveMembership,
} from "../lib/membershipKv";
import { mintMembershipDeviceToken } from "../lib/membershipDeviceToken";
import type { Env } from "../types";

const FOCUS_TIGER_PRO_PLAN_ID = "focus-tiger-pro";

/**
 * POST /api/confirm-pro-session
 * Body: { sessionId: string }
 */
export async function handleConfirmProSession(
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

	let sessionId = "";
	try {
		const body = (await request.json()) as { sessionId?: unknown };
		if (typeof body?.sessionId === "string") sessionId = body.sessionId.trim();
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}
	if (!sessionId.startsWith("cs_")) {
		return errorJson(400, "invalid_session", "sessionId must be a Checkout Session id");
	}

	let session;
	try {
		session = await retrieveCheckoutSession({
			secretKey: secret,
			sessionId,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_failed";
		return errorJson(502, "stripe_error", detail);
	}

	if (!isProProductMetadata(session.metadata)) {
		return errorJson(403, "not_pro", "Session is not a Focus Tiger Pro purchase");
	}

	if (session.mode && session.mode !== "subscription") {
		return errorJson(403, "not_subscription", "Expected subscription Checkout mode");
	}

	const subscriptionId = subscriptionIdFromCheckoutSession(session);
	if (!subscriptionId) {
		return json({
			active: false,
			unlocked: false,
			reason: "missing_subscription",
		});
	}

	let subscription;
	try {
		subscription = await retrieveSubscription({
			secretKey: secret,
			subscriptionId,
		});
	} catch (err) {
		const detail = err instanceof Error ? err.message : "retrieve_subscription_failed";
		return errorJson(502, "stripe_error", detail);
	}

	if (!isActiveMembershipSubscriptionStatus(subscription.status)) {
		return json({
			active: false,
			unlocked: false,
			reason: "not_active",
			status: subscription.status || null,
		});
	}

	const periodEndsAt = periodEndsAtFromSubscription(subscription);
	if (!periodEndsAt) {
		return errorJson(502, "stripe_error", "subscription missing current_period_end");
	}

	const planId = FOCUS_TIGER_PRO_PLAN_ID;

	let emailRaw = emailFromCheckoutSession(session);
	if (!emailRaw) {
		emailRaw = await emailFromSubscription({
			secretKey: secret,
			subscription,
		});
	}

	let email: string | null = null;
	if (emailRaw) {
		email = normalizeEmail(emailRaw);
		const existing = await readMembership(env.MEMBERSHIP_KV, email);
		const needsWrite =
			!existing ||
			existing.receiptId !== session.id ||
			existing.periodEndsAt !== periodEndsAt ||
			existing.subscriptionId !== subscriptionId ||
			existing.planId !== planId ||
			Boolean(existing.lastPaymentFailedAt);
		if (needsWrite) {
			await upsertActiveMembership(env.MEMBERSHIP_KV, email, {
				active: true,
				periodEndsAt,
				planId,
				receiptId: session.id,
				subscriptionId,
			});
		} else if (existing) {
			await upsertActiveMembership(env.MEMBERSHIP_KV, email, existing);
		}
	}

	let deviceToken: string | null = null;
	if (email && env.OTP_KV) {
		const minted = await mintMembershipDeviceToken({
			kv: env.OTP_KV,
			pepper: (env.RESTORE_OTP_PEPPER || "").trim(),
			email,
			subscriptionId,
		});
		if (minted.ok) deviceToken = minted.deviceToken;
	}

	return json({
		active: true,
		unlocked: true,
		sessionId: session.id,
		subscriptionId,
		periodEndsAt,
		planId,
		email,
		deviceToken,
	});
}
