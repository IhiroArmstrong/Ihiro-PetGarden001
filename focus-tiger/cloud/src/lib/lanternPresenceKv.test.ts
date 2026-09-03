import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	LANTERN_PRESENCE_KV_KEY,
	LANTERN_PRESENCE_MAX_SESSIONS,
	applyLanternHeartbeat,
	applyLanternLeave,
	countLanternSessions,
	isLanternSessionId,
	parseLanternPresenceRecord,
	pruneLanternSessions,
} from "./lanternPresenceKv.ts";

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("lanternPresenceKv", () => {
	it("namespaces the live map away from tip:", () => {
		assert.equal(LANTERN_PRESENCE_KV_KEY.startsWith("tip:"), false);
		assert.equal(LANTERN_PRESENCE_KV_KEY.startsWith("lantern:"), true);
	});

	it("accepts UUID session ids only", () => {
		assert.equal(isLanternSessionId(A), true);
		assert.equal(isLanternSessionId("not-a-uuid"), false);
		assert.equal(isLanternSessionId(""), false);
	});

	it("prunes expired sits and counts live ones", () => {
		const now = 1_000_000;
		const sessions = { [A]: now + 10, [B]: now - 1 };
		assert.equal(countLanternSessions(sessions, now), 1);
		assert.deepEqual(pruneLanternSessions(sessions, now), { [A]: now + 10 });
	});

	it("heartbeat refreshes expiry; leave removes the seat", () => {
		const now = 5_000;
		let sessions = applyLanternHeartbeat({}, A, now, 100);
		assert.equal(sessions[A], 5_100);
		sessions = applyLanternLeave(sessions, A, now);
		assert.equal(sessions[A], undefined);
		assert.equal(countLanternSessions(sessions, now), 0);
	});

	it("caps the live map", () => {
		const now = 10;
		let sessions = {};
		for (let i = 0; i < LANTERN_PRESENCE_MAX_SESSIONS + 5; i += 1) {
			const hex = i.toString(16).padStart(12, "0");
			const id = `00000000-0000-4000-8000-${hex}`;
			sessions = applyLanternHeartbeat(sessions, id, now + i, 10_000);
		}
		assert.equal(
			Object.keys(sessions).length <= LANTERN_PRESENCE_MAX_SESSIONS,
			true,
		);
	});

	it("parses missing/corrupt KV as empty", () => {
		assert.deepEqual(parseLanternPresenceRecord(null).sessions, {});
		assert.deepEqual(parseLanternPresenceRecord("nope").sessions, {});
	});
});
