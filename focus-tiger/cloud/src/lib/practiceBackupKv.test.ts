import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	parsePracticeBackupSnapshot,
	PRACTICE_BACKUP_SCHEMA_VERSION,
	PRACTICE_BACKUP_V1_STORE_KEYS,
	PRACTICE_BACKUP_V2_STORE_KEYS,
	practiceBackupSnapshotKvKey,
} from "./practiceBackupKv.ts";

describe("practiceBackupKv", () => {
	it("accepts exact v2 whitelist snapshot", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_V2_STORE_KEYS.map((k) => [k, null]),
		);
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, true);
	});

	it("accepts legacy v1 snapshot (6 keys)", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_V1_STORE_KEYS.map((k) => [k, null]),
		);
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: 1,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, true);
	});

	it("rejects v1 with lotus extra key", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_V1_STORE_KEYS.map((k) => [k, null]),
		);
		stores["focus-tiger.lotus-pond.v1"] = { lifetimeMinutes: 10 };
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: 1,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, false);
	});

	it("rejects v2 missing growth-journey-stage key", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_V1_STORE_KEYS.map((k) => [k, null]),
		);
		stores["focus-tiger.lotus-pond.v1"] = { lifetimeMinutes: 10 };
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, false);
	});

	it("rejects tip-jar extra key on v2", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_V2_STORE_KEYS.map((k) => [k, null]),
		);
		stores["focus-tiger.tip-jar.v1"] = { tipped: true };
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, false);
	});

	it("kv key is email scoped", () => {
		assert.equal(
			practiceBackupSnapshotKvKey("A@Example.COM"),
			"practice-backup:v1:a@example.com",
		);
	});
});
