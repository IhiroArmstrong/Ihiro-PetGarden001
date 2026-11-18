/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getReminderPreference } from './reminderPreference.js';
import { getWorkEndPreference } from './workEndPreference.js';
import { readLocalePreference } from '../locales/localePreference.js';
import { LOCALE_CATALOG } from '../locales/localeRegistry.js';

/**
 * @param {number} hour
 * @param {number} minute
 * @returns {string}
 */
function formatHm(hour, minute) {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Compact trailing status for a Preferences Center row.
 * Returns a ready-to-show string, or empty when the row has no snapshot.
 *
 * @param {string} proxy
 * @param {{ t: (key: string) => string, storage?: Storage | null }} ctx
 * @returns {string}
 */
export function readPreferenceCenterStatus(proxy, ctx) {
  const t = typeof ctx?.t === 'function' ? ctx.t : () => '';
  const storage = ctx?.storage ?? null;
  switch (proxy) {
    case 'reminder': {
      const pref = getReminderPreference({ storage });
      if (!pref) return t('PREF_CENTER_STATUS_OFF');
      return formatHm(pref.hour, pref.minute);
    }
    case 'work-end': {
      const pref = getWorkEndPreference({ storage });
      if (!pref) return t('PREF_CENTER_STATUS_OFF');
      return formatHm(pref.hour, pref.minute);
    }
    case 'language': {
      const id = readLocalePreference(storage);
      return LOCALE_CATALOG[id]?.nativeLabel || id;
    }
    default:
      return '';
  }
}
