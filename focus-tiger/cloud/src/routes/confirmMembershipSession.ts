import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	isActiveMembershipSubscriptionStatus,
	periodEndsAtFromSubscription,
	retrieveCheckoutSession,
	retrieveSubscription,
	subscriptionIdFromCheckoutSession,
} from "../lib/stripe";
import {
	MEMBERSHIP_PLAN_ID,
	normalizeEmail,
	readMembership,
	writeMembership,
} from "../lib/membershipKv";
import type { Env } from "../types";

/**
 * POST /api/confirm-membership-session
 * Body: { sessionId: string }
 *
 * Server retrieves Checkout Session + Subscription from Stripe.
 * Only unlocks when metadata.product === membership, mode === subscription,
 * and subscription status is active|trialing.
 * Client must NOT unlock from query alone (same restraint as Sanctuary).
 */
export async function handleConfirmMembershipSession(
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

	const product = session.metadata?.product;
	if (product !== "membership") {
		return errorJson(403, "not_membership", "Session is not a Membership purchase");
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

	const planId =
		(typeof session.metadata?.planId === "string" && session.metadata.planId) ||
		MEMBERSHIP_PLAN_ID;

	const emailRaw = emailFromCheckoutSession(session);
	if (emailRaw) {
		const email = normalizeEmail(emailRaw);
		const existing = await readMembership(env.MEMBERSHIP_KV, email);
		if (!existing || existing.receiptId !== session.id) {
			await writeMembership(env.MEMBERSHIP_KV, email, {
				active: true,
				periodEndsAt,
				planId,
				receiptId: session.id,
				subscriptionId,
			});
		} else if (
			existing.periodEndsAt !== periodEndsAt ||
			existing.subscriptionId !== subscriptionId
		) {
			await writeMembership(env.MEMBERSHIP_KV, email, {
				active: true,
				periodEndsAt,
				planId,
				receiptId: session.id,
				subscriptionId,
			});
		}
	}

	return json({
		active: true,
		unlocked: true,
		sessionId: session.id,
		subscriptionId,
		periodEndsAt,
		planId,
	});
}
