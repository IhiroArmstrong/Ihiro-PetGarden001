/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFocusCirclePeerTraceLines,
  normalizeFocusCirclePeerTraces,
  sortFocusCirclePeerTracesForPanel
} from './focusCirclePeerTraces.js';

test('normalizeFocusCirclePeerTraces keeps peer rows with respond metadata', () => {
  const rows = normalizeFocusCirclePeerTraces([
    {
      traceId: 't1',
      phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1',
      authorMemberId: 'm-a',
      hasResponded: true,
      respondPhraseKey: 'FOCUS_CIRCLE_WITNESS_RESPOND_1'
    },
    { traceId: '', phraseKey: 'x', authorMemberId: 'm-b' }
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].traceId, 't1');
  assert.equal(rows[0].respondPhraseKey, 'FOCUS_CIRCLE_WITNESS_RESPOND_1');
});

test('sortFocusCirclePeerTracesForPanel shows newest first', () => {
  const sorted = sortFocusCirclePeerTracesForPanel([
    { traceId: 'old', phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1', authorMemberId: 'a' },
    { traceId: 'new', phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_2', authorMemberId: 'b' }
  ]);
  assert.deepEqual(sorted.map((row) => row.traceId), ['new', 'old']);
});

test('formatFocusCirclePeerTraceLines uses anon label and respond line', () => {
  const { leaveLine, respondLine } = formatFocusCirclePeerTraceLines({
    trace: {
      traceId: 't1',
      phraseKey: 'FOCUS_CIRCLE_WITNESS_LEAVE_1',
      authorMemberId: 'm-a',
      hasResponded: true,
      respondPhraseKey: 'FOCUS_CIRCLE_WITNESS_RESPOND_1'
    },
    t: (key) =>
      ({
        FOCUS_CIRCLE_IDENTITY_ANON_LABEL: 'A companion',
        FOCUS_CIRCLE_PEER_TRACES_LEAVE_LINE: '{name} left: {phrase}',
        FOCUS_CIRCLE_PEER_TRACES_RESPOND_LINE: 'Responded: {phrase}',
        FOCUS_CIRCLE_WITNESS_LEAVE_1: 'Sat with steady breath.',
        FOCUS_CIRCLE_WITNESS_RESPOND_1: 'I noticed your trace.'
      })[key] ?? key
  });
  assert.match(leaveLine, /A companion left: Sat with steady breath\./);
  assert.equal(respondLine, 'Responded: I noticed your trace.');
});
