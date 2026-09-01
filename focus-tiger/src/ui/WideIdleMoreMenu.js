/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  WIDE_STAGE_CLASS,
  listSecondaryChromeEntries,
  SECONDARY_PROXY_HINT_IDS,
  syncSecondaryMenuHintDot
} from '../core/idleChromeOrchestration.js';
import { hasSubmittedNewsletter } from '../core/newsletter/newsletterCaptureGate.js';
import { resolveMustardSeedSeal } from '../core/mustardSeedSeal.js';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';
import {
  canRegisterDesktopCompanionGeneration,
  hasDesktopCompanionBridge
} from '../core/desktopCompanionGate.js';
import { isCompanionEntitled } from '../core/companionEntitlement.js';

const STYLE_ID = 'ft-wide-idle-more-styles-v6';
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
   *     onFiveMoments?: () => void,
     *     onJourneyLog?: () => void,
     *     onYinCoin?: () => void,
     *     onConfide?: () => void,
   *     onZenCinema?: () => void,
   *     onDailyQuote?: () => void,
   *     onMustardSeedSeal?: () => void,
   *     onWallpapers?: () => void,
     *     onSanctuary?: () => void,
     *     onMembership?: () => void,
     *     onTipJar?: () => void,
     *     onNewsletter?: () => void,
     *     onCommunity?: () => void,
     *     onRitualFlow?: (proxy: string) => void,
   *     onSound?: () => void,
   *     onHonesty?: () => void,
   *     onQuickStart?: () => void,
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
    this._menuOpen = false;
    this._localeUnsub = null;
    this._refreshingHomeCtas = false;

    this._mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(WIDE_MQ)
        : null;

    this._injectStyles();
    this._ensureBuilt();
    this._bind();
    this._sync();
    this._localeUnsub = onLocaleChange(() => {
      this._refreshLabels();
      this._refreshHomeCtas();
      if (this._menuOpen) this._refreshItems();
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
   * @param {{ keepQuickStart?: boolean }} [opts]
   * @returns {void}
   */
  setSuppressed(suppressed, opts = {}) {
    this._suppressed = Boolean(suppressed);
    this._keepQuickStart =
      Boolean(opts.keepQuickStart) && this._suppressed;
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
    if (!this._isWide() || !this._idle || this._suppressed) return;
    this._menuOpen = true;
    this._refreshItems();
    this._sync();
    this.moreBtn?.setAttribute('aria-expanded', 'true');
    this.handlers.onMenuChange?.(true);
  }

  /**
   * @returns {void}
   */
  closeMenu() {
    if (!this._menuOpen) return;
    this._menuOpen = false;
    this._sync();
    this.moreBtn?.setAttribute('aria-expanded', 'false');
    this.handlers.onMenuChange?.(false);
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
      WIDE_STAGE_CLASS.language
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
      WIDE_STAGE_CLASS.language
    );
  }

  /**
   * Dismiss staged secondary panels (Soundscape / companion / reminder).
   * @returns {void}
   */
  clearStage() {
    this._dropStageClasses();
    // Growth glass cards *are* the overlay — onClearStage closes them via
    // idleSecondaryPanelHost; suppress after open would flash-dismiss Quiet Line /
    // Wallpapers rows (7940bfaa · isGrowthCardOverlayActive).
    if (this.handlers.isGrowthCardOverlayActive?.()) return;
    this.handlers.onClearStage?.();
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
    this._localeUnsub?.();
    this._mq?.removeEventListener?.('change', this._onMqChange);
    document.removeEventListener('pointerdown', this._onDocPointer, true);
    document.removeEventListener('keydown', this._onKeyDown, true);
    this._dockObserver?.disconnect?.();
    this.wrap?.remove();
    this.menu?.remove();
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
      WIDE_STAGE_CLASS.language
    );
  }

  _isWide() {
    if (this._mq) return this._mq.matches;
    return typeof window !== 'undefined' && window.innerWidth >= 480;
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
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-quickstart" data-proxy="quickstart" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_QUICK}" alt="" width="${HOME_CTA_PX}" height="${HOME_CTA_PX}" draggable="false" decoding="async" />
      </button>
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-sit" data-proxy="sit" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_SIT}" alt="" width="${HOME_SIT_PX}" height="${HOME_SIT_PX}" draggable="false" decoding="async" />
      </button>
      <button type="button" class="ft-wide-home-ctas__btn is-asset" id="ft-wide-home-honesty" data-proxy="honesty" aria-label="">
        <img class="ft-wide-home-ctas__img" src="${ICON_HONESTY}" alt="" width="${HOME_CTA_PX}" height="${HOME_CTA_PX}" draggable="false" decoding="async" />
      </button>
    `;
    this.sitHomeBtn = this.homeCtas.querySelector('#ft-wide-home-sit');
    this.quickHomeBtn = this.homeCtas.querySelector('#ft-wide-home-quickstart');
    this.honestyHomeBtn = this.homeCtas.querySelector('#ft-wide-home-honesty');

    this.wrap = document.createElement('div');
    this.wrap.className = 'ft-wide-more';
    this.wrap.id = 'ft-wide-more';

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

    this.listEl = document.createElement('ul');
    this.listEl.className = 'ft-wide-more__list';
    this.menu.appendChild(this.listEl);

    this.wrap.append(this.moreBtn);
    // Portal sheet + scrim to body so they can sit above Support/mute (z24)
    // without remaining trapped in the dock stacking context (z16).
    document.body.append(this.backdrop, this.menu);

    // Three balls + ⋯; leave hint / Honesty / breath / Sit+⚡ pills in dock for proxy
    this.ctaRow.append(this.homeCtas, this.wrap);
    dock.appendChild(this.ctaRow);

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

    this.listEl?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-proxy]');
      if (!item || item.disabled) return;
      const key = item.getAttribute('data-proxy');
      this.closeMenu();
      requestAnimationFrame(() => this._proxy(key));
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
    if (this.homeCtas) {
      this.homeCtas.setAttribute('aria-label', t('NARROW_SHEET_TITLE'));
    }
    this._refreshHomeCtas();
  }

  /**
   * Keep home Quick Start / Sit / Honesty enablement in sync with parked pills.
   * @returns {void}
   */
  _refreshHomeCtas() {
    if (!this.homeCtas || this._refreshingHomeCtas) return;
    this._refreshingHomeCtas = true;
    try {
      const focusEl = document.getElementById('btn-focus');
      if (this.sitHomeBtn) {
        const sitLabel = focusEl?.textContent?.trim() || t('BTN_FOCUS_START');
        setAttrIfChanged(this.sitHomeBtn, 'aria-label', sitLabel);
        if (this.sitHomeBtn.title !== sitLabel) this.sitHomeBtn.title = sitLabel;
        const sitOk = Boolean(focusEl) && !focusEl.hidden && !focusEl.disabled;
        setBoolPropIfChanged(this.sitHomeBtn, 'disabled', !sitOk);
        setAttrIfChanged(
          this.sitHomeBtn,
          'aria-disabled',
          sitOk ? 'false' : 'true'
        );
        setBoolPropIfChanged(
          this.sitHomeBtn,
          'hidden',
          // keepQuickStart: force-hide Sit (CSS is-arrival-quick is belt).
          Boolean(this._keepQuickStart) || !focusEl || focusEl.hidden
        );
      }

      const quickEl = document.getElementById('quick-start-focus');
      if (this.quickHomeBtn) {
        const qsLabel = t('QUICK_START_ARIA');
        setAttrIfChanged(this.quickHomeBtn, 'aria-label', qsLabel);
        // Home left ball: no mint pulse (2026-08-11) — always keep hover label.
        if (this.quickHomeBtn.title !== qsLabel) {
          this.quickHomeBtn.title = qsLabel;
        }
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
        const honestyLabel = t('HONESTY_IDLE_ENTRY');
        setAttrIfChanged(this.honestyHomeBtn, 'aria-label', honestyLabel);
        if (this.honestyHomeBtn.title !== honestyLabel) {
          this.honestyHomeBtn.title = honestyLabel;
        }
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
    if (key === 'quickstart') {
      this.handlers.onQuickStart?.();
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
      const el = document.getElementById('honesty-idle-entry');
      if (el && !el.disabled && !el.hidden) {
        const prev = el.style.pointerEvents;
        el.style.pointerEvents = 'auto';
        el.click();
        el.style.pointerEvents = prev;
        return;
      }
      this.handlers.onHonesty?.();
    }
  }

  _bind() {
    this._onMqChange = () => {
      if (!this._isWide()) this.closeMenu();
      this._sync();
    };
    this._mq?.addEventListener?.('change', this._onMqChange);

    this._onDocPointer = (event) => {
      if (!this._menuOpen) return;
      if (shouldIgnoreOutsideDismissTarget(event.target)) return;
      const target = /** @type {Node} */ (event.target);
      if (this.wrap?.contains(target)) return;
      if (this.menu?.contains(target)) return;
      this.closeMenu();
    };
    document.addEventListener('pointerdown', this._onDocPointer, true);

    this._onKeyDown = (event) => {
      if (!this._menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeMenu();
        this.moreBtn?.focus();
      }
    };
    document.addEventListener('keydown', this._onKeyDown, true);
  }

  _sync() {
    this._ensureBuilt();
    const wide = this._isWide();
    const park = wide && this._idle;
    const keepQs = Boolean(this._keepQuickStart);
    const showMore = park && !this._suppressed;
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
    if (this.moreBtn) this.moreBtn.hidden = !showMore;
    const sheetOpen = this._menuOpen && showMore;
    if (this.menu) this.menu.hidden = !sheetOpen;
    if (this.backdrop) this.backdrop.hidden = !sheetOpen;
    if (!showMore) this._menuOpen = false;
    if (park) this._refreshHomeCtas();
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
      newsletterSubmitted: hasSubmittedNewsletter(),
      mustardSeedSealUnlocked: resolveMustardSeedSeal(
        typeof localStorage !== 'undefined' ? localStorage : null
      ).unlocked,
      companionGeneration:
        canRegisterDesktopCompanionGeneration({
          hasBridge: hasDesktopCompanionBridge(),
          widthPx: typeof window !== 'undefined' ? window.innerWidth : 0
        }) &&
        isCompanionEntitled({
          storage: typeof localStorage !== 'undefined' ? localStorage : null,
          search: typeof location !== 'undefined' ? location.search : ''
        })
    });

    this.listEl.innerHTML = '';
    for (const item of entries) {
      const li = document.createElement('li');
      if (item.kind === 'group-label') {
        li.setAttribute('role', 'presentation');
        const label = document.createElement('div');
        label.className = 'ft-wide-more__group';
        label.dataset.group = item.labelKey;
        label.textContent = t(item.labelKey);
        li.appendChild(label);
        this.listEl.appendChild(li);
        continue;
      }
      li.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ft-wide-more__item';
      btn.setAttribute('role', 'menuitem');
      btn.dataset.proxy = item.proxy;
      btn.textContent = t(item.labelKey);
      if (item.testId) btn.dataset.testid = item.testId;
      if (item.emphasis === 'beige-cta') {
        btn.classList.add('is-beige-cta');
      }
      if (item.locked) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.title = t('ritual.menu_locked');
        btn.classList.add('is-locked');
      } else if (item.interactive === false) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('is-static');
      }
      const hintId = SECONDARY_PROXY_HINT_IDS[item.proxy];
      const showDot =
        Boolean(hintId) && this.handlers.isHintUnread?.(hintId) === true;
      syncSecondaryMenuHintDot(btn, showDot);
      li.appendChild(btn);
      this.listEl.appendChild(li);
    }
  }

  /**
   * @param {string | null} key
   * @returns {void}
   */
  _proxy(key) {
    if (key === 'companion') {
      this.clearStage();
      document.body.classList.add(WIDE_STAGE_CLASS.companion);
      this.handlers.onClearCompanion?.();
      this.handlers.onCompanion?.();
      return;
    }
    if (key === 'reminder') {
      this.clearStage();
      document.body.classList.add(WIDE_STAGE_CLASS.reminder);
      this.handlers.onReminder?.();
      return;
    }
    if (key === 'language') {
      this.clearStage();
      document.body.classList.add(WIDE_STAGE_CLASS.language);
      this.handlers.onLanguage?.();
      return;
    }
    if (key === 'five-moments') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onFiveMoments?.();
      return;
    }
    if (key === 'journey-log') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onJourneyLog?.();
      return;
    }
    if (key === 'presence-signals') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onPresenceSignals?.();
      return;
    }
    if (key === 'yin-coin') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onYinCoin?.();
      return;
    }
    if (key === 'confide') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onConfide?.();
      return;
    }
    if (key === 'zen-cinema') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onZenCinema?.();
      return;
    }
    if (key === 'daily-quote') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onDailyQuote?.();
      return;
    }
    if (key === 'mustard-seed-seal') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onMustardSeedSeal?.();
      return;
    }
    if (key === 'wallpapers') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onWallpapers?.();
      return;
    }
    if (key === 'sanctuary') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onSanctuary?.();
      return;
    }
    if (key === 'membership') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onMembership?.();
      return;
    }
    if (key === 'tip-jar') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onTipJar?.();
      return;
    }
    if (key === 'newsletter') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onNewsletter?.();
      return;
    }
    if (key === 'community') {
      this.clearStage();
      this.closeMenu();
      this.handlers.onCommunity?.();
      return;
    }
    if (
      key === 'ritual-morning' ||
      key === 'ritual-emotional-reset' ||
      key === 'ritual-work-transition'
    ) {
      this.clearStage();
      this.closeMenu();
      this.handlers.onRitualFlow?.(key);
      return;
    }
    if (key === 'sound') {
      this.clearStage();
      document.body.classList.add(WIDE_STAGE_CLASS.sound);
      this.handlers.onSound?.();
      return;
    }
    if (key === 'honesty') {
      this._proxyHome('honesty');
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
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        gap: 8px;
        flex: 1 1 auto;
        min-width: 0;
        pointer-events: auto;
      }
      .ft-wide-home-ctas[hidden] {
        display: none !important;
      }
      /* Arrival keepQuickStart: CSS belt matches NarrowIdleShell.is-arrival-quick */
      .ft-wide-home-ctas.is-arrival-quick #ft-wide-home-sit,
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
      .ft-wide-more__backdrop {
        position: fixed;
        inset: 0;
        z-index: 25;
        margin: 0;
        padding: 0;
        border: 0;
        background: rgba(44, 31, 20, 0.16);
        cursor: pointer;
      }
      .ft-wide-more__backdrop[hidden] {
        display: none !important;
      }
      .ft-wide-more__menu {
        position: fixed;
        top: max(16px, env(safe-area-inset-top, 0px));
        right: max(12px, env(safe-area-inset-right, 0px));
        bottom: max(108px, calc(env(safe-area-inset-bottom, 0px) + 96px));
        left: max(56vw, calc(100vw - 312px));
        transform: none;
        width: auto;
        min-width: 0;
        max-width: none;
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-radius: 14px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: rgba(255, 252, 245, 0.62);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.06);
        z-index: 26;
        overflow: hidden;
      }
      .ft-wide-more__menu[hidden] {
        display: none !important;
      }
      .ft-wide-more__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
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
        font-weight: 600;
        line-height: 1.35;
        cursor: pointer;
        transition: transform 120ms ease;
      }
      .ft-wide-more__item:active:not(:disabled):not(.is-locked) {
        transform: translateY(1px) scale(0.98);
      }
      .ft-wide-more__item.is-locked,
      .ft-wide-more__item:disabled {
        opacity: 0.48;
        cursor: not-allowed;
      }
      .ft-wide-more__group {
        padding: 10px 12px 4px;
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(92, 67, 48, 0.72);
      }
      .ft-wide-more__item:hover {
        background: rgba(255, 246, 230, 0.9);
        border-color: rgba(139, 115, 85, 0.18);
      }
      .ft-wide-more__item.is-locked:hover,
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
          z-index: -1 !important;
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
          z-index: 32 !important;
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
        body.ft-wide-park-secondary.ft-wide-stage-reminder .reminder-pref__panel {
          position: fixed !important;
          left: 50% !important;
          right: auto !important;
          bottom: max(108px, calc(env(safe-area-inset-bottom, 0px) + 96px)) !important;
          transform: translateX(-50%) !important;
          translate: none !important;
          width: min(260px, calc(100vw - 48px)) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          z-index: 32 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
