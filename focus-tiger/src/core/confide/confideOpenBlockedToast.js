/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID,
  CONFIDE_OPEN_BLOCKED_TOAST_TESTID,
  confideOpenBlockedUserMessage
} from './confideOpenBlockedFeedback.js';

export function showConfideOpenBlockedToast({
  toast,
  locale,
  blockedVariant = 'safety',
  placement
}) {
  const entitlement = blockedVariant === 'entitlement';
  const message = confideOpenBlockedUserMessage(locale, {
    variant: entitlement ? 'entitlement' : 'safety'
  });
  if (!message) return;
  toast.element.dataset.testid = entitlement
    ? CONFIDE_OPEN_BLOCKED_ENTITLEMENT_TOAST_TESTID
    : CONFIDE_OPEN_BLOCKED_TOAST_TESTID;
  toast.show(message, { placement, visibleMs: 12_000 });
}
