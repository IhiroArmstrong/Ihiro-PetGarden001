/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：全局状态机唯一状态源。
// 非法转移：不阻断（仍写入），但 console.warn，便于发现「本来就在做非法转移」的调用方。

export const STATES = Object.freeze({
  IDLE: 'IDLE',
  FOCUSING: 'FOCUSING',
  CELEBRATE: 'CELEBRATE',
  DORMANT: 'DORMANT'
});

/**
 * 产品语义下允许的下一状态（同源同态由 setState 早退，不进本表）。
 *
 * @type {Readonly<Record<string, ReadonlyArray<string>>>}
 */
export const LEGAL_STATE_TRANSITIONS = Object.freeze({
  [STATES.IDLE]: Object.freeze([STATES.FOCUSING, STATES.DORMANT]),
  [STATES.FOCUSING]: Object.freeze([STATES.IDLE, STATES.CELEBRATE]),
  [STATES.CELEBRATE]: Object.freeze([STATES.IDLE]),
  [STATES.DORMANT]: Object.freeze([STATES.IDLE])
});

/**
 * @param {string} from
 * @param {string} to
 * @returns {boolean}
 */
export function isLegalStateTransition(from, to) {
  if (from === to) return true;
  const allowed = LEGAL_STATE_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export class StateManager {
  constructor() {
    this.state = STATES.IDLE;
    this._listeners = [];
  }

  /**
   * @param {string} nextState
   */
  setState(nextState) {
    if (nextState === this.state) return;

    const from = this.state;
    if (!isLegalStateTransition(from, nextState)) {
      const allowed = LEGAL_STATE_TRANSITIONS[from];
      const allowedLabel =
        allowed && allowed.length > 0 ? allowed.join(', ') : '(none)';
      console.warn(
        `[StateManager] illegal transition: ${from} → ${nextState} (allowed: ${allowedLabel})`
      );
    }

    this.state = nextState;
    this._listeners.forEach((cb) => cb(nextState));
  }

  onChange(callback) {
    this._listeners.push(callback);
  }
}
