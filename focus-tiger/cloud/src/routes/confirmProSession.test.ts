import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const source = readFileSync(
	path.join(path.dirname(fileURLToPath(import.meta.url)), "confirmProSession.ts"),
	"utf8",
);

describe("confirmProSession · T87-D customer-visible copy", () => {
	it("uses Samatia Pro in the wrong-session error (not Focus Tiger Pro)", () => {
		assert.doesNotMatch(source, /Focus Tiger Pro purchase/);
		assert.match(source, /Session is not a Samatia Pro purchase/);
	});
});
