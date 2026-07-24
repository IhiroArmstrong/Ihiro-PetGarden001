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
  resolveRemedyHintIds,
  selectExclusiveAutoHintIds
} from '../core/OnboardingHintsStore.js';
import { ONBOARDING_HINT_ANCHORS } from './onboardingHintAnchors.js';
import './ft-onboarding-hint-bubble.js';
import {
  NotificationBadge,
  NOTIFICATION_BADGE_TAG
} from '../../ui-kit/components/notification-badge.js';

if (!customElements.get(NOTIFICATION_BADGE_TAG)) {
  customElements.define(NOTIFICATION_BADGE_TAG, NotificationBadge);
}

/**
 * hintId → 锚定目标与尖角朝向（权威 map：`onboardingHintAnchors.js`）。
 */
const HINT_ANCHORS = ONBOARDING_HINT_ANCHORS;

/** Wide Idle parks these into ⋯ — remap hints to the more button when parked. */
const WIDE_PARKED_ANCHOR_RE =
  /honesty-idle-entry|micro-ritual-idle-entry|session-start-dock__hint|ambient-soundscape__fab|reminder-preference-toggle/;

function resolveAnchorEl(selectorList) {
  const widePark = document.body.classList.contains('ft-wide-park-secondary');
  for (const sel of String(selectorList)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (widePark && WIDE_PARKED_ANCHOR_RE.test(sel)) {
      const more = document.getElementById('ft-wide-more-btn');
      if (more && !more.hidden && more.getClientRects().length > 0) return more;
    }
    const el = document.querySelector(sel);
    if (el && !el.hidden && el.getClientRects().length > 0) {
      // Off-canvas park (left: -10000px) still has a rect — skip those
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) {
        continue;
      }
      return el;
    }
  }
  return null;
}

/** @returns {boolean} */
function isNarrowViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches;
}

/**
 * Narrow Idle shell parks dock/help/?/heatmap off-screen — remap tips to visible chrome.
 * @param {{ selector: string, placement: string, tip: string }} anchorCfg
 * @param {boolean} useHelpAnchor
 */
function remapNarrowIdleHintAnchor(anchorCfg, useHelpAnchor) {
  if (useHelpAnchor || /onboarding-hint-help/.test(String(anchorCfg.selector))) {
    return {
      selector: '#ft-narrow-help-btn',
      placement: 'below',
      tip: 'top'
    };
  }
  const sel = String(anchorCfg.selector || '');
  if (/ambient-soundscape__mute/.test(sel)) {
    return {
      selector: '#ft-narrow-mute-btn',
      placement: 'below',
      tip: 'top'
    };
  }
  if (
    /btn-focus|session-start-dock__hint|weekly-practice|micro-ritual|honesty-idle|ambient-soundscape|reminder-preference|quick-start/.test(
      sel
    )
  ) {
    return {
      selector: '.ft-narrow-grabber',
      placement: 'above',
      tip: 'bottom'
    };
  }
  return anchorCfg;
}

