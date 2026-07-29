/**
 * Idle chrome orchestration (responsive Task 3 · phase 1).
 * Shared stage / shell projection / secondary entry list for NarrowIdleShell
 * and WideIdleMoreMenu. Presentation (drawer vs ⋯) stays in the shells;
 * business decisions live here so the two files cannot drift.
 *
 * @see docs/task-briefs/task-responsive-single-chrome-line.md
 * @see docs/SHARED_RESOURCES.md §6
 */

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
 */

/**
 * @typedef {object} SecondaryChromeEntry
 * @property {'honesty' | 'breath' | 'companion' | 'reminder'} proxy
 * @property {string} labelKey
 */

/** Menu / drawer row → onboarding hint id (mint dot on first visit). */
export const SECONDARY_PROXY_HINT_IDS = Object.freeze({
  honesty: 'honesty-optional',
  breath: 'micro-ritual',
  companion: 'how-shall-we-sit',
  reminder: 'in-app-reminder'
});

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
  sound: 'ft-narrow-stage-sound'
});

/** Wide park / stage body classes (single spelling). */
export const WIDE_STAGE_CLASS = Object.freeze({
  companion: 'ft-wide-stage-companion',
  reminder: 'ft-wide-stage-reminder',
  sound: 'ft-wide-stage-sound'
});

/**
 * Resolve coarse stage from the same inputs `resyncSessionChrome` uses.
 *
 * @param {{
 *   focusing: boolean,
 *   arrivalOpen: boolean,
 *   overlayActive: boolean,
 *   honestyBusy: boolean,
 *   bridgeVisible: boolean
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
  if (arrivalOpen) return 'arrival';
  if (overlayActive || honestyBusy) return 'overlay-suppress';
  if (bridgeVisible) return 'bridge';
  return 'idle';
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
 *   bridgeVisible: boolean
 * }} input
 * @returns {ShellChromeProjection}
 */
export function resolveShellChromeProjection(input) {
  const {
    focusing,
    overlayActive,
    honestyBusy,
    arrivalOpen,
    bridgeVisible
  } = input;
  const chromeSuppressed = Boolean(overlayActive || honestyBusy);
  return {
    narrow: {
      idle: !focusing,
      suppressed: chromeSuppressed,
      keepQuickStart: Boolean(arrivalOpen)
    },
    wide: {
      idle: !focusing,
      // Wide ⋯ also suppresses on Honesty bridge (narrow ActionBar stays).
      suppressed: Boolean(chromeSuppressed || bridgeVisible)
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
    // Narrow: ActionBar stays; home chrome not force-suppressed by bridge alone.
    // Wide: ⋯ suppressed so Yes/No stay clear.
    return {
      sit: 'visible',
      quickStart: 'visible',
      honesty: narrow ? 'visible' : 'in-menu',
      moreOrGrabber: narrow ? 'visible' : 'hidden',
      actionBar: narrow ? 'visible' : 'na'
    };
  }

  // idle
  return {
    sit: 'visible',
    quickStart: 'visible',
    honesty: narrow ? 'visible' : 'in-menu',
    moreOrGrabber: 'visible',
    actionBar: narrow ? 'visible' : 'na'
  };
}

/**
 * Secondary chrome entries for drawer (narrow) or ⋯ menu (wide).
 * Honesty is home-ball on narrow — only listed on wide.
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

  if (surface === 'wide-more') {
    out.push({
      proxy: 'honesty',
      labelKey: 'HONESTY_IDLE_ENTRY'
    });
  }

  if (visibility.microRitualVisible) {
    out.push({
      proxy: 'breath',
      labelKey: 'micro_ritual.button'
    });
  }

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

  return out;
}
