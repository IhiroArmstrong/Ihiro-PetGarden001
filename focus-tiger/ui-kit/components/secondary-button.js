const STYLE = `
:host {
  display: inline-block;
  font-family: var(--font-family);
}
button {
  appearance: none;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  font-size: var(--font-size-md);
  letter-spacing: 0.02em;
  color: var(--color-ink);
  background: transparent;
  padding: 0.65rem 1.4rem;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--color-ink);
  transition:
    transform var(--duration-press) var(--ease-calm),
    background var(--duration-press) var(--ease-calm),
    opacity var(--duration-press) var(--ease-calm);
}
button:hover {
  background: var(--color-ink-faint);
}
button:active {
  transform: scale(0.97);
}
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
`;

export class SecondaryButton extends HTMLElement {
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

export const SECONDARY_BUTTON_TAG = "secondary-button";
