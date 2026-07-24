import { t, onLocaleChange } from '../locales/i18n.js';

const STYLE_ID = 'ft-narrow-idle-shell-styles-v4';
const NARROW_MQ = '(max-width: 479px)';
const SWIPE_OPEN_PX = 56;
const SWIPE_CLOSE_PX = 48;

/**
 * Narrow Idle shell (≤479 / 375):
 * - Minimal ActionBar: ? · Calm/time · mute
 * - Yin centered / slightly enlarged; bottom canvas clear
 * - Swipe-up BottomOptionsDrawer proxies existing Idle controls
 *
 * Desktop (≥480) is untouched. Focusing keeps Rise via #btn-focus.
 */
export class NarrowIdleShell {
  /**
   * @param {{
   *   root?: HTMLElement,
   *   getHudStateEl?: () => HTMLElement | null,
   *   getHudTimeEl?: () => HTMLElement | null,
   *   handlers?: {
   *     onMute?: () => void | Promise<void>,
   *     onSound?: () => void,
   *     onCompanion?: () => void,
   *     onReminder?: () => void,
   *     onHonesty?: () => void,
   *     onQuickStart?: () => void,
   *     onClearStage?: () => void,
   *   }
   * }} [options]
   */
  constructor(options = {}) {
    this.root = options.root || document.body;
    this._getHudStateEl =
      options.getHudStateEl || (() => document.getElementById('hud-state'));
    this._getHudTimeEl =
      options.getHudTimeEl || (() => document.getElementById('hud-time'));
    this.handlers = options.handlers || {};

    this._mq =
      typeof window.matchMedia === 'function'
        ? window.matchMedia(NARROW_MQ)
        : null;
    this._idle = true;
    this._suppressed = false;
    this._sheetOpen = false;
    this._touchStartY = null;
    this._localeUnsub = null;
    this._hudObserver = null;

    this._injectStyles();
    this._build();
    this._bind();
    this._syncMode();
    this._syncActionBarFromHud();
    this._localeUnsub = onLocaleChange(() => {
      this._refreshLabels();
      this._syncActionBarFromHud();
    });
  }

  /**
   * Inject runtime handlers after controllers exist (main.js).
   * @param {NarrowIdleShell['handlers']} handlers
   * @returns {void}
   */
  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Clear companion/reminder staging classes.
   * @returns {void}
   */
  clearStage() {
    document.body.classList.remove(
      'ft-narrow-stage-companion',
      'ft-narrow-stage-reminder',
      'ft-narrow-stage-sound'
    );
    this.handlers.onClearStage?.();
  }

  /**
   * Mirror ambient mute state onto the ActionBar ♪ (parked mute btn is invisible).
   * @param {{ musicOn?: boolean }} [state]
   * @returns {void}
   */
  syncMuteVisual(state = {}) {
    const muteBtn = this.actionBar?.querySelector('[data-proxy="mute"]');
    if (!muteBtn) return;
    const musicOn = state.musicOn !== false;
    muteBtn.classList.toggle('is-music-off', !musicOn);
    muteBtn.setAttribute(
      'aria-label',
      musicOn ? t('AMBIENT_MUSIC_OFF_ARIA') : t('AMBIENT_MUSIC_ON_ARIA')
    );
  }

  /**
   * @param {boolean} idle
   * @returns {void}
   */
  setIdle(idle) {
    this._idle = Boolean(idle);
    if (!this._idle) {
      this.closeSheet();
      this.clearStage();
    }
    this._syncMode();
    this._syncAmbientFocusChrome();
  }

  /**
   * Arrival / Honesty / Reflection / Honesty-bridge: hide ActionBar + grabber,
   * but keep legacy chrome parked so dock pills do not poke through overlays.
   * @param {boolean} suppressed
   * @returns {void}
   */
  setSuppressed(suppressed) {
    this._suppressed = Boolean(suppressed);
    if (this._suppressed) {
      this.closeSheet();
      this.clearStage();
    }
    this.shell?.classList.toggle('is-suppressed', this._suppressed);
    this._syncMode();
    this._syncAmbientFocusChrome();
  }

