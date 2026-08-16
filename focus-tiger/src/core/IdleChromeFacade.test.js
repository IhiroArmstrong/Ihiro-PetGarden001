/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IdleChromeFacade } from './IdleChromeFacade.js';
import { NARROW_STAGE_CLASS } from './idleChromeOrchestration.js';

function mockShell() {
  /** @type {Record<string, unknown>} */
  const state = {
    handlers: {},
    idle: true,
    suppressed: false,
    keepQuickStart: false,
    releaseCount: 0,
    clearStageCount: 0
  };
  return {
    state,
    setHandlers(h) {
      state.handlers = { ...state.handlers, ...h };
    },
    setIdle(v) {
      state.idle = Boolean(v);
    },
    setSuppressed(v, opts = {}) {
      state.suppressed = Boolean(v);
      state.keepQuickStart = Boolean(opts.keepQuickStart);
    },
    syncMuteVisual() {},
    isSheetOpen() {
      return false;
    },
    releaseInactivePresentation() {
      state.releaseCount += 1;
    },
    destroy() {}
  };
}

describe('IdleChromeFacade', () => {
  it('setHandlers fans shared onSound to both adapters once', () => {
    const narrow = mockShell();
    const wide = mockShell();
    let sound = 0;
    const facade = new IdleChromeFacade({
      narrow: /** @type {any} */ (narrow),
      wide: /** @type {any} */ (wide),
      matchMedia: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {}
      })
    });
    facade.setHandlers({
      onSound: () => {
        sound += 1;
      },
      onQuickStart: () => {}
    });
    assert.equal(typeof narrow.state.handlers.onSound, 'function');
    assert.equal(typeof wide.state.handlers.onSound, 'function');
    assert.equal(typeof narrow.state.handlers.onQuickStart, 'function');
    assert.equal(typeof wide.state.handlers.onQuickStart, 'function');
    narrow.state.handlers.onSound();
    wide.state.handlers.onSound();
    assert.equal(sound, 2);
    facade.destroy();
  });

  it('applyShellProjection fans idle/suppress flags', () => {
    const narrow = mockShell();
    const wide = mockShell();
    const facade = new IdleChromeFacade({
      narrow: /** @type {any} */ (narrow),
      wide: /** @type {any} */ (wide),
      matchMedia: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {}
      })
    });
    facade.applyShellProjection({
      narrow: { idle: false, suppressed: true, keepQuickStart: true },
      wide: { idle: false, suppressed: true, keepQuickStart: true }
    });
    assert.equal(narrow.state.idle, false);
    assert.equal(narrow.state.suppressed, true);
    assert.equal(narrow.state.keepQuickStart, true);
    assert.equal(wide.state.idle, false);
    assert.equal(wide.state.suppressed, true);
    assert.equal(wide.state.keepQuickStart, true);
    facade.destroy();
  });

  it('breakpoint change releases inactive presentation without onClearStage', () => {
    const narrow = mockShell();
    const wide = mockShell();
    let matches = true;
    const listeners = new Set();
    const facade = new IdleChromeFacade({
      narrow: /** @type {any} */ (narrow),
      wide: /** @type {any} */ (wide),
      matchMedia: () => ({
        get matches() {
          return matches;
        },
        addEventListener(_t, fn) {
          listeners.add(fn);
        },
        removeEventListener(_t, fn) {
          listeners.delete(fn);
        }
      })
    });
    let clearStage = 0;
    facade.setHandlers({
      onClearStage: () => {
        clearStage += 1;
      }
    });
    assert.equal(facade.isNarrow(), true);
    matches = false;
    for (const fn of listeners) fn();
    assert.equal(narrow.state.releaseCount, 1);
    assert.equal(wide.state.releaseCount, 0);
    assert.equal(clearStage, 0);
    facade.destroy();
  });

  it('clearAllStageClasses removes narrow+wide stage tokens when document exists', () => {
    if (typeof document === 'undefined') return;
    document.body.classList.add(NARROW_STAGE_CLASS.sound);
    const narrow = mockShell();
    const wide = mockShell();
    const facade = new IdleChromeFacade({
      narrow: /** @type {any} */ (narrow),
      wide: /** @type {any} */ (wide),
      matchMedia: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {}
      })
    });
    facade.clearAllStageClasses();
    assert.equal(
      document.body.classList.contains(NARROW_STAGE_CLASS.sound),
      false
    );
    facade.destroy();
  });
});
