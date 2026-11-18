/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * H8: preference glass cards stay on the Preferences sheet.
 * Sound / Help Center / Membership / newsletter / today-direction stay
 * as their existing overlays (census + payment paths).
 */

/** @type {Readonly<Record<string, string>>} */
export const PREFERENCE_SHEET_EMBED_SELECTORS = Object.freeze({
  reminder: '#reminder-preference-panel',
  'work-end': '#work-end-preference-panel',
  language: '#language-preference-panel',
  'window-layout': '#window-layout-preference-panel',
  'input-rhythm': '#input-rhythm-preference-panel',
  'mindflow-nebula': '#mindflow-nebula-preference',
  'presence-field': '#presence-field-preference',
  'health-shortcut-log': '#health-shortcut-log-preference-panel',
  'co-practice-contract': '#co-practice-contract-panel',
  'local-backup': '#local-practice-data-panel',
  account: '#email-journey-restore-panel'
});

export const PREFERENCE_SHEET_EMBED_PROXIES = Object.freeze(
  Object.keys(PREFERENCE_SHEET_EMBED_SELECTORS)
);

/** @type {WeakMap<HTMLElement, ParentNode | null>} */
const panelHome = new WeakMap();

/**
 * @param {string | null | undefined} proxy
 * @returns {boolean}
 */
export function shouldEmbedPreferenceInSheet(proxy) {
  return Boolean(proxy && PREFERENCE_SHEET_EMBED_SELECTORS[proxy]);
}

/**
 * @param {string} proxy
 * @returns {HTMLElement | null}
 */
export function queryPreferenceSheetPanel(proxy) {
  const selector = PREFERENCE_SHEET_EMBED_SELECTORS[proxy];
  if (!selector || typeof document === 'undefined') return null;
  return document.querySelector(selector);
}

/**
 * @param {HTMLElement} panel
 * @param {HTMLElement} slot
 * @returns {void}
 */
export function adoptPreferencePanelIntoSheet(panel, slot) {
  if (!panel || !slot) return;
  if (!panelHome.has(panel)) panelHome.set(panel, panel.parentNode);
  panel.dataset.prefSheetEmbed = '1';
  panel.style.removeProperty('z-index');
  slot.appendChild(panel);
}

/**
 * @param {HTMLElement | null | undefined} panel
 * @returns {void}
 */
export function releasePreferencePanelFromSheet(panel) {
  if (!panel || panel.dataset.prefSheetEmbed !== '1') return;
  const home = panelHome.get(panel);
  delete panel.dataset.prefSheetEmbed;
  if (home && home !== panel.parentNode) home.appendChild(panel);
  else if (!home) document.body.appendChild(panel);
}

/**
 * Close the live panel without going through main.js.
 * @param {string} proxy
 * @returns {void}
 */
export function requestClosePreferencePanel(proxy) {
  const panel = queryPreferenceSheetPanel(proxy);
  if (!panel) return;
  panel.dispatchEvent(new Event('ft-pref-embed-close'));
  const closer = panel.querySelector(
    'button[id$="-close"], button[data-testid$="-close"], .co-practice-contract-panel__close'
  );
  if (closer instanceof HTMLElement) closer.click();
}

/**
 * Shared sheet-page chrome CSS (wide ⋯ and narrow drawer).
 * @returns {string}
 */
export function preferenceSheetEmbedCss() {
  return `
    .ft-pref-sheet-back {
      display: none;
      margin: 0;
      padding: 6px 4px;
      border: 0;
      background: transparent;
      color: rgba(74, 58, 40, 0.72);
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
    }
    .ft-pref-sheet-back:hover,
    .ft-pref-sheet-back:focus-visible {
      color: rgba(74, 58, 40, 0.95);
    }
    body.ft-pref-sheet-embed .ft-pref-sheet-back {
      display: block;
    }
    .ft-pref-sheet-page {
      display: none;
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }
    body.ft-pref-sheet-embed .ft-pref-sheet-page {
      display: block;
    }
    body.ft-pref-sheet-embed .ft-wide-more__list,
    body.ft-pref-sheet-embed .ft-narrow-sheet__list {
      display: none !important;
    }
    [data-pref-sheet-embed="1"] {
      position: relative !important;
      inset: auto !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      bottom: auto !important;
      transform: none !important;
      width: 100% !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      z-index: auto !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      opacity: 1 !important;
    }
    [data-pref-sheet-embed="1"] button[id$="-close"],
    [data-pref-sheet-embed="1"] button[data-testid$="-close"],
    [data-pref-sheet-embed="1"] .co-practice-contract-panel__close {
      display: none !important;
    }
  `;
}
