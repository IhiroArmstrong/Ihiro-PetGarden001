import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	TASTE_HONESTY_LONG_MIN_MINUTES,
	TASTE_LAYER_SCHEMA_VERSION,
} from "./tasteLayerFreeze.ts";
import {
	parseTasteLayerConfigRecord,
	readTasteLayerConfig,
	tasteLayerConfigFreeze,
} from "./tasteLayerConfigKv.ts";

const FREEZE_JSON = JSON.stringify(tasteLayerConfigFreeze());

describe("tasteLayerConfigKv", () => {
	it("parses schema 1 with valid pools and Honesty threshold", () => {
		assert.deepEqual(parseTasteLayerConfigRecord(FREEZE_JSON), {
			schemaVersion: 1,
			riseInterruptPool: [
				{ key: "riseStretchCasual", weight: 60 },
				{ key: "teaDrinking", weight: 25 },
				{ key: "bookReading", weight: 15 },
			],
			welcomePool: [
				{ key: "magicBookReading", weight: 60 },
				{ key: "nodGreeting", weight: 40 },
			],
			lightCompletePool: [
				{ key: "sessionComplete", weight: 70 },
				{ key: "mindfulAcknowledge", weight: 30 },
				{ key: "parrotEarVisit", weight: 8 },
			],
			honestyLongMinMinutes: 30,
		});
	});

	it("accepts forked Honesty threshold within 1–180", () => {
		const forked = JSON.parse(FREEZE_JSON) as Record<string, unknown>;
		forked.honestyLongMinMinutes = 20;
		assert.equal(
			parseTasteLayerConfigRecord(JSON.stringify(forked))?.honestyLongMinMinutes,
			20,
		);
	});

	it("rejects unknown schema, bad pools, celebrating keys, and out-of-range Honesty", () => {
		assert.equal(
			parseTasteLayerConfigRecord(
				JSON.stringify({ schemaVersion: 2, honestyLongMinMinutes: 30 }),
			),
			null,
		);
		const badHonesty = JSON.parse(FREEZE_JSON) as Record<string, unknown>;
		badHonesty.honestyLongMinMinutes = 0;
		assert.equal(parseTasteLayerConfigRecord(JSON.stringify(badHonesty)), null);
		const celebrating = JSON.parse(FREEZE_JSON) as Record<string, unknown>;
		celebrating.riseInterruptPool = [
			{ key: "celebrating", weight: 100 },
			{ key: "teaDrinking", weight: 25 },
			{ key: "bookReading", weight: 15 },
		];
		assert.equal(parseTasteLayerConfigRecord(JSON.stringify(celebrating)), null);
	});

	it("readTasteLayerConfig falls back to freeze when KV empty or invalid", async () => {
		const emptyKv = {
			async get() {
				return null;
			},
		} as unknown as KVNamespace;
		assert.deepEqual(
			await readTasteLayerConfig(emptyKv),
			tasteLayerConfigFreeze(),
		);

		const badKv = {
			async get() {
				return JSON.stringify({ schemaVersion: 9 });
			},
		} as unknown as KVNamespace;
		assert.deepEqual(await readTasteLayerConfig(badKv), tasteLayerConfigFreeze());
	});

	it("locks git freeze default Honesty at 30", () => {
		assert.equal(TASTE_LAYER_SCHEMA_VERSION, 1);
		assert.equal(TASTE_HONESTY_LONG_MIN_MINUTES, 30);
		assert.equal(tasteLayerConfigFreeze().honestyLongMinMinutes, 30);
	});
});
