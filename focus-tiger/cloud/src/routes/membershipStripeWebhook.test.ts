import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { json } from "../lib/http.ts";
import {
	handleMembershipInvoicePaid,
	handleMembershipInvoicePaymentFailed,
	handleMembershipSubscriptionDeleted,
} from "./membershipStripeWebhook.ts";
import { withMembershipWebhookIdempotency } from "../lib/membershipWebhookIdempotency.ts";
import {
	membershipKvKey,
	parseMembershipRecord,
	readMembershipWebhookEvent,
	writeMembershipWebhookEvent,
	upsertActiveMembership,
} from "../lib/membershipKv.ts";
import type { Env } from "../types.ts";

function memoryKv() {
	const memory = new Map<string, string>();
	return {
		memory,
		kv: {
			put: async (key: string, value: string) => {
				memory.set(key, value);
			},
			get: async (key: string) => memory.get(key) ?? null,
			delete: async (key: string) => {
				memory.delete(key);
			},
		} as KVNamespace,
	};
}

const PERIOD_1 = 1_800_000_000;
/** Stripe Test Clock can land anywhere; this is not calendar +365d. */
const PERIOD_2 = 1_800_000_000 + 400 * 24 * 60 * 60;

describe("membership webhook period + Test Clock style renewals", () => {
	it("invoice.paid writes Stripe current_period_end, not now+365d", async () => {
		const { kv } = memoryKv();
		await upsertActiveMembership(kv, "ada@example.com", {
			active: true,
			periodEndsAt: new Date(PERIOD_1 * 1000).toISOString(),
			planId: "yin-membership-yearly",
			receiptId: "cs_orig",
			subscriptionId: "sub_year",
		});
		const originalFetch = globalThis.fetch;
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			assert.match(String(input), /\/v1\/subscriptions\/sub_year/);
			return new Response(
				JSON.stringify({
					id: "sub_year",
					status: "active",
					current_period_end: PERIOD_2,
					metadata: {
						product: "membership",
						planId: "yin-membership-yearly",
					},
				}),
				{ status: 200 },
			);
		}) as typeof fetch;
		try {
			const env = {
				MEMBERSHIP_KV: kv,
				STRIPE_SECRET_KEY: "sk_test_x",
			} as Env;
			const res = await handleMembershipInvoicePaid({
				env,
				invoice: {
					id: "in_renew",
					subscription: "sub_year",
					customer_email: "ada@example.com",
				},
			});
			assert.equal(res.status, 200);
			const saved = parseMembershipRecord(
				await kv.get(membershipKvKey("ada@example.com")),
			);
			assert.ok(saved);
			assert.equal(saved!.periodEndsAt, new Date(PERIOD_2 * 1000).toISOString());
			assert.equal(saved!.planId, "yin-membership-yearly");
			assert.equal(saved!.receiptId, "cs_orig");
			const plus365 = new Date(PERIOD_1 * 1000);
			plus365.setUTCFullYear(plus365.getUTCFullYear() + 1);
			assert.notEqual(saved!.periodEndsAt, plus365.toISOString());
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});

describe("membership webhook failure / cancel (Test Clock: fail + cancel)", () => {
	it("payment_failed stamps without changing periodEndsAt", async () => {
		const { kv } = memoryKv();
		const ends = "2027-01-01T00:00:00.000Z";
		await upsertActiveMembership(kv, "ada@example.com", {
			active: true,
			periodEndsAt: ends,
			planId: "yin-membership-yearly",
			receiptId: "cs_orig",
			subscriptionId: "sub_year",
		});
		const originalFetch = globalThis.fetch;
		globalThis.fetch = (async () =>
			new Response(
				JSON.stringify({
					id: "sub_year",
					status: "past_due",
					metadata: { product: "membership", planId: "yin-membership-yearly" },
				}),
				{ status: 200 },
			)) as typeof fetch;
		try {
			const res = await handleMembershipInvoicePaymentFailed({
				env: { MEMBERSHIP_KV: kv, STRIPE_SECRET_KEY: "sk_test_x" } as Env,
				invoice: {
					id: "in_fail",
					subscription: "sub_year",
					customer_email: "ada@example.com",
				},
			});
			assert.equal(res.status, 200);
			const saved = parseMembershipRecord(
				await kv.get(membershipKvKey("ada@example.com")),
			);
			assert.equal(saved!.periodEndsAt, ends);
			assert.ok(saved!.lastPaymentFailedAt);
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	it("subscription.deleted revokes the record", async () => {
		const { kv } = memoryKv();
		await upsertActiveMembership(kv, "ada@example.com", {
			active: true,
			periodEndsAt: "2027-01-01T00:00:00.000Z",
			planId: "yin-membership-yearly",
			receiptId: "cs_orig",
			subscriptionId: "sub_year",
		});
		const res = await handleMembershipSubscriptionDeleted({
			env: { MEMBERSHIP_KV: kv, STRIPE_SECRET_KEY: "sk_test_x" } as Env,
			subscription: {
				id: "sub_year",
				status: "canceled",
				metadata: { product: "membership" },
			},
		});
		assert.equal(res.status, 200);
		assert.equal(await kv.get(membershipKvKey("ada@example.com")), null);
	});
});

describe("membership webhook event idempotency", () => {
	it("second write of the same event id is a no-op marker", async () => {
		const { kv } = memoryKv();
		await writeMembershipWebhookEvent(kv, "evt_dup");
		assert.equal(await readMembershipWebhookEvent(kv, "evt_dup"), "1");
		await writeMembershipWebhookEvent(kv, "evt_dup");
		assert.equal(await readMembershipWebhookEvent(kv, "evt_dup"), "1");
	});

	it("duplicate Stripe event id does not run the handler again", async () => {
		const { kv } = memoryKv();
		const env = { MEMBERSHIP_KV: kv } as Env;
		let runs = 0;
		const first = await withMembershipWebhookIdempotency(env, "evt_paid_1", async () => {
			runs += 1;
			return json({ received: true, stored: true });
		});
		const second = await withMembershipWebhookIdempotency(env, "evt_paid_1", async () => {
			runs += 1;
			return json({ received: true, stored: true });
		});
		assert.equal(first.status, 200);
		assert.equal(second.status, 200);
		assert.equal(runs, 1);
		const dup = (await second.json()) as { duplicate?: boolean };
		assert.equal(dup.duplicate, true);
	});
});
