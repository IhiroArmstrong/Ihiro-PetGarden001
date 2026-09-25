/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * KB scaled production · static live-entry registry (Step 1).
 * SSOT for which product surfaces are live, gated, or need PO confirmation.
 * Does NOT write catalog entries — only grounds the production pipeline.
 *
 * @see docs/task-briefs/task-kb-scaled-production.md
 * @see docs/kb-live-entry-registry.md
 */

import { listRitualConfigs } from './RitualFlow.js';

/**
 * @typedef {'home-ball' | 'menu' | 'hud' | 'ritual'} KbLiveSurface
 */

/**
 * @typedef {'live' | 'gated-default-on' | 'gated-default-off' | 'conditional' | 'entitlement-gated' | 'needs-product-confirmation'} KbLiveStatus
 */

/**
 * @typedef {object} KbLiveGate
 * @property {string} moduleRelPath
 * @property {string} anchor
 * @property {string} [queryParam]
 * @property {string} [queryOffValue]
 * @property {string} [note]
 */

/**
 * @typedef {object} KbLiveEntryRow
 * @property {string} id
 * @property {KbLiveSurface} surface
 * @property {string} [proxy]
 * @property {readonly string[]} labelKeys
 * @property {string} menuPath
 * @property {KbLiveStatus} liveStatus
 * @property {KbLiveGate} [gate]
 * @property {readonly string[]} codeAnchors
 * @property {readonly string[]} authoritativeSources
 * @property {readonly string[]} [catalogKbIds]
 */

