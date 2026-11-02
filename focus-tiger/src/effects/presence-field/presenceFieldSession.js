/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t, onLocaleChange } from '../../locales/i18n.js';
import { Z } from '../../ui/zIndexLayers.js';
import {
  OSCILLATOR_COUNT,
  createNaturalFrequencies,
  createPhases,
  stepOscillators
} from './kuramotoField.js';
import {
  DETUNE_MS,
  couplingK,
  couplingSigma,
  resolvePresenceFieldMode,
  visualGainForMode
} from './presenceFieldMode.js';
import { readPresenceFieldQuery } from './presenceFieldQuery.js';
import { readPresenceFieldEnabled } from './presenceFieldStore.js';

const STYLE_ID = 'presence-field-session-v1';

/**
 * Sit-together field on the existing gold rim. Not a second shader scene.
 */
export class PresenceFieldSession {
  /**
   * @param {{
   *   lightProgression?: { _ensureRimGlow?: () => HTMLElement | null },
   *   ambient?: { isAudiblePlaying?: () => boolean, setPresenceFieldEnvelope?: (n: number) => void, clearPresenceFieldEnvelope?: () => void },
   *   storage?: Storage | null,
   *   search?: string,
   *   now?: () => number
   * }} [deps]
   */
  constructor(deps = {}) {
    this._light = deps.lightProgression || null;
    this._ambient = deps.ambient || null;
    this._storage =
      deps.storage ??
      (typeof globalThis !== 'undefined' ? globalThis.localStorage : null);
    this._now = deps.now || (() => Date.now());
    this._query = readPresenceFieldQuery(deps.search);
    this._enabled = this._query.forceOn || readPresenceFieldEnabled(this._storage);
    this._focusing = false;
    this._recoverDisplay = false;
    this._recoverUntil = 0;
    this._focusStartedAt = 0;
    this._lockEnteredAt = 0;
    this._mode = /** @type {import('./presenceFieldMode.js').PresenceFieldMode} */ (
      'off'
    );
    this._r = 0.2;
    this._debugK = null;
    this._debugSigma = null;
    this._omegas = createNaturalFrequencies(OSCILLATOR_COUNT);
    this._thetas = createPhases(OSCILLATOR_COUNT);
    /** @type {HTMLElement[]} */
    this._lobes = [];
    this._debugRoot = null;
    this._unsubLocale = onLocaleChange(() => this._applyHover());
  }

  /** @param {boolean} enabled */
  setEnabled(enabled) {
    this._enabled = Boolean(enabled) || this._query.forceOn;
    if (!this._enabled) this._teardownVisual();
  }

  refreshFromStorage() {
    this.setEnabled(readPresenceFieldEnabled(this._storage));
  }

  /** @param {boolean} focusing */
  setFocusing(focusing) {
    const next = Boolean(focusing);
    if (next && !this._focusing) {
      this._focusStartedAt = this._now();
      this._lockEnteredAt = 0;
      this._mode = 'scatter';
      this._thetas = createPhases(OSCILLATOR_COUNT);
    }
    this._focusing = next;
    if (!next) this._teardownVisual();
  }

  notifyRecoverDisplay() {
    this._recoverDisplay = true;
    this._recoverUntil = this._now() + DETUNE_MS;
  }

  /**
   * @param {{
   *   deltaSec?: number,
   *   glowSuppressed?: boolean
   * }} [tick]
   */
  tick(tick = {}) {
    const enabled = this._enabled || this._query.forceOn;
    if (this._recoverDisplay && this._now() >= this._recoverUntil) {
      this._recoverDisplay = false;
    }
    const resolved = resolvePresenceFieldMode({
      enabled,
      focusing: this._focusing,
      recoverDisplay: this._recoverDisplay,
      elapsedFocusMs: this._focusing ? this._now() - this._focusStartedAt : 0,
      r: this._r,
      mode: this._mode,
      lockHeldMs: this._lockEnteredAt ? this._now() - this._lockEnteredAt : 0
    });

    if (resolved.mode === 'lock' && this._mode !== 'lock') {
      this._lockEnteredAt = this._now();
    }
    if (resolved.mode !== 'lock') {
      this._lockEnteredAt = resolved.mode === 'rest' ? this._lockEnteredAt : 0;
    }
    this._mode = resolved.mode;

    if (!resolved.visible || tick.glowSuppressed) {
      if (this._lobes.length > 0 || this._mode !== 'off') {
        this._teardownVisual();
        this._ambient?.clearPresenceFieldEnvelope?.();
      }
      return;
    }

    const dt = Math.max(0.001, Math.min(0.05, Number(tick.deltaSec) || 1 / 60));
    const stepped = stepOscillators(this._thetas, this._omegas, {
      K: couplingK(resolved.coupling, this._debugK),
      sigma: couplingSigma(resolved.coupling, this._debugSigma),
      dt
    });
    this._thetas = stepped.thetas;
    this._r = stepped.r;
    this._ensureLobes();
    this._paintLobes(visualGainForMode(resolved.mode));
    this._applyRimMod(visualGainForMode(resolved.mode));
    this._applyHover();
    if (this._ambient?.isAudiblePlaying?.()) {
      this._ambient.setPresenceFieldEnvelope?.(0.88 + this._r * 0.14);
    } else {
      this._ambient?.clearPresenceFieldEnvelope?.();
    }
    if (this._query.debug) this._ensureDebug();
  }

