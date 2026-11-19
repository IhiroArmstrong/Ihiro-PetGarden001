/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import {
  NOTICING_FIXED_LINES,
  pickNoticingFixedLine
} from './noticingFixedLineLibrary.js';
import { isNoticingOneLineIsolationPassed } from './noticingOneLineIsolationGate.js';
import {
  NOTICING_CRISIS_CLASS_ID,
  NOTICING_LABEL_DISPOSITION,
  NOTICING_LIVE_KINDS,
  NOTICING_UNCLEAR_KIND,
  isNoticingLiveKind,
  noticingPickerVectorSignalKeys
} from './noticingLabelDisposition.js';

test('live library kinds are only hold and invite_sit', () => {
  assert.deepEqual([...NOTICING_LIVE_KINDS], ['hold', 'invite_sit']);
  assert.equal(
    NOTICING_FIXED_LINES.filter((row) => row.kind === NOTICING_UNCLEAR_KIND)
      .length,
    0
  );
  assert.equal(
    NOTICING_FIXED_LINES.filter((row) => row.kind === NOTICING_CRISIS_CLASS_ID)
      .length,
    0
  );
  for (const row of NOTICING_FIXED_LINES) {
    assert.equal(isNoticingLiveKind(row.kind), true, row.id);
  }
});

test('disposition lock: unclear cancelled; crisis not this classifier; hold/invite not vector classes', () => {
  assert.equal(NOTICING_LABEL_DISPOSITION.unclear, 'cancelled-fold-into-hold');
  assert.equal(
    NOTICING_LABEL_DISPOSITION.crisis,
    'live-safety-layer-not-this-classifier'
  );
  assert.equal(
    NOTICING_LABEL_DISPOSITION.holdVsInviteSit,
    'library-kinds-not-vector-classes'
  );
  assert.equal(NOTICING_LABEL_DISPOSITION.picker, 'date-salt-mixed-pool');
  assert.equal(isNoticingOneLineIsolationPassed(), false);
});

test('picker ignores embedding and class hints; mixed pool still has both kinds', () => {
  const base = {
    route: CONFIDE_ROUTE.FALLBACK,
    localDate: '2026-11-19',
    salt: 3,
    locale: 'en'
  };
  const plain = pickNoticingFixedLine(base);
  const poisoned = pickNoticingFixedLine({
    ...base,
    embedding: [0.9, 0.1, 0],
    classHint: NOTICING_UNCLEAR_KIND,
    isolationClass: NOTICING_CRISIS_CLASS_ID,
    kindFilter: 'hold'
  });
  assert.ok(plain);
  assert.equal(poisoned.id, plain.id);
  assert.equal(poisoned.noticingKind, plain.noticingKind);
  assert.deepEqual([...noticingPickerVectorSignalKeys()], [
    'embedding',
    'classHint',
    'isolationClass',
    'kindFilter'
  ]);

  const kinds = new Set();
  for (let salt = 0; salt < 80; salt += 1) {
    const line = pickNoticingFixedLine({
      route: CONFIDE_ROUTE.FALLBACK,
      localDate: '2026-11-19',
      salt,
      locale: 'en'
    });
    kinds.add(line.noticingKind);
  }
  assert.equal(kinds.has('hold'), true);
  assert.equal(kinds.has('invite_sit'), true);
});
