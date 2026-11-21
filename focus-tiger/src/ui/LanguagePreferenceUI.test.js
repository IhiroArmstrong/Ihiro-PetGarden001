/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

describe('LanguagePreferenceUI query tip', () => {
  it('globe FAB uses listening-ear glass tip not native title', () => {
    const src = readFileSync(join(here, 'LanguagePreferenceUI.js'), 'utf8');
    assert.match(src, /attachGlassHoverTip\(this\.fab/);
    assert.match(src, /consumeTouchFirstToast\('language-preference-fab'\)/);
    assert.doesNotMatch(src, /fab\.title\s*=/);
    assert.doesNotMatch(src, /fab\.setAttribute\('title'/);
  });
});
