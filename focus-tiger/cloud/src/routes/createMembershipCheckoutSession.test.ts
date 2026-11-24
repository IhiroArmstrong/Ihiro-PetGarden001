import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { handleCreateMembershipCheckoutSession } from "./createMembershipCheckoutSession.ts";
import type { Env } from "../types.ts";

function envBase(): Env {
	return {
		STRIPE_SECRET_KEY: "sk_test_x",
		STRIPE_MEMBERSHIP_PRICE_ID: "price_month_live",
		STRIPE_MEMBERSHIP_YEARLY_PRICE_ID: "price_REPLACE_YEARLY",
		MEMBERSHIP_CHECKOUT_SUCCESS_URL:
			"http://127.0.0.1:5173/?product=1&membership_session={CHECKOUT_SESSION_ID}",
		MEMBERSHIP_CHECKOUT_CANCEL_URL:
			"http://127.0.0.1:5173/?product=1&membership=cancel",
	} as Env;
}

describe("handleCreateMembershipCheckoutSession plan=yearly", { concurrency: false }, () => {
	const originalFetch = globalThis.fetch;
	const posted: { url?: string; body?: string } = {};

	before(() => {
		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			posted.url = String(input);
			posted.body = typeof init?.body === "string" ? init.body : "";
			return new Response(
				JSON.stringify({ id: "cs_test_yearly", url: "https://checkout.stripe.com/c/pay/cs_test_yearly" }),
				{ status: 200 },
			);
		}) as typeof fetch;
	});

	after(() => {
		globalThis.fetch = originalFetch;
	});

	it("omitted plan uses monthly price and monthly planId metadata", async () => {
		const res = await handleCreateMembershipCheckoutSession(
			new Request("https://example.com/api/create-membership-checkout-session", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({}),
			}),
			envBase(),
		);
		assert.equal(res.status, 200);
		assert.match(posted.body || "", /price_month_live/);
		assert.match(posted.body || "", /yin-membership-monthly/);
		assert.doesNotMatch(posted.body || "", /price_REPLACE_YEARLY/);
	});

	it("plan=yearly with placeholder price returns 503 (no Support CTA this knife)", async () => {
		const res = await handleCreateMembershipCheckoutSession(
			new Request("https://example.com/api/create-membership-checkout-session", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ plan: "yearly" }),
			}),
			envBase(),
		);
		assert.equal(res.status, 503);
		const body = (await res.json()) as { error?: string };
		assert.equal(body.error, "misconfigured");
	});

	it("plan=yearly uses yearly Price id from env, not a baked-in dollar amount", async () => {
		const res = await handleCreateMembershipCheckoutSession(
			new Request("https://example.com/api/create-membership-checkout-session", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ plan: "yearly" }),
			}),
			{
				...envBase(),
				STRIPE_MEMBERSHIP_YEARLY_PRICE_ID: "price_year_live",
			},
		);
		assert.equal(res.status, 200);
		assert.match(posted.body || "", /price_year_live/);
		assert.match(posted.body || "", /yin-membership-yearly/);
		assert.doesNotMatch(posted.body || "", /47\.99/);
	});
});
