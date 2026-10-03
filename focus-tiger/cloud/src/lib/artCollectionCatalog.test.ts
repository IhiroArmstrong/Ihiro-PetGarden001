import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
	ART_COLLECTION_UNIT_AMOUNT,
	ART_COLLECTION_WORKS,
	findArtCollectionWork,
} from "./artCollectionCatalog.ts";

const clientCatalog = readFileSync(
	join(dirname(fileURLToPath(import.meta.url)), "../../../src/core/artCollectionCatalog.js"),
	"utf8",
);

test("charges the 22 client sheets at $1.99 and refuses the old five", () => {
	assert.equal(ART_COLLECTION_WORKS.length, 22);
	const ids = ART_COLLECTION_WORKS.map((row) => row.id);
	assert.equal(new Set(ids).size, 22);
	for (const row of ART_COLLECTION_WORKS) {
		assert.equal(row.unitAmount, ART_COLLECTION_UNIT_AMOUNT);
		assert.equal(ART_COLLECTION_UNIT_AMOUNT, 199);
		assert.match(clientCatalog, new RegExp(`'${row.id}'`));
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
