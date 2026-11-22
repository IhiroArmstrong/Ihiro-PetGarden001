/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  elevateYinMemoryOverThoughtDrop,
  openThoughtDropMemoryPanel
} from './openThoughtDropMemoryPanel.js';
import { Z } from './zIndexLayers.js';

const here = dirname(fileURLToPath(import.meta.url));

function fakeEl() {
  return { style: { zIndex: '' } };
}

describe('openThoughtDropMemoryPanel', () => {
  it('reproduces the dead-link: open() without elevate leaves memory behind Thought Drop', () => {
    const confide = fakeEl();
    const memory = fakeEl();
    confide.style.zIndex = String(Z.GLASS_CARD);
    memory.style.zIndex = String(Z.GLASS_CARD);
    assert.equal(memory.style.zIndex, confide.style.zIndex);
  });

  it('puts the memory panel on GLASS_CARD_FRONT above Thought Drop', () => {
    const confide = fakeEl();
    const memory = fakeEl();
    const doc = {
      getElementById(id) {
        if (id === 'confide-to-yin-card') return confide;
        if (id === 'yin-personal-memory') return memory;
        return null;
      }
    };
    elevateYinMemoryOverThoughtDrop(doc);
    assert.equal(confide.style.zIndex, String(Z.GLASS_CARD));
    assert.equal(memory.style.zIndex, String(Z.GLASS_CARD_FRONT));
    assert.ok(Number(memory.style.zIndex) > Number(confide.style.zIndex));
    assert.ok(Number(memory.style.zIndex) < 25);
  });

  it('toasts when the memory bridge is missing instead of staying silent', () => {
    const shown = [];
    const result = openThoughtDropMemoryPanel({
      hasBridge: () => false,
      memoryUi: { open() { shown.push('opened'); } },
      toast: { show(msg) { shown.push(msg); } },
      unavailableCopy: 'Memory list is only on this computer.'
    });
    assert.deepEqual(result, { opened: false, reason: 'no-bridge' });
    assert.deepEqual(shown, ['Memory list is only on this computer.']);
  });

  it('opens then elevates when the bridge is present', () => {
    const calls = [];
    const confide = fakeEl();
    const memory = fakeEl();
    const result = openThoughtDropMemoryPanel({
      hasBridge: () => true,
      closeOthers: () => calls.push('close'),
      memoryUi: { open() { calls.push('open'); } },
      document: {
        getElementById(id) {
          if (id === 'confide-to-yin-card') return confide;
          if (id === 'yin-personal-memory') return memory;
          return null;
        }
      }
    });
    assert.equal(result.opened, true);
    assert.deepEqual(calls, ['close', 'open']);
    assert.equal(memory.style.zIndex, String(Z.GLASS_CARD_FRONT));
  });

  it('main.js wires the Thought Drop link through the helper', () => {
    const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');
    assert.match(mainSrc, /openThoughtDropMemoryPanel/);
    assert.match(mainSrc, /onOpenMemoryPanel:/);
  });
});
