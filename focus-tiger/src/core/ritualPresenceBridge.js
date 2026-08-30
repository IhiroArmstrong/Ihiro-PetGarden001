/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Ritual chip presence-signals ledger + leave retrospective (Slice 2 · plan C).
 * Independent of ritual-completions.v1 (completion trail only).
 */

import { getRitualConfig } from './RitualFlow.js';
import { createPresenceSessionId } from './presenceSessionId.js';
import {
  appendPresenceSignal,
  readPresenceSignals,
  writePresenceSignals
} from './presenceSignalsGate.js';

/** Dwell before ritual welcome after retrospective bubble. */
export const RITUAL_LEAVE_RETROSPECTIVE_DWELL_MS = 4000;

/**
 * @param {string} ritualId
 * @param {Record<string, string>} selections
 * @returns {{ field: string, chipId: string }[]}
 */
export function listRitualChipSelections(ritualId, selections) {
  const config = getRitualConfig(ritualId);
  if (!config || !selections || typeof selections !== 'object') return [];
  /** @type {{ field: string, order: number, chipId: string }[]} */
  const rows = [];
  config.steps.forEach((step, index) => {
    if (step.kind !== 'chips') return;
    const chipId = selections[step.field];
    if (typeof chipId !== 'string' || !chipId) return;
    const valid = step.options.some((opt) => opt.id === chipId);
    if (!valid) return;
    rows.push({ field: step.field, order: index, chipId });
  });
  rows.sort((a, b) => a.order - b.order);
  return rows.map(({ field, chipId }) => ({ field, chipId }));
}

/**
 * @param {string} ritualId
 * @param {string} field
 * @param {string} chipId
 * @returns {string | null}
 */
export function resolveRitualChipLabelKey(ritualId, field, chipId) {
  const config = getRitualConfig(ritualId);
  if (!config) return null;
  for (const step of config.steps) {
    if (step.kind !== 'chips' || step.field !== field) continue;
    const opt = step.options.find((o) => o.id === chipId);
    return opt?.labelKey ?? null;
  }
  return null;
}

/**
 * @param {import('./presenceSignalsGate.js').PresenceSignalEntry[]} entries
 * @param {string} ritualId
 * @returns {{ ritualSessionId: string, field: string, emotionTag: string } | null}
 */
export function findPendingRitualLeaveRetrospective(entries, ritualId) {
  const chipRows = (entries || []).filter(
    (row) =>
      row.source === 'ritual_chip' &&
      row.ritualId === ritualId &&
      row.ritualCompleted === false &&
      row.emotionTag &&
      row.ritualSessionId
  );
  if (!chipRows.length) return null;

  /** @type {Map<string, import('./presenceSignalsGate.js').PresenceSignalEntry[]>} */
  const bySession = new Map();
  for (const row of chipRows) {
    const sid = row.ritualSessionId;
    if (!sid) continue;
    const list = bySession.get(sid) || [];
    list.push(row);
    bySession.set(sid, list);
  }

  const sessions = [...bySession.entries()].sort((a, b) => {
    const atA = Math.max(...a[1].map((r) => new Date(r.at).getTime()));
    const atB = Math.max(...b[1].map((r) => new Date(r.at).getTime()));
    return atB - atA;
  });

  for (const [ritualSessionId, rows] of sessions) {
    if (rows.every((r) => r.retrospectiveMentioned === true)) continue;
    const last = rows
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
      .at(-1);
    if (!last?.emotionTag || !last.field) continue;
    return {
      ritualSessionId,
      field: last.field,
      emotionTag: last.emotionTag
    };
  }
  return null;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} ritualSessionId
 */
export function markRitualSessionRetrospectiveMentioned(storage, ritualSessionId) {
  if (!storage || !ritualSessionId) return;
  const state = readPresenceSignals(storage);
  let changed = false;
  const entries = state.entries.map((row) => {
    if (
      row.ritualSessionId === ritualSessionId &&
      row.ritualCompleted === false
    ) {
      changed = true;
      return { ...row, retrospectiveMentioned: true };
    }
    return row;
  });
  if (changed) writePresenceSignals(storage, { entries });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} ritualId
 * @returns {{ ritualSessionId: string, field: string, emotionTag: string } | null}
 */
export function consumeRitualLeaveRetrospective(storage, ritualId) {
  const state = readPresenceSignals(storage);
  const pending = findPendingRitualLeaveRetrospective(state.entries, ritualId);
  if (!pending) return null;
  markRitualSessionRetrospectiveMentioned(storage, pending.ritualSessionId);
  return pending;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} ritualId
 * @param {Record<string, string>} selections
 * @param {{
 *   ritualSessionId: string,
 *   ritualCompleted: boolean,
 *   at?: string,
 *   now?: () => Date,
 *   idFn?: () => string
 * }} opts
 * @returns {number}
 */
export function appendRitualChipPresenceSignals(
  storage,
  ritualId,
  selections,
  opts
) {
  if (!storage || !opts?.ritualSessionId) return 0;
  const chips = listRitualChipSelections(ritualId, selections);
  if (!chips.length) return 0;

  const now = opts.now ?? (() => new Date());
  const baseAt = opts.at || now().toISOString();
  const baseMs = new Date(baseAt).getTime();
  let count = 0;
  let seq = 0;

  const presenceSessionId = createPresenceSessionId();
  for (const { field, chipId } of chips) {
    const at = Number.isFinite(baseMs)
      ? new Date(baseMs + seq).toISOString()
      : baseAt;
    seq += 1;
    const row = appendPresenceSignal(
      storage,
      {
        source: 'ritual_chip',
        emotionTag: chipId,
        ritualId,
        field,
        ritualSessionId: opts.ritualSessionId,
        ritualCompleted: opts.ritualCompleted,
        retrospectiveMentioned: opts.ritualCompleted ? undefined : false,
        presenceSessionId
      },
      {
        now,
        at,
        idFn: () => {
          const base =
            typeof opts.idFn === 'function'
              ? opts.idFn()
              : `rit-${opts.ritualSessionId}`;
          return `${base}-${field}-${seq}`;
        }
      }
    );
    if (row) count += 1;
  }
  return count;
}
