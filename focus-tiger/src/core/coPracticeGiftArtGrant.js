/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 grant evaluator. A ∧ B ∧ C, only on a sit that newly recorded a B day.
 */

import { getLocalDateKey } from '../utils/localDate.js';
import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES,
  readInviteOutcomeRecords
} from './inviteOutcomeStore.js';
import {
  evaluateCoPracticeRhythmStableProxy,
  readSessionDurationOfferRows
} from './coPracticeSessionJoinLedger.js';
import { resolvePracticeAggregate } from './practiceAggregate.js';
import {
  CO_PRACTICE_GIFT_ART_C,
  CO_PRACTICE_GIFT_ART_PIECES,
  CO_PRACTICE_GIFT_ART_SURFACE_ENABLED
} from './coPracticeGiftArtCatalog.js';
import {
  persistCoPracticeGiftArtGrant,
  readCoPracticeGiftArtState,
  recordCoPracticeGiftArtBDay
} from './coPracticeGiftArtStore.js';

const B_JOIN_KINDS = new Set([
  INVITE_OUTCOME_KINDS.AWAY,
  INVITE_OUTCOME_KINDS.EXTEND,
  INVITE_OUTCOME_KINDS.LONG_SIT
]);

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function calendarDayDiff(a, b) {
  const start = Date.parse(`${a}T00:00:00`);
  const end = Date.parse(`${b}T00:00:00`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.round((end - start) / 86400000);
}

/**
 * @param {string[]} bDays
 * @param {number} minCount
 * @param {number} minSpanDays
 */
export function cumulativeBSatisfied(bDays, minCount, minSpanDays) {
  if (!Array.isArray(bDays) || bDays.length < minCount) return false;
  const first = bDays[0];
  const last = bDays[bDays.length - 1];
  return calendarDayDiff(first, last) >= minSpanDays;
}

/**
 * @param {string} sessionId
 * @param {object[]} [inviteRows]
 * @param {object[]} [durationRows]
 */
export function isTimedSessionBJoin(
  sessionId,
  inviteRows = readInviteOutcomeRecords(),
  durationRows = readSessionDurationOfferRows()
) {
  if (!sessionId) return false;
  const completed = durationRows.find(
    (row) => row.sessionId === sessionId && row.actualCompletedMinutes != null
  );
  if (!completed) return false;
  return inviteRows.some(
    (inv) =>
      inv.sessionId === sessionId &&
      B_JOIN_KINDS.has(inv.kind) &&
      inv.outcome === INVITE_OUTCOME_VALUES.ACCEPTED
  );
}

/**
 * @param {object} [proxy]
 */
export function rhythmProxyPassesC(proxy) {
  if (!proxy || proxy.available === false) return false;
  if (typeof proxy.hitRatio !== 'number') return false;
  if ((proxy.sampleCount || 0) < CO_PRACTICE_GIFT_ART_C.sampleSize) return false;
  return proxy.hitRatio >= CO_PRACTICE_GIFT_ART_C.minHitRatio;
}

/**
 * @param {object} input
 * @param {number} input.lifetimeMinutes
 * @param {string[]} input.bDays
 * @param {{ id: string }[]} input.grants
 * @param {object} input.rhythmProxy
 * @param {boolean} input.bDayAddedThisSession
 * @param {string} [input.nowDayKey]
 * @param {boolean} [input.surfaceEnabled]
 * @param {boolean} [input.allowProvisionalTiers]
 */
export function evaluateCoPracticeGiftArtGrant(input) {
  const surfaceEnabled =
    input.surfaceEnabled ?? CO_PRACTICE_GIFT_ART_SURFACE_ENABLED;
  if (!surfaceEnabled) {
    return { grant: false, reason: 'surface_off' };
  }
  if (input.bDayAddedThisSession !== true) {
    return { grant: false, reason: 'not_b_join_session' };
  }
  const granted = new Set((input.grants || []).map((row) => row.id));
  const next = CO_PRACTICE_GIFT_ART_PIECES.find(
    (piece) =>
      !granted.has(piece.id) &&
      (piece.grantEnabled || input.allowProvisionalTiers === true)
  );
  if (!next) {
    return { grant: false, reason: 'no_enabled_piece' };
  }
  if ((Number(input.lifetimeMinutes) || 0) < next.aMinutes) {
    return { grant: false, reason: 'a_short', pieceId: next.id };
  }
  if (!cumulativeBSatisfied(input.bDays || [], next.bDays, next.bSpanDays)) {
    return { grant: false, reason: 'b_short', pieceId: next.id };
  }
  if (!rhythmProxyPassesC(input.rhythmProxy)) {
    return { grant: false, reason: 'c_short', pieceId: next.id };
  }
  return {
    grant: true,
    pieceId: next.id,
    dayKey: input.nowDayKey || getLocalDateKey(new Date())
  };
}

/**
 * Record a B day if this timed session joined, then maybe persist a grant.
 * Does not open UI.
 *
 * @param {{
 *   sessionId: string,
 *   completedAt?: number,
 *   surfaceEnabled?: boolean,
 *   lifetimeMinutes?: number
 * }} opts
 */
export function noteCoPracticeGiftArtAfterTimedComplete(opts) {
  const sessionId = opts.sessionId;
  if (!sessionId) return { bDayAdded: false, evaluation: null };
  const isJoin = isTimedSessionBJoin(sessionId);
  if (!isJoin) {
    return {
      bDayAdded: false,
      evaluation: evaluateCoPracticeGiftArtGrant({
        lifetimeMinutes: opts.lifetimeMinutes ?? 0,
        bDays: readCoPracticeGiftArtState().bDays,
        grants: readCoPracticeGiftArtState().grants,
        rhythmProxy: evaluateCoPracticeRhythmStableProxy(),
        bDayAddedThisSession: false,
        surfaceEnabled: opts.surfaceEnabled
      })
    };
  }
  const dayKey = getLocalDateKey(new Date(opts.completedAt || Date.now()));
  const bDayAdded = recordCoPracticeGiftArtBDay(dayKey);
  const state = readCoPracticeGiftArtState();
  const lifetimeMinutes =
    opts.lifetimeMinutes ??
    resolvePracticeAggregate().scoreEligibleLifetimeMinutes ??
    0;
  const evaluation = evaluateCoPracticeGiftArtGrant({
    lifetimeMinutes,
    bDays: state.bDays,
    grants: state.grants,
    rhythmProxy: evaluateCoPracticeRhythmStableProxy(),
    bDayAddedThisSession: bDayAdded,
    nowDayKey: dayKey,
    surfaceEnabled: opts.surfaceEnabled
  });
  if (evaluation.grant && evaluation.pieceId) {
    persistCoPracticeGiftArtGrant({
      id: evaluation.pieceId,
      grantedDayKey: dayKey,
      grantedAt: opts.completedAt || Date.now()
    });
  }
  return { bDayAdded, evaluation };
}
