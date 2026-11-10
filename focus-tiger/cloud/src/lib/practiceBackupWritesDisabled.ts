/**
 * Practice-memory cloud backup Worker gate (T93 D2).
 * Default: writes/OTP allowed (prod-open). Audit/preview may set
 * PRACTICE_BACKUP_WRITES_DISABLED=true|1 to keep 410.
 * Client `practiceBackupCloudEnabled` stays off until D3; this PR does not deploy.
 */
import { errorJson } from "./http";

export const PRACTICE_BACKUP_DISABLED_ERROR = "practice_backup_disabled";

/** All practice-backup HTTP paths; 9-15 only gated request-otp. */
export const PRACTICE_BACKUP_DISABLED_PATHS = [
	"/api/practice-backup/request-otp",
	"/api/practice-backup/verify",
	"/api/practice-backup/put",
	"/api/practice-backup/get",
	"/api/practice-backup/delete",
] as const;

/**
 * @param {{ PRACTICE_BACKUP_WRITES_DISABLED?: string }} [env]
 */
export function isPracticeBackupCloudWritesDisabled(env?: {
	PRACTICE_BACKUP_WRITES_DISABLED?: string;
}): boolean {
	try {
		const raw = env?.PRACTICE_BACKUP_WRITES_DISABLED;
		return raw === "true" || raw === "1";
	} catch {
		return false;
	}
}

export function isPracticeBackupCloudPathDisabled(
	pathname: string,
	env?: { PRACTICE_BACKUP_WRITES_DISABLED?: string },
): boolean {
	return (
		isPracticeBackupCloudWritesDisabled(env) &&
		(PRACTICE_BACKUP_DISABLED_PATHS as readonly string[]).includes(pathname)
	);
}

export function practiceBackupCloudWritesDisabledJson() {
	return errorJson(
		410,
		PRACTICE_BACKUP_DISABLED_ERROR,
		"Practice cloud backup is not enabled on this Worker.",
	);
}
