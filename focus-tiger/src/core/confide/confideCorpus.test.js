import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONFIDE_CORPUS,
  confideLineText,
  isConfideSafetyCorpusOk,
  linesForRoute,
  pickConfideLine
} from './confideCorpus.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

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
