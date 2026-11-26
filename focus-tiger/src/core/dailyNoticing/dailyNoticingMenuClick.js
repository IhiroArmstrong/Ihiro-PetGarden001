/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export function resolveDailyNoticingMenuClick(input = {}) {
  if (input.focusing === true) return 'busy';
  if (input.honestyBusy) return 'busy';
  if (input.breathBusy) return 'busy';
  if (input.recoverBusy) return 'busy';
  if (input.confideBusy) return 'busy';
  if (input.reflectionBusy) return 'busy';
  if (input.arrivalBusy) return 'busy';
  return 'open';
}