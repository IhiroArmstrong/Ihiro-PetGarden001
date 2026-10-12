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

describe('confideProductKnowledgeHonesty · Help Center miss copy', () => {
  const { dictionaries } = mergeLocalePack(
    { en: enBase, zh: {}, ja: {} },
    [{ filename: 'confide-product-knowledge-honesty.json', data: honestySlice }]
  );
  const tEn = (key) =>
    key === 'CONFIDE_PRODUCT_KNOWLEDGE_HONESTY'
      ? dictionaries.en.CONFIDE_PRODUCT_KNOWLEDGE_HONESTY
      : key;

  it('english honesty empty state points to Help Center and support email', () => {
    const line = formatConfideProductKnowledgeHonestyReply(tEn);
    assert.match(line, /doesn't keep a manual/i);
    assert.match(line, /Help Center/i);
    assert.match(line, /hello@twinsology\.com/);
    assert.doesNotMatch(line, /Practice or Preferences/i);
  });

  it('breathing duration product miss still uses honesty gate when catalog misses', () => {
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
    assert.match(line, /Help Center/i);
    assert.match(line, /hello@twinsology\.com/);
  });
});
