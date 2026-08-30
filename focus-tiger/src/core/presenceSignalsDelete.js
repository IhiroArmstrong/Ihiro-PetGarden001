/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import {
  readPresenceSignals,
  writePresenceSignals
} from './presenceSignalsGate.js';
import {
  REFLECTION_STORAGE_KEY,
  pruneExpiredReflectionBundles
} from './SessionEndFlow.js';
import { normalizePresenceSessionId } from './presenceSessionId.js';

/** Analyst §3.1: API must hard-reject; UI shows guidance separately. */
export const DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE =
  'linked_reflection_bundle';

/** Legacy strategy A: bundle.createdAt ↔ signal.at within this window (ms). */
export const LEGACY_REFLECTION_MATCH_MS = 2000;

const REFLECTION_SOURCES = new Set([
  'reflection_q1',
  'reflection_q2',
  'reflection_q3'
]);

/**
 * @param {Storage | null | undefined} storage
 * @returns {object[]}
 */
export function readReflectionBundles(storage) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(REFLECTION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return pruneExpiredReflectionBundles(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {object[]} bundles
 */
export function writeReflectionBundles(storage, bundles) {
  if (!storage) return;
  try {
    storage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(bundles));
  } catch {
    // ignore quota
  }
}

/**
 * @param {object} bundle
 * @param {import('./presenceSignalsGate.js').PresenceSignalEntry[]} entries
 * @returns {import('./presenceSignalsGate.js').PresenceSignalEntry[]}
 */
export function legacyReflectionSignalsForBundle(bundle, entries) {
  const createdAt = Number(bundle?.createdAt);
  if (!Number.isFinite(createdAt)) return [];
  return (entries || []).filter((row) => {
    if (!REFLECTION_SOURCES.has(row.source)) return false;
    if (row.presenceSessionId) return false;
    const atMs = new Date(row.at).getTime();
    if (!Number.isFinite(atMs)) return false;
    return Math.abs(atMs - createdAt) <= LEGACY_REFLECTION_MATCH_MS;
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} presenceSessionId
 * @returns {{ ok: true, removedBundles: number, removedSignals: number } | { ok: false, reason: string }}
 */
export function deletePresenceSession(storage, presenceSessionId) {
  const id = normalizePresenceSessionId(presenceSessionId);
  if (!id || !storage) return { ok: false, reason: 'invalid_session' };

  const state = readPresenceSignals(storage);
  const beforeSignals = state.entries.length;
  const nextSignals = state.entries.filter((row) => row.presenceSessionId !== id);
  writePresenceSignals(storage, { entries: nextSignals });

  const bundles = readReflectionBundles(storage);
  const nextBundles = bundles.filter((row) => row.presenceSessionId !== id);
  writeReflectionBundles(storage, nextBundles);

  return {
    ok: true,
    removedBundles: bundles.length - nextBundles.length,
    removedSignals: beforeSignals - nextSignals.length
  };
}

/**
 * Delete a standalone presence row. **Rejects** when row belongs to a reflection bundle.
 * @param {Storage | null | undefined} storage
 * @param {string} signalId
 */
export function deletePresenceSignalById(storage, signalId) {
  const id = typeof signalId === 'string' ? signalId.trim() : '';
  if (!id || !storage) return { ok: false, reason: 'invalid_id' };

  const state = readPresenceSignals(storage);
  const row = state.entries.find((entry) => entry.id === id);
  if (!row) return { ok: false, reason: 'not_found' };

  const sessionId = normalizePresenceSessionId(row.presenceSessionId);
  if (sessionId) {
    const bundles = readReflectionBundles(storage);
    const linked = bundles.some((bundle) => bundle.presenceSessionId === sessionId);
    if (linked) {
      return {
        ok: false,
        reason: DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE,
        presenceSessionId: sessionId
      };
    }
  }

  if (REFLECTION_SOURCES.has(row.source) && !sessionId) {
    const bundles = readReflectionBundles(storage);
    const linkedLegacy = bundles.some((bundle) => {
      if (bundle.presenceSessionId) return false;
      return legacyReflectionSignalsForBundle(bundle, [row]).length > 0;
    });
    if (linkedLegacy) {
      return {
        ok: false,
        reason: DELETE_PRESENCE_SIGNAL_REJECT_LINKED_BUNDLE,
        legacy: true
      };
    }
  }

  writePresenceSignals(storage, {
    entries: state.entries.filter((entry) => entry.id !== id)
  });
  return { ok: true, removedSignals: 1 };
}

/**
 * Legacy reflection session delete (strategy A).
 * @param {Storage | null | undefined} storage
 * @param {number} bundleCreatedAt
 */
export function deleteLegacyReflectionSession(storage, bundleCreatedAt) {
  const createdAt = Number(bundleCreatedAt);
  if (!Number.isFinite(createdAt) || !storage) {
    return { ok: false, reason: 'invalid_created_at' };
  }
  const bundles = readReflectionBundles(storage);
  const bundle = bundles.find(
    (row) => Number(row.createdAt) === createdAt && !row.presenceSessionId
  );
  if (!bundle) return { ok: false, reason: 'not_found' };

  const state = readPresenceSignals(storage);
  const legacySignals = legacyReflectionSignalsForBundle(bundle, state.entries);
  const dropIds = new Set(legacySignals.map((row) => row.id));
  writePresenceSignals(storage, {
    entries: state.entries.filter((row) => !dropIds.has(row.id))
  });
  writeReflectionBundles(
    storage,
    bundles.filter((row) => Number(row.createdAt) !== createdAt)
  );
  return {
    ok: true,
    removedBundles: 1,
    removedSignals: dropIds.size
  };
}
