/**
 * Idle chrome orchestration (responsive Task 3 · phase 1).
 * Shared stage / shell projection / secondary entry list for NarrowIdleShell
 * and WideIdleMoreMenu. Presentation (drawer vs ⋯) stays in the shells;
 * business decisions live here so the two files cannot drift.
 *
 * @see docs/task-briefs/task-responsive-single-chrome-line.md
 * @see docs/SHARED_RESOURCES.md §6
 */

import { shouldOfferLanguagePicker } from '../locales/localePreference.js';
import { listRitualConfigs } from './RitualFlow.js';
import { isEntitled } from './entitlement/entitlementGate.js';
import { isConfideUserVisible } from './confide/confideUserVisibilityGate.js';


/** @typedef {'narrow' | 'wide'} IdleChromeViewport */

/**
 * Coarse chrome stage for role visibility (contract-level, not DOM).
 * @typedef {'idle' | 'arrival' | 'focusing' | 'overlay-suppress' | 'bridge'} IdleChromeStage
 */

/**
 * @typedef {object} ShellChromeFlags
 * @property {boolean} idle
 * @property {boolean} suppressed
 * @property {boolean} [keepQuickStart]
 */

/**
 * @typedef {object} ShellChromeProjection
 * @property {ShellChromeFlags} narrow
 * @property {ShellChromeFlags} wide
 */

/**
 * @typedef {object} SecondaryEntryVisibility
 * @property {boolean} microRitualVisible
 * @property {boolean} companionVisible
 * @property {boolean} [companionEnabled]
 * @property {boolean} reminderAvailable
 * @property {boolean} [newsletterSubmitted]
 * @property {boolean} [scenesEntitled] override; default = isEntitled(ritual.morning.access)
 * @property {boolean} [confideUserVisible] override; default = isConfideUserVisible()
 * @property {boolean} [mustardSeedSealUnlocked] memorial seal menu after score unlock
 */

/**
 * @typedef {object} SecondaryChromeEntry
 * @property {string} [proxy]
 * @property {string} labelKey
 * @property {'item' | 'group-label'} [kind]
 * @property {string} [featureKey]
 * @property {boolean} [locked]
 * @property {boolean} [interactive] false = visible confirmation row, not clickable
 * @property {'beige-cta'} [emphasis]
 * @property {string} [testId]
 */

/** Menu / drawer row → onboarding hint id (mint dot on first visit). */
export const SECONDARY_PROXY_HINT_IDS = Object.freeze({
  honesty: 'honesty-optional',
  companion: 'how-shall-we-sit',
  reminder: 'in-app-reminder'
  // breath / micro-ritual: home left ball (quick-start), not a secondary row
  // language: no first-visit mint (always available)
  // advanced RitualFlow rows: entitlement-gated; no first-visit mint
});

/**
 * Inverse of SECONDARY_PROXY_HINT_IDS (hint → proxy key), or null.
 * @param {string} hintId
 * @returns {'honesty' | 'breath' | 'companion' | 'reminder' | null}
 */
export function secondaryProxyForHintId(hintId) {
  if (!hintId) return null;
  for (const [proxy, id] of Object.entries(SECONDARY_PROXY_HINT_IDS)) {
    if (id === hintId) {
      return /** @type {'honesty' | 'breath' | 'companion' | 'reminder'} */ (
        proxy
      );
    }
  }
  return null;
}

/**
 * @param {HTMLElement} btn
 * @param {boolean} show
 * @returns {void}
 */
export function syncSecondaryMenuHintDot(btn, show) {
  if (!btn) return;
  let dot = btn.querySelector(':scope > .ft-secondary-menu-hint-dot');
  if (!show) {
    dot?.remove();
    return;
  }
  if (!dot) {
    dot = document.createElement('span');
    dot.className = 'ft-secondary-menu-hint-dot';
    dot.setAttribute('aria-hidden', 'true');
    btn.appendChild(dot);
  }
}

