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
import {
	CONFIDE_COPY_CORPUS_IDS,
	CONFIDE_COPY_TEMPLATE_KEYS,
	tasteConfideCopyCorpus,
	tasteConfideCopyTemplates,
} from "./tasteConfideCopyFreeze.ts";
import {
	CALM_ACTION_ARRIVE_IDS,
	CALM_ACTION_OVERLAY_SCHEMA_VERSION,
	CALM_ACTION_RECOVER_IDS,
	tasteCalmActionArrivePool,
	tasteCalmActionRecoverPool,
} from "./tasteCalmActionCopyFreeze.ts";
import {
	QUIET_LINE_OVERLAY_SCHEMA_VERSION,
	tasteQuietLinePool,
} from "./tasteQuietLineFreeze.ts";

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

	it("quiet-line freeze has 29 aligned keys and overlay schema 2", () => {
		assert.equal(QUIET_LINE_OVERLAY_SCHEMA_VERSION, 2);
		const en = tasteQuietLinePool("en");
		const ja = tasteQuietLinePool("ja");
		assert.equal(en.length, 29);
		assert.deepEqual(
			en.map((e) => e.key),
			ja.map((e) => e.key),
		);
		assert.equal(en[en.length - 1].key, "DAILY_ZEN_QUOTE_INSIGHT_22");
		assert.equal(
			en.find((e) => e.key === "DAILY_ZEN_QUOTE_1")?.text,
			"The world and I were never two.",
		);
	});

	it("confide copy freeze has 4 templates and 19 corpus ids", () => {
		assert.equal(CONFIDE_COPY_TEMPLATE_KEYS.length, 4);
		assert.equal(CONFIDE_COPY_CORPUS_IDS.length, 19);
		const en = tasteConfideCopyCorpus("en");
		const ja = tasteConfideCopyCorpus("ja");
		const zh = tasteConfideCopyCorpus("zh");
		assert.deepEqual(
			en.map((e) => e.id),
			[...CONFIDE_COPY_CORPUS_IDS],
		);
		assert.deepEqual(
			ja.map((e) => e.id),
			en.map((e) => e.id),
		);
		assert.deepEqual(
			zh.map((e) => e.id),
			en.map((e) => e.id),
		);
		assert.equal(tasteConfideCopyTemplates("en").length, 4);
		assert.equal(tasteConfideCopyTemplates("zh")[0].key, "CONFIDE_BOUNDARY_RESPECT");
		assert.equal(
			tasteConfideCopyTemplates("en").find((e) => e.key === "CONFIDE_BOUNDARY_RESPECT")
				?.text,
			"Nothing needs to be said. Yin is still here.",
		);
		assert.equal(
			tasteConfideCopyTemplates("ja").find((e) => e.key === "CONFIDE_BOUNDARY_RESPECT")
				?.text,
			"話さなくていい。寅はここにいる。",
		);
	});

	it("calm-action copy freeze has 14 recover + 14 arrive ids and schema 1", () => {
		assert.equal(CALM_ACTION_OVERLAY_SCHEMA_VERSION, 1);
		assert.equal(CALM_ACTION_RECOVER_IDS.length, 14);
		assert.equal(CALM_ACTION_ARRIVE_IDS.length, 14);
		const enRecover = tasteCalmActionRecoverPool("en");
		const jaRecover = tasteCalmActionRecoverPool("ja");
		const enArrive = tasteCalmActionArrivePool("en");
		const jaArrive = tasteCalmActionArrivePool("ja");
		assert.deepEqual(
			enRecover.map((e) => e.id),
			[...CALM_ACTION_RECOVER_IDS],
		);
		assert.deepEqual(
			jaRecover.map((e) => e.id),
			enRecover.map((e) => e.id),
		);
		assert.deepEqual(
			enArrive.map((e) => e.id),
			[...CALM_ACTION_ARRIVE_IDS],
		);
		assert.deepEqual(
			jaArrive.map((e) => e.id),
			enArrive.map((e) => e.id),
		);
		assert.equal(enRecover[0].id, "CAW-R01");
		assert.equal(enArrive[0].id, "CAW-A01");
	});
});
