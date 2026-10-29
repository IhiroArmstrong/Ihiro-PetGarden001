/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange } from '../locales/i18n.js';
import {
  readMindflowNebulaEnabled,
  resolveMindflowNebulaPresentation
} from '../core/mindflowNebula/mindflowNebulaStore.js';
import { Z } from './zIndexLayers.js';

const STYLE_ID = 'mindflow-nebula-chrome-v1';
const SIZE_PX = 180;
const PARTICLE_COUNT = 48;

/** @typedef {import('../core/mindflowNebula/mindflowNebulaStore.js').MindflowNebulaMode} MindflowNebulaMode */

/**
 * @param {MindflowNebulaMode} mode
 * @returns {{ drift: number, pulse: number, spread: number }}
 */
function motionParamsForMode(mode) {
  if (mode === 'companion_speak') {
    return { drift: 0.35, pulse: 0.55, spread: 1.05 };
  }
  if (mode === 'confide') {
    return { drift: 0.18, pulse: 0.28, spread: 0.92 };
  }
  return { drift: 0.08, pulse: 0.12, spread: 0.78 };
}

export class MindflowNebulaChromeUI {
  /**
   * @param {HTMLElement} mountRoot
   * @param {object} [handlers]
   * @param {Storage | null} [handlers.storage]
   */
  constructor(mountRoot, handlers = {}) {
    this.handlers = handlers;
    this._storage =
      handlers.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._focusing = false;
    this._confideOpen = false;
    this._companionSpeaking = false;
    this._enabled = readMindflowNebulaEnabled(this._storage);
    this._mode = /** @type {MindflowNebulaMode} */ ('rest');
    this._raf = 0;
    this._lastTs = 0;
    /** @type {Array<{ x: number, y: number, vx: number, vy: number, r: number, hue: number }>} */
    this._particles = [];

    this.root = document.createElement('div');
    this.root.id = 'mindflow-nebula-chrome';
    this.root.className = 'mindflow-nebula-chrome';
    this.root.hidden = true;
    this.root.dataset.testid = 'mindflow-nebula-chrome';
    this.root.setAttribute('aria-hidden', 'true');

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'mindflow-nebula-chrome__canvas';
    this.canvas.width = SIZE_PX;
    this.canvas.height = SIZE_PX;
    this.canvas.dataset.testid = 'mindflow-nebula-canvas';
    this.root.append(this.canvas);
    mountRoot.appendChild(this.root);

    this._ctx = this.canvas.getContext('2d');
    this._seedParticles();
    this._injectStyles();
    this._unsubLocale = onLocaleChange(() => this._applyHoverCopy());
    this._applyHoverCopy();
    this.refresh();
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this._enabled = Boolean(enabled);
    this.refresh();
  }

  /** @param {boolean} focusing */
  setFocusing(focusing) {
    this._focusing = Boolean(focusing);
    this.refresh();
  }

  /** @param {boolean} open */
  setConfideOpen(open) {
    this._confideOpen = Boolean(open);
    this.refresh();
  }

  /** @param {boolean} speaking */
  setCompanionSpeaking(speaking) {
    this._companionSpeaking = Boolean(speaking);
    this.refresh();
  }

  refresh() {
    const { visible, mode } = resolveMindflowNebulaPresentation({
      enabled: this._enabled,
      focusing: this._focusing,
      confideOpen: this._confideOpen,
      companionSpeaking: this._companionSpeaking
    });
    this._mode = mode;
    this.root.hidden = !visible;
    this.root.classList.toggle('is-focusing', this._focusing);
    this.root.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible) this._startLoop();
    else this._stopLoop();
  }

  destroy() {
    this._stopLoop();
    this._unsubLocale?.();
    this.root.remove();
  }

  _seedParticles() {
    this._particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      this._particles.push({
        x: Math.random() * SIZE_PX,
        y: Math.random() * SIZE_PX,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1.2 + Math.random() * 2.2,
        hue: 195 + Math.random() * 25
      });
    }
  }

  _startLoop() {
    if (this._raf) return;
    this._lastTs = 0;
    const tick = (ts) => {
      this._raf = requestAnimationFrame(tick);
      const dt = this._lastTs ? Math.min(48, ts - this._lastTs) / 1000 : 0;
      this._lastTs = ts;
      this._draw(dt);
    };
    this._raf = requestAnimationFrame(tick);
  }

  _stopLoop() {
    if (!this._raf) return;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._lastTs = 0;
    const ctx = this._ctx;
    if (ctx) ctx.clearRect(0, 0, SIZE_PX, SIZE_PX);
  }

  /**
   * @param {number} dt
   */
  _draw(dt) {
    const ctx = this._ctx;
    if (!ctx) return;
    const { drift, pulse, spread } = motionParamsForMode(this._mode);
    const cx = SIZE_PX / 2;
    const cy = SIZE_PX / 2;
    ctx.clearRect(0, 0, SIZE_PX, SIZE_PX);
    ctx.fillStyle = 'rgba(248, 246, 242, 0.04)';
    ctx.fillRect(0, 0, SIZE_PX, SIZE_PX);

    const tPulse = performance.now() * 0.001 * pulse;
    for (const p of this._particles) {
      p.vx += (Math.random() - 0.5) * drift * dt * 0.6;
      p.vy += (Math.random() - 0.5) * drift * dt * 0.6;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const pull = (dist / (SIZE_PX * 0.45) - 1) * spread * dt * 0.15;
      p.vx -= (dx / dist) * pull;
      p.vy -= (dy / dist) * pull;
      p.x += p.vx * (18 + drift * 40) * dt;
      p.y += p.vy * (18 + drift * 40) * dt;
      if (p.x < 0) p.x = SIZE_PX;
      if (p.x > SIZE_PX) p.x = 0;
      if (p.y < 0) p.y = SIZE_PX;
      if (p.y > SIZE_PX) p.y = 0;
      const tw = 0.55 + 0.45 * Math.sin(tPulse + p.x * 0.02);
      const alpha = 0.12 + tw * 0.28;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 22%, 78%, ${alpha})`;
      ctx.arc(p.x, p.y, p.r * tw, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _applyHoverCopy() {
    this.root.title = t('MINDFLOW_NEBULA_HOVER');
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.mindflow-nebula-chrome {
  position: fixed;
  right: max(12px, env(safe-area-inset-right, 0px));
  bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  width: ${SIZE_PX}px;
  height: ${SIZE_PX}px;
  z-index: ${Z.CLUSTER};
  pointer-events: none;
  border-radius: 20px;
  overflow: hidden;
  opacity: 0.92;
  box-shadow: 0 8px 28px rgba(40, 52, 68, 0.08);
  backdrop-filter: blur(6px);
}
.mindflow-nebula-chrome__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
@media (max-width: 479px) {
  .mindflow-nebula-chrome {
    right: 8px;
    bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    transform: scale(0.92);
    transform-origin: bottom right;
  }
}
`;
    document.head.appendChild(style);
  }
}
