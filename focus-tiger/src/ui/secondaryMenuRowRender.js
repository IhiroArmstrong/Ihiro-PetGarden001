/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { enrichSecondaryMenuRowPresentation } from '../core/secondaryMenuRowPresentation.js';
import { readPreferenceCenterStatus } from '../core/preferencesCenterStatus.js';
import { readPracticeBackupOptIn } from '../core/practiceBackup/practiceBackupOptIn.js';
import { fillPreferencesCenterRow } from './preferencesCenterRow.js';

/**
 * @param {Storage | null | undefined} storage
 * @returns {string}
 */
export function signedInPracticeEmailFromStorage(storage) {
  const opt = readPracticeBackupOptIn(storage);
  if (opt.enabled && opt.deviceToken && opt.email) return opt.email;
  return '';
}

export function paintSecondaryChromeMenuRow(btn, item, ctx) {
  item = enrichSecondaryMenuRowPresentation(item);
  const { t, storage, alwaysOnTopOn } = ctx;
  const label =
    typeof item.labelText === 'string' && item.labelText
      ? item.labelText
      : t(item.labelKey);
  if (item.emphasis === 'beige-cta') {
    btn.textContent = label;
    return;
  }
  if (item.prefKind || item.prefHintKey || item.prefIcon) {
    fillPreferencesCenterRow(btn, {
      label,
      hint: item.prefHintKey ? t(item.prefHintKey) : '',
      status: item.proxy
        ? readPreferenceCenterStatus(item.proxy, { t, storage })
        : '',
      icon: item.prefIcon || '•',
      prefKind: item.prefKind || 'page',
      toggleOn: item.proxy === 'always-on-top' && alwaysOnTopOn === true
    });
    return;
  }
  btn.textContent = label;
}
