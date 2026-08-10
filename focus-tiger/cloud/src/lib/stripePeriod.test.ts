import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { periodEndsAtFromSubscription } from "./stripe.ts";

describe("periodEndsAtFromSubscription", () => {
	it("uses top-level current_period_end when present (pre-Basil)", () => {
		const iso = periodEndsAtFromSubscription({
			id: "sub_legacy",
			current_period_end: 1_700_000_000,
		});
		assert.equal(iso, new Date(1_700_000_000 * 1000).toISOString());
	});

	it("reads items.data[].current_period_end when top-level missing (Basil+ / dahlia)", () => {
		const iso = periodEndsAtFromSubscription({
			id: "sub_basil",
			items: {
				data: [
					{ id: "si_a", current_period_end: 1_780_000_000 },
					{ id: "si_b", current_period_end: 1_790_000_000 },
				],
			},
		});
		assert.equal(iso, new Date(1_790_000_000 * 1000).toISOString());
	});

	it("prefers top-level over items when both exist", () => {
		const iso = periodEndsAtFromSubscription({
			id: "sub_both",
			current_period_end: 1_700_000_000,
			items: {
				data: [{ current_period_end: 1_900_000_000 }],
			},
		});
		assert.equal(iso, new Date(1_700_000_000 * 1000).toISOString());
	});

	it("returns null when neither top-level nor items have a period end", () => {
		assert.equal(
			periodEndsAtFromSubscription({
				id: "sub_empty",
				items: { data: [{ id: "si_x", price: { id: "price_x" } }] },
			}),
			null,
		);
		assert.equal(periodEndsAtFromSubscription({ id: "sub_bare" }), null);
	});
});
