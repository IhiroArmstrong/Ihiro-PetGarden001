/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

const STYLE = `
:host {
  display: inline-flex;
  vertical-align: middle;
  pointer-events: auto;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-highlight);
  box-shadow: 0 0 0 0 transparent;
  transform: scale(1);
  transform-origin: center;
  animation: none;
}
/* Hint chrome mint (#5c7a6c) — same family as onboarding bubble border; not highlight/red */
:host([tone="hint"]) .dot {
  background: #5c7a6c;
}
:host([pulse]) .dot {
  animation: soft-pulse 1.2s var(--ease-calm) 1;
}
:host([pulse="loop"]) .dot,
:host([tone="hint"][pulse]) .dot {
  animation: soft-scale-pulse 2s var(--ease-calm) infinite;
}
/* simple peeked：静止弱化 — 一眼可辨「已读未完成操作」 */
:host([tone="hint"][state="static"]) .dot {
  width: 5px;
  height: 5px;
  opacity: 0.4;
  animation: none !important;
  transform: none;
}
@keyframes soft-pulse {
  0% { box-shadow: 0 0 0 0 var(--color-highlight); opacity: 1; }
  100% { box-shadow: 0 0 0 8px transparent; opacity: 0.85; }
}
@keyframes soft-scale-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.28); opacity: 0.88; }
}
`;

/**
 * Small notice mark — vermillion by default (milestones);
 * `tone="hint"` + `pulse="loop"` for unread onboarding clues;
 * `tone="hint"` + `state="static"` for peeked simple (no pulse, smaller/fainter).
 */
export class NotificationBadge extends HTMLElement {
  static get observedAttributes() {
    return ['aria-label'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <span class="dot" part="dot" role="status" aria-label="Notice"></span>
    `;
    this._dot = this._root.querySelector('.dot');
  }

  connectedCallback() {
    this._syncAriaLabel();
  }

  /**
   * @param {string} name
   */
  attributeChangedCallback(name) {
    if (name === 'aria-label') this._syncAriaLabel();
  }

  _syncAriaLabel() {
    if (!this._dot) return;
    const label = this.getAttribute('aria-label');
    if (label) this._dot.setAttribute('aria-label', label);
    else this._dot.setAttribute('aria-label', 'Notice');
  }
}

export const NOTIFICATION_BADGE_TAG = 'notification-badge';
