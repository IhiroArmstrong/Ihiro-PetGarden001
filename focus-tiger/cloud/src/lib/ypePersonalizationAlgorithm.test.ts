import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	YPE_MIN_SAMPLE_COMPLETIONS,
	issuePersonalizationPackV1,
	sanitizeYpeSignalsV1,
} from "./ypePersonalizationAlgorithm.ts";

describe("ypePersonalizationAlgorithm", () => {
	it("sanitizes five H.3 keys only", () => {
		const signals = sanitizeYpeSignalsV1({
			focus_return_rate: 1.2,
			reflection_frequency: -0.1,
			companion_style_preference: "warm",
			intervention_preference: "medium",
			practice_day_count_window: 12,
			extra: "drop",
		});
		assert.ok(signals);
		assert.equal(signals.focus_return_rate, 1);
		assert.equal(signals.reflection_frequency, 0);
		assert.equal(signals.companion_style_preference, "warm");
	});

	it("does not issue pack below sample gate", () => {
		const signals = sanitizeYpeSignalsV1({
			focus_return_rate: 0.8,
			reflection_frequency: 0.2,
			companion_style_preference: "default",
			intervention_preference: "medium",
			practice_day_count_window: 3,
		});
		assert.ok(signals);
		const pack = issuePersonalizationPackV1({
			signals,
			windowCompletionCount: YPE_MIN_SAMPLE_COMPLETIONS - 1,
		});
		assert.equal(pack, null);
	});

	it("echoes companion style and keeps patternInsights empty", () => {
		const signals = sanitizeYpeSignalsV1({
			focus_return_rate: 0.8,
			reflection_frequency: 0.2,
			companion_style_preference: "quiet",
			intervention_preference: "low",
			practice_day_count_window: 20,
		});
		assert.ok(signals);
		const pack = issuePersonalizationPackV1({
			signals,
			windowCompletionCount: YPE_MIN_SAMPLE_COMPLETIONS,
			previousPackVersion: 4,
			now: new Date("2026-08-26T12:00:00Z"),
		});
		assert.ok(pack);
		assert.equal(pack.packVersion, 5);
		assert.equal(pack.companionStyle, "quiet");
		assert.deepEqual(pack.patternInsights, []);
	});
});
