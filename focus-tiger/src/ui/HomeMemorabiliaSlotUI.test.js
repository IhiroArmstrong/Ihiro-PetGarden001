/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

describe('HomeMemorabiliaSlotUI H3', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, 'HomeMemorabiliaSlotUI.js'), 'utf8');
  const zone = readFileSync(join(here, 'HomeThreeZoneUI.js'), 'utf8');

  it('fills the H2 slot and opens Yins Collections', () => {
    assert.match(src, /listHomeMemorabiliaPreview/);
    assert.match(src, /proxyMenuItem\?\.\('yin-coin'\)/);
    assert.match(src, /ft-home-memorabilia-enter/);
    assert.match(src, /HOME_MEMORABILIA_COUNT/);
    assert.match(zone, /new HomeMemorabiliaSlotUI/);
    assert.doesNotMatch(
      readFileSync(join(here, '../core/createIdleChromeFacade.js'), 'utf8'),
      /HomeMemorabiliaSlotUI/
    );
  });

  it('does not render a badge row', () => {
    assert.doesNotMatch(src, /for \(const row of/);
    assert.match(src, /latest/);
  });
});
