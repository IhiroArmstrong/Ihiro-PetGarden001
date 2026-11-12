/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isIosShortcutsHealthSurface } from './healthShortcutPlatform.js';

describe('isIosShortcutsHealthSurface', () => {
  it('detects iPhone user agent', () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5
      }
    });
    assert.equal(isIosShortcutsHealthSurface(), true);
  });
});
