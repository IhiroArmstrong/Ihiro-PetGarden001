import { errorJson, json } from "../lib/http";
import {
	isDesktopReturnSurface,
	resolveCheckoutReturnUrl,
} from "../lib/checkoutReturnUrls";
import { createProCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/membershipKv";
import type { Env } from "../types";

/**
 * POST /api/create-pro-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string }
 */
export async function handleCreateProCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const priceId = (env.STRIPE_PRO_PRICE_ID || "").trim();
	const successUrl = (env.PRO_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.PRO_CHECKOUT_CANCEL_URL || "").trim();

	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Pro Checkout is not configured (missing subscription price or URLs)",
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

	const returnSurface = isDesktopReturnSurface(parsedBody) ? "desktop" : undefined;
	const bridgeOrigin = new URL(request.url).origin;

	try {
		const session = await createProCheckoutSession({
			secretKey: secret,
			priceId,
			successUrl: resolveCheckoutReturnUrl(successUrl, returnSurface, bridgeOrigin),
			cancelUrl: resolveCheckoutReturnUrl(cancelUrl, returnSurface, bridgeOrigin),
			customerEmail,
		});
		return json({ url: session.url, sessionId: session.id });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
