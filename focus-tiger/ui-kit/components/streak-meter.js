import { scheduleCelebrateReset, YIN_SILHOUETTE_SVG } from "./_shared.js";

const STYLE = `
:host {
  display: inline-block;
  font-family: var(--font-family);
  color: var(--color-ink);
  --meter-size: 140px;
}
.wrap {
  position: relative;
  width: var(--meter-size);
  height: var(--meter-size);
}
.sil {
  position: absolute;
  inset: 28%;
  opacity: 0.35;
  pointer-events: none;
}
.sil img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}
.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  margin: -5px;
  border-radius: 50%;
  background: var(--color-panel);
  border: 1.5px solid var(--color-ink-faint);
  left: 50%;
  top: 50%;
  transform: rotate(var(--a)) translateY(calc(var(--meter-size) / -2 + 8px));
  transition: background 320ms var(--ease-calm), box-shadow 320ms var(--ease-calm);
}
.dot[data-lit="1"] {
  background: var(--color-accent);
  border-color: transparent;
  box-shadow: 0 0 10px var(--color-accent-soft);
}
.breath {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle, var(--color-gold-glow), transparent 68%);
}
:host([mode="celebrate"]) .breath {
  animation: breath-glow var(--duration-celebrate) var(--ease-calm) forwards;
}
@keyframes breath-glow {
  0% { opacity: 0; transform: scale(0.9); }
  40% { opacity: 0.9; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(1.12); }
}
.label {
  position: absolute;
  left: 50%;
  bottom: -1.6rem;
  transform: translateX(-50%);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 220ms var(--ease-calm);
}
.wrap:hover .label {
  opacity: 1;
}
`;

export class StreakMeter extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "filled", "total", "silhouette-src"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="wrap" part="wrap">
        <div class="breath" part="breath" aria-hidden="true"></div>
        <div class="ring" part="ring"></div>
        <div class="sil"><img alt="" /></div>
        <div class="label" part="label"></div>
      </div>
    `;
    this._ring = this._root.querySelector(".ring");
    this._img = this._root.querySelector(".sil img");
    this._label = this._root.querySelector(".label");
  }

  connectedCallback() {
    if (!this.hasAttribute("mode")) this.setAttribute("mode", "calm");
    if (!this.hasAttribute("total")) this.setAttribute("total", "7");
    if (!this.hasAttribute("filled")) this.setAttribute("filled", "0");
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "mode" && newVal === "celebrate") {
      scheduleCelebrateReset(this);
    }
    if (name === "filled") {
      const total = Math.max(1, parseInt(this.getAttribute("total") || "7", 10));
      const filled = Math.min(total, Math.max(0, parseInt(newVal || "0", 10)));
      const prev = Math.min(total, Math.max(0, parseInt(oldVal || "0", 10)));
      // Full circle → one breath of gold (only on the transition into full)
      if (filled >= total && prev < total) {
        this.setAttribute("mode", "celebrate");
      }
    }
    this._render();
  }

  _render() {
    const total = Math.max(1, parseInt(this.getAttribute("total") || "7", 10));
    const filled = Math.min(total, Math.max(0, parseInt(this.getAttribute("filled") || "0", 10)));
    this._img.src = this.getAttribute("silhouette-src") || YIN_SILHOUETTE_SVG;
    this._label.textContent = `Days you've practiced: ${filled} of ${total}`;

    this._ring.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.dataset.lit = i < filled ? "1" : "0";
      const angle = (360 / total) * i - 90;
      dot.style.setProperty("--a", `${angle}deg`);
      this._ring.appendChild(dot);
    }
  }
}

export const STREAK_METER_TAG = "streak-meter";