/** Narrow park / stage body classes (single spelling). */
export const NARROW_STAGE_CLASS = Object.freeze({
  companion: 'ft-narrow-stage-companion',
  reminder: 'ft-narrow-stage-reminder',
  sound: 'ft-narrow-stage-sound',
  language: 'ft-narrow-stage-language'
});

/** Wide park / stage body classes (single spelling). */
export const WIDE_STAGE_CLASS = Object.freeze({
  companion: 'ft-wide-stage-companion',
  reminder: 'ft-wide-stage-reminder',
  sound: 'ft-wide-stage-sound',
  language: 'ft-wide-stage-language'
});

/**
 * Resolve coarse stage from the same inputs `resyncSessionChrome` uses.
 *
 * @param {{
 *   focusing: boolean,
 *   arrivalOpen: boolean,
 *   overlayActive: boolean,
 *   honestyBusy: boolean,
 *   bridgeVisible: boolean,
 *   companionExpanded?: boolean,
 *   postChoosePending?: boolean
 * }} input
 * @returns {IdleChromeStage}
 */
export function resolveIdleChromeStage(input) {
  const {
    focusing,
    arrivalOpen,
    overlayActive,
    honestyBusy,
    bridgeVisible
  } = input;
  if (focusing) return 'focusing';
  // Arrival / Companion / Honesty / Choose→nod: Quick-only chrome.
  if (
    arrivalOpen ||
    input.companionExpanded ||
    honestyBusy ||
    input.postChoosePending
  ) {
    return 'arrival';
  }
  // Reflection / micro-ritual / other post-session overlays (not honesty busy).
  if (overlayActive) return 'overlay-suppress';
  if (bridgeVisible) return 'bridge';
  return 'idle';
}

/**
 * When true: hide Sit / Honesty / ⋯ (or grabber), keep Quick Start ball.
 * Arrival, Honesty check-in UI, Companion picker, and the Choose→nod gap
 * before Companion expands (`postChoosePending`).
 *
 * @param {{
 *   arrivalOpen?: boolean,
 *   honestyBusy?: boolean,
 *   companionExpanded?: boolean,
 *   postChoosePending?: boolean
 * }} input
 * @returns {boolean}
 */
export function shouldKeepQuickStartOnly(input) {
  return Boolean(
    input.arrivalOpen ||
      input.honestyBusy ||
      input.companionExpanded ||
      input.postChoosePending
  );
}

/**
 * Narrow / wide shell flags — must match `sessionChromeSync.resyncSessionChrome`
 * and the wide suppress half of `syncHonestyIdleEntry`.
 *
 * @param {{
 *   focusing: boolean,
 *   overlayActive: boolean,
 *   honestyBusy: boolean,
 *   arrivalOpen: boolean,
 *   bridgeVisible: boolean,
 *   companionExpanded?: boolean,
 *   postChoosePending?: boolean
 * }} input
 * @returns {ShellChromeProjection}
 */
export function resolveShellChromeProjection(input) {
  const {
    focusing,
    overlayActive,
    honestyBusy,
    arrivalOpen,
    bridgeVisible,
    companionExpanded = false,
    postChoosePending = false
  } = input;
  const keepQuickStart = shouldKeepQuickStartOnly({
    arrivalOpen,
    honestyBusy,
    companionExpanded,
    postChoosePending
  });
  // Arrival / Honesty / Companion / post-Choose: suppress secondary, keep Quick.
  // Reflection / micro-ritual overlay without keepQuickStart: full suppress.
  const chromeSuppressed = Boolean(
    overlayActive || honestyBusy || companionExpanded || postChoosePending
  );
  return {
    narrow: {
      idle: !focusing,
      // Narrow home balls (z30) sit above bridge CTA (z18 in #ui-overlay) —
      // must full-suppress on bridge so Yes/No are not covered. ActionBar stays
      // (setSuppressed + !keepQuickStart → is-suppressed; ActionBar exempt).
      suppressed: Boolean(chromeSuppressed || bridgeVisible),
      keepQuickStart
    },
    wide: {
      idle: !focusing,
      // Wide ⋯ also suppresses on Honesty bridge (narrow ActionBar stays).
      suppressed: Boolean(chromeSuppressed || bridgeVisible),
      keepQuickStart
    }
  };
}

