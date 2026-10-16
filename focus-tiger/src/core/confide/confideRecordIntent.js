/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Three-way record intent (CR-50). Prototypes are capability keys, not user-ask lists.
 * Brief: task-confide-g2-fact-first.md
 */

import { decideKbNearMatch } from './kbNearMatch.js';

export const CONFIDE_RECORD_INTENT_KIND = Object.freeze({
  DEVICE_RECORD: 'device_record',
  DESIGN_DURATION: 'design_duration',
  COMPANION: 'companion'
});

/** Capability sentences for embedding. Not paraphrases of field failures. */
export const CONFIDE_RECORD_INTENT_PROTOTYPES = Object.freeze([
  Object.freeze({
    kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
    text: 'How long have I practiced according to sits already written on this device?'
  }),
  Object.freeze({
    kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
    text: 'When do I usually sit, according to this device practice log?'
  }),
  Object.freeze({
    kind: CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD,
    text: 'Have I been showing up on the days already counted on this device?'
  }),
  Object.freeze({
    kind: CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION,
    text: 'How long is one Breath or Sit session meant to last in the product?'
  })
]);

/**
 * @param {readonly { kind: string, vector: number[] }[]} rows
 * @param {number[]} userVector
 * @param {(a: number[], b: number[]) => number} scoreFn
 * @returns {{ kind: string, score: number | null }}
 */
export function pickNearestRecordIntent(rows, userVector, scoreFn) {
  let kind = CONFIDE_RECORD_INTENT_KIND.COMPANION;
  let score = -1;
  for (const row of rows) {
    const next = scoreFn(userVector, row.vector);
    if (next > score) {
      score = next;
      kind = row.kind;
    }
  }
  return {
    kind: score >= 0 ? kind : CONFIDE_RECORD_INTENT_KIND.COMPANION,
    score: score >= 0 ? score : null
  };
}

/**
 * @param {{ kind?: string | null, score?: number | null }} row
 * @returns {(typeof CONFIDE_RECORD_INTENT_KIND)[keyof typeof CONFIDE_RECORD_INTENT_KIND]}
 */
export function decideConfideRecordIntent(row) {
  const kind = row?.kind;
  if (
    kind !== CONFIDE_RECORD_INTENT_KIND.DEVICE_RECORD &&
    kind !== CONFIDE_RECORD_INTENT_KIND.DESIGN_DURATION
  ) {
    return CONFIDE_RECORD_INTENT_KIND.COMPANION;
  }
  const near = decideKbNearMatch({
    nearestId: kind,
    nearestScore: row.score
  });
  if (near.action === 'hit') return kind;
  return CONFIDE_RECORD_INTENT_KIND.COMPANION;
}
