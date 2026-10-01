/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * My Circle peer trace rows — 24h witness_peek list (panel only).
 */

import {
  getFocusCircleIdentityPeekMap,
  isFocusCircleIdentityClientEnabled,
  readHiddenMemberIds,
  resolveFocusCircleDisplayName
} from './focusCircleIdentity.js';
import { readFocusCircleMembership } from './focusCircleMembership.js';

/**
 * @typedef {object} FocusCirclePeerTraceRow
 * @property {string} traceId
 * @property {string} phraseKey
 * @property {string} authorMemberId
 * @property {boolean} hasResponded
 * @property {string} [respondPhraseKey]
 */

/**
 * @param {unknown[]} traces
 * @returns {FocusCirclePeerTraceRow[]}
 */
export function normalizeFocusCirclePeerTraces(traces) {
  if (!Array.isArray(traces)) return [];
  /** @type {FocusCirclePeerTraceRow[]} */
  const out = [];
  for (const row of traces) {
    if (!row || typeof row !== 'object') continue;
    const traceId = typeof row.traceId === 'string' ? row.traceId : '';
    const phraseKey = typeof row.phraseKey === 'string' ? row.phraseKey : '';
    const authorMemberId =
      typeof row.authorMemberId === 'string' ? row.authorMemberId : '';
    if (!traceId || !phraseKey || !authorMemberId) continue;
    out.push({
      traceId,
      phraseKey,
      authorMemberId,
      hasResponded: Boolean(row.hasResponded),
      ...(typeof row.respondPhraseKey === 'string'
        ? { respondPhraseKey: row.respondPhraseKey }
        : {})
    });
  }
  return out;
}

/**
 * Newest-first for panel display (API order is oldest-first).
 *
 * @param {FocusCirclePeerTraceRow[]} traces
 * @returns {FocusCirclePeerTraceRow[]}
 */
export function sortFocusCirclePeerTracesForPanel(traces) {
  return [...traces].reverse();
}

/**
 * @param {object} opts
 * @param {FocusCirclePeerTraceRow} opts.trace
 * @param {(key: string) => string} opts.t
 * @param {Storage | null | undefined} [opts.storage]
 * @param {string} [opts.search]
 * @returns {{ leaveLine: string, respondLine: string | null }}
 */
export function formatFocusCirclePeerTraceLines({
  trace,
  t,
  storage = globalThis.localStorage,
  search = typeof globalThis.location?.search === 'string'
    ? globalThis.location.search
    : ''
}) {
  const membership = readFocusCircleMembership(storage);
  const identityEnabled = isFocusCircleIdentityClientEnabled({ storage, search });
  const anonLabel = t('FOCUS_CIRCLE_IDENTITY_ANON_LABEL');
  const hiddenMemberIds =
    membership?.circleId && identityEnabled
      ? readHiddenMemberIds(storage, membership.circleId)
      : new Set();
  const displayName = identityEnabled
    ? resolveFocusCircleDisplayName({
        anonLabel,
        memberId: trace.authorMemberId,
        identities: getFocusCircleIdentityPeekMap(),
        hiddenMemberIds,
        t
      })
    : anonLabel;
  const phraseText = t(trace.phraseKey);
  const leaveLine = t('FOCUS_CIRCLE_PEER_TRACES_LEAVE_LINE')
    .replace('{name}', displayName)
    .replace('{phrase}', phraseText);
  const respondLine =
    trace.hasResponded && trace.respondPhraseKey
      ? t('FOCUS_CIRCLE_PEER_TRACES_RESPOND_LINE').replace(
          '{phrase}',
          t(trace.respondPhraseKey)
        )
      : null;
  return { leaveLine, respondLine };
}
