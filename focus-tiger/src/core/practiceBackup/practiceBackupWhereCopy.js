/**
 * User-facing “where is my backup?” copy for Journey Log.
 * Cloud A is one silent snapshot, not a browsable archive.
 */

/**
 * @param {string | null | undefined} iso
 * @param {string} [localeId]
 * @returns {string}
 */
export function formatPracticeBackupSnapshotTime(iso, localeId = 'en') {
  if (typeof iso !== 'string' || !iso.trim()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const loc =
    localeId === 'ja' ? 'ja-JP' : localeId === 'zh' ? 'zh-CN' : 'en-US';
  try {
    return d.toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return d.toISOString();
  }
}

/**
 * @param {{ lastUploadAt?: string | null } | null | undefined} opt
 * @param {(key: string) => string} tFn
 * @param {string} [localeId]
 * @returns {string}
 */
export function practiceBackupWhereText(opt, tFn, localeId = 'en') {
  const time = formatPracticeBackupSnapshotTime(opt?.lastUploadAt, localeId);
  if (time) {
    return String(tFn('JOURNEY_LOG_BACKUP_WHERE_ON')).replaceAll(
      '{time}',
      time
    );
  }
  return tFn('JOURNEY_LOG_BACKUP_WHERE_ON_PENDING');
}
