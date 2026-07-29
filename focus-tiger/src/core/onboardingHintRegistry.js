/**
 * Onboarding hints — 机器可读真源（SSOT）。
 *
 * 派生：HINT_IDS、HINT_LOCALE_KEYS、ONBOARDING_HINT_ANCHORS、HINT_TRIGGER_MODES、HINT_TIERS（勿手写第二份）。
 * 叙述/场景：ONBOARDING_HINTS.md §一（人工）；锚点机器对照块由 `npm run hints:doc-sync` 生成。
 *
 * PR checklist：新增 hint 时若 anchor 所在 DOM 区域与已有 hint 相邻/可能视觉重叠，
 * 必须评估是否需要 anchorGroup（同组内 selector 不得相同）。
 * 新增 hint 必须声明 triggerMode；仅 click 须声明 tier（auto/manual/legacy 禁止填 tier）。
 *
 * @see ONBOARDING_HINTS.md
 */

/** @typedef {{ selector: string, placement: string, tip: string }} HintAnchor */

/**
 * @typedef {'auto'|'click'|'manual'|'legacy'} HintTriggerMode
 * - auto：时机/状态性，首次出现主动弹出气泡（无圆点）
 * - click：探索性，默认脉冲圆点；已读语义由 tier 决定
 * - manual：从不自动出现（仅「?」补救等用户主动路径）
 * - legacy：历史兼容 id，基本不调度
 */

/**
 * @typedef {'simple'|'detailed'} HintTier
 * 仅 triggerMode=click 填写。auto/manual/legacy 无圆点，不适用 peek/static/done 圆点语义。
 * - simple：看过文案 → 静止弱化圆点；相关操作完成 → 圆点移除
 * - detailed：预览≠已读；进入详情页 → 圆点移除
 */

/**
 * @typedef {object} OnboardingHintRegistryEntry
 * @property {string} id
 * @property {string} localeKey
 * @property {HintAnchor} anchor
 * @property {HintTriggerMode} triggerMode
 * @property {HintTier} [tier] 仅 click 必填；其余省略（null）
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
    anchor: { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
  },
  {
    id: 'weekly-heatmap',
    localeKey: 'HINT_WEEKLY_HEATMAP',
    triggerMode: 'click',
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    tier: 'simple',
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
    id: 'wide-more-menu',
    localeKey: 'HINT_WIDE_MORE_MENU',
    triggerMode: 'manual',
    anchor: {
      selector: '#ft-wide-more-btn',
      placement: 'above',
      tip: 'bottom'
    }
  },
  {
    id: 'help-affordance',
    localeKey: 'HINT_HELP_AFFORDANCE',
    triggerMode: 'click',
    tier: 'detailed',
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
 * click hint → tier；非 click 不在表内（getHintTier 返回 null）。
 * @type {Readonly<Record<string, HintTier>>}
 */
export const HINT_TIERS = Object.freeze(
  Object.fromEntries(
    ONBOARDING_HINT_REGISTRY.filter((e) => e.tier != null).map((e) => [
      e.id,
      e.tier
    ])
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

/**
 * @param {string} hintId
 * @returns {HintTier | null} 非 click 为 null（无圆点语义）
 */
export function getHintTier(hintId) {
  return HINT_TIERS[hintId] ?? null;
}

/**
 * @param {string} hintId
 * @returns {boolean}
 */
export function isDetailedHint(hintId) {
  return getHintTier(hintId) === 'detailed';
}
