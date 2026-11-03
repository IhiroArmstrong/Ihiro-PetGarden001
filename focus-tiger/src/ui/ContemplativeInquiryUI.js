/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T79 Sit-with-a-question card — Idle Inspiration menu. Fixed copy only.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import { OVERLAY_OUTSIDE_DISMISS } from '../core/overlaySlotContractRegistry.js';
import {
  CONTEMPLATIVE_INQUIRY_SIT_MS,
  contemplativeInquirySideKey,
  disableContemplativeInquiryMenu,
  incrementContemplativeInquiryVisit,
  isContemplativeInquiryMenuVisible,
  markContemplativeInquiryFirewallSeen,
  readContemplativeInquiryMemory
} from '../core/contemplativeInquiryMemory.js';
import { pushOverlayEscapeLayer } from '../core/overlayEscapeStack.js';
import {
  GLASS_BLUR_CSS,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_RADIUS,
  GLASS_SHADOW,
  createGlassCard
} from './glassPanelStyles.js';
import {
  OVERLAY_BACKDROP_FADE_MS,
  createOverlayBackdrop,
  hideOverlayBackdrop,
  showOverlayBackdrop
} from './overlayBackdrop.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'contemplative-inquiry-card-styles-v1';
const ROOT_ID = 'contemplative-inquiry-card';
const FADE_MS = OVERLAY_BACKDROP_FADE_MS;

/**
 * @typedef {'firewall' | 'sit-again' | 'question' | 'invite' | 'sit' | 'after' | 'landing' | 'knowledge'} InquiryStep
 */

