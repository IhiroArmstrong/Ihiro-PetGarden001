import { errorJson, json } from "../lib/http";
import { resolveSessionReturnUrls } from "../lib/checkoutReturnUrls";
import { createTipCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/tipKv";
import type { Env } from "../types";

/**
 * POST /api/create-tip-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string }
 */
export async function handleCreateTipCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const priceId = (env.STRIPE_PRICE_ID || "").trim();
	const successUrl = (env.CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.CHECKOUT_CANCEL_URL || "").trim();

	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Checkout is not configured (missing Stripe price or URLs)",
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
		// Empty / non-JSON body is fine — Checkout still collects email.
	}

	const returns = resolveSessionReturnUrls(successUrl, cancelUrl, parsedBody, request);

	try {
		const session = await createTipCheckoutSession({
			secretKey: secret,
			priceId,
			successUrl: returns.successUrl,
			cancelUrl: returns.cancelUrl,
			customerEmail,
		});
		return json({ url: session.url });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
