/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  msUntilLateNightBoundary,
  resolveNightSceneDimActive,
  syncNightSceneDim,
  NIGHT_DIM_DATA_ATTR
} from './nightSceneDim.js';

describe('nightSceneDim (T48)', () => {
  it('resolveNightSceneDimActive follows late-night window', () => {
    assert.equal(
      resolveNightSceneDimActive(new Date(2026, 0, 1, 23, 30), ''),
      true
    );
    assert.equal(
      resolveNightSceneDimActive(new Date(2026, 0, 1, 12, 0), ''),
      false
    );
  });

  it('lab query overrides wall clock', () => {
    assert.equal(
      resolveNightSceneDimActive(new Date(2026, 0, 1, 12, 0), '?nightDim=1'),
      true
    );
    assert.equal(
      resolveNightSceneDimActive(new Date(2026, 0, 1, 23, 0), '?nightDim=0'),
      false
    );
  });

  it('msUntilLateNightBoundary targets next 23:00 or 06:00', () => {
    const noon = new Date(2026, 5, 1, 12, 30, 0, 0);
    assert.equal(msUntilLateNightBoundary(noon), 10.5 * 60 * 60 * 1000);

    const twoAm = new Date(2026, 5, 1, 2, 0, 0, 0);
    assert.equal(msUntilLateNightBoundary(twoAm), 4 * 60 * 60 * 1000);

    const elevenPm = new Date(2026, 5, 1, 23, 15, 0, 0);
    assert.equal(
      msUntilLateNightBoundary(elevenPm),
      6 * 60 * 60 * 1000 + 45 * 60 * 1000
    );
  });

  it('syncNightSceneDim toggles html data attribute', () => {
    const el = { attributes: {}, setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; } };
    syncNightSceneDim({
      documentElement: el,
      now: new Date(2026, 0, 1, 23, 0),
      search: ''
    });
    assert.equal(el.attributes[NIGHT_DIM_DATA_ATTR], '1');
    syncNightSceneDim({
      documentElement: el,
      now: new Date(2026, 0, 1, 14, 0),
      search: ''
    });
    assert.equal(el.attributes[NIGHT_DIM_DATA_ATTR], undefined);
  });
});
