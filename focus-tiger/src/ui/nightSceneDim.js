/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  LATE_NIGHT_END_HOUR,
  LATE_NIGHT_HOUR,
  isLateNightHour
} from '../core/lateNightHour.js';

/** T48 · scene-only dim; not a dark theme. */
export const NIGHT_SCENE_BRIGHTNESS = 0.9;

export const NIGHT_DIM_DATA_ATTR = 'data-ft-night-dim';

/**
 * @param {Date} [now]
 * @param {string} [search]
 * @returns {boolean}
 */
export function resolveNightSceneDimActive(now = new Date(), search = '') {
  const params = new URLSearchParams(search);
  if (params.get('nightDim') === '0') return false;
  if (params.get('nightDim') === '1') return true;
  return isLateNightHour(now);
}

/**
 * Milliseconds until the next 23:00 or 06:00 local boundary (whichever comes first).
 * @param {Date} [date]
 * @returns {number}
 */
export function msUntilLateNightBoundary(date = new Date()) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 60_000;
  const hour = date.getHours();
  const next = new Date(date);
  next.setSeconds(0, 0);

  if (hour >= LATE_NIGHT_HOUR) {
    next.setDate(next.getDate() + 1);
    next.setHours(LATE_NIGHT_END_HOUR, 0, 0, 0);
    return Math.max(50, next.getTime() - date.getTime());
  }
  if (hour < LATE_NIGHT_END_HOUR) {
    next.setHours(LATE_NIGHT_END_HOUR, 0, 0, 0);
    return Math.max(50, next.getTime() - date.getTime());
  }
  next.setHours(LATE_NIGHT_HOUR, 0, 0, 0);
  return Math.max(50, next.getTime() - date.getTime());
}

/**
 * @param {object} [opts]
 * @param {HTMLElement} [opts.documentElement]
 * @param {Date} [opts.now]
 * @param {string} [opts.search]
 */
export function syncNightSceneDim({
  documentElement = document.documentElement,
  now = new Date(),
  search = typeof location !== 'undefined' ? location.search : ''
} = {}) {
  if (!documentElement) return;
  const active = resolveNightSceneDimActive(now, search);
  if (active) {
    documentElement.setAttribute(NIGHT_DIM_DATA_ATTR, '1');
  } else {
    documentElement.removeAttribute(NIGHT_DIM_DATA_ATTR);
  }
}

/**
 * @param {object} [opts]
 * @param {() => Date} [opts.getNow]
 * @param {string} [opts.search]
 * @param {(fn: () => void, ms: number) => number} [opts.schedule]
 * @param {(id: number) => void} [opts.clear]
 * @param {HTMLElement} [opts.documentElement]
 * @returns {() => void}
 */
export function startNightSceneDimClock({
  getNow = () => new Date(),
  search = typeof location !== 'undefined' ? location.search : '',
  schedule = (fn, ms) => window.setTimeout(fn, ms),
  clear = (id) => window.clearTimeout(id),
  documentElement = document.documentElement
} = {}) {
  let timerId = null;

  const tick = () => {
    syncNightSceneDim({ documentElement, now: getNow(), search });
    if (timerId != null) clear(timerId);
    timerId = schedule(tick, msUntilLateNightBoundary(getNow()) + 50);
  };

  tick();

  return () => {
    if (timerId != null) clear(timerId);
    timerId = null;
  };
}
