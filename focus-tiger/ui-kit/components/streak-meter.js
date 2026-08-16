/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { scheduleCelebrateReset, YIN_SILHOUETTE_SVG } from "./_shared.js";

const STYLE = `
:host {
  display: inline-block;
  font-family: var(--font-family);
  color: var(--color-ink);
  --meter-size: 140px;
  position: relative;
  z-index: 2;
  overflow: visible;
}
.wrap {
  position: relative;
  width: var(--meter-size);
  height: var(--meter-size);
  overflow: visible;
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
  background: rgba(255, 252, 245, 0.95);
  border: 1.5px solid rgba(74, 58, 40, 0.28);
  left: 50%;
  top: 50%;
  transform: rotate(var(--a)) translateY(calc(var(--meter-size) / -2 + 8px));
  transition: background 320ms var(--ease-calm, cubic-bezier(0.33, 0.1, 0.25, 1)),
    box-shadow 320ms var(--ease-calm, cubic-bezier(0.33, 0.1, 0.25, 1)),
    border-color 320ms var(--ease-calm, cubic-bezier(0.33, 0.1, 0.25, 1));
}
.dot[data-lit="1"] {
  background: var(--color-accent, #b5623a);
  border-color: transparent;
  box-shadow: 0 0 10px var(--color-accent-soft, rgba(181, 98, 58, 0.22));
}
.breath {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle, var(--color-gold-glow, rgba(212, 146, 42, 0.55)), transparent 68%);
}
:host([mode="celebrate"]) .breath {
  animation: breath-glow var(--duration-celebrate, 1.2s) var(--ease-calm, cubic-bezier(0.33, 0.1, 0.25, 1)) forwards;
}
@keyframes breath-glow {
  0% { opacity: 0; transform: scale(0.9); }
  40% { opacity: 0.9; transform: scale(1.05); }
  100% { opacity: 0; transform: scale(1.12); }
}
/*
 * Host-level tooltip (not inside .wrap): flex row / fixed wrap height must not
 * clip descenders (y / g). Extra padding-bottom keeps glyphs fully inside the card.
 */
.label {
  position: absolute;
  left: 50%;
  top: calc(var(--meter-size) + 8px);
  transform: translateX(-50%);
  z-index: 3;
  box-sizing: border-box;
  width: max-content;
  max-width: min(12.5rem, 70vw);
  padding: 0.45rem 0.7rem 0.55rem;
  border-radius: 10px;
  background: var(--color-surface-warm, #f8f1e4);
  border: 1px solid var(--color-surface-border, rgba(139, 115, 85, 0.22));
  box-shadow: var(--shadow-soft, 0 8px 24px rgba(44, 31, 20, 0.08));
  font-size: var(--font-size-sm, 0.75rem);
  line-height: 1.5;
  color: var(--text-primary, #2c1f14);
  white-space: normal;
  text-align: center;
  overflow: visible;
  pointer-events: none;
  opacity: 0;
  transition: opacity 220ms var(--ease-calm, cubic-bezier(0.33, 0.1, 0.25, 1));
}
:host(:hover) .label,
:host(:focus-within) .label,
.wrap:hover ~ .label {
  opacity: 1;
}
/* When mint pulse tip owns this control, suppress the built-in hover card
 * (and never use native title — it duplicated the same copy). */
:host([pulse-owns-tip]:hover) .label,
:host([pulse-owns-tip]:focus-within) .label,
:host([pulse-owns-tip]) .wrap:hover ~ .label {
  opacity: 0;
}
`;

export class StreakMeter extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "filled", "total", "silhouette-src", "label", "pulse-owns-tip"];
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
      </div>
      <div class="label" part="label"></div>
    `;
    this._ring = this._root.querySelector(".ring");
    this._img = this._root.querySelector(".sil img");
    this._label = this._root.querySelector(".label");
  }

  connectedCallback() {
    if (!this.hasAttribute("mode")) this.setAttribute("mode", "calm");
    if (!this.hasAttribute("total")) this.setAttribute("total", "7");
    if (!this.hasAttribute("filled")) this.setAttribute("filled", "0");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
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
    const custom = this.getAttribute("label");
    this._label.textContent =
      custom || `Days you've practiced: ${filled} of ${total}`;
    // Never set native `title` — it stacked with `.label` and with the mint
    // pulse tip (same short copy). aria-label stays for screen readers.
    this.removeAttribute("title");
    this.setAttribute("aria-label", this._label.textContent);

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
