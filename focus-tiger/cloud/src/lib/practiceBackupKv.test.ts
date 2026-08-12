import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	parsePracticeBackupSnapshot,
	PRACTICE_BACKUP_STORE_KEYS,
	practiceBackupSnapshotKvKey,
} from "./practiceBackupKv.ts";

describe("practiceBackupKv", () => {
	it("accepts exact whitelist snapshot", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_STORE_KEYS.map((k) => [k, null]),
		);
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: 1,
			savedAt: "2026-08-12T00:00:00.000Z",
			stores,
		});
		assert.equal(parsed.ok, true);
	});

	it("rejects tip-jar extra key", () => {
		const stores = Object.fromEntries(
			PRACTICE_BACKUP_STORE_KEYS.map((k) => [k, null]),
		);
		stores["focus-tiger.tip-jar.v1"] = { tipped: true };
		const parsed = parsePracticeBackupSnapshot({
			schemaVersion: 1,
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
