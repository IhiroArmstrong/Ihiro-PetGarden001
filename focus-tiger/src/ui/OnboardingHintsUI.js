/**
 * 分散式即时提示气泡 + 角落「?」补救入口。
 * 气泡为 Lit 组件 `ft-onboarding-hint-bubble`（响应式文案/尖角/显隐）；
 * 本类保留装配 API、锚定与补救集合逻辑。
 * @see ONBOARDING_HINTS.md
 * @see docs/task-briefs/task-lit-pilot-onboarding-hints.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  HINT_LOCALE_KEYS,
  createHintsSeenStore,
  resolveRemedyHintIds
} from '../core/OnboardingHintsStore.js';
import './ft-onboarding-hint-bubble.js';
import {
  NotificationBadge,
  NOTIFICATION_BADGE_TAG
} from '../../ui-kit/components/notification-badge.js';

if (!customElements.get(NOTIFICATION_BADGE_TAG)) {
  customElements.define(NOTIFICATION_BADGE_TAG, NotificationBadge);
}

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
    /** @type {Map<string, import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble>} */
    this._bubbles = new Map();
    /** @type {Set<string>} */
    this._visibleIds = new Set();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    this._hideTimers = new Map();
    /** @type {Set<string>} 补救气泡（忽略已读；sync 不会清掉） */
    this._remedyIds = new Set();
    /** @type {Map<string, { remedy: boolean, anchorNearHelp: boolean }>} */
    this._paintMeta = new Map();

    this.helpBtn = document.createElement('button');
    this.helpBtn.type = 'button';
    this.helpBtn.id = 'onboarding-hint-help';
    this.helpBtn.className = 'onboarding-hint-help';
    this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
    const helpMark = document.createElement('span');
    helpMark.className = 'onboarding-hint-help__mark';
    helpMark.textContent = '?';
    this.helpBadge = document.createElement(NOTIFICATION_BADGE_TAG);
    this.helpBadge.className = 'onboarding-hint-help__badge';
    this.helpBadge.setAttribute('aria-hidden', 'true');
    this.helpBtn.append(helpMark, this.helpBadge);
    this.helpBtn.addEventListener('click', () => {
      this.markSeen('help-affordance');
      this.showRemedy();
    });

    mountRoot.append(this.helpBtn);
    this._syncHelpBadge();
    this._injectHelpStyles();
    this._onReposition = () => this.repositionAll();
    window.addEventListener('resize', this._onReposition);
    window.addEventListener('scroll', this._onReposition, true);

    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      for (const hintId of this._visibleIds) {
        const meta = this._paintMeta.get(hintId) || { remedy: false, anchorNearHelp: false };
        this._paint(hintId, meta);
      }
    });
  }

  /**
   * 未读则自动展示；已读则 no-op。可与其它未读提示并存（如 Rise + Sound）。
   * @param {string} hintId
   * @returns {boolean}
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this.store.isSeen(hintId)) return false;
    if (this._remedyIds.size > 0) return false;
    this._paint(hintId, { remedy: false });
    return true;
  }

  /**
   * 仅保留 listed 中的自动提示（已读的不会出现）；关掉不在列表里的自动气泡。
   * 补救气泡若正显示且不在列表中也会被关掉——调用方应在补救后勿立刻 sync 清掉。
   * @param {string[]} hintIds
   * @returns {void}
   */
  syncVisibleAutos(hintIds) {
    const want = new Set(hintIds.filter((id) => HINT_LOCALE_KEYS[id] && !this.store.isSeen(id)));
    for (const id of [...this._visibleIds]) {
      if (this._remedyIds.has(id)) continue;
      if (!want.has(id)) this.hideBubble(id);
    }
    for (const id of want) {
      this.maybeShowAuto(id);
    }
  }

  /**
   * 标记已读并隐藏（若当前正显示该条）。
   * @param {string} hintId
   * @returns {void}
   */
  markSeen(hintId) {
    this.store.markSeen(hintId);
    if (this._visibleIds.has(hintId)) {
      this.hideBubble(hintId);
    }
    if (hintId === 'help-affordance') this._syncHelpBadge();
  }

  /** Vermillion mark only while help-affordance unseen — never persistent chrome noise. */
  _syncHelpBadge() {
    if (!this.helpBadge) return;
    const show = !this.store.isSeen('help-affordance');
    this.helpBadge.hidden = !show;
    if (show) this.helpBadge.setAttribute('pulse', '');
    else this.helpBadge.removeAttribute('pulse');
  }

  /** 补救：强制展示本页全部操作提示（忽略已读）+「?」旁元文案。 */
  showRemedy() {
    const scene = this.getScene() || {};
    const sceneIds = resolveRemedyHintIds(scene);
    const nextRemedy = new Set(['help-remedy', ...sceneIds]);

    for (const id of [...this._remedyIds]) {
      if (!nextRemedy.has(id)) this.hideBubble(id);
    }
    this._remedyIds = nextRemedy;

    for (const id of sceneIds) {
      this._paint(id, { remedy: true });
    }
    this._paint('help-remedy', { remedy: true, anchorNearHelp: true });
  }

  /**
   * @param {string} [hintId] 省略则关掉全部
   * @returns {void}
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
      bubble.open = false;
      bubble.message = '';
    }
    this._visibleIds.delete(hintId);
    this._paintMeta.delete(hintId);
    if (this._remedyIds.has(hintId)) this._remedyIds.delete(hintId);
  }

  clearSeen() {
    this.store.clear();
    this._remedyIds.clear();
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
    const message = t(key);
    this._paintMeta.set(hintId, { remedy, anchorNearHelp });

    bubble.message = message;
    bubble.open = true;
    bubble.remedy = remedy;
    bubble.dataset.hintId = hintId;
    bubble.dataset.remedy = remedy ? '1' : '0';
    bubble.dataset.remedyAnchor = anchorNearHelp ? 'help' : '';
    bubble.setAttribute('aria-label', `${message}. ${t('HINT_DISMISS_ARIA')}`);
    bubble.title = t('HINT_DISMISS_ARIA');
    const anchor = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    bubble.tip = /** @type {'top'|'bottom'|'left'|'right'} */ (anchor.tip);
    this._visibleIds.add(hintId);
    const place = () => this._positionBubble(hintId);
    place();
    void bubble.updateComplete.then(place);

    window.clearTimeout(this._hideTimers.get(hintId));
    this._hideTimers.set(
      hintId,
      window.setTimeout(
        () => {
          if (bubble.remedy) this.hideBubble(hintId);
        },
        remedy ? 8000 : 14000
      )
    );
  }

  /**
   * @param {string} hintId
   * @returns {import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble}
   */
  _ensureBubble(hintId) {
    let bubble = this._bubbles.get(hintId);
    if (bubble) return bubble;
    bubble = /** @type {import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble} */ (
      document.createElement('ft-onboarding-hint-bubble')
    );
    bubble.className = 'onboarding-hint-bubble';
    bubble.addEventListener('ft-hint-dismiss', () => {
      this._dismissByUser(hintId);
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
    if (this._remedyIds.has(hintId)) {
      this.hideBubble(hintId);
      return;
    }
    this.markSeen(hintId);
  }

  _positionBubble(hintId) {
    const bubble = this._bubbles.get(hintId);
    if (!bubble || !bubble.open) return;

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
    bubble.style.left = '0px';
    bubble.style.top = '0px';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
    bubble.style.transform = 'none';

    const br = bubble.getBoundingClientRect();
    let left;
    let top;
    /** @type {string} */
    let tip = 'bottom';

    if (!anchor) {
      left = (vw - br.width) / 2;
      top = vh - br.height - 118;
      tip = 'bottom';
    } else {
      const ar = anchor.getBoundingClientRect();
      if (anchorCfg.placement === 'left') {
        left = ar.left - br.width - gap;
        top = ar.top + (ar.height - br.height) / 2;
        tip = 'right';
        if (left < 12) {
          left = ar.right + gap;
          tip = 'left';
        }
      } else if (anchorCfg.placement === 'right') {
        left = ar.right + gap;
        top = ar.top + (ar.height - br.height) / 2;
        tip = 'left';
        if (left + br.width > vw - 12) {
          left = ar.left - br.width - gap;
          tip = 'right';
        }
      } else if (anchorCfg.placement === 'below') {
        left = ar.left + (ar.width - br.width) / 2;
        top = ar.bottom + gap;
        tip = 'top';
      } else {
        left = ar.left + (ar.width - br.width) / 2;
        top = ar.top - br.height - gap;
        tip = 'bottom';
      }
    }

    left = Math.max(12, Math.min(left, vw - br.width - 12));
    top = Math.max(12, Math.min(top, vh - br.height - 12));

    bubble.tip = /** @type {'top'|'bottom'|'left'|'right'} */ (tip);

    if (anchor) {
      const ar = anchor.getBoundingClientRect();
      const anchorCenterX = ar.left + ar.width / 2;
      const anchorCenterY = ar.top + ar.height / 2;
      const tipX = Math.max(18, Math.min(anchorCenterX - left, br.width - 18));
      const tipY = Math.max(18, Math.min(anchorCenterY - top, br.height - 18));
      bubble.tipX = `${Math.round(tipX)}px`;
      bubble.tipY = `${Math.round(tipY)}px`;
    } else {
      bubble.tipX = '50%';
      bubble.tipY = '50%';
    }

    bubble.style.left = `${Math.round(left)}px`;
    bubble.style.top = `${Math.round(top)}px`;
  }

  _injectHelpStyles() {
    if (document.getElementById('onboarding-hint-styles')) return;
    const style = document.createElement('style');
    style.id = 'onboarding-hint-styles';
    style.textContent = `
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
      .onboarding-hint-help__mark {
        display: block;
        line-height: 52px;
        text-align: center;
      }
      .onboarding-hint-help__badge {
        position: absolute;
        top: 6px;
        right: 6px;
      }
      .onboarding-hint-help__badge[hidden] {
        display: none !important;
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
