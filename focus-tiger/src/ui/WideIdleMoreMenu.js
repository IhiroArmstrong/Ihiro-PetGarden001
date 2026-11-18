/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  EDGE_RECALL_HIT_PX,
  WIDE_STAGE_CLASS,
  listSecondaryChromeEntries,
  SECONDARY_PROXY_HINT_IDS,
  dispatchSecondaryChromeProxy,
  decorateSecondaryLockButton,
  invokeHandler,
  resolveIdleChromeStageForShellFlags,
  resolveRoleVisibility,
  syncSecondaryMenuHintDot
} from '../core/idleChromeOrchestration.js';
import { hasSubmittedNewsletter } from '../core/newsletter/newsletterCaptureGate.js';
import { resolveMustardSeedSeal } from '../core/mustardSeedSeal.js';
import { resolveContemplativeArchiveSeal } from '../core/contemplativeArchiveSeal.js';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';
import {
  canRegisterDesktopCompanionGeneration,
  hasDesktopCompanionBridge
} from '../core/desktopCompanionGate.js';
import { canUseSystemTts } from '../core/systemTtsBridge.js';
import {
  canUseAlwaysOnTop,
  readAlwaysOnTopEnabled,
  writeAlwaysOnTopEnabled
} from '../core/alwaysOnTopBridge.js';
import { canUseInputRhythm } from '../core/inputRhythmBridge.js';
import { canUseWindowLayout } from '../core/windowLayoutBridge.js';
import { isCompanionEntitled } from '../core/companionEntitlement.js';
import { attachGlassHoverTip } from './ft-glass-hover-tip.js';
import { pushOverlayEscapeLayer } from '../core/overlayEscapeStack.js';
import { syncHomeSanctuaryNavPulse } from '../core/homeSanctuaryNavGate.js';
import {
  WIDE_MENU_RADIAL_GROUP_KEYS,
  isWideMenuViewport,
  shouldDegenerateWideMenuRadialForButton
} from '../core/wideMenuRadialLayout.js';
import { Z } from './zIndexLayers.js';
import { HomeThreeZoneUI } from './HomeThreeZoneUI.js';
import { fillPreferencesCenterRow } from './preferencesCenterRow.js';
import { readPreferenceCenterStatus } from '../core/preferencesCenterStatus.js';

const STYLE_ID = 'ft-wide-idle-more-styles-v13';
const DEFAULT_EXPANDED_MENU_GROUP = 'MENU_GROUP_PRACTICE';
const DEFAULT_EXPANDED_MENU_GROUPS = [
  DEFAULT_EXPANDED_MENU_GROUP,
  'MENU_GROUP_RECORDS'
];
const WIDE_MQ = '(min-width: 480px)';
/** Match narrow home totems (`NarrowIdleShell` HOME_CTA_PX). */
const HOME_CTA_PX = 72;
/** Sit is the primary cold-start path — slight visual emphasis (~1.155×). */
const HOME_SIT_PX = Math.round(HOME_CTA_PX * 1.155);
const ICON_SIT = '/icons/icon-sit-with-yin.png?v=4';
const ICON_QUICK = '/icons/icon-quick-start.png?v=4';
const ICON_HONESTY = '/icons/icon-honesty-checkin.png?v=4';

/**
 * The wide CTA row lives *inside* `#session-start-dock` (narrow mounts its balls in
 * its own shell root instead), so the dock observer would otherwise see the balls'
 * own `aria-disabled` / `hidden` writes and re-enter forever — an unbreakable
 * microtask loop that freezes the main thread. Only react to mutations from
 * outside the row.
 * @param {MutationRecord[]} records
 * @param {Element | null | undefined} ctaRow
 * @returns {boolean}
 */
export function shouldSyncHomeCtasForRecords(records, ctaRow) {
  if (!Array.isArray(records) || records.length === 0) return false;
  if (!ctaRow) return true;
  return records.some((record) => {
    const target = record?.target;
    if (!target) return false;
    if (target === ctaRow) return false;
    return !ctaRow.contains?.(target);
  });
}

/**
 * `setAttribute` emits a MutationRecord even when the value is unchanged, so every
 * write must be conditional to keep observer churn down.
 * @param {Element | null | undefined} el
 * @param {string} name
 * @param {string} value
 * @returns {void}
 */
function setAttrIfChanged(el, name, value) {
  if (!el) return;
  if (el.getAttribute(name) === value) return;
  el.setAttribute(name, value);
}

/**
 * @param {HTMLElement | null | undefined} el
 * @param {'hidden' | 'disabled'} prop
 * @param {boolean} next
 * @returns {void}
 */
function setBoolPropIfChanged(el, prop, next) {
  if (!el) return;
  if (Boolean(el[prop]) === next) return;
  el[prop] = next;
}

/**
 * Wide Idle (≥480): home three balls (Quick · Sit · Honesty) + ⋯ right sheet.
 * Replaces Sit+⚡ text pills as primary CTAs. Narrow (≤479) is NarrowIdleShell.
 *
 * Proxies existing DOM (Honesty / breath / How / Sound FAB / reminder).
 * The ⋯ panel is a viewport-fixed right sheet so it never bisects Yin.
 */
export class WideIdleMoreMenu {
  /**
   * @param {{
   *   handlers?: {
   *     onCompanion?: () => void,
   *     onReminder?: () => void,
     *     onLanguage?: () => void,
     *     onSystemTts?: () => void,
     *     onAlwaysOnTop?: () => void,
     *     onWindowLayout?: () => void,
     *     onInputRhythm?: () => void,
   *     onFiveMoments?: () => void,
     *     onJourneyLog?: () => void,
     *     onYinCoin?: () => void,
     *     onConfide?: () => void,
   *     onZenCinema?: () => void,
   *     onDailyQuote?: () => void,
   *     onMustardSeedSeal?: () => void,
   *     onWallpapers?: () => void,
     *     onArtCollection?: () => void,
     *     onSanctuary?: () => void,
     *     onMembership?: () => void,
     *     onTipJar?: () => void,
     *     onNewsletter?: () => void,
     *     onCommunity?: () => void,
     *     onHelpCenter?: () => void,
     *     onLocalBackup?: () => void,
     *     onRitualFlow?: (proxy: string) => void,
   *     onSound?: () => void,
   *     onHonesty?: () => void,
     *     onQuickStart?: () => void,
     *     onSanctuaryNav?: () => void,
     *     shouldShowSanctuaryNavPulse?: () => boolean,
     *     onClearCompanion?: () => void,
     *     onClearStage?: () => void,
     *     onMenuChange?: (open: boolean) => void,
     *     isHintUnread?: (id: string) => boolean,
     *     isGrowthCardOverlayActive?: () => boolean,
   *   }
   * }} [options]
   */
  constructor(options = {}) {
    this.handlers = options.handlers || {};
    this._idle = true;
    this._suppressed = false;
    this._keepQuickStart = false;
    this._honestyBridgeActive = false;
    this._menuOpen = false;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;
    this._expandedGroups = new Set(DEFAULT_EXPANDED_MENU_GROUPS);
    /** @type {boolean} */
    this._menuFlat = false;
    /** @type {string | null} */
    this._activeListGroup = null;
    /** @type {number} */
    this._radialFocusIdx = 0;
    this._localeUnsub = null;
    this._refreshingHomeCtas = false;
    /** @type {boolean} */
    this._edgeRecallRevealed = false;

    this._mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(WIDE_MQ)
        : null;

    this._injectStyles();
    this._ensureBuilt();
    this._bind();
    this.threeZone = new HomeThreeZoneUI({ wide: this });
    this.onAfterSync = () => this.threeZone?.sync();
    this._sync();
    this._localeUnsub = onLocaleChange(() => {
      this._refreshLabels();
      this._refreshHomeCtas();
      if (this._menuOpen) {
        this._refreshRadial();
        this._refreshItems();
      }
    });
  }

