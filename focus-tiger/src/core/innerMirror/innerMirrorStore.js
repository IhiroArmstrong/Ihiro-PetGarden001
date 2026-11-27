/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { isInnerMirrorCrisis } from './innerMirrorCrisis.js';
import {
  appendInnerMirrorLog,
  purgeInnerMirrorDerivatives,
  setInnerMirrorCache,
  setInnerMirrorDiagnosticBody
} from './innerMirrorDerivatives.js';
import { matchInnerMirrorThemes } from './innerMirrorLexicon.js';

export const INNER_MIRROR_STORAGE_KEY = 'focus-tiger.inner-mirror.v1';
export const INNER_MIRROR_MAY_ENTER_GENERATION = false;

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

function newId() {
  return `im-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function textsOf(entries) {
  const out = [];
  for (const row of entries) {
    if (row?.text) out.push(row.text);
    if (row?.replacement) out.push(row.replacement);
  }
  return out;
}

/**
 * @param {unknown} raw
 */
export function normalizeInnerMirrorState(raw) {
  if (!raw || typeof raw !== 'object') return { entries: [] };
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (!Array.isArray(o.entries)) return { entries: [] };
  const entries = [];
  for (const row of o.entries) {
    if (!row || typeof row !== 'object') continue;
    const r = /** @type {Record<string, unknown>} */ (row);
    const text = typeof r.text === 'string' ? r.text.trim() : '';
    const at = typeof r.at === 'string' ? r.at : '';
    if (!text || !at) continue;
    const themes = Array.isArray(r.themes)
      ? r.themes.filter((k) => typeof k === 'string')
      : [];
    const entry = {
      id: typeof r.id === 'string' && r.id ? r.id : newId(),
      at,
      text,
      themes,
      themeStatus: r.themeStatus === 'void' ? 'void' : 'active'
    };
    if (typeof r.replacement === 'string' && r.replacement.trim()) {
      entry.replacement = r.replacement.trim();
    }
    entries.push(entry);
  }
  return { entries };
}

export function readInnerMirrorState(storage) {
  const store = resolveStorage(storage);
  if (!store) return { entries: [] };
  try {
    return normalizeInnerMirrorState(safeParseJson(store.getItem(INNER_MIRROR_STORAGE_KEY)));
  } catch {
    return { entries: [] };
  }
}

function persist(store, state) {
  if (!store) return { ok: false, reason: 'no-storage', state };
  try {
    store.setItem(INNER_MIRROR_STORAGE_KEY, JSON.stringify(state));
    setInnerMirrorCache(state.entries);
    return { ok: true, state };
  } catch {
    return { ok: false, reason: 'persist-failed', state };
  }
}

/**
 * Leave a non-crisis sentence. Crisis is checked before theme match.
 */
export function leaveInnerMirrorEntry(storage, opts = {}) {
  const text = typeof opts.text === 'string' ? opts.text.trim() : '';
  if (!text) return { ok: false, reason: 'empty' };
  if (
    isInnerMirrorCrisis({
      text,
      route: opts.route,
      semanticCrisis: opts.semanticCrisis,
      locale: opts.locale,
      localDate: opts.localDate
    })
  ) {
    return { ok: false, reason: 'crisis' };
  }
  const themes = matchInnerMirrorThemes(text);
  const entry = {
    id: newId(),
    at: isoNow(opts.now),
    text,
    themes,
    themeStatus: 'active'
  };
  const state = readInnerMirrorState(storage);
  const next = { entries: [...state.entries, entry] };
  const written = persist(resolveStorage(storage), next);
  if (written.ok) appendInnerMirrorLog(`left:${entry.id}`);
  return written.ok ? { ok: true, entry, state: written.state } : written;
}

export function correctInnerMirrorEntry(storage, opts = {}) {
  const id = typeof opts.id === 'string' ? opts.id : '';
  const replacement = typeof opts.replacement === 'string' ? opts.replacement.trim() : '';
  if (!id) return { ok: false, reason: 'missing-id' };
  if (!replacement) return { ok: false, reason: 'empty' };
  const store = resolveStorage(storage);
  const state = readInnerMirrorState(store);
  const idx = state.entries.findIndex((row) => row.id === id);
  if (idx < 0) return { ok: false, reason: 'missing' };
  if (
    isInnerMirrorCrisis({
      text: replacement,
      route: opts.route,
      semanticCrisis: opts.semanticCrisis,
      locale: opts.locale,
      localDate: opts.localDate
    })
  ) {
    const nextEntries = state.entries.map((row, i) =>
      i === idx ? { ...row, themeStatus: 'void' } : row
    );
    const written = persist(store, { entries: nextEntries });
    return written.ok
      ? { ok: false, reason: 'crisis', state: written.state }
      : written;
  }
  const nextEntries = state.entries.map((row, i) =>
    i === idx
      ? {
          ...row,
          replacement,
          themes: matchInnerMirrorThemes(replacement),
          themeStatus: 'active'
        }
      : row
  );
  return persist(store, { entries: nextEntries });
}

/**
 * Forget one entry or the whole log. Removes the key when empty.
 */
export function forgetInnerMirror(storage, opts = {}) {
  const store = resolveStorage(storage);
  const state = readInnerMirrorState(store);
  const id = typeof opts.id === 'string' ? opts.id : '';
  const removed = id
    ? state.entries.filter((row) => row.id === id)
    : [...state.entries];
  const kept = id ? state.entries.filter((row) => row.id !== id) : [];
  purgeInnerMirrorDerivatives(textsOf(removed));
  if (!store) {
    setInnerMirrorCache([]);
    return { ok: false, reason: 'no-storage' };
  }
  try {
    if (kept.length === 0) {
      store.removeItem(INNER_MIRROR_STORAGE_KEY);
      setInnerMirrorCache([]);
      setInnerMirrorDiagnosticBody('');
      return { ok: true, state: { entries: [] } };
    }
    return persist(store, { entries: kept });
  } catch {
    return { ok: false, reason: 'persist-failed' };
  }
}

export function innerMirrorKeyPresent(storage) {
  const store = resolveStorage(storage);
  if (!store) return false;
  try {
    return store.getItem(INNER_MIRROR_STORAGE_KEY) != null;
  } catch {
    return false;
  }
}
