import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	YPE_ALGORITHM_VERSION,
	YPE_MIN_SAMPLE_COMPLETIONS,
	assembleYpeProfileRecord,
	computePatternInsightsV2,
	issuePersonalizationPackV2,
	normalizeStoredAlgorithmVersion,
	sanitizeYpeSignalsV1,
} from "./ypePersonalizationAlgorithm.ts";

function baseSignals(over = {}) {
	return sanitizeYpeSignalsV1({
		focus_return_rate: 0.5,
		reflection_frequency: 0.2,
		companion_style_preference: "quiet",
		intervention_preference: "low",
		practice_day_count_window: 20,
		...over,
	});
}

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
		const signals = baseSignals();
		assert.ok(signals);
		const pack = issuePersonalizationPackV2({
			signals,
			windowCompletionCount: YPE_MIN_SAMPLE_COMPLETIONS - 1,
		});
		assert.equal(pack, null);
	});

	it("echoes companion style and never retunes it from rates", () => {
		const signals = baseSignals({
			focus_return_rate: 0.9,
			reflection_frequency: 0.9,
			companion_style_preference: "quiet",
		});
		assert.ok(signals);
		const pack = issuePersonalizationPackV2({
			signals,
			windowCompletionCount: YPE_MIN_SAMPLE_COMPLETIONS,
			previousPackVersion: 4,
			now: new Date("2026-08-26T12:00:00Z"),
		});
		assert.ok(pack);
		assert.equal(pack.packVersion, 5);
		assert.equal(pack.companionStyle, "quiet");
		assert.equal("algorithmVersion" in pack, false);
		assert.equal(YPE_ALGORITHM_VERSION, 2);
	});

	it("emits whitelist tokens at V2 thresholds, freeze-table order", () => {
		const signals = baseSignals({
			focus_return_rate: 0.6,
			reflection_frequency: 0.39,
		});
		assert.ok(signals);
		assert.deepEqual(computePatternInsightsV2(signals), ["returns_often"]);
		const reflects = baseSignals({
			focus_return_rate: 0.59,
			reflection_frequency: 0.4,
		});
		assert.ok(reflects);
		assert.deepEqual(computePatternInsightsV2(reflects), ["reflects_often"]);
		const both = baseSignals({
			focus_return_rate: 0.6,
			reflection_frequency: 0.4,
		});
		assert.ok(both);
		assert.deepEqual(computePatternInsightsV2(both), [
			"returns_often",
			"reflects_often",
		]);
		const none = baseSignals({
			focus_return_rate: 0.59,
			reflection_frequency: 0.39,
		});
		assert.ok(none);
		assert.deepEqual(computePatternInsightsV2(none), []);
	});

	it("stores algorithmVersion on the profile row, never on the Pack", () => {
		const signals = baseSignals({
			focus_return_rate: 0.7,
			reflection_frequency: 0.5,
		});
		assert.ok(signals);
		const pack = issuePersonalizationPackV2({
			signals,
			windowCompletionCount: YPE_MIN_SAMPLE_COMPLETIONS,
			now: new Date("2026-09-02T00:00:00.000Z"),
		});
		assert.ok(pack);
		const record = assembleYpeProfileRecord({
			ypeProfileId: "profile-abcdefgh",
			signals,
			pack,
			previousPackVersion: 0,
			now: new Date("2026-09-02T00:00:00.000Z"),
		});
		assert.equal(record.algorithmVersion, YPE_ALGORITHM_VERSION);
		assert.equal("algorithmVersion" in pack, false);
		assert.deepEqual(pack.patternInsights, ["returns_often", "reflects_often"]);
		assert.equal(normalizeStoredAlgorithmVersion(undefined), 1);
		assert.equal(normalizeStoredAlgorithmVersion(2), 2);
	});
});
