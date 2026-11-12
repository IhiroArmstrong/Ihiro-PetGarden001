/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Local RFC 5545 reminder .ics (no cloud, no OAuth).
 * Brief: task-ics-reminder-export.md
 */

import { PRACTICE_DEEP_LINK_SIT_MINUTES } from './practiceDeepLinkParse.js';

export const ICS_REMINDER_SEQUENCE_STORAGE_KEY =
  'focus-tiger.ics-reminder-sequence.v1';

export const ICS_REMINDER_DEFAULT_SIT_MINUTES = 5;

export const ICS_REMINDER_UID_LOCAL_HOST = 'local';

/** @typedef {'daily' | 'weekdays'} IcsReminderRepeat */

/**
 * @param {unknown} preferred
 * @returns {number}
 */
export function resolveIcsSitMinutes(preferred) {
  const minutes = Number(preferred);
  if (PRACTICE_DEEP_LINK_SIT_MINUTES.includes(/** @type {1|3|5|10|20} */ (minutes))) {
    return minutes;
  }
  return ICS_REMINDER_DEFAULT_SIT_MINUTES;
}

/**
 * @param {{ isDesktop?: boolean, origin?: string, minutes?: unknown }} [options]
 * @returns {string}
 */
export function buildIcsReminderEventUrl({
  isDesktop = false,
  origin = '',
  minutes
} = {}) {
  const sitMinutes = resolveIcsSitMinutes(minutes);
  const query = `product=1&start=sit&min=${sitMinutes}`;
  if (isDesktop) return `focus-tiger://app/?${query}`;
  const base = String(origin || '').replace(/\/+$/, '');
  if (!base) return `/?${query}`;
  return `${base}/?${query}`;
}

/**
 * @param {string} originOrHost
 * @param {boolean} [isDesktop]
 * @returns {string}
 */
export function buildIcsReminderUid(originOrHost, isDesktop = false) {
  const host = isDesktop
    ? 'app'
    : sanitizeIcsHost(originOrHost) || 'web';
  return `focus-tiger-reminder-sit-${host}@${ICS_REMINDER_UID_LOCAL_HOST}`;
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
function sanitizeIcsHost(raw) {
  const text = String(raw || '')
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
  const cleaned = text.replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned.slice(0, 64);
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @returns {number}
 */
export function peekIcsReminderSequence({
  storage = getDefaultStorage()
} = {}) {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(ICS_REMINDER_SEQUENCE_STORAGE_KEY);
    if (raw == null) return 0;
    const parsed = JSON.parse(raw);
    const n = Number(parsed?.sequence);
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * @param {object} [options]
 * @param {Storage | null} [options.storage]
 * @returns {number}
 */
export function bumpIcsReminderSequence({
  storage = getDefaultStorage()
} = {}) {
  const next = peekIcsReminderSequence({ storage }) + 1;
  if (!storage) return next;
  try {
    storage.setItem(
      ICS_REMINDER_SEQUENCE_STORAGE_KEY,
      JSON.stringify({ sequence: next })
    );
  } catch {
    // still return next so a download can proceed this session
  }
  return next;
}

/**
 * @param {string} value
 * @returns {string}
 */
export function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/**
 * @param {string} line
 * @returns {string}
 */
export function foldIcsLine(line) {
  const text = String(line ?? '');
  if (text.length <= 75) return text;
  const chunks = [text.slice(0, 75)];
  let rest = text.slice(75);
  while (rest.length) {
    chunks.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return chunks.join('\r\n');
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatIcsFloatingDateTime(date) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${mo}${d}T${h}${mi}${s}`;
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatIcsUtcStamp(date) {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const h = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

/**
 * @param {{ hour: number, minute: number }} preference
 * @param {Date} now
 * @returns {Date}
 */
export function resolveIcsDtstart(preference, now) {
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    preference.hour,
    preference.minute,
    0,
    0
  );
  return start;
}

/**
 * @param {IcsReminderRepeat} repeat
 * @returns {string}
 */
export function buildIcsRrule(repeat) {
  if (repeat === 'weekdays') {
    return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  }
  return 'FREQ=DAILY';
}

/**
 * @param {{
 *   preference: { hour: number, minute: number },
 *   repeat?: IcsReminderRepeat,
 *   includeAlarm?: boolean,
 *   summary: string,
 *   description: string,
 *   eventUrl: string,
 *   uid: string,
 *   sequence: number,
 *   now?: Date,
 *   durationMinutes?: number
 * }} options
 * @returns {string}
 */
export function buildReminderIcs(options) {
  const preference = options.preference;
  if (
    !preference ||
    !Number.isInteger(preference.hour) ||
    !Number.isInteger(preference.minute)
  ) {
    throw new Error('ics_missing_preference');
  }
  const now = options.now instanceof Date ? options.now : new Date();
  const dtstart = resolveIcsDtstart(preference, now);
  const durationMinutes = resolveIcsSitMinutes(options.durationMinutes);
  const dtend = new Date(dtstart.getTime() + durationMinutes * 60 * 1000);
  const sequence = Number.isInteger(options.sequence) ? options.sequence : 1;
  const rrule = buildIcsRrule(options.repeat === 'weekdays' ? 'weekdays' : 'daily');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Twinsology//Focus Tiger Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${options.uid}`,
    `DTSTAMP:${formatIcsUtcStamp(now)}`,
    `DTSTART:${formatIcsFloatingDateTime(dtstart)}`,
    `DTEND:${formatIcsFloatingDateTime(dtend)}`,
    `RRULE:${rrule}`,
    `SEQUENCE:${sequence}`,
    `SUMMARY:${escapeIcsText(options.summary)}`,
    `DESCRIPTION:${escapeIcsText(options.description)}`,
    `URL:${options.eventUrl}`,
    'TRANSP:TRANSPARENT'
  ];
  if (options.includeAlarm === true) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(options.summary)}`,
      'TRIGGER:PT0S',
      'END:VALARM'
    );
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

/**
 * @param {{
 *   filename: string,
 *   body: string,
 *   mimeType?: string,
 *   document?: Document
 * }} options
 */
export function downloadTextFile({
  filename,
  body,
  mimeType = 'text/calendar;charset=utf-8',
  document: doc
}) {
  const owner = doc || (typeof document !== 'undefined' ? document : null);
  if (!owner) throw new Error('ics_download_no_document');
  const blob = new Blob([body], { type: mimeType });
  const href = URL.createObjectURL(blob);
  const anchor = owner.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener';
  owner.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}
