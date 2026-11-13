/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { groupSecondaryChromeProxies } from './audit-menu-chrome-census.js';

describe('audit-menu-chrome-census', () => {
  it('groups proxies under the preceding group-label', () => {
    const groups = groupSecondaryChromeProxies([
      { kind: 'group-label', labelKey: 'MENU_GROUP_PREFERENCES' },
      { proxy: 'account', labelKey: 'EMAIL_JOURNEY_MENU_LABEL' },
      { proxy: 'help-center', labelKey: 'HELP_CENTER_MENU_LABEL' }
    ]);
    assert.equal(groups.length, 1);
    assert.deepEqual(groups[0].proxies, ['account', 'help-center']);
  });
});
