/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canEnrollCoPracticeResearch } from './PracticeStudyConsentPanelUI.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

describe('PracticeStudyConsentPanelUI', () => {
  it('requires adult and layer1 before enroll', () => {
    assert.equal(canEnrollCoPracticeResearch({ adult: false, layer1: true }), false);
    assert.equal(canEnrollCoPracticeResearch({ adult: true, layer1: false }), false);
    assert.equal(canEnrollCoPracticeResearch({ adult: true, layer1: true }), true);
  });

  it('locale slice avoids coin / guilt pressure terms in en', () => {
    const raw = readFileSync(
      join(here, '../locales/slices/co-practice-research-consent.json'),
      'utf8'
    );
    const slice = JSON.parse(raw);
    const en = JSON.stringify(slice.en).toLowerCase();
    for (const bad of ['coin', 'countdown', 'yin coin']) {
      assert.ok(!en.includes(bad), `forbidden term: ${bad}`);
    }
  });
});
