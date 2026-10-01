/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createLlamaWorkGate,
  LLAMA_WORK_GATE_CHAT_WAIT_TIMEOUT
} from './l1LlamaWorkGate.js';

function deferred() {
  /** @type {(value?: unknown) => void} */
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('l1LlamaWorkGate', () => {
  it('refuses overlapping getLlama holds', async () => {
    const gate = createLlamaWorkGate();
    const firstHold = deferred();
    let embedEntered = false;
    const chatP = gate.run('chat', async () => firstHold.promise);
    await Promise.resolve();
    const embedP = gate.run('embedding', async () => {
      embedEntered = true;
    });
    await Promise.resolve();
    assert.equal(gate.snapshot().holder, 'chat');
    assert.equal(embedEntered, false);
    firstHold.resolve();
    await chatP;
    await embedP;
    assert.equal(embedEntered, true);
    assert.equal(gate.snapshot().holder, null);
  });

  it('lets queued chat run before queued embedding', async () => {
    const gate = createLlamaWorkGate();
    const firstHold = deferred();
    const order = [];
    const first = gate.run('chat', async () => firstHold.promise);
    await Promise.resolve();
    const embedP = gate.run('embedding', async () => {
      order.push('embedding');
    });
    await Promise.resolve();
    const chatP = gate.run('chat', async () => {
      order.push('chat');
    });
    await Promise.resolve();
    assert.equal(gate.snapshot().waitingChat, 1);
    assert.equal(gate.snapshot().waitingEmbedding, 1);
    firstHold.resolve();
    await Promise.all([first, embedP, chatP]);
    assert.deepEqual(order, ['chat', 'embedding']);
  });

  it('times out chat wait without leaving a permanent waiter', async () => {
    /** @type {Array<() => void>} */
    const pendingTimers = [];
    const gate = createLlamaWorkGate({
      chatWaitTimeoutMs: 30_000,
      setTimeoutFn: (fn) => {
        pendingTimers.push(fn);
        return pendingTimers.length;
      },
      clearTimeoutFn: () => {}
    });
    const embedHold = deferred();
    const embedP = gate.run('embedding', async () => embedHold.promise);
    await Promise.resolve();
    const chatP = gate.run('chat', async () => {});
    await Promise.resolve();
    assert.equal(pendingTimers.length, 1);
    pendingTimers[0]();
    await assert.rejects(
      chatP,
      (err) => err && err.message === LLAMA_WORK_GATE_CHAT_WAIT_TIMEOUT
    );
    assert.equal(gate.snapshot().waitingChat, 0);
    assert.equal(gate.snapshot().holder, 'embedding');
    embedHold.resolve();
    await embedP;
    await gate.run('chat', async () => {});
    assert.equal(gate.snapshot().holder, null);
  });
});
