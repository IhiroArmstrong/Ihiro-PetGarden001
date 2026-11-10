/**
 * T93 D2: default env allows OTP/writes; audit env can keep 410.
 * Would fail on 9-15b tip: helper was a hard-coded true constant.
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

function isPracticeBackupCloudWritesDisabled(env?: {
	PRACTICE_BACKUP_WRITES_DISABLED?: string;
}): boolean {
	try {
		const raw = env?.PRACTICE_BACKUP_WRITES_DISABLED;
		return raw === "true" || raw === "1";
	} catch {
		return false;
	}
}

function isPracticeBackupCloudPathDisabled(
	pathname: string,
	env?: { PRACTICE_BACKUP_WRITES_DISABLED?: string },
): boolean {
	return isPracticeBackupCloudWritesDisabled(env) && PATHS.includes(pathname);
}

describe("practiceBackupWritesDisabled · T93 D2", () => {
	it("defaults to allowed when env is missing or unreadable", () => {
		assert.match(helperSrc, /return raw === "true" \|\| raw === "1"/);
		assert.match(helperSrc, /return false;/);
		assert.equal(isPracticeBackupCloudWritesDisabled(undefined), false);
		assert.equal(isPracticeBackupCloudWritesDisabled({}), false);
		assert.equal(
			isPracticeBackupCloudWritesDisabled({
				PRACTICE_BACKUP_WRITES_DISABLED: "false",
			}),
			false,
		);
	});

	it("returns 410 only when audit env is true or 1", () => {
		assert.equal(
			isPracticeBackupCloudWritesDisabled({
				PRACTICE_BACKUP_WRITES_DISABLED: "true",
			}),
			true,
		);
		assert.equal(
			isPracticeBackupCloudWritesDisabled({
				PRACTICE_BACKUP_WRITES_DISABLED: "1",
			}),
			true,
		);
		assert.equal(
			isPracticeBackupCloudPathDisabled("/api/practice-backup/request-otp", {
				PRACTICE_BACKUP_WRITES_DISABLED: "true",
			}),
			true,
		);
		assert.equal(
			isPracticeBackupCloudPathDisabled("/api/practice-backup/request-otp", {}),
			false,
		);
	});

	it("does not keep the 9-15b hard-coded true constant", () => {
		assert.doesNotMatch(
			helperSrc,
			/export const PRACTICE_BACKUP_CLOUD_WRITES_DISABLED = true/,
		);
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

	it("gates each listed path with the env helper in index.ts", () => {
		assert.match(indexSrc, /isPracticeBackupCloudWritesDisabled\(env\)/);
		const calls = indexSrc.split("practiceBackupCloudWritesDisabledJson(").length - 1;
		assert.equal(
			calls,
			PATHS.length,
			"index.ts must still be able to return 410 on every practice-backup route",
		);
		for (const path of PATHS) {
			assert.match(indexSrc, new RegExp(path.replaceAll("/", "\\/")));
		}
	});
});
