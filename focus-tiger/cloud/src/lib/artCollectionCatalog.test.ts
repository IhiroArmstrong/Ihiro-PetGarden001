import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
	ART_COLLECTION_UNIT_AMOUNT,
	ART_COLLECTION_WORKS,
	findArtCollectionWork,
	findArtForSale,
} from "./artCollectionCatalog.ts";
import { decideEditionSale } from "./artEditionCatalog.ts";

const clientCatalog = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), "../../../src/core/artCollectionCatalog.js"),
	"utf8",
);

test("charges the 25 client sheets at $1.99 and refuses the old five", () => {
	assert.equal(ART_COLLECTION_WORKS.length, 25);
	const ids = ART_COLLECTION_WORKS.map((row) => row.id);
	assert.equal(new Set(ids).size, 25);
	for (const row of ART_COLLECTION_WORKS) {
		assert.equal(row.unitAmount, ART_COLLECTION_UNIT_AMOUNT);
		assert.equal(ART_COLLECTION_UNIT_AMOUNT, 199);
		assert.match(clientCatalog, new RegExp(`'${row.id}'`));
		assert.match(row.hdId, /^hd-[a-z]{2}-\d{2}$/);
		assert.match(clientCatalog, new RegExp(`'${row.hdId}'`));
		assert.match(clientCatalog, new RegExp(`'${row.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`));
	}
	for (const id of [
		"moonlit-celadon-jar",
		"amber-phoenix-ewer",
		"amber-hu-vase",
		"gold-inlaid-ge",
		"pale-jade-ding",
	]) {
		assert.equal(findArtCollectionWork(id), null);
		assert.equal(clientCatalog.includes(`'${id}'`), false);
	}
	for (const id of ["celadon-garlic-mouth-ring-bottle", "ge-dragon-handle-he"]) {
		assert.equal(findArtCollectionWork(id), null);
	}
});

test("new checkout sells the five-piece edition and not a single sheet", () => {
	const set = findArtForSale("celadon-relief-five");
	assert.ok(set);
	assert.equal(set?.unitAmount, 995);
	assert.equal(findArtForSale("celadon-taotie-gu"), null);
	assert.equal(findArtForSale("celadon-relief-dragon-gu"), null);
	assert.equal(decideEditionSale(99, 100).ok, true);
	assert.equal(decideEditionSale(100, 100).ok, false);
});
