/**
 * 9-15b: every practice-backup route must return the same 410 gate.
 * Would fail on #1602 tip: index.ts called the helper once (request-otp only).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const indexSrc = readFileSync(join(dir, "../index.ts"), "utf8");
const helperSrc = readFileSync(join(dir, "practiceBackupWritesDisabled.ts"), "utf8");

const PATHS = [
	"/api/practice-backup/request-otp",
	"/api/practice-backup/verify",
	"/api/practice-backup/put",
	"/api/practice-backup/get",
	"/api/practice-backup/delete",
];

describe("practiceBackupWritesDisabled · 9-15b", () => {
	it("keeps the cloud writes flag on", () => {
		assert.match(helperSrc, /export const PRACTICE_BACKUP_CLOUD_WRITES_DISABLED = true/);
	});

	it("lists request-otp, verify, put, get, and delete", () => {
		for (const path of PATHS) {
			assert.match(helperSrc, new RegExp(path.replaceAll("/", "\\/")));
		}
	});

	it("returns 410 practice_backup_disabled in the helper", () => {
		assert.match(helperSrc, /410/);
		assert.match(helperSrc, /practice_backup_disabled/);
	});

	it("calls the 410 helper once per listed path in index.ts", () => {
		const calls = indexSrc.split("practiceBackupCloudWritesDisabledJson(").length - 1;
		assert.equal(
			calls,
			PATHS.length,
			"index.ts must gate every practice-backup route, not only request-otp",
		);
		for (const path of PATHS) {
			assert.match(indexSrc, new RegExp(path.replaceAll("/", "\\/")));
		}
	});
});
