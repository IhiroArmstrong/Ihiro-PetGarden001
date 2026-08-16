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
  --hud-size: 72px;
}
.wrap {
  position: relative;
  width: var(--hud-size);
  height: var(--hud-size);
  cursor: default;
}
.halo {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--color-halo-bright) 0%,
    var(--color-halo) 42%,
    transparent 72%
  );
  opacity: 0.7;
  transition: opacity 400ms var(--ease-calm), transform 400ms var(--ease-calm);
  pointer-events: none;
}
.avatar {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-panel);
  box-shadow: var(--shadow-soft);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.stats {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  min-width: 9.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-warm);
  border: 1px solid var(--color-ink-faint);
  box-shadow: var(--shadow-soft);
  font-size: var(--font-size-sm);
  line-height: 1.45;
  color: var(--text-primary);
  opacity: 0;
  pointer-events: none;
  transition: opacity 220ms var(--ease-calm);
  white-space: nowrap;
}
.wrap:hover .stats,
.wrap:focus-within .stats {
  opacity: 1;
}
.stats strong {
  color: var(--text-primary);
  font-weight: 700;
}
:host([mode="celebrate"]) .halo {
  animation: hud-fill-pulse var(--duration-celebrate) var(--ease-calm) forwards;
}
@keyframes hud-fill-pulse {
  0% { opacity: 0.55; transform: scale(0.92); filter: saturate(1); }
  35% { opacity: 1; transform: scale(1.08); filter: saturate(1.15); }
  70% { opacity: 0.95; transform: scale(1.02); box-shadow: 0 0 24px var(--color-gold-glow); }
  100% { opacity: 0.7; transform: scale(1); filter: saturate(1); }
}
`;

export class TigerHud extends HTMLElement {
  static get observedAttributes() {
    return ["mode", "streak-count", "session-count", "avatar-src"];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.innerHTML = `
      <style>${STYLE}</style>
      <div class="wrap" tabindex="0" part="wrap">
        <div class="halo" part="halo" aria-hidden="true"></div>
        <div class="avatar" part="avatar">
          <img alt="" part="img" />
        </div>
        <div class="stats" part="stats" role="status"></div>
      </div>
    `;
    this._img = this._root.querySelector("img");
    this._stats = this._root.querySelector(".stats");
  }

  connectedCallback() {
    if (!this.hasAttribute("mode")) this.setAttribute("mode", "calm");
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "mode" && newVal === "celebrate") {
      scheduleCelebrateReset(this);
    }
    this._render();
  }

  _render() {
    const streak = this.getAttribute("streak-count") ?? "0";
    const sessions = this.getAttribute("session-count") ?? "0";
    const src = this.getAttribute("avatar-src") || YIN_SILHOUETTE_SVG;
    this._img.src = src;
    this._img.alt = "Yin";
    this._stats.innerHTML = `
      <div>You've sat together for <strong>${streak}</strong> days</div>
      <div>Sessions today: <strong>${sessions}</strong></div>
    `;
  }
}

export const TIGER_HUD_TAG = "tiger-hud";
