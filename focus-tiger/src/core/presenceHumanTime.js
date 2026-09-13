/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Human-readable Presence moment timestamps (D.2).
 * Storage stays ISO; UI shows Today · 2:47 AM by default.
 */

/**
 * @param {string} iso
 * @returns {Date | null}
 */
function parseIso(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {Date} d
 * @returns {string}
 */
function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {Date} at
 * @param {Date} [reference]
 * @returns {'today' | 'yesterday' | 'other'}
 */
export function presenceMomentDayBucket(at, reference = new Date()) {
  const todayKey = localDateKey(reference);
  const atKey = localDateKey(at);
  if (atKey === todayKey) return 'today';
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  if (atKey === localDateKey(yesterday)) return 'yesterday';
  return 'other';
}

/**
 * @param {string} iso
 * @param {object} opts
 * @param {(key: string) => string} opts.t
 * @param {Date} [opts.reference]
 * @param {Intl.DateTimeFormatOptions} [opts.timeOptions]
 * @returns {string}
 */
export function formatPresenceMomentTime(iso, opts) {
  const d = parseIso(iso);
  if (!d) return String(iso || '');
  const t = typeof opts?.t === 'function' ? opts.t : (key) => key;
  const reference = opts?.reference instanceof Date ? opts.reference : new Date();
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    ...(opts?.timeOptions || {})
  });
  const bucket = presenceMomentDayBucket(d, reference);
  if (bucket === 'today') {
    return t('PRESENCE_TIME_TODAY').replaceAll('{time}', time);
  }
  if (bucket === 'yesterday') {
    return t('PRESENCE_TIME_YESTERDAY').replaceAll('{time}', time);
  }
  const dateLabel = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  return t('PRESENCE_TIME_DATE').replaceAll('{date}', dateLabel).replaceAll(
    '{time}',
    time
  );
}

/**
 * @param {string} iso
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatPresenceExactTime(iso, options) {
  const d = parseIso(iso);
  if (!d) return String(iso || '');
  return d.toLocaleString(undefined, options);
}
