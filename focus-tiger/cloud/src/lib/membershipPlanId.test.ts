import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	MEMBERSHIP_PLAN_ID,
	MEMBERSHIP_PLAN_ID_MONTHLY,
	MEMBERSHIP_PLAN_ID_YEARLY,
	canonicalPlanIdForCheckoutPlan,
	isPlaceholderStripePriceId,
	membershipPriceIdForPlan,
	normalizeMembershipPlanId,
	parseMembershipCheckoutPlan,
} from "./membershipPlanId.ts";

describe("normalizeMembershipPlanId", () => {
	it("treats legacy yin-membership as monthly", () => {
		assert.equal(normalizeMembershipPlanId(MEMBERSHIP_PLAN_ID), MEMBERSHIP_PLAN_ID_MONTHLY);
		assert.equal(normalizeMembershipPlanId("yin-membership"), MEMBERSHIP_PLAN_ID_MONTHLY);
		assert.equal(normalizeMembershipPlanId(""), MEMBERSHIP_PLAN_ID_MONTHLY);
		assert.equal(normalizeMembershipPlanId(null), MEMBERSHIP_PLAN_ID_MONTHLY);
	});

	it("maps yearly aliases", () => {
		assert.equal(
			normalizeMembershipPlanId("yin-membership-yearly"),
			MEMBERSHIP_PLAN_ID_YEARLY,
		);
		assert.equal(normalizeMembershipPlanId("YEARLY"), MEMBERSHIP_PLAN_ID_YEARLY);
	});
});

describe("parseMembershipCheckoutPlan", () => {
	it("defaults omitted plan to monthly (Support CTA still monthly)", () => {
		assert.equal(parseMembershipCheckoutPlan(undefined), "monthly");
		assert.equal(parseMembershipCheckoutPlan(""), "monthly");
		assert.equal(parseMembershipCheckoutPlan("monthly"), "monthly");
		assert.equal(parseMembershipCheckoutPlan("yearly"), "yearly");
		assert.equal(parseMembershipCheckoutPlan("year"), "invalid");
		assert.equal(canonicalPlanIdForCheckoutPlan("yearly"), MEMBERSHIP_PLAN_ID_YEARLY);
	});
});

describe("membershipPriceIdForPlan", () => {
	it("does not bake display prices into checkout", () => {
		assert.equal(
			membershipPriceIdForPlan(
				{
					STRIPE_MEMBERSHIP_PRICE_ID: "price_month",
					STRIPE_MEMBERSHIP_YEARLY_PRICE_ID: "price_year",
				},
				"yearly",
			),
			"price_year",
		);
		assert.equal(isPlaceholderStripePriceId("price_REPLACE_YEARLY"), true);
		assert.equal(isPlaceholderStripePriceId("price_1abc"), false);
	});
});