  /**
   * Narrow Focusing: hide Sound FAB/nudge via class (more reliable than media CSS alone).
   * @returns {void}
   */
  _syncAmbientFocusChrome() {
    const hideFab = this._isNarrow() && !this._idle;
    document
      .querySelector('.ambient-soundscape__focus-chrome')
      ?.classList.toggle('ft-narrow-hide-fab', hideFab);
  }

  /**
   * @returns {void}
   */
  openSheet() {
    if (!this._isNarrow() || !this._idle) return;
    this._sheetOpen = true;
    this.shell?.classList.add('is-sheet-open');
    this.sheet?.setAttribute('aria-hidden', 'false');
    this.backdrop?.removeAttribute('hidden');
    this._refreshDrawerItems();
  }

  /**
   * @returns {void}
   */
  closeSheet() {
    this._sheetOpen = false;
    this.shell?.classList.remove('is-sheet-open');
    this.sheet?.setAttribute('aria-hidden', 'true');
    this.backdrop?.setAttribute('hidden', '');
  }

  /**
   * @returns {void}
   */
  destroy() {
    this._localeUnsub?.();
    this._hudObserver?.disconnect();
    this._mq?.removeEventListener?.('change', this._onMqChange);
    this.root?.removeEventListener('touchstart', this._onTouchStart, {
      capture: true
    });
    this.root?.removeEventListener('touchend', this._onTouchEnd, {
      capture: true
    });
    this.shell?.remove();
    document.getElementById(STYLE_ID)?.remove();
    document.body.classList.remove(
      'ft-narrow-shell',
      'ft-narrow-park',
      'ft-narrow-idle',
      'ft-narrow-focusing'
    );
  }

  _isNarrow() {
    return Boolean(this._mq?.matches);
  }

  _syncMode() {
    const narrow = this._isNarrow();
    // Park legacy chrome whenever Idle on narrow — including Arrival / Honesty overlays
    // (suppress only hides ActionBar; unparking dock caused pills under Arrival).
    const park = narrow && this._idle;
    const idleChrome = park && !this._suppressed;
    const focusing = narrow && !this._idle;
    document.body.classList.toggle('ft-narrow-shell', narrow);
    document.body.classList.toggle('ft-narrow-park', park);
    document.body.classList.toggle('ft-narrow-idle', idleChrome);
    document.body.classList.toggle('ft-narrow-focusing', focusing);
    if (this.shell) {
      this.shell.hidden = !narrow || Boolean(this._suppressed);
    }
    if (!narrow || this._suppressed) this.closeSheet();
    if (idleChrome) this._syncActionBarFromHud();
  }

