import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	verifyStripeWebhookSignature,
	type StripeCheckoutSession,
} from "../lib/stripe";
import { normalizeEmail, writeSupporter } from "../lib/supporterKv";
import type { Env } from "../types";

type StripeEvent = {
	id?: string;
	type?: string;
	data?: {
		object?: StripeCheckoutSession & {
			payment_status?: string;
			mode?: string;
		};
	};
};

/**
 * POST /api/stripe-webhook
 * Raw body + Stripe-Signature → KV write on checkout.session.completed.
 */
export async function handleStripeWebhook(
	request: Request,
	env: Env,
): Promise<Response> {
	const webhookSecret = (env.STRIPE_WEBHOOK_SECRET || "").trim();
	if (!webhookSecret) {
		return errorJson(503, "misconfigured", "Webhook secret not configured");
	}
	if (!env.SUPPORTER_KV) {
		return errorJson(503, "misconfigured", "SUPPORTER_KV not bound");
	}

	const payload = await request.text();
	const signatureHeader = request.headers.get("stripe-signature");
	const ok = await verifyStripeWebhookSignature({
		payload,
		signatureHeader,
		webhookSecret,
	});
	if (!ok) {
		return errorJson(400, "invalid_signature", "Stripe signature verification failed");
	}

	let event: StripeEvent;
	try {
		event = JSON.parse(payload) as StripeEvent;
	} catch {
		return errorJson(400, "invalid_json", "Webhook body must be JSON");
	}

	if (event.type !== "checkout.session.completed") {
		return json({ received: true, ignored: true });
	}

	const session = event.data?.object;
	if (!session) {
		return json({ received: true, ignored: true, reason: "no_object" });
	}

	if (session.mode && session.mode !== "payment") {
		return json({ received: true, ignored: true, reason: "not_one_time" });
	}

	if (session.payment_status && session.payment_status !== "paid") {
		return json({ received: true, ignored: true, reason: "not_paid" });
	}

	const emailRaw = emailFromCheckoutSession(session);
	if (!emailRaw) {
		console.warn(
			"[stripe-webhook] checkout.session.completed without email; session=",
			session.id,
		);
		return json({ received: true, ignored: true, reason: "missing_email" });
	}

	const email = normalizeEmail(emailRaw);
	const purchasedAt = new Date().toISOString();
	const receiptId = typeof session.id === "string" ? session.id : "unknown";

	await writeSupporter(env.SUPPORTER_KV, email, {
		purchased: true,
		purchasedAt,
		receiptId,
	});

	return json({ received: true, stored: true });
}
