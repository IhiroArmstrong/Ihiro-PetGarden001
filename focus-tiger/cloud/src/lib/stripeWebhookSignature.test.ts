/**
 * Node:test coverage for Stripe webhook signature reject reasons.
 * Run: cd focus-tiger/cloud && npx --yes tsx --test src/lib/stripeWebhookSignature.test.ts
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import {
	STRIPE_WEBHOOK_TOLERANCE_SEC,
	verifyStripeWebhookSignature,
} from "./stripe";

function sign(secret: string, t: string, payload: string): string {
	return createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
}

describe("verifyStripeWebhookSignature reject reasons", () => {
	const secret = "whsec_test_secret";
	const payload = '{"id":"evt_1"}';
	const nowSec = 1_700_000_000;

	it("missing_header when Stripe-Signature absent", async () => {
		const r = await verifyStripeWebhookSignature({
			payload,
			signatureHeader: null,
			webhookSecret: secret,
			nowSec,
		});
		assert.deepEqual(r, { ok: false, reason: "missing_header" });
	});

	it("malformed_header when header has no t/v1", async () => {
		const r = await verifyStripeWebhookSignature({
			payload,
			signatureHeader: "not-a-stripe-sig",
			webhookSecret: secret,
			nowSec,
		});
		assert.deepEqual(r, { ok: false, reason: "malformed_header" });
	});

	it("timestamp_expired when outside tolerance", async () => {
		const t = String(nowSec - STRIPE_WEBHOOK_TOLERANCE_SEC - 1);
		const v1 = sign(secret, t, payload);
		const r = await verifyStripeWebhookSignature({
			payload,
			signatureHeader: `t=${t},v1=${v1}`,
			webhookSecret: secret,
			nowSec,
		});
		assert.deepEqual(r, { ok: false, reason: "timestamp_expired" });
	});

	it("hmac_mismatch when signature wrong", async () => {
		const t = String(nowSec);
		const r = await verifyStripeWebhookSignature({
			payload,
			signatureHeader: `t=${t},v1=${"0".repeat(64)}`,
			webhookSecret: secret,
			nowSec,
		});
		assert.deepEqual(r, { ok: false, reason: "hmac_mismatch" });
	});

	it("ok when signature matches within tolerance", async () => {
		const t = String(nowSec);
		const v1 = sign(secret, t, payload);
		const r = await verifyStripeWebhookSignature({
			payload,
			signatureHeader: `t=${t},v1=${v1}`,
			webhookSecret: secret,
			nowSec,
		});
		assert.deepEqual(r, { ok: true });
	});
});
