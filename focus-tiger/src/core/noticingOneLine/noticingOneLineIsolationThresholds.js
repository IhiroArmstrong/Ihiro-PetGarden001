/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE } from '../confide/confideSemanticCrisisLayer.js';

/** @readonly */
export const NOTICING_ONE_LINE_ISOLATION = Object.freeze({
  brief: 'noticing-one-line-isolation',
  /** Failed four-class lab archive. Product routing uses noticingLabelDisposition. */
  embeddingModel: 'Qwen3-Embedding-0.6B',
  minCalibrationPerClass: 8,
  minParaphrasePerNonCrisisClass: 4,
  cohesionMinMeanPairwiseCosine: 0.4,
  separationMarginBelowMinCohesion: 0.1,
  productCriticalPair: Object.freeze(['hold', 'invite_sit']),
  crisisClassId: 'crisis',
  crisisFalsePositiveMaxCosine: DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE
});
