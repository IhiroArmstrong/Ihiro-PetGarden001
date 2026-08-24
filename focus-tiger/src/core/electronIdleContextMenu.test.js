/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  bindElectronIdleContextMenu,
  isElectronIdleContextMenuTarget
} from './electronIdleContextMenu.js';

describe('electronIdleContextMenu', () => {
  it('rejects interactive targets', () => {
    const btn = { closest: (sel) => (sel.includes('button') ? btn : null) };
    assert.equal(isElectronIdleContextMenuTarget(btn), false);
  });

  it('rejects session chrome targets', () => {
    const dock = {
      closest: (sel) => (String(sel).includes('#session-start-dock') ? dock : null)
    };
    assert.equal(isElectronIdleContextMenuTarget(dock), false);
  });

  it('allows blank scene targets', () => {
    const scene = { closest: () => null };
    assert.equal(isElectronIdleContextMenuTarget(scene), true);
  });

  it('does not bind outside Electron shell', () => {
    const unbind = bindElectronIdleContextMenu({
      getIsIdleContextMenuAllowed: () => true,
      onOpenSecondaryMenu: () => {}
    });
    assert.equal(typeof unbind, 'function');
  });
});