/** @type {readonly KbLiveEntryRow[]} */
export const KB_LIVE_ENTRY_ROWS = Object.freeze([
  Object.freeze({
    id: 'kb-live-sit',
    surface: 'home-ball',
    labelKeys: Object.freeze(['BTN_FOCUS_START']),
    menuPath: 'Idle bottom primary · Sit with Yin',
    liveStatus: 'live',
    codeAnchors: Object.freeze(['BTN_FOCUS_START']),
    authoritativeSources: Object.freeze([
      'src/ui/NarrowIdleShell.js',
      'src/locales/en.json',
      'docs/MENU_CHROME_CENSUS.md'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0001'])
  }),
  Object.freeze({
    id: 'kb-live-rise',
    surface: 'home-ball',
    labelKeys: Object.freeze(['BTN_FOCUS_STOP']),
    menuPath: 'During sit · Rise (end session)',
    liveStatus: 'live',
    codeAnchors: Object.freeze(['BTN_FOCUS_STOP']),
    authoritativeSources: Object.freeze(['src/locales/en.json']),
    catalogKbIds: Object.freeze(['KB-FUNC-0007'])
  }),
  Object.freeze({
    id: 'kb-live-breath',
    surface: 'home-ball',
    labelKeys: Object.freeze([
      'QUICK_START_ARIA',
      'micro_ritual.pick_duration',
      'micro_ritual.leave'
    ]),
    menuPath: 'Idle left orb · Breath practice (not in ⋯ menu)',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      'micro-ritual-idle-entry',
      'QUICK_START_ARIA'
    ]),
    authoritativeSources: Object.freeze([
      'src/ui/WideIdleMoreMenu.js',
      'src/locales/en.json',
      'docs/MICRO_RITUAL_PLAN.md'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0011'])
  }),
  Object.freeze({
    id: 'kb-live-companion',
    surface: 'menu',
    proxy: 'companion',
    labelKeys: Object.freeze(['COMPANION_MODE_HINT', 'COMPANION_MODE_TITLE']),
    menuPath: '⋯ → Practice → How shall we sit?',
    liveStatus: 'conditional',
    codeAnchors: Object.freeze([
      "proxy: 'companion'",
      'COMPANION_MODE_HINT'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0008'])
  }),
  Object.freeze({
    id: 'kb-live-ground',
    surface: 'menu',
    proxy: 'ground-exercise',
    labelKeys: Object.freeze(['GROUND_EXERCISE_MENU_LABEL']),
    menuPath: '⋯ → Practice → Ground exercise',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'ground-exercise'",
      'GROUND_EXERCISE_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0002'])
  }),
  Object.freeze({
    id: 'kb-live-five-moments',
    surface: 'menu',
    proxy: 'five-moments',
    labelKeys: Object.freeze(['FIVE_MOMENTS_MENU_LABEL']),
    menuPath: '⋯ → Practice → Five Moments',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'five-moments'",
      'FIVE_MOMENTS_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0019'])
  }),
  Object.freeze({
    id: 'kb-live-honesty',
    surface: 'menu',
    proxy: 'honesty',
    labelKeys: Object.freeze(['HONESTY_IDLE_ENTRY']),
    menuPath: '⋯ → Practice → Honest check-in',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'honesty'",
      'HONESTY_IDLE_ENTRY'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0020'])
  }),
  Object.freeze({
    id: 'kb-live-journey-log',
    surface: 'menu',
    proxy: 'journey-log',
    labelKeys: Object.freeze(['JOURNEY_LOG_MENU_LABEL']),
    menuPath: '⋯ → Practice → Journey log',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'journey-log'",
      'JOURNEY_LOG_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0012'])
  }),
  Object.freeze({
    id: 'kb-live-presence-signals',
    surface: 'menu',
    proxy: 'presence-signals',
    labelKeys: Object.freeze(['PRESENCE_SIGNALS_MENU_LABEL']),
    menuPath: '⋯ → Practice → Presence signals',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'presence-signals'",
      'PRESENCE_SIGNALS_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0013'])
  }),
  Object.freeze({
    id: 'kb-live-yin-coin',
    surface: 'menu',
    proxy: 'yin-coin',
    labelKeys: Object.freeze(['YIN_COIN_MENU_LABEL']),
    menuPath: '⋯ → Practice → Yin Coin',
    liveStatus: 'gated-default-on',
    gate: Object.freeze({
      moduleRelPath: 'src/core/focusCoinsAwardGate.js',
      anchor: 'FOCUS_COINS_AWARD_ENABLED = true',
      queryParam: 'focusCoins',
      queryOffValue: '0',
      note: 'Default on; ?focusCoins=0 hides row and disables award writes'
    }),
    codeAnchors: Object.freeze([
      "proxy: 'yin-coin'",
      'YIN_COIN_MENU_LABEL',
      'isFocusCoinsAwardEnabled'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/core/focusCoinsLedger.js',
      'src/core/focusCoinsAwardGate.js',
      'docs/FOCUS_COINS.md'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0018'])
  }),
  Object.freeze({
    id: 'kb-live-confide',
    surface: 'menu',
    proxy: 'confide',
    labelKeys: Object.freeze(['CONFIDE_MENU_LABEL']),
    menuPath: '⋯ → Practice → Confide to Yin (wide ear shortcut)',
    liveStatus: 'gated-default-off',
    gate: Object.freeze({
      moduleRelPath: 'src/core/confide/confideUserVisibilityGate.js',
      anchor: 'CONFIDE_USER_MOUNT_ENABLED = false',
      queryParam: 'confide',
      queryOffValue: null,
      note: 'Product mount off by default; ?confide=1 QA harness; Electron wide L1 may show row when companionGeneration'
    }),
    codeAnchors: Object.freeze([
      "proxy: 'confide'",
      'CONFIDE_MENU_LABEL',
      'isConfideUserVisible'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/core/confide/confideUserVisibilityGate.js',
      'src/locales/en.json'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0005', 'KB-FUNC-0010'])
  }),
  Object.freeze({
    id: 'kb-live-daily-quote',
    surface: 'menu',
    proxy: 'daily-quote',
    labelKeys: Object.freeze(['DAILY_ZEN_QUOTE_MENU_LABEL']),
    menuPath: '⋯ → Inspiration → Daily quote',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'daily-quote'",
      'DAILY_ZEN_QUOTE_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js']),
    catalogKbIds: Object.freeze(['KB-FUNC-0021'])
  }),
  Object.freeze({
    id: 'kb-live-zen-cinema',
    surface: 'menu',
    proxy: 'zen-cinema',
    labelKeys: Object.freeze(['ZEN_CINEMA_MENU_LABEL']),
    menuPath: '⋯ → Inspiration → Zen Cinema',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'zen-cinema'",
      'ZEN_CINEMA_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js']),
    catalogKbIds: Object.freeze(['KB-FUNC-0022'])
  }),
  Object.freeze({
    id: 'kb-live-wallpapers',
    surface: 'menu',
    proxy: 'wallpapers',
    labelKeys: Object.freeze(['WALLPAPER_MENU_LABEL']),
    menuPath: '⋯ → Inspiration → Wallpapers',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'wallpapers'",
      'WALLPAPER_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js']),
    catalogKbIds: Object.freeze(['KB-FUNC-0023'])
  }),
  Object.freeze({
    id: 'kb-live-quiet-together',
    surface: 'menu',
    proxy: 'quiet-together',
    labelKeys: Object.freeze(['QUIET_TOGETHER_MENU_LABEL']),
    menuPath: '⋯ → Not alone → Quiet together',
    liveStatus: 'gated-default-on',
    gate: Object.freeze({
      moduleRelPath: 'src/core/quietTogetherPresence.js',
      anchor: 'QUIET_TOGETHER_QUERY_PARAM',
      queryParam: 'quietTogether',
      queryOffValue: '0',
      note: 'Requires cloud base URL; ?quietTogether=0 disables client'
    }),
    codeAnchors: Object.freeze([
      "proxy: 'quiet-together'",
      'QUIET_TOGETHER_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/core/quietTogetherPresence.js',
      'src/core/quietTogetherPreference.js'
    ])
  }),
  Object.freeze({
    id: 'kb-live-focus-circle',
    surface: 'menu',
    proxy: 'focus-circle',
    labelKeys: Object.freeze(['FOCUS_CIRCLE_MENU_LABEL']),
    menuPath: '⋯ → Not alone → Focus circle',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'focus-circle'",
      'FOCUS_CIRCLE_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/core/focusCircleMembership.js'
    ])
  }),
  Object.freeze({
    id: 'kb-live-reminder',
    surface: 'menu',
    proxy: 'reminder',
    labelKeys: Object.freeze(['reminder.setting_title']),
    menuPath: '⋯ → Preferences → Reminder',
    liveStatus: 'conditional',
    codeAnchors: Object.freeze([
      "proxy: 'reminder'",
      'reminder.setting_title'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js'])
  }),
  Object.freeze({
    id: 'kb-live-language',
    surface: 'menu',
    proxy: 'language',
    labelKeys: Object.freeze(['LANGUAGE_MENU_LABEL']),
    menuPath: '⋯ → Preferences → Language',
    liveStatus: 'conditional',
    codeAnchors: Object.freeze([
      "proxy: 'language'",
      'shouldOfferLanguagePicker'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/locales/localePreference.js'
    ])
  }),
  Object.freeze({
    id: 'kb-live-today-direction',
    surface: 'menu',
    proxy: 'today-direction',
    labelKeys: Object.freeze(['TODAY_DIRECTION_MENU_LABEL']),
    menuPath: '⋯ → Preferences → Choose today\'s direction again',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'today-direction'",
      'TODAY_DIRECTION_MENU_LABEL',
      'open({ manual: true })'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/ui/ColdStartGoalCardUI.js',
      'src/main.js'
    ])
  }),
  Object.freeze({
    id: 'kb-live-local-backup',
    surface: 'menu',
    proxy: 'local-backup',
    labelKeys: Object.freeze(['LOCAL_BACKUP_MENU_LABEL']),
    menuPath: '⋯ → Preferences → Backup & restore',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'local-backup'",
      'LOCAL_BACKUP_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze([
      'src/core/idleChromeOrchestration.js',
      'src/core/practiceBackup/localBackupStorageRegistry.js',
      'docs/local-backup-storage-registry.md'
    ]),
    catalogKbIds: Object.freeze(['KB-FUNC-0003', 'KB-FUNC-0015'])
  }),
  Object.freeze({
    id: 'kb-live-community',
    surface: 'menu',
    proxy: 'community',
    labelKeys: Object.freeze(['COMMUNITY_MENU_LABEL']),
    menuPath: '⋯ → Preferences → Community',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'community'",
      'COMMUNITY_MENU_LABEL'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js'])
  }),
  Object.freeze({
    id: 'kb-live-membership',
    surface: 'menu',
    proxy: 'membership',
    labelKeys: Object.freeze([
      'MEMBERSHIP_MENU_CTA',
      'MEMBERSHIP_MENU_UNLOCKED'
    ]),
    menuPath: '⋯ → Membership CTA / Premium unlocked',
    liveStatus: 'live',
    codeAnchors: Object.freeze([
      "proxy: 'membership'",
      'MEMBERSHIP_MENU_CTA'
    ]),
    authoritativeSources: Object.freeze(['src/core/idleChromeOrchestration.js'])
  }),
  Object.freeze({
    id: 'kb-live-hud-progress',
    surface: 'hud',
    labelKeys: Object.freeze(['HUD_PROGRESS_SHARED_SITTING']),
    menuPath: 'Top-left HUD · Today shared sitting',
    liveStatus: 'live',
    codeAnchors: Object.freeze(['HUD_PROGRESS_SHARED_SITTING']),
    authoritativeSources: Object.freeze(['src/locales/en.json']),
    catalogKbIds: Object.freeze(['KB-FUNC-0004'])
  })
]);

