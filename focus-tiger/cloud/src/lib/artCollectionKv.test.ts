import test from "node:test";
import assert from "node:assert/strict";
import {
	emptyArtCollectionRecord,
	grantArtPiece,
	parseArtCollectionRecord,
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
