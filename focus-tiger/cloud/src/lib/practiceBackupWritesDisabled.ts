/**
 * Practice-memory cloud backup: frontend gate is off; Worker routes stay
 * dormant until encrypted release (B5 9-15 / 9-15b).
 */
import { errorJson } from "./http";

export const PRACTICE_BACKUP_CLOUD_WRITES_DISABLED = true;

/** All practice-backup HTTP paths; 9-15 only gated request-otp. */
export const PRACTICE_BACKUP_DISABLED_PATHS = [
	"/api/practice-backup/request-otp",
	"/api/practice-backup/verify",
	"/api/practice-backup/put",
	"/api/practice-backup/get",
	"/api/practice-backup/delete",
] as const;

export function isPracticeBackupCloudPathDisabled(pathname: string): boolean {
	return (
		PRACTICE_BACKUP_CLOUD_WRITES_DISABLED &&
		(PRACTICE_BACKUP_DISABLED_PATHS as readonly string[]).includes(pathname)
	);
}

export function practiceBackupCloudWritesDisabledJson() {
	return errorJson(
		410,
		"practice_backup_disabled",
		"Practice cloud backup is not enabled on this Worker.",
	);
}
