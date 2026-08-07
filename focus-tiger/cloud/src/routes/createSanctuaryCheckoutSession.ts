import { errorJson, json } from "../lib/http";
import { createSanctuaryCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/sanctuaryKv";
import type { Env } from "../types";

/**
 * POST /api/create-sanctuary-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string }
 *
 * Uses STRIPE_SANCTUARY_PRICE_ID + Sanctuary success/cancel URLs.
 * Never writes tip KV / tip price.
 */
export async function handleCreateSanctuaryCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const priceId = (env.STRIPE_SANCTUARY_PRICE_ID || "").trim();
	const successUrl = (env.SANCTUARY_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.SANCTUARY_CHECKOUT_CANCEL_URL || "").trim();

	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Sanctuary Checkout is not configured (missing Lifetime price or URLs)",
		);
	}

	let customerEmail: string | undefined;
	try {
		const body = (await request.json()) as { email?: unknown };
		if (typeof body?.email === "string" && body.email.trim()) {
			if (!isPlausibleEmail(body.email)) {
				return errorJson(400, "invalid_email", "email looks invalid");
			}
			customerEmail = normalizeEmail(body.email);
		}
	} catch {
		// Empty body OK.
	}

	try {
		const session = await createSanctuaryCheckoutSession({
			secretKey: secret,
			priceId,
			successUrl,
			cancelUrl,
			customerEmail,
		});
		return json({ url: session.url });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
