import test from "node:test";
import assert from "node:assert/strict";
import { grantArtPiece, writeArtCollection } from "./artCollectionKv.ts";
import { artHdObjectKey, artHdTarget, issueOwnedArtDownloads } from "./artCollectionHdGrant.ts";

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

test("ge crackle file names are real object keys", () => {
	assert.equal(artHdObjectKey("hd-g1-01"), "private/art-hd/hd-g1-01.png");
	assert.equal(artHdObjectKey("hd-g2-05"), "private/art-hd/hd-g2-05.png");
	assert.equal(artHdObjectKey("hd-rf-01"), "private/art-hd/hd-rf-01.png");
});

test("a bought set grants one file per sheet, owned on the set", async () => {
	const kv = memoryKv();
	const owned = grantArtPiece(
		{ items: {} },
		"celadon-relief-five",
		"2026-10-11T00:00:00.000Z",
		"cs_test_set",
	);
	await writeArtCollection(kv, "buyer@example.com", owned);
	assert.equal(artHdTarget("celadon-relief-dragon-gu")?.ownerId, "celadon-relief-five");
	assert.equal(artHdTarget("celadon-relief-dragon-gu")?.hdId, "hd-rf-01");
	const downloads = await issueOwnedArtDownloads({
		kv,
		pepper: "pepper",
		email: "buyer@example.com",
		artId: "celadon-relief-five",
		receiptId: "cs_test_set",
	});
	assert.equal(downloads.length, 5);
	assert.equal(downloads[0].artId, "celadon-relief-dragon-gu");
	assert.match(downloads[0].url, /\/api\/art-collection-hd\?t=/);
});
