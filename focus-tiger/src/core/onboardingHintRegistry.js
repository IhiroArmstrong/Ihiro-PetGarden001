/**
 * Onboarding hints — 机器可读真源（SSOT）。
 *
 * 派生：HINT_IDS、HINT_LOCALE_KEYS、ONBOARDING_HINT_ANCHORS（勿手写第二份）。
 * 叙述/场景：ONBOARDING_HINTS.md §一（人工）；锚点机器对照块由 `npm run hints:doc-sync` 生成。
 *
 * PR checklist：新增 hint 时若 anchor 所在 DOM 区域与已有 hint 相邻/可能视觉重叠，
 * 必须评估是否需要 anchorGroup（同组内 selector 不得相同）。
 *
 * @see ONBOARDING_HINTS.md
 */

/** @typedef {{ selector: string, placement: string, tip: string }} HintAnchor */

/**
 * @typedef {object} OnboardingHintRegistryEntry
 * @property {string} id
 * @property {string} localeKey
 * @property {HintAnchor} anchor
 * @property {string} [anchorGroup] 同组 selector 须两两不同（结构性约束，非产品语义表）
 */

/** @type {ReadonlyArray<OnboardingHintRegistryEntry>} */
export const ONBOARDING_HINT_REGISTRY = Object.freeze([
  {
    id: 'dormant-open',
    localeKey: 'HINT_DORMANT_OPEN',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'honesty-optional',
    localeKey: 'HINT_HONESTY_OPTIONAL',
    anchor: {
      selector: '#honesty-idle-entry',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'honesty-bridge',
    localeKey: 'HINT_HONESTY_BRIDGE',
    anchor: {
      selector: '#honesty-bridge-cta',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'sit-button',
    localeKey: 'HINT_SIT_BUTTON',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'quick-start',
    localeKey: 'HINT_QUICK_START',
    anchor: {
      selector: '#quick-start-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'how-shall-we-sit',
    localeKey: 'HINT_HOW_SHALL_WE_SIT',
    anchor: {
      selector: '.session-start-dock__hint',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'notice',
    localeKey: 'HINT_NOTICE',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'breathing',
    localeKey: 'HINT_BREATHING',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'choose',
    localeKey: 'HINT_CHOOSE',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-mode',
    localeKey: 'HINT_COMPANION_MODE',
    anchor: {
      selector: '.session-start-dock__panel, .session-start-dock__hint',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-stay',
    localeKey: 'HINT_COMPANION_STAY',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-away',
    localeKey: 'HINT_COMPANION_AWAY',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-across-tools',
    localeKey: 'HINT_COMPANION_ACROSS',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'ambient-gated',
    localeKey: 'HINT_AMBIENT_GATED',
    anchorGroup: 'ambient',
    anchor: {
      selector: '.ambient-soundscape__fab',
      placement: 'left',
      tip: 'right'
    }
  },
  {
    id: 'ambient-soundscape',
    localeKey: 'HINT_AMBIENT_SOUNDSCAPE',
    anchorGroup: 'ambient',
    anchor: {
      selector: '.ambient-soundscape__mute',
      placement: 'below',
      tip: 'top'
    }
  },
  {
    id: 'rise-button',
    localeKey: 'HINT_RISE_BUTTON',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'reflection',
    localeKey: 'HINT_REFLECTION',
    anchor: {
      selector: '#tiger-reflection-moment',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'idle-after-session',
    localeKey: 'HINT_IDLE_AFTER_SESSION',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'weekly-heatmap',
    localeKey: 'HINT_WEEKLY_HEATMAP',
    anchor: {
      selector: '#weekly-practice-heatmap',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'in-app-reminder',
    localeKey: 'HINT_IN_APP_REMINDER',
    anchor: {
      selector: '#reminder-preference-toggle',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'micro-ritual',
    localeKey: 'HINT_MICRO_RITUAL',
    anchor: {
      selector: '#micro-ritual-idle-entry',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'help-affordance',
    localeKey: 'HINT_HELP_AFFORDANCE',
    anchor: {
      selector: '#onboarding-hint-help',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'help-remedy',
    localeKey: 'HINT_HELP_REMEDY',
    anchor: {
      selector: '#onboarding-hint-help',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'help-fallback',
    localeKey: 'HINT_HELP_FALLBACK',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  }
]);

/** @type {ReadonlyArray<string>} */
export const HINT_IDS = Object.freeze(
  ONBOARDING_HINT_REGISTRY.map((entry) => entry.id)
);

/** @type {Readonly<Record<string, string>>} */
export const HINT_LOCALE_KEYS = Object.freeze(
  Object.fromEntries(
    ONBOARDING_HINT_REGISTRY.map((entry) => [entry.id, entry.localeKey])
  )
);

/** @type {Readonly<Record<string, HintAnchor>>} */
export const ONBOARDING_HINT_ANCHORS = Object.freeze(
  Object.fromEntries(
    ONBOARDING_HINT_REGISTRY.map((entry) => [entry.id, { ...entry.anchor }])
  )
);
