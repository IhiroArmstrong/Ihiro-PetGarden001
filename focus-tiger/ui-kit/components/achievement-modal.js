import { scheduleCelebrateReset, YIN_SILHOUETTE_SVG } from "./_shared.js";

const STYLE = `
:host {
  display: none;
  font-family: var(--font-family);
  color: var(--color-ink);
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  place-items: center;
  background: rgba(46, 43, 40, 0.28);
}
:host([open]) {
  display: grid;
  animation: veil-in 280ms var(--ease-calm) both;
}
.card {
  position: relative;
  width: min(340px, calc(100vw - 2rem));
  background: var(--color-surface-warm);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lift);
  border: 1px solid var(--color-ink-faint);
  padding: 1.5rem 1.35rem 1.25rem;
  text-align: center;
  overflow: hidden;
  animation: card-in 360ms var(--ease-calm) both;
}
.glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 50% 30%, var(--color-gold-glow), transparent 55%);
  opacity: 0;
  pointer-events: none;
}
:host([mode="celebrate"]) .glow {
  animation: gold-flash var(--duration-celebrate) var(--ease-calm) forwards;
}
.art {
  width: 120px;
  height: 120px;
  margin: 0 auto 0.85rem;
  border-radius: 50%;
  background: var(--color-panel);
  display: grid;
  place-items: center;
  overflow: hidden;
}
.art img {
  width: 88%;
  height: 88%;
  object-fit: contain;
}
.message {
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.4;
  margin: 0 0 0.35rem;
  color: var(--text-primary);
}
.sub {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 1.1rem;
  line-height: 1.45;
}
.close {
  appearance: none;
  border: 1.5px solid var(--color-ink);
  background: transparent;
  color: var(--color-ink);
  font: inherit;
  font-weight: 600;
  padding: 0.55rem 1.2rem;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: opacity 400ms var(--ease-calm), transform 400ms var(--ease-calm);
}
.close:hover { background: var(--color-ink-faint); }
@keyframes veil-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes card-in {
  from { opacity: 0; transform: scale(0.94) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes gold-flash {
  0% { opacity: 0; }
  30% { opacity: 0.85; }
  100% { opacity: 0; }
}
:host([closing]) .card {
  animation: card-out 420ms var(--ease-calm) forwards;
}
:host([closing]) {
  animation: veil-out 420ms var(--ease-calm) forwards;
}
@keyframes card-out {
  to { opacity: 0; transform: scale(0.96) translateY(6px); }
}
@keyframes veil-out {
  to { opacity: 0; }
}
`;

export class AchievementModal extends HTMLElement {
  static get observedAttributes() {
    return ["open", "mode", "message", "subtext", "image-src"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="card" part="card" role="dialog" aria-modal="true">
        <div class="glow" aria-hidden="true"></div>
        <div class="art"><img alt="" /></div>
        <p class="message" part="message"></p>
        <p class="sub" part="sub"></p>
        <button type="button" class="close" part="close">Continue quietly</button>
      </div>
    `;
    this._img = this._root.querySelector("img");
    this._msg = this._root.querySelector(".message");
    this._sub = this._root.querySelector(".sub");
    this._root.querySelector(".close").addEventListener("click", () => this.close());
    this._root.addEventListener("click", (e) => {
      if (e.target === this._root.host) this.close();
    });
  }

  connectedCallback() {
    if (!this.hasAttribute("mode")) this.setAttribute("mode", "celebrate");
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "open" && this.hasAttribute("open")) {
      this.setAttribute("mode", "celebrate");
      scheduleCelebrateReset(this);
    }
    if (name === "mode" && newVal === "celebrate") {
      scheduleCelebrateReset(this);
    }
    this._render();
  }

  close() {
    if (!this.hasAttribute("open") || this.hasAttribute("closing")) return;
    this.setAttribute("closing", "");
    setTimeout(() => {
      this.removeAttribute("closing");
      this.removeAttribute("open");
      this.dispatchEvent(
        new CustomEvent("ft-close", { bubbles: true, composed: true })
      );
    }, 420);
  }

  _render() {
    this._img.src = this.getAttribute("image-src") || YIN_SILHOUETTE_SVG;
    this._msg.textContent =
      this.getAttribute("message") ||
      "You've sat with Yin for 7 days.";
    this._sub.textContent =
      this.getAttribute("subtext") ||
      "A small keepsake joins your shared path.";
  }
}

export const ACHIEVEMENT_MODAL_TAG = "achievement-modal";
