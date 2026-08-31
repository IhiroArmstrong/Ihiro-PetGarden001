import { errorJson, json } from "../lib/http";
import { resolveSessionReturnUrls } from "../lib/checkoutReturnUrls";
import { createMembershipCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/membershipKv";
import type { Env } from "../types";

/**
 * POST /api/create-membership-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string }
 *
 * Uses STRIPE_MEMBERSHIP_PRICE_ID + Membership success/cancel URLs.
 * mode: subscription (never tip / sanctuary payment prices).
 */
export async function handleCreateMembershipCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const priceId = (env.STRIPE_MEMBERSHIP_PRICE_ID || "").trim();
	const successUrl = (env.MEMBERSHIP_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.MEMBERSHIP_CHECKOUT_CANCEL_URL || "").trim();

	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Membership Checkout is not configured (missing subscription price or URLs)",
		);
	}
	if (priceId.includes("REPLACE")) {
		return errorJson(
			503,
			"misconfigured",
			"STRIPE_MEMBERSHIP_PRICE_ID still placeholder — set Dashboard recurring Price id",
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
		// Empty body OK — Checkout still collects email.
	}

	const returns = resolveSessionReturnUrls(successUrl, cancelUrl, parsedBody, request);

	try {
		const session = await createMembershipCheckoutSession({
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