  _build() {
    this.shell = document.createElement('div');
    this.shell.id = 'ft-narrow-idle-shell';
    this.shell.className = 'ft-narrow-idle-shell';
    this.shell.hidden = true;

    this.actionBar = document.createElement('header');
    this.actionBar.className = 'ft-narrow-action-bar';
    this.actionBar.innerHTML = `
      <button type="button" class="ft-narrow-action-bar__btn" id="ft-narrow-help-btn" data-proxy="help" aria-label="">
        ?
      </button>
      <div class="ft-narrow-action-bar__center" aria-live="polite">
        <span class="ft-narrow-action-bar__time" data-role="time">00:00</span>
        <span class="ft-narrow-action-bar__state" data-role="state"></span>
      </div>
      <button type="button" class="ft-narrow-action-bar__btn" id="ft-narrow-mute-btn" data-proxy="mute" aria-label="">
        ♪
      </button>
    `;

    this.grabber = document.createElement('button');
    this.grabber.type = 'button';
    this.grabber.className = 'ft-narrow-grabber';
    this.grabber.dataset.role = 'grabber';

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'ft-narrow-sheet-backdrop';
    this.backdrop.setAttribute('hidden', '');

    this.sheet = document.createElement('div');
    this.sheet.className = 'ft-narrow-sheet';
    this.sheet.id = 'ft-narrow-options-drawer';
    this.sheet.setAttribute('role', 'dialog');
    this.sheet.setAttribute('aria-modal', 'true');
    this.sheet.setAttribute('aria-hidden', 'true');
    this.sheet.innerHTML = `
      <div class="ft-narrow-sheet__handle" aria-hidden="true"></div>
      <div class="ft-narrow-sheet__head">
        <h2 class="ft-narrow-sheet__title" data-role="sheet-title"></h2>
        <button type="button" class="ft-narrow-sheet__close" data-role="close" aria-label=""></button>
      </div>
      <div class="ft-narrow-sheet__heatmap" data-role="heatmap-slot" hidden></div>
      <ul class="ft-narrow-sheet__list" data-role="list"></ul>
    `;

    this.shell.appendChild(this.actionBar);
    this.shell.appendChild(this.grabber);
    this.shell.appendChild(this.backdrop);
    this.shell.appendChild(this.sheet);
    this.root.appendChild(this.shell);

    this.timeEl = this.actionBar.querySelector('[data-role="time"]');
    this.stateEl = this.actionBar.querySelector('[data-role="state"]');
    this.listEl = this.sheet.querySelector('[data-role="list"]');
    this.heatmapSlot = this.sheet.querySelector('[data-role="heatmap-slot"]');
    this._refreshLabels();
  }

  _refreshLabels() {
    const helpBtn = this.actionBar?.querySelector('[data-proxy="help"]');
    const muteBtn = this.actionBar?.querySelector('[data-proxy="mute"]');
    const title = this.sheet?.querySelector('[data-role="sheet-title"]');
    const close = this.sheet?.querySelector('[data-role="close"]');
    if (helpBtn) helpBtn.setAttribute('aria-label', t('HINT_HELP_ARIA'));
    if (muteBtn) muteBtn.setAttribute('aria-label', t('AMBIENT_MUSIC_OFF_ARIA'));
    if (title) title.textContent = t('NARROW_SHEET_TITLE');
    if (close) {
      close.textContent = '×';
      close.setAttribute('aria-label', t('NARROW_SHEET_CLOSE'));
    }
    if (this.grabber) {
      this.grabber.setAttribute('aria-label', t('NARROW_SHEET_SWIPE_HINT'));
      this.grabber.textContent = t('NARROW_SHEET_SWIPE_HINT');
    }
    this.sheet?.setAttribute('aria-label', t('NARROW_SHEET_TITLE'));
  }

