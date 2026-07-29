import test from 'node:test';
import assert from 'node:assert/strict';
import { AcrossToolsIdleGuard } from './AcrossToolsIdleGuard.js';

test('AcrossToolsIdleGuard fires once after threshold without activity', () => {
  let now = 0;
  let idleCount = 0;
  const listeners = new Map();
  const doc = {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) || [];
      listeners.set(
        type,
        list.filter((x) => x !== fn)
      );
    }
  };

  const guard = new AcrossToolsIdleGuard({
    thresholdMs: 1_000,
    now: () => now,
    documentRef: doc,
    windowRef: { addEventListener() {}, removeEventListener() {} }
  });

  // Patch setInterval for deterministic ticks
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalFn = null;
  globalThis.setInterval = (fn) => {
    intervalFn = fn;
    return 1;
  };
  globalThis.clearInterval = () => {
    intervalFn = null;
  };

  try {
    guard.start({ onIdle: () => idleCount++ });
    now = 500;
    intervalFn();
    assert.equal(idleCount, 0);
    now = 1_500;
    intervalFn();
    assert.equal(idleCount, 1);
    now = 5_000;
    intervalFn();
    assert.equal(idleCount, 1);
  } finally {
    guard.stop();
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
  }
});

test('AcrossToolsIdleGuard pointer activity resets the idle clock', () => {
  let now = 0;
  let idleCount = 0;
  const listeners = new Map();
  const doc = {
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      const list = listeners.get(type) || [];
      listeners.set(
        type,
        list.filter((x) => x !== fn)
      );
    }
  };

  const guard = new AcrossToolsIdleGuard({
    thresholdMs: 1_000,
    now: () => now,
    documentRef: doc,
    windowRef: { addEventListener() {}, removeEventListener() {} }
  });

  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  let intervalFn = null;
  globalThis.setInterval = (fn) => {
    intervalFn = fn;
    return 1;
  };
  globalThis.clearInterval = () => {
    intervalFn = null;
  };

  try {
    guard.start({ onIdle: () => idleCount++ });
    now = 800;
    intervalFn();
    assert.equal(idleCount, 0);
    for (const fn of listeners.get('keydown') || []) fn();
    now = 1_600;
    intervalFn();
    assert.equal(idleCount, 0);
    now = 2_600;
    intervalFn();
    assert.equal(idleCount, 1);
  } finally {
    guard.stop();
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
  }
});