/**
 * RitualFlow rows derived from code SSOT (entitlement-gated menu proxies).
 * @returns {readonly KbLiveEntryRow[]}
 */
export function listKbLiveRitualEntryRows() {
  return listRitualConfigs().map((ritual) =>
    Object.freeze({
      id: `kb-live-ritual-${ritual.id}`,
      surface: 'ritual',
      proxy: ritual.menuProxy,
      labelKeys: Object.freeze([ritual.menuLabelKey]),
      menuPath: `⋯ → Rituals → ${ritual.menuLabelKey}`,
      liveStatus: 'entitlement-gated',
      gate: Object.freeze({
        moduleRelPath: 'src/core/RitualFlow.js',
        anchor: ritual.accessFeatureKey,
        note: 'Locked until entitlement unlocks ritual access'
      }),
      codeAnchors: Object.freeze([
        `menuLabelKey: '${ritual.menuLabelKey}'`,
        ritual.menuLabelKey
      ]),
      authoritativeSources: Object.freeze([
        'src/core/RitualFlow.js',
        'src/core/idleChromeOrchestration.js'
      ])
    })
  );
}

/**
 * Static + ritual rows for audits and markdown export.
 * @returns {readonly KbLiveEntryRow[]}
 */
export function listAllKbLiveEntryRows() {
  return Object.freeze([...KB_LIVE_ENTRY_ROWS, ...listKbLiveRitualEntryRows()]);
}

/**
 * Menu-proxy rows only (for cross-check against listSecondaryChromeEntries).
 * @returns {readonly KbLiveEntryRow[]}
 */
export function listKbLiveMenuProxyRows() {
  return listAllKbLiveEntryRows().filter(
    (row) => row.surface === 'menu' || row.surface === 'ritual'
  );
}
