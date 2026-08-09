/**
 * Pluggable Lit host for Yin’s daily wisdom line.
 * Free content; no entitlement. Not wired to a product scene yet — mount anywhere.
 *
 * @example
 * import './ui/daily-wisdom.js';
 * // <daily-wisdom></daily-wisdom>
 */

import { LitElement, html, css } from 'lit';
import { resolveTodayWisdom } from '../core/dailyWisdom.js';
import { getLocale, onLocaleChange } from '../locales/i18n.js';

export const DAILY_WISDOM_TAG = 'daily-wisdom';

export class DailyWisdomElement extends LitElement {
  static properties = {
    /** Override i18n locale (`en` / `ja`); omit to follow app locale. */
    locale: { type: String },
    /** Locked quote id for the resolved day (reflected for tests / CSS). */
    quoteId: { type: String, attribute: 'quote-id', reflect: true },
    /** @private */
    _text: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      color: #3d2e22;
      font-family:
        'Iowan Old Style', 'Palatino Linotype', Palatino, 'Songti SC',
        'Noto Serif SC', Georgia, serif;
      font-size: 15px;
      font-weight: 500;
      font-style: italic;
      letter-spacing: 0.01em;
      line-height: 1.55;
    }
    p {
      margin: 0;
    }
  `;

  constructor() {
    super();
    /** @type {string | undefined} */
    this.locale = undefined;
    /** @type {string} */
    this.quoteId = '';
    /** @type {string} */
    this._text = '';
    /** @type {(() => void) | null} */
    this._unsubLocale = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._refresh();
    this._unsubLocale = onLocaleChange(() => {
      if (this.locale) return;
      this._refresh();
    });
  }

  disconnectedCallback() {
    this._unsubLocale?.();
    this._unsubLocale = null;
    super.disconnectedCallback();
  }

  /**
   * @param {Map<string, unknown>} changed
   */
  updated(changed) {
    if (changed.has('locale') && changed.get('locale') !== undefined) {
      this._refresh();
    }
  }

  _refresh() {
    const locale = this.locale || getLocale() || 'en';
    const resolved = resolveTodayWisdom({ locale });
    if (!resolved) {
      this.quoteId = '';
      this._text = '';
      return;
    }
    this.quoteId = resolved.id;
    this._text = resolved.text;
    this.dispatchEvent(
      new CustomEvent('daily-wisdom-ready', {
        detail: {
          dateKey: resolved.dateKey,
          id: resolved.id,
          text: resolved.text,
          locale: resolved.locale
        },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`<p part="quote" data-testid="daily-wisdom-text">${this._text}</p>`;
  }
}

if (!customElements.get(DAILY_WISDOM_TAG)) {
  customElements.define(DAILY_WISDOM_TAG, DailyWisdomElement);
}
