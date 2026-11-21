/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Entry signal ledger L1/L3 — static contract (allowlists + scan roots).
 * @see docs/LABEL_HINT_TIP_STANDARDS.md §六–§七
 * @see docs/task-briefs/task-entry-signal-ledger.md §9
 */

/** Hint ids that may be click but must not paint mint (policy + OnboardingHintsUI). */
export const ENTRY_SIGNAL_NO_MINT_HINT_IDS = Object.freeze(
  new Set([
    'quick-start',
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ])
);

/** Colored / discovery pulse class tokens allowed in runtime (L2 may shrink this set). */
export const ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST = Object.freeze(
  new Set([
    'onboarding-hint-badge',
    'ft-secondary-menu-hint-dot',
    'has-hint-mint',
    'ft-hint-discovery-dot',
    'ft-home-sanctuary-nav-pulse',
    'has-sanctuary-nav-pulse',
    'notification-badge'
  ])
);

/** @keyframes / animation names containing "pulse" that are not discovery-mint violations. */
export const ENTRY_SIGNAL_PULSE_ANIMATION_ALLOWLIST = Object.freeze(
  new Set([
    'ft-secondary-menu-hint-pulse',
    'ft-home-sanctuary-nav-pulse',
    'ft-ambient-mute-hint-pulse',
    'hud-fill-pulse',
    'quest-pulse',
    'soft-pulse',
    'soft-scale-pulse',
    'breath-halo-pulse'
  ])
);

/** Payment / Support — never eligible for new discovery pulse (§5 Brief). */
export const ENTRY_SIGNAL_PROTECTED_SELECTORS = Object.freeze([
  '#yin-support-fab',
  '#yin-support-modal',
  '#yin-support-backdrop',
  '[data-testid=yin-support-fab]',
  '[data-testid=yin-support-pro-cta]',
  '[data-testid=yin-support-membership-cta]',
  '[data-testid=yin-support-sanctuary-cta]',
  '[data-testid=yin-support-tea-cta]',
  '[data-testid=yin-support-companion-addon-cta]',
  '#yin-membership-card',
  '#yin-sanctuary-card',
  '#yin-tip-jar-card'
]);

/** Repo-relative dirs scanned for title + pulse lint (no browser). */
export const ENTRY_SIGNAL_LINT_SCAN_ROOTS = Object.freeze([
  'src',
  'ui-kit',
  'desktop'
]);

/** Filename suffixes skipped in lint walks. */
export const ENTRY_SIGNAL_LINT_SKIP_NAME_PATTERNS = Object.freeze([
  /\.test\.[cm]?js$/,
  /\.spec\.[cm]?js$/,
  /node_modules/,
  /\/dist\//,
  /\/release\//,
  /\/e2e\//,
  /entrySignalLedgerRegistry\.js$/,
  /entrySignalLedgerContract\.js$/,
  /audit-entry-signal-/
]);

/**
 * Line-level exemptions for purpose title ban (STANDARDS §七).
 * @type {ReadonlyArray<RegExp>}
 */
export const ENTRY_SIGNAL_TITLE_LINE_EXEMPT = Object.freeze([
  /document\.title\s*=/,
  /\btitleEl\b/,
  /\b__title\b/,
  /setToolTip\s*\(/,
  /statusItem\.button\?\.title/,
  /getAttribute\s*\(\s*['"]title['"]\s*\)/,
  /removeAttribute\s*\(\s*['"]title['"]\s*\)/,
  /\.getAttribute\(\s*['"]title['"]\s*\)/
]);

/** Regexes that flag purpose native tooltip assignment. */
export const ENTRY_SIGNAL_TITLE_VIOLATION_PATTERNS = Object.freeze([
  /\.title\s*=/,
  /\.setAttribute\s*\(\s*['"]title['"]/
]);