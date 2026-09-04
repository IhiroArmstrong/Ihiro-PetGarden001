/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply, resolveCorpusFallbackAfterGenerateFailure } from './confideReplyFlow.js';
import { firstConsecutiveDuplicateIndex } from './confideReplyUniqueness.js';

test('resolveConfideReply: empty → null', () => {
  assert.equal(resolveConfideReply({ text: '  ' }), null);
});

test('resolveConfideReply: safety never returns zen fallback line', () => {
  const hit = resolveConfideReply({
    text: 'I want to die',
    localDate: '2026-08-10'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(hit.line.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
});

test('resolveConfideReply: English do-not-want-to-live is safety-01, not tea', () => {
  const hit = resolveConfideReply({
    text: "I don't want to live",
    localDate: '2026-08-22'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.equal(hit.line.id, 'safety-01');
  assert.match(
    hit.line.en,
    /^Heard\. If this feels too heavy to hold alone, please reach someone you trust/
  );
});

test('resolveConfideReply: depressed mood → sad corpus, not safety or fallback', () => {
  const hit = resolveConfideReply({
    text: 'I feel depressed. Can you help me?',
    localDate: '2026-08-22'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.SAD);
  assert.equal(hit.line.route, CONFIDE_ROUTE.SAD);
});

test('resolveConfideReply: unmatched → fallback line', () => {
  const hit = resolveConfideReply({
    text: 'the weather is mild today',
    localDate: '2026-08-10'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.FALLBACK);
  assert.equal(hit.line.route, CONFIDE_ROUTE.FALLBACK);
});

test('resolveConfideReply: beat people → aggression pool, never nods quietly', () => {
  const hit = resolveConfideReply({
    text: 'I want to beat people.',
    localDate: '2026-09-04'
  });
  assert.ok(hit);
  assert.equal(hit.route, CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
  assert.ok(
    ['aggression-01', 'aggression-02', 'aggression-03', 'aggression-04'].includes(
      hit.line.id
    )
  );
  assert.doesNotMatch(hit.line.en, /heard/i);
  assert.doesNotMatch(hit.line.en, /nod/i);
  assert.doesNotMatch(hit.line.zh, /点头/);
  assert.doesNotMatch(hit.line.zh, /听见了/);
});

test('resolveCorpusFallbackAfterGenerateFailure: 8 frozen-exclude fails are not consecutive-identical', () => {
  const excludeIds = new Set(['fallback-01', 'fallback-02', 'fallback-03']);
  const history = [];
  const texts = [];
  for (let i = 0; i < 8; i += 1) {
    const hit = resolveCorpusFallbackAfterGenerateFailure({
      locale: 'en',
      localDate: '2026-09-04',
      salt: excludeIds.size,
      excludeIds,
      history,
      failedLineId: 'fallback-03'
    });
    assert.ok(hit);
    texts.push(hit.text);
    history.push({ role: 'user', text: `idle ${i}` });
    history.push({ role: 'yin', text: hit.text, source: 'corpus' });
  }
  assert.equal(firstConsecutiveDuplicateIndex(texts), -1);
});
