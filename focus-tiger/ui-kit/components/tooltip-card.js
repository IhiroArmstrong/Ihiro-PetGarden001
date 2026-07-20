const PANEL_STYLE = `
:host {
  display: block;
  font-family: var(--font-family);
  color: var(--text-primary);
}
.card {
  position: relative;
  background: linear-gradient(
    180deg,
    var(--color-surface-warm-top, rgba(255, 255, 255, 0.96)) 0%,
    var(--color-surface-warm) 100%
  );
  border: 1px solid var(--color-surface-border, var(--color-ink-faint));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  padding: 1.35rem 1.45rem 1.3rem;
  animation: enter var(--duration-enter) var(--ease-calm) both;
  overflow: hidden;
}
.stripes {
  position: absolute;
  width: 28px;
  height: 28px;
  opacity: 0.1;
  pointer-events: none;
}
.stripes::before,
.stripes::after {
  content: "";
  position: absolute;
  background: var(--color-ink);
  border-radius: 1px;
}
.stripes::before {
  width: 2px;
  height: 18px;
  transform: rotate(18deg);
  left: 8px;
  top: 4px;
}
.stripes::after {
  width: 2px;
  height: 12px;
  transform: rotate(18deg);
  left: 14px;
  top: 8px;
}
.stripes.tl { top: 10px; left: 10px; }
.stripes.br { bottom: 10px; right: 10px; transform: rotate(180deg); }
.title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.65rem;
  padding-right: 0.5rem;
  line-height: 1.4;
}
.body {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
  padding-right: 0.25rem;
}
.close {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
}
.close:hover {
  background: var(--color-ink-faint);
  color: var(--text-primary);
}
.close svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 1.6;
  fill: none;
  stroke-linecap: round;
}
@keyframes enter {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
`;

const CLOSE_SVG = `
<svg viewBox="0 0 16 16" aria-hidden="true">
  <path d="M4 4l8 8M12 4l-8 8"/>
</svg>
`;

function panelTemplate(withClose) {
  return `
    <style>${PANEL_STYLE}</style>
    <div class="card" part="card">
      <span class="stripes tl" aria-hidden="true"></span>
      <span class="stripes br" aria-hidden="true"></span>
      ${withClose ? `<button class="close" type="button" part="close" aria-label="Close">${CLOSE_SVG}</button>` : ""}
      <h3 class="title" part="title"></h3>
      <p class="body" part="body"><slot></slot></p>
    </div>
  `;
}

export class TooltipCard extends HTMLElement {
  static get observedAttributes() {
    return ["title"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = panelTemplate(false);
    this._title = this._root.querySelector(".title");
  }

  connectedCallback() {
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    const t = this.getAttribute("title") || "";
    this._title.textContent = t;
    this._title.hidden = !t;
  }
}

export class DialogBox extends HTMLElement {
  static get observedAttributes() {
    return ["title", "open"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = panelTemplate(true);
    this._title = this._root.querySelector(".title");
    this._root.querySelector(".close").addEventListener("click", () => {
      this.removeAttribute("open");
      this.dispatchEvent(
        new CustomEvent("ft-close", { bubbles: true, composed: true })
      );
    });
  }

  connectedCallback() {
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    const t = this.getAttribute("title") || "";
    this._title.textContent = t;
    this._title.hidden = !t;
    const open = this.hasAttribute("open");
    this.hidden = !open;
    this.style.display = open ? "block" : "none";
  }
}

export const TOOLTIP_CARD_TAG = "tooltip-card";
export const DIALOG_BOX_TAG = "dialog-box";
