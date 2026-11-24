/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_GLOBAL_SIT_ACCELERATOR,
  T10_VOICE_PTT_ACCELERATOR,
  acceleratorFromKeyEvent,
  globalSitPracticeSearch,
  normalizeAccelerator,
  resolveGlobalSitAccelerator,
  validateGlobalSitAccelerator
} from './globalSitHotkeyPolicy.js';

describe('globalSitHotkeyPolicy', () => {
  it('defaults to Command+Control+Shift+S', () => {
    assert.equal(DEFAULT_GLOBAL_SIT_ACCELERATOR, 'Command+Control+Shift+S');
    assert.equal(validateGlobalSitAccelerator(DEFAULT_GLOBAL_SIT_ACCELERATOR).ok, true);
    assert.equal(resolveGlobalSitAccelerator(''), DEFAULT_GLOBAL_SIT_ACCELERATOR);
  });

  it('rejects Control+Option combos (VoiceOver modifiers)', () => {
    const blocked = validateGlobalSitAccelerator('Control+Option+S');
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 'control-option');
    assert.equal(validateGlobalSitAccelerator('Control+Alt+Shift+S').ok, false);
  });

  it('rejects Control+Shift+Y (T10 voice PTT)', () => {
    const blocked = validateGlobalSitAccelerator('Control+Shift+Y');
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 't10-reserved');
    assert.equal(normalizeAccelerator('Ctrl+Shift+Y'), T10_VOICE_PTT_ACCELERATOR);
  });

  it('normalizes cmd/ctrl aliases without becoming VO or T10', () => {
    assert.equal(
      normalizeAccelerator('cmd+ctrl+shift+s'),
      'Control+Shift+Command+S'
    );
    assert.equal(validateGlobalSitAccelerator('cmd+ctrl+shift+s').ok, true);
  });

  it('builds an accelerator from a key event and still rejects Option+Control', () => {
    assert.equal(
      acceleratorFromKeyEvent({
        key: 's',
        ctrlKey: true,
        metaKey: true,
        shiftKey: true,
        altKey: false
      }),
      'Control+Shift+Command+S'
    );
    assert.equal(
      validateGlobalSitAccelerator(
        acceleratorFromKeyEvent({
          key: 's',
          ctrlKey: true,
          altKey: true
        })
      ).reason,
      'control-option'
    );
  });

  it('points sit apply at the same 5-minute deep-link query', () => {
    assert.equal(globalSitPracticeSearch(), 'product=1&start=sit&min=5');
  });
});
