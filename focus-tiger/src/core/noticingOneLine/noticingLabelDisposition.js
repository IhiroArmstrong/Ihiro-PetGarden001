/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Lab-only. Not a live reply kind. */
export const NOTICING_UNCLEAR_KIND = 'unclear';

/** Lab-only class id. Live crisis stays on the existing safety layer. */
export const NOTICING_CRISIS_CLASS_ID = 'crisis';

export const NOTICING_LIVE_KINDS = Object.freeze(['hold', 'invite_sit']);

/**
 * PO 2026-11-19 lock after isolationPassed=false.
 * Isolation fixtures may still list four lab classes; product routing must not.
 */
export const NOTICING_LABEL_DISPOSITION = Object.freeze({
  unclear: 'cancelled-fold-into-hold',
  crisis: 'live-safety-layer-not-this-classifier',
  holdVsInviteSit: 'library-kinds-not-vector-classes',
  picker: 'date-salt-mixed-pool'
});

export function isNoticingLiveKind(kind) {
  return NOTICING_LIVE_KINDS.includes(kind);
}

/** Vector / isolation class fields on picker opts must never change the pick. */
export function noticingPickerVectorSignalKeys() {
  return Object.freeze(['embedding', 'classHint', 'isolationClass', 'kindFilter']);
}
