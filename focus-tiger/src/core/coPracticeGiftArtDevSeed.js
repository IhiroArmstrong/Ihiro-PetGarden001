/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 2a — DEV-only four join scenes. Must not ship in production builds
 * (callers wrap with import.meta.env.DEV).
 */

import {
  INVITE_OUTCOME_KINDS,
  INVITE_OUTCOME_VALUES,
  recordInviteOutcome
} from './inviteOutcomeStore.js';
import {
  beginCoPracticeTimedSession,
  completeCoPracticeTimedSession,
  countCoPracticeBJoinDaySketches,
  endCoPracticeTimedSessionActive,
  evaluateCoPracticeRhythmStableProxy
} from './coPracticeSessionJoinLedger.js';
import { setYinAdaptationEnabled } from './yinAdaptationStore.js';

/**
 * @returns {{
 *   acceptedCompleted: { pass: boolean, b: number },
 *   honestyNoJoin: { pass: boolean, b: number },
 *   acceptedUnfinished: { pass: boolean, b: number },
 *   adaptationOff: { pass: boolean, available: boolean }
 * }}
 */
export function runCoPracticeGiftArtJoinFourScenes() {
  const before = countCoPracticeBJoinDaySketches();

  const sessionA = beginCoPracticeTimedSession({
    offeredDefaultMinutes: 25,
    startedAtMs: Date.now()
  });
  recordInviteOutcome(
    INVITE_OUTCOME_KINDS.AWAY,
    INVITE_OUTCOME_VALUES.ACCEPTED,
    Date.now(),
    undefined,
    sessionA || undefined
  );
  completeCoPracticeTimedSession({ actualCompletedMinutes: 25 });
  const afterAccept = countCoPracticeBJoinDaySketches();

  const honestyB = countCoPracticeBJoinDaySketches();

  const sessionC = beginCoPracticeTimedSession({
    offeredDefaultMinutes: 20,
    startedAtMs: Date.now() + 1
  });
  recordInviteOutcome(
    INVITE_OUTCOME_KINDS.LONG_SIT,
    INVITE_OUTCOME_VALUES.ACCEPTED,
    Date.now(),
    undefined,
    sessionC || undefined
  );
  endCoPracticeTimedSessionActive();
  const afterUnfinished = countCoPracticeBJoinDaySketches();

  setYinAdaptationEnabled(false);
  const proxy = evaluateCoPracticeRhythmStableProxy();
  setYinAdaptationEnabled(true);

  return {
    acceptedCompleted: {
      pass: afterAccept === before + 1,
      b: afterAccept
    },
    honestyNoJoin: {
      pass: honestyB === afterAccept,
      b: honestyB
    },
    acceptedUnfinished: {
      pass: afterUnfinished === afterAccept,
      b: afterUnfinished
    },
    adaptationOff: {
      pass: proxy.available === false,
      available: proxy.available !== false
    }
  };
}

export function fourScenesAllPass(result) {
  return Boolean(
    result?.acceptedCompleted?.pass &&
      result?.honestyNoJoin?.pass &&
      result?.acceptedUnfinished?.pass &&
      result?.adaptationOff?.pass
  );
}
