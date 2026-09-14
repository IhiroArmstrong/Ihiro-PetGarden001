/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolvePrimaryPreferenceProxy } from './desktopPreferencesShortcut.js';

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
});
