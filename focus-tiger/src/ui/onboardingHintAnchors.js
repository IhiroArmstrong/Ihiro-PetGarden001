/**
 * Onboarding hint → DOM anchor map（placement / 尖角）。
 * 与 `ONBOARDING_HINTS.md` 语义表对齐；改 selector 须同步文档 + `onboardingHintAnchors.test.js`。
 */

/** @type {Record<string, { selector: string, placement: string, tip: string }>} */
export const ONBOARDING_HINT_ANCHORS = Object.freeze({
  'dormant-open': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  // 锚在 Sit 侧边，避免 Honesty / 桥接面板在上方时被盖住
  'honesty-optional': { selector: '#btn-focus', placement: 'right', tip: 'left' },
  'honesty-bridge': {
    selector: '#honesty-bridge-cta',
    placement: 'above',
    tip: 'bottom'
  },
  'sit-button': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  'how-shall-we-sit': {
    selector: '.session-start-dock__hint',
    placement: 'right',
    tip: 'left'
  },
  notice: { selector: '#arrival-practice, #btn-focus', placement: 'above', tip: 'bottom' },
  breathing: { selector: '#arrival-practice, #btn-focus', placement: 'above', tip: 'bottom' },
  choose: { selector: '#arrival-practice, #btn-focus', placement: 'above', tip: 'bottom' },
  'companion-mode': {
    selector: '.session-start-dock__panel, .session-start-dock__hint',
    placement: 'above',
    tip: 'bottom'
  },
  'companion-stay': {
    selector: '.session-start-dock__panel',
    placement: 'above',
    tip: 'bottom'
  },
  'companion-away': {
    selector: '.session-start-dock__panel',
    placement: 'above',
    tip: 'bottom'
  },
  'companion-across-tools': {
    selector: '.session-start-dock__panel',
    placement: 'above',
    tip: 'bottom'
  },
  /** Idle：右下 Sound 曲目面板（须先 Sit） */
  'ambient-gated': {
    selector: '.ambient-soundscape__fab',
    placement: 'left',
    tip: 'right'
  },
  /** 默认 BGM：右上音符静音钮（与 gated 不得共用 fab） */
  'ambient-soundscape': {
    selector: '.ambient-soundscape__mute',
    placement: 'below',
    tip: 'top'
  },
  'rise-button': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  reflection: {
    selector: '#tiger-reflection-moment',
    placement: 'above',
    tip: 'bottom'
  },
  'idle-after-session': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  'weekly-heatmap': {
    selector: '#weekly-practice-heatmap',
    placement: 'right',
    tip: 'left'
  },
  'micro-ritual': {
    selector: '#micro-ritual-idle-entry',
    placement: 'right',
    tip: 'left'
  },
  'help-affordance': {
    selector: '#onboarding-hint-help',
    placement: 'right',
    tip: 'left'
  },
  'help-remedy': {
    selector: '#onboarding-hint-help',
    placement: 'right',
    tip: 'left'
  },
  'help-fallback': { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
});
