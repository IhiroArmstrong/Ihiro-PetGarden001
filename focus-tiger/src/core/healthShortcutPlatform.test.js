/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canConfigureHealthShortcutLogPreference,
  isIosShortcutsHealthSurface
} from './healthShortcutPlatform.js';

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

describe('canConfigureHealthShortcutLogPreference', () => {
  it('refuses desktop shell even when user agent looks mobile', () => {
    const prev = globalThis.desktopShell;
    globalThis.desktopShell = { isDesktop: true };
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5
      }
    });
    assert.equal(canConfigureHealthShortcutLogPreference(), false);
    if (prev === undefined) delete globalThis.desktopShell;
    else globalThis.desktopShell = prev;
  });

  it('allows iPhone Safari web without desktop shell', () => {
    const prev = globalThis.desktopShell;
    delete globalThis.desktopShell;
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5
      }
    });
    assert.equal(canConfigureHealthShortcutLogPreference(), true);
    if (prev !== undefined) globalThis.desktopShell = prev;
  });
});
