import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { funnelKvKey } from "../lib/monetizationFunnelKv.ts";

describe("monetizationFunnelKv", () => {
	it("namespaces funnel keys away from tip:", () => {
		const key = funnelKvKey("2026-08-12", "abc-123-uuid");
		assert.equal(key, "funnel:v1:2026-08-12:abc-123-uuid");
		assert.equal(key.startsWith("tip:"), false);
	});
});
