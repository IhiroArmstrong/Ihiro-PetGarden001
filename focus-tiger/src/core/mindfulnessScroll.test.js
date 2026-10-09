/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MINDFULNESS_SCROLL_FALLBACK_LINE,
  appendMindfulnessScrollSave,
  buildMindfulnessScrollDraft,
  isMindfulnessScrollEligible,
  paintMindfulnessScroll,
  readMindfulnessScrollHistory,
  saveMindfulnessScroll
} from './mindfulnessScroll.js';
import { JOURNEY_LOG_STORAGE_KEY } from './journeyLogGate.js';

function memoryStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

test('scroll stays ineligible below both thresholds and does not throw', () => {
  assert.equal(
    isMindfulnessScrollEligible({ score: 10, lifetimeMinutes: 100 }),
    false
  );
  const storage = memoryStorage();
  const draft = buildMindfulnessScrollDraft(storage, {
    score: 0,
    lifetimeMinutes: 0
  });
  assert.equal(draft.eligible, false);
  assert.equal(draft.line, MINDFULNESS_SCROLL_FALLBACK_LINE);
  assert.deepEqual(draft.history, []);
});

test('score or minutes crossing the gate makes a draft eligible', () => {
  assert.equal(isMindfulnessScrollEligible({ score: 42, lifetimeMinutes: 0 }), true);
  assert.equal(
    isMindfulnessScrollEligible({ score: 0, lifetimeMinutes: 3000 }),
    true
  );
});

test('journey rows summarize into a span; empty log still builds', () => {
  const storage = memoryStorage({
    [JOURNEY_LOG_STORAGE_KEY]: JSON.stringify({
      entries: [
        { at: '2026-01-02T00:00:00.000Z', minutes: 25, arrive: true, reflect: true },
        { at: '2026-03-01T00:00:00.000Z', minutes: 40, arrive: false, reflect: true }
      ]
    })
  });
  const draft = buildMindfulnessScrollDraft(storage, {
    score: 42,
    lifetimeMinutes: 65
  });
  assert.equal(draft.from, '2026-01-02');
  assert.equal(draft.to, '2026-03-01');
  assert.equal(draft.sittingMinutes, 65);
  assert.equal(draft.eligible, true);
});

test('save writes a history row once and paints a buffer', async () => {
  const storage = memoryStorage();
  const draft = buildMindfulnessScrollDraft(storage, {
    score: 50,
    lifetimeMinutes: 4000
  });
  let painted = false;
  const canvas = {
    width: 0,
    height: 0,
    getContext() {
      return {
        canvas,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        font: '',
        fillRect() {},
        strokeRect() {},
        fillText() {
          painted = true;
        },
        measureText() {
          return { width: 10 };
        }
      };
    }
  };
  const first = await saveMindfulnessScroll({
    draft,
    title: 'Mindfulness Scroll',
    subtitle: 'Years of sitting, quietly',
    storage,
    now: new Date('2026-10-01T00:00:00.000Z'),
    createCanvas: () => canvas,
    download: async () => true
  });
  assert.equal(first.ok, true);
  assert.equal(painted, true);
  assert.equal(readMindfulnessScrollHistory(storage).length, 1);
  const second = await saveMindfulnessScroll({
    draft,
    title: 'Mindfulness Scroll',
    subtitle: 'Years of sitting, quietly',
    storage,
    now: new Date('2026-10-01T00:00:00.000Z'),
    createCanvas: () => canvas,
    download: async () => true
  });
  assert.equal(second.ok, true);
  assert.equal(readMindfulnessScrollHistory(storage).length, 1);
  paintMindfulnessScroll(canvas.getContext(), draft, {
    title: 't',
    subtitle: 's'
  });
  assert.equal(
    appendMindfulnessScrollSave(storage, { id: '', savedAt: '', from: '', to: '', lifetimeMinutes: 0 }),
    false
  );
});

test('ineligible save does not touch storage', async () => {
  const storage = memoryStorage();
  const draft = buildMindfulnessScrollDraft(storage, { score: 1, lifetimeMinutes: 1 });
  const result = await saveMindfulnessScroll({
    draft,
    title: 't',
    subtitle: 's',
    storage,
    createCanvas: () => {
      throw new Error('should not paint');
    }
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'not-eligible');
  assert.deepEqual(readMindfulnessScrollHistory(storage), []);
});
