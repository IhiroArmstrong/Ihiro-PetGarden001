/**
 * Hint 产品面（2026-08-04 收窄）：只保留两件事——
 * 1) 薄荷绿脉冲点悬停 → 看该条 tip；指针离开 → 立刻收起
 * 2) 「?」点击或悬停 → 只出产品简介卡（`#onboarding-app-purpose`），绝不喷本页其它 tips
 * 不再：自动 tip 喷洒、点「?」补救铺开、More tips 芯片。
 * @see ONBOARDING_HINTS.md
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  HINT_LOCALE_KEYS,
  createHintsSeenStore
} from '../core/OnboardingHintsStore.js';
import {
  getHintTriggerMode,
  getHintTier,
  isClickTriggerHint,
  isDetailedHint
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
import { PRIVACY_SHEET_BODY_KEYS } from './privacyNoticeCopy.js';
import {
  SECONDARY_PROXY_HINT_IDS,
  secondaryProxyForHintId,
  syncSecondaryMenuHintDot
} from '../core/idleChromeOrchestration.js';

if (!customElements.get(NOTIFICATION_BADGE_TAG)) {
  customElements.define(NOTIFICATION_BADGE_TAG, NotificationBadge);
}

/** Desktop: bridge gap between ? and purpose card so links stay clickable. */
export const PURPOSE_HOVER_HIDE_GRACE_MS = 280;

/** Home left ball keeps native title; no mint pulse (2026-08-11). */
const NO_MINT_PULSE_HINT_IDS = new Set(['quick-start']);

const HINT_ANCHORS = ONBOARDING_HINT_ANCHORS;

/** Wide Idle parks these into ⋯ — remap hints to the more button when parked. */
const WIDE_PARKED_ANCHOR_RE =
  /honesty-idle-entry|micro-ritual-idle-entry|session-start-dock__hint|ambient-soundscape__fab|reminder-preference-toggle/;

/** Narrow Idle parks legacy chrome off-canvas — remap to ActionBar / grabber. */
const NARROW_PARKED_ANCHOR_RE =
  /btn-focus|session-start-dock|arrival-practice|weekly-practice|micro-ritual|honesty-idle|ambient-soundscape__mute|ambient-soundscape__fab|ambient-soundscape__focus-chrome|ambient-soundscape__nudge|reminder-preference|quick-start|focus-hud|onboarding-hint-help/;

/** Click hints that paint mint on a host control (⋯ rows / note) — no floating badge. */
const HOST_MINT_HINT_IDS = new Set(['ambient-soundscape']);

/**
 * Markers standing in for chrome hidden inside ⋯ / the drawer. They describe what
 * is *not* on screen, so they stay folded behind the chip even though their own
 * anchor (⋯ / grabber) is visible.
 */
const FOLDED_MENU_HINT_IDS = new Set(['wide-more-menu', 'narrow-drawer-menu']);

/**
 * @param {string} selectorList
 * @param {{ hintId?: string | null }} [opts]
 *   When `hintId` is set, ⋯/drawer proxy remap only applies if that hint
 *   owns the row (SECONDARY_PROXY_HINT_IDS). Stops sit / companion-mode tips
 *   from stealing menu-row anchors (2026-08-01 误绑).
 */
