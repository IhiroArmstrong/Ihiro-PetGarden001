/**
 * 分散式即时提示气泡 + 角落「?」补救入口。
 * 气泡为 Lit 组件 `ft-onboarding-hint-bubble`（响应式文案/尖角/显隐）；
 * click 模式：默认脉冲圆点徽标，点击后展开气泡（复用同一锚定逻辑）。
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
import {
  getHintTriggerMode,
  isClickTriggerHint
} from '../core/onboardingHintRegistry.js';
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
  if (/ft-narrow-grabber|narrow-drawer/.test(sel)) {
    return {
      selector: '.ft-narrow-grabber',
      placement: 'above',
      tip: 'bottom'
    };
  }
  // Drawer open: point at sheet rows / heatmap clone (not parked off-screen originals).
  const drawerOpen = Boolean(
    document.querySelector('.ft-narrow-idle-shell.is-sheet-open')
  );
  if (drawerOpen) {
    if (/weekly-practice/.test(sel)) {
      return {
        selector: '.ft-narrow-sheet__heatmap',
        placement: 'above',
        tip: 'bottom'
      };
    }
    if (/session-start-dock__hint|how-shall/.test(sel)) {
      return {
        selector: '.ft-narrow-sheet__item[data-proxy="companion"]',
        placement: 'above',
        tip: 'bottom'
      };
    }
    if (/micro-ritual/.test(sel)) {
      return {
        selector: '.ft-narrow-sheet__item[data-proxy="breath"]',
        placement: 'above',
        tip: 'bottom'
      };
    }
    if (/ambient-soundscape|ambient-gated/.test(sel)) {
      return {
        selector: '.ft-narrow-sheet__item[data-proxy="sound"]',
        placement: 'above',
        tip: 'bottom'
      };
    }
    if (/reminder-preference/.test(sel)) {
      return {
        selector: '.ft-narrow-sheet__item[data-proxy="reminder"]',
        placement: 'above',
        tip: 'bottom'
      };
    }
  }
  // Drawer closed: never remap parked controls onto home CTAs (would mis-point).
  // Callers must not paint drawer-parked tips while the sheet is closed.
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
    /** @type {Map<string, HTMLElement>} click 模式脉冲圆点 */
    this._badges = new Map();
    /** @type {Set<string>} */
    this._visibleIds = new Set();
    /** @type {Set<string>} 当前应展示圆点的 click hint（未读且在场景 want 内） */
    this._badgeIds = new Set();
    /** @type {Set<string>} 已由圆点展开、尚未 markSeen 的 click 气泡 */
    this._clickExpandedIds = new Set();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    this._hideTimers = new Map();
    /** @type {Set<string>} 补救气泡（忽略已读；sync 不会清掉） */
    this._remedyIds = new Set();
    /** @type {string[]} 补救目录（主条之外；点「还有 N 条」芯片逐条展开） */
    this._catalogPending = [];
    /** @type {string | null} 情境主条 id（展开目录时保留，不替换） */
    this._remedyPrimaryId = null;
    /** @type {string | null} 当前由芯片展开的那一条（同时最多主条 + 1） */
    this._catalogShownId = null;
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
    this.helpBtn.append(helpMark);
    this.helpBtn.addEventListener('click', () => {
      this.markSeen('help-affordance');
      this.showRemedy();
    });

    mountRoot.append(this.helpBtn);
    this._ensurePurposeCard();
    this._injectHelpStyles();
    this.syncDiscoveryDots();
    this._onReposition = () => this.repositionAll();
    this._onDocPointerDown = (event) => this._handleOutsidePointer(event);
    window.addEventListener('resize', this._onReposition);
    window.addEventListener('scroll', this._onReposition, true);
    document.addEventListener('pointerdown', this._onDocPointerDown, true);

    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      this._refreshPurposeCardCopy();
      for (const hintId of this._visibleIds) {
        const meta = this._paintMeta.get(hintId) || { remedy: false, anchorNearHelp: false };
        this._paint(hintId, meta);
      }
      this.syncDiscoveryDots();
      for (const hintId of this._badgeIds) {
        this._syncBadgeAria(hintId);
      }
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
      this._remedyPrimaryId = null;
      this._catalogShownId = null;
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);
  }

  /**
   * 未读则自动展示；已读则 no-op。
   * - auto：主动弹出气泡（互斥最多 AUTO_HINT_MAX_CONCURRENT 条）
   * - click：只显示脉冲圆点，点击后展开气泡
   * - manual / legacy：自动路径 no-op
   * @param {string} hintId
   * @returns {boolean}
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this.store.isSeen(hintId)) return false;
    if (this._remedyIds.size > 0) return false;

    const mode = getHintTriggerMode(hintId);
    if (mode === 'manual' || mode === 'legacy') return false;

    if (mode === 'click') {
      this._showClickBadge(hintId);
      return true;
    }

    const otherAutos = [...this._visibleIds].filter(
      (id) =>
        id !== hintId &&
        !this._remedyIds.has(id) &&
        getHintTriggerMode(id) === 'auto'
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
   * click 模式：在列表内显示圆点；不在列表或不存在锚点则隐藏圆点。
   * 自动路径经互斥后同时最多 1 条；补救气泡若正显示且不在列表中也会被关掉——调用方应在补救后勿立刻 sync 清掉。
   * @param {string[]} hintIds
   * @returns {void}
   */
  syncVisibleAutos(hintIds) {
    const want = hintIds.filter((id) => HINT_LOCALE_KEYS[id] && !this.store.isSeen(id));
    this._lastAutoWant = want;

    const autoWant = want.filter((id) => getHintTriggerMode(id) === 'auto');
    const clickWant = want.filter((id) => isClickTriggerHint(id));

    const show = selectExclusiveAutoHintIds(autoWant, {
      maxConcurrent: AUTO_HINT_MAX_CONCURRENT
    });
    const showSet = new Set(show);

    for (const id of [...this._visibleIds]) {
      if (this._remedyIds.has(id)) continue;
      if (this._clickExpandedIds.has(id)) continue;
      if (!showSet.has(id)) this.hideBubble(id);
    }
    for (const id of show) {
      this.maybeShowAuto(id);
    }

    const clickWantSet = new Set(clickWant);
    for (const id of [...this._badgeIds]) {
      if (!clickWantSet.has(id)) this._hideClickBadge(id);
    }
    for (const id of clickWant) {
      if (!this._clickExpandedIds.has(id)) this._showClickBadge(id);
    }
    this.syncDiscoveryDots();
  }

  /**
   * 当前自动气泡关掉后，从 _lastAutoWant 串行下一条（仍受互斥；仅 auto 模式）。
   * @returns {void}
   */
  _promoteNextAuto() {
    if (this._remedyIds.size > 0) return;
    const openAutos = [...this._visibleIds].filter(
      (id) => !this._remedyIds.has(id) && getHintTriggerMode(id) === 'auto'
    );
    if (openAutos.length > 0) return;
    const want = (this._lastAutoWant || []).filter(
      (id) =>
        HINT_LOCALE_KEYS[id] &&
        !this.store.isSeen(id) &&
        getHintTriggerMode(id) === 'auto'
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
    this._hideClickBadge(hintId);
    this._clickExpandedIds.delete(hintId);
    if (this._visibleIds.has(hintId)) {
      this.hideBubble(hintId);
    }
    this.syncDiscoveryDots();
  }

  /** Legacy vermillion ? badge — unused when help-affordance is click mint badge. */
  _syncHelpBadge() {
    if (!this.helpBadge) return;
    this.helpBadge.hidden = true;
    this.helpBadge.removeAttribute('pulse');
  }

  /** Soft blue dots on unread Quick Start / Focusing HUD chrome. */
  syncDiscoveryDots() {
    syncAllDiscoveryDots(this.store);
  }

  /** 补救：情境主条 +「还有 N 条」芯片；点芯片逐条展开（同时最多主条 + 1）。用途简介卡仍同出。 */
  showRemedy() {
    const scene = this.getScene() || {};
    const primary = resolvePrimaryRemedyHintId(scene);
    const catalog = resolveRemedyCatalogHintIds(scene);
    this._catalogPending = catalog;
    this._remedyPrimaryId = primary;
    this._catalogShownId = null;

    const nextRemedy = new Set([primary]);

    for (const id of [...this._remedyIds]) {
      if (!nextRemedy.has(id) && id !== 'help-remedy') this.hideBubble(id);
    }
    this.hideBubble('help-remedy');
    this._remedyIds = nextRemedy;

    for (const id of [...this._badgeIds]) this._hideClickBadge(id);
    this._clickExpandedIds.clear();

    this._paint(primary, { remedy: true });
    this._syncCatalogChip(catalog.length, {
      oneShot: catalog.length === 1 && catalog[0] === 'narrow-drawer-menu'
    });
    this._resolveRemedyBubbleLayout();
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
   * 窄屏一次性抽屉说明时用无计数文案（禁止 3 more / 2 more）。
   * @param {number} catalogCount
   * @param {{ oneShot?: boolean }} [opts]
   * @returns {void}
   */
  _syncCatalogChip(catalogCount, opts = {}) {
    const n = Math.max(0, Number(catalogCount) || 0);
    if (n <= 0) {
      this._hideCatalogChip();
      return;
    }
    const chip = this._ensureCatalogChip();
    chip.hidden = false;
    const oneShot = Boolean(opts.oneShot) || this._catalogPending[0] === 'narrow-drawer-menu';
    chip.textContent = oneShot
      ? String(t('HINT_HELP_REMEDY_MORE_ONE'))
      : String(t('HINT_HELP_REMEDY_MORE')).replace(/\{n\}/g, String(n));
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

  /**
   * 展开补救目录：一次只画下一条（替换上一条目录 tip，保留主条）。
   * `narrow-drawer-menu` 为一次性：展开后清空目录、关掉芯片（无 3 more / 2 more）。
   */
  expandRemedyCatalog() {
    if (this._catalogPending.length === 0) {
      this._hideCatalogChip();
      return;
    }
    const prevCatalog = this._catalogShownId;
    if (
      prevCatalog &&
      prevCatalog !== this._remedyPrimaryId &&
      this._visibleIds.has(prevCatalog)
    ) {
      this.hideBubble(prevCatalog);
    }
    const next = this._catalogPending.shift();
    if (next === 'narrow-drawer-menu') {
      this._catalogPending = [];
    }
    this._catalogShownId = next;
    this._remedyIds.add(next);
    this._paint(next, { remedy: true });
    this._syncCatalogChip(this._catalogPending.length, {
      oneShot: next === 'narrow-drawer-menu'
    });
    this._resolveRemedyBubbleLayout();
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
    this._clickExpandedIds.delete(hintId);
    if (this._remedyIds.has(hintId)) this._remedyIds.delete(hintId);
    if (this._catalogShownId === hintId) this._catalogShownId = null;
    if (this._remedyPrimaryId === hintId) this._remedyPrimaryId = null;
  }

  clearSeen() {
    this.store.clear();
    this._remedyIds.clear();
    this._catalogPending = [];
    this._remedyPrimaryId = null;
    this._catalogShownId = null;
    this._hideCatalogChip();
    this._clickExpandedIds.clear();
    for (const id of [...this._badgeIds]) this._hideClickBadge(id);
    this._syncHelpBadge();
    this.syncDiscoveryDots();
  }

  repositionAll() {
    for (const hintId of this._visibleIds) {
      this._positionBubble(hintId);
    }
    this._resolveRemedyBubbleLayout();
    for (const hintId of this._badgeIds) {
      this._positionBadge(hintId);
    }
    this._positionPurposeCard();
    this._positionCatalogChip();
    this.syncDiscoveryDots();
  }

  /**
   * Lift above home balls **then** separate. Old order (separate→lift) collapsed
   * multiple tips onto the same CTA-top Y and recreated overlaps (375 park chip).
   * @returns {void}
   */
  _resolveRemedyBubbleLayout() {
    // Two passes: lift may stack; separate may nudge; lift again if separate
    // pushed a tip back into the CTA band.
    this._liftBubblesAboveNarrowHomeCtas();
    this._separateOpenRemedyBubbles();
    this._liftBubblesAboveNarrowHomeCtas();
    this._separateOpenRemedyBubbles();
  }

  /**
   * 补救同时最多主条+1；若仍矩形相交则把**上方**气泡再上推（勿把下方气泡推进主球带）。
   * @returns {void}
   */
  _separateOpenRemedyBubbles() {
    const gap = 10;
    /** @type {{ id: string, bubble: import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble, top: number, bottom: number, height: number }[]} */
    const items = [];
    for (const id of this._visibleIds) {
      if (!this._remedyIds.has(id)) continue;
      const bubble = this._bubbles.get(id);
      if (!bubble || !bubble.open) continue;
      const r = bubble.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      items.push({
        id,
        bubble,
        top: r.top,
        bottom: r.bottom,
        height: r.height
      });
    }
    if (items.length < 2) return;
    items.sort((a, b) => a.top - b.top || a.id.localeCompare(b.id));
    // Bottom-up: keep lower tip, push overlapping upper tips further up.
    for (let i = items.length - 2; i >= 0; i--) {
      const below = items[i + 1];
      const cur = items[i];
      if (cur.bottom + gap <= below.top) continue;
      const top = Math.max(12, below.top - gap - cur.height);
      cur.bubble.style.top = `${Math.round(top)}px`;
      const nr = cur.bubble.getBoundingClientRect();
      cur.top = nr.top;
      cur.bottom = nr.bottom;
      cur.height = nr.height;
    }
  }

  /**
   * 窄屏 Idle/park：open tip 与主球带相交则上抬。多条同时抬升时**堆叠**错开，
   * 禁止全部落到同一 `cta.top - height`（会抵消 `_separateOpenRemedyBubbles`）。
   * @returns {void}
   */
  _liftBubblesAboveNarrowHomeCtas() {
    if (
      !document.body.classList.contains('ft-narrow-idle') &&
      !document.body.classList.contains('ft-narrow-park')
    ) {
      return;
    }
    const cta = document.getElementById('ft-narrow-home-ctas');
    const cr = cta?.getBoundingClientRect?.();
    if (!cr || cr.width <= 0 || cr.height <= 0) return;
    const gap = 12;
    /** @type {import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble[]} */
    const needLift = [];
    for (const id of this._visibleIds) {
      const bubble = this._bubbles.get(id);
      if (!bubble || !bubble.open) continue;
      const r = bubble.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const overlaps =
        r.left < cr.right &&
        r.right > cr.left &&
        r.top < cr.bottom &&
        r.bottom > cr.top;
      if (overlaps) needLift.push(bubble);
    }
    if (needLift.length === 0) return;
    // Bottom tip stays closest to the balls; others stack upward.
    needLift.sort(
      (a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top
    );
    let ceiling = cr.top - gap;
    for (const bubble of needLift) {
      const r = bubble.getBoundingClientRect();
      const top = Math.max(12, ceiling - r.height);
      bubble.style.top = `${Math.round(top)}px`;
      bubble.tip = 'bottom';
      ceiling = top - gap;
    }
  }


  dispose() {
    this._unsubLocale();
    window.removeEventListener('resize', this._onReposition);
    window.removeEventListener('scroll', this._onReposition, true);
    if (this._onDocPointer) {
      document.removeEventListener('pointerdown', this._onDocPointer, true);
    }
    if (this._onDocPointerDown) {
      document.removeEventListener('pointerdown', this._onDocPointerDown, true);
    }
    for (const timer of this._hideTimers.values()) window.clearTimeout(timer);
    this._hideTimers.clear();
    for (const bubble of this._bubbles.values()) bubble.remove();
    this._bubbles.clear();
    for (const badge of this._badges.values()) badge.remove();
    this._badges.clear();
    this._badgeIds.clear();
    this._clickExpandedIds.clear();
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
          else if (this._clickExpandedIds.has(hintId)) this._collapseClickHint(hintId);
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

  /**
   * @param {string} hintId
   */
  _showClickBadge(hintId) {
    if (!isClickTriggerHint(hintId)) return;
    if (this.store.isSeen(hintId)) return;
    if (this._remedyIds.size > 0) return;

    const badge = this._ensureBadge(hintId);
    this._badgeIds.add(hintId);
    badge.hidden = false;
    this._syncBadgeAria(hintId);
    this._positionBadge(hintId);
  }

  /**
   * @param {string} hintId
   */
  _hideClickBadge(hintId) {
    const badge = this._badges.get(hintId);
    if (badge) badge.hidden = true;
    this._badgeIds.delete(hintId);
  }

  /**
   * @param {string} hintId
   * @returns {HTMLElement}
   */
  _ensureBadge(hintId) {
    let badge = this._badges.get(hintId);
    if (badge) return badge;

    badge = document.createElement(NOTIFICATION_BADGE_TAG);
    badge.className = 'onboarding-hint-badge';
    badge.setAttribute('tone', 'hint');
    badge.setAttribute('pulse', 'loop');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'button');
    badge.dataset.hintId = hintId;
    badge.hidden = true;

    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._toggleClickHint(hintId);
    };
    badge.addEventListener('click', activate);
    badge.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });

    this.mountRoot.appendChild(badge);
    this._badges.set(hintId, badge);
    return badge;
  }

  /**
   * @param {string} hintId
   */
  _syncBadgeAria(hintId) {
    const badge = this._badges.get(hintId);
    if (!badge) return;
    badge.setAttribute('aria-label', t('HINT_BADGE_ARIA'));
    badge.setAttribute('aria-expanded', this._clickExpandedIds.has(hintId) ? 'true' : 'false');
  }

  /**
   * @param {string} hintId
   */
  _toggleClickHint(hintId) {
    if (this.store.isSeen(hintId)) {
      this._hideClickBadge(hintId);
      return;
    }
    if (this._clickExpandedIds.has(hintId) && this._visibleIds.has(hintId)) {
      this._collapseClickHint(hintId);
      return;
    }
    this._expandClickHint(hintId);
  }

  /**
   * @param {string} hintId
   */
  _expandClickHint(hintId) {
    for (const id of [...this._clickExpandedIds]) {
      if (id !== hintId) this._collapseClickHint(id);
    }
    const otherAutos = [...this._visibleIds].filter(
      (id) =>
        id !== hintId &&
        !this._remedyIds.has(id) &&
        getHintTriggerMode(id) === 'auto'
    );
    for (const id of otherAutos) this.hideBubble(id);

    this._clickExpandedIds.add(hintId);
    this._paint(hintId, { remedy: false });
    this._syncBadgeAria(hintId);
  }

  /**
   * 收起 click 气泡但不记已读（圆点保留）。
   * @param {string} hintId
   */
  _collapseClickHint(hintId) {
    this._clickExpandedIds.delete(hintId);
    window.clearTimeout(this._hideTimers.get(hintId));
    this._hideTimers.delete(hintId);
    const bubble = this._bubbles.get(hintId);
    if (bubble) {
      bubble.open = false;
      bubble.message = '';
    }
    this._visibleIds.delete(hintId);
    this._paintMeta.delete(hintId);
    if (!this.store.isSeen(hintId) && this._lastAutoWant.includes(hintId)) {
      this._showClickBadge(hintId);
    }
    this._syncBadgeAria(hintId);
    this._promoteNextAuto();
  }

  /**
   * @param {PointerEvent} event
   */
  _handleOutsidePointer(event) {
    if (this._clickExpandedIds.size === 0) return;
    const target = /** @type {Node | null} */ (event.target);
    for (const hintId of [...this._clickExpandedIds]) {
      const bubble = this._bubbles.get(hintId);
      const badge = this._badges.get(hintId);
      if (target && bubble?.contains(target)) continue;
      if (target && badge?.contains(target)) continue;
      // Lit shadow: composedPath may include bubble host
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      if (bubble && path.includes(bubble)) continue;
      if (badge && path.includes(badge)) continue;
      this._collapseClickHint(hintId);
    }
  }

  /**
   * @param {string} hintId
   */
  _positionBadge(hintId) {
    const badge = this._badges.get(hintId);
    if (!badge || badge.hidden) return;

    const cfg = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    const anchor = resolveAnchorEl(cfg.selector);
    if (!anchor) {
      badge.hidden = true;
      return;
    }

    const ar = anchor.getBoundingClientRect();
    const size = 10;
    let left = ar.right - size / 2;
    let top = ar.top - size / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - size - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - size - 8));
    badge.style.left = `${Math.round(left)}px`;
    badge.style.top = `${Math.round(top)}px`;
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

    // Basic rule: no visible control → no tip (never park a tip over empty canvas).
    if (!anchor) {
      this.hideBubble(hintId);
      return;
    }

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

    {
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
      document.body.classList.contains('ft-narrow-park')
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

    const ar = anchor.getBoundingClientRect();
    const tipX = Math.max(18, Math.min(ar.left + ar.width / 2 - left, br.width - 18));
    const tipY = Math.max(18, Math.min(ar.top + ar.height / 2 - top, br.height - 18));
    bubble.tipX = `${Math.round(tipX)}px`;
    bubble.tipY = `${Math.round(tipY)}px`;

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
      .onboarding-hint-badge {
        position: fixed;
        z-index: 27;
        width: 10px;
        height: 10px;
        padding: 4px;
        margin: -4px;
        box-sizing: content-box;
        cursor: pointer;
        border: 0;
        background: transparent;
      }
      .onboarding-hint-badge[hidden] {
        display: none !important;
      }
      .onboarding-hint-badge:focus-visible {
        outline: 2px solid #5c7a6c;
        outline-offset: 2px;
        border-radius: 50%;
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
