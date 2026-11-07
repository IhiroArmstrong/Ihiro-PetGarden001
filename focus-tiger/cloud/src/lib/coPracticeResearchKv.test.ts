import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	coPracticeResearchRowKey,
	coPracticeResearchStudyPrefix,
	parseCoPracticeResearchRowKey,
} from "./coPracticeResearchKv.ts";

describe("coPracticeResearchKv", () => {
	it("row key round-trips", () => {
		const studyId = "9b1f2c7e-0000-4000-8000-000000000000";
		const week = "2026-W46";
		const key = coPracticeResearchRowKey(studyId, week);
		assert.equal(key, "cpr:v1:9b1f2c7e-0000-4000-8000-000000000000:2026-W46");
		const parsed = parseCoPracticeResearchRowKey(key);
		assert.deepEqual(parsed, { studyId, week });
	});

	it("study prefix for list", () => {
		const studyId = "9b1f2c7e-0000-4000-8000-000000000000";
		assert.equal(
			coPracticeResearchStudyPrefix(studyId),
			"cpr:v1:9b1f2c7e-0000-4000-8000-000000000000:",
		);
	});
});
