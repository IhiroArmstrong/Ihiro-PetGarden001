import test from "node:test";
import assert from "node:assert/strict";
import { grantArtPiece, revokeArtPiece, writeArtCollection } from "../lib/artCollectionKv.ts";
import { issueArtHdGrant, issueTeaGiftHdGrant } from "../lib/artCollectionHdGrant.ts";
import { writeTip } from "../lib/tipKv.ts";
import { pngHasReceipt } from "../lib/pngBuyerMark.ts";
import { handleGetArtCollectionHd } from "./getArtCollectionHd.ts";

const TINY_PNG = Uint8Array.from(
	Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
		"base64",
	),
);

function memoryKv() {
	const memory = new Map<string, string>();
	return {
		put: async (key: string, value: string) => {
			memory.set(key, value);
		},
		get: async (key: string) => memory.get(key) ?? null,
		delete: async (key: string) => {
			memory.delete(key);
		},
	} as KVNamespace;
}

test("a paid grant downloads once and carries the receipt", async () => {
	const kv = memoryKv();
	const owned = grantArtPiece(
		{ items: {} },
		"celadon-taotie-gu",
		"2026-10-08T00:00:00.000Z",
		"cs_test_paid",
	);
	await writeArtCollection(kv, "buyer@example.com", owned);
	const grant = await issueArtHdGrant({
		kv,
		pepper: "pepper",
		email: "buyer@example.com",
		artId: "celadon-taotie-gu",
		receiptId: "cs_test_paid",
	});
	assert.ok(grant);
	const bucket = {
		get: async (key: string) => {
			assert.equal(key, "private/art-hd/hd-sp-01.png");
			return { arrayBuffer: async () => TINY_PNG.buffer.slice(0) };
		},
	} as unknown as R2Bucket;
	const first = await handleGetArtCollectionHd(
		new Request(`https://cloud.test${grant.url}`),
		{
			SANCTUARY_KV: kv,
			RESTORE_OTP_PEPPER: "pepper",
			ART_COLLECTION_HD: bucket,
		} as never,
	);
	assert.equal(first.status, 200);
	const bytes = new Uint8Array(await first.arrayBuffer());
	assert.equal(pngHasReceipt(bytes, "cs_test_paid"), true);
	const second = await handleGetArtCollectionHd(
		new Request(`https://cloud.test${grant.url}`),
		{
			SANCTUARY_KV: kv,
			RESTORE_OTP_PEPPER: "pepper",
			ART_COLLECTION_HD: bucket,
		} as never,
	);
	assert.equal(second.status, 403);
});

test("local ownership is not enough, and a refund stops a new file", async () => {
	const kv = memoryKv();
	const missing = await issueArtHdGrant({
		kv,
		pepper: "pepper",
		email: "buyer@example.com",
		artId: "celadon-taotie-gu",
		receiptId: "cs_test_paid",
	});
	assert.equal(missing, null);

	const owned = grantArtPiece(
		{ items: {} },
		"celadon-taotie-gu",
		"2026-10-08T00:00:00.000Z",
		"cs_test_paid",
	);
	await writeArtCollection(kv, "buyer@example.com", owned);
	const grant = await issueArtHdGrant({
		kv,
		pepper: "pepper",
		email: "buyer@example.com",
		artId: "celadon-taotie-gu",
		receiptId: "cs_test_paid",
	});
	assert.ok(grant);
	await writeArtCollection(
		kv,
		"buyer@example.com",
		revokeArtPiece(owned, "celadon-taotie-gu", "2026-10-08T01:00:00.000Z"),
	);
	const denied = await handleGetArtCollectionHd(
		new Request(`https://cloud.test${grant.url}`),
		{ SANCTUARY_KV: kv, RESTORE_OTP_PEPPER: "pepper" } as never,
	);
	assert.equal(denied.status, 403);
});

test("a verified tea gift downloads hd-tg-01 and stops after a refund clears the tip", async () => {
	const kv = memoryKv();
	const tipKv = memoryKv();
	await writeTip(tipKv, "tea@example.com", {
		tipped: true,
		tipCount: 1,
		lastTippedAt: "2026-10-09T00:00:00.000Z",
		receiptId: "cs_test_tea",
	});
	const grant = await issueTeaGiftHdGrant({
		kv,
		tipKv,
		pepper: "pepper",
		email: "tea@example.com",
	});
	assert.ok(grant);
	assert.equal(grant?.artId, "gold-duck-yi");
	const bucket = {
		get: async (key: string) => {
			assert.equal(key, "private/art-hd/hd-tg-01.png");
			return { arrayBuffer: async () => TINY_PNG.buffer.slice(0) };
		},
	} as unknown as R2Bucket;
	const ok = await handleGetArtCollectionHd(
		new Request(`https://cloud.test${grant?.url}`),
		{
			SANCTUARY_KV: kv,
			TIP_KV: tipKv,
			RESTORE_OTP_PEPPER: "pepper",
			ART_COLLECTION_HD: bucket,
		} as never,
	);
	assert.equal(ok.status, 200);
	await tipKv.delete("tip:tea@example.com");
	const again = await issueTeaGiftHdGrant({
		kv,
		tipKv,
		pepper: "pepper",
		email: "tea@example.com",
	});
	assert.equal(again, null);
});
