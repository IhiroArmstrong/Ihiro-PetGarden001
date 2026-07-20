/**
 * 分散式即时提示气泡 + 角落「?」补救入口。
 * 气泡锚定到对应控件旁，漫画尖角样式，避免与输入框/按钮同形。
 * @see ONBOARDING_HINTS.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  HINT_LOCALE_KEYS,
  createHintsSeenStore,
  resolveHintForScene
} from '../core/OnboardingHintsStore.js';

/**
 * hintId → 锚定目标与尖角朝向。
 * placement: 气泡相对锚点的方位；tip: CSS 尖角朝向（指向锚点）。
 * @type {Record<string, { selector: string, placement: string, tip: string }>}
 */
const HINT_ANCHORS = Object.freeze({
  'dormant-open': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  // 锚在 Sit 侧边，避免 Honesty / 桥接面板在上方时被盖住
  'honesty-optional': { selector: '#btn-focus', placement: 'right', tip: 'left' },
  'sit-button': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  'how-shall-we-sit': {
    selector: '.session-start-dock__hint',
    placement: 'above',
    tip: 'bottom'
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
  'ambient-gated': {
    selector: '.ambient-soundscape__fab',
    placement: 'left',
    tip: 'right'
  },
  'ambient-soundscape': {
    selector: '.ambient-soundscape__fab',
    placement: 'left',
    tip: 'right'
  },
  'rise-button': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  reflection: {
    selector: '#tiger-reflection-moment',
    placement: 'above',
    tip: 'bottom'
  },
  'idle-after-session': { selector: '#btn-focus', placement: 'above', tip: 'bottom' },
  'help-affordance': {
    selector: '#onboarding-hint-help',
    placement: 'above',
    tip: 'bottom'
  },
  'help-fallback': { selector: '#btn-focus', placement: 'above', tip: 'bottom' }
});

function resolveAnchorEl(selectorList) {
  for (const sel of String(selectorList)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const el = document.querySelector(sel);
    if (el && !el.hidden && el.getClientRects().length > 0) return el;
  }
  return null;
}

export class OnboardingHintsUI {
  /**
   * @param {HTMLElement} mountRoot 通常 document.body
   * @param {object} [options]
   * @param {ReturnType<typeof createHintsSeenStore>} [options.store]
   * @param {() => object} [options.getScene]
   */
  constructor(mountRoot, { store = createHintsSeenStore(), getScene = () => ({}) } = {}) {
    this.store = store;
    this.getScene = getScene;
    this.mountRoot = mountRoot;
    /** @type {Map<string, HTMLElement>} */
    this._bubbles = new Map();
    /** @type {Set<string>} */
    this._visibleIds = new Set();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    this._hideTimers = new Map();
    /** @type {string | null} 补救当前条 */
    this._remedyId = null;

    this.helpBtn = document.createElement('button');
    this.helpBtn.type = 'button';
    this.helpBtn.id = 'onboarding-hint-help';
    this.helpBtn.className = 'onboarding-hint-help';
    this.helpBtn.textContent = '?';
    this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
    this.helpBtn.addEventListener('click', () => {
      this.markSeen('help-affordance');
      this.showRemedy();
    });

    mountRoot.append(this.helpBtn);
    this._injectStyles();
    this._onReposition = () => this.repositionAll();
    window.addEventListener('resize', this._onReposition);
    window.addEventListener('scroll', this._onReposition, true);

    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      for (const hintId of this._visibleIds) {
        this._paint(hintId, { remedy: this._remedyId === hintId });
      }
    });
  }

  /**
   * 未读则自动展示；已读则 no-op。可与其它未读提示并存（如 Rise + Sound）。
   * @param {string} hintId
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this.store.isSeen(hintId)) return false;
    if (this._remedyId) return false;
    this._paint(hintId, { remedy: false });
    return true;
  }

  /**
   * 仅保留 listed 中的自动提示（已读的不会出现）；关掉不在列表里的自动气泡。
   * 补救气泡若正显示且不在列表中也会被关掉——调用方应在补救后勿立刻 sync 清掉。
   * @param {string[]} hintIds
   */
  syncVisibleAutos(hintIds) {
    const want = new Set(hintIds.filter((id) => HINT_LOCALE_KEYS[id] && !this.store.isSeen(id)));
    for (const id of [...this._visibleIds]) {
      if (this._remedyId === id) continue;
      if (!want.has(id)) this.hideBubble(id);
    }
    for (const id of want) {
      this.maybeShowAuto(id);
    }
  }

  /**
   * 标记已读并隐藏（若当前正显示该条）。
   * @param {string} hintId
   */
  markSeen(hintId) {
    this.store.markSeen(hintId);
    if (this._visibleIds.has(hintId)) {
      this.hideBubble(hintId);
    }
  }

  /** 补救：按当前场景强制展示（忽略已读）；气泡锚在「?」旁便于感知点击反馈。 */
  showRemedy() {
    const scene = this.getScene() || {};
    const hintId = resolveHintForScene(scene);
    this._remedyId = hintId;
    this._paint(hintId, { remedy: true, anchorNearHelp: true });
  }

  /**
   * @param {string} [hintId] 省略则关掉全部
   */
  hideBubble(hintId) {
    if (!hintId) {
      for (const id of [...this._visibleIds]) this.hideBubble(id);
      return;
    }
    window.clearTimeout(this._hideTimers.get(hintId));
    this._hideTimers.delete(hintId);
    const bubble = this._bubbles.get(hintId);
    if (bubble) {
      bubble.hidden = true;
      bubble.textContent = '';
    }
    this._visibleIds.delete(hintId);
    if (this._remedyId === hintId) this._remedyId = null;
  }

  clearSeen() {
    this.store.clear();
    this._remedyId = null;
  }

  repositionAll() {
    for (const hintId of this._visibleIds) {
      this._positionBubble(hintId);
    }
  }

  dispose() {
    this._unsubLocale();
    window.removeEventListener('resize', this._onReposition);
    window.removeEventListener('scroll', this._onReposition, true);
    for (const timer of this._hideTimers.values()) window.clearTimeout(timer);
    this._hideTimers.clear();
    for (const bubble of this._bubbles.values()) bubble.remove();
    this._bubbles.clear();
    this.helpBtn.remove();
  }

  /**
   * @param {string} hintId
   * @param {{ remedy?: boolean, anchorNearHelp?: boolean }} [opts]
   */
  _paint(hintId, { remedy = false, anchorNearHelp = false } = {}) {
    const bubble = this._ensureBubble(hintId);
    const key = HINT_LOCALE_KEYS[hintId] || HINT_LOCALE_KEYS['help-fallback'];
    bubble.textContent = t(key);
    bubble.hidden = false;
    bubble.dataset.hintId = hintId;
    bubble.dataset.remedy = remedy ? '1' : '0';
    bubble.dataset.remedyAnchor = anchorNearHelp ? 'help' : '';
    bubble.setAttribute('aria-label', `${t(key)}. ${t('HINT_DISMISS_ARIA')}`);
    bubble.title = t('HINT_DISMISS_ARIA');
    const anchor = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    bubble.dataset.tip = anchor.tip;
    this._visibleIds.add(hintId);
    this._positionBubble(hintId);

    window.clearTimeout(this._hideTimers.get(hintId));
    this._hideTimers.set(
      hintId,
      window.setTimeout(
        () => {
          if (bubble.dataset.remedy === '1') this.hideBubble(hintId);
        },
        remedy ? 8000 : 14000
      )
    );
  }

  _ensureBubble(hintId) {
    let bubble = this._bubbles.get(hintId);
    if (bubble) return bubble;
    bubble = document.createElement('div');
    bubble.className = 'onboarding-hint-bubble';
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', '0');
    bubble.setAttribute('aria-live', 'polite');
    bubble.hidden = true;
    bubble.title = ''; // 由 _paint 写入可点关闭提示
    const dismiss = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._dismissByUser(hintId);
    };
    bubble.addEventListener('click', dismiss);
    bubble.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._dismissByUser(hintId);
      }
    });
    this.mountRoot.appendChild(bubble);
    this._bubbles.set(hintId, bubble);
    return bubble;
  }

  /**
   * 用户点击/键盘关闭：立刻消失。
   * 自动提示记已读（不再自动出现）；补救仅隐藏，不改已读。
   * @param {string} hintId
   */
  _dismissByUser(hintId) {
    if (this._remedyId === hintId) {
      this.hideBubble(hintId);
      return;
    }
    this.markSeen(hintId);
  }

  _positionBubble(hintId) {
    const bubble = this._bubbles.get(hintId);
    if (!bubble || bubble.hidden) return;

    const cfg = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    const useHelpAnchor =
      bubble.dataset.remedy === '1' && bubble.dataset.remedyAnchor === 'help';
    const anchorCfg = useHelpAnchor
      ? { selector: '#onboarding-hint-help', placement: 'right', tip: 'left' }
      : cfg;
    const anchor = resolveAnchorEl(anchorCfg.selector);
    const gap = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(300, vw - 24);

    bubble.style.maxWidth = `${maxW}px`;
    // 先放到屏外量宽高
    bubble.style.left = '0px';
    bubble.style.top = '0px';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
    bubble.style.transform = 'none';

    const br = bubble.getBoundingClientRect();
    let left;
    let top;

    if (!anchor) {
      left = (vw - br.width) / 2;
      top = vh - br.height - 118;
      bubble.dataset.tip = 'bottom';
    } else {
      const ar = anchor.getBoundingClientRect();
      if (anchorCfg.placement === 'left') {
        left = ar.left - br.width - gap;
        top = ar.top + (ar.height - br.height) / 2;
        bubble.dataset.tip = 'right';
        if (left < 12) {
          left = ar.right + gap;
          bubble.dataset.tip = 'left';
        }
      } else if (anchorCfg.placement === 'right') {
        left = ar.right + gap;
        top = ar.top + (ar.height - br.height) / 2;
        bubble.dataset.tip = 'left';
        if (left + br.width > vw - 12) {
          left = ar.left - br.width - gap;
          bubble.dataset.tip = 'right';
        }
      } else if (anchorCfg.placement === 'below') {
        left = ar.left + (ar.width - br.width) / 2;
        top = ar.bottom + gap;
        bubble.dataset.tip = 'top';
      } else {
        // above
        left = ar.left + (ar.width - br.width) / 2;
        top = ar.top - br.height - gap;
        bubble.dataset.tip = 'bottom';
      }
    }

    left = Math.max(12, Math.min(left, vw - br.width - 12));
    top = Math.max(12, Math.min(top, vh - br.height - 12));
    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }

  _injectStyles() {
    if (document.getElementById('onboarding-hint-styles')) return;
    const style = document.createElement('style');
    style.id = 'onboarding-hint-styles';
    style.textContent = `
      .onboarding-hint-bubble {
        position: fixed;
        z-index: 26;
        padding: 9px 14px;
        border-radius: 16px 16px 16px 4px;
        border: 1.5px solid rgba(92, 122, 108, 0.45);
        background: linear-gradient(165deg, #eef6f1 0%, #dceae2 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.65) inset,
          0 6px 16px rgba(40, 64, 52, 0.14);
        color: #3a5348;
        font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", "Noto Serif SC", Georgia, serif;
        font-size: 12.5px;
        font-style: italic;
        font-weight: 500;
        letter-spacing: 0.01em;
        line-height: 1.45;
        text-align: left;
        pointer-events: auto;
        cursor: pointer;
        filter: drop-shadow(0 2px 4px rgba(40, 64, 52, 0.08));
      }
      .onboarding-hint-bubble:hover {
        filter: brightness(1.02) drop-shadow(0 2px 4px rgba(40, 64, 52, 0.1));
      }
      .onboarding-hint-bubble::after {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
      }
      /* 尖角朝下 → 指向下方锚点 */
      .onboarding-hint-bubble[data-tip="bottom"]::after {
        left: 50%;
        bottom: -8px;
        transform: translateX(-50%);
        border-width: 8px 7px 0 7px;
        border-color: #dceae2 transparent transparent transparent;
        filter: drop-shadow(0 1px 0 rgba(92, 122, 108, 0.35));
      }
      .onboarding-hint-bubble[data-tip="top"]::after {
        left: 50%;
        top: -8px;
        transform: translateX(-50%);
        border-width: 0 7px 8px 7px;
        border-color: transparent transparent #eef6f1 transparent;
      }
      .onboarding-hint-bubble[data-tip="right"]::after {
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 7px 0 7px 8px;
        border-color: transparent transparent transparent #dceae2;
      }
      .onboarding-hint-bubble[data-tip="left"]::after {
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 7px 8px 7px 0;
        border-color: transparent #dceae2 transparent transparent;
      }
      .onboarding-hint-bubble[hidden] {
        display: none !important;
      }
      .onboarding-hint-help {
        position: fixed;
        left: 20px;
        bottom: 28px;
        z-index: 22;
        pointer-events: auto;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 1px solid rgba(139, 90, 55, 0.42);
        background: linear-gradient(180deg, #fff8ec 0%, #f0dfc4 42%, #e4c9a0 100%);
        color: #5c3d2e;
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.95) inset,
          0 -1px 0 rgba(120, 80, 40, 0.14) inset,
          0 3px 0 rgba(160, 118, 72, 0.48),
          0 10px 22px rgba(44, 31, 20, 0.18);
        opacity: 1;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      }
      .onboarding-hint-help:hover {
        filter: brightness(1.04);
      }
      .onboarding-hint-help:active {
        transform: translateY(2px) scale(0.97);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.75) inset,
          0 -1px 0 rgba(120, 80, 40, 0.14) inset,
          0 1px 0 rgba(160, 118, 72, 0.35),
          0 4px 10px rgba(44, 31, 20, 0.12);
      }
    `;
    document.head.appendChild(style);
  }
}
