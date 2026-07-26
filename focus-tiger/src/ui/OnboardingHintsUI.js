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
  resolvePrimaryRemedyHintId,
  resolveRemedyCatalogHintIds,
  selectExclusiveAutoHintIds
} from '../core/OnboardingHintsStore.js';
import { ONBOARDING_HINT_ANCHORS } from './onboardingHintAnchors.js';
import './ft-onboarding-hint-bubble.js';
import {
  NotificationBadge,
  NOTIFICATION_BADGE_TAG
} from '../../ui-kit/components/notification-badge.js';
import {
  HINT_DISCOVERY_DOT_COLOR,
  resolvePurposeCardAwayFromTips,
  syncAllDiscoveryDots
} from './hintDiscoveryDots.js';

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

/** Narrow Idle parks legacy chrome off-canvas — remap to ActionBar / grabber. */
const NARROW_PARKED_ANCHOR_RE =
  /btn-focus|session-start-dock|arrival-practice|weekly-practice|micro-ritual|honesty-idle|ambient-soundscape__fab|ambient-soundscape__focus-chrome|ambient-soundscape__nudge|reminder-preference|quick-start|focus-hud|onboarding-hint-help/;

function resolveAnchorEl(selectorList) {
  const widePark = document.body.classList.contains('ft-wide-park-secondary');
  const narrowPark = document.body.classList.contains('ft-narrow-park');
  for (const sel of String(selectorList)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (widePark && WIDE_PARKED_ANCHOR_RE.test(sel)) {
      const more = document.getElementById('ft-wide-more-btn');
      if (more && !more.hidden && more.getClientRects().length > 0) return more;
    }
    if (narrowPark && NARROW_PARKED_ANCHOR_RE.test(sel)) {
      const remapped = remapNarrowParkedSelector(sel);
      if (remapped) {
        const el = document.querySelector(remapped);
        if (el && !el.hidden && el.getClientRects().length > 0) {
          const r = el.getBoundingClientRect();
          const vw = document.documentElement.clientWidth;
          const vh = document.documentElement.clientHeight;
          if (!(r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh)) {
            return el;
          }
        }
      }
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

/**
 * @param {string} sel
 * @returns {string | null}
 */
function remapNarrowParkedSelector(sel) {
  if (/onboarding-hint-help/.test(sel)) return '#ft-narrow-help-btn';
  if (/ambient-soundscape__mute/.test(sel)) return '#ft-narrow-mute-btn';
  if (/focus-hud/.test(sel)) return '.ft-narrow-action-bar__center';
  if (NARROW_PARKED_ANCHOR_RE.test(sel)) return '.ft-narrow-grabber';
  return null;
}

/** @returns {boolean} */
function isNarrowViewport() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 479px)').matches
  );
}

