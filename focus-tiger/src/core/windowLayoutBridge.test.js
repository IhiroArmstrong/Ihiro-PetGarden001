/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyWindowLayout,
  canUseWindowLayout,
  readWindowLayout
} from './windowLayoutBridge.js';

describe('windowLayoutBridge', () => {
  it('stays off on the web', () => {
    assert.equal(canUseWindowLayout({}), false);
    assert.equal(canUseWindowLayout({ desktopShell: { isDesktop: true } }), false);
  });

  it('applies companion and fullscreen through the desktop shell', async () => {
    let layout = 'regular';
    const globalObj = {
      desktopShell: {
        isDesktop: true,
        getWindowLayout: async () => layout,
        applyWindowLayout: async (action) => {
          layout = action === 'fullscreen' ? 'fullscreen' : 'companion';
          return { layout, saved: true };
        }
      }
    };
    assert.equal(canUseWindowLayout(globalObj), true);
    assert.equal(await readWindowLayout(globalObj), 'regular');
    assert.deepEqual(await applyWindowLayout('companion', globalObj), {
      layout: 'companion',
      saved: true
    });
    assert.equal(await readWindowLayout(globalObj), 'companion');
    assert.deepEqual(await applyWindowLayout('fullscreen', globalObj), {
      layout: 'fullscreen',
      saved: true
    });
  });
});
