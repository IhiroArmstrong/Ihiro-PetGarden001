/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle / Arrive anonymous witness trace — pointer-events none except respond.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  FOCUS_CIRCLE_CHANGE_EVENT,
  readFocusCircleMembership
} from '../core/focusCircleMembership.js';
import {
  FOCUS_CIRCLE_IDENTITY_CHANGE_EVENT,
  getFocusCircleIdentityPeekMap,
  hideFocusCircleMemberLocally,
  isFocusCircleIdentityClientEnabled,
  readHiddenMemberIds,
  resolveFocusCircleDisplayName
} from '../core/focusCircleIdentity.js';
import {
  IDLE_LANTERN_BOTTOM_NARROW_CSS,
  IDLE_LANTERN_BOTTOM_WIDE_CSS,
  IDLE_LANTERN_NARROW_MQ_MAX_PX
} from '../core/quietTogetherLanternLayout.js';
import {
  FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
  getFocusCircleWitnessPeekSnapshot,
  isFocusCircleWitnessClientEnabled
} from '../core/focusCircleWitness.js';

const STYLE_ID = 'focus-circle-witness-chrome-v1';
/** Above presence dots (~42px) + caption (~18px). */
const WITNESS_ABOVE_PRESENCE_CSS = '62px';

export class FocusCircleWitnessChrome {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   * @param {() => void} [handlers.onRespond]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._focusing = false;
    this._visibleAllowed = true;
    /** @type {{ traceId: string, phraseKey: string, authorMemberId?: string } | null} */
    this._trace = null;

    this.root = document.createElement('div');
    this.root.id = 'focus-circle-witness';
    this.root.className = 'focus-circle-witness';
    this.root.hidden = true;
    this.root.dataset.testid = 'focus-circle-witness';
    this.root.setAttribute('aria-live', 'polite');

    this.phrase = document.createElement('p');
    this.phrase.className = 'focus-circle-witness__phrase';

