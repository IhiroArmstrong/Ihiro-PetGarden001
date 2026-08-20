import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	funnelKvKey,
	isAllowedFunnelCountKey,
	parseFunnelLayout,
} from "../lib/monetizationFunnelKv.ts";

describe("monetizationFunnelKv", () => {
	it("namespaces funnel keys away from tip:", () => {
		const key = funnelKvKey("2026-08-12", "abc-123-uuid");
		assert.equal(key, "funnel:v1:2026-08-12:abc-123-uuid");
		assert.equal(key.startsWith("tip:"), false);
	});

	it("allows layout count keys and rejects unknown suffixes", () => {
		assert.equal(isAllowedFunnelCountKey("support_open"), true);
		assert.equal(isAllowedFunnelCountKey("support_open:tea-first"), true);
		assert.equal(isAllowedFunnelCountKey("support_cta:tea"), true);
		assert.equal(isAllowedFunnelCountKey("support_cta:tea:tea-first"), true);
		assert.equal(isAllowedFunnelCountKey("support_cta:tea:hack"), false);
		assert.equal(isAllowedFunnelCountKey("evil:tea"), false);
		assert.equal(parseFunnelLayout("sanctuary-first"), "sanctuary-first");
		assert.equal(parseFunnelLayout("tea"), null);
	});
});
