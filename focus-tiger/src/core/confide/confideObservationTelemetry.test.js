/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_OBSERVATION_EVENTS,
  CONFIDE_OBSERVATION_MAX_EVENTS,
  CONFIDE_OBSERVATION_STORAGE_KEY,
  appendConfideObservationEvent,
  readConfideObservationEvents,
  resolveChipIdForSubmittedText,
  summarizeConfideObservationEvents,
  trackConfideChipTapped,
  trackConfideShare,
  trackConfideObservationEvent
} from './confideObservationTelemetry.js';
import { CONFIDE_VERBAL_HINT_CHIP_ID } from './confideVerbalHintChips.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

const translate = (key) => {
  const fills = {
    CONFIDE_CHIP_FILL_PRACTICE_COMPARE: 'Am I practicing longer than before?',
    CONFIDE_CHIP_FILL_PRESENCE_RECENT: 'What has my mood looked like recently?',
    CONFIDE_CHIP_FILL_FORGET_THIS: 'Forget this'
  };
  return fills[key] ?? key;
};

describe('confideObservationTelemetry', () => {
  it('trackConfideObservationEvent logs with stable prefix', () => {
    /** @type {unknown[]} */
    const lines = [];
    trackConfideObservationEvent('demo_event', { a: 1 }, {
      log: (...args) => lines.push(args),
      storage: null,
      append: null,
      now: () => 123
    });
    assert.deepEqual(lines[0], ['[ConfideObservationTelemetry]', 'demo_event', { a: 1 }]);
  });

  it('resolveChipIdForSubmittedText matches shipped chip fills only', () => {
    assert.equal(
      resolveChipIdForSubmittedText('Am I practicing longer than before?', translate),
      CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE
    );
    assert.equal(
      resolveChipIdForSubmittedText('Am I practicing longer than before? ', translate),
      CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE
    );
    assert.equal(
      resolveChipIdForSubmittedText('What have you noticed about me?', translate),
      null
    );
    assert.equal(
      resolveChipIdForSubmittedText(
        'Am I practicing longer than before??',
        translate
      ),
      null
    );
  });

  it('trackConfideChipTapped records chipId without user text', () => {
    const storage = createStorage();
    /** @type {object[]} */
    const appended = [];
    trackConfideChipTapped('practice_compare', {
      storage,
      append: (record) => appended.push(record),
      now: () => 1000
    });
    const events = readConfideObservationEvents(storage);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED);
    assert.equal(events[0].chipId, 'practice_compare');
    assert.equal(events[0].at, 1000);
    assert.equal('userText' in events[0], false);
    assert.deepEqual(appended[0], events[0]);
  });

  it('trackConfideShare records dataSource and matchedChipId without raw text', () => {
    const storage = createStorage();
    trackConfideShare(
      {
        dataSource: 'practice_facts',
        userText: 'Am I practicing longer than before?'
      },
      { storage, translate, now: () => 2000 }
    );
    const events = readConfideObservationEvents(storage);
    assert.equal(events.length, 1);
    assert.equal(events[0].event, CONFIDE_OBSERVATION_EVENTS.SHARE);
    assert.equal(events[0].dataSource, 'practice_facts');
    assert.equal(events[0].matchedChipId, CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_COMPARE);
    assert.equal('userText' in events[0], false);
  });

  it('trackConfideShare sets matchedChipId null when text was edited', () => {
    const storage = createStorage();
    trackConfideShare(
      {
        dataSource: 'observation_honesty',
        userText: 'What have you noticed about me?'
      },
      { storage, translate }
    );
    const events = readConfideObservationEvents(storage);
    assert.equal(events[0].matchedChipId, null);
  });

  it('ring buffer caps stored events', () => {
    const storage = createStorage();
    for (let i = 0; i < CONFIDE_OBSERVATION_MAX_EVENTS + 5; i += 1) {
      appendConfideObservationEvent({ event: 'demo', at: i }, storage);
    }
    const events = readConfideObservationEvents(storage);
    assert.equal(events.length, CONFIDE_OBSERVATION_MAX_EVENTS);
    assert.equal(events[0].at, 5);
    assert.equal(events.at(-1).at, CONFIDE_OBSERVATION_MAX_EVENTS + 4);
    assert.equal(storage.getItem(CONFIDE_OBSERVATION_STORAGE_KEY) != null, true);
  });

  it('summarizeConfideObservationEvents aggregates chip taps and share sources', () => {
    const summary = summarizeConfideObservationEvents([
      { event: CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED, chipId: 'practice_compare' },
      { event: CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED, chipId: 'practice_compare' },
      {
        event: CONFIDE_OBSERVATION_EVENTS.SHARE,
        dataSource: 'practice_facts',
        matchedChipId: 'practice_compare'
      },
      {
        event: CONFIDE_OBSERVATION_EVENTS.SHARE,
        dataSource: 'observation_honesty',
        matchedChipId: null
      }
    ]);
    assert.equal(summary.totalEvents, 4);
    assert.deepEqual(summary.chipTaps, { practice_compare: 2 });
    assert.equal(summary.shareTotal, 2);
    assert.deepEqual(summary.shareBySource, {
      practice_facts: 1,
      observation_honesty: 1
    });
    assert.equal(summary.shareWithChipMatch, 1);
    assert.equal(summary.shareChipMatchRate, 0.5);
  });
});
