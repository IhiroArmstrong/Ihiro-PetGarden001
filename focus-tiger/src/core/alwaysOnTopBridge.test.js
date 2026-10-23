/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canUseAlwaysOnTop,
  readAlwaysOnTopEnabled,
  writeAlwaysOnTopEnabled
} from './alwaysOnTopBridge.js';

describe('alwaysOnTopBridge', () => {
  it('stays off on the web', () => {
    assert.equal(canUseAlwaysOnTop({}), false);
    assert.equal(canUseAlwaysOnTop({ desktopShell: { isDesktop: true } }), false);
  });

  it('reads and writes through the desktop shell', async () => {
    let stored = false;
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        getAlwaysOnTop: async () => stored,
        setAlwaysOnTop: async (value) => {
          stored = value === true;
          return stored;
        }
      }
    };
    assert.equal(canUseAlwaysOnTop(globalObj), true);
    assert.equal(await readAlwaysOnTopEnabled(globalObj), false);
    const result = await writeAlwaysOnTopEnabled(true, globalObj);
    assert.deepEqual(result, { enabled: true, saved: true });
    assert.equal(await readAlwaysOnTopEnabled(globalObj), true);
  });
});
