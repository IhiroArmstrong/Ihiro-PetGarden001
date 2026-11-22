/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { hasYinPersonalMemoryBridge } from '../core/yinPersonalMemoryBridge.js';
import { t } from '../locales/i18n.js';
import { MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE } from './MindfulAcknowledgeToast.js';
import { Z } from './zIndexLayers.js';

/**
 * Memory is not in GLASS_CARD_ELEMENT_IDS (factory gate). Bring it in front
 * of Thought Drop with the same 18/19 pair other glass cards use.
 * @param {Document} [doc]
 */
export function elevateYinMemoryOverThoughtDrop(doc = document) {
  if (!doc?.getElementById) return;
  const confide = doc.getElementById('confide-to-yin-card');
  const memory = doc.getElementById('yin-personal-memory');
  if (confide?.style) confide.style.zIndex = String(Z.GLASS_CARD);
  if (memory?.style) memory.style.zIndex = String(Z.GLASS_CARD_FRONT);
}

/**
 * @param {object} [opts]
 * @param {() => boolean} [opts.hasBridge]
 * @param {() => void} [opts.closeOthers]
 * @param {{ open?: () => void }} [opts.memoryUi]
 * @param {Document} [opts.document]
 * @param {{ show?: (message: string, options?: object) => unknown }} [opts.toast]
 * @param {string} [opts.unavailableCopy]
 * @returns {{ opened: boolean, reason?: string }}
 */
export function openThoughtDropMemoryPanel(opts = {}) {
  const hasBridge = opts.hasBridge || hasYinPersonalMemoryBridge;
  if (!hasBridge()) {
    const msg =
      opts.unavailableCopy || t('YIN_MEMORY_PANEL_UNAVAILABLE');
    opts.toast?.show?.(msg, {
      placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE
    });
    return { opened: false, reason: 'no-bridge' };
  }
  opts.closeOthers?.();
  opts.memoryUi?.open?.();
  elevateYinMemoryOverThoughtDrop(
    opts.document || (typeof document !== 'undefined' ? document : undefined)
  );
  return { opened: true };
}
