/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canUseInputRhythm,
  readInputRhythmSnapshot,
  writeInputRhythmEnabled
} from './inputRhythmBridge.js';

describe('inputRhythmBridge', () => {
  it('stays unavailable on the web', async () => {
    assert.equal(canUseInputRhythm({}), false);
    const snap = await readInputRhythmSnapshot({});
    assert.equal(snap.enabled, false);
    assert.equal(snap.available, false);
    const result = await writeInputRhythmEnabled(true, {});
    assert.equal(result.enabled, false);
    assert.equal(result.saved, false);
  });
});
