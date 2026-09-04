/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import {
  CONFIDE_CORPUS,
  confideLineText,
  isConfideSafetyCorpusOk,
  linesForRoute,
  pickConfideLine
} from './confideCorpus.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_COPY_CORPUS_IDS,
  parseConfideCopyOverlay,
  resetTasteLayerOverlayForTests,
  setTasteConfideCopyOverlay
} from '../tasteLayerOverlay.js';
import { firstConsecutiveDuplicateIndex } from './confideReplyUniqueness.js';
import en from '../../locales/en.json' with { type: 'json' };

afterEach(() => {
  resetTasteLayerOverlayForTests();
});

test('zen buckets each have ≥3 ok lines', () => {
  for (const route of [
    CONFIDE_ROUTE.FALLBACK,
    CONFIDE_ROUTE.ANXIOUS,
    CONFIDE_ROUTE.TIRED,
    CONFIDE_ROUTE.STUCK,
    CONFIDE_ROUTE.SAD,
    CONFIDE_ROUTE.SCATTERED
  ]) {
    const lines = linesForRoute(route);
    assert.ok(lines.length >= 3, route);
    assert.ok(lines.every((l) => l.review === 'ok'), route);
  }
});

test('safety corpus is human-ok (≥1 line)', () => {
  const safety = linesForRoute(CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.ok(safety.length >= 1);
  assert.equal(isConfideSafetyCorpusOk(), true);
  assert.ok(safety.every((l) => l.review === 'ok'));
});

test('safety-01 points to real help and is not a substitute (aligns with wellness disclaimer)', () => {
  const line = CONFIDE_CORPUS.find((l) => l.id === 'safety-01');
  assert.ok(line);
  assert.match(line.en, /crisis line/i);
  assert.match(line.en, /not a substitute for professional help/i);
  assert.match(line.ja, /相談窓口/);
  assert.match(line.ja, /専門援助の代わりにはなれない/);
  assert.match(line.zh, /援助热线|专业帮助/);
});

test('pickConfideLine: safety never falls through to zen fallback pool', () => {
  const line = pickConfideLine({
    route: CONFIDE_ROUTE.SAFETY_REDIRECT,
    localDate: '2026-08-10'
  });
  assert.ok(line);
  assert.equal(line.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.notEqual(line.route, CONFIDE_ROUTE.FALLBACK);
});

test('pickConfideLine: harm_witness never falls through to zen fallback pool', () => {
  const line = pickConfideLine({
    route: CONFIDE_ROUTE.HARM_WITNESS,
    localDate: '2026-09-04'
  });
  assert.ok(line);
  assert.equal(line.id, 'harm-01');
  assert.equal(line.route, CONFIDE_ROUTE.HARM_WITNESS);
  assert.doesNotMatch(line.en, /nod/i);
});

test('pickConfideLine: emotion retrieve returns matching route', () => {
  const line = pickConfideLine({
    route: CONFIDE_ROUTE.TIRED,
    localDate: '2026-08-10',
    salt: 1
  });
  assert.ok(line);
  assert.equal(line.route, CONFIDE_ROUTE.TIRED);
  assert.ok(confideLineText(line, 'zh').length > 0);
});

test('corpus ids are unique', () => {
  const ids = CONFIDE_CORPUS.map((l) => l.id);
  assert.equal(ids.length, new Set(ids).size);
});

test('confide overlay replaces corpus text and keeps pick id / route', () => {
  const parsed = parseConfideCopyOverlay({
    schemaVersion: 1,
    locale: 'en',
    templates: [
      'CONFIDE_BOUNDARY_RESPECT',
      'CONFIDE_COMPANION_PRESENCE',
      'CONFIDE_PREFERENCE_HONESTY'
    ].map((key) => ({ key, text: en[key] })),
    corpus: CONFIDE_CORPUS.filter((line) =>
      CONFIDE_COPY_CORPUS_IDS.includes(line.id)
    ).map((line) => ({
      id: line.id,
      text: line.id === 'tired-01' ? 'Overlay cushion line.' : line.en
    }))
  });
  assert.ok(parsed);
  setTasteConfideCopyOverlay(parsed);
  const line = pickConfideLine({
    route: CONFIDE_ROUTE.TIRED,
    localDate: '2026-01-01',
    salt: 0,
    excludeIds: ['tired-02', 'tired-03']
  });
  assert.ok(line);
  assert.equal(line.id, 'tired-01');
  assert.equal(line.route, CONFIDE_ROUTE.TIRED);
  assert.equal(confideLineText(line, 'en'), 'Overlay cushion line.');
});

test('pickConfideLine: wrapped exclude set still cannot consecutive-repeat fallback text', () => {
  const excludeIds = new Set(['fallback-01', 'fallback-02', 'fallback-03']);
  const texts = [];
  for (let salt = 0; salt < 8; salt += 1) {
    const line = pickConfideLine({
      route: CONFIDE_ROUTE.FALLBACK,
      localDate: '2026-09-04',
      salt: excludeIds.size,
      excludeIds,
      excludeNormalizedTexts: texts.slice(-1),
      locale: 'en'
    });
    assert.ok(line);
    texts.push(confideLineText(line, 'en'));
  }
  assert.equal(firstConsecutiveDuplicateIndex(texts), -1);
});
