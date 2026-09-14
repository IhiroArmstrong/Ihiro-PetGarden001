/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { FT_GLASS_HOVER_DELAY_MS } from './ft-glass-hover-tip.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'ft-glass-hover-tip.js'), 'utf8');

describe('ft-glass-hover-tip', () => {
  it('uses 120ms hover delay and listening-ear glass styling', () => {
    assert.equal(FT_GLASS_HOVER_DELAY_MS, 120);
    assert.match(src, /backdrop-filter: blur\(8px\)/);
    assert.match(src, /setAttribute\('role', 'tooltip'\)/);
    assert.match(src, /host\.removeAttribute\('title'\)/);
    assert.match(src, /ft-glass-tip-host--suppressed/);
    assert.match(src, /ft-glass-tip-host--touch-visible/);
  });
});
