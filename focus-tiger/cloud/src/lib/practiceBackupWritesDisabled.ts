/**
 * Practice-memory cloud backup: frontend gate is off; Worker write routes stay
 * dormant until encrypted release (B5 9-15).
 */
import { errorJson } from "./http";

export const PRACTICE_BACKUP_CLOUD_WRITES_DISABLED = true;

export function practiceBackupCloudWritesDisabledJson() {
	return errorJson(
		410,
		"practice_backup_disabled",
		"Practice cloud backup is not enabled on this Worker.",
	);
}
