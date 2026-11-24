/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  GLASS_GROWTH_OVERLAY_CARD_IDS,
  MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID
} from './glassGrowthOverlayCardRegistry.js';
import { MENU_REACHABILITY } from './menuReachabilityContract.js';

describe('glassGrowthOverlayCardRegistry (A3)', () => {
  it('maps every menu open-panel proxy that uses the growth deck', () => {
    const deckIds = new Set(GLASS_GROWTH_OVERLAY_CARD_IDS);
    for (const [proxy, contract] of Object.entries(MENU_REACHABILITY)) {
      if (contract.kind !== 'open-panel') continue;
      if (proxy.startsWith('ritual-')) continue;
      if (proxy === 'companion') continue;
      if (proxy === 'honesty') continue;
      if (proxy === 'sanctuary-nav') continue;
      if (
        proxy === 'reminder' ||
        proxy === 'work-end' ||
        proxy === 'language' ||
        proxy === 'sound' ||
        proxy === 'always-on-top' ||
        proxy === 'window-layout' ||
        proxy === 'global-sit-hotkey' ||
        proxy === 'input-rhythm' ||
        proxy === 'mindflow-nebula' ||
        proxy === 'presence-field' ||
        proxy === 'health-shortcut-log'
      ) {
        continue;
      }
      const mapped = MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID[proxy];
      assert.ok(
        mapped,
        `menu proxy "${proxy}" missing MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID`
      );
      assert.ok(
        deckIds.has(mapped),
        `menu proxy "${proxy}" maps to unknown deck id "${mapped}"`
      );
    }
  });

  it('preferenceBackupPanels overlayCards follow SSOT order between yin-coin and practice-study', () => {
    const src = readFileSync(
      new URL('../ui/preferenceBackupPanels.js', import.meta.url),
      'utf8'
    );
    const overlayBlock = src.match(/overlayCards:\s*\[([\s\S]*?)\n\s*\]/)?.[1];
    assert.ok(overlayBlock, 'overlayCards array missing');
    const ids = [...overlayBlock.matchAll(/\bid:\s*'([^']+)'/g)].map(
      (m) => m[1]
    );
    const start = GLASS_GROWTH_OVERLAY_CARD_IDS.indexOf('local-backup');
    assert.deepEqual(
      ids,
      GLASS_GROWTH_OVERLAY_CARD_IDS.slice(start, start + ids.length)
    );
  });

  it('keeps proxy → deck ids inside the SSOT deck list', () => {
    const deckIds = new Set(GLASS_GROWTH_OVERLAY_CARD_IDS);
    for (const [proxy, cardId] of Object.entries(
      MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID
    )) {
      assert.ok(deckIds.has(cardId), `${proxy} → ${cardId} not in deck SSOT`);
    }
  });
});
