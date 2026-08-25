/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Dual-write Reflection answers into presence-signals (freeText per question).
 * Trend tallies use emotionTag only — reflection rows are freeText-only by design.
 */

import { appendPresenceSignal } from './presenceSignalsGate.js';
import { REFLECTION_ANSWER_FIELDS } from '../ui/ReflectionFlowState.js';

/** @type {Record<string, 'reflection_q1' | 'reflection_q2' | 'reflection_q3'>} */
const SOURCE_BY_FIELD = Object.freeze({
  notice: 'reflection_q1',
  emotion: 'reflection_q2',
  nextFocus: 'reflection_q3'
});

/**
 * @param {Storage | null | undefined} storage
 * @param {Record<string, string>} result
 * @param {{ now?: () => Date, idFn?: () => string, at?: string }} [opts]
 * @returns {number} rows appended
 */
export function appendReflectionPresenceSignals(storage, result, opts = {}) {
  if (!storage || !result || typeof result !== 'object') return 0;
  const now = opts.now ?? (() => new Date());
  const at = opts.at || now().toISOString();
  let count = 0;
  let seq = 0;
  for (const field of REFLECTION_ANSWER_FIELDS) {
    const text = result[field];
    if (typeof text !== 'string' || !text.trim()) continue;
    const source = SOURCE_BY_FIELD[field];
    if (!source) continue;
    const row = appendPresenceSignal(
      storage,
      { source, freeText: text.trim(), at },
      {
        now,
        idFn: () => {
          seq += 1;
          const base =
            typeof opts.idFn === 'function' ? opts.idFn() : `refl-${at}`;
          return `${base}-${field}-${seq}`;
        }
      }
    );
    if (row) count += 1;
  }
  return count;
}
