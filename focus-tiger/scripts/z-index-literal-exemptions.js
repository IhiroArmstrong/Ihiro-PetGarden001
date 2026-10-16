/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A12 grandfather: remaining raw z-index digits in product files.
 * Caps only shrink. New files or extra hits fail check:z-index-literals.
 */

export const Z_INDEX_LITERAL_EXEMPTIONS = Object.freeze([
  {
    file: 'index.html',
    maxHits: 6,
    reason: 'Static shell CSS cannot import JS constants; CSS variables are a later slice.'
  }
]);
