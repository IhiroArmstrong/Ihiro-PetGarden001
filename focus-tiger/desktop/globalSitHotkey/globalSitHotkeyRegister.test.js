/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { T10_VOICE_PTT_ACCELERATOR } from '../../src/core/globalSitHotkeyPolicy.js';
import {
  registerGlobalSitHotkey,
  unregisterGlobalSitHotkey
} from './globalSitHotkeyRegister.js';

function fakeShortcut() {
  /** @type {string[]} */
  const registered = [];
  return {
    registered,
    register(acc) {
      registered.push(acc);
      return true;
    },
    unregister(acc) {
      const i = registered.indexOf(acc);
      if (i >= 0) registered.splice(i, 1);
    }
  };
}

describe('globalSitHotkeyRegister', () => {
  it('registers the default and never unregisters T10', () => {
    const gs = fakeShortcut();
    gs.registered.push(T10_VOICE_PTT_ACCELERATOR);
    const result = registerGlobalSitHotkey({
      globalShortcut: gs,
      previousAccelerator: T10_VOICE_PTT_ACCELERATOR,
      accelerator: 'Command+Control+Shift+S',
      onFire: () => {}
    });
    assert.equal(result.registered, true);
    assert.ok(gs.registered.includes(T10_VOICE_PTT_ACCELERATOR));
    unregisterGlobalSitHotkey(gs, result.accelerator);
    assert.ok(gs.registered.includes(T10_VOICE_PTT_ACCELERATOR));
  });

  it('does not register Control+Option', () => {
    const gs = fakeShortcut();
    const result = registerGlobalSitHotkey({
      globalShortcut: gs,
      accelerator: 'Control+Option+S',
      onFire: () => {}
    });
    assert.equal(result.registered, false);
    assert.equal(result.reason, 'control-option');
    assert.equal(gs.registered.length, 0);
  });
});
