/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  DEFAULT_ALWAYS_ON_TOP_PREFS,
  loadAlwaysOnTopPrefs,
  normalizeAlwaysOnTopPrefs,
  saveAlwaysOnTopPrefs
} from './alwaysOnTopPolicy.js';

describe('alwaysOnTopPolicy', () => {
  it('defaults off', () => {
    assert.equal(DEFAULT_ALWAYS_ON_TOP_PREFS.enabled, false);
    assert.equal(normalizeAlwaysOnTopPrefs(null).enabled, false);
    assert.equal(normalizeAlwaysOnTopPrefs({ enabled: 'yes' }).enabled, false);
    assert.equal(normalizeAlwaysOnTopPrefs({ enabled: true }).enabled, true);
  });

  it('round-trips userData json', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-aot-'));
    assert.equal(loadAlwaysOnTopPrefs(dir).enabled, false);
    const saved = saveAlwaysOnTopPrefs(dir, { enabled: true });
    assert.equal(saved.enabled, true);
    assert.equal(loadAlwaysOnTopPrefs(dir).enabled, true);
  });
});
