/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

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
import { isFocusCoinsAwardEnabled } from './focusCoinsAwardGate.js';
import { contemplativeArchiveSealIdFromProxy } from './memorialSealDirectory.js';


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
 * @property {boolean} [honestyBridgeActive]
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
 * @property {boolean} [companionGeneration] Electron wide L1 only; ignored on narrow-drawer
 * @property {boolean} [mustardSeedSealUnlocked] memorial seal menu after score unlock
 * @property {Array<{ proxy: string, labelKey: string }>} [contemplativeArchiveSealMenus]
 * @property {boolean} [yinCoinVisible] override; default = isFocusCoinsAwardEnabled()
 * @property {boolean} [systemTtsAvailable] macOS Electron wide System TTS menu row
 */

/**
 * @typedef {object} SecondaryChromeEntry
 * @property {string} [proxy]
 * @property {string} [handler]
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
 * Secondary Idle menu proxy → handler. Home balls / ♪ stay out (A2).
 * `close: false` keeps the sheet/menu for in-place panels (companion, language).
 *
 * @typedef {{
 *   handler: string,
 *   close?: boolean,
 *   stage?: string,
 *   prelude?: string,
 *   arg?: true
 * }} SecondaryProxyDispatchSpec
 */

export const SECONDARY_PROXY_DISPATCH = Object.freeze({
  'sanctuary-nav': { handler: 'onSanctuaryNav', close: true, arg: true },
  companion: {
    handler: 'onCompanion',
    close: false,
    stage: 'companion',
    prelude: 'onClearCompanion'
  },
  reminder: { handler: 'onReminder', close: true, stage: 'reminder' },
  language: { handler: 'onLanguage', close: false, stage: 'language' },
  'system-tts': { handler: 'onSystemTts', close: true, stage: 'systemTts' },
  'today-direction': { handler: 'onTodayDirection', close: true },
  'ground-exercise': { handler: 'onGroundExercise', close: true },
  'five-moments': { handler: 'onFiveMoments', close: true },
  honesty: { handler: 'onHonesty', close: true },
  'journey-log': { handler: 'onJourneyLog', close: true },
  'presence-signals': { handler: 'onPresenceSignals', close: true },
  'yin-coin': { handler: 'onYinCoin', close: true },
  confide: { handler: 'onConfide', close: true },
  'zen-cinema': { handler: 'onZenCinema', close: true },
  'daily-quote': { handler: 'onDailyQuote', close: true },
  'mustard-seed-seal': { handler: 'onMustardSeedSeal', close: true },
  wallpapers: { handler: 'onWallpapers', close: true },
  'art-collection': { handler: 'onArtCollection', close: true },
  sanctuary: { handler: 'onSanctuary', close: true },
  membership: { handler: 'onMembership', close: true },
  'tip-jar': { handler: 'onTipJar', close: true },
  newsletter: { handler: 'onNewsletter', close: true },
  community: { handler: 'onCommunity', close: true },
  'help-center': { handler: 'onHelpCenter', close: true },
  'local-backup': {
    handler: 'onLocalBackup',
    close: true,
    stage: 'localBackup'
  },
  'quiet-together': {
    handler: 'onQuietTogether',
    close: true,
    stage: 'quietTogether'
  },
  'focus-circle': {
    handler: 'onFocusCircle',
    close: true,
    stage: 'focusCircle'
  }
});

/**
 * @param {string | null | undefined} proxy
 * @returns {{
 *   proxy: string,
 *   handler: string,
 *   close: boolean,
 *   stage?: string,
 *   prelude?: string,
 *   arg?: true | string
 * } | null}
 */
