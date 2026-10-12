/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND } from './confideCrisisParaphraseShadow.js';
import { buildKbRetrievalMissTurnLog } from './confideProductKnowledge.js';
import {
  CONFIDE_RENDERER_TURN_LOG_KINDS,
  sanitizeRendererTurnLogRecord
} from '../../../desktop/companion/confideRendererTurnLogAllowlist.js';

describe('sanitizeRendererTurnLogRecord', () => {
  it('allowlist kinds stay aligned with renderer builders', () => {
    assert.equal(CONFIDE_RENDERER_TURN_LOG_KINDS.includes('kb_retrieval_miss'), true);
    assert.equal(
      CONFIDE_RENDERER_TURN_LOG_KINDS.includes(CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND),
      true
    );
  });

  it('keeps a hash-only kb_retrieval_miss row and drops text', () => {
    const built = buildKbRetrievalMissTurnLog({
      text: '观察翼是什么',
      reason: 'semantic_miss',
      locale: 'zh'
    });
    const withLeak = { ...built, text: '观察翼是什么' };
    const result = sanitizeRendererTurnLogRecord(withLeak);
    assert.equal(result.ok, true);
    assert.equal(result.record.kind, 'kb_retrieval_miss');
    assert.equal(result.record.reason, 'semantic_miss');
    assert.equal(Object.prototype.hasOwnProperty.call(result.record, 'text'), false);
    assert.equal(JSON.stringify(result.record).includes('观察翼'), false);
  });

  it('keeps crisis paraphrase shadow rows', () => {
    const result = sanitizeRendererTurnLogRecord({
      kind: CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND,
      queryHash: 'abcd1234',
      textLength: 12,
      patternId: 'zh.cannot-carry-on',
      text: 'must-not-land'
    });
    assert.equal(result.ok, true);
    assert.equal(result.record.kind, CONFIDE_CRISIS_PARAPHRASE_SHADOW_KIND);
    assert.equal(Object.prototype.hasOwnProperty.call(result.record, 'text'), false);
  });

  it('rejects kinds the renderer must not write', () => {
    assert.equal(
      sanitizeRendererTurnLogRecord({ kind: 'l3_generate', text: 'hi' }).ok,
      false
    );
    assert.equal(
      sanitizeRendererTurnLogRecord({ kind: 'semantic_shadow_classify', text: 'hi' })
        .ok,
      false
    );
    assert.equal(sanitizeRendererTurnLogRecord(null).ok, false);
  });
});
