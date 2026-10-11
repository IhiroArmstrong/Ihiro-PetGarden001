/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Quiet row of Yin sitting outlines for the people in your circle.
 * Someone who sat down with a seat code is filled with pale gold.
 * Pointer-events none. Hidden while focusing.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  besideSeatFigures,
  readBesideSnapshot
} from '../core/focusCircleBeside.js';
import {
  FOCUS_CIRCLE_CHANGE_EVENT,
  readFocusCircleMembership,
  readFocusCircleQueryFlag
} from '../core/focusCircleMembership.js';
import { isFocusCirclePresenceContributing } from '../core/focusCirclePresence.js';

const STYLE_ID = 'focus-circle-beside-seats-v1';
const OUTLINE_SRC = '/ui/yin-sitting-outline.png';
const FILL_SRC = '/ui/yin-sitting-fill.png';

/**
 * @param {string} [search]
 * @returns {{ memberCount: number, seatedCount: number } | null}
 */
export function readDebugBesideSeats(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  const params = new URLSearchParams(q);
  const total = Number(params.get('debugBesideSeats'));
  if (!Number.isFinite(total) || total <= 0) return null;
  const gold = Number(params.get('debugBesideGold'));
  return {
    memberCount: total,
    seatedCount: Number.isFinite(gold) ? gold : 1
  };
}

export class FocusCircleBesideSeatsChrome {
  /**
   * @param {HTMLElement} mountRoot
   * @param {{ storage?: Storage | null }} [handlers]
   */
  constructor(mountRoot, handlers = {}) {
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._focusing = false;
    this.root = document.createElement('div');
    this.root.id = 'focus-circle-beside-seats';
    this.root.className = 'focus-circle-beside-seats';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-beside-seats';
    this.root.setAttribute('aria-hidden', 'true');
    mountRoot.appendChild(this.root);
    this._injectStyles();
    this._onChange = () => this.refresh();
    this._unsubLocale = onLocaleChange(() => this.refresh());
    globalThis.addEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onChange);
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

  refresh() {
    const search =
      typeof globalThis.location?.search === 'string' ? globalThis.location.search : '';
    const debug = readDebugBesideSeats(search);
    const circleOff = readFocusCircleQueryFlag(search) === '0';
    const membership = debug ? null : readFocusCircleMembership(this._storage);
    const snap = debug ? null : readBesideSnapshot(this._storage);
    const roster = debug
      ? debug.memberCount
      : (membership?.rosterCount ?? membership?.memberCount ?? 0);
    const seated = debug ? debug.seatedCount : (snap?.besideSeatedCount ?? 0);
    const figures = besideSeatFigures({ memberCount: roster, seatedCount: seated });
    const show =
      !circleOff &&
      !this._focusing &&
      !isFocusCirclePresenceContributing() &&
      figures.total > 0 &&
      (debug || Boolean(membership));
    this.root.hidden = !show;
    this.root.replaceChildren();
    if (!show) {
      this.root.removeAttribute('aria-label');
      return;
    }
    this.root.setAttribute('aria-label', t('BESIDE_SEAT_FIGURES_ARIA'));
    for (let i = 0; i < figures.total; i += 1) {
      const figure = document.createElement('span');
      figure.className = 'focus-circle-beside-seats__figure';
      figure.dataset.testid = 'focus-circle-beside-seat';
      if (i < figures.seated) {
        figure.classList.add('is-seated');
        figure.dataset.seated = 'true';
        const fill = document.createElement('img');
        fill.className = 'focus-circle-beside-seats__fill';
        fill.alt = '';
        fill.src = FILL_SRC;
        figure.appendChild(fill);
      }
      const line = document.createElement('img');
      line.className = 'focus-circle-beside-seats__line';
      line.alt = '';
      line.src = OUTLINE_SRC;
      figure.appendChild(line);
      this.root.appendChild(figure);
    }
  }

  destroy() {
    this._unsubLocale?.();
    globalThis.removeEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onChange);
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-beside-seats {
        position: fixed;
        left: max(16px, env(safe-area-inset-left, 0px));
        top: 38%;
        z-index: 13;
        pointer-events: none;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 2px;
        max-width: min(46vw, 420px);
      }
      .focus-circle-beside-seats.is-focusing,
      .focus-circle-beside-seats[hidden] {
        display: none;
      }
      .focus-circle-beside-seats__figure {
        position: relative;
        width: 52px;
        height: 68px;
        flex: 0 0 auto;
      }
      .focus-circle-beside-seats__fill,
      .focus-circle-beside-seats__line {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
      }
      @media (max-width: 430px) {
        .focus-circle-beside-seats {
          top: 46%;
          max-width: 42vw;
        }
        .focus-circle-beside-seats__figure {
          width: 40px;
          height: 52px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
