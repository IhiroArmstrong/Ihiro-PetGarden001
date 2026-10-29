/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
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
        proxy === 'input-rhythm' ||
        proxy === 'mindflow-nebula'
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

  it('keeps proxy → deck ids inside the SSOT deck list', () => {
    const deckIds = new Set(GLASS_GROWTH_OVERLAY_CARD_IDS);
    for (const [proxy, cardId] of Object.entries(
      MENU_PROXY_TO_GROWTH_OVERLAY_CARD_ID
    )) {
      assert.ok(deckIds.has(cardId), `${proxy} → ${cardId} not in deck SSOT`);
    }
  });
});
