import { errorJson, json } from "../lib/http.ts";
import { ART_COLLECTION_PRODUCT } from "../lib/artCollectionCatalog.ts";
import {
	applyArtCollectionRevoke,
	artCollectionChargeIndexKey,
	parseArtCollectionPurchaseIndex,
} from "../lib/artCollectionKv.ts";
import {
	emailFromCheckoutSession,
	paymentIntentIdFromCharge,
	retrieveCheckoutSessionByPaymentIntent,
	type StripeCharge,
} from "../lib/stripe.ts";
import type { Env } from "../types.ts";

/**
 * Stripe charge.refunded for Yin's Art Collection one-time purchases.
 * Keeps the purchase row with revokedAt; stops future HD entitlement.
 */
export async function handleArtCollectionChargeRefunded(
	env: Env,
	charge: StripeCharge | undefined,
): Promise<Response> {
	if (!charge?.id?.startsWith("ch_")) {
		return json({ received: true, ignored: true, reason: "no_charge" });
	}
	if (!env.SANCTUARY_KV) {
		return errorJson(503, "misconfigured", "SANCTUARY_KV not bound");
	}

	const revokedAt = new Date().toISOString();
	const chargeId = charge.id;

	const chargeIndexRaw = await env.SANCTUARY_KV.get(
		artCollectionChargeIndexKey(chargeId),
	);
	const chargeIndex = parseArtCollectionPurchaseIndex(chargeIndexRaw);
	if (chargeIndex) {
		const result = await applyArtCollectionRevoke(env.SANCTUARY_KV, {
			email: chargeIndex.email,
			artId: chargeIndex.artId,
			receiptId: chargeIndex.receiptId,
			revokedAt,
		});
		if (result.stored) {
			return json({
				received: true,
				stored: true,
				product: ART_COLLECTION_PRODUCT,
				via: "charge_index",
			});
		}
	}

	const meta = charge.metadata;
	if (meta?.product === ART_COLLECTION_PRODUCT && meta.artId) {
		const secret = (env.STRIPE_SECRET_KEY || "").trim();
		const paymentIntentId = paymentIntentIdFromCharge(charge);
		if (secret && paymentIntentId) {
			try {
				const session = await retrieveCheckoutSessionByPaymentIntent({
					secretKey: secret,
					paymentIntentId,
				});
				const emailRaw = session ? emailFromCheckoutSession(session) : null;
				if (emailRaw) {
					const result = await applyArtCollectionRevoke(env.SANCTUARY_KV, {
						email: emailRaw,
						artId: meta.artId,
						receiptId:
							typeof session?.id === "string" ? session.id : undefined,
						revokedAt,
					});
					if (result.stored) {
						return json({
							received: true,
							stored: true,
							product: ART_COLLECTION_PRODUCT,
							via: "checkout_session_lookup",
						});
					}
				}
			} catch (err) {
				console.error("[stripe-webhook] art-collection refund lookup failed", {
					chargeId,
					detail: err instanceof Error ? err.message : "lookup_failed",
				});
			}
		}
	}

	return json({
		received: true,
		ignored: true,
		reason: "art_collection_refund_not_matched",
	});
}