    this.respondBtn = document.createElement('button');
    this.respondBtn.type = 'button';
    this.respondBtn.className = 'focus-circle-witness__respond';
    this.respondBtn.dataset.testid = 'focus-circle-witness-respond';
    this.respondBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.handlers.onRespond?.();
    });

    this.hideBtn = document.createElement('button');
    this.hideBtn.type = 'button';
    this.hideBtn.className = 'focus-circle-witness__hide';
    this.hideBtn.dataset.testid = 'focus-circle-witness-hide-name';
    this.hideBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const membership = readFocusCircleMembership(this._storage);
      const authorMemberId = this._trace?.authorMemberId;
      if (!membership?.circleId || !authorMemberId) return;
      hideFocusCircleMemberLocally(
        this._storage,
        membership.circleId,
        authorMemberId
      );
      this.refresh();
    });

    this.root.append(this.phrase, this.respondBtn, this.hideBtn);
    mountRoot.appendChild(this.root);
    this._injectStyles();

    this._unsubLocale = onLocaleChange(() => this.refresh());
    this._onMembership = () => this.refresh();
    this._onWitness = (event) => {
      const trace = event?.detail?.trace;
      if (trace && typeof trace === 'object') {
        this.setTrace(trace);
        return;
      }
      this.refresh();
    };
    globalThis.addEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onMembership);
    globalThis.addEventListener?.(
      FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
      this._onWitness
    );
    globalThis.addEventListener?.(
      FOCUS_CIRCLE_IDENTITY_CHANGE_EVENT,
      this._onMembership
    );

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
   * @param {{ traceId?: string, phraseKey?: string, authorMemberId?: string } | null} trace
   */
  setTrace(trace) {
    if (!trace || !trace.traceId || !trace.phraseKey) {
      this._trace = null;
    } else {
      this._trace = {
        traceId: trace.traceId,
        phraseKey: trace.phraseKey,
        ...(trace.authorMemberId ? { authorMemberId: trace.authorMemberId } : {})
      };
    }
    this.refresh();
  }

  /** @returns {{ traceId: string, phraseKey: string, authorMemberId?: string } | null} */
  getTrace() {
    return this._trace;
  }

  refresh() {
    const enabled =
      isFocusCircleWitnessClientEnabled({
        storage: this._storage,
        search:
          typeof globalThis.location?.search === 'string'
            ? globalThis.location.search
            : ''
      }) && Boolean(readFocusCircleMembership(this._storage));
    const snapshot = getFocusCircleWitnessPeekSnapshot();
    const trace = snapshot ?? this._trace;
    const show =
      this._visibleAllowed &&
      enabled &&
      !this._focusing &&
      trace != null &&
      trace.phraseKey;

    this.root.hidden = !show;
    this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show) {
      this.phrase.textContent = '';
      this.respondBtn.disabled = false;
      this.hideBtn.hidden = true;
      return;
    }

    this._trace = {
      traceId: trace.traceId,
      phraseKey: trace.phraseKey,
      ...(trace.authorMemberId ? { authorMemberId: trace.authorMemberId } : {})
    };
    const membership = readFocusCircleMembership(this._storage);
    const identityEnabled = isFocusCircleIdentityClientEnabled({
      storage: this._storage,
      search:
        typeof globalThis.location?.search === 'string'
          ? globalThis.location.search
          : ''
    });
    const anonLabel = t('FOCUS_CIRCLE_IDENTITY_ANON_LABEL');
    const hiddenMemberIds =
      membership?.circleId && identityEnabled
        ? readHiddenMemberIds(this._storage, membership.circleId)
        : new Set();
    const displayName = identityEnabled
      ? resolveFocusCircleDisplayName({
          anonLabel,
          memberId: trace.authorMemberId ?? '',
          identities: getFocusCircleIdentityPeekMap(),
          hiddenMemberIds,
          t
        })
      : anonLabel;
    const phraseText = t(trace.phraseKey);
    this.phrase.textContent = t('FOCUS_CIRCLE_WITNESS_IDLE_LINE')
      .replace('{name}', displayName)
      .replace('{phrase}', phraseText);
    this.respondBtn.textContent = t('FOCUS_CIRCLE_WITNESS_RESPOND_BTN');
    const canHide =
      identityEnabled &&
      trace.authorMemberId &&
      displayName !== anonLabel;
    this.hideBtn.hidden = !canHide;
    this.hideBtn.textContent = t('FOCUS_CIRCLE_IDENTITY_HIDE_BTN');
    this.root.setAttribute(
      'aria-label',
      t('FOCUS_CIRCLE_WITNESS_IDLE_ARIA')
    );
  }

  setRespondDisabled(disabled) {
    this.respondBtn.disabled = Boolean(disabled);
  }

  destroy() {
    this._unsubLocale?.();
    globalThis.removeEventListener?.(FOCUS_CIRCLE_CHANGE_EVENT, this._onMembership);
    globalThis.removeEventListener?.(
      FOCUS_CIRCLE_WITNESS_CHANGE_EVENT,
      this._onWitness
    );
    globalThis.removeEventListener?.(
      FOCUS_CIRCLE_IDENTITY_CHANGE_EVENT,
      this._onMembership
    );
    this.root.remove();
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .focus-circle-witness {
        position: fixed;
        left: 18px;
        bottom: calc(${IDLE_LANTERN_BOTTOM_WIDE_CSS} + ${WITNESS_ABOVE_PRESENCE_CSS});
        z-index: 3;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        max-width: 46vw;
        opacity: 0.76;
        transition: opacity 280ms ease;
      }
      .focus-circle-witness.is-focusing,
      .focus-circle-witness[hidden] {
        opacity: 0;
      }
      .focus-circle-witness__phrase {
        margin: 0;
        font-size: 10.5px;
        line-height: 1.35;
        letter-spacing: 0.02em;
        color: rgba(214, 222, 236, 0.72);
        text-shadow: 0 1px 2px rgba(20, 16, 10, 0.45);
      }
      .focus-circle-witness__respond {
        pointer-events: auto;
        margin: 0;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(180, 198, 224, 0.35);
        background: rgba(24, 30, 42, 0.42);
        color: rgba(228, 236, 248, 0.88);
        font-size: 10px;
        letter-spacing: 0.03em;
        cursor: pointer;
      }
      .focus-circle-witness__hide {
        pointer-events: auto;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: rgba(198, 208, 224, 0.62);
        font-size: 9.5px;
        letter-spacing: 0.02em;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .focus-circle-witness__hide[hidden] {
        display: none;
      }
      .focus-circle-witness__respond:disabled {
        opacity: 0.55;
        cursor: default;
      }
      @media (max-width: ${IDLE_LANTERN_NARROW_MQ_MAX_PX}px) {
        .focus-circle-witness {
          left: 12px;
          bottom: calc(${IDLE_LANTERN_BOTTOM_NARROW_CSS} + ${WITNESS_ABOVE_PRESENCE_CSS});
        }
      }
    `;
    document.head.appendChild(style);
  }
}
