/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  addInnerMirrorChangeMoment,
  correctInnerMirrorEntry,
  leaveInnerMirrorEntry,
  readInnerMirrorState
} from './innerMirrorStore.js';
import {
  INNER_MIRROR_WEEKLY_MAY_ENTER_GENERATION,
  INNER_MIRROR_FORBIDDEN_JUDGMENTS,
  buildInnerMirrorWeeklyReview,
  weeklyReviewContainsForbiddenJudgment,
  weeklyReviewLeaksSourceText
} from './innerMirrorWeeklyReview.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

const COPY = {
  notEnough: '还不够',
  themeLine: "这 7 天里，你留下的句子有 {count} 次写到「{name}」。",
  askOnce: '这几次里，有没有一句你现在想改口？',
  labels: { criticized: '被批评', tired: '累' }
};

const NOW = new Date('2026-11-28T12:00:00.000Z');

function leaveMany(storage, n, text) {
  const ids = [];
  for (let i = 0; i < n; i += 1) {
    const left = leaveInnerMirrorEntry(storage, {
      text,
      locale: 'en',
      now: new Date(NOW.getTime() - i * 60_000).toISOString()
    });
    assert.equal(left.ok, true);
    ids.push(left.entry.id);
  }
  return ids;
}

describe('innerMirror weekly review', () => {
  it('does not enter generation', () => {
    assert.equal(INNER_MIRROR_WEEKLY_MAY_ENTER_GENERATION, false);
    const src = readFileSync(fileURLToPath(import.meta.url).replace('.test.js', '.js'), 'utf8');
    assert.doesNotMatch(src, /\.generate\s*\(/);
    assert.doesNotMatch(src, /prompt\s*\(/);
    const ui = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../ui/ConfideToYinUI.js'),
      'utf8'
    );
    assert.match(ui, /inner-mirror-weekly-open/);
    assert.match(ui, /inner-mirror-change-save/);
    assert.match(ui, /buildInnerMirrorWeeklyReview/);
  });

  it('shows only 还不够 when fewer than 3 leaves or no key reaches 3', () => {
    const storage = memoryStorage();
    leaveMany(storage, 2, 'I was criticized at work');
    const short = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    assert.equal(short.kind, 'not-enough');
    assert.deepEqual(short.lines, ['还不够']);
    assert.equal(short.ask, '');

    leaveInnerMirrorEntry(storage, {
      text: 'I am so tired today and drained',
      locale: 'en',
      now: NOW.toISOString()
    });
    leaveInnerMirrorEntry(storage, {
      text: 'I need a pause before I continue',
      locale: 'en',
      now: NOW.toISOString()
    });
    const mixed = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    assert.equal(mixed.kind, 'not-enough');
    assert.deepEqual(mixed.lines, ['还不够']);
  });

  it('fills the locked template when one key reaches 3 and never calls generation', () => {
    const storage = memoryStorage();
    leaveMany(storage, 3, 'I was criticized at work');
    const review = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    assert.equal(review.kind, 'themes');
    assert.deepEqual(review.lines, ['这 7 天里，你留下的句子有 3 次写到「被批评」。']);
    assert.equal(review.ask, COPY.askOnce);
    assert.equal(review.facts.keys[0].key, 'criticized');
    assert.equal(weeklyReviewContainsForbiddenJudgment(review), false);
  });

  it('hides a corrected theme; removing the gate would show it again', () => {
    const storage = memoryStorage();
    const ids = leaveMany(storage, 3, 'I was criticized at work');
    const before = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    assert.equal(before.kind, 'themes');
    const corrected = correctInnerMirrorEntry(storage, {
      id: ids[0],
      replacement: 'That meeting felt rushed, not who I am',
      locale: 'en',
      now: NOW.toISOString()
    });
    assert.equal(corrected.ok, true);
    const gated = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY,
      applyCorrectionGate: true
    });
    assert.equal(gated.kind, 'not-enough');
    assert.deepEqual(gated.lines, ['还不够']);
    assert.equal(gated.ask, '');
    const ungated = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY,
      applyCorrectionGate: false
    });
    assert.equal(ungated.kind, 'themes');
    assert.match(ungated.lines.join('\n'), /被批评/);
  });

  it('rejects personality / progress judgments and does not leak left or replacement text', () => {
    const storage = memoryStorage();
    const secret = 'I was criticized in the hallway';
    leaveMany(storage, 3, secret);
    const review = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    for (const phrase of INNER_MIRROR_FORBIDDEN_JUDGMENTS) {
      assert.equal(weeklyReviewOutputHas(review, phrase), false, phrase);
    }
    assert.equal(weeklyReviewLeaksSourceText(review, [secret]), false);
    const ids = readInnerMirrorState(storage).entries.map((row) => row.id);
    correctInnerMirrorEntry(storage, {
      id: ids[0],
      replacement: '回避型人格好转',
      locale: 'zh',
      now: NOW.toISOString()
    });
    const after = buildInnerMirrorWeeklyReview(readInnerMirrorState(storage), {
      now: NOW,
      copy: COPY
    });
    assert.equal(weeklyReviewLeaksSourceText(after, ['回避型人格好转']), false);
    assert.equal(weeklyReviewContainsForbiddenJudgment(after), false);
  });

  it('adds a change moment only after a user click with text', () => {
    const storage = memoryStorage();
    const empty = addInnerMirrorChangeMoment(storage, { text: '   ' });
    assert.equal(empty.ok, false);
    assert.equal(readInnerMirrorState(storage).changeMoments.length, 0);
    const crisis = addInnerMirrorChangeMoment(storage, {
      text: 'I want to kill myself',
      locale: 'en'
    });
    assert.equal(crisis.ok, false);
    const saved = addInnerMirrorChangeMoment(storage, {
      text: 'I named this a change',
      locale: 'en',
      now: NOW.toISOString()
    });
    assert.equal(saved.ok, true);
    assert.equal(readInnerMirrorState(storage).changeMoments[0].text, 'I named this a change');
  });
});

function weeklyReviewOutputHas(review, phrase) {
  const hay = [...(review.lines || []), review.ask || ''].join('\n');
  return hay.includes(phrase);
}
