/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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
 * @returns {{ show: string, quit: string, alwaysOnTop: string, floatingMarker: string, hideInFullScreen: string }}
 */
export function trayMenuLabels(locale = '') {
  const tag = String(locale || '').toLowerCase();
  if (tag.startsWith('ja')) {
    return {
      show: '表示',
      quit: '終了',
      alwaysOnTop: '常に手前に表示',
      floatingMarker: 'フローティング同伴を表示',
      hideInFullScreen: 'フルスクリーンでは隠す'
    };
  }
  if (tag.startsWith('zh')) {
    return {
      show: '显示',
      quit: '退出',
      alwaysOnTop: '始终在最前',
      floatingMarker: '显示悬浮陪伴',
      hideInFullScreen: '全屏时隐藏'
    };
  }
  return {
    show: 'Show',
    quit: 'Quit',
    alwaysOnTop: 'Keep in front',
    floatingMarker: 'Show floating companion',
    hideInFullScreen: 'Hide while fullscreen'
  };
}
