/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle / Arrive circle sitting presence — pointer-events none.
 * Shown above global lanterns when user is in a circle and others are sitting.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOCUS_CIRCLE_CHANGE_EVENT,
  readFocusCircleMembership
} from '../core/focusCircleMembership.js';
import {
  IDLE_LANTERN_BOTTOM_NARROW_CSS,
  IDLE_LANTERN_BOTTOM_WIDE_CSS,
  IDLE_LANTERN_NARROW_MQ_MAX_PX
} from '../core/quietTogetherLanternLayout.js';
import {
  FOCUS_CIRCLE_SITTING_EVENT,
  getFocusCircleSittingOthersSnapshot,
  isFocusCirclePresenceClientEnabled,
  isFocusCirclePresenceContributing
} from '../core/focusCirclePresence.js';

const STYLE_ID = 'focus-circle-presence-chrome-v1';
const MAX_DOTS = 7;
/** Stack above global lantern caption + dots (~42px). */
const PRESENCE_ABOVE_LANTERNS_CSS = '42px';

export class FocusCirclePresenceChrome {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._focusing = false;
    this._visibleAllowed = true;
    this._sittingOthers = null;

    this.root = document.createElement('div');
    this.root.id = 'focus-circle-presence';
    this.root.className = 'focus-circle-presence';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-presence';
    this.root.setAttribute('aria-live', 'polite');

    this.dots = document.createElement('div');
    this.dots.className = 'focus-circle-presence__dots';
    this.caption = document.createElement('p');
    this.caption.className = 'focus-circle-presence__caption';

    this.root.append(this.dots, this.caption);
    mountRoot.appendChild(this.root);
    this._injectStyles();

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._onMembership = () => this.refresh();
    this._onSitting = (event) => {
      const sittingOthers = event?.detail?.sittingOthers;
      if (sittingOthers == null || !Number.isFinite(sittingOthers)) {
        this.refresh();
        return;
      }
      this.setSittingOthers(sittingOthers);
    };
    globalThis.addEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onMembership);
    globalThis.addEventListener?.(FOCUS_CIRCLE_SITTING_EVENT, this._onSitting);

    this.refresh();
  }

  /**
   * @param {boolean} visible
   */
  setVisible(visible) {
    this._visibleAllowed = Boolean(visible);
    this.refresh();
  }

  /**
   * @param {boolean} focusing
   */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    this.root.classList.toggle('is-focusing', this._focusing);
    this.refresh();
  }

  /**
   * @param {number | null} sittingOthers
   */
  setSittingOthers(sittingOthers) {
    const next =
      sittingOthers == null || !Number.isFinite(sittingOthers)
        ? null
        : Math.max(0, Math.floor(sittingOthers));
    if (next === this._sittingOthers) return;
    this._sittingOthers = next;
    this.refresh();
  }

  refresh() {
    const enabled =
      isFocusCirclePresenceClientEnabled({
        storage: this._storage,
        search:
          typeof globalThis.location?.search === 'string'
            ? globalThis.location.search
            : ''
      }) && Boolean(readFocusCircleMembership(this._storage));
    const snapshot = getFocusCircleSittingOthersSnapshot();
    const sittingOthers = snapshot != null ? snapshot : this._sittingOthers;
    const show =
      this._visibleAllowed &&
      enabled &&
      !this._focusing &&
      !isFocusCirclePresenceContributing() &&
      sittingOthers != null &&
      sittingOthers > 0;

    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show) {
      this.caption.textContent = '';
      this.dots.replaceChildren();
      return;
    }

    const n = Math.min(sittingOthers, MAX_DOTS);
    if (this.dots.childElementCount !== n) {
      this.dots.replaceChildren();
      for (let i = 0; i < n; i += 1) {
        const dot = document.createElement('span');
        dot.className = 'focus-circle-presence__dot';
        this.dots.appendChild(dot);
      }
    }
    this.caption.textContent =
      sittingOthers === 1
        ? t('FOCUS_CIRCLE_PRESENCE_ONE')
        : t('FOCUS_CIRCLE_PRESENCE_MANY').replace('{n}', String(sittingOthers));
    this.root.setAttribute(
      'aria-label',
      sittingOthers === 1
        ? t('FOCUS_CIRCLE_PRESENCE_ARIA_ONE')
        : t('FOCUS_CIRCLE_PRESENCE_ARIA_MANY').replace('{n}', String(sittingOthers))
    );
  }

  destroy() {
    this._unsubLocale?.();
    globalThis.removeEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onMembership);
    globalThis.removeEventListener?.(FOCUS_CIRCLE_SITTING_EVENT, this._onSitting);
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-presence {
        position: fixed;
        left: 18px;
        bottom: calc(${IDLE_LANTERN_BOTTOM_WIDE_CSS} + ${PRESENCE_ABOVE_LANTERNS_CSS});
        z-index: 2;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        max-width: 42vw;
        opacity: 0.78;
        transition: opacity 280ms ease;
      }
      .focus-circle-presence.is-focusing,
      .focus-circle-presence[hidden] {
        opacity: 0;
      }
      .focus-circle-presence__dots {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .focus-circle-presence__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #e8f0ff, #8aa4c8 72%);
        box-shadow: 0 0 6px rgba(160, 188, 220, 0.45);
      }
      .focus-circle-presence__caption {
        margin: 0;
        font-size: 10.5px;
        letter-spacing: 0.02em;
        color: rgba(220, 228, 240, 0.68);
        text-shadow: 0 1px 2px rgba(20, 16, 10, 0.45);
      }
      @media (max-width: ${IDLE_LANTERN_NARROW_MQ_MAX_PX}px) {
        .focus-circle-presence {
          left: 12px;
          bottom: calc(${IDLE_LANTERN_BOTTOM_NARROW_CSS} + ${PRESENCE_ABOVE_LANTERNS_CSS});
        }
      }
    `;
    document.head.appendChild(style);
  }
}
