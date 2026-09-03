import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	FOCUS_CIRCLE_MAX_MEMBERS,
	addFocusCircleMember,
	countFocusCircleMembers,
	createFocusCircleRecord,
	generateFocusCircleCode,
	normalizeFocusCircleCode,
	parseFocusCircleRecord,
	removeFocusCircleMember,
} from "./focusCircleKv.ts";

const CREATOR = "11111111-1111-4111-8111-111111111111";
const MEMBER2 = "22222222-2222-4222-8222-222222222222";

describe("focusCircleKv", () => {
	it("normalizes 6-char codes", () => {
		assert.equal(normalizeFocusCircleCode(" abcd23 "), "ABCD23");
		assert.equal(normalizeFocusCircleCode("ABC12"), null);
		assert.equal(normalizeFocusCircleCode("ABC12O"), null);
	});

	it("creates and counts members", () => {
		const record = createFocusCircleRecord(
			CREATOR,
			"ABCD23",
			CREATOR,
			1_000,
		);
		assert.equal(countFocusCircleMembers(record), 1);
		const added = addFocusCircleMember(record, MEMBER2, 2_000);
		assert.equal(added.ok, true);
		if (!added.ok) return;
		assert.equal(countFocusCircleMembers(added.record), 2);
	});

	it("rejects join when full", () => {
		let record = createFocusCircleRecord(CREATOR, "ABCD23", CREATOR, 1);
		for (let i = 0; i < FOCUS_CIRCLE_MAX_MEMBERS - 1; i += 1) {
			const id = `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`;
			const next = addFocusCircleMember(record, id, i + 2);
			assert.equal(next.ok, true);
			if (!next.ok) return;
			record = next.record;
		}
		assert.equal(countFocusCircleMembers(record), FOCUS_CIRCLE_MAX_MEMBERS);
		const full = addFocusCircleMember(
			record,
			"44444444-4444-4444-8444-444444444444",
			99,
		);
		assert.equal(full.ok, false);
		if (full.ok) return;
		assert.equal(full.reason, "full");
	});

	it("removes members and deletes empty circle", () => {
		const record = createFocusCircleRecord(CREATOR, "ABCD23", CREATOR, 1);
		const added = addFocusCircleMember(record, MEMBER2, 2);
		assert.equal(added.ok, true);
		if (!added.ok) return;
		const oneLeft = removeFocusCircleMember(added.record, MEMBER2);
		assert.ok(oneLeft);
		assert.equal(countFocusCircleMembers(oneLeft), 1);
		const empty = removeFocusCircleMember(oneLeft, CREATOR);
		assert.equal(empty, null);
	});

	it("round-trips JSON records", () => {
		const record = createFocusCircleRecord(CREATOR, "ABCD23", CREATOR, 1);
		const parsed = parseFocusCircleRecord(JSON.stringify(record));
		assert.ok(parsed);
		assert.equal(parsed.code, "ABCD23");
		assert.equal(countFocusCircleMembers(parsed), 1);
	});

	it("generates fixed-length codes", () => {
		let i = 0;
		const code = generateFocusCircleCode(() => i++ % 32);
		assert.equal(code.length, 6);
	});
});
