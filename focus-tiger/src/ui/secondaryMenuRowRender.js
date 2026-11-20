/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { enrichSecondaryMenuRowPresentation } from '../core/secondaryMenuRowPresentation.js';
import { readPreferenceCenterStatus } from '../core/preferencesCenterStatus.js';
import { fillPreferencesCenterRow } from './preferencesCenterRow.js';

export function paintSecondaryChromeMenuRow(btn, item, ctx) {
  item = enrichSecondaryMenuRowPresentation(item);
  const { t, storage, alwaysOnTopOn } = ctx;
  if (item.emphasis === 'beige-cta') {
    btn.textContent = t(item.labelKey);
    return;
  }
  if (item.prefKind || item.prefHintKey || item.prefIcon) {
    fillPreferencesCenterRow(btn, {
      label: t(item.labelKey),
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
  btn.textContent = t(item.labelKey);
}
