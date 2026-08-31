/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { applyYinMemoryConsent } from './yinPersonalMemoryConsent.js';
import { emptyYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import {
  applyYinMemoryRemember,
  canRememberFromConfideTurn,
  containsForbiddenRememberExtractText,
  matchYinMemoryRememberRule,
  proposeYinMemoryFromConfideTurn,
  rememberFromConfideTurn
} from './yinPersonalMemoryRemember.js';

const granted = () =>
  applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, '2026-08-25T00:00:00.000Z');

test('forbidden extract blocks diagnostic and crisis phrasing', () => {
  assert.equal(containsForbiddenRememberExtractText('I have depression'), true);
  assert.equal(containsForbiddenRememberExtractText('I prefer quiet nights'), false);
});

test('canRememberFromConfideTurn requires fallback + generate + consent', () => {
  assert.equal(
    canRememberFromConfideTurn({
      userText: 'I prefer quiet reflections',
      route: CONFIDE_ROUTE.FALLBACK,
      replySource: 'generate',
      consentGranted: true
    }),
    true
  );
  assert.equal(
    canRememberFromConfideTurn({
      userText: 'I prefer quiet reflections',
      route: CONFIDE_ROUTE.SAD,
      replySource: 'generate',
      consentGranted: true
    }),
    false
  );
  assert.equal(
    canRememberFromConfideTurn({
      userText: 'I prefer quiet reflections',
      route: CONFIDE_ROUTE.FALLBACK,
      replySource: 'corpus',
      consentGranted: true
    }),
    false
  );
  assert.equal(
    canRememberFromConfideTurn({
      userText: 'How long have I practiced?',
      route: CONFIDE_ROUTE.FALLBACK,
      replySource: 'generate',
      consentGranted: true
    }),
    false
  );
});

test('matchYinMemoryRememberRule maps preference and relationship cues', () => {
  const pref = matchYinMemoryRememberRule('I prefer quiet, short reflections.');
  assert.equal(pref?.kind, 'preference');
  const rel = matchYinMemoryRememberRule("Please don't jump to advice.");
  assert.equal(rel?.kind, 'relationship');
  assert.equal(matchYinMemoryRememberRule('Just checking in today.'), null);
});

test('matchYinMemoryRememberRule maps Monday crowded including the tracker example', () => {
  const a = matchYinMemoryRememberRule('Mondays feel crowded');
  assert.equal(a?.ruleId, 'pattern-monday-crowded');
  assert.equal(a?.kind, 'pattern');
  const b = matchYinMemoryRememberRule('Mondays feel crowded → Pattern');
  assert.equal(b?.ruleId, 'pattern-monday-crowded');
});

test('matchYinMemoryRememberRule maps first-person check-in patterns', () => {
  assert.equal(matchYinMemoryRememberRule('I think I need a reset.')?.ruleId, 'pattern-need-reset');
  assert.equal(
    matchYinMemoryRememberRule("I don’t feel like focusing today.")?.ruleId,
    'pattern-not-focusing-today'
  );
  assert.equal(
    matchYinMemoryRememberRule("I don't feel like focusing today.")?.ruleId,
    'pattern-not-focusing-today'
  );
  assert.equal(
    matchYinMemoryRememberRule('I was doing pretty well until this morning.')?.ruleId,
    'pattern-morning-shift'
  );
  assert.equal(matchYinMemoryRememberRule('Can we just sit here for a minute?'), null);
});

test('rememberFromConfideTurn writes active memory after granted consent', () => {
  const { state, remembered } = rememberFromConfideTurn(granted(), {
    userText: 'I prefer quiet, short reflections.',
    route: CONFIDE_ROUTE.FALLBACK,
    replySource: 'generate',
    turnOrdinal: 2,
    nowIso: '2026-08-25T12:00:00.000Z'
  });
  assert.equal(remembered, true);
  assert.equal(state.memories.length, 1);
  assert.equal(state.memories[0].status, 'active');
  assert.equal(state.memories[0].sourceRoute, 'confide_fallback');
  assert.match(state.memories[0].evidence, /confide:turn:2/);
});

test('denied consent leaves store unchanged', () => {
  const denied = applyYinMemoryConsent(emptyYinPersonalMemoryState(), false, 't');
  const { state, remembered } = rememberFromConfideTurn(denied, {
    userText: 'I prefer quiet, short reflections.',
    route: CONFIDE_ROUTE.FALLBACK,
    replySource: 'generate'
  });
  assert.equal(remembered, false);
  assert.deepEqual(state.memories, []);
});

test('repeat observation bumps confidence', () => {
  const first = rememberFromConfideTurn(granted(), {
    userText: 'Mondays feel crowded for me.',
    route: CONFIDE_ROUTE.FALLBACK,
    replySource: 'generate',
    turnOrdinal: 1,
    nowIso: '2026-08-25T12:00:00.000Z'
  });
  assert.equal(first.state.memories[0].confidence, 'low');
  const second = rememberFromConfideTurn(first.state, {
    userText: 'Another Monday feels crowded.',
    route: CONFIDE_ROUTE.FALLBACK,
    replySource: 'generate',
    turnOrdinal: 3,
    nowIso: '2026-08-25T13:00:00.000Z'
  });
  assert.equal(second.state.memories.length, 1);
  assert.equal(second.state.memories[0].confidence, 'medium');
  assert.equal(second.state.memories[0].lastSeenAt, '2026-08-25T13:00:00.000Z');
});

test('applyYinMemoryRemember rejects safety source routes', () => {
  const next = applyYinMemoryRemember(granted(), {
    ruleId: 'bad',
    kind: 'preference',
    summary: 'nope',
    evidence: 'x',
    sourceRoute: 'safety_redirect'
  });
  assert.deepEqual(next.memories, []);
});
