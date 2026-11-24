/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canUseGlobalSitHotkey } from './globalSitHotkeyBridge.js';

describe('globalSitHotkeyBridge', () => {
  it('is off on the website', () => {
    assert.equal(canUseGlobalSitHotkey({}), false);
    assert.equal(canUseGlobalSitHotkey({ desktopShell: { isDesktop: true } }), false);
  });

  it('is on when Electron exposes getGlobalSitHotkey', () => {
    assert.equal(
      canUseGlobalSitHotkey({
        desktopShell: {
          isDesktop: true,
          getGlobalSitHotkey: async () => ({ accelerator: 'Command+Control+Shift+S' })
        }
      }),
      true
    );
  });
});
