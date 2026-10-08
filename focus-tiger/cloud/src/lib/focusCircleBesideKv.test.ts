import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	BESIDE_UNUSED_QUOTA,
	consumeBesideJoin,
	countUnusedBesideCodes,
	emptyBesideRecord,
	invitedWasHereToday,
	issueBesideCode,
	normalizeBesideCode,
	previewBesideJoin,
	revokeBesideCode,
	tryAddBesideMember,
} from "./focusCircleBesideKv.ts";
import { createFocusCircleRecord } from "./focusCircleKv.ts";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const C = "33333333-3333-4333-8333-333333333333";

describe("focusCircleBesideKv", () => {
	it("accepts 8-char codes and rejects the 6-char door code", () => {
		assert.equal(normalizeBesideCode("abcd2345"), "ABCD2345");
		assert.equal(normalizeBesideCode("ABCD23"), null);
		assert.equal(normalizeBesideCode("ABCD234O"), null);
	});

	it("allows five unused codes and consumes only a successful join", () => {
		let record = emptyBesideRecord();
		for (let i = 0; i < BESIDE_UNUSED_QUOTA; i += 1) {
			const issued = issueBesideCode(record, A, `ABCD234${i + 2}`, 10 + i);
			assert.equal(issued.ok, true);
			if (!issued.ok) return;
			record = issued.record;
		}
		assert.equal(issueBesideCode(record, A, "ABCD2349", 99).ok, false);
		assert.equal(countUnusedBesideCodes(record, A), 5);
		const circle = createFocusCircleRecord(A, "ABCD23", A, 1);
		assert.equal(previewBesideJoin(record, "ABCD2342", B, circle).ok, true);
		const consumed = consumeBesideJoin(record, "ABCD2342", B, 50);
		assert.equal(consumed.codes.ABCD2342.state, "consumed");
		assert.equal(previewBesideJoin(consumed, "ABCD2342", C, circle).reason, "used");
		assert.equal(countUnusedBesideCodes(consumed, A), 4);
		const revoked = revokeBesideCode(consumed, A, "ABCD2343");
		assert.equal(revoked.ok, true);
	});

	it("does not consume a code when the circle is full", () => {
		let circle = createFocusCircleRecord(A, "ABCD23", A, 1);
		for (let n = 0; n < 7; n += 1) {
			const id = `${n}0000000-0000-4000-8000-00000000000${n}`;
			circle = {
				...circle,
				members: { ...circle.members, [id]: { joinedAt: 2 } },
			};
		}
		assert.equal(Object.keys(circle.members).length, 8);
		const issued = issueBesideCode(emptyBesideRecord(), A, "ABCD2342", 10);
		assert.equal(issued.ok, true);
		if (!issued.ok) return;
		const added = tryAddBesideMember(circle, B, 20);
		assert.equal(added.ok, false);
		assert.equal(issued.record.codes.ABCD2342.state, "unused");
	});

	it("reports was-here for an invited member without listing several people", () => {
		const circle = createFocusCircleRecord(A, "ABCD23", A, 1);
		circle.members[B] = { joinedAt: 2 };
		circle.members[C] = { joinedAt: 3 };
		const record = emptyBesideRecord();
		record.invitees[B] = { inviterMemberId: A, joinedAt: 2, sawSittingOn: [] };
		record.invitees[C] = { inviterMemberId: A, joinedAt: 3, sawSittingOn: [] };
		const one = invitedWasHereToday({
			record,
			inviterMemberId: A,
			circle,
			wasHere: {
				[B]: {
					markedAtMs: Date.parse("2026-10-08T12:00:00Z"),
					markerDayKey: "2026-10-08",
				},
			},
			sitting: {},
			nowMs: Date.parse("2026-10-08T13:00:00Z"),
			viewerDayKey: "2026-10-08",
			viewerTimeZone: "UTC",
			nicknameOf: () => "Moss",
		});
		assert.equal(one.invitedWasHere, true);
		assert.equal(one.invitedWasHereName, "Moss");
		const many = invitedWasHereToday({
			record,
			inviterMemberId: A,
			circle,
			wasHere: {
				[B]: {
					markedAtMs: Date.parse("2026-10-08T12:00:00Z"),
					markerDayKey: "2026-10-08",
				},
				[C]: {
					markedAtMs: Date.parse("2026-10-08T12:30:00Z"),
					markerDayKey: "2026-10-08",
				},
			},
			sitting: {},
			nowMs: Date.parse("2026-10-08T13:00:00Z"),
			viewerDayKey: "2026-10-08",
			viewerTimeZone: "UTC",
			nicknameOf: () => "Moss",
		});
		assert.equal(many.invitedWasHere, true);
		assert.equal(many.invitedWasHereName, null);
	});
});
