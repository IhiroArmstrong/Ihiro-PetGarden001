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
  readDebugLanternsQueryFlag,
  DEBUG_LANTERNS_CIRCLE_MOCK_COUNT
} from '../core/presenceLanternDebug.js';
import {
  FOCUS_CIRCLE_SITTING_EVENT,
  getFocusCircleHereTodayOthersSnapshot,
  getFocusCircleSittingOthersSnapshot,
  isFocusCirclePresenceClientEnabled,
  isFocusCirclePresenceContributing
} from '../core/focusCirclePresence.js';
import { isFocusCircleWasHereClientEnabled } from '../core/focusCircleWasHere.js';
import { createPresenceLanternShell } from './presenceLanternIcons.js';

const STYLE_ID = 'focus-circle-presence-chrome-v1';
const MAX_DOTS = 7;
/** Stack above global lantern row (~16px) + caption (~18px). */
const PRESENCE_ABOVE_LANTERNS_CSS = '46px';

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
    this._hereTodayOthers = null;

    this.root = document.createElement('div');
    this.root.id = 'focus-circle-presence';
    this.root.className = 'focus-circle-presence';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-presence';
    this.root.setAttribute('aria-live', 'polite');

    this.lanterns = document.createElement('div');
    this.lanterns.className = 'focus-circle-presence__lanterns';
    this.caption = document.createElement('p');
    this.caption.className = 'focus-circle-presence__caption';

    this.root.append(this.lanterns, this.caption);
    mountRoot.appendChild(this.root);
    this._injectStyles();

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._onMembership = () => this.refresh();
    this._onSitting = (event) => {
      const sittingOthers = event?.detail?.sittingOthers;
      const hereTodayOthers = event?.detail?.hereTodayOthers;
      if (hereTodayOthers != null && Number.isFinite(hereTodayOthers)) {
        this.setHereTodayOthers(hereTodayOthers);
      }
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

  /**
   * @param {number | null} hereTodayOthers
   */
  setHereTodayOthers(hereTodayOthers) {
    const next =
      hereTodayOthers == null || !Number.isFinite(hereTodayOthers)
        ? null
        : hereTodayOthers >= 1
          ? 1
          : 0;
    if (next === this._hereTodayOthers) return;
    this._hereTodayOthers = next;
    this.refresh();
  }

  refresh() {
    const search =
      typeof globalThis.location?.search === 'string'
        ? globalThis.location.search
        : '';
    const debugLanterns = readDebugLanternsQueryFlag(search);
    const enabled =
      debugLanterns ||
      isFocusCirclePresenceClientEnabled({
        storage: this._storage,
        search
      });
    const inCircle = debugLanterns || Boolean(readFocusCircleMembership(this._storage));
    const wasHereEnabled = isFocusCircleWasHereClientEnabled({
      storage: this._storage,
      search
    });
    const snapshot = getFocusCircleSittingOthersSnapshot();
    let sittingOthers = snapshot != null ? snapshot : this._sittingOthers;
    const hereSnapshot = getFocusCircleHereTodayOthersSnapshot();
    let hereTodayOthers =
      hereSnapshot != null ? hereSnapshot : this._hereTodayOthers;
    if (debugLanterns) {
      sittingOthers = DEBUG_LANTERNS_CIRCLE_MOCK_COUNT;
      hereTodayOthers = 0;
    }
    const showSitting =
      this._visibleAllowed &&
      enabled &&
      inCircle &&
      !this._focusing &&
      (debugLanterns ||
        (!isFocusCirclePresenceContributing() &&
          sittingOthers != null &&
          sittingOthers > 0));
    const showWasHere =
      !debugLanterns &&
      this._visibleAllowed &&
      enabled &&
      inCircle &&
      wasHereEnabled &&
      !this._focusing &&
      !isFocusCirclePresenceContributing() &&
      (sittingOthers == null || sittingOthers === 0) &&
      hereTodayOthers != null &&
      hereTodayOthers > 0;
    const show = showSitting || showWasHere;

    this.root.hidden = !show;
    this.root.dataset.debugLanterns = debugLanterns ? 'true' : 'false';
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    this.root.classList.toggle('is-was-here', showWasHere && !showSitting);
    if (!show) {
      this.caption.textContent = '';
      this.root.removeAttribute('title');
      this.lanterns.replaceChildren();
      return;
    }

    if (showSitting) {
      const n = Math.min(sittingOthers, MAX_DOTS);
      if (this.lanterns.childElementCount !== n) {
        this.lanterns.replaceChildren();
        for (let i = 0; i < n; i += 1) {
          this.lanterns.appendChild(createPresenceLanternShell(document, 'circle', i));
        }
      }
      const caption =
        sittingOthers === 1
          ? t('FOCUS_CIRCLE_PRESENCE_ONE')
          : t('FOCUS_CIRCLE_PRESENCE_MANY').replace('{n}', String(sittingOthers));
      const ariaLabel =
        sittingOthers === 1
          ? t('FOCUS_CIRCLE_PRESENCE_ARIA_ONE')
          : t('FOCUS_CIRCLE_PRESENCE_ARIA_MANY').replace('{n}', String(sittingOthers));
      this.caption.textContent = caption;
      this.root.setAttribute('aria-label', ariaLabel);
      this.root.setAttribute('title', ariaLabel);
      return;
    }

    this.lanterns.replaceChildren();
    this.lanterns.appendChild(
      createPresenceLanternShell(document, 'circle', 0, 'was-here')
    );
    const wasHereAria = t('FOCUS_CIRCLE_WAS_HERE_ARIA');
    this.caption.textContent = t('FOCUS_CIRCLE_WAS_HERE_CAPTION');
    this.root.setAttribute('aria-label', wasHereAria);
    this.root.setAttribute('title', wasHereAria);
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
      .focus-circle-presence__lanterns {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        align-items: flex-end;
      }
      .focus-circle-presence__lantern {
        display: inline-flex;
        line-height: 0;
      }
      .focus-circle-presence__lantern svg {
        display: block;
        filter: drop-shadow(0 0 5px rgba(160, 188, 220, 0.5));
      }
      .focus-circle-presence.is-was-here {
        opacity: 0.62;
      }
      .focus-circle-presence.is-was-here .focus-circle-presence__caption {
        color: rgba(210, 218, 228, 0.58);
      }
      .focus-circle-presence__lantern--was-here svg {
        filter: drop-shadow(0 0 4px rgba(150, 168, 188, 0.28));
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
