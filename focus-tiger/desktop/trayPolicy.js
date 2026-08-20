/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Step B tray policy (no Electron import — unit-testable).
 */

export const HIDE_REASON_TRAY = 'tray';
export const HIDE_REASON_NONE = 'none';

/**
 * Red-close hides to tray unless the user chose Quit.
 *
 * @param {{ isQuitting?: boolean }} [state]
 * @returns {boolean}
 */
export function shouldQuitOnWindowClose(state = {}) {
  return Boolean(state.isQuitting);
}

/**
 * @param {unknown} reason
 * @returns {boolean}
 */
export function isTrayHideReason(reason) {
  return reason === HIDE_REASON_TRAY;
}

/**
 * Native tray labels. Web i18n is not available in the main process.
 *
 * @param {string} [locale]
 * @returns {{ show: string, quit: string }}
 */
export function trayMenuLabels(locale = '') {
  const tag = String(locale || '').toLowerCase();
  if (tag.startsWith('ja')) {
    return { show: '表示', quit: '終了' };
  }
  if (tag.startsWith('zh')) {
    return { show: '显示', quit: '退出' };
  }
  return { show: 'Show', quit: 'Quit' };
}