/**
 * Contract-level role visibility for Sit / Quick Start / Honesty / More(⋯) /
 * Grabber. Aligns with SHARED_RESOURCES §6 narrative (not a third SSOT —
 * registry selectors remain the lock).
 *
 * @param {{ stage: IdleChromeStage, viewport: IdleChromeViewport }} input
 * @returns {{
 *   sit: 'visible' | 'hidden' | 'disabled',
 *   quickStart: 'visible' | 'hidden',
 *   honesty: 'visible' | 'hidden' | 'in-menu',
 *   moreOrGrabber: 'visible' | 'hidden' | 'na',
 *   actionBar: 'visible' | 'na'
 * }}
 */
export function resolveRoleVisibility(input) {
  const { stage, viewport } = input;
  const narrow = viewport === 'narrow';

  if (stage === 'focusing') {
    return {
      sit: 'hidden',
      quickStart: 'hidden',
      honesty: 'hidden',
      moreOrGrabber: 'hidden',
      actionBar: narrow ? 'visible' : 'na'
    };
  }

  if (stage === 'arrival') {
    return {
      sit: 'hidden',
      quickStart: 'visible',
      honesty: 'hidden',
      moreOrGrabber: 'hidden',
      actionBar: narrow ? 'visible' : 'na'
    };
  }

  if (stage === 'overlay-suppress') {
    return {
      sit: 'hidden',
      quickStart: 'hidden',
      honesty: 'hidden',
      moreOrGrabber: 'hidden',
      actionBar: narrow ? 'visible' : 'na'
    };
  }

  if (stage === 'bridge') {
    // Narrow: hide home balls + grabber (they cover Yes/No); ActionBar stays.
    // Wide: ⋯ hidden; home balls may still show below the glass panel.
    return {
      sit: narrow ? 'hidden' : 'visible',
      quickStart: narrow ? 'hidden' : 'visible',
      honesty: narrow ? 'hidden' : 'visible',
      moreOrGrabber: 'hidden',
      actionBar: narrow ? 'visible' : 'na'
    };
  }

  // idle — both viewports: Sit / Quick / Honesty are home balls (wide ⋯ is secondary only).
  return {
    sit: 'visible',
    quickStart: 'visible',
    honesty: 'visible',
    moreOrGrabber: 'visible',
    actionBar: narrow ? 'visible' : 'na'
  };
}

/**
 * Advanced RitualFlow scenes unlock with Membership ∪ Sanctuary Lifetime.
 * @param {SecondaryEntryVisibility} visibility
 * @returns {boolean}
 */
function hasUnlockedAdvancedScenes(visibility) {
  if (typeof visibility.scenesEntitled === 'boolean') {
    return visibility.scenesEntitled;
  }
  return isEntitled('ritual.morning.access');
}

/**
 * Secondary chrome entries for drawer (narrow) or ⋯ menu (wide).
 * Honesty is a home ball on both viewports — never listed here.
 *
 * @param {'narrow-drawer' | 'wide-more'} surface
 * @param {SecondaryEntryVisibility} visibility
 * @returns {SecondaryChromeEntry[]}
 */
