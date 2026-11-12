/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { HealthShortcutLogPreferenceUI } from '../ui/HealthShortcutLogPreferenceUI.js';

/**
 * @param {HTMLElement} mountRoot
 * @returns {HealthShortcutLogPreferenceUI}
 */
export function mountHealthShortcutLogPreference(mountRoot) {
  const storage =
    typeof localStorage !== 'undefined' ? localStorage : null;
  const ui = new HealthShortcutLogPreferenceUI(mountRoot, {
    storage,
    onClose: () => {
      document.body.classList.remove('ft-wide-stage-health-shortcut-log');
      document.body.classList.remove('ft-narrow-stage-health-shortcut-log');
    }
  });
  window.__healthShortcutLogPreference = ui;
  return ui;
}

/**
 * @param {{ setHandlers: (patch: object) => void }} idleChrome
 * @param {HealthShortcutLogPreferenceUI | null | undefined} ui
 */
export function wireHealthShortcutLogIdleHandler(idleChrome, ui) {
  idleChrome.setHandlers({
    onHealthShortcutLog: () => {
      ui?.openPanel();
    }
  });
}
