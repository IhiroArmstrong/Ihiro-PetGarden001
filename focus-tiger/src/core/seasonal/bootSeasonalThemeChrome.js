/**
 * Boot / refresh Seasonal Theme chrome from live entitlement + calendar.
 */

import { resolveActiveSeasonalTheme } from './resolveActiveSeasonalTheme.js';
import {
  resolveSeasonalNow,
  sniffRegionFromLanguage
} from './seasonalClock.js';
import { SeasonalThemeChromeUI } from '../../ui/SeasonalThemeChromeUI.js';

/**
 * @param {object} opts
 * @param {HTMLElement} opts.appEl
 * @param {HTMLElement} opts.overlayEl
 * @param {Storage | null} [opts.storage]
 * @param {() => boolean} [opts.isBusy]
 * @param {string} [opts.search]
 * @param {string} [opts.language]
 * @returns {{ sync: () => void, dispose: () => void, getActive: () => object | null }}
 */
export function bootSeasonalThemeChrome({
  appEl,
  overlayEl,
  storage = null,
  isBusy = () => false,
  search = typeof location !== 'undefined' ? location.search : '',
  language = typeof navigator !== 'undefined' ? navigator.language : ''
} = {}) {
  const chrome = new SeasonalThemeChromeUI({ appEl, overlayEl, storage });
  /** @type {ReturnType<typeof resolveActiveSeasonalTheme>} */
  let last = null;

  const sync = () => {
    const now = resolveSeasonalNow(search);
    const region = sniffRegionFromLanguage(language);
    last = resolveActiveSeasonalTheme({
      now,
      region,
      storage,
      search
    });
    chrome.sync(last, { now, busy: isBusy() });
  };

  sync();

  return {
    sync,
    getActive: () => last,
    dispose: () => chrome.dispose()
  };
}
