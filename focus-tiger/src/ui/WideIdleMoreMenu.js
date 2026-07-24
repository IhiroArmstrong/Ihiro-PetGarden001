import { t, onLocaleChange } from '../locales/i18n.js';

const STYLE_ID = 'ft-wide-idle-more-styles';
const WIDE_MQ = '(min-width: 480px)';

/**
 * Wide Idle (≥480) declutter: resident Sit + ⚡ + ⋯; secondary chrome in upward popover.
 * Narrow (≤479) is owned by NarrowIdleShell — this shell stays inert there.
 *
 * Proxies existing DOM (Honesty / breath / How / Sound FAB / reminder), same idea as
 * the narrow drawer, without the swipe-sheet form.
 */
export class WideIdleMoreMenu {
  /**
   * @param {{
   *   handlers?: {
   *     onCompanion?: () => void,
   *     onReminder?: () => void,
   *     onSound?: () => void,
   *     onHonesty?: () => void,
   *     onClearCompanion?: () => void,
   *     onClearStage?: () => void,
   *   }
   * }} [options]
   */
  constructor(options = {}) {
    this.handlers = options.handlers || {};
    this._idle = true;
    this._suppressed = false;
    this._menuOpen = false;
    this._localeUnsub = null;

    this._mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(WIDE_MQ)
        : null;

    this._injectStyles();
    this._build();
    this._bind();
    this._sync();
    this._localeUnsub = onLocaleChange(() => {
      this._refreshLabels();
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
   * Arrival / Honesty / Reflection / bridge: hide ⋯ (Sit already hidden by CompanionModePicker).
   * Secondary chrome stays parked so pills do not poke through overlays.
   * @param {boolean} suppressed
   * @returns {void}
   */
  setSuppressed(suppressed) {
    this._suppressed = Boolean(suppressed);
    if (this._suppressed) {
      this.closeMenu();
      this.clearStage();
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
  }

  /**
   * @returns {void}
   */
  closeMenu() {
    if (!this._menuOpen) return;
    this._menuOpen = false;
    this._sync();
    this.moreBtn?.setAttribute('aria-expanded', 'false');
  }

  /**
   * Dismiss staged secondary panels (Soundscape / companion / reminder).
   * @returns {void}
   */
  clearStage() {
    document.body.classList.remove(
      'ft-wide-stage-sound',
      'ft-wide-stage-companion',
      'ft-wide-stage-reminder'
    );
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
    this.wrap?.remove();
    document.getElementById(STYLE_ID)?.remove();
    document.body.classList.remove('ft-wide-park-secondary', 'ft-wide-more-open', 'ft-wide-stage-sound', 'ft-wide-stage-companion', 'ft-wide-stage-reminder');
  }

  _isWide() {
    if (this._mq) return this._mq.matches;
    return typeof window !== 'undefined' && window.innerWidth >= 480;
  }

  _build() {
    const dock = document.getElementById('session-start-dock');
    const focusBtn = document.getElementById('btn-focus');
    const quickStart = document.getElementById('quick-start-focus');
    if (!dock || !focusBtn) return;

    this.ctaRow = document.createElement('div');
    this.ctaRow.className = 'session-start-dock__cta-row';

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

    this.menu = document.createElement('div');
    this.menu.id = 'ft-wide-more-menu';
    this.menu.className = 'ft-wide-more__menu';
    this.menu.setAttribute('role', 'menu');
    this.menu.hidden = true;

    this.listEl = document.createElement('ul');
    this.listEl.className = 'ft-wide-more__list';
    this.menu.appendChild(this.listEl);

    this.wrap.append(this.moreBtn, this.menu);

    // Sit + ⚡ + ⋯ in one row; leave hint / Honesty / breath in dock for proxy clicks
    this.ctaRow.appendChild(focusBtn);
    if (quickStart) this.ctaRow.appendChild(quickStart);
    this.ctaRow.appendChild(this.wrap);
    dock.appendChild(this.ctaRow);

    this._refreshLabels();
  }

  _refreshLabels() {
    if (!this.moreBtn) return;
    this.moreBtn.setAttribute('aria-label', t('WIDE_MORE_ARIA'));
    this.menu?.setAttribute('aria-label', t('WIDE_MORE_ARIA'));
  }

  _bind() {
    this._onMqChange = () => {
      if (!this._isWide()) this.closeMenu();
      this._sync();
    };
    this._mq?.addEventListener?.('change', this._onMqChange);

    this.moreBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._menuOpen) this.closeMenu();
      else this.openMenu();
    });

    this.listEl?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-proxy]');
      if (!item) return;
      const key = item.getAttribute('data-proxy');
      this.closeMenu();
      requestAnimationFrame(() => this._proxy(key));
    });

    this._onDocPointer = (event) => {
      if (!this._menuOpen) return;
      const target = /** @type {Node} */ (event.target);
      if (this.wrap?.contains(target)) return;
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
    const wide = this._isWide();
    const park = wide && this._idle;
    const showMore = park && !this._suppressed;

    document.body.classList.toggle('ft-wide-park-secondary', park);
    document.body.classList.toggle('ft-wide-more-open', this._menuOpen && showMore);

    if (this.moreBtn) this.moreBtn.hidden = !showMore;
    if (this.menu) {
      this.menu.hidden = !(this._menuOpen && showMore);
    }
    if (!showMore) this._menuOpen = false;
  }

  _refreshItems() {
    if (!this.listEl) return;
    const items = [
      {
        proxy: 'honesty',
        label: () => t('HONESTY_IDLE_ENTRY'),
        // Always list — entry may be attribute-hidden in DORMANT/busy.
        visible: () => true
      },
      {
        proxy: 'breath',
        label: () => t('micro_ritual.button'),
        visible: () => {
          const el = document.getElementById('micro-ritual-idle-entry');
          return Boolean(el && !el.hidden);
        }
      },
      {
        proxy: 'companion',
        label: () => t('COMPANION_MODE_HINT'),
        visible: () => {
          const el = document.querySelector('.session-start-dock__hint');
          return Boolean(el && !el.hidden && !el.disabled);
        }
      },
      {
        proxy: 'sound',
        label: () => t('AMBIENT_FAB_LABEL'),
        visible: () => true
      },
      {
        proxy: 'reminder',
        label: () => t('reminder.setting_title'),
        visible: () =>
          Boolean(document.getElementById('reminder-preference-toggle'))
      }
    ];

    this.listEl.innerHTML = '';
    for (const item of items) {
      if (item.visible && !item.visible()) continue;
      const li = document.createElement('li');
      li.setAttribute('role', 'none');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ft-wide-more__item';
      btn.setAttribute('role', 'menuitem');
      btn.dataset.proxy = item.proxy;
      btn.textContent = item.label();
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
      document.body.classList.add('ft-wide-stage-companion');
      this.handlers.onClearCompanion?.();
      this.handlers.onCompanion?.();
      return;
    }
    if (key === 'reminder') {
      this.clearStage();
      document.body.classList.add('ft-wide-stage-reminder');
      this.handlers.onReminder?.();
      return;
    }
    if (key === 'sound') {
      this.clearStage();
      document.body.classList.add('ft-wide-stage-sound');
      this.handlers.onSound?.();
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
        gap: 10px;
        pointer-events: auto;
        max-width: 100%;
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
        background: linear-gradient(
          165deg,
          rgba(255, 252, 245, 0.98) 0%,
          rgba(245, 235, 220, 0.96) 100%
        );
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
      .ft-wide-more__menu {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 10px);
        transform: translateX(-50%);
        min-width: 220px;
        max-width: min(280px, 70vw);
        padding: 8px;
        border-radius: 14px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: linear-gradient(
          165deg,
          rgba(255, 253, 247, 0.98) 0%,
          rgba(250, 244, 232, 0.96) 100%
        );
        box-shadow:
          0 2px 0 rgba(255, 255, 255, 0.85) inset,
          0 12px 28px rgba(44, 31, 20, 0.14);
        z-index: 20;
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
      }
      .ft-wide-more__item {
        display: block;
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--color-ink, #2c1f14);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.35;
        cursor: pointer;
      }
      .ft-wide-more__item:hover {
        background: rgba(255, 246, 230, 0.9);
        border-color: rgba(139, 115, 85, 0.18);
      }

      /*
       * Park secondary Idle chrome off-canvas on wide Idle (incl. Arrival).
       * Elements remain in DOM for proxy .click(); ? / heatmap stay untouched.
       */
      @media (min-width: 480px) {
        body.ft-wide-park-secondary .session-start-dock__honesty-entry,
        body.ft-wide-park-secondary .session-start-dock__micro-ritual-entry,
        body.ft-wide-park-secondary .session-start-dock__hint,
        body.ft-wide-park-secondary .ambient-soundscape__fab,
        body.ft-wide-park-secondary #reminder-preference-toggle {
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

      /* Wide Idle: stage Soundscape panel on-canvas (never red FAB / gated tip-only) */
      @media (min-width: 480px) {
        body.ft-wide-park-secondary.ft-wide-stage-sound .ambient-soundscape__focus-chrome {
          position: fixed !important;
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: max(100px, env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
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
        body.ft-wide-park-secondary.ft-wide-stage-reminder #weekly-practice-heatmap-cluster {
          /* reminder panel lives near cluster; keep cluster findable */
        }
      }
      }
    `;
    document.head.appendChild(style);
  }
}
