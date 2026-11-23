/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { confideLineText } from '../confide/confideCorpus.js';
import { resolveConfideHelpEntryEnabled } from '../confide/confideHelpEntryGate.js';
import { noticingOneLineAllowsDesktopGenerate } from '../confide/noticingOneLineGenerateGate.js';
import {
  armConfideSafetyGenerateLatch,
  createConfideSafetyGenerateLatchState,
  isConfideSafetyGenerateLatchActive
} from '../confide/confideSafetyGenerateLatch.js';
import { resolveConfideReply } from '../confide/confideReplyFlow.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import {
  enBannedHits,
  shouldUseNoticingFixedLine
} from './noticingFixedLineLibrary.js';
import {
  NOTICING_OPEN_GATE_NF_AGGRESSION,
  NOTICING_OPEN_GATE_NF_AGGRESSION_LINE_IDS,
  NOTICING_OPEN_GATE_NF_FIXTURES,
  NOTICING_OPEN_GATE_NF_HOLD,
  NOTICING_OPEN_GATE_NF_INVITE,
  NOTICING_OPEN_GATE_NF_T0,
  noticingOpenGateNfFixtureById
} from './noticingOpenGateNfFixtures.js';

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

const LOCAL_DATE = '2026-11-21';

function visibleBand(hit) {
  if (!hit) return null;
  if (hit.route === CONFIDE_ROUTE.SAFETY_REDIRECT) return NOTICING_OPEN_GATE_NF_T0;
  if (hit.route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) {
    return NOTICING_OPEN_GATE_NF_AGGRESSION;
  }
  const id = String(hit.line?.id || '');
  if (/^A-\d{2}$/.test(id)) return NOTICING_OPEN_GATE_NF_HOLD;
  if (/^B-\d{2}$/.test(id)) return NOTICING_OPEN_GATE_NF_INVITE;
  return null;
}

function generateWouldReachBubble(route) {
  return (
    noticingOneLineAllowsDesktopGenerate() &&
    shouldUseDesktopCompanionGenerate({ ...readyOpen, route })
  );
}

function assertSharedSafety(row, hit, userText) {
  assert.ok(hit, row.id);
  assert.equal(generateWouldReachBubble(hit.route), false, row.id);
  assert.equal(resolveConfideHelpEntryEnabled({}), true, `${row.id} G2 default`);
  const reply = confideLineText(hit.line, 'en');
  assert.ok(reply, row.id);
  assert.notEqual(reply.trim().toLowerCase(), userText.trim().toLowerCase(), row.id);
  assert.equal(JSON.stringify(hit).includes(userText), false, `${row.id} no echo`);
  const band = visibleBand(hit);
  if (band === NOTICING_OPEN_GATE_NF_HOLD || band === NOTICING_OPEN_GATE_NF_INVITE) {
    assert.deepEqual(enBannedHits(reply), [], `${row.id} banned:${reply}`);
    assert.equal(
      ['A-13', 'A-15', 'B-12'].includes(hit.line.id),
      false,
      row.id
    );
  }
  return band;
}

test('open-gate NF fixtures freeze exactly ten PO-approved ids', () => {
  assert.equal(NOTICING_OPEN_GATE_NF_FIXTURES.length, 10);
  const ids = NOTICING_OPEN_GATE_NF_FIXTURES.map((row) => row.id);
  assert.deepEqual(ids, [
    'NF-01',
    'NF-02',
    'NF-03',
    'NF-04',
    'NF-05',
    'NF-06',
    'NF-07',
    'NF-08',
    'NF-09',
    'NF-10'
  ]);
  assert.equal(new Set(ids).size, 10);
  assert.equal(noticingOpenGateNfFixtureById('NF-10')?.text, null);
});

test('open-gate NF-01–NF-09: band, no generate, help default on, no utterance echo', () => {
  for (const row of NOTICING_OPEN_GATE_NF_FIXTURES) {
    if (row.id === 'NF-10') continue;
    const hit = resolveConfideReply({
      text: row.text,
      locale: 'en',
      localDate: LOCAL_DATE
    });
    const band = assertSharedSafety(row, hit, row.text);
    assert.ok(row.allowedBands.includes(band), `${row.id} band=${band}`);
    if (band === NOTICING_OPEN_GATE_NF_AGGRESSION) {
      assert.equal(hit.route, CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS, row.id);
      assert.equal(shouldUseNoticingFixedLine(hit.route), false, row.id);
      assert.equal(
        NOTICING_OPEN_GATE_NF_AGGRESSION_LINE_IDS.includes(hit.line.id),
        true,
        `${row.id} line=${hit.line.id}`
      );
    }
    if (band === NOTICING_OPEN_GATE_NF_HOLD || band === NOTICING_OPEN_GATE_NF_INVITE) {
      assert.equal(shouldUseNoticingFixedLine(hit.route), true, row.id);
    }
  }
});

test('open-gate NF-10: after T0, second turn stays {T0,A,B}, no generate, latch on', () => {
  const first = noticingOpenGateNfFixtureById('NF-01');
  const second = noticingOpenGateNfFixtureById('NF-08');
  const row = noticingOpenGateNfFixtureById('NF-10');
  const hit1 = resolveConfideReply({
    text: first.text,
    locale: 'en',
    localDate: LOCAL_DATE
  });
  assert.equal(assertSharedSafety(first, hit1, first.text), NOTICING_OPEN_GATE_NF_T0);
  const latch = createConfideSafetyGenerateLatchState();
  armConfideSafetyGenerateLatch(latch);
  assert.equal(isConfideSafetyGenerateLatchActive(latch), true);
  const hit2 = resolveConfideReply({
    text: second.text,
    locale: 'en',
    localDate: LOCAL_DATE,
    salt: 1
  });
  const band2 = assertSharedSafety(row, hit2, second.text);
  assert.ok(row.allowedBands.includes(band2), `NF-10 second band=${band2}`);
  assert.equal(generateWouldReachBubble(hit2.route), false);
  assert.notEqual(hit2.route, 'generate');
});
