/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildSessionPresenceSummary,
  estimateSessionPresence,
  SESSION_PRESENCE_LABELS
} from './sessionPresenceSummary.js';
import {
  pickPresenceWhisperKey,
  selectPresenceEndConsumers
} from './sessionPresenceConsumers.js';
import {
  getCalmActionArrivePool,
  getCalmActionRecoverPool,
  getCalmActionTransitionPool
} from '../content/calm-action-wisdom/index.js';

const PERSONAS = [
  {
    id: 'stay-settled',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.SETTLED,
    whisper: 'reflect',
    cawPools: [],
    lightCompleteBias: null
  },
  {
    id: 'stay-drifting',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [21, 22, 23],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.DRIFTING,
    whisper: 'arrive',
    cawPools: ['arrive', 'transition'],
    lightCompleteBias: 'sessionComplete'
  },
  {
    id: 'stay-struggling',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 8 * 60,
      leaveDurationsSeconds: [],
      pauseCount: 3,
      extended: false,
      endedEarly: true,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.STRUGGLING,
    whisper: 'recover',
    cawPools: ['recover'],
    lightCompleteBias: 'mindfulAcknowledge'
  },
  {
    id: 'across-tools-busy',
    seed: {
      companionMode: 'acrossTools',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [21, 25, 30, 40, 22],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.SETTLED,
    whisper: 'reflect',
    cawPools: [],
    lightCompleteBias: null
  },
  {
    id: 'step-away-offline',
    seed: {
      companionMode: 'stepAway',
      plannedMinutes: 25,
      actualSeconds: 25 * 60,
      leaveDurationsSeconds: [600],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.SETTLED,
    whisper: 'reflect',
    cawPools: [],
    lightCompleteBias: null
  },
  {
    id: 'too-short',
    seed: {
      companionMode: 'stay',
      plannedMinutes: 25,
      actualSeconds: 30,
      leaveDurationsSeconds: [],
      pauseCount: 0,
      extended: false,
      endedEarly: false,
      durationMode: 'fixed'
    },
    label: SESSION_PRESENCE_LABELS.UNKNOWN,
    whisper: 'reflect',
    cawPools: [],
    lightCompleteBias: null
  }
];

test('persona table maps estimate → whisper / CAW buckets / light bias', () => {
  for (const row of PERSONAS) {
    const summary = buildSessionPresenceSummary(row.seed);
    const label = estimateSessionPresence(summary);
    assert.equal(label, row.label, row.id);
    const consumers = selectPresenceEndConsumers(label);
    assert.equal(pickPresenceWhisperKey(label), row.whisper, row.id);
    assert.deepEqual([...consumers.cawPools], row.cawPools, row.id);
    assert.equal(consumers.lightCompleteBias, row.lightCompleteBias, row.id);
  }
});

test('DRIFTING CAW buckets are Arrive + Transition, not Recover', () => {
  const { cawPools } = selectPresenceEndConsumers(SESSION_PRESENCE_LABELS.DRIFTING);
  assert.ok(cawPools.includes('arrive'));
  assert.ok(cawPools.includes('transition'));
  assert.equal(cawPools.includes('recover'), false);
  assert.ok(getCalmActionArrivePool('en').length > 0);
  assert.ok(getCalmActionTransitionPool('en').length > 0);
});

test('STRUGGLING CAW bucket is Recover, not Arrive', () => {
  const { cawPools } = selectPresenceEndConsumers(
    SESSION_PRESENCE_LABELS.STRUGGLING
  );
  assert.deepEqual([...cawPools], ['recover']);
  assert.ok(getCalmActionRecoverPool('en').length > 0);
});

test('transition whisper is never selected while not playable', () => {
  assert.equal(
    pickPresenceWhisperKey(SESSION_PRESENCE_LABELS.DRIFTING),
    'arrive'
  );
  assert.equal(
    pickPresenceWhisperKey(SESSION_PRESENCE_LABELS.DRIFTING, {
      isPlayable: (key) => key === 'reflect'
    }),
    'reflect'
  );
});

test('null label keeps current reflect whisper and no pose bias', () => {
  const consumers = selectPresenceEndConsumers(null);
  assert.equal(pickPresenceWhisperKey(null), 'reflect');
  assert.equal(consumers.lightCompleteBias, null);
  assert.deepEqual([...consumers.cawPools], []);
});

test('Phase 1 consumers module does not write next-session duration', () => {
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'sessionPresenceConsumers.js'),
    'utf8'
  );
  assert.equal(/targetMinutes|defaultMinutes|durationPref|lastDuration/.test(src), false);
});