export function resolveSecondaryChromeDispatch(proxy) {
  if (typeof proxy !== 'string' || !proxy) return null;
  const staticSpec = SECONDARY_PROXY_DISPATCH[proxy];
  if (staticSpec) {
    return {
      proxy,
      handler: staticSpec.handler,
      close: staticSpec.close !== false,
      stage: staticSpec.stage,
      prelude: staticSpec.prelude,
      arg: staticSpec.arg === true ? true : undefined
    };
  }
  for (const ritual of listRitualConfigs()) {
    if (ritual.menuProxy === proxy) {
      return {
        proxy,
        handler: 'onRitualFlow',
        close: true,
        arg: proxy
      };
    }
  }
  const sealId = contemplativeArchiveSealIdFromProxy(proxy);
  if (sealId) {
    return {
      proxy,
      handler: 'onContemplativeArchiveSeal',
      close: true,
      arg: sealId
    };
  }
  return null;
}

/**
 * @param {SecondaryChromeEntry} item
 * @returns {SecondaryChromeEntry}
 */
function attachSecondaryHandler(item) {
  if (!item || item.kind === 'group-label' || !item.proxy || item.handler) {
    return item;
  }
  const spec = resolveSecondaryChromeDispatch(item.proxy);
  if (!spec) return item;
  return { ...item, handler: spec.handler };
}

/**
 * Look up proxy → handler and run chrome prep. Does not call `handler?.()`.
 *
 * @param {string | null | undefined} proxy
 * @param {{
 *   handlers: Record<string, unknown>,
 *   closeFirst?: boolean,
 *   runPrelude?: boolean,
 *   clearStage?: () => void,
 *   close?: () => void,
 *   addStage?: (stage: string) => void
 * }} host
 * @param {{ locked?: boolean, interactive?: boolean }} [entryMeta]
 * @returns {'blocked' | 'missing-handler' | 'invoked' | 'unknown'}
 */
export function dispatchSecondaryChromeProxy(proxy, host, entryMeta = {}) {
  if (entryMeta.locked === true || entryMeta.interactive === false) {
    return 'blocked';
  }
  const spec = resolveSecondaryChromeDispatch(proxy);
  if (!spec) return 'unknown';
  const fn = host.handlers?.[spec.handler];
  if (typeof fn !== 'function') {
    console.error(
      `[idle-chrome] missing handler ${spec.handler} for proxy ${proxy}`
    );
    return 'missing-handler';
  }
  if (host.closeFirst && spec.close) host.close?.();
  host.clearStage?.();
  if (!host.closeFirst && spec.close) host.close?.();
  if (spec.stage) host.addStage?.(spec.stage);
  if (spec.prelude && host.runPrelude !== false) {
    const prelude = host.handlers[spec.prelude];
    if (typeof prelude === 'function') prelude();
  }
  if (spec.arg === undefined) fn();
  else fn(spec.arg);
  return 'invoked';
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
  language: 'ft-narrow-stage-language',
  localBackup: 'ft-narrow-stage-local-backup',
  quietTogether: 'ft-narrow-stage-quiet-together',
  focusCircle: 'ft-narrow-stage-focus-circle'
});

