/**
 * Stripe webhook signature verify — reject reasons (no silent fail).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyStripeWebhookSignatureDetailed } from "./stripe.ts";

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
	return [...new Uint8Array(sig)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

describe("verifyStripeWebhookSignatureDetailed", () => {
	it("rejects missing header", async () => {
		const r = await verifyStripeWebhookSignatureDetailed({
			payload: "{}",
			signatureHeader: null,
			webhookSecret: "whsec_test",
		});
		assert.equal(r.ok, false);
		if (!r.ok) assert.equal(r.reason, "missing_header");
	});

	it("rejects bad signature", async () => {
		const t = Math.floor(Date.now() / 1000);
		const r = await verifyStripeWebhookSignatureDetailed({
			payload: "{}",
			signatureHeader: `t=${t},v1=${"ab".repeat(32)}`,
			webhookSecret: "whsec_test",
			nowSec: t,
		});
		assert.equal(r.ok, false);
		if (!r.ok) assert.equal(r.reason, "bad_signature");
	});

	it("rejects timestamp out of tolerance", async () => {
		const t = Math.floor(Date.now() / 1000) - 10_000;
		const signedPayload = `${t}.{}`;
		const v1 = await hmacSha256Hex("whsec_test", signedPayload);
		const r = await verifyStripeWebhookSignatureDetailed({
			payload: "{}",
			signatureHeader: `t=${t},v1=${v1}`,
			webhookSecret: "whsec_test",
			nowSec: Math.floor(Date.now() / 1000),
		});
		assert.equal(r.ok, false);
		if (!r.ok) assert.equal(r.reason, "timestamp_out_of_tolerance");
	});

	it("accepts valid signature within tolerance", async () => {
		const t = Math.floor(Date.now() / 1000);
		const payload = '{"id":"evt_test"}';
		const v1 = await hmacSha256Hex("whsec_test", `${t}.${payload}`);
		const r = await verifyStripeWebhookSignatureDetailed({
			payload,
			signatureHeader: `t=${t},v1=${v1}`,
			webhookSecret: "whsec_test",
			nowSec: t,
		});
		assert.equal(r.ok, true);
	});
});
