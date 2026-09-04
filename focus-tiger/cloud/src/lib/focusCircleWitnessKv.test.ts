import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	FOCUS_CIRCLE_WITNESS_TTL_MS,
	applyWitnessLeave,
	applyWitnessRespond,
	buildWitnessPeekTraces,
	pruneWitnessTraces,
} from "./focusCircleWitnessKv.ts";

const MEMBER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const MEMBER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = 1_700_000_000_000;

describe("focusCircleWitnessKv", () => {
	it("leave and respond update traces", () => {
		let traces = applyWitnessLeave(
			[],
			MEMBER_A,
			"FOCUS_CIRCLE_WITNESS_LEAVE_1",
			"trace-1",
			NOW,
		);
		assert.equal(traces.length, 1);
		const responded = applyWitnessRespond(
			traces,
			"trace-1",
			MEMBER_B,
			"FOCUS_CIRCLE_WITNESS_RESPOND_1",
			NOW + 1000,
		);
		assert.equal(responded.outcome, "ok");
		assert.equal(responded.traces[0].respond?.phraseKey, "FOCUS_CIRCLE_WITNESS_RESPOND_1");
		const again = applyWitnessRespond(
			responded.traces,
			"trace-1",
			MEMBER_B,
			"FOCUS_CIRCLE_WITNESS_RESPOND_2",
			NOW + 2000,
		);
		assert.equal(again.outcome, "already_responded");
	});

	it("prunes expired traces", () => {
		const traces = [
			{
				traceId: "old",
				memberId: MEMBER_A,
				phraseKey: "FOCUS_CIRCLE_WITNESS_LEAVE_1",
				createdAt: NOW - FOCUS_CIRCLE_WITNESS_TTL_MS - 1,
			},
			{
				traceId: "fresh",
				memberId: MEMBER_B,
				phraseKey: "FOCUS_CIRCLE_WITNESS_LEAVE_2",
				createdAt: NOW,
			},
		];
		const pruned = pruneWitnessTraces(traces, NOW);
		assert.equal(pruned.length, 1);
		assert.equal(pruned[0].traceId, "fresh");
	});

	it("peek excludes self and maps respond state", () => {
		const traces = applyWitnessLeave(
			[],
			MEMBER_A,
			"FOCUS_CIRCLE_WITNESS_LEAVE_1",
			"trace-a",
			NOW,
		);
		const peekB = buildWitnessPeekTraces(traces, NOW, MEMBER_B);
		assert.equal(peekB.length, 1);
		assert.equal(peekB[0].hasResponded, false);
		const peekA = buildWitnessPeekTraces(traces, NOW, MEMBER_A);
		assert.equal(peekA.length, 0);
	});
});
