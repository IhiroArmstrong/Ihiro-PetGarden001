import test from "node:test";
import assert from "node:assert/strict";
import { pngHasReceipt, stampPngReceipt } from "./pngBuyerMark.ts";

const TINY_PNG = Uint8Array.from(
	Buffer.from(
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
		"base64",
	),
);

test("receipt mark sits in file info and leaves the PNG signature", () => {
	const marked = stampPngReceipt(TINY_PNG, "cs_test_paid");
	assert.ok(marked);
	assert.equal(marked[0], 137);
	assert.equal(pngHasReceipt(marked, "cs_test_paid"), true);
	assert.equal(pngHasReceipt(TINY_PNG, "cs_test_paid"), false);
	assert.equal(marked.length > TINY_PNG.length, true);
});

test("refuses a non-png", () => {
	assert.equal(stampPngReceipt(new Uint8Array([1, 2, 3]), "cs_test_paid"), null);
});
