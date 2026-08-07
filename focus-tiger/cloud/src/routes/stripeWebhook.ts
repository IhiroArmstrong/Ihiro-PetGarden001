import { errorJson, json } from "../lib/http";
import {
	emailFromCheckoutSession,
	verifyStripeWebhookSignature,
	type StripeCheckoutSession,
} from "../lib/stripe";
import { normalizeEmail as normalizeTipEmail, writeTip } from "../lib/tipKv";
import {
	normalizeEmail as normalizeSanctuaryEmail,
	writeSanctuary,
} from "../lib/sanctuaryKv";
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
 * Branches on metadata.product: tip → TIP_KV, sanctuary → SANCTUARY_KV.
 * Missing metadata defaults to tip (legacy tip sessions before metadata).
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