  destroy() {
    this._unsubLocale?.();
    this._teardownVisual();
    this._debugRoot?.remove();
    this._debugRoot = null;
    this._ambient?.clearPresenceFieldEnvelope?.();
  }

  /** @returns {{ mode: string, r: number, visible: boolean }} */
  snapshot() {
    return {
      mode: this._mode,
      r: this._r,
      visible: this._lobes.length > 0 && this._mode !== 'off'
    };
  }

  /**
   * @param {boolean} [create]
   * @returns {HTMLElement | null}
   */
  _rimEl(create = false) {
    const existing =
      typeof document !== 'undefined'
        ? document.getElementById('light-progression-rim')
        : null;
    if (existing || !create) return existing;
    return this._light?._ensureRimGlow?.() || null;
  }

  _ensureLobes() {
    const rim = this._rimEl(true);
    if (!rim) return;
    if (this._lobes.length === OSCILLATOR_COUNT && this._lobes[0]?.isConnected) {
      return;
    }
    this._teardownVisual();
    rim.dataset.testid = rim.dataset.testid || 'light-progression-rim';
    for (let i = 0; i < OSCILLATOR_COUNT; i += 1) {
      const lobe = document.createElement('div');
      lobe.className = 'presence-field-lobe';
      lobe.dataset.testid = 'presence-field-lobe';
      lobe.setAttribute('aria-hidden', 'true');
      const ang = (i / OSCILLATOR_COUNT) * Math.PI * 2;
      const x = 50 + Math.cos(ang) * 38;
      const y = 62 + Math.sin(ang) * 28;
      lobe.style.cssText = [
        'position:absolute',
        `left:${x}%`,
        `top:${y}%`,
        'width:18%',
        'height:14%',
        'border-radius:50%',
        'pointer-events:none',
        'transform:translate(-50%,-50%)',
        'background:radial-gradient(ellipse,rgba(240,192,96,.55) 0%,rgba(224,185,121,0) 70%)',
        'opacity:0'
      ].join(';');
      rim.appendChild(lobe);
      this._lobes.push(lobe);
    }
    this._injectStyles();
  }

  _paintLobes(gain) {
    const n = this._lobes.length || 1;
    for (let i = 0; i < this._lobes.length; i += 1) {
      const phase = this._thetas[i] || 0;
      const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase));
      const scatter = 1 - this._r;
      const opacity = Math.max(0, Math.min(0.72, gain * (0.18 + pulse * 0.35 + scatter * 0.12)));
      this._lobes[i].style.opacity = String(opacity);
    }
    void n;
  }

  _applyRimMod(gain) {
    const rim = this._rimEl();
    if (!rim) return;
    const cohere = 0.85 + this._r * 0.22 * gain;
    rim.style.filter = `drop-shadow(0 0 ${Math.round(22 + this._r * 16)}px rgba(240,192,96,${(0.18 + this._r * 0.16 * gain).toFixed(3)}))`;
    const current = rim.style.transform || 'translate(-50%, 0) scale(1)';
    if (!current.includes('scale')) {
      rim.style.transform = `translate(-50%, 0) scale(${cohere})`;
    }
  }

  _applyHover() {
    const rim = this._rimEl();
    if (!rim || this._mode === 'off') return;
    rim.title = t('PRESENCE_FIELD_HOVER');
  }

  _teardownVisual() {
    const hadLobes = this._lobes.length > 0;
    for (const lobe of this._lobes) lobe.remove();
    this._lobes = [];
    const rim = this._rimEl(false);
    if (rim && hadLobes) {
      rim.removeAttribute('title');
      rim.style.filter =
        'drop-shadow(0 0 28px rgba(240,192,96,.22))';
    }
    this._mode = this._focusing && this._enabled ? this._mode : 'off';
    if (!this._focusing || !this._enabled) this._mode = 'off';
  }

  _injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `.presence-field-lobe{pointer-events:none;}`;
    document.head.appendChild(style);
  }

  _ensureDebug() {
    if (typeof document === 'undefined' || this._debugRoot) return;
    const root = document.createElement('div');
    root.id = 'presence-field-debug';
    root.dataset.testid = 'presence-field-debug';
    root.style.cssText = `position:fixed;left:8px;bottom:8px;z-index:${Z.PANEL};pointer-events:auto;padding:8px;font:12px/1.3 sans-serif;background:rgba(255,252,246,.92);border-radius:8px;`;
    const kLabel = document.createElement('label');
    kLabel.textContent = 'K ';
    const kInput = document.createElement('input');
    kInput.type = 'range';
    kInput.min = '0';
    kInput.max = '8';
    kInput.step = '0.1';
    kInput.value = '4';
    kInput.dataset.testid = 'presence-field-debug-k';
    kInput.addEventListener('input', () => {
      this._debugK = Number(kInput.value);
    });
    kLabel.append(kInput);
    const nLabel = document.createElement('label');
    nLabel.textContent = ' noise ';
    const nInput = document.createElement('input');
    nInput.type = 'range';
    nInput.min = '0';
    nInput.max = '0.4';
    nInput.step = '0.01';
    nInput.value = '0.06';
    nInput.dataset.testid = 'presence-field-debug-sigma';
    nInput.addEventListener('input', () => {
      this._debugSigma = Number(nInput.value);
    });
    nLabel.append(nInput);
    root.append(kLabel, nLabel);
    document.body.appendChild(root);
    this._debugRoot = root;
  }
}
