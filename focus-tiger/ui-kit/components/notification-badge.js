const STYLE = `
:host {
  display: inline-flex;
  vertical-align: middle;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-highlight);
  box-shadow: 0 0 0 0 transparent;
  animation: none;
}
:host([pulse]) .dot {
  animation: soft-pulse 1.2s var(--ease-calm) 1;
}
@keyframes soft-pulse {
  0% { box-shadow: 0 0 0 0 var(--color-highlight); opacity: 1; }
  100% { box-shadow: 0 0 0 8px transparent; opacity: 0.85; }
}
`;

/**
 * Small vermillion mark — use sparingly; never as persistent chrome noise.
 */
export class NotificationBadge extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <span class="dot" part="dot" role="status" aria-label="Notice"></span>
    `;
  }
}

export const NOTIFICATION_BADGE_TAG = "notification-badge";
