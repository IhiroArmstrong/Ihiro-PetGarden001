import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FOCUS_CIRCLE_MAX_MEMBERS } from "./focusCircleKv.ts";
import {
	applyWasHereMark,
	countHereTodayOthers,
	toLocalDayKey,
} from "./focusCircleWasHereKv.ts";

const MEMBER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MEMBER_C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const TZ = "America/Los_Angeles";

describe("focusCircleWasHereKv", () => {
	it("toLocalDayKey uses viewer timezone", () => {
		const ms = Date.parse("2026-09-07T06:30:00.000Z");
		assert.equal(toLocalDayKey(ms, TZ), "2026-09-06");
		assert.equal(toLocalDayKey(ms, "UTC"), "2026-09-07");
	});

	it("applyWasHereMark trims to FOCUS_CIRCLE_MAX_MEMBERS", () => {
		let members = {};
		for (let i = 0; i < FOCUS_CIRCLE_MAX_MEMBERS + 2; i += 1) {
			const id = `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`;
			members = applyWasHereMark(
				members,
				id,
				"2026-09-07",
				1_700_000_000_000 + i,
			);
		}
		assert.equal(Object.keys(members).length, FOCUS_CIRCLE_MAX_MEMBERS);
	});

	it("countHereTodayOthers excludes self and sitting members", () => {
		const now = Date.parse("2026-09-07T15:00:00.000Z");
		const dayKey = toLocalDayKey(now, TZ);
		const members = {
			[MEMBER_A]: { markedAtMs: now, markerDayKey: dayKey },
			[MEMBER_B]: { markedAtMs: now, markerDayKey: dayKey },
		};
		const sitting = {
			[MEMBER_B]: now + 60_000,
		};
		assert.equal(
			countHereTodayOthers(members, dayKey, TZ, MEMBER_A, sitting, now),
			0,
		);
		assert.equal(
			countHereTodayOthers(members, dayKey, TZ, MEMBER_C, {}, now),
			1,
		);
	});

	it("countHereTodayOthers clamps to boolean semantics", () => {
		const now = Date.parse("2026-09-07T15:00:00.000Z");
		const dayKey = toLocalDayKey(now, TZ);
		const members = {
			[MEMBER_A]: { markedAtMs: now, markerDayKey: dayKey },
			[MEMBER_B]: { markedAtMs: now, markerDayKey: dayKey },
		};
		assert.equal(
			countHereTodayOthers(members, dayKey, TZ, MEMBER_C, {}, now),
			1,
		);
	});
});