export class ContemplativeInquiryUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {() => void} [handlers.onOpen]
   * @param {() => void} [handlers.onClose]
   * @param {() => void} [handlers.onMenuVisibilityChange]
   * @param {() => void} [handlers.onAcknowledge]
   * @param {() => void} [handlers.onLand]
   * @param {() => void} [handlers.onCrisis]
   * @param {Storage | null} [handlers.storage]
   * @param {number} [handlers.sitMs]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof localStorage !== 'undefined' ? localStorage : null);
    this._sitMs = handlers.sitMs ?? CONTEMPLATIVE_INQUIRY_SIT_MS;
    this._open = false;
    /** @type {InquiryStep} */
    this._step = 'firewall';
    this._exitKind = '';
    this._sitStartedAt = 0;
    /** @type {ReturnType<typeof setInterval> | null} */
    this._sitTimer = null;
    /** @type {(() => void) | null} */
    this._popEscapeLayer = null;

    this.backdrop = createOverlayBackdrop(mountRoot, {
      id: 'contemplative-inquiry-backdrop',
      testId: 'contemplative-inquiry-backdrop',
      zIndex: Z.OVERLAY_DIM,
      outsideDismiss: OVERLAY_OUTSIDE_DISMISS.BLANK_CLOSES,
      onDismiss: () => this.close()
    });

    this.root = createGlassCard({
      id: ROOT_ID,
      className: 'contemplative-inquiry-card',
      deck: true
    });
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'contemplative-inquiry-title');
    this.root.dataset.testid = ROOT_ID;

    this.titleEl = document.createElement('p');
    this.titleEl.id = 'contemplative-inquiry-title';
    this.titleEl.className = 'contemplative-inquiry-card__title';

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'contemplative-inquiry-card__body';
    this.bodyEl.dataset.testid = 'contemplative-inquiry-body';

    this.actions = document.createElement('div');
    this.actions.className = 'contemplative-inquiry-card__actions';

    this.root.append(this.titleEl, this.bodyEl, this.actions);
    mountRoot.appendChild(this.root);

    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => {
      if (this._open) this._renderStep();
    });
  }

  isOpen() {
    return this._open;
  }

  /** Sit-phase HUD: independent 5-minute wall clock, not a Focus chip. */
  isSitting() {
    return this._open && this._step === 'sit';
  }

  getElapsedSeconds() {
    if (!this.isSitting() || !this._sitStartedAt) return 0;
    return Math.max(0, (Date.now() - this._sitStartedAt) / 1000);
  }

  getDurationMinutes() {
    return this._sitMs / 60000;
  }

  getProgress() {
    const total = this._sitMs / 1000;
    if (total <= 0) return 0;
    return Math.min(1, this.getElapsedSeconds() / total);
  }

  open() {
    if (!isContemplativeInquiryMenuVisible(this._storage)) return;
    if (this._open) {
      this._renderStep();
      return;
    }
    this._open = true;
    const mem = readContemplativeInquiryMemory(this._storage);
    if (!mem.firewallSeen) this._step = 'firewall';
    else if (mem.visitCount >= 5) this._step = 'sit-again';
    else this._step = 'question';
    this._exitKind = '';
    this._popEscapeLayer?.();
    this._popEscapeLayer = pushOverlayEscapeLayer({
      id: ROOT_ID,
      dismiss: () => this.close()
    });
    showOverlayBackdrop(this.backdrop);
    this.root.hidden = false;
    this.root.getBoundingClientRect();
    this.root.classList.add('is-visible');
    this._renderStep();
    this.handlers.onOpen?.();
  }

  close() {
    if (!this._open) return;
    this._clearSitTimer();
    this._open = false;
    this._step = 'firewall';
    this._popEscapeLayer?.();
    this._popEscapeLayer = null;
    hideOverlayBackdrop(this.backdrop);
    this.root.classList.remove('is-visible');
    window.setTimeout(() => {
      if (!this._open) this.root.hidden = true;
    }, FADE_MS + 40);
    this.handlers.onClose?.();
  }

  destroy() {
    this._unsubLocale?.();
    this._clearSitTimer();
    this._popEscapeLayer?.();
    this.backdrop.remove();
    this.root.remove();
  }

  _clearSitTimer() {
    if (this._sitTimer) {
      clearInterval(this._sitTimer);
      this._sitTimer = null;
    }
    this._sitStartedAt = 0;
  }

  _goLanding(exitKind = '') {
    this._clearSitTimer();
    this._exitKind = exitKind;
    incrementContemplativeInquiryVisit(this._storage);
    this._step = 'landing';
    this._renderStep();
  }

  _startSit() {
    this._step = 'sit';
    this._clearSitTimer();
    this._sitStartedAt = Date.now();
    this._sitTimer = window.setInterval(() => {
      if (!this.isSitting()) return;
      if (Date.now() - this._sitStartedAt >= this._sitMs) {
        this._goAfter();
        return;
      }
      this._renderSitClock();
    }, 1000);
    this._renderStep();
  }

  _goAfter() {
    this._clearSitTimer();
    this._step = 'after';
    this._renderStep();
  }

  _renderSitClock() {
    const clock = this.bodyEl.querySelector('[data-testid="contemplative-inquiry-clock"]');
    if (!clock) return;
    const remain = Math.max(0, this._sitMs / 1000 - this.getElapsedSeconds());
    const m = Math.floor(remain / 60);
    const s = Math.floor(remain % 60);
    clock.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }

  _setBodyText(text) {
    this.bodyEl.textContent = '';
    const p = document.createElement('p');
    p.className = 'contemplative-inquiry-card__copy';
    p.dataset.testid = 'contemplative-inquiry-copy';
    p.textContent = text;
    this.bodyEl.appendChild(p);
  }

  _btn(label, testId, onClick, kind = 'primary') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `contemplative-inquiry-card__btn contemplative-inquiry-card__btn--${kind}`;
    btn.dataset.testid = testId;
    btn.textContent = label;
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      onClick();
    });
    return btn;
  }

  _renderStep() {
    this.titleEl.textContent = t('CI_EX1_MENU_LABEL');
    this.actions.replaceChildren();
    const mem = readContemplativeInquiryMemory(this._storage);

    if (this._step === 'firewall') {
      this._setBodyText(t('CI_EX1_FIREWALL_BODY'));
      this.actions.append(
        this._btn(t('CI_EX1_COME_IN'), 'contemplative-inquiry-come-in', () => {
          markContemplativeInquiryFirewallSeen(this._storage);
          this._step = 'question';
          this._renderStep();
        }),
        this._btn(t('CI_EX1_NOT_NOW'), 'contemplative-inquiry-not-now', () => {
          markContemplativeInquiryFirewallSeen(this._storage);
          this.close();
        }, 'ghost'),
        this._btn(t('CI_EX1_TURN_OFF'), 'contemplative-inquiry-turn-off', () => {
          disableContemplativeInquiryMenu(this._storage);
          this.handlers.onMenuVisibilityChange?.();
          this.close();
        }, 'ghost'),
        this._btn(t('CI_EX1_TALK'), 'contemplative-inquiry-talk', () => {
          this.close();
          this.handlers.onCrisis?.();
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'sit-again') {
      this._setBodyText(t('CI_EX1_SIT_AGAIN'));
      this.actions.append(
        this._btn(t('CI_EX1_COME_IN'), 'contemplative-inquiry-come-in', () => {
          this._step = 'question';
          this._renderStep();
        }),
        this._btn(t('CI_EX1_NOT_NOW'), 'contemplative-inquiry-not-now', () => {
          this.close();
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'question') {
      const sideKey = contemplativeInquirySideKey(mem.visitCount);
      this.bodyEl.textContent = '';
      if (sideKey) {
        const side = document.createElement('p');
        side.className = 'contemplative-inquiry-card__copy contemplative-inquiry-card__copy--side';
        side.dataset.testid = 'contemplative-inquiry-side';
        side.textContent = t(sideKey);
        this.bodyEl.appendChild(side);
      }
      const q = document.createElement('p');
      q.className = 'contemplative-inquiry-card__copy';
      q.dataset.testid = 'contemplative-inquiry-question';
      q.textContent = t('CI_EX1_QUESTION');
      this.bodyEl.appendChild(q);
      this.actions.append(
        this._btn(t('CI_EX1_BEGIN_SIT'), 'contemplative-inquiry-begin-sit', () => {
          this._step = 'invite';
          this._renderStep();
        }),
        this._btn(t('CI_EX1_ABOUT'), 'contemplative-inquiry-about', () => {
          this._step = 'knowledge';
          this._renderStep();
        }, 'ghost'),
        this._btn(t('CI_EX1_TALK'), 'contemplative-inquiry-talk', () => {
          this.close();
          this.handlers.onCrisis?.();
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'invite') {
      this._setBodyText(t('CI_EX1_INVITE'));
      this.actions.append(
        this._btn(t('CI_EX1_BEGIN_SIT'), 'contemplative-inquiry-begin-sit', () => {
          this._startSit();
        })
      );
      return;
    }

    if (this._step === 'sit') {
      this.bodyEl.textContent = '';
      const clock = document.createElement('p');
      clock.className = 'contemplative-inquiry-card__clock';
      clock.dataset.testid = 'contemplative-inquiry-clock';
      this.bodyEl.appendChild(clock);
      this._renderSitClock();
      this.actions.append(
        this._btn(t('CI_EX1_END_EARLY'), 'contemplative-inquiry-end-early', () => {
          this._goLanding('');
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'after') {
      this._setBodyText(t('CI_EX1_AFTER'));
      this.actions.append(
        this._btn(t('CI_EX1_OPT_MANY'), 'contemplative-inquiry-opt-many', () => {
          this.handlers.onAcknowledge?.();
          this._goLanding('');
        }),
        this._btn(t('CI_EX1_OPT_FEW'), 'contemplative-inquiry-opt-few', () => {
          this.handlers.onAcknowledge?.();
          this._goLanding('');
        }),
        this._btn(t('CI_EX1_OPT_HARD'), 'contemplative-inquiry-opt-hard', () => {
          this.handlers.onAcknowledge?.();
          this._goLanding('');
        }),
        this._btn(t('CI_EX1_OPT_UNCOMFY'), 'contemplative-inquiry-opt-uncomfy', () => {
          this._goLanding('b');
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'landing') {
      const parts = [];
      if (this._exitKind === 'b') parts.push(t('CI_EX1_EXIT_B'));
      parts.push(t('CI_EX1_LANDING'));
      if (this._exitKind === 'b') parts.push(t('CI_EX1_TRY_LATER'));
      this._setBodyText(parts.join('\n\n'));
      this.actions.append(
        this._btn(t('CI_EX1_LANDING_CTA'), 'contemplative-inquiry-land', () => {
          this.close();
          this.handlers.onLand?.();
        }),
        this._btn(t('CI_EX1_CLOSE'), 'contemplative-inquiry-close', () => {
          this.close();
        }, 'ghost')
      );
      return;
    }

    if (this._step === 'knowledge') {
      this._setBodyText(t('CI_EX1_KNOWLEDGE'));
      this.actions.append(
        this._btn(t('CI_EX1_KNOWLEDGE_CLOSE'), 'contemplative-inquiry-knowledge-close', () => {
          this._step = 'question';
          this._renderStep();
        })
      );
    }
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .contemplative-inquiry-card {
        position: fixed;
        left: 50%;
        bottom: max(96px, env(safe-area-inset-bottom, 0px) + 72px);
        z-index: ${Z.GLASS_CARD};
        width: min(360px, calc(100vw - 40px));
        transform: translate(-50%, 10px);
        padding: 16px 16px 14px;
        box-sizing: border-box;
        color: #2c1f14;
        background: ${GLASS_FILL};
        ${GLASS_BLUR_CSS};
        border: ${GLASS_BORDER};
        border-radius: ${GLASS_RADIUS};
        box-shadow: ${GLASS_SHADOW};
        opacity: 0;
        pointer-events: auto;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .contemplative-inquiry-card.is-visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      .contemplative-inquiry-card__title {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 650;
        line-height: 1.35;
      }
      .contemplative-inquiry-card__copy,
      .contemplative-inquiry-card__clock {
        margin: 0 0 8px;
        font-size: 0.88rem;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      .contemplative-inquiry-card__clock {
        font-variant-numeric: tabular-nums;
        text-align: center;
        font-size: 1.4rem;
      }
      .contemplative-inquiry-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      .contemplative-inquiry-card__btn {
        border: 1px solid rgba(196, 165, 116, 0.35);
        border-radius: 999px;
        padding: 8px 14px;
        font: inherit;
        font-size: 0.8rem;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.7);
        color: #3a2e22;
      }
      .contemplative-inquiry-card__btn--ghost {
        background: transparent;
      }
      .contemplative-inquiry-card__btn:active {
        transform: translateY(1px);
      }
    `;
    document.head.appendChild(style);
  }
}
