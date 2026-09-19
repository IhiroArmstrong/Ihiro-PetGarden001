/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Tracks shadow-only embedding readiness separately from main L0 chat status.
 * Prompt 11: cold-load wait must not consume the post-ready classify timeout budget.
 */

/** @typedef {'unknown' | 'loading' | 'ready' | 'error'} SemanticShadowEmbeddingState */

/**
 * @returns {{
 *   snapshot: () => { state: SemanticShadowEmbeddingState, errorMessage: string | null },
 *   reset: () => void,
 *   isReady: () => boolean,
 *   hasError: () => boolean,
 *   markLoading: () => void,
 *   applyEvent: (ev: { event?: string, message?: string }) => void,
 *   waitForReady: () => Promise<{ ok: true } | { ok: false, reason: string, message?: string | null }>,
 *   shouldRequestEnsure: () => boolean
 * }}
 */
export function createSemanticShadowEmbeddingGate() {
  /** @type {SemanticShadowEmbeddingState} */
  let state = 'unknown';
  /** @type {string | null} */
  let errorMessage = null;
  /** @type {Array<(result: { ok: true } | { ok: false, reason: string, message?: string | null }) => void>} */
  let waiters = [];

  /**
   * @param {{ ok: true } | { ok: false, reason: string, message?: string | null }} result
   */
  function flushWaiters(result) {
    const pending = waiters;
    waiters = [];
    pending.forEach((resolve) => resolve(result));
  }

  return {
    snapshot() {
      return { state, errorMessage };
    },
    reset() {
      state = 'unknown';
      errorMessage = null;
      flushWaiters({ ok: false, reason: 'reset' });
    },
    isReady() {
      return state === 'ready';
    },
    hasError() {
      return state === 'error';
    },
    markLoading() {
      if (state === 'ready') return;
      state = 'loading';
    },
    applyEvent(ev) {
      if (ev?.event === 'embedding_ready') {
        state = 'ready';
        errorMessage = null;
        flushWaiters({ ok: true });
        return;
      }
      if (ev?.event === 'embedding_error') {
        state = 'error';
        errorMessage = typeof ev.message === 'string' ? ev.message : 'embedding_error';
        flushWaiters({
          ok: false,
          reason: 'embed_unavailable',
          message: errorMessage
        });
      }
    },
    waitForReady() {
      if (state === 'ready') return Promise.resolve({ ok: true });
      if (state === 'error') {
        return Promise.resolve({
          ok: false,
          reason: 'embed_unavailable',
          message: errorMessage
        });
      }
      return new Promise((resolve) => {
        waiters.push(resolve);
      });
    },
    shouldRequestEnsure() {
      return state === 'unknown';
    }
  };
}

/**
 * Race classify completion against a timeout that starts only after embedding is ready.
 *
 * @param {{
 *   waitForEmbeddingReady: () => Promise<{ ok: true } | { ok: false, reason: string, message?: string | null }>,
 *   runClassify: () => Promise<{ event: string, message?: string } | null>,
 *   classifyTimeoutMs: number,
 *   sleep?: (ms: number) => Promise<void>
 * }} opts
 */
export async function runSemanticShadowClassifyWithEmbeddingGate(opts) {
  const sleep = opts.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const ready = await opts.waitForEmbeddingReady();
  if (!ready.ok) {
    return {
      ok: false,
      reason: ready.reason || 'embed_unavailable',
      message: ready.message || null
    };
  }

  const classifyPromise = opts.runClassify();
  const timed = await Promise.race([
    classifyPromise,
    sleep(opts.classifyTimeoutMs).then(() => ({ event: 'timeout' }))
  ]);

  if (timed?.event === 'semantic_shadow_classified') {
    return { ok: true, event: timed };
  }
  if (timed?.event === 'timeout') {
    return { ok: false, reason: 'timeout' };
  }
  return {
    ok: false,
    reason: timed?.message || 'embed_failed'
  };
}
