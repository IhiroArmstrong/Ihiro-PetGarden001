/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

describe('HomeThreeZoneUI H2 skeleton', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, 'HomeThreeZoneUI.js'), 'utf8');
  const wide = readFileSync(join(here, 'WideIdleMoreMenu.js'), 'utf8');

  it('wires from WideIdleMoreMenu, not main.js or core facade', () => {
    assert.match(wide, /new HomeThreeZoneUI/);
    assert.doesNotMatch(
      readFileSync(join(here, '../core/createIdleChromeFacade.js'), 'utf8'),
      /HomeThreeZoneUI/
    );
  });

  it('does not relocate the heatmap cluster over the help mark', () => {
    assert.match(src, /onboarding-hint-help stays clickable/);
    assert.doesNotMatch(src, /bottom: auto/);
  });

  it('hides the wide Confide ear in favor of a labeled row', () => {
    assert.match(src, /body\.ft-home-three-zone #confide-ear-chrome/);
    assert.match(src, /ft-home-preview-confide/);
    assert.match(src, /shouldShowConfideEarChrome/);
    assert.match(src, /proxyMenuItem\?\.\('confide'\)/);
  });

  it('joins the glass drag deck for header dragging', () => {
    assert.match(src, /dataset\.ftGlassCard\s*=\s*'1'/);
    assert.match(src, /ft-home-zone-memories__heading/);
  });

  it('opens existing ⋯ groups from labeled previews', () => {
    assert.match(src, /MENU_GROUP_INSPIRATION/);
    assert.match(src, /MENU_GROUP_RECORDS/);
    assert.match(src, /MENU_GROUP_PRACTICE/);
    assert.match(src, /openMenuGroup/);
    assert.match(wide, /openMenuGroup\(groupKey\)/);
    assert.match(wide, /proxyMenuItem\(key/);
  });

  it('fills the memorabilia slot and hides the rail when ⋯ is open', () => {
    assert.match(src, /SLOT_ID = 'ft-home-memorabilia-slot'/);
    assert.match(src, /new HomeMemorabiliaSlotUI/);
    assert.match(src, /ft-wide-more-open \.ft-home-zone-memories/);
    assert.match(src, /@media \(max-width: 479px\)/);
  });
});