  /**
   * @param {WideIdleMoreMenu['handlers']} handlers
   * @returns {void}
   */
  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Re-paint ⋯ row mint dots after lab「清空引导提示已读」(menu may already be open).
   * @returns {void}
   */
  refreshSecondaryHintDots() {
    if (this._menuOpen) this._refreshItems();
  }

  /** Re-sync home ball labels + sanctuary nav pulse after first fan open. */
  refreshHomeCtas() {
    this._refreshHomeCtas();
  }

  /**
   * @param {boolean} idle true when not Focusing (Arrival still counts as idle chrome)
   * @returns {void}
   */
  setIdle(idle) {
    this._idle = Boolean(idle);
    if (!this._idle) {
      this.closeMenu();
      this.clearStage();
    }
    this._sync();
  }

  /**
   * Arrival / Honesty / Reflection / bridge: hide ⋯.
   * Arrival `keepQuickStart`: keep Quick Start ball only.
   * @param {boolean} suppressed
   * @param {{ keepQuickStart?: boolean, honestyBridgeActive?: boolean }} [opts]
   * @returns {void}
   */
  setSuppressed(suppressed, opts = {}) {
    this._suppressed = Boolean(suppressed);
    this._keepQuickStart =
      Boolean(opts.keepQuickStart) && this._suppressed;
    this._honestyBridgeActive = Boolean(opts.honestyBridgeActive);
    if (this._suppressed && !this._keepQuickStart) {
      this.closeMenu();
      this.clearStage();
    } else if (this._suppressed) {
      this.closeMenu();
    }
    this._sync();
  }

