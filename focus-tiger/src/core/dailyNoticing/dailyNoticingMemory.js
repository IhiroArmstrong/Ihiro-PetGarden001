/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const DAILY_NOTICING_STORAGE_KEY = 'focus-tiger.daily-noticing.v1';

const ROTATION_WINDOW = 7;

export function readDailyNoticingHistory(storage) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(DAILY_NOTICING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row) =>
        row &&
        typeof row === 'object' &&
        typeof row.dateKey === 'string' &&
        row.dateKey.length > 0
    );
  } catch {
    return [];
  }
}

export function writeDailyNoticingDayRecord(storage, record) {
  if (!storage || !record?.dateKey) return;
  const history = readDailyNoticingHistory(storage).filter(
    (row) => row.dateKey !== record.dateKey
  );
  history.push(record);
  history.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  try {
    storage.setItem(DAILY_NOTICING_STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* brief */
  }
}

export function recentDailyNoticingPrimaryPromptIds(history, beforeDateKey) {
  const sorted = [...history]
    .filter((row) => row.dateKey < beforeDateKey && !row.skipped)
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  const ids = [];
  for (const row of sorted) {
    const first = row.promptIds?.[0];
    if (typeof first === 'string' && first) ids.push(first);
    if (ids.length >= ROTATION_WINDOW) break;
  }
  return ids;
}

export function readDailyNoticingForDate(storage, dateKey) {
  return (
    readDailyNoticingHistory(storage).find((row) => row.dateKey === dateKey) ??
    null
  );
}