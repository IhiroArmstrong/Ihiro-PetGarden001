import { errorJson, json } from "../lib/http";
import {
	isDesktopReturnSurface,
	resolveCheckoutReturnUrl,
} from "../lib/checkoutReturnUrls";
import { createCompanionAddonCheckoutSession } from "../lib/stripe";
import { isPlausibleEmail, normalizeEmail } from "../lib/companionAddonKv";
import type { Env } from "../types";

/**
 * POST /api/create-companion-addon-checkout-session
 * Body: optional { email?: string }
 * Returns: { url: string }
 */
export async function handleCreateCompanionAddonCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const priceId = (env.STRIPE_COMPANION_ADDON_PRICE_ID || "").trim();
	const successUrl = (env.COMPANION_ADDON_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.COMPANION_ADDON_CHECKOUT_CANCEL_URL || "").trim();

	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			"Companion add-on Checkout is not configured (missing price or URLs)",
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
		const session = await createCompanionAddonCheckoutSession({
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
