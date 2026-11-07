import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	isCoPracticeResearchStudyId,
	parseBearerStudyId,
} from "./coPracticeResearchStudyId.ts";

describe("coPracticeResearchStudyId", () => {
	it("accepts UUIDv4", () => {
		assert.equal(
			isCoPracticeResearchStudyId("9b1f2c7e-0000-4000-8000-000000000000"),
			true,
		);
	});

	it("rejects UUIDv1", () => {
		assert.equal(
			isCoPracticeResearchStudyId("9b1f2c7e-0000-1000-8000-000000000000"),
			false,
		);
	});

	it("parseBearerStudyId from Authorization", () => {
		const req = new Request("https://example.test/x", {
			headers: {
				authorization: "Bearer 9b1f2c7e-0000-4000-8000-000000000000",
			},
		});
		assert.equal(
			parseBearerStudyId(req),
			"9b1f2c7e-0000-4000-8000-000000000000",
		);
	});

	it("parseBearerStudyId rejects bad token", () => {
		const req = new Request("https://example.test/x", {
			headers: { authorization: "Bearer not-a-uuid" },
		});
		assert.equal(parseBearerStudyId(req), null);
	});
});
