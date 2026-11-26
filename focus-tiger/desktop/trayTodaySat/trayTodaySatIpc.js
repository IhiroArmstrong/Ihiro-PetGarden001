/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { DESKTOP_DISPLAY_NAME } from '../trayPolicy.js';
import { getLocalDateKey } from '../../src/utils/localDate.js';
import {
  normalizeTrayTodaySatSnapshot,
  presentTrayTodaySat
} from '../../src/core/trayTodaySatPolicy.js';

/**
 * @param {object} deps
 * @param {{ handle: Function }} deps.ipcMain
 * @param {() => void} [deps.onChange]
 * @param {() => Date} [deps.now]
 * @param {string} [deps.productName]
 */
export function attachTrayTodaySat(deps) {
  let snapshot = normalizeTrayTodaySatSnapshot({
    enabled: true,
    minutes: 0,
    dateKey: ''
  });

  const emit = () => {
    deps.onChange?.();
  };

  deps.ipcMain.handle('desktop:tray-today-sat-set', (_event, payload) => {
    snapshot = normalizeTrayTodaySatSnapshot(payload || {});
    emit();
    return { ok: true, ...snapshot };
  });

  return {
    presentation(locale = '') {
      if (!snapshot.dateKey) {
        return {
          title: '',
          tooltip: deps.productName || DESKTOP_DISPLAY_NAME,
          menuLabel: null
        };
      }
      return presentTrayTodaySat({
        ...snapshot,
        locale,
        productName: deps.productName || DESKTOP_DISPLAY_NAME,
        now: deps.now
      });
    },
    snapshot: () => ({ ...snapshot }),
    todayKey: () => getLocalDateKey(deps.now ? deps.now() : new Date())
  };
}
