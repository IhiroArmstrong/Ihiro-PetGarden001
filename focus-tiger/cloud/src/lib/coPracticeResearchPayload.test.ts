import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parseCoPracticeResearchPayload } from "./coPracticeResearchPayload.ts";

const here = dirname(fileURLToPath(import.meta.url));
const goldenPath = join(
	here,
	"../../../docs/research/research-payload.v1.golden.json",
);
const golden = JSON.parse(readFileSync(goldenPath, "utf8"));

describe("coPracticeResearchPayload", () => {
	it("accepts golden fixture", () => {
		const parsed = parseCoPracticeResearchPayload(golden);
		assert.equal(parsed.ok, true);
		if (!parsed.ok) return;
		assert.equal(parsed.dropped.length, 0);
		assert.equal(parsed.accepted.studyId, golden.studyId);
		assert.equal(
			parsed.accepted.t1.companion.chips.practice_compare,
			1,
		);
	});

	it("drops unknown top-level keys", () => {
		const parsed = parseCoPracticeResearchPayload({
			...golden,
			transcript: "must not store",
		});
		assert.equal(parsed.ok, true);
		if (!parsed.ok) return;
		assert.ok(parsed.dropped.includes("transcript"));
		assert.equal(
			(parsed.accepted as Record<string, unknown>).transcript,
			undefined,
		);
	});

	it("rejects out-of-range minutes", () => {
		const bad = structuredClone(golden);
		bad.t1.practice.sit.minutes = 999999;
		const parsed = parseCoPracticeResearchPayload(bad);
		assert.equal(parsed.ok, false);
	});

	it("rejects invalid studyId", () => {
		const bad = structuredClone(golden);
		bad.studyId = "not-uuid";
		const parsed = parseCoPracticeResearchPayload(bad);
		assert.equal(parsed.ok, false);
		if (parsed.ok) return;
		assert.equal(parsed.reason, "bad_study_id");
	});

	it("drops unknown companion chip keys", () => {
		const body = structuredClone(golden);
		body.t1.companion.chips.unknown_chip = 1;
		const parsed = parseCoPracticeResearchPayload(body);
		assert.equal(parsed.ok, true);
		if (!parsed.ok) return;
		assert.ok(
			parsed.dropped.some((d) => d.includes("unknown_chip")),
		);
		assert.equal(
			parsed.accepted.t1.companion.chips.unknown_chip,
			undefined,
		);
	});
});
