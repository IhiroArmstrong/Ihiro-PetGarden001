/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import enBase from '../../locales/en.json' with { type: 'json' };
import { mergeLocalePack } from '../../locales/mergeLocaleSlices.js';
import honestySlice from '../../locales/slices/confide-product-knowledge-honesty.json' with { type: 'json' };
import { formatConfideProductKnowledgeHonestyReply } from './confideProductKnowledgeHonesty.js';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';

const HELP_ONLY_IDS = new Set([
  'KB-FUNC-0006',
  'HELP-DEVICES-SAFARI',
  'HELP-APPLE-HEALTH-LOG',
  'KB-FUNC-0040',
  'KB-FUNC-0041',
  'KB-FUNC-0044',
  'KB-FUNC-0045',
  'KB-FUNC-0046',
  'KB-FUNC-0047',
  'KB-FUNC-0048',
  'KB-FUNC-0049',
  'KB-FUNC-0050'
]);

describe('help-only catalog rows stay on the live honesty empty state', () => {
  const { dictionaries } = mergeLocalePack(
    { en: enBase, zh: {}, ja: {} },
    [{ filename: 'confide-product-knowledge-honesty.json', data: honestySlice }]
  );
  const tEn = (key) =>
    key === 'CONFIDE_PRODUCT_KNOWLEDGE_HONESTY'
      ? dictionaries.en.CONFIDE_PRODUCT_KNOWLEDGE_HONESTY
      : key;

  it('distinctive help-only phrases never return the help-only catalog ids', () => {
    for (const text of [
      'Safari on iPhone',
      'no App Store app',
      'Apple Health',
      'HealthKit',
      '呼吸练习盘点',
      'KB-FUNC-0006 inventory',
      'Sit with a question inventory',
      'Presence Field inventory',
      'Wrap-up time inventory',
      'Art Collection inventory',
      'Log to Health inventory'
    ]) {
      const probe = probeProductKnowledgeCatalog(text);
      assert.equal(HELP_ONLY_IDS.has(probe.id), false, `${text} -> ${probe.id}`);
    }
    assert.equal(probeProductKnowledgeCatalog('no App Store app').hit, false);
    assert.equal(probeProductKnowledgeCatalog('HealthKit').hit, false);
    assert.equal(probeProductKnowledgeCatalog('KB-FUNC-0006 inventory').hit, false);
  });

  it('product-shaped miss still uses the live honesty empty state, without a new help-center prompt', () => {
    const text = 'How long can I practice breathing?';
    assert.equal(probeProductKnowledgeCatalog(text).hit, false);
    assert.equal(
      resolveProductKnowledgeGateAction({
        text,
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: false
      }),
      'honesty'
    );
    const line = formatConfideProductKnowledgeHonestyReply(tEn);
    assert.match(line, /doesn't keep a manual/i);
    assert.doesNotMatch(line, /去帮助中心看看/);
    assert.doesNotMatch(line, /go look in (the )?Help Center for the full article/i);
  });
});
