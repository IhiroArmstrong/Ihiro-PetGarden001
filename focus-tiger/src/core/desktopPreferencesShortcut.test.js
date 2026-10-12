/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DESKTOP_PREFERENCES_SHORTCUT_CANDIDATES,
  resolvePrimaryPreferenceProxy
} from './desktopPreferencesShortcut.js';
import { listPreferencesGroupProxies } from './idleChromeOrchestration.js';

describe('resolvePrimaryPreferenceProxy', () => {
  it('prefers reminder when available', () => {
    assert.equal(
      resolvePrimaryPreferenceProxy({
        reminderAvailable: true,
        languagePickerAvailable: true,
        newsletterSubmitted: false
      }),
      'reminder'
    );
  });

  it('falls back to language when reminder is unavailable', () => {
    assert.equal(
      resolvePrimaryPreferenceProxy({
        reminderAvailable: false,
        languagePickerAvailable: true,
        newsletterSubmitted: false
      }),
      'language'
    );
  });

  it('falls back to newsletter before backup', () => {
    assert.equal(
      resolvePrimaryPreferenceProxy({
        reminderAvailable: false,
        languagePickerAvailable: false,
        newsletterSubmitted: false
      }),
      'newsletter'
    );
  });

  it('opens backup when newsletter already submitted', () => {
    assert.equal(
      resolvePrimaryPreferenceProxy({
        reminderAvailable: false,
        languagePickerAvailable: false,
        newsletterSubmitted: true
      }),
      'local-backup'
    );
  });

  it('shortcut candidates stay in Preferences menu order (A3)', () => {
    const menuOrder = listPreferencesGroupProxies('wide-more', {
      microRitualVisible: true,
      companionVisible: true,
      companionEnabled: true,
      reminderAvailable: true,
      confideUserVisible: true,
      companionGeneration: true,
      mustardSeedSealUnlocked: true,
      systemTtsAvailable: true,
      newsletterSubmitted: false,
      scenesEntitled: true
    });
    const positions = DESKTOP_PREFERENCES_SHORTCUT_CANDIDATES.map((proxy) =>
      menuOrder.indexOf(proxy)
    );
    assert.ok(positions.every((i) => i >= 0));
    for (let i = 1; i < positions.length; i += 1) {
      assert.ok(
        positions[i] > positions[i - 1],
        'desktop shortcut order must follow menu Preferences order'
      );
    }
  });
});
