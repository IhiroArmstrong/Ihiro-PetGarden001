import test from "node:test";
import assert from "node:assert/strict";
import {
	grantArtPiece,
	indexArtCollectionPurchase,
	parseArtCollectionRecord,
} from "../lib/artCollectionKv.ts";
import { handleArtCollectionChargeRefunded } from "../routes/artCollectionStripeWebhook.ts";

test("charge.refunded revokes ownership via charge index", async () => {
	const memory = new Map<string, string>();
	const kv = {
		put: async (key: string, value: string) => {
			memory.set(key, value);
		},
		get: async (key: string) => memory.get(key) ?? null,
	} as KVNamespace;

	const record = grantArtPiece(
		{ items: {} },
		"celadon-taotie-gu",
		"2026-10-03T00:00:00.000Z",
		"cs_test_a",
	);
	await kv.put("art-collection:buyer@example.com", JSON.stringify(record));
	await indexArtCollectionPurchase(kv, {
		email: "buyer@example.com",
		artId: "celadon-taotie-gu",
		receiptId: "cs_test_a",
		chargeId: "ch_test_a",
	});

	const response = await handleArtCollectionChargeRefunded(
		{ SANCTUARY_KV: kv } as import("../types.ts").Env,
		{ id: "ch_test_a", metadata: { product: "art-collection", artId: "celadon-taotie-gu" } },
	);
	assert.equal(response.status, 200);
	const body = (await response.json()) as { stored?: boolean; via?: string };
	assert.equal(body.stored, true);
	assert.equal(body.via, "charge_index");

	const saved = parseArtCollectionRecord(
		await kv.get("art-collection:buyer@example.com"),
	);
	assert.ok(saved.items["celadon-taotie-gu"]?.revokedAt);
});

test("charge.refunded ignores non-art charges", async () => {
	const kv = {
		get: async () => null,
	} as KVNamespace;
	const response = await handleArtCollectionChargeRefunded(
		{ SANCTUARY_KV: kv } as import("../types.ts").Env,
		{ id: "ch_tip", metadata: { product: "tip" } },
	);
	const body = (await response.json()) as { ignored?: boolean };
	assert.equal(body.ignored, true);
});