  _bind() {
    this._onMqChange = () => this._syncMode();
    this._mq?.addEventListener?.('change', this._onMqChange);

    this.actionBar?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-proxy]');
      if (!btn) return;
      this._proxy(btn.getAttribute('data-proxy'));
    });

    this.grabber?.addEventListener('click', () => this.openSheet());
    this.backdrop?.addEventListener('click', () => this.closeSheet());
    this.sheet?.querySelector('[data-role="close"]')?.addEventListener('click', () => {
      this.closeSheet();
    });

    this.listEl?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-proxy]');
      if (!item) return;
      const key = item.getAttribute('data-proxy');
      this.closeSheet();
      // Let close paint, then trigger underlying control
      requestAnimationFrame(() => this._proxy(key));
    });

    this._onTouchStart = (e) => {
      if (!this._isNarrow() || !this._idle) return;
      if (e.touches?.length !== 1) return;
      // Don't steal from open sheet scroll
      if (this._sheetOpen && this.sheet?.contains(e.target)) {
        this._touchStartY = e.touches[0].clientY;
        this._touchFromSheet = true;
        return;
      }
      this._touchFromSheet = false;
      this._touchStartY = e.touches[0].clientY;
    };
    this._onTouchEnd = (e) => {
      if (this._touchStartY == null) return;
      const y = e.changedTouches?.[0]?.clientY;
      if (y == null) {
        this._touchStartY = null;
        return;
      }
      const dy = y - this._touchStartY;
      this._touchStartY = null;
      if (this._touchFromSheet) {
        if (dy > SWIPE_CLOSE_PX) this.closeSheet();
        return;
      }
      if (!this._sheetOpen && dy < -SWIPE_OPEN_PX) this.openSheet();
    };
    this.root.addEventListener('touchstart', this._onTouchStart, {
      passive: true,
      capture: true
    });
    this.root.addEventListener('touchend', this._onTouchEnd, {
      passive: true,
      capture: true
    });

    const hudRoot = document.getElementById('focus-hud');
    if (hudRoot && typeof MutationObserver !== 'undefined') {
      this._hudObserver = new MutationObserver(() => this._syncActionBarFromHud());
      this._hudObserver.observe(hudRoot, {
        subtree: true,
        characterData: true,
        childList: true
      });
    }
  }

  _syncActionBarFromHud() {
    const state = this._getHudStateEl()?.textContent?.trim() || t('STATE_IDLE');
    const time = this._getHudTimeEl()?.textContent?.trim() || '00:00';
    if (this.stateEl) this.stateEl.textContent = state;
    if (this.timeEl) this.timeEl.textContent = time;
  }

  _refreshDrawerItems() {
    if (!this.listEl) return;
    const items = [
      {
        proxy: 'sit',
        label: () =>
          document.getElementById('btn-focus')?.textContent?.trim() ||
          t('BTN_FOCUS_START'),
        primary: true,
        visible: () => Boolean(document.getElementById('btn-focus'))
      },
      {
        proxy: 'quickstart',
        label: () => t('QUICK_START_ARIA'),
        visible: () => {
          const el = document.getElementById('quick-start-focus');
          return Boolean(el && !el.hidden);
        }
      },
      {
        proxy: 'honesty',
        label: () => t('HONESTY_IDLE_ENTRY'),
        // Always list while drawer is open — never drop for space. Proxy opens check-in.
        visible: () => Boolean(document.getElementById('honesty-idle-entry'))
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
          return Boolean(el && !el.hidden);
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
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `ft-narrow-sheet__item${item.primary ? ' is-primary' : ''}`;
      btn.dataset.proxy = item.proxy;
      btn.textContent = item.label();
      li.appendChild(btn);
      this.listEl.appendChild(li);
    }

    // Quiet week strip: clone lit cells into the sheet (read-only)
    const source = document.getElementById('weekly-practice-heatmap');
    if (this.heatmapSlot && source && !source.hidden) {
      this.heatmapSlot.hidden = false;
      this.heatmapSlot.innerHTML = '';
      const label = document.createElement('p');
      label.className = 'ft-narrow-sheet__heatmap-label';
      label.textContent = t('HINT_WEEKLY_HEATMAP');
      const row = document.createElement('div');
      row.className = 'ft-narrow-sheet__heatmap-row';
      row.setAttribute('aria-hidden', 'true');
      for (const cell of source.querySelectorAll('.weekly-practice-heatmap__cell')) {
        const clone = document.createElement('span');
        clone.className = 'ft-narrow-sheet__heatmap-cell';
        clone.dataset.lit = cell.dataset.lit || '0';
        row.appendChild(clone);
      }
      this.heatmapSlot.appendChild(label);
      this.heatmapSlot.appendChild(row);
    } else if (this.heatmapSlot) {
      this.heatmapSlot.hidden = true;
      this.heatmapSlot.innerHTML = '';
    }
  }

  /**
   * @param {string | null} key
   * @returns {void}
   */
  _proxy(key) {
    if (key === 'mute') {
      void this.handlers.onMute?.();
      return;
    }
    if (key === 'sound' || key === 'music') {
      this.clearStage();
      document.body.classList.add('ft-narrow-stage-sound');
      this.handlers.onSound?.();
      return;
    }
    if (key === 'companion') {
      this.clearStage();
      document.body.classList.add('ft-narrow-stage-companion');
      this.handlers.onCompanion?.();
      return;
    }
    if (key === 'reminder') {
      this.clearStage();
      document.body.classList.add('ft-narrow-stage-reminder');
      this.handlers.onReminder?.();
      return;
    }
    if (key === 'quickstart') {
      this.handlers.onQuickStart?.();
      return;
    }
    if (key === 'honesty') {
      const el = document.getElementById('honesty-idle-entry');
      if (el && !el.disabled && !el.hidden) {
        const prev = el.style.pointerEvents;
        el.style.pointerEvents = 'auto';
        el.click();
        el.style.pointerEvents = prev;
        return;
      }
      // Entry may be attribute-hidden while Idle drawer is open — still open check-in.
      this.handlers.onHonesty?.();
      return;
    }

    const map = {
      help: () => document.getElementById('onboarding-hint-help'),
      sit: () => document.getElementById('btn-focus'),
      breath: () => document.getElementById('micro-ritual-idle-entry')
    };
    const el = map[key]?.();
    if (!el || el.disabled) return;
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
      /* —— Narrow shell chrome —— */
      .ft-narrow-idle-shell {
        position: fixed;
        inset: 0;
        /* Above ambient (z22) so ActionBar ♪ / ? are clickable */
        z-index: 30;
        pointer-events: none;
      }
      .ft-narrow-idle-shell > * {
        pointer-events: auto;
      }
      .ft-narrow-idle-shell.is-suppressed {
        visibility: hidden;
        pointer-events: none;
      }
      .ft-narrow-action-bar {
        position: absolute;
        top: max(10px, env(safe-area-inset-top, 0px));
        left: 12px;
        right: 12px;
        height: 48px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        border-radius: 16px;
        background: rgba(248, 244, 236, 0.72);
        border: 1px solid rgba(139, 115, 85, 0.18);
        box-shadow: 0 8px 24px rgba(44, 31, 20, 0.08);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }
      .ft-narrow-action-bar__btn {
        flex: 0 0 40px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.22);
        background: rgba(255, 252, 245, 0.95);
        color: rgba(74, 58, 40, 0.88);
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        position: relative;
      }
      .ft-narrow-action-bar__btn.is-music-off::after {
        content: '';
        position: absolute;
        left: 8px;
        right: 8px;
        top: 50%;
        height: 2px;
        background: rgba(74, 58, 40, 0.72);
        transform: rotate(-32deg);
        border-radius: 1px;
        pointer-events: none;
      }
      .ft-narrow-action-bar__center {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        line-height: 1.15;
      }
      .ft-narrow-action-bar__time {
        font-variant-numeric: tabular-nums;
        font-size: 1.05rem;
        font-weight: 700;
        color: #2c1f14;
      }
      .ft-narrow-action-bar__state {
        font-size: 0.78rem;
        color: rgba(74, 58, 40, 0.72);
      }
      .ft-narrow-grabber {
        position: absolute;
        left: 50%;
        bottom: max(10px, env(safe-area-inset-bottom, 0px));
        transform: translateX(-50%);
        width: min(220px, calc(100vw - 64px));
        min-height: 36px;
        padding: 8px 12px 6px;
        border-radius: 16px 16px 0 0;
        border: none;
        border-top: 1px solid rgba(139, 115, 85, 0.14);
        background: transparent;
        color: rgba(74, 58, 40, 0.55);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.03em;
        cursor: pointer;
        box-shadow: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      .ft-narrow-grabber::before {
        content: '';
        width: 36px;
        height: 4px;
        border-radius: 999px;
        background: rgba(74, 58, 40, 0.28);
      }
      body.ft-narrow-shell.ft-narrow-focusing .ft-narrow-grabber {
        display: none;
      }
      .ft-narrow-sheet-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(44, 31, 20, 0.28);
      }
      .ft-narrow-sheet {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: min(82vh, 580px);
        padding: 8px 14px calc(12px + env(safe-area-inset-bottom, 0px));
        border-radius: 22px 22px 0 0;
        background: linear-gradient(180deg, #fffcf6 0%, #f4ebe0 100%);
        border: 1px solid rgba(139, 115, 85, 0.22);
        box-shadow: 0 -12px 40px rgba(44, 31, 20, 0.18);
        transform: translateY(110%);
        transition: transform 280ms cubic-bezier(0.33, 0.1, 0.25, 1);
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
      .ft-narrow-idle-shell.is-sheet-open .ft-narrow-sheet {
        transform: translateY(0);
      }
      .ft-narrow-sheet__handle {
        width: 42px;
        height: 4px;
        margin: 4px auto 12px;
        border-radius: 999px;
        background: rgba(74, 58, 40, 0.22);
      }
      .ft-narrow-sheet__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
      }
      .ft-narrow-sheet__title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #2c1f14;
      }
      .ft-narrow-sheet__close {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 1px solid rgba(139, 115, 85, 0.2);
        background: rgba(255, 255, 255, 0.8);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        color: rgba(74, 58, 40, 0.8);
      }
      .ft-narrow-sheet__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ft-narrow-sheet__item {
        width: 100%;
        box-sizing: border-box;
        /* Compact (~half of prior 14×16) so all Idle actions fit on 375 */
        padding: 7px 12px;
        min-height: 36px;
        border-radius: 11px;
        border: 1px solid rgba(139, 115, 85, 0.28);
        background: linear-gradient(180deg, #fffdf8 0%, #f6ecdc 100%);
        color: #2c1f14;
        font-size: 13px;
        font-weight: 650;
        text-align: left;
        cursor: pointer;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.85) inset,
          0 1px 0 rgba(180, 150, 110, 0.18);
      }
      .ft-narrow-sheet__item.is-primary {
        border-color: rgba(255, 230, 210, 0.4);
        background: linear-gradient(
          180deg,
          var(--color-cta-top, #c47a4e) 0%,
          var(--color-accent, #b5623a) 48%,
          var(--color-cta-bottom, #8f4a2c) 100%
        );
        color: #fff;
        text-align: center;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.28) inset,
          0 2px 0 var(--color-cta-edge, #7a3f24);
      }
      .ft-narrow-sheet__heatmap {
        margin: 0 0 10px;
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(228, 225, 219, 0.55);
        border: 1px solid rgba(46, 43, 40, 0.08);
      }
      .ft-narrow-sheet__heatmap-label {
        margin: 0 0 8px;
        font-size: 11px;
        line-height: 1.35;
        color: rgba(74, 58, 40, 0.72);
      }
      .ft-narrow-sheet__heatmap-row {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .ft-narrow-sheet__heatmap-cell {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        background: rgba(46, 43, 40, 0.1);
      }
      .ft-narrow-sheet__heatmap-cell[data-lit="1"] {
        background: var(--color-accent, #b5623a);
        opacity: 0.78;
      }

      /* Applied by JS on narrow Focusing — hide Sound FAB / nudge / panel */
      .ambient-soundscape__focus-chrome.ft-narrow-hide-fab {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        position: fixed !important;
        left: -9999px !important;
        right: auto !important;
        top: 0 !important;
        bottom: auto !important;
      }

      /* —— Hide legacy Idle chrome on narrow idle; enlarge Yin —— */
      @media (max-width: 479px) {
        /* Park whenever Idle (incl. Arrival / Honesty overlays) */
        body.ft-narrow-shell.ft-narrow-park #focus-hud,
        body.ft-narrow-shell.ft-narrow-park #session-start-dock,
        body.ft-narrow-shell.ft-narrow-park #onboarding-hint-help,
        body.ft-narrow-shell.ft-narrow-park #weekly-practice-heatmap-cluster,
        body.ft-narrow-shell.ft-narrow-park .ambient-soundscape__mute,
        body.ft-narrow-shell.ft-narrow-park .ambient-soundscape__focus-chrome,
        body.ft-narrow-shell.ft-narrow-park .onboarding-hint-badge {
          opacity: 0 !important;
          pointer-events: none !important;
          position: fixed !important;
          left: -9999px !important;
          right: auto !important;
          top: 0 !important;
          bottom: auto !important;
        }
        body.ft-narrow-shell.ft-narrow-park .ambient-soundscape__nudge {
          display: none !important;
        }

        /* Stage companion / reminder / sound panels on-canvas after drawer pick */
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-companion #session-start-dock {
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: max(72px, env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          z-index: 32 !important;
        }
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-companion #micro-ritual-idle-entry,
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-companion #quick-start-focus,
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-companion #btn-focus {
          display: none !important;
        }

        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-reminder #weekly-practice-heatmap-cluster {
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: max(88px, env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          z-index: 32 !important;
          position: fixed !important;
        }

        /* Idle drawer Sound: Soundscape track panel only — never the red FAB */
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-sound .ambient-soundscape__focus-chrome {
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: max(100px, env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          position: fixed !important;
          z-index: 32 !important;
          align-items: stretch !important;
          width: min(280px, calc(100vw - 32px)) !important;
        }
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-sound .ambient-soundscape__panel {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          position: relative !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          width: 100% !important;
        }
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-sound .ambient-soundscape__fab,
        body.ft-narrow-shell.ft-narrow-park.ft-narrow-stage-sound .ambient-soundscape__nudge {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        body.ft-narrow-shell #sprite-overlay {
          zoom: 1.28;
          transform-origin: center 55%;
        }

        /* Focusing: restore FocusHUD timer; Rise visible; no Sound FAB clutter */
        body.ft-narrow-shell.ft-narrow-focusing .ft-narrow-action-bar,
        body.ft-narrow-shell.ft-narrow-focusing .ft-narrow-grabber {
          display: none !important;
        }
        body.ft-narrow-shell.ft-narrow-focusing #honesty-idle-entry,
        body.ft-narrow-shell.ft-narrow-focusing #micro-ritual-idle-entry,
        body.ft-narrow-shell.ft-narrow-focusing .session-start-dock__hint,
        body.ft-narrow-shell.ft-narrow-focusing #quick-start-focus,
        body.ft-narrow-shell.ft-narrow-focusing #weekly-practice-heatmap-cluster,
        body.ft-narrow-shell.ft-narrow-focusing #onboarding-hint-help,
        body.ft-narrow-shell.ft-narrow-focusing .ambient-soundscape__focus-chrome,
        body.ft-narrow-shell.ft-narrow-focusing .ambient-soundscape__fab,
        body.ft-narrow-shell.ft-narrow-focusing .ambient-soundscape__nudge,
        body.ft-narrow-shell.ft-narrow-focusing .ambient-soundscape__panel {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          position: fixed !important;
          left: -9999px !important;
          right: auto !important;
          top: 0 !important;
          bottom: auto !important;
        }
        body.ft-narrow-shell.ft-narrow-focusing .ambient-soundscape__mute {
          opacity: 1 !important;
          pointer-events: auto !important;
          position: fixed !important;
          left: auto !important;
          right: 12px !important;
          top: max(12px, env(safe-area-inset-top, 0px)) !important;
          z-index: 24 !important;
        }
        body.ft-narrow-shell.ft-narrow-focusing #focus-hud {
          opacity: 1 !important;
          pointer-events: auto !important;
          position: absolute !important;
          left: 12px !important;
          top: 12px !important;
          max-width: calc(100vw - 68px);
        }
        body.ft-narrow-shell.ft-narrow-focusing #session-start-dock {
          bottom: max(20px, env(safe-area-inset-bottom, 0px));
          opacity: 1 !important;
          pointer-events: auto !important;
          position: absolute !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
        }
        body.ft-narrow-shell.ft-narrow-focusing #btn-focus {
          max-width: min(100%, 200px);
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
