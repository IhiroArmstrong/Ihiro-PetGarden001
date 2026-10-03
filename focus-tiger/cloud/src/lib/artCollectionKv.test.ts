import test from "node:test";
import assert from "node:assert/strict";
import {
	applyArtCollectionRevoke,
	artCollectionHasPieces,
	emptyArtCollectionRecord,
	grantArtPiece,
	indexArtCollectionPurchase,
	isArtPieceOwned,
	parseArtCollectionPurchaseIndex,
	parseArtCollectionRecord,
	revokeArtPiece,
} from "./artCollectionKv.ts";

test("grant keeps the first owned date and ignores off-shelf ids", () => {
	const first = grantArtPiece(
		emptyArtCollectionRecord(),
		"pale-jade-ding",
		"2026-10-03T00:00:00.000Z",
		"cs_test_a",
	);
	const again = grantArtPiece(
		first,
		"pale-jade-ding",
		"2026-11-01T00:00:00.000Z",
		"cs_test_b",
	);
	assert.equal(again.items["pale-jade-ding"]?.receiptId, "cs_test_a");
	const stray = grantArtPiece(
		again,
		"jun-glaze-saddled-horse",
		"2026-10-03T00:00:00.000Z",
		"cs_test_c",
	);
	assert.equal(stray.items["jun-glaze-saddled-horse"], undefined);
	const parsed = parseArtCollectionRecord(JSON.stringify(stray));
	assert.deepEqual(Object.keys(parsed.items), ["pale-jade-ding"]);
});

test("revoke keeps the purchase row and stops active ownership", () => {
	const owned = grantArtPiece(
		emptyArtCollectionRecord(),
		"pale-jade-ding",
		"2026-10-03T00:00:00.000Z",
		"cs_test_a",
	);
	const revoked = revokeArtPiece(
		owned,
		"pale-jade-ding",
		"2026-10-04T00:00:00.000Z",
		"cs_test_a",
	);
	assert.equal(revoked.items["pale-jade-ding"]?.revokedAt, "2026-10-04T00:00:00.000Z");
	assert.equal(isArtPieceOwned(revoked, "pale-jade-ding"), false);
	assert.equal(artCollectionHasPieces(revoked), false);
	const repurchased = grantArtPiece(
		revoked,
		"pale-jade-ding",
		"2026-10-05T00:00:00.000Z",
		"cs_test_b",
	);
	assert.equal(repurchased.items["pale-jade-ding"]?.receiptId, "cs_test_b");
	assert.equal(repurchased.items["pale-jade-ding"]?.revokedAt, undefined);
	assert.equal(isArtPieceOwned(repurchased, "pale-jade-ding"), true);
});

test("purchase index round-trips receipt and charge keys", async () => {
	const memory = new Map<string, string>();
	const kv = {
		put: async (key: string, value: string) => {
			memory.set(key, value);
		},
		get: async (key: string) => memory.get(key) ?? null,
	} as KVNamespace;

	await indexArtCollectionPurchase(kv, {
		email: "Buyer@Example.com",
		artId: "pale-jade-ding",
		receiptId: "cs_test_a",
		chargeId: "ch_test_a",
	});
	const owned = grantArtPiece(
		emptyArtCollectionRecord(),
		"pale-jade-ding",
		"2026-10-03T00:00:00.000Z",
		"cs_test_a",
	);
	await kv.put("art-collection:buyer@example.com", JSON.stringify(owned));

	const chargeIndex = parseArtCollectionPurchaseIndex(
		await kv.get("art-collection-charge:ch_test_a"),
	);
	assert.deepEqual(chargeIndex, {
		email: "buyer@example.com",
		artId: "pale-jade-ding",
		receiptId: "cs_test_a",
	});

	const result = await applyArtCollectionRevoke(kv, {
		email: "buyer@example.com",
		artId: "pale-jade-ding",
		receiptId: "cs_test_a",
		revokedAt: "2026-10-04T00:00:00.000Z",
	});
	assert.equal(result.stored, true);
	const record = parseArtCollectionRecord(
		await kv.get("art-collection:buyer@example.com"),
	);
	assert.equal(record.items["pale-jade-ding"]?.revokedAt, "2026-10-04T00:00:00.000Z");
});
