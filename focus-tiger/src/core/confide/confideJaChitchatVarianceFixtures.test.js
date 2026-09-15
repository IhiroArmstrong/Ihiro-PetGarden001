/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply } from './confideReplyFlow.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import { CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES } from './confideJaChitchatVarianceFixtures.js';

describe('confide ja chitchat variance fixtures (#774)', () => {
  it('locks five diff samples for probe runs', () => {
    assert.equal(CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length, 5);
    assert.deepEqual(
      CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.map((row) => row.text),
      [
        '小可耐喜欢吃胖粉吗？',
        '小姐姐喜欢吃啥？',
        '我今天不太想静坐练习。',
        'I only have ten minutes. Is that still worth doing?',
        "Today was a mess. Anyway, let's begin."
      ]
    );
  });

  it('each sample classifies to fallback and may enter L3 generate on desktop', () => {
    for (const fixture of CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES) {
      const hit = resolveConfideReply({ text: fixture.text, locale: 'ja' });
      assert.ok(hit, fixture.id);
      assert.equal(hit.route, CONFIDE_ROUTE.FALLBACK, fixture.id);
      assert.equal(
        shouldUseDesktopCompanionGenerate({
          route: hit.route,
          generateEnabled: true,
          generateLayerOpen: true,
          hasGenerateFn: true
        }),
        true,
        fixture.id
      );
    }
  });
});
