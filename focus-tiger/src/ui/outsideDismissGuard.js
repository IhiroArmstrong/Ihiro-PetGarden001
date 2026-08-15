/**
 * Outside-dismiss guards for light panels (Arrival / Companion / Honesty /
 * Reminder / wide ⋯ menu).
 * Tip bubbles, help chrome, and ⋯ / drawer rows are not "blank space" —
 * clicking them must not cancel Notice/Choose, collapse Companion, or
 * swallow a menu-row click (reminder 「点了没反应」).
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
  if (el.closest('#onboarding-wellness-first')) return true;
  if (el.closest('#five-moments-compass')) return true;
  if (el.closest('#journey-log')) return true;
  if (el.closest('#moment-whisper')) return true;
  if (el.closest('#onboarding-hint-help')) return true;
  if (el.closest('#ft-narrow-help-btn')) return true;
  if (el.closest('#ft-hint-catalog-chip')) return true;
  if (el.closest('#ft-narrow-home-quickstart')) return true;
  if (el.closest('#quick-start-focus')) return true;
  // Hover tips sit on ⋯ / drawer rows; those clicks are not blank space.
  if (el.closest('#ft-wide-more-menu')) return true;
  if (el.closest('#ft-narrow-options-drawer')) return true;
  return false;
}
