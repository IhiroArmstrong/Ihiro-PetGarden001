/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A13 · Key floating surfaces for warm-glass visual guardrails (e2e + docs).
 * @see docs/task-briefs/task-a13-glass-card-screenshots.md
 * @see docs/root-cause-audit-2026-10-12.md §4 A13
 */

/**
 * @typedef {'menu-proxy' | 'support-fab' | 'help-button' | 'sanctuary-nav' | 'idle-chrome' | 'dev-hook'} A13OpenKind
 *
 * @typedef {object} A13GlassVisualSurface
 * @property {string} id stable slug for snapshots / failures
 * @property {A13OpenKind} openKind
 * @property {string} [menuProxy] idle ⋯ / drawer data-proxy
 * @property {string} rootSelector element to sample glass fill + screenshot
 * @property {boolean} [expectWarmGlass] default true; idle chrome may be false
 * @property {Record<string, string>} [shellQuery] extra `?product=1` query keys
 * @property {string} [devHookGlobal] `window[global].openPanel()` for Electron-only rows
 */

/** @type {readonly A13GlassVisualSurface[]} */
export const A13_GLASS_VISUAL_SURFACES = Object.freeze([
  Object.freeze({
    id: 'system-tts',
    openKind: 'dev-hook',
    devHookGlobal: '__systemTtsPreference',
    rootSelector: '#system-tts-preference-panel, .system-tts-pref__panel'
  }),
  Object.freeze({
    id: 'help-center',
    openKind: 'menu-proxy',
    menuProxy: 'help-center',
    rootSelector: '#help-center'
  }),
  Object.freeze({
    id: 'support-modal',
    openKind: 'support-fab',
    rootSelector: '#yin-support-modal'
  }),
  Object.freeze({
    id: 'art-collection',
    openKind: 'menu-proxy',
    menuProxy: 'art-collection',
    rootSelector: '#art-collection-panel'
  }),
  Object.freeze({
    id: 'app-purpose',
    openKind: 'help-button',
    rootSelector: '#onboarding-app-purpose'
  }),
  Object.freeze({
    id: 'journey-log',
    openKind: 'menu-proxy',
    menuProxy: 'journey-log',
    rootSelector: '#journey-log'
  }),
  Object.freeze({
    id: 'presence-signals',
    openKind: 'menu-proxy',
    menuProxy: 'presence-signals',
    rootSelector: '#presence-signals-panel'
  }),
  Object.freeze({
    id: 'five-moments-compass',
    openKind: 'menu-proxy',
    menuProxy: 'five-moments',
    rootSelector: '#five-moments-compass'
  }),
  Object.freeze({
    id: 'sanctuary-nav-fan',
    openKind: 'sanctuary-nav',
    rootSelector: '#home-sanctuary-nav-fan .home-sanctuary-nav-fan__disc',
    expectWarmGlass: false
  }),
  Object.freeze({
    id: 'confide-card',
    openKind: 'dev-hook',
    devHookGlobal: '__confideToYin',
    shellQuery: { confide: '1', flowerWelcome: '0' },
    rootSelector: '#confide-to-yin-card'
  }),
  Object.freeze({
    id: 'quiet-together-panel',
    openKind: 'menu-proxy',
    menuProxy: 'quiet-together',
    rootSelector: '#quiet-together-panel'
  }),
  Object.freeze({
    id: 'quiet-together-lanterns',
    openKind: 'idle-chrome',
    shellQuery: { debugLanterns: '1' },
    rootSelector: '[data-testid="quiet-together-lanterns"]',
    expectWarmGlass: false
  })
]);
