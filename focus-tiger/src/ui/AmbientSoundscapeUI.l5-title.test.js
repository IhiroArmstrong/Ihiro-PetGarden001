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

describe('AmbientSoundscapeUI L5 volume tips', () => {
  it('volume sliders and note use glass-ear instead of native title', () => {
    const src = readFileSync(join(here, 'AmbientSoundscapeUI.js'), 'utf8');
    assert.match(src, /attachGlassHoverTip\(this\.volumeLabel/);
    assert.match(src, /attachGlassHoverTip\(this\.chimeVolumeLabel/);
    assert.match(src, /consumeTouchFirstToast\('ambient-soundscape-mute'\)/);
    assert.doesNotMatch(src, /volumeLabel\?\.setAttribute\('title'/);
    assert.doesNotMatch(src, /chimeVolumeLabel\?\.setAttribute\('title'/);
  });
});
