const STYLE = `
:host {
  display: block;
  font-family: var(--font-family);
  width: 100%;
  max-width: 280px;
}
.track {
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--color-panel);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(46, 43, 40, 0.06);
}
.fill {
  height: 100%;
  width: 0%;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  transition: width 400ms var(--ease-calm);
}
:host([mode="quest"]) .fill {
  animation: quest-pulse 1.6s var(--ease-calm) infinite;
}
@keyframes quest-pulse {
  0%, 100% { filter: brightness(1); box-shadow: 0 0 0 0 transparent; }
  50% { filter: brightness(1.12); box-shadow: 0 0 12px var(--color-accent-soft); }
}
:host([mode="daily"]) .fill {
  animation: none;
  filter: none;
  box-shadow: none;
}
.caption {
  margin-top: 0.4rem;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}
`;

export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return ["value", "mode", "label"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="track" part="track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" part="fill"></div>
      </div>
      <div class="caption" part="caption"></div>
    `;
    this._fill = this._root.querySelector(".fill");
    this._track = this._root.querySelector(".track");
    this._caption = this._root.querySelector(".caption");
  }

  connectedCallback() {
    if (!this.hasAttribute("mode")) this.setAttribute("mode", "daily");
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const raw = parseFloat(this.getAttribute("value") || "0");
    const value = Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0));
    this._fill.style.width = `${value}%`;
    this._track.setAttribute("aria-valuenow", String(Math.round(value)));
    const label = this.getAttribute("label");
    this._caption.textContent = label || "";
    this._caption.hidden = !label;
  }
}

export const PROGRESS_BAR_TAG = "progress-bar";
