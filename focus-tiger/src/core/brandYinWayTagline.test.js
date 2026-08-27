/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveBrandYinWayTagline } from './brandYinWayTagline.js';

const t = (key) =>
  ({
    BRAND_YIN_WAY_TAGLINE: 'Walking the Yin Way?',
    BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_EN: 'Walking the Yin Way?',
    BRAND_YIN_WAY_TAGLINE_FIRST_VISIT_JA: '寅の道を歩む'
  })[key] ?? key;

test('resolveBrandYinWayTagline follows locale when not bilingual', () => {
  const msg = resolveBrandYinWayTagline({ t });
  assert.equal(msg.bilingual, false);
  assert.deepEqual(msg.lines, [
    { text: 'Walking the Yin Way?', role: 'primary' }
  ]);
});

test('resolveBrandYinWayTagline bilingual first visit stacks EN + (JA)', () => {
  const msg = resolveBrandYinWayTagline({ bilingualFirstVisit: true, t });
  assert.equal(msg.bilingual, true);
  assert.deepEqual(msg.lines, [
    { text: 'Walking the Yin Way?', role: 'primary' },
    { text: '(寅の道を歩む)', role: 'secondary' }
  ]);
});
