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

test('safety corpus is draft until human ok (gate stays closed)', () => {
  const safety = linesForRoute(CONFIDE_ROUTE.SAFETY_REDIRECT);
  assert.ok(safety.length >= 1);
  assert.equal(isConfideSafetyCorpusOk(), false);
  assert.ok(safety.some((l) => l.review === 'draft'));
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
