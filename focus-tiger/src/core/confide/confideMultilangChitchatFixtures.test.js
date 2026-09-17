/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply } from './confideReplyFlow.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import {
  CONFIDE_MULTILANG_CHITCHAT_FIXTURES,
  CONFIDE_MULTILANG_CHITCHAT_LOCALES,
  fixturesForMultilangChitchatLocale
} from './confideMultilangChitchatFixtures.js';

describe('confide multilang chitchat fixtures (six-lang A/B)', () => {
  it('locks six locales with 18 sentences each (108 total)', () => {
    assert.equal(CONFIDE_MULTILANG_CHITCHAT_LOCALES.length, 6);
    assert.deepEqual(CONFIDE_MULTILANG_CHITCHAT_LOCALES, ['ja', 'en', 'it', 'de', 'es', 'fr']);
    assert.equal(CONFIDE_MULTILANG_CHITCHAT_FIXTURES.length, 108);
    for (const locale of CONFIDE_MULTILANG_CHITCHAT_LOCALES) {
      assert.equal(fixturesForMultilangChitchatLocale(locale).length, 18);
    }
  });

  it('ids are unique and locale-prefixed', () => {
    const ids = CONFIDE_MULTILANG_CHITCHAT_FIXTURES.map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const row of CONFIDE_MULTILANG_CHITCHAT_FIXTURES) {
      assert.match(row.id, new RegExp(`^${row.locale}-chitchat-\\d{2}$`));
    }
  });

  it('each sample classifies to fallback and may enter L3 generate on desktop', () => {
    for (const fixture of CONFIDE_MULTILANG_CHITCHAT_FIXTURES) {
      const hit = resolveConfideReply({ text: fixture.text, locale: fixture.locale });
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
