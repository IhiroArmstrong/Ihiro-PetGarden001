/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pure breath rhythm state machine — no DOM dependencies.
 *
 * @typedef {'inhale' | 'hold' | 'exhale'} BreathPhase
 */

/**
 * @typedef {object} BreathPresetConfig
 * @property {number} inhale
 * @property {number} hold
 * @property {number} exhale
 */

/**
 * @typedef {object} BreathTickPayload
 * @property {BreathPhase} phase
 * @property {number} remainingSeconds
 * @property {number} cycleIndex
 */

/**
 * @typedef {object} BreathEngineDeps
 * @property {(fn: () => void, ms: number) => unknown} [setTimer]
 * @property {(id: unknown) => void} [clearTimer]
 */

export class BreathEngine {
  /**
   * @param {BreathEngineDeps} [deps]
   */
  constructor(deps = {}) {
    this._setTimer = deps.setTimer ?? ((fn, ms) => setInterval(fn, ms));
    this._clearTimer = deps.clearTimer ?? ((id) => clearInterval(id));
    /** @type {Map<string, Set<(detail: unknown) => void>>} */
    this._listeners = new Map();
    /** @type {unknown} */
    this._timerId = null;
    this._running = false;
    this._paused = false;
    this._tickMs = 1000;
    this._resetInternal();
  }

  /**
   * @param {string} event
   * @param {(detail: unknown) => void} handler
   * @returns {() => void}
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)?.add(handler);
    return () => this.off(event, handler);
  }

  /**
   * @param {string} event
   * @param {(detail: unknown) => void} handler
   */
  off(event, handler) {
    this._listeners.get(event)?.delete(handler);
  }

  /**
   * @param {string} event
   * @param {unknown} [detail]
   */
  _emit(event, detail) {
    for (const fn of this._listeners.get(event) ?? []) {
      fn(detail);
    }
  }

  _resetInternal() {
    /** @type {BreathPresetConfig | null} */
    this._preset = null;
    this._totalCycles = 0;
    this._phaseIndex = 0;
    /** @type {Array<{ phase: BreathPhase, seconds: number }>} */
    this._phases = [];
    this._remainingInPhase = 0;
    this._cycleIndex = 0;
  }

  /**
   * @param {BreathPresetConfig} preset
   * @returns {Array<{ phase: BreathPhase, seconds: number }>}
   */
  _buildPhaseSequence(preset) {
    /** @type {Array<{ phase: BreathPhase, seconds: number }>} */
    const phases = [];
    const inhale = Math.max(0, Math.floor(Number(preset.inhale) || 0));
    const hold = Math.max(0, Math.floor(Number(preset.hold) || 0));
    const exhale = Math.max(0, Math.floor(Number(preset.exhale) || 0));
    if (inhale > 0) phases.push({ phase: 'inhale', seconds: inhale });
    if (hold > 0) phases.push({ phase: 'hold', seconds: hold });
    if (exhale > 0) phases.push({ phase: 'exhale', seconds: exhale });
    return phases;
  }

  /**
   * @returns {BreathPhase}
   */
  _currentPhase() {
    return this._phases[this._phaseIndex]?.phase ?? 'inhale';
  }

  /**
   * @returns {BreathTickPayload}
   */
  _currentPayload() {
    return {
      phase: this._currentPhase(),
      remainingSeconds: this._remainingInPhase,
      cycleIndex: this._cycleIndex
    };
  }

  _emitPhaseChange() {
    const payload = this._currentPayload();
    this._emit('tick', payload);
    this._emit('phase-change', payload);
  }

  /**
   * @param {BreathPresetConfig} preset
   * @param {number} totalCycles
   * @param {{ tickMs?: number }} [options]
   */
  start(preset, totalCycles, options = {}) {
    this.stop();
    this._preset = preset;
    this._totalCycles = Math.max(1, Math.floor(Number(totalCycles) || 1));
    this._tickMs = Math.max(1, Math.floor(Number(options.tickMs) || 1000));
    this._phases = this._buildPhaseSequence(preset);
    if (this._phases.length === 0) return;

    this._cycleIndex = 0;
    this._phaseIndex = 0;
    this._remainingInPhase = this._phases[0].seconds;
    this._running = true;
    this._paused = false;
    this._emitPhaseChange();
    this._timerId = this._setTimer(() => this._onInterval(), this._tickMs);
  }

  _onInterval() {
    if (!this._running || this._paused) return;

    this._remainingInPhase -= 1;
    if (this._remainingInPhase <= 0) {
      this._advancePhase();
      return;
    }

    this._emit('tick', this._currentPayload());
  }

  _advancePhase() {
    this._phaseIndex += 1;
    if (this._phaseIndex >= this._phases.length) {
      this._cycleIndex += 1;
      if (this._cycleIndex >= this._totalCycles) {
        this._finish();
        return;
      }
      this._phaseIndex = 0;
    }
    this._remainingInPhase = this._phases[this._phaseIndex].seconds;
    this._emitPhaseChange();
  }

  _finish() {
    const cyclesCompleted = this._totalCycles;
    const preset = this._preset;
    this.stop();
    this._emit('complete', { cyclesCompleted, preset });
  }

  pause() {
    if (!this._running || this._paused) return;
    this._paused = true;
  }

  resume() {
    if (!this._running || !this._paused) return;
    this._paused = false;
  }

  stop() {
    if (this._timerId != null) {
      this._clearTimer(this._timerId);
      this._timerId = null;
    }
    this._running = false;
    this._paused = false;
  }

  /**
   * Synchronous single-step advance (unit tests).
   */
  advanceTick() {
    this._onInterval();
  }

  /**
   * @returns {{
   *   running: boolean,
   *   paused: boolean,
   *   phase: BreathPhase,
   *   remainingSeconds: number,
   *   cycleIndex: number
   * }}
   */
  getState() {
    return {
      running: this._running,
      paused: this._paused,
      phase: this._currentPhase(),
      remainingSeconds: this._remainingInPhase,
      cycleIndex: this._cycleIndex
    };
  }
}