/**
 * Narrow Idle shell parks dock/help/?/heatmap off-screen — remap tips to visible chrome.
 * Home CTAs (Sit/Quick Start/Honesty) now live as on-canvas PNG balls; HUD/secondary
 * controls remap to the ActionBar center or swipe grabber.
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
  if (/focus-hud/.test(sel)) {
    return {
      selector: '.ft-narrow-action-bar__center',
      placement: 'below',
      tip: 'top'
    };
  }
  // Primary home CTAs (moved out of the drawer onto the home canvas)
  if (/#btn-focus|btn-focus/.test(sel)) {
    return {
      selector: '#ft-narrow-home-sit',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (/quick-start/.test(sel)) {
    return {
      selector: '#ft-narrow-home-quickstart',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (/honesty-idle/.test(sel)) {
    return {
      selector: '#ft-narrow-home-honesty',
      placement: 'above',
      tip: 'bottom'
    };
  }
  // Secondary / parked controls → swipe grabber
  if (
    /session-start-dock__hint|weekly-practice|micro-ritual|ambient-soundscape|reminder-preference/.test(
      sel
    )
  ) {
    return {
      selector: '.ft-narrow-grabber',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (NARROW_PARKED_ANCHOR_RE.test(sel)) {
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
    /** @type {string[]} 补救目录（主条之外；点「还有 N 条」芯片展开） */
    this._catalogPending = [];
    /** @type {boolean} */
    this._catalogExpanded = false;
    /** @type {HTMLButtonElement | null} */
    this._catalogChip = null;
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
    this.syncDiscoveryDots();
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
      this.syncDiscoveryDots();
    });

    // 点 ? 后的用途卡 / 补救气泡：点框外空白收起
    this._onDocPointer = (event) => {
      const purposeOpen = Boolean(this.purposeCard && !this.purposeCard.hidden);
      const chipOpen = Boolean(this._catalogChip && !this._catalogChip.hidden);
      const remedyOpen = this._remedyIds.size > 0 || chipOpen;
      if (!purposeOpen && !remedyOpen) return;
      const el = /** @type {Element | null} */ (
        event.target instanceof Element ? event.target : event.target?.parentElement
      );
      if (!el) return;
      if (this.helpBtn.contains(el)) return;
      if (el.closest('#ft-narrow-help-btn')) return;
      if (el.closest('#ft-hint-catalog-chip')) return;
      if (this.purposeCard?.contains(el)) return;
      if (el.closest('ft-onboarding-hint-bubble')) return;
      this._hidePurposeCard();
      this._hideCatalogChip();
      for (const id of [...this._remedyIds]) this.hideBubble(id);
      this._remedyIds.clear();
      this._catalogPending = [];
      this._catalogExpanded = false;
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);
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
    this.syncDiscoveryDots();
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
    this.syncDiscoveryDots();
  }

  /** Vermillion mark only while help-affordance unseen — never persistent chrome noise. */
  _syncHelpBadge() {
    if (!this.helpBadge) return;
    const show = !this.store.isSeen('help-affordance');
    this.helpBadge.hidden = !show;
    if (show) this.helpBadge.setAttribute('pulse', '');
    else this.helpBadge.removeAttribute('pulse');
  }

  /** Soft blue dots on unread Quick Start / Focusing HUD chrome. */
  syncDiscoveryDots() {
    syncAllDiscoveryDots(this.store);
  }

  /** 补救：情境单条 +「还有 N 条」常驻芯片（图9/图12）；展开后才画全量。用途简介卡仍同出。 */
  showRemedy() {
    const scene = this.getScene() || {};
    const primary = resolvePrimaryRemedyHintId(scene);
    const catalog = resolveRemedyCatalogHintIds(scene);
    this._catalogPending = catalog;
    this._catalogExpanded = false;

    const nextRemedy = new Set([primary]);

    for (const id of [...this._remedyIds]) {
      if (!nextRemedy.has(id) && id !== 'help-remedy') this.hideBubble(id);
    }
    this.hideBubble('help-remedy');
    this._remedyIds = nextRemedy;

    this._paint(primary, { remedy: true });
    this._syncCatalogChip(catalog.length);
    this._showPurposeCard();
    this.syncDiscoveryDots();
    requestAnimationFrame(() => {
      this.repositionAll();
      this._positionCatalogChip();
      requestAnimationFrame(() => {
        this.repositionAll();
        this._positionCatalogChip();
      });
    });
  }

  /**
   * 短标签芯片「还有 N 条」——不自动消失，锚在可见 ? 旁（图12）。
   * @param {number} catalogCount
   * @returns {void}
   */
  _syncCatalogChip(catalogCount) {
    const n = Math.max(0, Number(catalogCount) || 0);
    if (n <= 0 || this._catalogExpanded) {
      this._hideCatalogChip();
      return;
    }
    const chip = this._ensureCatalogChip();
    chip.hidden = false;
    chip.textContent = String(t('HINT_HELP_REMEDY_MORE')).replace(
      /\{n\}/g,
      String(n)
    );
    chip.setAttribute('aria-label', chip.textContent);
    this._positionCatalogChip();
  }

  /** @returns {HTMLButtonElement} */
  _ensureCatalogChip() {
    if (this._catalogChip) return this._catalogChip;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.id = 'ft-hint-catalog-chip';
    chip.className = 'ft-hint-catalog-chip';
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.expandRemedyCatalog();
    });
    this.mountRoot.appendChild(chip);
    this._catalogChip = chip;
    return chip;
  }

  _hideCatalogChip() {
    if (this._catalogChip) this._catalogChip.hidden = true;
  }

  _positionCatalogChip() {
    const chip = this._catalogChip;
    if (!chip || chip.hidden) return;
    const help =
      (document.body.classList.contains('ft-narrow-park') ||
        document.body.classList.contains('ft-narrow-idle')) &&
      document.getElementById('ft-narrow-help-btn')
        ? document.getElementById('ft-narrow-help-btn')
        : this.helpBtn;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    chip.style.maxWidth = `${Math.min(220, vw - 24)}px`;
    const cr = chip.getBoundingClientRect();
    const hr = help?.getBoundingClientRect?.() || {
      left: 12,
      top: 12,
      right: 52,
      bottom: 52,
      width: 40,
      height: 40
    };
    let left = hr.left;
    let top = hr.bottom + 10;
    if (top + cr.height > vh - 12) {
      top = Math.max(12, hr.top - cr.height - 10);
    }
    left = Math.max(12, Math.min(left, vw - cr.width - 12));
    top = Math.max(12, Math.min(top, vh - cr.height - 12));
    chip.style.left = `${Math.round(left)}px`;
    chip.style.top = `${Math.round(top)}px`;
  }

  /** 展开补救目录：画出剩余 tip。 */
  expandRemedyCatalog() {
    if (this._catalogExpanded) return;
    const ids = [...this._catalogPending];
    this._catalogExpanded = true;
    this._catalogPending = [];
    this._hideCatalogChip();
    for (const id of ids) {
      this._remedyIds.add(id);
      this._paint(id, { remedy: true });
    }
    // 全量 tip 后须再避让用途卡（与 showRemedy 同）
    requestAnimationFrame(() => {
      this.repositionAll();
      requestAnimationFrame(() => this.repositionAll());
    });
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
    this._catalogPending = [];
    this._catalogExpanded = false;
    this._hideCatalogChip();
    this._syncHelpBadge();
    this.syncDiscoveryDots();
  }

  repositionAll() {
    for (const hintId of this._visibleIds) {
      this._positionBubble(hintId);
    }
    this._positionPurposeCard();
    this._positionCatalogChip();
    this.syncDiscoveryDots();
  }

  dispose() {
    this._unsubLocale();
    window.removeEventListener('resize', this._onReposition);
    window.removeEventListener('scroll', this._onReposition, true);
    if (this._onDocPointer) {
      document.removeEventListener('pointerdown', this._onDocPointer, true);
    }
    for (const timer of this._hideTimers.values()) window.clearTimeout(timer);
    this._hideTimers.clear();
    for (const bubble of this._bubbles.values()) bubble.remove();
    this._bubbles.clear();
    this.purposeCard?.remove();
    this.purposeCard = null;
    this._catalogChip?.remove();
    this._catalogChip = null;
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
    // 「还有 N 条」：点 help-remedy 先展开目录，不直接关掉
    if (
      hintId === 'help-remedy' &&
      !this._catalogExpanded &&
      this._catalogPending.length > 0
    ) {
      this.expandRemedyCatalog();
      return;
    }
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

    // 窄屏 park：锚点改到可见 ActionBar / grabber（旧 dock 已停泊屏外）
    if (
      document.body.classList.contains('ft-narrow-park') ||
      document.body.classList.contains('ft-narrow-idle')
    ) {
      anchorCfg = remapNarrowIdleHintAnchor(anchorCfg, useHelpAnchor);
    }

    // 窄屏非 park：锚在主 CTA 的 above 易挡 Sit，改侧面（与 honesty-optional 策略一致）
    if (
      !useHelpAnchor &&
      isNarrowViewport() &&
      !document.body.classList.contains('ft-narrow-park') &&
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

    // 窄屏补救：多条「同一最终锚点」（如 grabber）时向上错开，避免叠成一团。
    // 注意：按最终 remap 后的锚点分组，而非全部 remedy 条目——不同锚点（home
    // CTA / mute / help）各自独立排开，避免因目录条目增多而把某条错位推出
    // 判定阈值（见 §8.6 / weekly-practice-heatmap.spec.js「375 park」回归）。
    if (
      bubble.dataset.remedy === '1' &&
      document.body.classList.contains('ft-narrow-park') &&
      anchor
    ) {
      const sameAnchor = [...this._remedyIds].filter((id) => {
        const b = this._bubbles.get(id);
        if (!b?.open) return false;
        if (id === hintId) return true;
        const otherCfg = HINT_ANCHORS[id] || HINT_ANCHORS['help-fallback'];
        const otherUseHelp =
          b.dataset.remedy === '1' && b.dataset.remedyAnchor === 'help';
        let otherAnchorCfg = otherUseHelp
          ? { selector: '#onboarding-hint-help', placement: 'right', tip: 'left' }
          : { ...otherCfg };
        otherAnchorCfg = remapNarrowIdleHintAnchor(otherAnchorCfg, otherUseHelp);
        return String(otherAnchorCfg.selector) === String(anchorCfg.selector);
      });
      const idx = sameAnchor.indexOf(hintId);
      if (idx > 0) {
        top -= idx * Math.min(52, Math.max(36, Math.round(br.height * 0.55)));
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

    /** @type {Array<{ left: number, top: number, right: number, bottom: number }>} */
    const tipRects = [];
    for (const hintId of this._visibleIds) {
      const bubble = this._bubbles.get(hintId);
      if (!bubble || !bubble.open || bubble.hidden) continue;
      tipRects.push(bubble.getBoundingClientRect());
    }
    const resolved = resolvePurposeCardAwayFromTips(
      { left, top, width: cr.width, height: cr.height },
      tipRects,
      { vw, vh, gap: 12 }
    );
    card.style.left = `${Math.round(resolved.left)}px`;
    card.style.top = `${Math.round(resolved.top)}px`;
  }

  _injectHelpStyles() {
    if (document.getElementById('onboarding-hint-styles-v2')) return;
    document.getElementById('onboarding-hint-styles')?.remove();
    const style = document.createElement('style');
    style.id = 'onboarding-hint-styles-v2';
    style.textContent = `
      .ft-hint-catalog-chip {
        position: fixed;
        z-index: 28;
        box-sizing: border-box;
        max-width: min(220px, calc(100vw - 24px));
        padding: 8px 12px;
        border-radius: 999px;
        border: 1.5px solid rgba(92, 122, 108, 0.55);
        background: linear-gradient(165deg, #eef6f1 0%, #d4e6db 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 6px 16px rgba(40, 64, 52, 0.16);
        color: #2f463c;
        font-family: "Nunito", "Noto Sans SC", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.01em;
        cursor: pointer;
        pointer-events: auto;
      }
      .ft-hint-catalog-chip[hidden] {
        display: none !important;
      }
      .ft-hint-catalog-chip:hover {
        filter: brightness(1.03);
      }
      .ft-hint-catalog-chip:active {
        transform: scale(0.97);
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
      .ft-hint-catalog-chip {
        position: fixed;
        z-index: 28;
        box-sizing: border-box;
        max-width: min(220px, calc(100vw - 24px));
        padding: 8px 12px;
        border-radius: 999px;
        border: 1.5px solid rgba(92, 122, 108, 0.55);
        background: linear-gradient(165deg, #eef6f1 0%, #d4e6db 100%);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.7) inset,
          0 6px 16px rgba(40, 64, 52, 0.16);
        color: #2f463c;
        font-family: "Nunito", "Noto Sans SC", system-ui, sans-serif;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        cursor: pointer;
        pointer-events: auto;
      }
      .ft-hint-catalog-chip[hidden] {
        display: none !important;
      }
      .ft-hint-catalog-chip:hover {
        filter: brightness(1.03);
      }
      .ft-hint-catalog-chip:active {
        transform: scale(0.97);
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
      .ft-hint-discovery-dot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${HINT_DISCOVERY_DOT_COLOR};
        box-shadow: 0 0 0 2px rgba(255, 252, 245, 0.9);
        pointer-events: none;
        z-index: 2;
      }
      #focus-hud .ft-hud__gauge,
      #focus-hud .ft-hud__bar,
      #focus-hud .ft-hud__streak {
        position: relative;
      }
      #focus-hud .ft-hud__gauge > .ft-hint-discovery-dot {
        top: 2px;
        right: 2px;
      }
      #quick-start-focus {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }
}