/** Wide park / stage body classes (single spelling). */
export const WIDE_STAGE_CLASS = Object.freeze({
  companion: 'ft-wide-stage-companion',
  reminder: 'ft-wide-stage-reminder',
  sound: 'ft-wide-stage-sound',
  language: 'ft-wide-stage-language',
  systemTts: 'ft-wide-stage-system-tts',
  localBackup: 'ft-wide-stage-local-backup',
  quietTogether: 'ft-wide-stage-quiet-together',
  focusCircle: 'ft-wide-stage-focus-circle'
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
 * Companion still uses this latch so Honesty does not snap back and so
 * `clearStage` does not dismiss the trio. The Breath/Quick home ball is
 * hidden separately while the trio is open (`ft-wide-stage-companion`).
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
      keepQuickStart,
      honestyBridgeActive: bridgeVisible
    },
    wide: {
      idle: !focusing,
      // Wide ⋯ also suppresses on Honesty bridge (narrow ActionBar stays).
      suppressed: Boolean(chromeSuppressed || bridgeVisible),
      keepQuickStart,
      honestyBridgeActive: bridgeVisible
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
      moreOrGrabber: 'visible',
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
 * Push a section heading only when the group has at least one row.
 *
 * @param {SecondaryChromeEntry[]} out
 * @param {string} labelKey
 * @param {Array<SecondaryChromeEntry | false | null | undefined>} items
 * @returns {void}
 */
function pushLabeledGroup(out, labelKey, items) {
  const rows = [];
  for (const item of items) {
    if (item && typeof item === 'object') rows.push(item);
  }
  if (rows.length === 0) return;
  out.push({ kind: 'group-label', labelKey });
  for (const row of rows) out.push(attachSecondaryHandler(row));
}

/**
 * Secondary chrome entries for drawer (narrow) or ⋯ menu (wide).
 * Honesty check-in lives in Practice (below Five Moments). The third home ball
 * opens Five Moments Compass — never listed here.
 * Same four groups on both shells; presentation (drawer vs right sheet) stays in UI.
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
  // Sound lives only on top-right note / narrow ♪ (2026-07-30) — not a menu row.

  const yinCoinVisible =
    typeof visibility.yinCoinVisible === 'boolean'
      ? visibility.yinCoinVisible
      : isFocusCoinsAwardEnabled({
          search:
            typeof location !== 'undefined' && location?.search
              ? location.search
              : ''
        });
  const confideVisible =
    typeof visibility.confideUserVisible === 'boolean'
      ? visibility.confideUserVisible
      : isConfideUserVisible();
  // Desktop L1 may show Confide on wide Electron when the companion bridge exists.
  const companionGeneration =
    surface === 'wide-more' && visibility.companionGeneration === true;

  pushLabeledGroup(out, 'MENU_GROUP_PRACTICE', [
    { proxy: 'sanctuary-nav', labelKey: 'SANCTUARY_NAV_MENU_LABEL' },
    companionOk
      ? { proxy: 'companion', labelKey: 'COMPANION_MODE_HINT' }
      : null,
    // Menu entry stays top-right ⋯ / narrow grabber (MENU_CHROME_CENSUS §1 #4).
    { proxy: 'ground-exercise', labelKey: 'GROUND_EXERCISE_MENU_LABEL' },
    { proxy: 'five-moments', labelKey: 'FIVE_MOMENTS_MENU_LABEL' },
    { proxy: 'honesty', labelKey: 'HONESTY_IDLE_ENTRY' },
    confideVisible || companionGeneration
      ? {
          proxy: 'confide',
          labelKey: 'CONFIDE_MENU_LABEL',
          testId: companionGeneration ? 'idle-confide-desktop' : undefined
        }
      : null
  ]);

  pushLabeledGroup(out, 'MENU_GROUP_RECORDS', [
    { proxy: 'journey-log', labelKey: 'JOURNEY_LOG_MENU_LABEL' },
    { proxy: 'presence-signals', labelKey: 'PRESENCE_SIGNALS_MENU_LABEL' },
    yinCoinVisible
      ? {
          proxy: 'yin-coin',
          labelKey: 'YIN_COIN_MENU_LABEL',
          testId: 'idle-yin-coin'
        }
      : null
  ]);

  pushLabeledGroup(out, 'MENU_GROUP_INSPIRATION', [
    { proxy: 'daily-quote', labelKey: 'DAILY_ZEN_QUOTE_MENU_LABEL' },
    { proxy: 'zen-cinema', labelKey: 'ZEN_CINEMA_MENU_LABEL' },
    visibility.mustardSeedSealUnlocked
      ? {
          proxy: 'mustard-seed-seal',
          labelKey: 'MUSTARD_SEED_SEAL_MENU_LABEL'
        }
      : null,
    ...(visibility.contemplativeArchiveSealMenus ?? []).map((row) =>
      attachSecondaryHandler({
        proxy: row.proxy,
        labelKey: row.labelKey,
        handler: 'onContemplativeArchiveSeal'
      })
    ),
    { proxy: 'wallpapers', labelKey: 'WALLPAPER_MENU_LABEL' },
    {
      proxy: 'art-collection',
      labelKey: 'ART_COLLECTION_MENU_LABEL',
      testId: 'idle-art-collection'
    }
  ]);

  pushLabeledGroup(out, 'MENU_GROUP_NOT_ALONE', [
    { proxy: 'quiet-together', labelKey: 'QUIET_TOGETHER_MENU_LABEL' },
    { proxy: 'focus-circle', labelKey: 'FOCUS_CIRCLE_MENU_LABEL' }
  ]);

  pushLabeledGroup(out, 'MENU_GROUP_PREFERENCES', [
    visibility.reminderAvailable
      ? { proxy: 'reminder', labelKey: 'reminder.setting_title' }
      : null,
    shouldOfferLanguagePicker()
      ? { proxy: 'language', labelKey: 'LANGUAGE_MENU_LABEL' }
      : null,
    surface === 'wide-more' && visibility.systemTtsAvailable
      ? {
          proxy: 'system-tts',
          labelKey: 'system_tts.menu_label',
          testId: 'idle-system-tts'
        }
      : null,
    {
      proxy: 'today-direction',
      labelKey: 'TODAY_DIRECTION_MENU_LABEL',
      testId: 'idle-today-direction'
    },
    visibility.newsletterSubmitted
      ? {
          proxy: 'newsletter',
          labelKey: 'NEWSLETTER_MENU_CONFIRMED',
          interactive: false
        }
      : { proxy: 'newsletter', labelKey: 'NEWSLETTER_MENU_LABEL' },
    {
      proxy: 'account',
      labelKey: 'ACCOUNT_MENU_PLACEHOLDER',
      interactive: false,
      testId: 'idle-account-placeholder'
    },
    { proxy: 'community', labelKey: 'COMMUNITY_MENU_LABEL' },
    {
      proxy: 'help-center',
      labelKey: 'HELP_CENTER_MENU_LABEL',
      testId: 'idle-help-center'
    },
    { proxy: 'local-backup', labelKey: 'LOCAL_BACKUP_MENU_LABEL' }
  ]);

  // Sanctuary / Tea / full Membership catalog stay on the top-right Support FAB.
  // One contextual row here (not the three pay SKUs) sits immediately above
  // the Rituals heading (user 2026-08-15): beige subscribe CTA when locked;
  // “Premium unlocked” when entitled (Membership ∪ Sanctuary Lifetime).
  const scenesEntitled = hasUnlockedAdvancedScenes(visibility);
  if (scenesEntitled) {
    out.push(
      attachSecondaryHandler({
        proxy: 'membership',
        labelKey: 'MEMBERSHIP_MENU_UNLOCKED',
        testId: 'idle-membership-unlocked'
      })
    );
  } else {
    out.push(
      attachSecondaryHandler({
        proxy: 'membership',
        labelKey: 'MEMBERSHIP_MENU_CTA',
        emphasis: 'beige-cta',
        testId: 'idle-membership-cta'
      })
    );
  }

  // Advanced RitualFlow scenes (entitlement-gated; free Breath stays home left ball).
  out.push({
    kind: 'group-label',
    labelKey: 'ritual.menu_group'
  });
  for (const ritual of listRitualConfigs()) {
    const locked = !isEntitled(ritual.accessFeatureKey);
    out.push(
      attachSecondaryHandler({
        kind: 'item',
        proxy: ritual.menuProxy,
        labelKey: ritual.menuLabelKey,
        featureKey: ritual.accessFeatureKey,
        locked,
        handler: 'onRitualFlow'
      })
    );
  }

  return out;
}

/**
 * Proxies under ⋯ → Preferences (A3 desktop shortcut parity).
 *
 * @param {'narrow-drawer' | 'wide-more'} surface
 * @param {SecondaryEntryVisibility} visibility
 * @returns {string[]}
 */
export function listPreferencesGroupProxies(surface, visibility) {
  const entries = listSecondaryChromeEntries(surface, visibility);
  /** @type {string[]} */
  const proxies = [];
  let inGroup = false;
  for (const entry of entries) {
    if (entry.kind === 'group-label') {
      inGroup = entry.labelKey === 'MENU_GROUP_PREFERENCES';
      continue;
    }
    if (!inGroup || !entry.proxy) continue;
    proxies.push(entry.proxy);
  }
  return proxies;
}
