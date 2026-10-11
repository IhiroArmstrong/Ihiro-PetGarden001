import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	FOCUS_CIRCLE_ONLINE_TTL_MS,
	applyCircleOnlineHeartbeat,
	applyCircleOnlineLeave,
	circleOnlineKvKey,
	countCircleOnline,
} from "./focusCircleOnlineKv.ts";

const MEMBER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const NOW = 1_700_000_000_000;

describe("focusCircleOnlineKv", () => {
	it("counts a heartbeat and drops it on leave or after the TTL", () => {
		assert.equal(circleOnlineKvKey("abc").startsWith("circle:v1:online:"), true);
		const sessions = applyCircleOnlineHeartbeat({}, MEMBER, NOW);
		assert.equal(countCircleOnline(sessions, NOW + 1), 1);
		assert.equal(countCircleOnline(sessions, NOW + FOCUS_CIRCLE_ONLINE_TTL_MS + 1), 0);
		const left = applyCircleOnlineLeave(sessions, MEMBER, NOW + 1);
		assert.equal(countCircleOnline(left, NOW + 1), 0);
	});
});
