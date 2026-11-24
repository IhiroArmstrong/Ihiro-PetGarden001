import { errorJson, json } from "../lib/http.ts";
import { resolveSessionReturnUrls } from "../lib/checkoutReturnUrls.ts";
import { createMembershipCheckoutSession } from "../lib/stripe.ts";
import { isPlausibleEmail, normalizeEmail } from "../lib/membershipKv.ts";
import {
	canonicalPlanIdForCheckoutPlan,
	isPlaceholderStripePriceId,
	membershipPriceIdForPlan,
	parseMembershipCheckoutPlan,
} from "../lib/membershipPlanId.ts";
import type { Env } from "../types.ts";

/**
 * POST /api/create-membership-checkout-session
 * Body: optional { email?: string, plan?: "monthly" | "yearly" }
 * Omitted plan = monthly (Support main CTA unchanged this knife).
 * Returns: { url: string, sessionId?: string }
 *
 * Price ids from env only — never bake card display amounts into Checkout.
 */
export async function handleCreateMembershipCheckoutSession(
	request: Request,
	env: Env,
): Promise<Response> {
	const secret = (env.STRIPE_SECRET_KEY || "").trim();
	const successUrl = (env.MEMBERSHIP_CHECKOUT_SUCCESS_URL || "").trim();
	const cancelUrl = (env.MEMBERSHIP_CHECKOUT_CANCEL_URL || "").trim();

	let customerEmail: string | undefined;
	/** @type {unknown} */
	let parsedBody: unknown = null;
	let planRaw: unknown;
	try {
		parsedBody = await request.json();
		const body = parsedBody as { email?: unknown; plan?: unknown };
		planRaw = body?.plan;
		if (typeof body?.email === "string" && body.email.trim()) {
			if (!isPlausibleEmail(body.email)) {
				return errorJson(400, "invalid_email", "email looks invalid");
			}
			customerEmail = normalizeEmail(body.email);
		}
	} catch {
		// Empty body OK — Checkout still collects email. plan defaults monthly.
	}

	const plan = parseMembershipCheckoutPlan(planRaw);
	if (plan === "invalid") {
		return errorJson(400, "invalid_plan", "plan must be monthly or yearly");
	}

	const priceId = membershipPriceIdForPlan(env, plan);
	if (!secret || !priceId || !successUrl || !cancelUrl) {
		return errorJson(
			503,
			"misconfigured",
			plan === "yearly"
				? "Yearly Membership Checkout is not configured (missing STRIPE_MEMBERSHIP_YEARLY_PRICE_ID or URLs)"
				: "Membership Checkout is not configured (missing subscription price or URLs)",
		);
	}
	if (isPlaceholderStripePriceId(priceId)) {
		return errorJson(
			503,
			"misconfigured",
			plan === "yearly"
				? "STRIPE_MEMBERSHIP_YEARLY_PRICE_ID still placeholder — set Dashboard yearly Price id"
				: "STRIPE_MEMBERSHIP_PRICE_ID still placeholder — set Dashboard recurring Price id",
		);
	}

	const returns = resolveSessionReturnUrls(successUrl, cancelUrl, parsedBody, request);
	const planId = canonicalPlanIdForCheckoutPlan(plan);

	try {
		const session = await createMembershipCheckoutSession({
			secretKey: secret,
			priceId,
			successUrl: returns.successUrl,
			cancelUrl: returns.cancelUrl,
			customerEmail,
			planId,
		});
		return json({ url: session.url, sessionId: session.id });
	} catch (err) {
		const detail = err instanceof Error ? err.message : "checkout_failed";
		return errorJson(502, "stripe_error", detail);
	}
}
