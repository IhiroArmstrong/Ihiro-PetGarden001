import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	verifyStripeWebhookSignatureDetailed,
	type StripeCheckoutSession,
	type StripeInvoice,
	type StripeSubscription,
} from "../lib/stripe";
import { normalizeEmail as normalizeTipEmail, writeTip } from "../lib/tipKv";
import {
	normalizeEmail as normalizeSanctuaryEmail,
	writeSanctuary,
} from "../lib/sanctuaryKv";
import {
	handleMembershipCheckoutCompleted,
	handleMembershipInvoicePaid,
	handleMembershipInvoicePaymentFailed,
	handleMembershipSubscriptionDeleted,
	handleMembershipSubscriptionUpdated,
} from "./membershipStripeWebhook";
import type { Env } from "../types";

type StripeEvent = {
	id?: string;
	type?: string;
	data?: {
		object?: Record<string, unknown>;
	};
};

/**
 * POST /api/stripe-webhook
 * - mode=payment + metadata.product tip|sanctuary → TIP_KV / SANCTUARY_KV
 * - Membership subscription lifecycle → MEMBERSHIP_KV (Prompt 9)
 * Missing tip/sanctuary metadata defaults to tip (legacy sessions).
 */
export async function handleStripeWebhook(
	request: Request,
	env: Env,
): Promise<Response> {
	const webhookSecret = (env.STRIPE_WEBHOOK_SECRET || "").trim();
	if (!webhookSecret) {
		return errorJson(503, "misconfigured", "Webhook secret not configured");
	}

	const payload = await request.text();
	const signatureHeader = request.headers.get("stripe-signature");
	const verified = await verifyStripeWebhookSignatureDetailed({
		payload,
		signatureHeader,
		webhookSecret,
	});
	if (!verified.ok) {
		console.error("[stripe-webhook] signature rejected", {
			reason: verified.reason,
		});
		return errorJson(
			400,
			"invalid_signature",
			"Stripe signature verification failed",
		);
	}

	let event: StripeEvent;
	try {
		event = JSON.parse(payload) as StripeEvent;
	} catch {
		console.error("[stripe-webhook] invalid JSON body");
		return errorJson(400, "invalid_json", "Webhook body must be JSON");
	}

	const type = event.type || "";
	const object = event.data?.object;

	switch (type) {
		case "checkout.session.completed":
			return handleCheckoutSessionCompleted(env, object);
		case "invoice.paid":
			return handleMembershipInvoicePaid({
				env,
				invoice: (object || {}) as StripeInvoice,
			});
		case "invoice.payment_failed":
			return handleMembershipInvoicePaymentFailed({
				env,
				invoice: (object || {}) as StripeInvoice,
			});
		case "customer.subscription.updated":
			return handleMembershipSubscriptionUpdated({
				env,
				subscription: (object || {}) as StripeSubscription,
			});
		case "customer.subscription.deleted":
			return handleMembershipSubscriptionDeleted({
				env,
				subscription: (object || {}) as StripeSubscription,
			});
		default:
			return json({ received: true, ignored: true, reason: "unhandled_type" });
	}
}

async function handleCheckoutSessionCompleted(
	env: Env,
	object: Record<string, unknown> | undefined,
): Promise<Response> {
	const session = object as StripeCheckoutSession | undefined;
	if (!session) {
		return json({ received: true, ignored: true, reason: "no_object" });
	}

	const mode = session.mode;

	if (mode === "subscription") {
		return handleMembershipCheckoutCompleted({ env, session });
	}

	if (mode && mode !== "payment") {
		return json({ received: true, ignored: true, reason: "unsupported_mode" });
	}

	// —— one-time payment: tip / sanctuary (unchanged) ——
	if (session.payment_status && session.payment_status !== "paid") {
		return json({ received: true, ignored: true, reason: "not_paid" });
	}

	const product = session.metadata?.product || "tip";
	const emailRaw = emailFromCheckoutSession(session);
	if (!emailRaw) {
		console.warn(
			"[stripe-webhook] checkout.session.completed without email; session=",
			session.id,
		);
		return json({ received: true, ignored: true, reason: "missing_email" });
	}

	if (product === "sanctuary") {
		if (!env.SANCTUARY_KV) {
			return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
		}
		const email = normalizeSanctuaryEmail(emailRaw);
		await writeSanctuary(env.SANCTUARY_KV, email, {
			unlocked: true,
			unlockedAt: new Date().toISOString(),
			receiptId: typeof session.id === "string" ? session.id : "unknown",
			itemId: session.metadata?.itemId || "yin-sanctuary-lifetime",
		});
		return json({ received: true, stored: true, product: "sanctuary" });
	}

	if (product === "membership") {
		// Belongs on subscription Checkout; refuse to write tip by mistake.
		console.warn(
			"[stripe-webhook] membership metadata on payment-mode session; session=",
			session.id,
		);
		return json({
			received: true,
			ignored: true,
			reason: "membership_requires_subscription_mode",
		});
	}

	if (!env.TIP_KV) {
		return errorJson(503, "misconfigured", "TIP_KV not bound");
	}

	const email = normalizeTipEmail(emailRaw);
	const lastTippedAt = new Date().toISOString();
	const receiptId = typeof session.id === "string" ? session.id : "unknown";

	const existingRaw = await env.TIP_KV.get(`tip:${email}`);
	let tipCount = 1;
	if (existingRaw) {
		try {
			const prev = JSON.parse(existingRaw) as { tipCount?: number };
			const n = Number(prev.tipCount);
			if (Number.isFinite(n) && n > 0) tipCount = Math.floor(n) + 1;
		} catch {
			tipCount = 1;
		}
	}

	await writeTip(env.TIP_KV, email, {
		tipped: true,
		tipCount,
		lastTippedAt,
		receiptId,
	});

	return json({ received: true, stored: true, product: "tip" });
}
