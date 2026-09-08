import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	applyIdentitySet,
	buildIdentityPeekMap,
	normalizeFocusCircleNickname,
} from "./focusCircleIdentityKv.ts";

const MEMBER_A = "11111111-1111-4111-8111-111111111111";
const MEMBER_B = "22222222-2222-4222-8222-222222222222";

describe("focusCircleIdentityKv", () => {
	it("normalizes nickname length and control chars", () => {
		assert.equal(normalizeFocusCircleNickname("  Kai  "), "Kai");
		assert.equal(normalizeFocusCircleNickname(""), null);
		assert.equal(normalizeFocusCircleNickname("a".repeat(17)), null);
		assert.equal(normalizeFocusCircleNickname("hi\u0007"), "hi");
	});

	it("applyIdentitySet clears row when empty", () => {
		const seeded = applyIdentitySet({}, MEMBER_A, "Kai", "tiger");
		const cleared = applyIdentitySet(seeded, MEMBER_A, null, null);
		assert.deepEqual(cleared, {});
	});

	it("buildIdentityPeekMap filters to circle members", () => {
		const members = applyIdentitySet({}, MEMBER_A, "Kai", "yin");
		const map = buildIdentityPeekMap(members, [MEMBER_A, MEMBER_B]);
		assert.deepEqual(map, {
			[MEMBER_A]: { nickname: "Kai", badgeKey: "yin" },
		});
	});
});