  /**
   * @returns {void}
   */
  openMenu() {
    if (!this._isWide() || this._honestyBridgeActive) return;
    if (!this._canOpenMoreMenu()) return;
    this._dismissIdleVisualPrimaryOverlays();
    this._menuOpen = true;
    this._menuFlat = shouldDegenerateWideMenuRadialForButton(this.moreBtn);
    this._activeListGroup = null;
    this._radialFocusIdx = 0;
    if (this._menuFlat) {
      this._expandedGroups = new Set(DEFAULT_EXPANDED_MENU_GROUPS);
    } else {
      this._expandedGroups = new Set();
    }
    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: 'wide-more-menu',
      dismiss: () => {
        this.closeMenu();
        this.moreBtn?.focus();
      }
    });
    this._refreshItems();
    this._refreshRadial();
    this._syncMenuLayers();
    this._sync();
    if (!this._menuFlat) {
      document.addEventListener('keydown', this._onKeyDown, true);
    }
    this.moreBtn?.setAttribute('aria-expanded', 'true');
    this.handlers.onMenuChange?.(true);
  }

  /**
   * @returns {void}
   */
  closeMenu() {
    if (!this._menuOpen) return;
    this._menuOpen = false;
    this._activeListGroup = null;
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    document.removeEventListener('keydown', this._onKeyDown, true);
    this._syncMenuLayers();
    if (this._moreOrGrabberRole() === 'edge-recall') {
      this._edgeRecallRevealed = false;
    }
    this._sync();
    this.moreBtn?.setAttribute('aria-expanded', 'false');
    this.handlers.onMenuChange?.(false);
  }

  /**
   * @returns {'visible' | 'hidden' | 'na' | 'edge-recall'}
   */
  _moreOrGrabberRole() {
    const stage = resolveIdleChromeStageForShellFlags({
      idle: this._idle,
      suppressed: this._suppressed,
      keepQuickStart: this._keepQuickStart,
      honestyBridgeActive: this._honestyBridgeActive
    });
    return resolveRoleVisibility({ stage, viewport: 'wide' }).moreOrGrabber;
  }

  /**
   * @returns {boolean}
   */
  _canOpenMoreMenu() {
    const role = this._moreOrGrabberRole();
    if (role === 'hidden' || role === 'na') return false;
    if (this._idle) {
      return !this._suppressed || this._keepQuickStart;
    }
    return role === 'edge-recall' || role === 'visible';
  }

  /**
   * Leave wide viewport: close ⋯ + drop stage classes without onClearStage
   * (facade breakpoint cleanup — must not hide Companion on resize).
   * @returns {void}
   */
  releaseInactivePresentation() {
    this.closeMenu();
    document.body.classList.remove(
      WIDE_STAGE_CLASS.sound,
      WIDE_STAGE_CLASS.companion,
      WIDE_STAGE_CLASS.reminder,
      WIDE_STAGE_CLASS.workEnd,
      WIDE_STAGE_CLASS.language,
      WIDE_STAGE_CLASS.systemTts
    );
  }

  /**
   * Drop sound/companion/reminder/language stage body classes only.
   * @returns {void}
   */
  _dropStageClasses() {
    document.body.classList.remove(
      WIDE_STAGE_CLASS.sound,
      WIDE_STAGE_CLASS.companion,
      WIDE_STAGE_CLASS.reminder,
      WIDE_STAGE_CLASS.workEnd,
      WIDE_STAGE_CLASS.language,
      WIDE_STAGE_CLASS.systemTts
    );
  }

  /**
   * Idle visual-primary dismiss (companion trio, chips, staged panels).
   * Opening ⋯ uses the same contract as menu-row clearStage — not a global
   * modal stack wipe (growth glass cards stay via isGrowthCardOverlayActive).
   * @returns {void}
   */
  _dismissIdleVisualPrimaryOverlays() {
    this._dropStageClasses();
    // Growth glass cards *are* the overlay — onClearStage closes them via
    // idleSecondaryPanelHost; suppress after open would flash-dismiss Quiet Line /
    // Wallpapers rows (7940bfaa · isGrowthCardOverlayActive).
    if (this.handlers.isGrowthCardOverlayActive?.()) return;
    this.handlers.onClearStage?.();
  }

  /**
   * Dismiss staged secondary panels (Soundscape / companion / reminder).
   * @returns {void}
   */
  clearStage() {
    this._dismissIdleVisualPrimaryOverlays();
  }

  /**
   * @returns {boolean}
   */
  isMenuOpen() {
    return this._menuOpen;
  }

  /**
   * @returns {void}
   */
  destroy() {
    this.threeZone?.destroy();
    this.threeZone = null;
    this.onAfterSync = null;
    this._localeUnsub?.();
    this._mq?.removeEventListener?.('change', this._onMqChange);
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this._onResize);
    }
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    document.removeEventListener('keydown', this._onKeyDown, true);
    this._dockObserver?.disconnect?.();
    this.wrap?.remove();
    this.menu?.remove();
    this.radialRoot?.remove();
    this.backdrop?.remove();
    this.homeCtas?.remove();
    this.ctaRow?.remove();
    document.getElementById(STYLE_ID)?.remove();
    document.body.classList.remove(
      'ft-wide-park-secondary',
      'ft-wide-show-dock-rise',
      'ft-wide-more-open',
      'ft-wide-home-ctas',
      WIDE_STAGE_CLASS.sound,
      WIDE_STAGE_CLASS.companion,
      WIDE_STAGE_CLASS.reminder,
      WIDE_STAGE_CLASS.workEnd,
      WIDE_STAGE_CLASS.language,
      WIDE_STAGE_CLASS.systemTts
    );
  }

  _isWide() {
    const innerWidth =
      typeof window !== 'undefined' ? window.innerWidth : Number.NaN;
    const mq = this._mq ? this._mq.matches : false;
    return isWideMenuViewport(innerWidth, mq);
  }

  /**
   * Build once `#session-start-dock` exists. CompanionModePicker owns that dock and
   * may be constructed after this shell, so a single constructor-time attempt would
   * silently drop ⋯ forever — every _sync retries instead.
   * @returns {boolean} true when the ⋯ button is mounted
   */
  _ensureBuilt() {
    if (this.moreBtn) return true;

    const dock = document.getElementById('session-start-dock');
    const focusBtn = document.getElementById('btn-focus');
    if (!dock || !focusBtn) return false;

    this.ctaRow = document.createElement('div');
    this.ctaRow.className = 'session-start-dock__cta-row';

    this.homeCtas = document.createElement('nav');
    this.homeCtas.className = 'ft-wide-home-ctas';
    this.homeCtas.id = 'ft-wide-home-ctas';
    this.homeCtas.innerHTML = `
      <button type="button" class="ft-home-begin-practice" id="ft-home-begin-practice" data-proxy="sit" data-testid="ft-home-begin-practice"></button>
      <div class="ft-wide-home-ctas__row">
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-quickstart" data-proxy="quickstart" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_QUICK}" alt="" width="${HOME_CTA_PX}" height="${HOME_CTA_PX}" draggable="false" decoding="async" />
      </button>
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-sit" data-proxy="sit" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_SIT}" alt="" width="${HOME_SIT_PX}" height="${HOME_SIT_PX}" draggable="false" decoding="async" />
      </button>
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-honesty" data-proxy="honesty" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_HONESTY}" alt="" width="${HOME_CTA_PX}" height="${HOME_CTA_PX}" draggable="false" decoding="async" />
      </button>
      </div>
    `;
    this.sanctuaryNavHomeBtn = document.getElementById(
      'ft-sanctuary-nav-compass-fab'
    );
    this.beginPracticeBtn = this.homeCtas.querySelector('#ft-home-begin-practice');
    this.sitHomeBtn = this.homeCtas.querySelector('#ft-wide-home-sit');
    this.quickHomeBtn = this.homeCtas.querySelector('#ft-wide-home-quickstart');
    this.honestyHomeBtn = this.homeCtas.querySelector('#ft-wide-home-honesty');
    this._attachHomeGlassTips();

    this.wrap = document.createElement('div');
    this.wrap.className = 'ft-wide-more';
    this.wrap.id = 'ft-wide-more';

    this.edgeZone = document.createElement('div');
    this.edgeZone.className = 'ft-wide-more__edge-zone';
    this.edgeZone.setAttribute('aria-hidden', 'true');

    this.moreBtn = document.createElement('button');
    this.moreBtn.type = 'button';
    this.moreBtn.id = 'ft-wide-more-btn';
    this.moreBtn.className = 'ft-wide-more__btn';
    this.moreBtn.textContent = '⋯';
    this.moreBtn.setAttribute('aria-expanded', 'false');
    this.moreBtn.setAttribute('aria-haspopup', 'menu');
    this.moreBtn.setAttribute('aria-controls', 'ft-wide-more-menu');

    this.backdrop = document.createElement('div');
    this.backdrop.id = 'ft-wide-more-backdrop';
    this.backdrop.className = 'ft-wide-more__backdrop';
    this.backdrop.hidden = true;
    this.backdrop.setAttribute('aria-hidden', 'true');

    this.menu = document.createElement('div');
    this.menu.id = 'ft-wide-more-menu';
    this.menu.className = 'ft-wide-more__menu';
    this.menu.setAttribute('role', 'menu');
    this.menu.hidden = true;

    this.sheetHead = document.createElement('div');
    this.sheetHead.className = 'ft-wide-more__head';
    this.sheetTitle = document.createElement('p');
    this.sheetTitle.className = 'ft-wide-more__title';
    this.sheetClose = document.createElement('button');
    this.sheetClose.type = 'button';
    this.sheetClose.className = 'ft-wide-more__close';
    this.sheetClose.dataset.testid = 'ft-wide-more-close';
    this.sheetClose.addEventListener('click', (event) => {
      event.stopPropagation();
      this.closeMenu();
    });
    this.sheetHead.append(this.sheetTitle, this.sheetClose);

    this.listEl = document.createElement('ul');
    this.listEl.className = 'ft-wide-more__list';
    this.menu.append(this.sheetHead, this.listEl);

    this.radialRoot = document.createElement('div');
    this.radialRoot.id = 'ft-wide-more-radial';
    this.radialRoot.className = 'ft-wide-more-radial ft-wide-more-sidenav';
    this.radialRoot.hidden = true;
    this.radialRoot.setAttribute('role', 'toolbar');
    this.radialRoot.dataset.testid = 'ft-wide-more-radial';

    this.wrap.append(this.edgeZone, this.moreBtn);
    // Portal sheet + scrim to body so they can sit above Support/mute (z24)
    // without remaining trapped in the dock stacking context (z16).
    document.body.append(this.backdrop, this.radialRoot, this.menu);

    // Three balls + ⋯; leave hint / Honesty / breath / Sit+⚡ pills in dock for proxy
    this.ctaRow.append(this.homeCtas, this.wrap);
    dock.appendChild(this.ctaRow);

    this._onKeyDown = (event) => this._handleMenuKeyDown(event);
    this._bindMenuEls();
    this._bindHomeCtas();
    this._observeDock();
    this._refreshLabels();
    this._refreshHomeCtas();
    return true;
  }

  _bindMenuEls() {
    this.moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._menuOpen) this.closeMenu();
      else this.openMenu();
    });
    this.moreBtn?.addEventListener('focus', () => {
      if (this._moreOrGrabberRole() !== 'edge-recall') return;
      this._edgeRecallRevealed = true;
      this._sync();
    });
    this.edgeZone?.addEventListener('pointerenter', () => {
      if (this._moreOrGrabberRole() !== 'edge-recall') return;
      this._edgeRecallRevealed = true;
      this._sync();
    });
    this.edgeZone?.addEventListener('pointerleave', () => {
      if (this._moreOrGrabberRole() !== 'edge-recall' || this._menuOpen) return;
      this._edgeRecallRevealed = false;
      this._sync();
    });
    this.wrap?.addEventListener('pointerleave', () => {
      if (this._moreOrGrabberRole() !== 'edge-recall' || this._menuOpen) return;
      this._edgeRecallRevealed = false;
      this._sync();
    });

    this.listEl?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-proxy]');
      if (!item || item.disabled) return;
      const key = item.getAttribute('data-proxy');
      if (item.dataset.prefKind === 'toggle') {
        e.preventDefault();
        e.stopPropagation();
        void this._onPrefToggle(key, item);
        return;
      }
      const entryMeta = {
        locked: item.classList.contains('is-locked'),
        interactive: item.classList.contains('is-static') ? false : undefined
      };
      this.closeMenu();
      requestAnimationFrame(() => this._proxy(key, entryMeta));
    });
  }

  _bindHomeCtas() {
    this.homeCtas?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-proxy]');
      if (!btn || btn.disabled || btn.hidden) return;
      this._proxyHome(btn.getAttribute('data-proxy'));
    });
  }

  _observeDock() {
    const dock = document.getElementById('session-start-dock');
    if (!dock || typeof MutationObserver === 'undefined') return;
    this._dockObserver = new MutationObserver((records) => {
      if (!shouldSyncHomeCtasForRecords(records, this.ctaRow)) return;
      this._refreshHomeCtas();
    });
    this._dockObserver.observe(dock, {
      attributes: true,
      subtree: true,
      attributeFilter: ['hidden', 'disabled', 'aria-disabled', 'class']
    });
  }

  _refreshLabels() {
    if (!this.moreBtn) return;
    this.moreBtn.setAttribute('aria-label', t('WIDE_MORE_ARIA'));
    this.menu?.setAttribute('aria-label', t('WIDE_MORE_ARIA'));
    if (this.sheetClose) {
      this.sheetClose.setAttribute('aria-label', t('PREF_CENTER_CLOSE'));
      this.sheetClose.textContent = '×';
    }
    if (this.homeCtas) {
      this.homeCtas.setAttribute('aria-label', t('NARROW_SHEET_TITLE'));
    }
    this._refreshHomeCtas();
  }

  /** @returns {void} */
  _attachHomeGlassTips() {
    if (this.sanctuaryNavHomeBtn) {
      this._sanctuaryNavHomeTip = attachGlassHoverTip(this.sanctuaryNavHomeBtn, {
        placement: 'top',
        tipId: 'ft-wide-home-sanctuary-nav-tip'
      });
    }
    if (this.quickHomeBtn) {
      this._quickHomeTip = attachGlassHoverTip(this.quickHomeBtn, {
        placement: 'top',
        tipId: 'ft-wide-home-quickstart-tip'
      });
    }
    if (this.sitHomeBtn) {
      this._sitHomeTip = attachGlassHoverTip(this.sitHomeBtn, {
        placement: 'top',
        tipId: 'ft-wide-home-sit-tip'
      });
    }
    if (this.honestyHomeBtn) {
      this._honestyHomeTip = attachGlassHoverTip(this.honestyHomeBtn, {
        placement: 'top',
        tipId: 'ft-wide-home-honesty-tip'
      });
    }
  }

  /**
   * Keep home Quick Start / Sit / Honesty enablement in sync with parked pills.
   * @returns {void}
   */
  _refreshHomeCtas() {
    if (!this.homeCtas || this._refreshingHomeCtas) return;
    this._refreshingHomeCtas = true;
    try {
      if (this.sanctuaryNavHomeBtn) {
        const navLabel = t('SANCTUARY_NAV_ARIA');
        setAttrIfChanged(this.sanctuaryNavHomeBtn, 'aria-label', navLabel);
        this._sanctuaryNavHomeTip?.setText(navLabel);
        setBoolPropIfChanged(
          this.sanctuaryNavHomeBtn,
          'hidden',
          Boolean(this._keepQuickStart)
        );
        setBoolPropIfChanged(this.sanctuaryNavHomeBtn, 'disabled', false);
        setAttrIfChanged(this.sanctuaryNavHomeBtn, 'aria-disabled', 'false');
        syncHomeSanctuaryNavPulse(
          this.sanctuaryNavHomeBtn,
          this.handlers.shouldShowSanctuaryNavPulse?.() === true
        );
      }

      const focusEl = document.getElementById('btn-focus');
      const sitOk = Boolean(focusEl) && !focusEl.hidden && !focusEl.disabled;
      const sitHidden =
        Boolean(this._keepQuickStart) || !focusEl || focusEl.hidden;
      if (this.sitHomeBtn) {
        const sitLabel = focusEl?.textContent?.trim() || t('BTN_FOCUS_START');
        setAttrIfChanged(this.sitHomeBtn, 'aria-label', sitLabel);
        this._sitHomeTip?.setText(sitLabel);
        setBoolPropIfChanged(this.sitHomeBtn, 'disabled', !sitOk);
        setAttrIfChanged(
          this.sitHomeBtn,
          'aria-disabled',
          sitOk ? 'false' : 'true'
        );
        setBoolPropIfChanged(this.sitHomeBtn, 'hidden', sitHidden);
      }
      if (this.beginPracticeBtn) {
        const beginLabel = t('HOME_BEGIN_PRACTICE');
        this.beginPracticeBtn.textContent = beginLabel;
        setAttrIfChanged(this.beginPracticeBtn, 'aria-label', beginLabel);
        setBoolPropIfChanged(this.beginPracticeBtn, 'disabled', !sitOk);
        setAttrIfChanged(
          this.beginPracticeBtn,
          'aria-disabled',
          sitOk ? 'false' : 'true'
        );
        setBoolPropIfChanged(this.beginPracticeBtn, 'hidden', sitHidden);
      }

      const quickEl = document.getElementById('quick-start-focus');
      if (this.quickHomeBtn) {
        const qsLabel = t('QUICK_START_ARIA');
        setAttrIfChanged(this.quickHomeBtn, 'aria-label', qsLabel);
        // Home left ball: no mint pulse (2026-08-11) — glass tip always owns hover.
        this._quickHomeTip?.setText(qsLabel);
        const companionOpen =
          document.querySelector('.session-start-dock__panel:not([hidden])') !=
          null;
        // Arrival keepQuickStart: ⚡ stays live even while the dock pill is hidden.
        // Companion 三选一: Breath/Quick ball under the cards is a leftover Quick Start.
        const qsOk =
          (this._keepQuickStart && !companionOpen) ||
          (Boolean(quickEl) && !quickEl.hidden && !quickEl.disabled);
        setBoolPropIfChanged(
          this.quickHomeBtn,
          'hidden',
          companionOpen ||
            (this._keepQuickStart ? false : !quickEl || quickEl.hidden)
        );
        setBoolPropIfChanged(this.quickHomeBtn, 'disabled', !qsOk);
        setAttrIfChanged(
          this.quickHomeBtn,
          'aria-disabled',
          qsOk ? 'false' : 'true'
        );
      }

      if (this.honestyHomeBtn) {
        const momentsLabel = t('FIVE_MOMENTS_IDLE_ENTRY');
        setAttrIfChanged(this.honestyHomeBtn, 'aria-label', momentsLabel);
        this._honestyHomeTip?.setText(momentsLabel);
        setBoolPropIfChanged(
          this.honestyHomeBtn,
          'hidden',
          Boolean(this._keepQuickStart)
        );
        setBoolPropIfChanged(this.honestyHomeBtn, 'disabled', false);
        setAttrIfChanged(this.honestyHomeBtn, 'aria-disabled', 'false');
      }
    } finally {
      this._refreshingHomeCtas = false;
    }
  }

  /**
   * @param {string | null} key
   * @returns {void}
   */
  _proxyHome(key) {
    if (key === 'sanctuary-nav') {
      invokeHandler(this.handlers, 'onSanctuaryNav');
      return;
    }
    if (key === 'quickstart') {
      invokeHandler(this.handlers, 'onQuickStart');
      return;
    }
    if (key === 'sit') {
      const el = document.getElementById('btn-focus');
      if (!el || el.disabled || el.hidden) return;
      const prev = el.style.pointerEvents;
      el.style.pointerEvents = 'auto';
      el.click();
      el.style.pointerEvents = prev;
      return;
    }
    if (key === 'honesty') {
      this.clearStage();
      invokeHandler(this.handlers, 'onFiveMoments');
      return;
    }
  }

  _bind() {
    this._onMqChange = () => {
      if (!this._isWide()) this.closeMenu();
      this._sync();
    };
    this._mq?.addEventListener?.('change', this._onMqChange);
    this._onResize = () => {
      if (!this._isWide()) this.closeMenu();
      this._sync();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this._onResize);
    }

    this._onDocPointer = (event) => {
      if (!this._menuOpen) return;
      if (shouldIgnoreOutsideDismissTarget(event.target)) return;
      const target = /** @type {Node} */ (event.target);
      if (this.wrap?.contains(target)) return;
      if (this.menu?.contains(target)) return;
      if (this.radialRoot?.contains(target)) return;
      this.closeMenu();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

  }

  _sync() {
    this._ensureBuilt();
    const wide = this._isWide();
    const park = wide && this._idle;
    const keepQs = Boolean(this._keepQuickStart);
    const moreRole = this._moreOrGrabberRole();
    const edgeRecallMore = wide && moreRole === 'edge-recall';
    const showMore =
      (park && moreRole === 'visible' && !this._honestyBridgeActive) ||
      edgeRecallMore;
    // Full suppress (Reflection / duration picker / growth cards): hide home balls.
    // keepQuickStart: Quick Start only via `.is-arrival-quick` (matches narrow shell).
    const showHome = park && (!this._suppressed || keepQs);
    // Dock Sit/⚡ pills only while Focusing Rise — never during Idle (prevents
    // Sit flash if chrome sync races label reset).
    const showDockRise = wide && !this._idle;

    document.body.classList.toggle('ft-wide-park-secondary', park);
    document.body.classList.toggle('ft-wide-show-dock-rise', showDockRise);
    document.body.classList.toggle(
      'ft-wide-more-open',
      this._menuOpen && showMore
    );
    document.body.classList.toggle('ft-wide-home-ctas', showHome);

    if (this.ctaRow) this.ctaRow.hidden = !park;
    if (this.homeCtas) {
      this.homeCtas.hidden = !showHome;
      this.homeCtas.classList.toggle('is-arrival-quick', keepQs);
    }
    if (this.moreBtn) {
      this.moreBtn.hidden =
        moreRole === 'hidden' || moreRole === 'na' || !showMore;
    }
    if (this.wrap) {
      this.wrap.classList.toggle('is-edge-recall', edgeRecallMore && !this._menuOpen);
      this.wrap.classList.toggle(
        'is-edge-recall-revealed',
        edgeRecallMore && (this._edgeRecallRevealed || this._menuOpen)
      );
      this.wrap.dataset.edgeRecallPx = String(EDGE_RECALL_HIT_PX);
    }
    if (!showMore) this._menuOpen = false;
    this._syncMenuLayers();
    if (park) this._refreshHomeCtas();
    this.onAfterSync?.();
  }

  /**
   * Open ⋯ already on a named group (H2 right-rail previews).
   * @param {string} groupKey
   * @returns {void}
   */
  openMenuGroup(groupKey) {
    this.openMenu();
    if (!this._menuOpen || !groupKey) return;
    if (this._menuFlat) {
      this._activeListGroup = groupKey;
      this._expandedGroups = new Set([groupKey]);
      this._refreshItems();
      this._syncMenuLayers();
      return;
    }
    this._openRadialGroup(groupKey);
  }

  /**
   * @param {string | null} key
   * @returns {void}
   */
  proxyMenuItem(key) {
    this._proxy(key);
  }

  /** @returns {void} */
  _syncMenuLayers() {
    const open = this._menuOpen && !this.moreBtn?.hidden;
    if (!open) {
      if (this.backdrop) this.backdrop.hidden = true;
      if (this.menu) this.menu.hidden = true;
      if (this.radialRoot) this.radialRoot.hidden = true;
      document.body.classList.remove('ft-wide-more-radial-open');
      return;
    }
    if (this.backdrop) this.backdrop.hidden = false;
    if (this._menuFlat) {
      if (this.menu) this.menu.hidden = false;
      if (this.radialRoot) this.radialRoot.hidden = true;
      document.body.classList.remove('ft-wide-more-radial-open');
      return;
    }
    const listPhase = Boolean(this._activeListGroup);
    if (this.menu) this.menu.hidden = !listPhase;
    // H1 side nav stays while a group sheet is open so the user can switch groups.
    if (this.radialRoot) this.radialRoot.hidden = false;
    document.body.classList.toggle('ft-wide-more-radial-open', true);
    if (!listPhase) this._placeRadial();
  }

  /** @returns {void} */
  _refreshRadial() {
    if (!this.radialRoot) return;
    this.radialRoot.innerHTML = '';
    this.radialRoot.setAttribute('aria-label', t('HOME_SIDE_NAV_HEADING'));
    const heading = document.createElement('p');
    heading.className = 'ft-wide-more-radial__heading';
    heading.textContent = t('HOME_SIDE_NAV_HEADING');
    this.radialRoot.appendChild(heading);
    /** @type {Record<string, string>} */
    const glyph = {
      MENU_GROUP_PRACTICE: '◎',
      MENU_GROUP_RECORDS: '≡',
      MENU_GROUP_INSPIRATION: '✦',
      MENU_GROUP_NOT_ALONE: '○',
      MENU_GROUP_PREFERENCES: '⚙'
    };
    for (const groupKey of WIDE_MENU_RADIAL_GROUP_KEYS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ft-wide-more-radial__icon';
      btn.dataset.group = groupKey;
      btn.dataset.testid = `wide-more-radial-${groupKey}`;
      btn.setAttribute('aria-label', t(groupKey));
      btn.innerHTML = `<span class="ft-wide-more-radial__glyph" aria-hidden="true">${glyph[groupKey] || '•'}</span><span class="ft-wide-more-radial__name">${t(groupKey)}</span>`;
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        this._openRadialGroup(groupKey);
      });
      this.radialRoot.appendChild(btn);
    }
  }

  /** @returns {void} */
  _placeRadial() {
    // H1: labeled side nav is CSS-positioned; polar fan geometry retired.
  }

  /**
   * @param {string} groupKey
   * @returns {void}
   */
  _openRadialGroup(groupKey) {
    this._activeListGroup = groupKey;
    this._expandedGroups = new Set([groupKey]);
    this._refreshItems();
    this._syncMenuLayers();
    const first = this.listEl?.querySelector('.ft-wide-more__item:not(:disabled)');
    first?.focus?.();
  }

  /**
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  _handleMenuKeyDown(event) {
    if (!this._menuOpen || this._menuFlat) return;
    if (!this._activeListGroup) {
      if (
        event.key === 'ArrowRight' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault();
        const delta =
          event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
        const len = WIDE_MENU_RADIAL_GROUP_KEYS.length;
        this._radialFocusIdx =
          (this._radialFocusIdx + delta + len) % len;
        const btn = this.radialRoot?.querySelector(
          `[data-group="${WIDE_MENU_RADIAL_GROUP_KEYS[this._radialFocusIdx]}"]`
        );
        btn?.focus?.();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const focused = this.radialRoot?.querySelector(
          '.ft-wide-more-radial__icon:focus'
        );
        const group =
          focused?.getAttribute('data-group') ||
          WIDE_MENU_RADIAL_GROUP_KEYS[this._radialFocusIdx];
        if (group) {
          event.preventDefault();
          this._openRadialGroup(group);
        }
        return;
      }
    }
    if (!this._activeListGroup || !this.listEl) return;
    const items = [
      ...this.listEl.querySelectorAll('.ft-wide-more__item:not(:disabled)')
    ];
    if (items.length === 0) return;
    const idx = items.findIndex((el) => el === document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = items[Math.min(items.length - 1, idx < 0 ? 0 : idx + 1)];
      next?.focus?.();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = items[Math.max(0, idx <= 0 ? 0 : idx - 1)];
      next?.focus?.();
    } else if (event.key === 'Enter') {
      const active = document.activeElement;
      if (active?.classList?.contains('ft-wide-more__item')) {
        event.preventDefault();
        active.click();
      }
    }
  }

  _refreshItems() {
    if (!this.listEl) return;
    const microEl = document.getElementById('micro-ritual-idle-entry');
    const companionEl = document.querySelector('.session-start-dock__hint');
    const entries = listSecondaryChromeEntries('wide-more', {
      microRitualVisible: Boolean(microEl && !microEl.hidden),
      companionVisible: Boolean(companionEl && !companionEl.hidden),
      companionEnabled: Boolean(
        companionEl && !companionEl.hidden && !companionEl.disabled
      ),
      reminderAvailable: Boolean(
        document.getElementById('reminder-preference-toggle')
      ),
      workEndAvailable: Boolean(
        document.getElementById('work-end-preference-toggle')
      ),
      newsletterSubmitted: hasSubmittedNewsletter(),
      mustardSeedSealUnlocked: resolveMustardSeedSeal(
        typeof localStorage !== 'undefined' ? localStorage : null
      ).unlocked,
      contemplativeArchiveSealMenus: resolveContemplativeArchiveSeal(
        typeof localStorage !== 'undefined' ? localStorage : null
      ).menuEntries,
      companionGeneration:
        canRegisterDesktopCompanionGeneration({
          hasBridge: hasDesktopCompanionBridge(),
          widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
        }) &&
        isCompanionEntitled({
          storage: typeof localStorage !== 'undefined' ? localStorage : null,
          search: typeof location !== 'undefined' ? location.search : ''
        }),
      systemTtsAvailable: canUseSystemTts({
        widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
      }),
      alwaysOnTopAvailable: canUseAlwaysOnTop(),
      windowLayoutAvailable: canUseWindowLayout(),
      inputRhythmAvailable: canUseInputRhythm()
    });

    this.listEl.innerHTML = '';
    const radialListOnly =
      !this._menuFlat && Boolean(this._activeListGroup);
    if (this.sheetTitle) {
      this.sheetTitle.textContent = radialListOnly
        ? t(this._activeListGroup)
        : t('WIDE_MORE_ARIA');
    }
    /** @type {HTMLUListElement | null} */
    let sectionItems = null;
    /** @type {HTMLUListElement | null} */
    let cardItems = null;
    for (const item of entries) {
      if (item.kind === 'group-label') {
        if (radialListOnly) {
          const showGroup =
            item.labelKey === this._activeListGroup ||
            (item.labelKey === 'ritual.menu_group' &&
              this._activeListGroup === 'MENU_GROUP_PRACTICE');
          if (!showGroup) {
            sectionItems = null;
            cardItems = null;
            continue;
          }
        }
        const expanded = radialListOnly
          ? true
          : this._expandedGroups.has(item.labelKey);
        const sectionLi = document.createElement('li');
        sectionLi.className = 'ft-wide-more__section';
        sectionLi.dataset.group = item.labelKey;
        sectionLi.setAttribute('role', 'none');

        const header = document.createElement('button');
        header.type = 'button';
        header.className = 'ft-wide-more__section-header';
        header.dataset.group = item.labelKey;
        header.textContent = t(item.labelKey);
        header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        header.addEventListener('click', (event) => {
          event.stopPropagation();
          if (this._expandedGroups.has(item.labelKey)) {
            this._expandedGroups.delete(item.labelKey);
          } else {
            this._expandedGroups.add(item.labelKey);
          }
          this._refreshItems();
        });

        sectionItems = document.createElement('ul');
        sectionItems.className = 'ft-wide-more__section-items';
        sectionItems.hidden = !expanded;
        sectionLi.append(header, sectionItems);
        this.listEl.appendChild(sectionLi);
        cardItems = null;
        continue;
      }
      if (item.kind === 'sub-group-label') {
        if (!sectionItems) continue;
        const card = document.createElement('li');
        card.className = 'ft-pref-card';
        card.setAttribute('role', 'none');
        const cardHead = document.createElement('p');
        cardHead.className = 'ft-pref-card__label';
        cardHead.textContent = t(item.labelKey);
        cardItems = document.createElement('ul');
        cardItems.className = 'ft-pref-card__items';
        card.append(cardHead, cardItems);
        sectionItems.appendChild(card);
        continue;
      }
      if (!sectionItems) continue;
      const host = cardItems || sectionItems;
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ft-wide-more__item';
      btn.setAttribute('role', 'menuitem');
      btn.dataset.proxy = item.proxy;
      const storage =
        typeof localStorage !== 'undefined' ? localStorage : null;
      if (item.prefKind) {
        fillPreferencesCenterRow(btn, {
          label: t(item.labelKey),
          hint: item.prefHintKey ? t(item.prefHintKey) : '',
          status: readPreferenceCenterStatus(item.proxy, { t, storage }),
          icon: item.prefIcon || '',
          prefKind: item.prefKind,
          toggleOn: item.proxy === 'always-on-top' && this._alwaysOnTopOn === true
        });
      } else {
        btn.textContent = t(item.labelKey);
      }
      if (item.testId) btn.dataset.testid = item.testId;
      if (item.emphasis === 'beige-cta') {
        btn.classList.add('is-beige-cta');
      }
      if (item.locked) {
        decorateSecondaryLockButton(btn, item, t);
      } else if (item.interactive === false) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-static');
      }
      const hintId = SECONDARY_PROXY_HINT_IDS[item.proxy];
      const showDot =
        Boolean(hintId) && this.handlers.isHintUnread?.(hintId) === true;
      syncSecondaryMenuHintDot(btn, showDot);
      if (item.hoverTipKey) {
        attachGlassHoverTip(btn, {
          placement: 'left',
          multiline: true,
          tipId: `ft-menu-hover-tip-${item.proxy}`,
          text: t(item.hoverTipKey)
        });
      }
      li.appendChild(btn);
      host.appendChild(li);
    }
    if (radialListOnly) void this._hydratePrefToggles();
  }

  /**
   * @returns {Promise<void>}
   */
  async _hydratePrefToggles() {
    this._alwaysOnTopOn = await readAlwaysOnTopEnabled();
    const sw = this.listEl?.querySelector(
      '[data-proxy="always-on-top"] [data-pref-switch]'
    );
    if (sw) sw.dataset.on = this._alwaysOnTopOn ? '1' : '0';
  }

  /**
   * @param {string} key
   * @param {HTMLElement} item
   * @returns {Promise<void>}
   */
  async _onPrefToggle(key, item) {
    if (key !== 'always-on-top') return;
    const sw = item.querySelector('[data-pref-switch]');
    const next = !(this._alwaysOnTopOn === true);
    if (sw) sw.dataset.on = next ? '1' : '0';
    const result = await writeAlwaysOnTopEnabled(next);
    this._alwaysOnTopOn = result.enabled;
    if (sw) sw.dataset.on = result.enabled ? '1' : '0';
  }

  /**
   * @param {string | null} key
   * @param {{ locked?: boolean, interactive?: boolean }} [entryMeta]
   * @returns {void}
   */
  _proxy(key, entryMeta) {
    const result = dispatchSecondaryChromeProxy(
      key,
      {
        handlers: this.handlers,
        closeFirst: false,
        runPrelude: true,
        clearStage: () => this.clearStage(),
        close: () => this.closeMenu(),
        addStage: (stage) => {
          const cls = WIDE_STAGE_CLASS[stage];
          if (cls) document.body.classList.add(cls);
        }
      },
      entryMeta
    );
    if (result !== 'unknown') return;

    if (key === 'sound') {
      this.clearStage();
      document.body.classList.add(WIDE_STAGE_CLASS.sound);
      invokeHandler(this.handlers, 'onSound');
      return;
    }

    const map = {
      breath: () => document.getElementById('micro-ritual-idle-entry')
    };
    const el = map[key]?.();
    if (!el || el.disabled || el.hidden) return;
    const prev = el.style.pointerEvents;
    el.style.pointerEvents = 'auto';
    el.click();
    el.style.pointerEvents = prev;
  }

  _injectStyles() {
    for (const el of document.querySelectorAll(
      'style[id^="ft-wide-idle-more-styles"]'
    )) {
      if (el.id !== STYLE_ID) el.remove();
    }
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .session-start-dock__cta-row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 14px;
        pointer-events: auto;
        max-width: min(520px, 100%);
        /* 与蒲团再拉开一点，避免四球贴底缘 */
        margin-top: 8px;
      }
      .session-start-dock__cta-row[hidden] {
        display: none !important;
      }

      .ft-wide-home-ctas {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        flex: 1 1 auto;
        min-width: 0;
        pointer-events: auto;
      }
      .ft-wide-home-ctas__row {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        gap: 8px;
        width: 100%;
      }
      .ft-home-begin-practice {
        box-sizing: border-box;
        margin: 0;
        padding: 10px 22px;
        min-height: 40px;
        border: none;
        border-radius: 999px;
        background: #b08948;
        color: #fffaf2;
        font-size: 0.92rem;
        font-weight: 650;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(44, 31, 20, 0.12);
      }
      .ft-home-begin-practice:active:not(:disabled) {
        transform: scale(0.98);
      }
      .ft-home-begin-practice:disabled,
      .ft-home-begin-practice[aria-disabled="true"],
      .ft-home-begin-practice[hidden] {
        opacity: 0.45;
      }
      .ft-home-begin-practice[hidden] {
        display: none !important;
      }
      .ft-wide-home-ctas[hidden] {
        display: none !important;
      }
      /* Arrival keepQuickStart: CSS belt matches NarrowIdleShell.is-arrival-quick */
      .ft-wide-home-ctas.is-arrival-quick #ft-wide-home-sit,
      .ft-wide-home-ctas.is-arrival-quick #ft-home-begin-practice,
      .ft-wide-home-ctas.is-arrival-quick #ft-wide-home-honesty {
        display: none !important;
      }
      /* Companion 三选一: hide leftover Breath/Quick home ball (Quick Start retired). */
      body.ft-wide-park-secondary.ft-wide-stage-companion #ft-wide-home-quickstart {
        display: none !important;
      }
      .ft-wide-home-ctas__btn.is-asset[hidden] {
        display: none !important;
      }
      .ft-wide-home-ctas__btn.is-asset {
        flex: 0 0 auto;
        box-sizing: border-box;
        width: ${HOME_CTA_PX}px;
        height: ${HOME_CTA_PX}px;
        min-height: ${HOME_CTA_PX}px;
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        line-height: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: none;
      }
      #ft-wide-home-sit.ft-wide-home-ctas__btn.is-asset {
        width: ${HOME_SIT_PX}px;
        height: ${HOME_SIT_PX}px;
        min-height: ${HOME_SIT_PX}px;
      }
      .ft-wide-home-ctas__btn.is-asset:disabled,
      .ft-wide-home-ctas__btn.is-asset[aria-disabled="true"] {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .ft-wide-home-ctas__btn.is-asset:active:not(:disabled) {
        transform: scale(0.96);
      }
      .ft-wide-home-ctas__img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
        user-select: none;
        -webkit-user-drag: none;
      }
      .ft-wide-home-ctas__btn.is-text {
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.72);
        line-height: 1.1;
        color: rgba(74, 58, 40, 0.9);
        box-shadow: 0 4px 14px rgba(44, 31, 20, 0.08);
      }
      .ft-wide-home-ctas__text {
        display: block;
        max-width: 56px;
        padding: 0 4px;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        text-align: center;
        pointer-events: none;
        user-select: none;
      }

      .ft-wide-more {
        position: relative;
        flex: 0 0 auto;
        pointer-events: auto;
      }
      .ft-wide-more__btn {
        width: 44px;
        height: 44px;
        padding: 0;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: rgba(92, 72, 52, 0.88);
        font-size: 22px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 2px 0 rgba(165, 130, 85, 0.18),
          0 3px 8px rgba(44, 31, 20, 0.08);
      }
      .ft-wide-more__btn:hover {
        filter: brightness(1.03);
      }
      .ft-wide-more__btn:active {
        transform: scale(0.96);
      }
      .ft-wide-more__btn[hidden] {
        display: none !important;
      }
      .ft-wide-more__edge-zone {
        position: absolute;
        left: 50%;
        bottom: calc(-1 * ${EDGE_RECALL_HIT_PX}px);
        transform: translateX(-50%);
        width: calc(100% + ${EDGE_RECALL_HIT_PX * 2}px);
        height: calc(100% + ${EDGE_RECALL_HIT_PX}px);
        pointer-events: none;
      }
      .ft-wide-more.is-edge-recall .ft-wide-more__edge-zone {
        pointer-events: auto;
      }
      .ft-wide-more.is-edge-recall:not(.is-edge-recall-revealed) .ft-wide-more__btn {
        opacity: 0;
        transform: scale(0.92);
        pointer-events: none;
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .ft-wide-more.is-edge-recall.is-edge-recall-revealed .ft-wide-more__btn,
      .ft-wide-more.is-edge-recall:focus-within .ft-wide-more__btn {
        opacity: 1;
        transform: none;
        pointer-events: auto;
      }
      .ft-wide-more__backdrop {
        position: fixed;
        inset: 0;
        z-index: ${Z.SUPPORT_DIM};
        margin: 0;
        padding: 0;
        border: 0;
        background: rgba(44, 31, 20, 0.16);
        cursor: pointer;
      }
      .ft-wide-more__backdrop[hidden] {
        display: none !important;
      }
      .ft-wide-more-radial {
        position: fixed;
        top: 50%;
        right: calc(max(12px, env(safe-area-inset-right, 0px)) + min(400px, 100vw - 48px) + 8px);
        left: auto;
        bottom: auto;
        transform: translateY(-50%);
        z-index: ${Z.SUPPORT_MODAL};
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: min(280px, calc(100vw - 48px));
        max-height: min(72vh, 560px);
        margin: 0;
        padding: 14px 12px 12px;
        overflow: auto;
        pointer-events: auto;
        border-radius: 18px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.08);
      }
      .ft-wide-more-radial[hidden] {
        display: none !important;
      }
      .ft-wide-more-radial__heading {
        margin: 0 8px 6px;
        font-size: 0.72rem;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(74, 58, 40, 0.55);
      }
      .ft-wide-more-radial__icon {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 44px;
        margin: 0;
        padding: 8px 12px;
        border-radius: 14px;
        border: 1px solid transparent;
        background: transparent;
        color: rgba(74, 58, 40, 0.92);
        font-size: 15px;
        line-height: 1.2;
        text-align: left;
        cursor: pointer;
        pointer-events: auto;
        transition: background 160ms ease, transform 160ms ease;
      }
      .ft-wide-more-radial__icon:hover,
      .ft-wide-more-radial__icon:focus-visible {
        background: rgba(255, 252, 245, 0.95);
        border-color: rgba(139, 115, 85, 0.22);
      }
      .ft-wide-more-radial__glyph {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 28px;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(255, 252, 245, 0.9);
        font-size: 14px;
      }
      .ft-wide-more-radial__name {
        position: static;
        transform: none;
        padding: 0;
        border-radius: 0;
        background: none;
        box-shadow: none;
        font-size: 0.92rem;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: rgba(74, 58, 40, 0.92);
        white-space: normal;
        opacity: 1;
        pointer-events: none;
      }
      .ft-wide-more-radial__icon:active {
        transform: scale(0.99);
      }
      @media (prefers-reduced-motion: reduce) {
        .ft-wide-more-radial__icon {
          transition: opacity 120ms ease;
        }
        body.ft-wide-more-radial-open .ft-wide-more-radial__icon {
          transform: none;
        }
      }
      .ft-wide-more__menu {
        position: fixed;
        top: max(16px, env(safe-area-inset-top, 0px));
        right: max(12px, env(safe-area-inset-right, 0px));
        bottom: auto;
        left: auto;
        transform: none;
        width: min(400px, calc(100vw - 48px));
        min-width: 0;
        max-width: 420px;
        max-height: calc(100dvh - 32px - 96px);
        height: auto;
        display: flex;
        flex-direction: column;
        padding: 10px 12px 12px;
        border-radius: 16px;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.08);
        z-index: ${Z.SUPPORT_MODAL + 1};
        overflow: hidden;
      }
      .ft-wide-more__menu[hidden] {
        display: none !important;
      }
      .ft-wide-more__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex: 0 0 auto;
        padding: 4px 4px 10px 8px;
      }
      .ft-wide-more__title {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 650;
        letter-spacing: -0.02em;
        color: rgba(74, 58, 40, 0.92);
      }
      .ft-wide-more__close {
        width: 32px;
        height: 32px;
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: rgba(74, 58, 40, 0.55);
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
      }
      .ft-wide-more__close:hover,
      .ft-wide-more__close:focus-visible {
        background: rgba(255, 252, 245, 0.95);
        color: rgba(74, 58, 40, 0.88);
      }
      .ft-wide-more__list {
        list-style: none;
        margin: 0;
        padding: 0 2px 4px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        scrollbar-color: rgba(92, 67, 48, 0.22) transparent;
      }
      .ft-wide-more__list::-webkit-scrollbar {
        width: 6px;
      }
      .ft-wide-more__list::-webkit-scrollbar-thumb {
        background: rgba(92, 67, 48, 0.18);
        border-radius: 999px;
      }
      .ft-wide-more__list::-webkit-scrollbar-track {
        background: transparent;
      }
      .ft-pref-card {
        list-style: none;
        margin: 0;
        padding: 6px 0 2px;
        border-radius: 14px;
        background: rgba(255, 252, 245, 0.72);
        border: 1px solid rgba(139, 115, 85, 0.16);
      }
      .ft-pref-card__label {
        margin: 0;
        padding: 8px 16px 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(92, 67, 48, 0.55);
      }
      .ft-pref-card__items {
        list-style: none;
        margin: 0;
        padding: 0 4px 4px;
      }
      .ft-pref-row {
        position: relative;
        overflow: visible;
        display: flex !important;
        align-items: center;
        gap: 12px;
        min-height: 64px;
        padding: 10px 14px 10px 12px !important;
        text-align: left;
      }
      .ft-pref-row__icon {
        flex: 0 0 22px;
        color: rgba(92, 67, 48, 0.55);
        font-size: 15px;
        text-align: center;
      }
      .ft-pref-row__copy {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .ft-pref-row__title {
        font-size: 15px;
        font-weight: 600;
        color: rgba(74, 58, 40, 0.94);
      }
      .ft-pref-row__hint {
        font-size: 12px;
        font-weight: 400;
        color: rgba(92, 67, 48, 0.58);
      }
      .ft-pref-row__trail {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(92, 67, 48, 0.5);
        font-size: 13px;
      }
      .ft-pref-row__chevron {
        font-size: 18px;
        line-height: 1;
        opacity: 0.55;
      }
      .ft-pref-row__switch {
        width: 40px;
        height: 24px;
        border-radius: 999px;
        background: rgba(139, 115, 85, 0.22);
        position: relative;
      }
      .ft-pref-row__switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(44, 31, 20, 0.16);
        transition: transform 160ms ease;
      }
      .ft-pref-row__switch[data-on="1"] {
        background: #7d9a6a;
      }
      .ft-pref-row__switch[data-on="1"]::after {
        transform: translateX(16px);
      }
      .ft-wide-more__section {
        list-style: none;
      }
      .ft-wide-more__section-header {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 10px 12px 6px;
        border: 0;
        background: transparent;
        text-align: left;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(92, 67, 48, 0.78);
        cursor: pointer;
      }
      .ft-wide-more__section-header:hover {
        color: rgba(92, 67, 48, 0.92);
      }
      .ft-wide-more__section-items {
        list-style: none;
        margin: 0;
        padding: 0 0 4px;
      }
      .ft-wide-more__section-items[hidden] {
        display: none !important;
      }
      .ft-wide-more__item {
        display: block;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        padding: 10px 28px 10px 12px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--color-ink, #2c1f14);
        font-size: 13px;
        font-weight: 500;
        line-height: 1.35;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .ft-wide-more__item:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }
      .ft-wide-more__item.is-locked {
        opacity: 0.62;
        cursor: pointer;
      }
      .ft-wide-more__item:disabled {
        opacity: 0.48;
        cursor: not-allowed;
      }
      .ft-wide-more__item .ft-secondary-menu-lock {
        margin-left: 8px;
        font-size: 11px;
        opacity: 0.7;
      }
      .ft-wide-more__item:hover {
        background: rgba(255, 246, 230, 0.9);
        border-color: rgba(139, 115, 85, 0.18);
      }
      .ft-wide-more__item:disabled:hover {
        background: transparent;
        border-color: transparent;
      }
      .ft-wide-more__item.is-beige-cta {
        text-align: center;
        padding-right: 12px;
        font-weight: 700;
        white-space: normal;
        border: 1px solid rgba(139, 115, 85, 0.36);
        color: var(--color-ink, #2c1f14);
        background: linear-gradient(
          180deg,
          rgba(255, 252, 245, 0.96) 0%,
          #ede0c4 100%
        );
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 2px 0 rgba(165, 130, 85, 0.22),
          0 3px 8px rgba(44, 31, 20, 0.08);
      }
      .ft-wide-more__item.is-beige-cta:hover {
        background: linear-gradient(180deg, #fffcf4 0%, #ede0c4 100%);
        border-color: rgba(139, 115, 85, 0.42);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.92) inset,
          0 2px 0 rgba(165, 130, 85, 0.28),
          0 4px 10px rgba(44, 31, 20, 0.12);
      }
      .ft-wide-more__item.is-beige-cta:active {
        transform: translateY(1px) scale(0.98);
      }
      .ft-secondary-menu-hint-dot {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6db3a0;
        box-shadow: 0 0 0 2px rgba(255, 252, 245, 0.95);
        pointer-events: none;
        animation: ft-secondary-menu-hint-pulse 1.6s ease-in-out infinite;
      }
      @keyframes ft-secondary-menu-hint-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.55; transform: scale(0.85); }
      }

      /*
       * Park secondary Idle chrome off-canvas on wide Idle (incl. Arrival).
       * Elements remain in DOM for proxy .click().
       * Dock Sit/⚡: park whenever not Focusing Rise (ft-wide-show-dock-rise),
       * so Idle never flashes the old orange Sit pill.
       */
      @media (min-width: 480px) {
        body.ft-wide-park-secondary .session-start-dock__honesty-entry,
        body.ft-wide-park-secondary .session-start-dock__micro-ritual-entry,
        body.ft-wide-park-secondary .session-start-dock__hint,
        body.ft-wide-park-secondary .ambient-soundscape__fab,
        body.ft-wide-park-secondary #reminder-preference-toggle,
        body.ft-wide-park-secondary #work-end-preference-toggle,
        body:not(.ft-wide-show-dock-rise) #btn-focus,
        body:not(.ft-wide-show-dock-rise) #quick-start-focus {
          position: fixed !important;
          left: -10000px !important;
          top: 0 !important;
          width: 1px !important;
          height: 1px !important;
          margin: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: ${Z.PARK} !important;
        }
      }

      /* Wide Idle: stage Soundscape panel on-canvas (never red FAB / gated tip-only).
       * Must match AmbientSoundscapeUI wide-stage-sound：靠右，勿居中挡阿寅。 */
      @media (min-width: 480px) {
        body.ft-wide-park-secondary.ft-wide-stage-sound .ambient-soundscape__focus-chrome {
          position: fixed !important;
          left: auto !important;
          right: 14px !important;
          top: auto !important;
          bottom: max(100px, env(safe-area-inset-bottom, 0px)) !important;
          transform: none !important;
          width: min(300px, calc(100vw - 48px)) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          z-index: ${Z.NARROW_STAGE} !important;
          align-items: stretch !important;
        }
        body.ft-wide-park-secondary.ft-wide-stage-sound .ambient-soundscape__panel {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
        body.ft-wide-park-secondary.ft-wide-stage-sound .ambient-soundscape__fab,
        body.ft-wide-park-secondary.ft-wide-stage-sound .ambient-soundscape__nudge {
          display: none !important;
        }

      }
    `;
    document.head.appendChild(style);
  }
}
