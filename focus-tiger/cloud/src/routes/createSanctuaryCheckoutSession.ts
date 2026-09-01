import { errorJson, json } from "../lib/http";
import { resolveSessionReturnUrls } from "../lib/checkoutReturnUrls";
import { createSanctuaryCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/sanctuaryKv";
import type { Env } from "../types";

/**
 * POST /api/create-sanctuary-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string, sessionId?: string }
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
	/** @type {unknown} */
	let parsedBody: unknown = null;
	try {
		parsedBody = await request.json();
		const body = parsedBody as { email?: unknown };
		if (typeof body?.email === "string" && body.email.trim()) {
			if (!isPlausibleEmail(body.email)) {
				return errorJson(400, "invalid_email", "email looks invalid");
			}
			customerEmail = normalizeEmail(body.email);
		}
	} catch {
		// Empty body OK.
	}

	const returns = resolveSessionReturnUrls(successUrl, cancelUrl, parsedBody, request);

	try {
		const session = await createSanctuaryCheckoutSession({
			secretKey: secret,
			priceId,
			successUrl: returns.successUrl,
			cancelUrl: returns.cancelUrl,
			customerEmail,
		});
		return json({ url: session.url, sessionId: session.id });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
