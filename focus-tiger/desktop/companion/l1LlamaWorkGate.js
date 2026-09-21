/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One-layer mutex around getLlama / loadModel in the companion child.
 * Callers report chat vs embedding; the gate serializes native construction.
 * Not spriteChannelArbitration and not the shadow classify timeout gate.
 */

export const LLAMA_WORK_GATE_CHAT_WAIT_TIMEOUT = 'llama_work_gate_chat_wait_timeout';

/** @typedef {'chat' | 'embedding'} LlamaWorkIntent */

/**
 * @param {{
 *   chatWaitTimeoutMs?: number,
 *   setTimeoutFn?: typeof setTimeout,
 *   clearTimeoutFn?: typeof clearTimeout
 * }} [opts]
 */
export function createLlamaWorkGate(opts = {}) {
  const chatWaitTimeoutMs = opts.chatWaitTimeoutMs ?? 30_000;
  const setTimeoutFn = opts.setTimeoutFn || setTimeout;
  const clearTimeoutFn = opts.clearTimeoutFn || clearTimeout;

  /** @type {LlamaWorkIntent | null} */
  let holder = null;
  /** @type {Array<{ intent: LlamaWorkIntent, resolve: () => void, reject: (err: Error) => void, timeoutId: ReturnType<typeof setTimeout> | null }>} */
  let queue = [];

  function pickNextIndex() {
    const chatIdx = queue.findIndex((w) => w.intent === 'chat');
    if (chatIdx >= 0) return chatIdx;
    return queue.length ? 0 : -1;
  }

  function wakeNext() {
    if (holder) return;
    const idx = pickNextIndex();
    if (idx < 0) return;
    const next = queue.splice(idx, 1)[0];
    if (next.timeoutId != null) clearTimeoutFn(next.timeoutId);
    holder = next.intent;
    next.resolve();
  }

  /**
   * @param {LlamaWorkIntent} intent
   * @returns {Promise<void>}
   */
  function acquire(intent) {
    if (intent !== 'chat' && intent !== 'embedding') {
      return Promise.reject(new Error('llama_work_gate_unknown_intent'));
    }
    if (!holder) {
      holder = intent;
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const waiter = {
        intent,
        resolve,
        reject,
        timeoutId: null
      };
      if (intent === 'chat') {
        waiter.timeoutId = setTimeoutFn(() => {
          const i = queue.indexOf(waiter);
          if (i >= 0) queue.splice(i, 1);
          const err = new Error(LLAMA_WORK_GATE_CHAT_WAIT_TIMEOUT);
          err.code = LLAMA_WORK_GATE_CHAT_WAIT_TIMEOUT;
          reject(err);
        }, chatWaitTimeoutMs);
        if (waiter.timeoutId && typeof waiter.timeoutId.unref === 'function') {
          waiter.timeoutId.unref();
        }
      }
      queue.push(waiter);
    });
  }

  function release() {
    if (!holder) return;
    holder = null;
    wakeNext();
  }

  function snapshot() {
    return {
      holder,
      waitingChat: queue.filter((w) => w.intent === 'chat').length,
      waitingEmbedding: queue.filter((w) => w.intent === 'embedding').length
    };
  }

  /**
   * @template T
   * @param {LlamaWorkIntent} intent
   * @param {() => Promise<T>} work
   * @returns {Promise<T>}
   */
  async function run(intent, work) {
    await acquire(intent);
    try {
      return await work();
    } finally {
      release();
    }
  }

  return { acquire, release, run, snapshot };
}
