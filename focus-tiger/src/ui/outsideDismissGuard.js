/**
 * Outside-dismiss guards for light panels (Arrival / Companion / Honesty).
 * Tip bubbles and help chrome are not "blank space" — clicking them must not
 * cancel Notice/Choose or collapse the Companion picker (§8 N18).
 */

/**
 * @param {EventTarget | null | undefined} target
 * @returns {boolean} true → ignore outside-dismiss for this event target
 */
export function shouldIgnoreOutsideDismissTarget(target) {
  const el =
    target && typeof target === 'object' && typeof target.closest === 'function'
      ? /** @type {Element} */ (target)
      : target &&
          typeof target === 'object' &&
          /** @type {{ parentElement?: Element | null }} */ (target).parentElement &&
          typeof /** @type {{ parentElement?: Element | null }} */ (target).parentElement
            .closest === 'function'
        ? /** @type {{ parentElement: Element }} */ (target).parentElement
        : null;
  if (!el) return false;
  if (el.closest('ft-onboarding-hint-bubble')) return true;
  if (el.closest('#onboarding-app-purpose')) return true;
  if (el.closest('#onboarding-privacy-sheet')) return true;
  if (el.closest('#onboarding-hint-help')) return true;
  if (el.closest('#ft-narrow-help-btn')) return true;
  if (el.closest('#ft-hint-catalog-chip')) return true;
  if (el.closest('#ft-narrow-home-quickstart')) return true;
  if (el.closest('#quick-start-focus')) return true;
  return false;
}
