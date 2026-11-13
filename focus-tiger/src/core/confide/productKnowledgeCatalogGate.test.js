/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  catalogEntryExportError,
  isAllowedCatalogId
} from './productKnowledgeCatalogGate.js';
import {
  probeProductKnowledgeCatalog,
  scoreProductKnowledgeEntries
} from './confideProductKnowledge.js';

describe('productKnowledgeCatalogGate', () => {
  it('forbids yin-only and both-false combos', () => {
    const base = {
      id: 'KB-FUNC-9999',
      shortAnswerEn: 'Pointer only.',
      helpSectionId: 'start',
      helpCenterOrder: 0
    };
    assert.match(
      catalogEntryExportError({
        ...base,
        yinMayRetrieve: true,
        helpCenterVisible: false
      }),
      /forbidden/
    );
    assert.match(
      catalogEntryExportError({
        ...base,
        yinMayRetrieve: false,
        helpCenterVisible: false
      }),
      /both export flags false/
    );
    assert.equal(
      catalogEntryExportError({
        ...base,
        yinMayRetrieve: false,
        helpCenterVisible: true
      }),
      null
    );
  });

  it('rejects new HELP-* ids and draft psychology ids', () => {
    assert.equal(isAllowedCatalogId('HELP-NEW-TOPIC'), false);
    assert.equal(isAllowedCatalogId('KB-PSY-DRAFT-0001'), false);
    assert.equal(isAllowedCatalogId('HELP-DEVICES-SAFARI'), true);
    assert.equal(isAllowedCatalogId('KB-FUNC-0006'), true);
  });
});

describe('help-only rows never win probe even with leftover keywords', () => {
  const fixture = {
    id: 'KB-FUNC-0006',
    yinMayRetrieve: false,
    helpCenterVisible: true,
    helpSectionId: 'practice',
    helpCenterOrder: 0,
    shortAnswerEn: 'Inventory detail only.',
    keywords: ['Safari on iPhone', 'Apple Health', '呼吸练习盘点', 'left orb inventory']
  };

  it('score skips yinMayRetrieve false before keyword tally', () => {
    const ranked = scoreProductKnowledgeEntries('Safari on iPhone', [fixture]);
    assert.equal(ranked.length, 0);
  });

  it('live probe does not return backfill ids for distinctive help-only phrases', () => {
    for (const text of [
      'Safari on iPhone',
      'no App Store app',
      'Apple Health',
      'HealthKit',
      '呼吸练习盘点',
      'KB-FUNC-0006 inventory',
      'Sit with a question inventory',
      'Presence Field inventory'
    ]) {
      const result = probeProductKnowledgeCatalog(text);
      assert.notEqual(result.id, 'KB-FUNC-0006', text);
      assert.notEqual(result.id, 'HELP-DEVICES-SAFARI', text);
      assert.notEqual(result.id, 'HELP-APPLE-HEALTH-LOG', text);
      assert.notEqual(result.id, 'KB-FUNC-0040', text);
      assert.notEqual(result.id, 'KB-FUNC-0041', text);
    }
  });
});