export function listSecondaryChromeEntries(surface, visibility) {
  const companionOk =
    Boolean(visibility.companionVisible) &&
    (surface === 'narrow-drawer' ||
      visibility.companionEnabled !== false);

  /** @type {SecondaryChromeEntry[]} */
  const out = [];

  // Breath practice is the home left ball — never list in drawer / ⋯.

  if (companionOk) {
    out.push({
      proxy: 'companion',
      labelKey: 'COMPANION_MODE_HINT'
    });
  }

  // Sound lives only on top-right note / narrow ♪ (2026-07-30) — not a menu row.

  if (visibility.reminderAvailable) {
    out.push({
      proxy: 'reminder',
      labelKey: 'reminder.setting_title'
    });
  }

  // Language chrome only when ≥2 ready locales (v1.0.0 English-only → hidden).
  if (shouldOfferLanguagePicker()) {
    out.push({
      proxy: 'language',
      labelKey: 'LANGUAGE_MENU_LABEL'
    });
  }

  // Five Moments Compass — voluntary guide (Task B; no first-visit mint).
  out.push({
    proxy: 'five-moments',
    labelKey: 'FIVE_MOMENTS_MENU_LABEL'
  });

  // Journey Log — local practice trail (D′; Tea Log pattern; not HealthKit / tip-jar).
  out.push({
    proxy: 'journey-log',
    labelKey: 'JOURNEY_LOG_MENU_LABEL'
  });

  // Confide to Yin — zen listener (retrieve-not-generate). Hidden until safety copy ok.
  const confideVisible =
    typeof visibility.confideUserVisible === 'boolean'
      ? visibility.confideUserVisible
      : isConfideUserVisible();
  if (confideVisible) {
    out.push({
      proxy: 'confide',
      labelKey: 'CONFIDE_MENU_LABEL'
    });
  }

  // Growth pack ① — always available gift entry (no first-visit mint).
  out.push({
    proxy: 'zen-cinema',
    labelKey: 'ZEN_CINEMA_MENU_LABEL'
  });

  // Growth pack ③ — daily quiet line + save image (no first-visit mint).
  out.push({
    proxy: 'daily-quote',
    labelKey: 'DAILY_ZEN_QUOTE_MENU_LABEL'
  });

  // Memorial seal 《芥子须弥》— menu only after unified practice score unlock.
  if (visibility.mustardSeedSealUnlocked) {
    out.push({
      proxy: 'mustard-seed-seal',
      labelKey: 'MUSTARD_SEED_SEAL_MENU_LABEL'
    });
  }

  // Digital wallpapers gift — curated stills; free save (no tip / Sanctuary gate).
  out.push({
    proxy: 'wallpapers',
    labelKey: 'WALLPAPER_MENU_LABEL'
  });

  // Sanctuary / Tea / full Membership catalog stay on the top-right Support FAB.
  // One contextual row here (not the three pay SKUs) sits at the top of Rituals:
  // beige subscribe CTA when advanced scenes are locked; "You're subscribed"
  // (same Membership card) when entitled.

  // Stay in touch — optional email capture (not an account; no entitlement gate).
  // After submit: confirmation row only (We'll keep in touch) — not re-openable.
  // Do not say "You're subscribed" here — that copy is reserved for paid access.
  if (visibility.newsletterSubmitted) {
    out.push({
      proxy: 'newsletter',
      labelKey: 'NEWSLETTER_MENU_CONFIRMED',
      interactive: false
    });
  } else {
    out.push({
      proxy: 'newsletter',
      labelKey: 'NEWSLETTER_MENU_LABEL'
    });
  }

  // Join our community — static external link (placeholder URL).
  out.push({
    proxy: 'community',
    labelKey: 'COMMUNITY_MENU_LABEL'
  });

  const scenesEntitled = hasUnlockedAdvancedScenes(visibility);
  if (scenesEntitled) {
    out.push({
      proxy: 'membership',
      labelKey: 'MEMBERSHIP_MENU_SUBSCRIBED',
      testId: 'idle-membership-subscribed'
    });
  } else {
    out.push({
      proxy: 'membership',
      labelKey: 'MEMBERSHIP_MENU_CTA',
      emphasis: 'beige-cta',
      testId: 'idle-membership-cta'
    });
  }

  // Advanced RitualFlow scenes (entitlement-gated; free Breath practice stays home left ball).
  out.push({
    kind: 'group-label',
    labelKey: 'ritual.menu_group'
  });
  for (const ritual of listRitualConfigs()) {
    const locked = !isEntitled(ritual.accessFeatureKey);
    out.push({
      kind: 'item',
      proxy: ritual.menuProxy,
      labelKey: ritual.menuLabelKey,
      featureKey: ritual.accessFeatureKey,
      locked
    });
  }

  return out;
}
