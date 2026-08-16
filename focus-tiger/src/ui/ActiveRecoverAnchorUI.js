/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focusing · Tiger Anchor — soft hit target + ghost hint for user-initiated Recover.
 * Does not pause the timer; presentation is owned by MindfulReminderController.
 */

import { onLocaleChange, t } from '../locales/i18n.js';

const STYLE_ID = 'active-recover-anchor-styles-v3';
const ROOT_ID = 'active-recover-anchor';

/**
 * @param {HTMLElement} container typically `#ui-overlay`
 * @param {object} [handlers]
 * @param {() => { ok: boolean, reason?: string }} [handlers.onActivate]
 * @param {() => void} [handlers.onCooldownTap] FB-01：冷却期内再点（微点头，无 toast）
 */
export class ActiveRecoverAnchorUI {
  constructor(container, handlers = {}) {
    this.handlers = handlers;
    /** @type {boolean} */
    this._focusing = false;
    /** @type {boolean} */
    this._cooldown = false;
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._cooldownTimer = null;

    this.root = document.createElement('div');
    this.root.id = ROOT_ID;
    this.root.className = 'active-recover-anchor';
    this.root.hidden = true;
    this.root.dataset.testid = ROOT_ID;
    this.root.setAttribute('aria-hidden', 'true');

    this.glow = document.createElement('div');
    this.glow.className = 'active-recover-anchor__glow';
    this.glow.setAttribute('aria-hidden', 'true');

    this.hit = document.createElement('button');
    this.hit.type = 'button';
    this.hit.className = 'active-recover-anchor__hit';
    this.hit.dataset.testid = 'active-recover-hit';

    this.hint = document.createElement('p');
    this.hint.className = 'active-recover-anchor__hint';
    this.hint.dataset.testid = 'active-recover-hint';

    this.root.append(this.glow, this.hit, this.hint);
    container.appendChild(this.root);

    this._injectStyles();
    this._syncCopy();
    this._unsubLocale = onLocaleChange(() => this._syncCopy());

    this.hit.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this._focusing) return;
      if (this._cooldown) {
        this.handlers.onCooldownTap?.();
        return;
      }
      const result = this.handlers.onActivate?.();
      if (result && result.ok === false) return;
    });
  }

  /**
   * @param {boolean} focusing
   */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    if (!this._focusing) {
      this._clearCooldownTimer();
      this._cooldown = false;
    }
    this._syncVisibility();
  }

  /**
   * Hide glow + ghost hint for `ms`, keep an invisible hit so taps do not
   * fall through to petting (FB-01). Restore invitation if still Focusing.
   * @param {number} ms
   */
  enterCooldown(ms) {
    this._clearCooldownTimer();
    this._cooldown = true;
    this._syncVisibility();
    const wait = Math.max(0, Number(ms) || 0);
    this._cooldownTimer = window.setTimeout(() => {
      this._cooldownTimer = null;
      this._cooldown = false;
      this._syncVisibility();
    }, wait);
  }

  /** Invitation (glow + hint) visible — false during cooldown. */
  isVisible() {
    return !this.root.hidden && !this._cooldown;
  }

  /** Invisible hit remains during cooldown so Yin taps stay on this layer. */
  isHitArmed() {
    return this._focusing && !this.root.hidden;
  }

  dispose() {
    this._clearCooldownTimer();
    this._unsubLocale?.();
    this.root.remove();
  }

  _syncCopy() {
    const label = t('ACTIVE_RECOVER_HINT');
    this.hint.textContent = label;
    this.hit.setAttribute('aria-label', label);
  }

  _syncVisibility() {
    const focusing = this._focusing;
    const cooling = focusing && this._cooldown;
    this.root.hidden = !focusing;
    this.root.classList.toggle('is-cooldown', cooling);
    this.glow.hidden = cooling;
    this.hint.hidden = cooling;
    this.root.setAttribute('aria-hidden', focusing ? 'false' : 'true');
  }

  _clearCooldownTimer() {
    if (this._cooldownTimer == null) return;
    window.clearTimeout(this._cooldownTimer);
    this._cooldownTimer = null;
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .active-recover-anchor {
        position: absolute;
        inset: 0;
        z-index: 12;
        pointer-events: none;
      }
      .active-recover-anchor__glow {
        position: absolute;
        left: 50%;
        top: 48%;
        width: min(200px, 46vw);
        height: min(200px, 46vw);
        transform: translate(-50%, -40%);
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(242, 220, 170, 0.28) 0%,
          rgba(242, 220, 170, 0.08) 42%,
          rgba(242, 220, 170, 0) 72%
        );
        animation: ft-active-recover-glow 4.2s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes ft-active-recover-glow {
        0%, 100% { opacity: 0.22; transform: translate(-50%, -40%) scale(0.94); }
        50% { opacity: 0.55; transform: translate(-50%, -40%) scale(1.04); }
      }
      .active-recover-anchor__hit {
        position: absolute;
        left: 50%;
        top: 46%;
        width: min(220px, 52vw);
        height: min(260px, 38vh);
        transform: translate(-50%, -45%);
        margin: 0;
        padding: 0;
        border: 0;
        border-radius: 48% 48% 42% 42%;
        background: transparent;
        cursor: pointer;
        pointer-events: auto;
        -webkit-tap-highlight-color: transparent;
      }
      .active-recover-anchor.is-cooldown .active-recover-anchor__hit {
        cursor: default;
      }
      .active-recover-anchor__hit:focus-visible {
        outline: 2px solid rgba(196, 154, 74, 0.45);
        outline-offset: 4px;
      }
      .active-recover-anchor.is-cooldown .active-recover-anchor__hit:focus-visible {
        outline: none;
      }
      .active-recover-anchor__hint {
        position: absolute;
        left: 50%;
        top: 64%;
        bottom: auto;
        transform: translateX(-50%);
        margin: 0;
        max-width: min(320px, calc(100vw - 48px));
        padding: 0 8px;
        text-align: center;
        font-family: var(--font-family, "Nunito", system-ui, sans-serif);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.02em;
        line-height: 1.35;
        color: rgba(74, 58, 40, 0.38);
        pointer-events: none;
        user-select: none;
      }
      @media (max-width: 479px) {
        .active-recover-anchor__hit {
          width: min(200px, 58vw);
          height: min(240px, 36vh);
        }
        .active-recover-anchor__hint {
          top: 58%;
          font-size: 10px;
          color: rgba(74, 58, 40, 0.34);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
