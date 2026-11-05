/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { sha256HexFromBuffer } from './guidedMeditationMediaVerify.js';

describe('guidedMeditationMediaVerify', () => {
  it('sha256HexFromBuffer matches known empty hash', async () => {
    const hex = await sha256HexFromBuffer(new ArrayBuffer(0));
    assert.equal(
      hex,
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});
