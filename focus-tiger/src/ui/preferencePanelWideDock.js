/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { wideSecondaryDockPlacement } from '../core/wideSecondaryDockCss.js';
import { bringGlassCardToFront } from './glassCardDeck.js';

/**
 * @param {HTMLElement} panel
 */
export function syncPreferencePanelDock(panel) {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  panel.dataset.dock = wideSecondaryDockPlacement(width);
}

/**
 * Clear drag-time inline geometry so T42 media rules apply again.
 * @param {HTMLElement} panel
 */
export function resetPreferencePanelDragGeometry(panel) {
  panel.style.removeProperty('left');
  panel.style.removeProperty('top');
  panel.style.removeProperty('right');
  panel.style.removeProperty('bottom');
  panel.style.removeProperty('transform');
  panel.style.removeProperty('margin');
}

/**
 * @param {HTMLElement} panel
 * @param {string} deckHandleId key in GLASS_CARD_ELEMENT_IDS
 */
export function onPreferencePanelOpen(panel, deckHandleId) {
  resetPreferencePanelDragGeometry(panel);
  syncPreferencePanelDock(panel);
  bringGlassCardToFront(deckHandleId, panel.ownerDocument || document);
}

/**
 * @param {HTMLElement} panel
 * @param {() => void} syncDock
 * @returns {() => void} call on dispose
 */
export function installPreferencePanelDockListener(panel, syncDock) {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
    return () => {};
  }
  const onResize = () => {
    if (panel.hidden) return;
    resetPreferencePanelDragGeometry(panel);
    syncDock();
  };
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}