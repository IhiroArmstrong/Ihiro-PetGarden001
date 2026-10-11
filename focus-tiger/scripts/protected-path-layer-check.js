#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Locks the Support / Sanctuary stack so a glass-card z rewrite cannot
 * put Subscribe under the dim. Complements Z_INDEX.md + check:z-index.
 *
 *   node scripts/protected-path-layer-check.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

/**
 * @param {string} rel
 * @returns {string}
 */
function readSrc(rel) {
  return readFileSync(join(PKG_ROOT, rel), 'utf8');
}

/**
 * @returns {boolean}
 */
export function runProtectedPathLayerCheck() {
  const errors = [];
  const support = readSrc('src/ui/SupportYinModalUI.js');
  const deck = readSrc('src/ui/glassCardDeck.js');
  const sanctuary = readSrc('src/ui/SanctuaryUnlockUI.js');

  const backdropZ = support.match(
    /\.yin-support-backdrop\s*\{[\s\S]*?z-index:\s*(\d+)/
  );
  const modalZ = support.match(
    /\.yin-support-modal\s*\{[\s\S]*?z-index:\s*(\d+)/
  );
  const sanctuaryZ = sanctuary.match(
    /#yin-sanctuary-card[\s\S]*?z-index:\s*(\d+)/
  ) || sanctuary.match(/z-index:\s*(27)/);

  if (!backdropZ) errors.push('Support backdrop z-index not found');
  if (!modalZ) errors.push('Support modal z-index not found');
  const dim = backdropZ ? Number(backdropZ[1]) : NaN;
  const card = modalZ ? Number(modalZ[1]) : NaN;
  if (Number.isFinite(dim) && Number.isFinite(card) && !(card > dim)) {
    errors.push(`Support modal z ${card} must be above dim ${dim}`);
  }
  if (Number.isFinite(card) && card !== 26) {
    errors.push(`Support modal z must stay 26 (Z_INDEX.md); found ${card}`);
  }
  if (Number.isFinite(dim) && dim !== 25) {
    errors.push(`Support dim z must stay 25 (Z_INDEX.md); found ${dim}`);
  }

  if (!/GLASS_CARD_KEEP_STYLESHEET_Z[\s\S]*yin-support-modal/.test(deck)) {
    errors.push('glassCardDeck must keep stylesheet z for yin-support-modal');
  }
  if (!/if \(GLASS_CARD_KEEP_STYLESHEET_Z\.has\(elementId\)\) return null/.test(deck)) {
    errors.push('glassCardInlineZIndex must return null for kept ids');
  }
  if (!/GLASS_CARD_KEEP_STYLESHEET_Z\.has\(card\.id\)\) return/.test(deck)) {
    errors.push('Support modal must not enter glass-card drag');
  }

  if (sanctuaryZ) {
    const sz = Number(sanctuaryZ[1]);
    if (Number.isFinite(card) && Number.isFinite(sz) && !(sz > card)) {
      errors.push(`Sanctuary card z ${sz} must be above Support modal ${card}`);
    }
  }

  if (errors.length) {
    console.error('[protected-path-layer] FAILED');
    for (const err of errors) console.error(`  - ${err}`);
    return false;
  }
  console.log('[protected-path-layer] OK — Support dim 25 < modal 26; deck does not inline-z it');
  return true;
}

if (process.argv[1] && process.argv[1].includes('protected-path-layer-check')) {
  process.exit(runProtectedPathLayerCheck() ? 0 : 1);
}
