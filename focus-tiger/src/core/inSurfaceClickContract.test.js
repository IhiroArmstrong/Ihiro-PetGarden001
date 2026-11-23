/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IN_SURFACE_CLICK_RESULTS } from './inSurfaceClickContract.js';

describe('IN_SURFACE_CLICK_RESULTS', () => {
  it('names a visible result for Thought Drop memory list', () => {
    const row = IN_SURFACE_CLICK_RESULTS.find(
      (item) => item.id === 'thought-drop-what-yin-remembers'
    );
    assert.ok(row);
    assert.equal(row.resultSelector, '#yin-personal-memory');
    const memoryUi = readFileSync(
      new URL('../ui/YinPersonalMemoryUI.js', import.meta.url),
      'utf8'
    );
    assert.match(memoryUi, /this\.root\.id = 'yin-personal-memory'/);
    assert.match(memoryUi, /_ignoreOutsideUntil/);
    const confideUi = readFileSync(
      new URL('../ui/ConfideToYinUI.js', import.meta.url),
      'utf8'
    );
    assert.match(
      confideUi,
      /confide-to-yin-memory-list-link/
    );
    assert.match(confideUi, /onOpenMemoryPanel/);
    const opener = readFileSync(
      new URL('../ui/openThoughtDropMemoryPanel.js', import.meta.url),
      'utf8'
    );
    assert.match(opener, /elevateYinMemoryOverThoughtDrop/);
    assert.match(opener, /GLASS_CARD_FRONT/);
  });
});