function resolveAnchorEl(selectorList, { hintId = null } = {}) {
  const widePark = document.body.classList.contains('ft-wide-park-secondary');
  const wideMenuOpen = document.body.classList.contains('ft-wide-more-open');
  const narrowPark = document.body.classList.contains('ft-narrow-park');
  const narrowDrawerOpen = Boolean(
    document.querySelector('.ft-narrow-idle-shell.is-sheet-open')
  );
  const ownedProxy = hintId ? secondaryProxyForHintId(hintId) : null;
  for (const sel of String(selectorList)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (widePark && wideMenuOpen) {
      const proxy = wideMenuProxyForSelector(sel);
      if (proxy && (!hintId || ownedProxy === proxy)) {
        const el = document.querySelector(
          `#ft-wide-more-menu [data-proxy="${proxy}"]`
        );
        if (el && el.getClientRects().length > 0) return el;
      }
    }
    if (widePark && !wideMenuOpen && WIDE_PARKED_ANCHOR_RE.test(sel)) {
      const more = document.getElementById('ft-wide-more-btn');
      if (more && !more.hidden && more.getClientRects().length > 0) return more;
    }
    if (narrowPark && narrowDrawerOpen) {
      const proxy = narrowDrawerProxyForSelector(sel);
      if (proxy && (!hintId || ownedProxy === proxy)) {
        const el = document.querySelector(
          `#ft-narrow-options-drawer [data-proxy="${proxy}"]`
        );
        if (el && el.getClientRects().length > 0) return el;
      }
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

function wideMenuProxyForSelector(sel) {
  if (/honesty-idle/.test(sel)) return 'honesty';
  if (/micro-ritual/.test(sel)) return 'breath';
  if (/session-start-dock__hint/.test(sel)) return 'companion';
  if (/reminder-preference/.test(sel)) return 'reminder';
  return null;
}

function narrowDrawerProxyForSelector(sel) {
  if (/micro-ritual/.test(sel)) return 'breath';
  if (/session-start-dock__hint/.test(sel)) return 'companion';
  if (/reminder-preference/.test(sel)) return 'reminder';
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
  // HINT_ANCHORS.notice is `#arrival-practice, #btn-focus`. The btn-focus branch
  // below must not win — during Arrival the Sit ball is hidden, which would
  // hideBubble the Notice tip (full e2e #15 stable red).
  if (/arrival-practice/.test(sel)) {
    return {
      selector: '#arrival-practice',
      placement: anchorCfg.placement || 'above',
      tip: anchorCfg.tip || 'bottom'
    };
  }
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
        selector: '#ft-narrow-home-quickstart',
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

/**
 * Wide Idle parks Sit/⚡ pills — remap primary tips to visible home balls.
 * @param {{ selector: string, placement: string, tip: string }} anchorCfg
 */
function remapWideIdleHintAnchor(anchorCfg) {
  const sel = String(anchorCfg.selector || '');
  // Same Arrival guard as narrow remap (comma-listed #btn-focus fallback).
  if (/arrival-practice/.test(sel)) {
    return {
      selector: '#arrival-practice',
      placement: anchorCfg.placement || 'above',
      tip: anchorCfg.tip || 'bottom'
    };
  }
  if (/#btn-focus|btn-focus/.test(sel)) {
    return {
      selector: '#ft-wide-home-sit',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (/quick-start/.test(sel)) {
    return {
      selector: '#ft-wide-home-quickstart',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (/micro-ritual/.test(sel)) {
    // Breath practice is the home left ball (ex-Quick Start), not a ⋯ row.
    return {
      selector: '#ft-wide-home-quickstart',
      placement: 'above',
      tip: 'bottom'
    };
  }
  if (/honesty-idle/.test(sel)) {
    return {
      selector: '#ft-wide-home-honesty',
      placement: 'above',
      tip: 'bottom'
    };
  }
  return anchorCfg;
}

/**
 * Resolve paint/visibility anchor the same way bubbles do (wide/narrow park remaps).
 * @param {{ selector: string, placement?: string, tip?: string }} cfg
 * @param {{ useHelpAnchor?: boolean }} [opts]
 */
function resolveParkAwareAnchorCfg(cfg, { useHelpAnchor = false } = {}) {
  let anchorCfg = { ...cfg };
  if (
    document.body.classList.contains('ft-narrow-park') ||
    document.body.classList.contains('ft-narrow-idle')
  ) {
    anchorCfg = remapNarrowIdleHintAnchor(anchorCfg, useHelpAnchor);
  } else if (document.body.classList.contains('ft-wide-park-secondary')) {
    anchorCfg = remapWideIdleHintAnchor(anchorCfg);
  }
  return anchorCfg;
}

/** 桌面精细指针：悬停 = 预览 */
function canHoverPreview() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );
}

export class OnboardingHintsUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [options]
   * @param {ReturnType<typeof createHintsSeenStore>} [options.store]
   * @param {() => object} [options.getScene]
   * @param {() => void} [options.onOpenFiveMoments]
   */
  constructor(
    mountRoot,
    {
      store = createHintsSeenStore(),
      getScene = () => ({}),
      onOpenFiveMoments = null
    } = {}
  ) {
    this.store = store;
    this.getScene = getScene;
    this.onOpenFiveMoments = onOpenFiveMoments;
    this.mountRoot = mountRoot;
    /** @type {Map<string, import('./ft-onboarding-hint-bubble.js').FtOnboardingHintBubble>} */
    this._bubbles = new Map();
    /** @type {Map<string, HTMLElement>} */
    this._badges = new Map();
    /** @type {Set<string>} */
    this._visibleIds = new Set();
    /** @type {Set<string>} */
    this._badgeIds = new Set();
    /** @type {Set<string>} */
    this._clickExpandedIds = new Set();
    /** @type {Map<string, ReturnType<typeof setTimeout>>} */
    this._hideTimers = new Map();
    /** @type {Set<string>} */
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
    /** Purpose card opened by ? hover (leave ? / card → hide). Click pins until dismiss. */
    this._purposeFromHover = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._purposeHoverHideTimer = null;

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
      this.openPurposeOnly({ markHelpDone: true });
    });

    // 收纳进左下热力簇（若已建），避免角落散落；窄屏 park 只认簇即可
    const cluster = document.getElementById('weekly-practice-heatmap-cluster');
    if (cluster) {
      cluster.appendChild(this.helpBtn);
    } else {
      mountRoot.append(this.helpBtn);
    }
    this._ensurePurposeCard();
    this._injectHelpStyles();
    this._bindHelpPurposeHover(this.helpBtn);
    this.syncDiscoveryDots();
    this._onReposition = () => this.repositionAll();
    this._onDocPointerDown = (event) => this._handleOutsidePointer(event);
    window.addEventListener('resize', this._onReposition);
    window.addEventListener('scroll', this._onReposition, true);
    document.addEventListener('pointerdown', this._onDocPointerDown, true);

    this._unsubLocale = onLocaleChange(() => {
      this.helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
      this._refreshPurposeCardCopy();
      this._refreshPrivacySheetCopy();
      for (const hintId of this._visibleIds) {
        const meta = this._paintMeta.get(hintId) || { remedy: false, anchorNearHelp: false };
        this._paint(hintId, meta);
      }
      this.syncDiscoveryDots();
      for (const hintId of this._badgeIds) {
        this._syncBadgeChrome(hintId);
      }
    });

    // 产品简介卡：点框外空白收起（不再有补救 tip 喷洒）
    this._onDocPointer = (event) => {
      const purposeOpen = Boolean(this.purposeCard && !this.purposeCard.hidden);
      if (!purposeOpen) return;
      const el = /** @type {Element | null} */ (
        event.target instanceof Element ? event.target : event.target?.parentElement
      );
      if (!el) return;
      if (this.helpBtn.contains(el)) return;
      if (el.closest('#ft-narrow-help-btn')) return;
      if (this.purposeCard?.contains(el)) return;
      this._hidePurposeCard();
      this._purposeFromHover = false;
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);
  }

  /**
   * 「?」唯一动作：产品简介。绝不铺本页其它 Hints。
   * @param {{ markHelpDone?: boolean }} [opts]
   * @returns {void}
   */
  openPurposeOnly({ markHelpDone = false } = {}) {
    this._cancelPurposeHoverHide();
    this._dismissAllPageHints();
    if (markHelpDone) {
      this._purposeFromHover = false;
      this.markSeen('help-affordance');
    }
    this._showPurposeCard();
  }

  /**
   * Hide every tip bubble / remedy / catalog — leave mint dots alone.
   * @returns {void}
   */
  _dismissAllPageHints() {
    this._hideCatalogChip();
    for (const id of [...this._remedyIds]) this.hideBubble(id);
    this._remedyIds.clear();
    this._catalogPending = [];
    this._remedyPrimaryId = null;
    this._catalogShownId = null;
    for (const id of [...this._clickExpandedIds]) {
      this._collapseClickHint(id, { acknowledgeSimple: false });
    }
    for (const id of [...this._visibleIds]) {
      this.hideBubble(id);
    }
  }

  /**
   * Desktop: hover ? → purpose card; leave ? / card → hide after grace
   * (unless click-pinned). Grace lets the pointer cross the 14px gap and
   * reach in-card links (The five moments / Privacy).
   * @param {Element | null} host
   * @returns {void}
   */
  _bindHelpPurposeHover(host) {
    const el = /** @type {HTMLElement | null} */ (host);
    if (!el) return;
    if (el.dataset.ftHelpPurposeBound === '1') return;
    el.dataset.ftHelpPurposeBound = '1';

    el.addEventListener('pointerenter', () => {
      if (!canHoverPreview()) return;
      this._cancelPurposeHoverHide();
      this._purposeFromHover = true;
      this.openPurposeOnly({ markHelpDone: false });
    });
    el.addEventListener('pointerleave', (event) => {
      if (!canHoverPreview()) return;
      if (!this._purposeFromHover) return;
      const related = /** @type {Node | null} */ (event.relatedTarget);
      if (related && this.purposeCard?.contains(related)) return;
      if (related && this.helpBtn.contains(related)) return;
      const narrow = document.getElementById('ft-narrow-help-btn');
      if (related && narrow?.contains(related)) return;
      this._schedulePurposeHoverHide();
    });
  }

  _cancelPurposeHoverHide() {
    if (this._purposeHoverHideTimer != null) {
      clearTimeout(this._purposeHoverHideTimer);
      this._purposeHoverHideTimer = null;
    }
  }

  _schedulePurposeHoverHide() {
    this._cancelPurposeHoverHide();
    this._purposeHoverHideTimer = setTimeout(() => {
      this._purposeHoverHideTimer = null;
      if (!this._purposeFromHover) return;
      this._hidePurposeCard();
    }, PURPOSE_HOVER_HIDE_GRACE_MS);
  }

  /**
   * @param {string} hintId
   * @returns {boolean}
   */
  maybeShowAuto(hintId) {
    if (!HINT_LOCALE_KEYS[hintId]) return false;
    if (this._remedyIds.size > 0) return false;

    const mode = getHintTriggerMode(hintId);
    if (mode === 'manual' || mode === 'legacy') return false;

    // 2026-08-04：取消自动 tip 喷洒；只保留脉冲点（click）+「?」简介
    if (mode === 'auto') return false;

    if (mode === 'click') {
      // 「?」自身不走 tip 气泡——悬停/点击只出产品简介
      if (hintId === 'help-affordance') return false;
      // Left home ball: residual title only — no mint pulse.
      if (NO_MINT_PULSE_HINT_IDS.has(hintId)) return false;
      if (this.store.isDone(hintId)) return false;
      this._showClickBadge(hintId);
      return true;
    }

    return false;
  }

  /**
   * @param {string[]} hintIds
   * @returns {void}
   */
  syncVisibleAutos(hintIds) {
    // click：!done（含 peeked 静止圆点）；auto 不再自动出气泡
    const want = hintIds.filter(
      (id) => HINT_LOCALE_KEYS[id] && !this.store.isDone(id)
    );
    this._lastAutoWant = want;

    const clickWant = want.filter(
      (id) =>
        isClickTriggerHint(id) &&
        id !== 'help-affordance' &&
        !NO_MINT_PULSE_HINT_IDS.has(id)
    );

    // 清掉仍挂着的 auto / 非悬停 tip（补救已废）
    for (const id of [...this._visibleIds]) {
      if (this._clickExpandedIds.has(id)) continue;
      this.hideBubble(id);
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

  _promoteNextAuto() {
    // 自动 tip 已关闭：悬停收起后不再串行弹出下一条
  }

  /**
   * 完全完成（操作完成 / 进详情）：圆点移除。
   * @param {string} hintId
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

  /**
   * Soft blue dots on unread Quick Start / Focusing HUD chrome.
   * Also rebinds narrow ActionBar「?」hover → purpose only.
   */
  syncDiscoveryDots() {
    syncAllDiscoveryDots(this.store);
    this._syncHostMintDots();
    this._syncSecondaryMenuHostMints();
    this._syncPulseOwnedNativeTips();
    this._bindHelpPurposeHover(document.getElementById('ft-narrow-help-btn'));
  }

  /**
   * When a mint pulse tip already covers a control, suppress duplicate native /
   * built-in hover copy (title attribute, streak-meter .label). If the pulse is
   * gone (done), restore the residual hover so the control is not mute.
   * @returns {void}
   */
  _syncPulseOwnedNativeTips() {
    const streakUnread =
      isClickTriggerHint('focus-hud-streak') &&
      !this.store.isDone('focus-hud-streak');
    const streak = document.querySelector(
      '#focus-hud streak-meter, streak-meter'
    );
    if (streak) {
      if (streakUnread) streak.setAttribute('pulse-owns-tip', '');
      else streak.removeAttribute('pulse-owns-tip');
      // Native title always duplicated .label / pulse tip — keep aria-label only.
      streak.removeAttribute('title');
    }

    const quickUnread =
      isClickTriggerHint('quick-start') && !this.store.isDone('quick-start');
    for (const sel of [
      '#quick-start-focus',
      '#ft-wide-home-quickstart',
      '#ft-narrow-home-quickstart'
    ]) {
      const el = /** @type {HTMLElement | null} */ (document.querySelector(sel));
      if (!el) continue;
      if (quickUnread) {
        if (el.title && !el.dataset.ftNativeTitleBackup) {
          el.dataset.ftNativeTitleBackup = el.title;
        }
        el.removeAttribute('title');
      } else if (el.dataset.ftNativeTitleBackup) {
        el.title = el.dataset.ftNativeTitleBackup;
        delete el.dataset.ftNativeTitleBackup;
      }
    }

    // Ambient note: mint pulse owns first-visit tip; residual hover after done
    // uses native `title` (AMBIENT_NOTE_HOVER) once pulse is cleared.
    const ambientUnread =
      isClickTriggerHint('ambient-soundscape') &&
      !this.store.isDone('ambient-soundscape');
    for (const sel of ['.ambient-soundscape__mute', '#ft-narrow-mute-btn']) {
      const el = /** @type {HTMLElement | null} */ (document.querySelector(sel));
      if (!el) continue;
      if (ambientUnread) {
        if (el.title && !el.dataset.ftNativeTitleBackup) {
          el.dataset.ftNativeTitleBackup = el.title;
        }
        el.removeAttribute('title');
      } else if (el.dataset.ftNativeTitleBackup) {
        el.title = el.dataset.ftNativeTitleBackup;
        delete el.dataset.ftNativeTitleBackup;
      }
    }
  }

  /**
   * Mint on note / ActionBar ♪ (same #6db3a0 host pattern as ⋯ menu).
   * Floating badge for ambient-soundscape is skipped — edge-clipped + too dim vs menu.
   */
  _syncHostMintDots() {
    const show =
      this._remedyIds.size === 0 && !this.store.isDone('ambient-soundscape');
    const mute = document.querySelector('.ambient-soundscape__mute');
    if (mute) mute.classList.toggle('has-hint-mint', show);
    syncSecondaryMenuHintDot(mute, show);
    const narrowMute = document.getElementById('ft-narrow-mute-btn');
    syncSecondaryMenuHintDot(narrowMute, show);
    this._bindHostMintHover(mute, 'ambient-soundscape');
    this._bindHostMintHover(narrowMute, 'ambient-soundscape');
  }

  /**
   * When ⋯ / drawer is open, click hints that own a row already have
   * `.ft-secondary-menu-hint-dot` — do not also paint a floating badge
   * (double mint / ghost pulse; 2026-08-01/02). Re-bind hover preview on rows.
   */
  _syncSecondaryMenuHostMints() {
    if (this._remedyIds.size > 0) return;
    for (const hintId of Object.values(SECONDARY_PROXY_HINT_IDS)) {
      if (!isClickTriggerHint(hintId)) continue;
      if (this.store.isDone(hintId)) continue;
      const host = this._secondaryMenuHostForHint(hintId);
      if (!host) continue;
      this._hideClickBadge(hintId);
      this._bindHostMintHover(host, hintId);
    }
  }

  /**
   * @param {string} hintId
   * @returns {HTMLElement | null}
   */
  _secondaryMenuHostForHint(hintId) {
    const proxy = secondaryProxyForHintId(hintId);
    if (!proxy) return null;
    const wideOpen = document.body.classList.contains('ft-wide-more-open');
    if (wideOpen) {
      return /** @type {HTMLElement | null} */ (
        document.querySelector(`#ft-wide-more-menu [data-proxy="${proxy}"]`)
      );
    }
    const narrowOpen = Boolean(
      document.querySelector('.ft-narrow-idle-shell.is-sheet-open')
    );
    if (narrowOpen) {
      return /** @type {HTMLElement | null} */ (
        document.querySelector(
          `#ft-narrow-options-drawer [data-proxy="${proxy}"]`
        )
      );
    }
    return null;
  }

  /**
   * Desktop hover preview for host-carried mint (note / ⋯·drawer rows).
   * Floating badge handlers never reach these hosts.
   * @param {Element | null} host
   * @param {string} hintId
   */
  _bindHostMintHover(host, hintId) {
    const el = /** @type {HTMLElement | null} */ (host);
    if (!el || !hintId) return;
    if (
      el.dataset.ftMintHoverBound === '1' &&
      el.dataset.ftMintHoverHint === hintId
    ) {
      return;
    }
    el.dataset.ftMintHoverBound = '1';
    el.dataset.ftMintHoverHint = hintId;

    el.addEventListener('pointerenter', () => {
      if (!canHoverPreview()) return;
      if (this.store.isDone(hintId)) return;
      if (this._remedyIds.size > 0) return;
      if (
        hintId === 'ambient-soundscape' &&
        this._isSoundscapePanelOpen()
      ) {
        return;
      }
      this._expandClickHint(hintId);
    });
    el.addEventListener('pointerleave', (event) => {
      if (!canHoverPreview()) return;
      const related = /** @type {Node | null} */ (event.relatedTarget);
      const bubble = this._bubbles.get(hintId);
      if (related && bubble?.contains(related)) return;
      this._collapseClickHint(hintId, { acknowledgeSimple: true });
    });
  }

  /** @returns {boolean} */
  _isSoundscapePanelOpen() {
    const panel = document.querySelector('.ambient-soundscape__panel');
    return Boolean(
      panel && !(/** @type {HTMLElement} */ (panel).hidden) &&
        panel.getClientRects().length > 0
    );
  }

  /**
   * Expand a click tip without requiring the floating mint badge
   * (used when opening Soundscape from the note).
   * @param {string} hintId
   */
  revealClickHint(hintId) {
    if (!isClickTriggerHint(hintId) || this.store.isDone(hintId)) return;
    if (this._remedyIds.size > 0) return;
    this._expandClickHint(hintId);
  }

  /**
   * simple：看过文案 → peeked + 静止弱化圆点。
   * @param {string} hintId
   */
  markPeeked(hintId) {
    if (getHintTier(hintId) !== 'simple') return;
    this.store.markPeeked(hintId);
    this._syncBadgeChrome(hintId);
  }

  /**
   * Does this hint point at a control the user can actually see right now?
   * Checks the literal anchors, not the ⋯ / drawer remap, so parked chrome stays
   * folded instead of masquerading as on-screen.
   * @param {string} hintId
   * @returns {boolean}
   */
  _hasOnScreenAnchor(hintId) {
    if (FOLDED_MENU_HINT_IDS.has(hintId)) return false;
    const raw = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    const anchorCfg = resolveParkAwareAnchorCfg({
      selector: String(raw.selector || ''),
      placement: raw.placement,
      tip: raw.tip
    });
    const selectors = String(anchorCfg.selector || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const sel of selectors) {
      let el = null;
      try {
        el = document.querySelector(sel);
      } catch {
        el = null;
      }
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      if (r.bottom <= 0 || r.right <= 0) continue;
      if (r.top >= window.innerHeight || r.left >= window.innerWidth) continue;
      return true;
    }
    return false;
  }

  /**
   * Legacy API name：点「?」曾铺开补救 tips。现仅打开产品简介，绝不喷本页其它 Hints。
   * @returns {void}
   */
  showRemedy() {
    this.openPurposeOnly({ markHelpDone: true });
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
   * 展开补救目录：一次只画下一条（替换上一条目录 tip，保留主条与可见锚点条）。
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
   * @param {string} [hintId]
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
      bubble.actionLabel = '';
      // Drop id so e2e/querySelector for "active tip" do not match closed shells.
      delete bubble.dataset.hintId;
      bubble.removeAttribute('data-hint-id');
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
    bubble.actionLabel =
      !remedy && isDetailedHint(hintId) ? t('HINT_DETAIL_CTA') : '';
    bubble.dataset.hintId = hintId;
    bubble.dataset.remedy = remedy ? '1' : '0';
    bubble.dataset.remedyAnchor = anchorNearHelp ? 'help' : '';
    bubble.setAttribute(
      'aria-label',
      bubble.actionLabel
        ? `${message}. ${bubble.actionLabel}`
        : `${message}. ${t('HINT_DISMISS_ARIA')}`
    );
    bubble.title = bubble.actionLabel || t('HINT_DISMISS_ARIA');
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
          else if (this._clickExpandedIds.has(hintId)) {
            this._collapseClickHint(hintId, { fromTimeout: true });
          }
        },
        remedy ? 8000 : 14000
      )
    );
  }

  /**
   * @param {string} hintId
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
    bubble.addEventListener('ft-hint-action', () => {
      this._openDetailedHint(hintId);
    });
    this.mountRoot.appendChild(bubble);
    this._bubbles.set(hintId, bubble);
    return bubble;
  }

  /**
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
    if (isClickTriggerHint(hintId)) {
      this._collapseClickHint(hintId, { acknowledgeSimple: true });
      return;
    }
    this.markSeen(hintId);
    this._promoteNextAuto();
  }

  /**
   * detailed：进详情页 → done。
   * @param {string} hintId
   */
  _openDetailedHint(hintId) {
    if (!isDetailedHint(hintId)) return;
    this._collapseClickHint(hintId, { acknowledgeSimple: false });
    this.markSeen(hintId);
    this._showPurposeCard();
  }

  /**
   * @param {string} hintId
   */
  _showClickBadge(hintId) {
    if (!isClickTriggerHint(hintId)) return;
    if (this.store.isDone(hintId)) return;
    if (this._remedyIds.size > 0) return;

    if (HOST_MINT_HINT_IDS.has(hintId)) {
      this._syncHostMintDots();
      return;
    }

    // ⋯ / drawer row already shows `.ft-secondary-menu-hint-dot` — skip floating
    // badge so each unread row has one mint, not two (ghost pulse).
    const menuHost = this._secondaryMenuHostForHint(hintId);
    if (menuHost) {
      this._hideClickBadge(hintId);
      this._bindHostMintHover(menuHost, hintId);
      return;
    }

    const badge = this._ensureBadge(hintId);
    this._badgeIds.add(hintId);
    badge.hidden = false;
    this._syncBadgeChrome(hintId);
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
   */
  _syncBadgeChrome(hintId) {
    const badge = this._badges.get(hintId);
    if (!badge) return;
    const peeked = this.store.isPeeked(hintId) && getHintTier(hintId) === 'simple';
    if (peeked) {
      badge.setAttribute('state', 'static');
      badge.removeAttribute('pulse');
      badge.setAttribute('aria-label', t('HINT_BADGE_PEEKED_ARIA'));
    } else {
      badge.removeAttribute('state');
      badge.setAttribute('pulse', 'loop');
      badge.setAttribute('aria-label', t('HINT_BADGE_ARIA'));
    }
    badge.setAttribute(
      'aria-expanded',
      this._clickExpandedIds.has(hintId) ? 'true' : 'false'
    );
    badge.dataset.ack = this.store.getAck(hintId) || 'unread';
  }

  /**
   * @param {string} hintId
   */
  _ensureBadge(hintId) {
    let badge = this._badges.get(hintId);
    if (badge) return badge;

    badge = document.createElement(NOTIFICATION_BADGE_TAG);
    badge.className = 'onboarding-hint-badge';
    badge.setAttribute('tone', 'hint');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('role', 'button');
    badge.dataset.hintId = hintId;
    badge.hidden = true;

    badge.addEventListener('pointerenter', () => {
      if (!canHoverPreview()) return;
      if (this.store.isDone(hintId)) return;
      this._expandClickHint(hintId);
    });
    badge.addEventListener('pointerleave', (event) => {
      if (!canHoverPreview()) return;
      const related = /** @type {Node | null} */ (event.relatedTarget);
      const bubble = this._bubbles.get(hintId);
      if (related && bubble?.contains(related)) return;
      this._collapseClickHint(hintId, { acknowledgeSimple: true });
    });
    badge.addEventListener('focus', () => {
      if (this.store.isDone(hintId)) return;
      this._expandClickHint(hintId);
    });
    badge.addEventListener('blur', (event) => {
      const related = /** @type {Node | null} */ (event.relatedTarget);
      const bubble = this._bubbles.get(hintId);
      if (related && (badge.contains(related) || bubble?.contains(related))) return;
      // detailed：失焦只关预览，仍脉冲；simple：peeked
      this._collapseClickHint(hintId, {
        acknowledgeSimple: getHintTier(hintId) === 'simple'
      });
    });
    badge.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._onBadgeActivate(hintId);
    });
    badge.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        this._onBadgeActivate(hintId);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this._collapseClickHint(hintId, {
          acknowledgeSimple: getHintTier(hintId) === 'simple'
        });
      }
    });

    this.mountRoot.appendChild(badge);
    this._badges.set(hintId, badge);
    return badge;
  }

  /**
   * 触屏点圆点 = 预览；detailed 已展开时再点 / Enter = 进详情。
   * @param {string} hintId
   */
  _onBadgeActivate(hintId) {
    if (this.store.isDone(hintId)) {
      this._hideClickBadge(hintId);
      return;
    }
    if (isDetailedHint(hintId) && this._clickExpandedIds.has(hintId)) {
      this._openDetailedHint(hintId);
      return;
    }
    if (this._clickExpandedIds.has(hintId) && this._visibleIds.has(hintId)) {
      this._collapseClickHint(hintId, { acknowledgeSimple: true });
      return;
    }
    this._expandClickHint(hintId);
  }

  /**
   * @param {string} hintId
   */
  _expandClickHint(hintId) {
    if (hintId === 'help-affordance') {
      this.openPurposeOnly({ markHelpDone: false });
      return;
    }
    if (this.store.isDone(hintId)) return;
    // Purpose card open → no page tips
    if (this.purposeCard && !this.purposeCard.hidden) {
      this._hidePurposeCard();
      this._purposeFromHover = false;
    }
    for (const id of [...this._clickExpandedIds]) {
      if (id !== hintId) {
        this._collapseClickHint(id, {
          acknowledgeSimple: getHintTier(id) === 'simple'
        });
      }
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
    this._syncBadgeChrome(hintId);
  }

  /**
   * @param {string} hintId
   * @param {{ acknowledgeSimple?: boolean, fromTimeout?: boolean }} [opts]
   */
  _collapseClickHint(hintId, { acknowledgeSimple = false, fromTimeout = false } = {}) {
    const wasExpanded = this._clickExpandedIds.has(hintId);
    this._clickExpandedIds.delete(hintId);
    window.clearTimeout(this._hideTimers.get(hintId));
    this._hideTimers.delete(hintId);
    const bubble = this._bubbles.get(hintId);
    if (bubble) {
      bubble.open = false;
      bubble.message = '';
      bubble.actionLabel = '';
    }
    this._visibleIds.delete(hintId);
    this._paintMeta.delete(hintId);

    if (
      acknowledgeSimple &&
      wasExpanded &&
      getHintTier(hintId) === 'simple' &&
      !this.store.isDone(hintId)
    ) {
      this.markPeeked(hintId);
    }

    if (!this.store.isDone(hintId) && this._lastAutoWant.includes(hintId)) {
      this._showClickBadge(hintId);
    } else {
      this._syncBadgeChrome(hintId);
    }
    void fromTimeout;
  }

  /**
   * @param {PointerEvent} event
   */
  _handleOutsidePointer(event) {
    if (this._clickExpandedIds.size === 0) return;
    const target = /** @type {Node | null} */ (event.target);
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    for (const hintId of [...this._clickExpandedIds]) {
      const bubble = this._bubbles.get(hintId);
      const badge = this._badges.get(hintId);
      if (target && bubble?.contains(target)) continue;
      if (target && badge?.contains(target)) continue;
      if (bubble && path.includes(bubble)) continue;
      if (badge && path.includes(badge)) continue;
      // simple：点外部 = peeked；detailed：只关预览仍脉冲
      this._collapseClickHint(hintId, {
        acknowledgeSimple: getHintTier(hintId) === 'simple'
      });
    }
  }

  /**
   * @param {string} hintId
   */
  _positionBadge(hintId) {
    const badge = this._badges.get(hintId);
    if (!badge || badge.hidden) return;

    const cfg = HINT_ANCHORS[hintId] || HINT_ANCHORS['help-fallback'];
    const anchorCfg = resolveParkAwareAnchorCfg({
      selector: String(cfg.selector || ''),
      placement: cfg.placement,
      tip: cfg.tip
    });
    const anchor = resolveAnchorEl(anchorCfg.selector, { hintId });
    if (!anchor) {
      badge.hidden = true;
      return;
    }
    // Menu/drawer host mint is the row dot — never park a floating badge on it.
    if (
      anchor.closest?.('#ft-wide-more-menu, #ft-narrow-options-drawer')
    ) {
      badge.hidden = true;
      this._badgeIds.delete(hintId);
      this._bindHostMintHover(/** @type {HTMLElement} */ (anchor), hintId);
      return;
    }

    const ar = anchor.getBoundingClientRect();
    if (ar.width <= 0 || ar.height <= 0) {
      badge.hidden = true;
      return;
    }
    const peeked = this.store.isPeeked(hintId);
    const size = peeked ? 6 : 10;
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

    // 窄屏 / 宽屏 park：与 badge / ?-remedy 同用 resolveParkAwareAnchorCfg
    if (!useHelpAnchor) {
      anchorCfg = resolveParkAwareAnchorCfg(anchorCfg);
    } else if (
      document.body.classList.contains('ft-narrow-park') ||
      document.body.classList.contains('ft-narrow-idle')
    ) {
      anchorCfg = remapNarrowIdleHintAnchor(anchorCfg, true);
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

    const anchor = resolveAnchorEl(anchorCfg.selector, { hintId });
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

    const actions = document.createElement('div');
    actions.className = 'onboarding-app-purpose__actions';

    const privacy = document.createElement('button');
    privacy.type = 'button';
    privacy.className = 'onboarding-app-purpose__privacy';
    privacy.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._openPrivacySheetFromPurpose();
    });

    const moments = document.createElement('button');
    moments.type = 'button';
    moments.className = 'onboarding-app-purpose__moments';
    moments.dataset.testid = 'onboarding-purpose-moments';
    moments.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._openFiveMomentsFromPurpose();
    });

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'onboarding-app-purpose__dismiss';
    dismiss.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._hidePurposeCard();
    });

    actions.append(moments, privacy, dismiss);
    card.append(title, body, actions);
    this.mountRoot.appendChild(card);
    this.purposeCard = card;
    this._purposeTitleEl = title;
    this._purposeBodyEl = body;
    this._purposeMomentsEl = moments;
    this._purposePrivacyEl = privacy;
    this._purposeDismissEl = dismiss;
    this._refreshPurposeCardCopy();
    return card;
  }

  _refreshPurposeCardCopy() {
    if (!this.purposeCard) return;
    this._purposeTitleEl.textContent = t('HINT_APP_PURPOSE_TITLE');
    this._purposeBodyEl.textContent = t('HINT_APP_PURPOSE_BODY');
    if (this._purposeMomentsEl) {
      this._purposeMomentsEl.textContent = t('HINT_APP_PURPOSE_MOMENTS');
      this._purposeMomentsEl.setAttribute(
        'aria-label',
        t('HINT_APP_PURPOSE_MOMENTS_ARIA')
      );
    }
    if (this._purposePrivacyEl) {
      this._purposePrivacyEl.textContent = t('HINT_APP_PURPOSE_PRIVACY');
      this._purposePrivacyEl.setAttribute(
        'aria-label',
        t('HINT_APP_PURPOSE_PRIVACY_ARIA')
      );
    }
    this._purposeDismissEl.textContent = t('HINT_APP_PURPOSE_DISMISS');
  }

  _openFiveMomentsFromPurpose() {
    this._purposeFromHover = false;
    this._hidePurposeCard();
    this.onOpenFiveMoments?.();
  }

  _ensurePrivacySheet() {
    if (this.privacySheet) return this.privacySheet;
    const sheet = document.createElement('aside');
    sheet.id = 'onboarding-privacy-sheet';
    sheet.className = 'onboarding-privacy-sheet';
    sheet.hidden = true;
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-labelledby', 'onboarding-privacy-sheet-title');

    const title = document.createElement('h2');
    title.id = 'onboarding-privacy-sheet-title';
    title.className = 'onboarding-privacy-sheet__title';

    const body = document.createElement('div');
    body.className = 'onboarding-privacy-sheet__body';

    for (const key of PRIVACY_SHEET_BODY_KEYS) {
      const p = document.createElement('p');
      p.className = 'onboarding-privacy-sheet__p';
      p.dataset.privacyKey = key;
      body.appendChild(p);
    }

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'onboarding-privacy-sheet__back';
    back.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this._closePrivacySheetToPurpose();
    });

    sheet.append(title, body, back);
    this.mountRoot.appendChild(sheet);
    this.privacySheet = sheet;
    this._privacyTitleEl = title;
    this._privacyBodyEl = body;
    this._privacyBackEl = back;
    this._refreshPrivacySheetCopy();
    return sheet;
  }

  _refreshPrivacySheetCopy() {
    if (!this.privacySheet) return;
    this._privacyTitleEl.textContent = t('PRIVACY_SHEET_TITLE');
    this._privacyBackEl.textContent = t('PRIVACY_SHEET_BACK');
    for (const p of this._privacyBodyEl.querySelectorAll('[data-privacy-key]')) {
      const key = p.getAttribute('data-privacy-key');
      if (key) p.textContent = t(key);
    }
  }

  _openPrivacySheetFromPurpose() {
    this._ensurePrivacySheet();
    this._refreshPrivacySheetCopy();
    this._purposeFromHover = false;
    if (this.purposeCard) this.purposeCard.hidden = true;
    this.privacySheet.hidden = false;
    this._privacyOpenedFromPurpose = true;
    try {
      this._privacyBackEl.focus({ preventScroll: true });
    } catch {
      // ignore
    }
  }

  _closePrivacySheetToPurpose() {
    if (this.privacySheet) this.privacySheet.hidden = true;
    if (this._privacyOpenedFromPurpose) {
      this._privacyOpenedFromPurpose = false;
      this._showPurposeCard();
    }
  }

  _hidePrivacySheet() {
    if (this.privacySheet) this.privacySheet.hidden = true;
    this._privacyOpenedFromPurpose = false;
  }

  _showPurposeCard() {
    this._hidePrivacySheet();
    this._ensurePurposeCard();
    this._refreshPurposeCardCopy();
    this.purposeCard.hidden = false;
    this._bindPurposeCardHoverLeave();
    this._positionPurposeCard();
  }

  _hidePurposeCard() {
    this._cancelPurposeHoverHide();
    if (this.purposeCard) this.purposeCard.hidden = true;
    this._purposeFromHover = false;
    this._hidePrivacySheet();
  }

  /** When purpose was opened by ? hover, leaving the card hides it (after grace). */
  _bindPurposeCardHoverLeave() {
    const card = this.purposeCard;
    if (!card || card.dataset.ftPurposeLeaveBound === '1') return;
    card.dataset.ftPurposeLeaveBound = '1';
    card.addEventListener('pointerenter', () => {
      if (!canHoverPreview()) return;
      this._cancelPurposeHoverHide();
      if (this._purposeFromHover) {
        // Stay in hover mode while on the card so links are reachable.
        this._purposeFromHover = true;
      }
    });
    card.addEventListener('pointerleave', (event) => {
      if (!canHoverPreview()) return;
      if (!this._purposeFromHover) return;
      const related = /** @type {Node | null} */ (event.relatedTarget);
      if (related && this.helpBtn.contains(related)) return;
      const narrow = document.getElementById('ft-narrow-help-btn');
      if (related && narrow?.contains(related)) return;
      this._schedulePurposeHoverHide();
    });
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
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.16);
        background: rgba(255, 252, 245, 0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: rgba(74, 58, 40, 0.72);
        font-size: 18px;
        font-weight: 650;
        line-height: 1;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(44, 31, 20, 0.06);
        opacity: 0.88;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease, opacity 160ms ease;
      }
      /* 簇内：随微组件流动，不再单独贴角 */
      .weekly-practice-heatmap-cluster .onboarding-hint-help {
        position: static;
        left: auto;
        bottom: auto;
        z-index: auto;
        width: 40px;
        height: 40px;
        flex: 0 0 auto;
        font-size: 17px;
        opacity: 0.82;
      }
      .onboarding-hint-help__mark {
        display: block;
        line-height: 44px;
        text-align: center;
      }
      .weekly-practice-heatmap-cluster .onboarding-hint-help__mark {
        line-height: 40px;
      }
      .onboarding-hint-help:hover {
        filter: brightness(1.03);
        opacity: 1;
      }
      .onboarding-hint-help:active {
        transform: translateY(1px) scale(0.97);
        box-shadow: 0 1px 4px rgba(44, 31, 20, 0.08);
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
      .onboarding-hint-badge[data-ack="peeked"] {
        width: 6px;
        height: 6px;
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
        white-space: pre-line;
      }
      .onboarding-app-purpose__actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 12px;
      }
      .onboarding-app-purpose__privacy {
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: #3a5348;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        font-style: normal;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
      }
      .onboarding-app-purpose__moments {
        margin: 0;
        padding: 0;
        border: none;
        background: transparent;
        color: #3a5348;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        font-style: normal;
        text-decoration: underline;
        text-underline-offset: 3px;
        cursor: pointer;
      }
      .onboarding-app-purpose__privacy:hover,
      .onboarding-app-purpose__moments:hover {
        color: #2f463c;
      }
      .onboarding-app-purpose__dismiss {
        display: inline-block;
        margin: 0 0 0 auto;
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
      .onboarding-privacy-sheet {
        position: fixed;
        z-index: 29;
        box-sizing: border-box;
        width: min(360px, calc(100vw - 24px));
        max-height: min(70vh, 520px);
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
        display: flex;
        flex-direction: column;
        gap: 10px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      .onboarding-privacy-sheet[hidden] {
        display: none !important;
      }
      .onboarding-privacy-sheet__title {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: #2f463c;
      }
      .onboarding-privacy-sheet__body {
        margin: 0;
        overflow: auto;
        flex: 1 1 auto;
        min-height: 0;
      }
      .onboarding-privacy-sheet__p {
        margin: 0 0 10px;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.45;
        color: #3a5348;
      }
      .onboarding-privacy-sheet__p:last-child {
        margin-bottom: 0;
      }
      .onboarding-privacy-sheet__back {
        align-self: flex-start;
        margin: 0;
        padding: 6px 14px;
        border-radius: 999px;
        border: 1px solid rgba(92, 122, 108, 0.45);
        background: rgba(255, 255, 255, 0.55);
        color: #2f463c;
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .onboarding-privacy-sheet__back:hover {
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
      /* Calm HUD：发现点略收敛，减少四角碎点抢视线（仍可点 badge 路径） */
      #focus-hud .ft-hint-discovery-dot,
      #focus-hud .onboarding-hint-badge {
        opacity: 0.72;
      }
      #focus-hud .ft-hud__gauge,
      #focus-hud .ft-hud__bar,
      #focus-hud .ft-hud__streak {
        position: relative;
      }
      #focus-hud .ft-hud__gauge > .ft-hint-discovery-dot {
        top: 2px;
        right: 2px;
        width: 7px;
        height: 7px;
      }
      #quick-start-focus {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }
}
