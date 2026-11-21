/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Click-result contract for controls that are not Idle menu proxies.
 * Menu rows stay in `menuReachabilityContract.js`. New in-card links must
 * name the surface that is visible 0–1s after the click.
 */

/**
 * @typedef {object} InSurfaceClickContract
 * @property {string} id
 * @property {string} clickSelector
 * @property {string} resultSelector
 */

/** @type {readonly InSurfaceClickContract[]} */
export const IN_SURFACE_CLICK_RESULTS = Object.freeze([
  Object.freeze({
    id: 'thought-drop-what-yin-remembers',
    clickSelector: '[data-testid="confide-to-yin-memory-list-link"]',
    resultSelector: '#yin-personal-memory'
  })
]);
