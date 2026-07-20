const STYLE = `
:host {
  display: inline-block;
  font-family: var(--font-family);
}
button {
  appearance: none;
  border: 1px solid rgba(255, 230, 210, 0.35);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  font-size: var(--font-size-md);
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(180deg, #c47a4e 0%, var(--color-accent) 48%, #8f4a2c 100%);
  padding: 0.75rem 1.6rem;
  border-radius: var(--radius-pill);
  box-shadow:
    var(--shadow-soft),
    0 1px 0 rgba(255, 255, 255, 0.22) inset,
    0 2px 0 #7a3f24;
  transition:
    transform var(--duration-press) var(--ease-calm),
    box-shadow var(--duration-press) var(--ease-calm),
    filter var(--duration-press) var(--ease-calm);
}
button:hover {
  filter: brightness(1.04);
}
button:active {
  transform: scale(0.97);
  box-shadow:
    var(--shadow-soft),
    0 0 0 6px var(--color-accent-soft);
}
button:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 3px;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: none;
  transform: none;
}
`;

export class PrimaryButton extends HTMLElement {
  static get observedAttributes() {
    return ["disabled", "label"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <button type="button" part="button"><slot></slot></button>
    `;
    this._btn = this._root.querySelector("button");
    this._btn.addEventListener("click", (e) => {
      if (this.hasAttribute("disabled")) {
        e.stopImmediatePropagation();
        return;
      }
      this.dispatchEvent(
        new CustomEvent("ft-click", { bubbles: true, composed: true })
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
    const label = this.getAttribute("label");
    if (label && !this.childNodes.length) {
      this._btn.textContent = label;
    }
    this._btn.disabled = this.hasAttribute("disabled");
  }
}

export const PRIMARY_BUTTON_TAG = "primary-button";
