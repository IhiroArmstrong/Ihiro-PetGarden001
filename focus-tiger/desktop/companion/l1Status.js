/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pure L1 companion status. generateEnabled is a snapshot overlay in runtime.
 */

export const COMPANION_L1_PHASES = Object.freeze([
  'idle',
  'downloading',
  'loading',
  'ready',
  'unloading',
  'error'
]);

/** Shadow semantic routing only — must not drive Confide status strip copy. */
export const COMPANION_L1_EMBEDDING_SHADOW_PHASES = Object.freeze([
  'embedding_downloading',
  'embedding_loading'
]);

/** @param {string} phase */
export function isEmbeddingShadowPhase(phase) {
  return typeof phase === 'string' && phase.startsWith('embedding_');
}

const MAIN_PHASES_THAT_MUST_NOT_REPLACE_READY = new Set(['downloading', 'loading']);

/**
 * @returns {{
 *   phase: string,
 *   focusing: boolean,
 *   received: number | null,
 *   total: number | null,
 *   error: string | null,
 *   generateEnabled: false
 * }}
 */
export function createCompanionStatus() {
  return {
    phase: 'idle',
    focusing: false,
    received: null,
    total: null,
    error: null,
    generateEnabled: false
  };
}

/**
 * @param {ReturnType<typeof createCompanionStatus>} status
 * @param {object} ev
 * @returns {ReturnType<typeof createCompanionStatus>}
 */
export function applyCompanionEvent(status, ev) {
  const next = {
    ...status,
    generateEnabled: false
  };
  const event = ev && ev.event;
  if (event === 'progress') {
    // Guard B: shadow embedding must not touch progress while main model is ready.
    if (status.phase === 'ready') {
      return status;
    }
    const received = Number(ev.received);
    const total = Number(ev.total);
    next.received = Number.isFinite(received) ? received : next.received;
    next.total = Number.isFinite(total) && total > 0 ? total : next.total;
    if (next.phase === 'idle') next.phase = 'downloading';
    return next;
  }
  if (event === 'status' && typeof ev.phase === 'string') {
    // Guard A: embedding lifecycle is shadow-only — ignore for visible status.
    if (isEmbeddingShadowPhase(ev.phase)) {
      return status;
    }
    // Guard B: main model ready must not be downgraded by late download/load events.
    if (
      status.phase === 'ready' &&
      MAIN_PHASES_THAT_MUST_NOT_REPLACE_READY.has(ev.phase)
    ) {
      return status;
    }
    next.phase = ev.phase;
    if (ev.phase === 'error' && ev.message) next.error = String(ev.message);
    if (ev.phase !== 'error') next.error = null;
    if (
      ev.phase === 'loading' ||
      ev.phase === 'idle' ||
      ev.phase === 'unloading'
    ) {
      next.received = null;
      next.total = null;
    }
    return next;
  }
  if (event === 'ready') {
    next.phase = 'ready';
    next.error = null;
    return next;
  }
  if (event === 'unloaded') {
    next.phase = 'idle';
    next.received = null;
    next.total = null;
    return next;
  }
  if (event === 'error') {
    next.phase = 'error';
    next.error = ev && ev.message ? String(ev.message) : 'companion_error';
    return next;
  }
  if (event === 'generated' || event === 'generate_error') {
    return status;
  }
  return next;
}

/**
 * @param {string} line
 * @returns {object | null}
 */
export function parseCompanionNdjsonLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}
