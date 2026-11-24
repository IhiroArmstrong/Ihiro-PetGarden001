/**
 * Membership planId read layer (monthly + yearly).
 * All KV / confirm / webhook / checkout metadata must go through
 * `normalizeMembershipPlanId` — do not scatter aliases.
 *
 * Legacy stored value `yin-membership` = monthly.
 */

export const MEMBERSHIP_PLAN_ID_LEGACY = "yin-membership";
/** Kept for existing imports; same as legacy monthly. */
export const MEMBERSHIP_PLAN_ID = MEMBERSHIP_PLAN_ID_LEGACY;

export const MEMBERSHIP_PLAN_ID_MONTHLY = "yin-membership-monthly";
export const MEMBERSHIP_PLAN_ID_YEARLY = "yin-membership-yearly";

export type MembershipCheckoutPlan = "monthly" | "yearly";

export function normalizeMembershipPlanId(raw: unknown): string {
	if (typeof raw !== "string") return MEMBERSHIP_PLAN_ID_MONTHLY;
	const id = raw.trim().toLowerCase();
	if (!id) return MEMBERSHIP_PLAN_ID_MONTHLY;
	if (
		id === MEMBERSHIP_PLAN_ID_YEARLY ||
		id === "yearly" ||
		id === "year"
	) {
		return MEMBERSHIP_PLAN_ID_YEARLY;
	}
	return MEMBERSHIP_PLAN_ID_MONTHLY;
}

export function parseMembershipCheckoutPlan(
	raw: unknown,
): MembershipCheckoutPlan | "invalid" {
	if (raw == null) return "monthly";
	if (typeof raw !== "string") return "invalid";
	const plan = raw.trim().toLowerCase();
	if (!plan) return "monthly";
	if (plan === "monthly") return "monthly";
	if (plan === "yearly") return "yearly";
	return "invalid";
}

export function canonicalPlanIdForCheckoutPlan(
	plan: MembershipCheckoutPlan,
): string {
	return plan === "yearly"
		? MEMBERSHIP_PLAN_ID_YEARLY
		: MEMBERSHIP_PLAN_ID_MONTHLY;
}

export function isPlaceholderStripePriceId(priceId: string): boolean {
	const id = (priceId || "").trim();
	return !id || id.includes("REPLACE");
}

export function membershipPriceIdForPlan(
	env: {
		STRIPE_MEMBERSHIP_PRICE_ID?: string;
		STRIPE_MEMBERSHIP_YEARLY_PRICE_ID?: string;
	},
	plan: MembershipCheckoutPlan,
): string {
	if (plan === "yearly") {
		return (env.STRIPE_MEMBERSHIP_YEARLY_PRICE_ID || "").trim();
	}
	return (env.STRIPE_MEMBERSHIP_PRICE_ID || "").trim();
}
