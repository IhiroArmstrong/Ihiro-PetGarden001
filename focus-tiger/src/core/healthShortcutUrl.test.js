/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HEALTH_SHORTCUT_FIXED_NAME,
  buildHealthShortcutRunUrl
} from './healthShortcutUrl.js';

describe('buildHealthShortcutRunUrl', () => {
  it('encodes fixed shortcut name and sit minutes', () => {
    const url = buildHealthShortcutRunUrl(5, 'sit');
    assert.ok(url);
    assert.match(url, /^shortcuts:\/\/run-shortcut\?/);
    assert.match(
      url,
      new RegExp(
        `name=${encodeURIComponent(HEALTH_SHORTCUT_FIXED_NAME).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      )
    );
    assert.match(url, /text=5$/);
  });

  it('appends practice kind for non-sit', () => {
    const url = buildHealthShortcutRunUrl(1, 'breath');
    assert.equal(url?.includes('text=1%2Cbreath'), true);
  });

  it('rejects invalid minutes', () => {
    assert.equal(buildHealthShortcutRunUrl(0), null);
    assert.equal(buildHealthShortcutRunUrl(1.5), null);
    assert.equal(buildHealthShortcutRunUrl(NaN), null);
  });
});
