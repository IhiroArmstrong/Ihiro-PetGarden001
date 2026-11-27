/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T106 · On-device growth journal (Thought Drop originals).
 * Store only. Never feed generation / cloud backup / git.
 */

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';

export const GROWTH_JOURNAL_STORAGE_KEY = 'focus-tiger.growth-journal.v1';
export const GROWTH_JOURNAL_CONSENT_KEY =
  'focus-tiger.growth-journal-consent.v1';
export const GROWTH_JOURNAL_MAX_ENTRIES = 200;
/** Product invariant: journal text must not enter any generate prompt. */
export const GROWTH_JOURNAL_MAY_ENTER_GENERATION = false;

/**
 * @typedef {'unset' | 'granted' | 'declined'} GrowthJournalConsentStatus
 * @typedef {{ status: GrowthJournalConsentStatus, at?: string }} GrowthJournalConsent
 * @typedef {{ at: string, source: string, text: string }} GrowthJournalEntry
 * @typedef {{ entries: GrowthJournalEntry[] }} GrowthJournalState
 */

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function safeParseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isoNow(now) {
  if (typeof now === 'string' && now) return now;
  const d = now instanceof Date ? now : new Date();
  return d.toISOString();
}

/**
 * @param {unknown} raw
 * @returns {GrowthJournalConsent}
 */
export function normalizeGrowthJournalConsent(raw) {
  if (!raw || typeof raw !== 'object') return { status: 'unset' };
  const o = /** @type {Record<string, unknown>} */ (raw);
  const status = o.status === 'granted' || o.status === 'declined' ? o.status : 'unset';
  const at = typeof o.at === 'string' && o.at ? o.at : undefined;
  return at ? { status, at } : { status };
}

/**
 * @param {unknown} storage
 * @returns {GrowthJournalConsent}
 */
export function readGrowthJournalConsent(storage) {
  const store = resolveStorage(storage);
  if (!store) return { status: 'unset' };
  try {
    return normalizeGrowthJournalConsent(
      safeParseJson(store.getItem(GROWTH_JOURNAL_CONSENT_KEY))
    );
  } catch {
    return { status: 'unset' };
  }
}

/**
 * @param {unknown} storage
 * @param {GrowthJournalConsentStatus} status
 * @param {string | Date} [now]
 * @returns {GrowthJournalConsent}
 */
export function writeGrowthJournalConsent(storage, status, now) {
  const store = resolveStorage(storage);
  const next = { status, at: isoNow(now) };
  if (!store) return next;
  try {
    store.setItem(GROWTH_JOURNAL_CONSENT_KEY, JSON.stringify(next));
  } catch {
    // quota / private mode
  }
  return next;
}

/**
 * @param {unknown} raw
 * @returns {GrowthJournalState}
 */
export function normalizeGrowthJournalState(raw) {
  if (!raw || typeof raw !== 'object') return { entries: [] };
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (!Array.isArray(o.entries)) return { entries: [] };
  /** @type {GrowthJournalEntry[]} */
  const entries = [];
  for (const row of o.entries) {
    if (!row || typeof row !== 'object') continue;
    const r = /** @type {Record<string, unknown>} */ (row);
    const text = typeof r.text === 'string' ? r.text.trim() : '';
    const at = typeof r.at === 'string' ? r.at : '';
    const source = typeof r.source === 'string' && r.source ? r.source : 'confide';
    if (!text || !at) continue;
    entries.push({ at, source, text });
  }
  return { entries: entries.slice(-GROWTH_JOURNAL_MAX_ENTRIES) };
}

/**
 * @param {unknown} storage
 * @returns {GrowthJournalState}
 */
export function readGrowthJournalState(storage) {
  const store = resolveStorage(storage);
  if (!store) return { entries: [] };
  try {
    return normalizeGrowthJournalState(
      safeParseJson(store.getItem(GROWTH_JOURNAL_STORAGE_KEY))
    );
  } catch {
    return { entries: [] };
  }
}

/**
 * @param {{ crisis?: boolean }} opts
 */
export function shouldWriteGrowthJournal(opts = {}) {
  return opts.crisis !== true;
}

/**
 * @param {unknown} route
 */
export function isGrowthJournalCrisisRoute(route) {
  return route === CONFIDE_ROUTE.SAFETY_REDIRECT;
}

/**
 * @param {unknown} storage
 * @param {{ text: string, source?: string, at?: string | Date }} entry
 * @returns {{ ok: true, state: GrowthJournalState } | { ok: false, reason: string }}
 */
export function appendGrowthJournalEntry(storage, entry) {
  const store = resolveStorage(storage);
  const text = typeof entry?.text === 'string' ? entry.text.trim() : '';
  if (!text) return { ok: false, reason: 'empty' };
  const state = readGrowthJournalState(store);
  const next = normalizeGrowthJournalState({
    entries: [
      ...state.entries,
      {
        at: isoNow(entry.at),
        source: entry.source || 'confide',
        text
      }
    ]
  });
  if (!store) return { ok: false, reason: 'no-storage' };
  try {
    store.setItem(GROWTH_JOURNAL_STORAGE_KEY, JSON.stringify(next));
    return { ok: true, state: next };
  } catch {
    return { ok: false, reason: 'persist-failed' };
  }
}

/**
 * @param {unknown} storage
 * @returns {GrowthJournalState}
 */
export function clearGrowthJournalEntries(storage) {
  const empty = { entries: [] };
  const store = resolveStorage(storage);
  if (!store) return empty;
  try {
    store.setItem(GROWTH_JOURNAL_STORAGE_KEY, JSON.stringify(empty));
  } catch {
    try {
      store.removeItem(GROWTH_JOURNAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  return empty;
}

/**
 * After a Thought Drop send: write locally by default (crisis only skips), or skip.
 * @param {{ storage?: unknown, text?: string, route?: string, now?: string | Date }} opts
 * @returns {{ action: 'written' | 'skip', reason?: string, showPolicyNotice?: boolean }}
 */
export function considerGrowthJournalAfterSend(opts = {}) {
  const text = typeof opts.text === 'string' ? opts.text.trim() : '';
  if (!text) return { action: 'skip', reason: 'empty' };
  if (isGrowthJournalCrisisRoute(opts.route)) {
    return { action: 'skip', reason: 'crisis' };
  }
  if (!shouldWriteGrowthJournal({ crisis: false })) {
    return { action: 'skip', reason: 'blocked' };
  }
  const consent = readGrowthJournalConsent(opts.storage);
  const showPolicyNotice =
    consent.status === 'unset' || consent.status === 'declined';
  const written = appendGrowthJournalEntry(opts.storage, {
    text,
    source: 'confide',
    at: opts.now
  });
  if (!written.ok) return { action: 'skip', reason: written.reason };
  if (consent.status !== 'granted') {
    writeGrowthJournalConsent(opts.storage, 'granted', opts.now);
  }
  return { action: 'written', showPolicyNotice };
}
