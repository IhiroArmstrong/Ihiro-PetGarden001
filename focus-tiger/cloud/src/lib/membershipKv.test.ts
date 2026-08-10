/**
 * Pure-contract unit tests for Membership KV entitlement window + parse.
 * Run: npm test (in focus-tiger/cloud)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	MEMBERSHIP_GRACE_MS,
	MEMBERSHIP_PLAN_ID,
	isMembershipWithinVerifyWindow,
	membershipKvKey,
	membershipSubKvKey,
	parseMembershipRecord,
} from "./membershipKv.ts";

describe("MEMBERSHIP_GRACE_MS", () => {
	it("is 7 days in ms (aligned with client ENTITLEMENT_GRACE_MS)", () => {
		assert.equal(MEMBERSHIP_GRACE_MS, 7 * 24 * 60 * 60 * 1000);
	});
});

describe("isMembershipWithinVerifyWindow", () => {
	const periodEnds = "2026-08-01T00:00:00.000Z";
	const endsMs = Date.parse(periodEnds);

	it("entitles while inside billed period", () => {
		assert.equal(
			isMembershipWithinVerifyWindow(periodEnds, endsMs - 60_000),
			true,
		);
	});

	it("entitles during post-expiry grace", () => {
		assert.equal(
			isMembershipWithinVerifyWindow(
				periodEnds,
				endsMs + MEMBERSHIP_GRACE_MS - 1000,
			),
			true,
		);
	});

	it("denies after grace exhausted (blocks infinite verify refresh)", () => {
		assert.equal(
			isMembershipWithinVerifyWindow(
				periodEnds,
				endsMs + MEMBERSHIP_GRACE_MS + 1000,
			),
			false,
		);
	});

	it("denies invalid periodEndsAt", () => {
		assert.equal(isMembershipWithinVerifyWindow("not-a-date", Date.now()), false);
	});
});

describe("parseMembershipRecord", () => {
	it("parses active record and optional lastPaymentFailedAt", () => {
		const raw = JSON.stringify({
			active: true,
			periodEndsAt: "2026-09-01T00:00:00.000Z",
			planId: MEMBERSHIP_PLAN_ID,
			receiptId: "cs_test",
			subscriptionId: "sub_test",
			lastPaymentFailedAt: "2026-08-10T12:00:00.000Z",
		});
		const r = parseMembershipRecord(raw);
		assert.ok(r);
		assert.equal(r!.active, true);
		assert.equal(r!.receiptId, "cs_test");
		assert.equal(r!.lastPaymentFailedAt, "2026-08-10T12:00:00.000Z");
	});

	it("rejects active !== true (no tombstone path)", () => {
		assert.equal(
			parseMembershipRecord(
				JSON.stringify({
					active: false,
					periodEndsAt: "2026-09-01T00:00:00.000Z",
					receiptId: "cs_x",
					subscriptionId: "sub_x",
				}),
			),
			null,
		);
	});
});

describe("KV key helpers", () => {
	it("normalizes membership and sub-index keys", () => {
		assert.equal(membershipKvKey("  Ada@Example.COM "), "membership:ada@example.com");
		assert.equal(membershipSubKvKey("sub_abc"), "membership-sub:sub_abc");
	});
});
