import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	FOCUS_CIRCLE_PRESENCE_TTL_MS,
	applyCirclePresenceHeartbeat,
	applyCirclePresenceLeave,
	countCircleSittingSessions,
	pruneCircleSittingSessions,
} from "./focusCirclePresenceKv.ts";

const MEMBER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MEMBER_C = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const NOW = 1_700_000_000_000;

describe("focusCirclePresenceKv", () => {
	it("heartbeat and leave update sessions", () => {
		let sessions = applyCirclePresenceHeartbeat({}, MEMBER_A, NOW);
		assert.equal(Object.keys(sessions).length, 1);
		sessions = applyCirclePresenceHeartbeat(sessions, MEMBER_B, NOW);
		assert.equal(Object.keys(sessions).length, 2);
		sessions = applyCirclePresenceLeave(sessions, MEMBER_A, NOW);
		assert.equal(Object.keys(sessions).length, 1);
		assert.ok(sessions[MEMBER_B]);
	});

	it("prunes expired sessions", () => {
		const sessions = {
			[MEMBER_A]: NOW - 1,
			[MEMBER_B]: NOW + FOCUS_CIRCLE_PRESENCE_TTL_MS,
		};
		const pruned = pruneCircleSittingSessions(sessions, NOW);
		assert.equal(Object.keys(pruned).length, 1);
		assert.ok(pruned[MEMBER_B]);
	});

	it("countCircleSittingSessions excludes self", () => {
		const sessions = applyCirclePresenceHeartbeat(
			applyCirclePresenceHeartbeat({}, MEMBER_A, NOW),
			MEMBER_B,
			NOW,
		);
		assert.equal(countCircleSittingSessions(sessions, NOW, MEMBER_A), 1);
		assert.equal(countCircleSittingSessions(sessions, NOW, MEMBER_B), 1);
		assert.equal(countCircleSittingSessions(sessions, NOW), 2);
	});

	it("countCircleSittingSessions ignores expired", () => {
		const sessions = {
			[MEMBER_A]: NOW - 1,
			[MEMBER_B]: NOW + FOCUS_CIRCLE_PRESENCE_TTL_MS,
			[MEMBER_C]: NOW + FOCUS_CIRCLE_PRESENCE_TTL_MS,
		};
		assert.equal(countCircleSittingSessions(sessions, NOW, MEMBER_A), 2);
	});
});
