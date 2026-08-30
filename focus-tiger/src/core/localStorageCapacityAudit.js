/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';
import {
  PRESENCE_SIGNALS_STORAGE_KEY,
  readPresenceSignals
} from './presenceSignalsGate.js';
import { REFLECTION_STORAGE_KEY } from './SessionEndFlow.js';

/**
 * @param {Storage | null | undefined} storage
 * @param {string} key
 * @returns {number}
 */
export function localStorageKeyByteSize(storage, key) {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(key);
    if (raw == null) return 0;
    return new TextEncoder().encode(raw).length;
  } catch {
    return 0;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {readonly string[]} [keys]
 * @returns {{ key: string, bytes: number }[]}
 */
export function auditFocusTigerLocalStorageBytes(
  storage,
  keys = FOCUS_TIGER_LOCAL_STORAGE_KEYS
) {
  return keys.map((key) => ({
    key,
    bytes: localStorageKeyByteSize(storage, key)
  }));
}

/**
 * @param {{ key: string, bytes: number }[]} rows
 * @returns {{ totalBytes: number, nonZeroKeys: number, topKeys: { key: string, bytes: number }[] }}
 */
export function summarizeLocalStorageAudit(rows) {
  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
  const nonZeroKeys = rows.filter((row) => row.bytes > 0).length;
  const topKeys = [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 10);
  return { totalBytes, nonZeroKeys, topKeys };
}

/**
 * Legacy = rows written before presenceSessionId shipped.
 * @param {Storage | null | undefined} storage
 * @returns {{
 *   presenceTotal: number,
 *   presenceLegacy: number,
 *   presenceLegacyPercent: number,
 *   reflectionBundles: number,
 *   reflectionLegacy: number,
 *   reflectionLegacyPercent: number
 * }}
 */
export function auditPresenceLegacyRatio(storage) {
  const presence = readPresenceSignals(storage).entries;
  const presenceTotal = presence.length;
  const presenceLegacy = presence.filter((row) => !row.presenceSessionId).length;
  let reflectionBundles = 0;
  let reflectionLegacy = 0;
  if (storage) {
    try {
      const raw = storage.getItem(REFLECTION_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      reflectionBundles = list.length;
      reflectionLegacy = list.filter((row) => !row?.presenceSessionId).length;
    } catch {
      reflectionBundles = 0;
      reflectionLegacy = 0;
    }
  }
  const pct = (legacy, total) =>
    total > 0 ? Math.round((legacy / total) * 1000) / 10 : 0;
  return {
    presenceTotal,
    presenceLegacy,
    presenceLegacyPercent: pct(presenceLegacy, presenceTotal),
    reflectionBundles,
    reflectionLegacy,
    reflectionLegacyPercent: pct(reflectionLegacy, reflectionBundles)
  };
}

/**
 * DevTools console helper (paste in Application tab context).
 * @returns {string}
 */
export function localStorageAuditConsoleSnippet() {
  return `(() => {
  const keys = ${JSON.stringify([...FOCUS_TIGER_LOCAL_STORAGE_KEYS])};
  const rows = keys.map((key) => {
    const raw = localStorage.getItem(key);
    const bytes = raw ? new TextEncoder().encode(raw).length : 0;
    return { key, bytes };
  });
  const totalBytes = rows.reduce((s, r) => s + r.bytes, 0);
  const ps = JSON.parse(localStorage.getItem('${PRESENCE_SIGNALS_STORAGE_KEY}') || '{"entries":[]}');
  const entries = Array.isArray(ps.entries) ? ps.entries : [];
  const legacy = entries.filter((e) => !e.presenceSessionId).length;
  console.table(rows.filter((r) => r.bytes > 0).sort((a, b) => b.bytes - a.bytes));
  console.log({ totalBytes, presenceRows: entries.length, presenceLegacyRows: legacy });
  return { totalBytes, rows, presenceRows: entries.length, presenceLegacyRows: legacy };
})()`;
}
