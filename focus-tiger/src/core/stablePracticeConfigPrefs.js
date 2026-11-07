/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T77 — stable practice config signature (PR-2 storage).
 */

import { buildPracticeConfigSignature } from './practiceConfigSignature.js';
import {
  FOCUS_STABLE_DECAY_MS,
  FOCUS_STABLE_PROMOTE_MIN,
  FOCUS_STABLE_SUPPRESS_MS,
  FOCUS_STABLE_WINDOW,
  readStablePrefsState,
  writeStablePrefsState
} from './stablePrefsStore.js';

const YIN_ADAPTATION_STORAGE_KEY = 'focus-tiger.yin-adaptation.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {Storage | null}
 */
function resolveStore(storage) {
  if (storage) return storage;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
function readYinAdaptationEnabled(storage) {
  const store = resolveStore(storage);
  if (!store) return true;
  try {
    const raw = store.getItem(YIN_ADAPTATION_STORAGE_KEY);
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.enabled === false) return false;
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * User changed sitting template / recipe (qualifying pick before next begin).
 * @param {Storage | null | undefined} storage
 */
export function notePracticeConfigManualChange(storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.practiceAwaitingVote = true;
  writeStablePrefsState(state, store);
}

export function clearPracticeConfigAwaitingVote(storage) {
  const store = resolveStore(storage);
  const state = readStablePrefsState(store);
  state.practiceAwaitingVote = false;
  writeStablePrefsState(state, store);
}

/**
 * @param {object} opts
 * @param {import('./ritualRecipe/ritualRecipeSchema.js').RitualRecipe} opts.recipe
 * @param {Storage | null | undefined} [opts.storage]
 * @param {number} [opts.at]
 */
export function onPracticeConfigSessionBegin({ recipe, storage, at = Date.now() }) {
  const store = resolveStore(storage);
  const now = Number(at) || Date.now();
  const built = buildPracticeConfigSignature(recipe);
  const state = readStablePrefsState(store);
  const awaiting = state.practiceAwaitingVote === true;
  state.practiceAwaitingVote = false;

  let dim = state.practiceConfig;
  if (dim?.lastUsedAt && now - dim.lastUsedAt > FOCUS_STABLE_DECAY_MS) {
    state.practiceConfig = undefined;
    dim = undefined;
  }

  if (!awaiting) {
    if (dim) {
      state.practiceConfig = { ...dim, lastUsedAt: now };
      writeStablePrefsState(state, store);
    }
    return { countedVote: false, promoted: false };
  }

  /** @type {import('./stablePrefsStore.js').StablePracticeConfigVote} */
  const voteRow = {
    signature: built.signature,
    templateId: built.templateId,
    at: now
  };
  const windowRows = [...(state.practiceVoteWindow || []), voteRow].slice(
    -FOCUS_STABLE_WINDOW
  );
  state.practiceVoteWindow = windowRows;

  let promoted = false;
  const suppressUntil = Number(state.practiceSuppressUntil) || 0;
  if (now >= suppressUntil) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const row of windowRows) {
      counts.set(row.signature, (counts.get(row.signature) || 0) + 1);
    }
    let bestKey = '';
    let bestCount = 0;
    for (const [k, c] of counts) {
      if (c > bestCount) {
        bestCount = c;
        bestKey = k;
      }
    }
    if (bestKey && bestCount >= FOCUS_STABLE_PROMOTE_MIN) {
      state.practiceConfig = {
        signature: built.signature,
        templateId: built.templateId,
        recipeSnapshot: built.recipeSnapshot ?? undefined,
        lastUsedAt: now
      };
      promoted = true;
    }
  }

  if (!promoted && dim) {
    state.practiceConfig = { ...dim, lastUsedAt: now };
  }

  writeStablePrefsState(state, store);
  return { countedVote: true, promoted };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 */
export function readStablePracticeConfigDim(storage, now = Date.now()) {
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  const dim = state.practiceConfig;
  if (!dim) return null;
  const last = Number(dim.lastUsedAt) || 0;
  if (last > 0 && ts - last > FOCUS_STABLE_DECAY_MS) {
    const cleared = readStablePrefsState(storage);
    cleared.practiceConfig = undefined;
    writeStablePrefsState(cleared, storage);
    return null;
  }
  return dim;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {import('./stablePrefsStore.js').StablePracticeConfigDimState | null}
 */
export function resolveStablePracticeConfigForContinue(storage, now = Date.now()) {
  if (!readYinAdaptationEnabled(storage)) return null;
  const ts = Number(now) || Date.now();
  const state = readStablePrefsState(storage);
  if ((Number(state.practiceSuppressUntil) || 0) > ts) return null;
  return readStablePracticeConfigDim(storage, ts);
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [at]
 */
export function rejectStablePracticeConfigNotQuite(storage, at = Date.now()) {
  const store = resolveStore(storage);
  const ts = Number(at) || Date.now();
  const state = readStablePrefsState(store);
  state.practiceConfig = undefined;
  state.practiceVoteWindow = [];
  state.practiceAwaitingVote = false;
  state.practiceSuppressUntil = ts + FOCUS_STABLE_SUPPRESS_MS;
  writeStablePrefsState(state, store);
}