/** 自动提示同时最多几条（补救除外）。始终 1，对齐 RESPONSIVE_LAYOUT P1。 */
const AUTO_HINT_MAX_CONCURRENT = 1;

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
    /** @type {string[]} 最近一次 sync 的候选自动 id（未读过滤后），供 dismiss 后串行下一条 */
    this._lastAutoWant = [];
    /** @type {Map<string, { remedy: boolean, anchorNearHelp: boolean }>} */
    this._paintMeta = new Map();
    /** @type {HTMLElement | null} */
    this.purposeCard = null;

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
    this._ensurePurposeCard();
    this._syncHelpBadge();
    this._injectHelpStyles();
    this._onReposition = () => this.repositionAll();
    window.addEventListener('resize', this._onReposition);
    window.addEventListener('scroll', this._onReposition, true);

    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      this._refreshPurposeCardCopy();
      for (const hintId of this._visibleIds) {
        const meta = this._paintMeta.get(hintId) || { remedy: false, anchorNearHelp: false };
        this._paint(hintId, meta);
      }
    });
  }

  /**
   * 未读则自动展示；已读则 no-op。
   * 自动路径互斥：同时最多 AUTO_HINT_MAX_CONCURRENT 条（优先级见 selectExclusiveAutoHintIds）。
   * @param {string} hintId
   * @returns {boolean}
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this.store.isSeen(hintId)) return false;
    if (this._remedyIds.size > 0) return false;

    const otherAutos = [...this._visibleIds].filter(
      (id) => id !== hintId && !this._remedyIds.has(id)
    );
    if (otherAutos.length > 0) {
      const winner = selectExclusiveAutoHintIds([hintId, ...otherAutos], {
        maxConcurrent: AUTO_HINT_MAX_CONCURRENT
      })[0];
      if (winner !== hintId) return false;
      for (const id of otherAutos) {
        if (id !== winner) this.hideBubble(id);
      }
    }

    this._paint(hintId, { remedy: false });
    return true;
  }

  /**
   * 仅保留 listed 中的自动提示（已读的不会出现）；关掉不在列表里的自动气泡。
   * 自动路径经互斥后同时最多 1 条；补救气泡若正显示且不在列表中也会被关掉——调用方应在补救后勿立刻 sync 清掉。
   * @param {string[]} hintIds
   * @returns {void}
   */
  syncVisibleAutos(hintIds) {
    const want = hintIds.filter((id) => HINT_LOCALE_KEYS[id] && !this.store.isSeen(id));
    this._lastAutoWant = want;
    const show = selectExclusiveAutoHintIds(want, {
      maxConcurrent: AUTO_HINT_MAX_CONCURRENT
    });
    const showSet = new Set(show);

    for (const id of [...this._visibleIds]) {
      if (this._remedyIds.has(id)) continue;
      if (!showSet.has(id)) this.hideBubble(id);
    }
    for (const id of show) {
      this.maybeShowAuto(id);
    }
  }

  /**
   * 当前自动气泡关掉后，从 _lastAutoWant 串行下一条（仍受互斥）。
   * @returns {void}
   */
  _promoteNextAuto() {
    if (this._remedyIds.size > 0) return;
    const openAutos = [...this._visibleIds].filter((id) => !this._remedyIds.has(id));
    if (openAutos.length > 0) return;
    const want = (this._lastAutoWant || []).filter(
      (id) => HINT_LOCALE_KEYS[id] && !this.store.isSeen(id)
    );
    const next = selectExclusiveAutoHintIds(want, {
      maxConcurrent: AUTO_HINT_MAX_CONCURRENT
    });
    for (const id of next) this.maybeShowAuto(id);
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

  /** 补救：强制展示本页全部操作提示（忽略已读）+「?」旁元文案 + App 用途简介卡。 */
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
    this._showPurposeCard();
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
    this._positionPurposeCard();
  }

  dispose() {
    this._unsubLocale();
    window.removeEventListener('resize', this._onReposition);
    window.removeEventListener('scroll', this._onReposition, true);
    for (const timer of this._hideTimers.values()) window.clearTimeout(timer);
    this._hideTimers.clear();
    for (const bubble of this._bubbles.values()) bubble.remove();
    this._bubbles.clear();
    this.purposeCard?.remove();
    this.purposeCard = null;
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
   * 自动提示记已读（不再自动出现）并串行下一条；补救仅隐藏，不改已读。
   * @param {string} hintId
   */
  _dismissByUser(hintId) {
    if (this._remedyIds.has(hintId)) {
      this.hideBubble(hintId);
      return;
    }
    this.markSeen(hintId);
    this._promoteNextAuto();
  }

  _positionBubble(hintId) {
    const bubble = this._bubbles.get(hintId);
    if (!bubble || !bubble.open) return;

    const cfg = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    const useHelpAnchor =
      bubble.dataset.remedy === '1' && bubble.dataset.remedyAnchor === 'help';
    let anchorCfg = useHelpAnchor
      ? { selector: '#onboarding-hint-help', placement: 'right', tip: 'left' }
      : { ...cfg };

    // 窄屏 Idle 壳：锚点改到可见 ActionBar / grabber（旧 dock 已停泊屏外）
    if (document.body.classList.contains('ft-narrow-idle')) {
      anchorCfg = remapNarrowIdleHintAnchor(anchorCfg, useHelpAnchor);
    }

    // 窄屏：锚在主 CTA 的 above 易挡 Sit，改侧面（与 honesty-optional 策略一致）
    if (
      !useHelpAnchor &&
      isNarrowViewport() &&
      !document.body.classList.contains('ft-narrow-idle') &&
      anchorCfg.placement === 'above' &&
      /#btn-focus/.test(String(anchorCfg.selector))
    ) {
      anchorCfg = { ...anchorCfg, placement: 'right', tip: 'left' };
    }

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

  _ensurePurposeCard() {
    if (this.purposeCard) return this.purposeCard;
    const card = document.createElement('aside');
    card.id = 'onboarding-app-purpose';
    card.className = 'onboarding-app-purpose';
    card.hidden = true;
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-labelledby', 'onboarding-app-purpose-title');

    const title = document.createElement('h2');
    title.id = 'onboarding-app-purpose-title';
    title.className = 'onboarding-app-purpose__title';

    const body = document.createElement('p');
    body.className = 'onboarding-app-purpose__body';

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'onboarding-app-purpose__dismiss';
    dismiss.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._hidePurposeCard();
    });

    card.append(title, body, dismiss);
    this.mountRoot.appendChild(card);
    this.purposeCard = card;
    this._purposeTitleEl = title;
    this._purposeBodyEl = body;
    this._purposeDismissEl = dismiss;
    this._refreshPurposeCardCopy();
    return card;
  }

  _refreshPurposeCardCopy() {
    if (!this.purposeCard) return;
    this._purposeTitleEl.textContent = t('HINT_APP_PURPOSE_TITLE');
    this._purposeBodyEl.textContent = t('HINT_APP_PURPOSE_BODY');
    this._purposeDismissEl.textContent = t('HINT_APP_PURPOSE_DISMISS');
  }

  _showPurposeCard() {
    this._ensurePurposeCard();
    this._refreshPurposeCardCopy();
    this.purposeCard.hidden = false;
    this._positionPurposeCard();
  }

  _hidePurposeCard() {
    if (this.purposeCard) this.purposeCard.hidden = true;
  }

  _positionPurposeCard() {
    const card = this.purposeCard;
    if (!card || card.hidden) return;
    const help =
      (document.body.classList.contains('ft-narrow-idle') &&
        document.getElementById('ft-narrow-help-btn')) ||
      this.helpBtn;
    const gap = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(320, vw - 24);
    card.style.maxWidth = `${maxW}px`;
    card.style.left = '0px';
    card.style.top = '0px';

    const cr = card.getBoundingClientRect();
    const hr = help?.getBoundingClientRect?.() || { left: 12, top: 12, bottom: 52, width: 40, height: 40 };
    let left = hr.left;
    let top = hr.bottom + gap;
    if (top + cr.height > vh - 12) {
      top = Math.max(12, hr.top - cr.height - gap);
    }
    left = Math.max(12, Math.min(left, vw - cr.width - 12));
    top = Math.max(12, Math.min(top, vh - cr.height - 12));
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
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
      .onboarding-app-purpose {
        position: fixed;
        z-index: 27;
        box-sizing: border-box;
        padding: 14px 16px 12px;
        border-radius: 16px;
        border: 1.5px solid rgba(92, 122, 108, 0.5);
        background: linear-gradient(165deg, #eef6f1 0%, #d4e6db 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 10px 28px rgba(40, 64, 52, 0.16);
        color: #3a5348;
        font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Songti SC", "Noto Serif SC", Georgia, serif;
        pointer-events: auto;
      }
      .onboarding-app-purpose[hidden] {
        display: none !important;
      }
      .onboarding-app-purpose__title {
        margin: 0 0 8px;
        font-size: 15px;
        font-weight: 700;
        font-style: normal;
        letter-spacing: 0.01em;
        color: #2f463c;
      }
      .onboarding-app-purpose__body {
        margin: 0 0 12px;
        font-size: 13px;
        font-style: italic;
        font-weight: 500;
        line-height: 1.5;
        color: #3a5348;
      }
      .onboarding-app-purpose__dismiss {
        display: inline-block;
        margin: 0;
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(92, 122, 108, 0.45);
        background: rgba(255, 255, 255, 0.55);
        color: #2f463c;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        font-style: normal;
        cursor: pointer;
      }
      .onboarding-app-purpose__dismiss:hover {
        background: rgba(255, 255, 255, 0.8);
      }
    `;
    document.head.appendChild(style);
  }
}
