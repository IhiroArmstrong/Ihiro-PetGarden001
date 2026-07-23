/**
 * Onboarding hints — 机器可读真源（SSOT）。
 *
 * 派生：HINT_IDS、HINT_LOCALE_KEYS、ONBOARDING_HINT_ANCHORS、HINT_TRIGGER_MODES（勿手写第二份）。
 * 叙述/场景：ONBOARDING_HINTS.md §一（人工）；锚点机器对照块由 `npm run hints:doc-sync` 生成。
 *
 * PR checklist：新增 hint 时若 anchor 所在 DOM 区域与已有 hint 相邻/可能视觉重叠，
 * 必须评估是否需要 anchorGroup（同组内 selector 不得相同）。
 * 新增 hint 必须声明 triggerMode（勿在 UI 里散落 if/else 判断交互模式）。
 *
 * @see ONBOARDING_HINTS.md
 */

/** @typedef {{ selector: string, placement: string, tip: string }} HintAnchor */

/**
 * @typedef {'auto'|'click'|'manual'|'legacy'} HintTriggerMode
 * - auto：时机/状态性，首次出现主动弹出气泡
 * - click：探索性，默认只显示脉冲圆点，点击后展开气泡
 * - manual：从不自动出现（仅「?」补救等用户主动路径）
 * - legacy：历史兼容 id，基本不调度
 */

/**
 * @typedef {object} OnboardingHintRegistryEntry
 * @property {string} id
 * @property {string} localeKey
 * @property {HintAnchor} anchor
 * @property {HintTriggerMode} triggerMode
 * @property {string} [anchorGroup] 同组 selector 须两两不同（结构性约束，非产品语义表）
 */

/** @type {ReadonlyArray<OnboardingHintRegistryEntry>} */
export const ONBOARDING_HINT_REGISTRY = Object.freeze([
  {
    id: 'dormant-open',
    localeKey: 'HINT_DORMANT_OPEN',
    triggerMode: 'legacy',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'honesty-optional',
    localeKey: 'HINT_HONESTY_OPTIONAL',
    triggerMode: 'auto',
    anchor: {
      selector: '#honesty-idle-entry',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'honesty-bridge',
    localeKey: 'HINT_HONESTY_BRIDGE',
    triggerMode: 'auto',
    anchor: {
      selector: '#honesty-bridge-cta',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'sit-button',
    localeKey: 'HINT_SIT_BUTTON',
    triggerMode: 'auto',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'quick-start',
    localeKey: 'HINT_QUICK_START',
    triggerMode: 'click',
    anchor: {
      selector: '#quick-start-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'how-shall-we-sit',
    localeKey: 'HINT_HOW_SHALL_WE_SIT',
    triggerMode: 'click',
    anchor: {
      selector: '.session-start-dock__hint',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'notice',
    localeKey: 'HINT_NOTICE',
    triggerMode: 'auto',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'breathing',
    localeKey: 'HINT_BREATHING',
    triggerMode: 'auto',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'choose',
    localeKey: 'HINT_CHOOSE',
    triggerMode: 'auto',
    anchor: {
      selector: '#arrival-practice, #btn-focus',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-mode',
    localeKey: 'HINT_COMPANION_MODE',
    triggerMode: 'auto',
    anchor: {
      selector: '.session-start-dock__panel, .session-start-dock__hint',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-stay',
    localeKey: 'HINT_COMPANION_STAY',
    triggerMode: 'auto',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-away',
    localeKey: 'HINT_COMPANION_AWAY',
    triggerMode: 'auto',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'companion-across-tools',
    localeKey: 'HINT_COMPANION_ACROSS',
    triggerMode: 'auto',
    anchor: {
      selector: '.session-start-dock__panel',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'ambient-gated',
    localeKey: 'HINT_AMBIENT_GATED',
    triggerMode: 'click',
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
    triggerMode: 'click',
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
    triggerMode: 'click',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'reflection',
    localeKey: 'HINT_REFLECTION',
    triggerMode: 'auto',
    anchor: {
      selector: '#tiger-reflection-moment',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'idle-after-session',
    localeKey: 'HINT_IDLE_AFTER_SESSION',
    triggerMode: 'click',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'weekly-heatmap',
    localeKey: 'HINT_WEEKLY_HEATMAP',
    triggerMode: 'click',
    anchor: {
      selector: '#weekly-practice-heatmap',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'in-app-reminder',
    localeKey: 'HINT_IN_APP_REMINDER',
    triggerMode: 'click',
    anchor: {
      selector: '#reminder-preference-toggle',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'micro-ritual',
    localeKey: 'HINT_MICRO_RITUAL',
    triggerMode: 'click',
    anchor: {
      selector: '#micro-ritual-idle-entry',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'focus-hud-ring',
    localeKey: 'HINT_FOCUS_HUD_RING',
    triggerMode: 'click',
    anchorGroup: 'focus-hud',
    anchor: {
      selector: '#focus-hud .ft-hud__gauge',
      placement: 'below',
      tip: 'top'
    }
  },
  {
    id: 'focus-hud-progress',
    localeKey: 'HINT_FOCUS_HUD_PROGRESS',
    triggerMode: 'click',
    anchorGroup: 'focus-hud',
    anchor: {
      selector: '#focus-hud .ft-hud__bar',
      placement: 'below',
      tip: 'top'
    }
  },
  {
    id: 'focus-hud-streak',
    localeKey: 'HINT_FOCUS_HUD_STREAK',
    triggerMode: 'click',
    anchorGroup: 'focus-hud',
    anchor: {
      selector: '#focus-hud .ft-hud__streak',
      placement: 'left',
      tip: 'right'
    }
  },
  {
    id: 'narrow-drawer-menu',
    localeKey: 'HINT_NARROW_DRAWER_MENU',
    triggerMode: 'manual',
    anchor: {
      selector: '.ft-narrow-grabber',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'help-affordance',
    localeKey: 'HINT_HELP_AFFORDANCE',
    triggerMode: 'click',
    anchor: {
      selector: '#onboarding-hint-help',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'help-remedy',
    localeKey: 'HINT_HELP_REMEDY',
    triggerMode: 'manual',
    anchor: {
      selector: '#onboarding-hint-help',
      placement: 'right',
      tip: 'left'
    }
  },
  {
    id: 'help-fallback',
    localeKey: 'HINT_HELP_FALLBACK',
    triggerMode: 'manual',
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

/** @type {Readonly<Record<string, HintTriggerMode>>} */
export const HINT_TRIGGER_MODES = Object.freeze(
  Object.fromEntries(
    ONBOARDING_HINT_REGISTRY.map((entry) => [entry.id, entry.triggerMode])
  )
);

/**
 * @param {string} hintId
 * @returns {HintTriggerMode}
 */
export function getHintTriggerMode(hintId) {
  return HINT_TRIGGER_MODES[hintId] || 'auto';
}

/**
 * @param {string} hintId
 * @returns {boolean}
 */
export function isClickTriggerHint(hintId) {
  return getHintTriggerMode(hintId) === 'click';
}
