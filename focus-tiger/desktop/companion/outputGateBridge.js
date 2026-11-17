/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Desktop-side import of the T100 output gate. l1Runtime must not import
 * `../../src/` directly (renderer/desktop split test).
 */

export {
  guardedGenerate,
  isCoveredUserLocale
} from '../../src/core/outputGate/outputGate.js';
export {
  chooseGeneratePathId,
  shouldRetryObserveAfterGate
} from '../../src/core/outputGate/wireGenerate.js';
