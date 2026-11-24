/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { DEFAULT_GLOBAL_SIT_ACCELERATOR } from '../../src/core/globalSitHotkeyPolicy.js';
import {
  loadGlobalSitHotkeyPrefs,
  saveGlobalSitHotkeyPrefs
} from './globalSitHotkeyPrefs.js';

describe('globalSitHotkeyPrefs', () => {
  it('defaults to the locked accelerator and rejects Control+Shift+Y', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gsh-'));
    assert.equal(loadGlobalSitHotkeyPrefs(dir).accelerator, DEFAULT_GLOBAL_SIT_ACCELERATOR);
    const blocked = saveGlobalSitHotkeyPrefs(dir, { accelerator: 'Control+Shift+Y' });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.reason, 't10-reserved');
    assert.equal(blocked.saved, false);
    assert.equal(loadGlobalSitHotkeyPrefs(dir).accelerator, DEFAULT_GLOBAL_SIT_ACCELERATOR);
  });

  it('persists a legal custom accelerator', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gsh-'));
    const saved = saveGlobalSitHotkeyPrefs(dir, {
      accelerator: 'Command+Control+Shift+D'
    });
    assert.equal(saved.ok, true);
    assert.equal(loadGlobalSitHotkeyPrefs(dir).accelerator, saved.accelerator);
  });
});
