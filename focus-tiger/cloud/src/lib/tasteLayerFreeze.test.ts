import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	TASTE_HONESTY_LONG_MIN_MINUTES,
	TASTE_LAYER_SCHEMA_VERSION,
	TASTE_LIGHT_COMPLETE_POOL,
	TASTE_RISE_INTERRUPT_POOL,
	TASTE_WELCOME_POOL,
} from "./tasteLayerFreeze.ts";
import { tasteDailyWisdomPool } from "./tasteDailyWisdomFreeze.ts";

describe("taste-layer freeze tables", () => {
	it("locks schemaVersion 1 and Honesty 30", () => {
		assert.equal(TASTE_LAYER_SCHEMA_VERSION, 1);
		assert.equal(TASTE_HONESTY_LONG_MIN_MINUTES, 30);
	});

	it("locks Rise / welcome / light-complete freeze weights", () => {
		assert.deepEqual(
			TASTE_RISE_INTERRUPT_POOL.map((e) => [e.key, e.weight]),
			[
				["riseStretchCasual", 60],
				["teaDrinking", 25],
				["bookReading", 15],
			],
		);
		assert.deepEqual(
			TASTE_WELCOME_POOL.map((e) => [e.key, e.weight]),
			[
				["magicBookReading", 60],
				["nodGreeting", 40],
			],
		);
		assert.deepEqual(
			TASTE_LIGHT_COMPLETE_POOL.map((e) => [e.key, e.weight]),
			[
				["sessionComplete", 70],
				["mindfulAcknowledge", 30],
				["parrotEarVisit", 8],
			],
		);
	});

	it("daily-wisdom freeze has 14 aligned ids", () => {
		const en = tasteDailyWisdomPool("en");
		const ja = tasteDailyWisdomPool("ja");
		assert.equal(en.length, 14);
		assert.deepEqual(
			en.map((e) => e.id),
			ja.map((e) => e.id),
		);
		assert.equal(en[0].id, "catch-this-moment");
	});
});
