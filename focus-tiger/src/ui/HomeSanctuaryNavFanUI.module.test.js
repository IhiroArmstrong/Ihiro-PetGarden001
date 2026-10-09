/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('HomeSanctuaryNavFanUI module load', () => {
  it('imports the shared overlay escape layer', async () => {
    const mod = await import('./HomeSanctuaryNavFanUI.js');
    assert.equal(typeof mod.HomeSanctuaryNavFanUI, 'function');
  });
});
