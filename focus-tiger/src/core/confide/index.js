/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

export { CONFIDE_ROUTE, CONFIDE_EMOTION_BUCKETS, CONFIDE_EMOTION_PRIORITY } from './confideRoutes.js';
export { resolveConfideReply } from './confideReplyFlow.js';
export { confideClassify, canSubmitConfideText } from './confideClassify.js';
export {
  isPracticeDurationQuestion,
  shouldAnswerWithPracticeFacts,
  summarizePracticeFacts,
  formatPracticeDurationReply
} from './confidePracticeFacts.js';
export {
  CONFIDE_CORPUS,
  pickConfideLine,
  confideLineText,
  isConfideSafetyCorpusOk,
  linesForRoute
} from './confideCorpus.js';
export {
  CONFIDE_USER_MOUNT_ENABLED,
  isConfideUserVisible,
  isConfideDevHarness,
  isConfideChromeStageAllowed,
  canOpenConfidePanel,
  shouldShowConfideEarChrome
} from './confideUserVisibilityGate.js';
