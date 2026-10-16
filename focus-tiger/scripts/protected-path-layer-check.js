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
import { Z } from '../src/ui/zIndexLayers.js';

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

  if (Z.SUPPORT_DIM !== 25) errors.push(`Z.SUPPORT_DIM must stay 25; found ${Z.SUPPORT_DIM}`);
  if (Z.SUPPORT_MODAL !== 26) errors.push(`Z.SUPPORT_MODAL must stay 26; found ${Z.SUPPORT_MODAL}`);
  if (Z.SANCTUARY_CARD !== 27) errors.push(`Z.SANCTUARY_CARD must stay 27; found ${Z.SANCTUARY_CARD}`);
  if (!(Z.GLASS_CARD_FRONT < Z.SUPPORT_DIM && Z.SUPPORT_DIM < Z.SUPPORT_MODAL && Z.SUPPORT_MODAL < Z.SANCTUARY_CARD)) {
    errors.push('protected stack order broken in Z');
  }

  if (!support.includes('Z.SUPPORT_DIM')) errors.push('Support backdrop must use Z.SUPPORT_DIM');
  if (!support.includes('Z.SUPPORT_MODAL')) errors.push('Support modal must use Z.SUPPORT_MODAL');
  if (!sanctuary.includes('Z.SANCTUARY_CARD')) errors.push('Sanctuary card must use Z.SANCTUARY_CARD');

  if (!/GLASS_CARD_KEEP_STYLESHEET_Z[\s\S]*yin-support-modal/.test(deck)) {
    errors.push('glassCardDeck must keep stylesheet z for yin-support-modal');
  }
  if (!/if \(GLASS_CARD_KEEP_STYLESHEET_Z\.has\(elementId\)\) return null/.test(deck)) {
    errors.push('glassCardInlineZIndex must return null for kept ids');
  }
  if (!/GLASS_CARD_KEEP_STYLESHEET_Z\.has\(card\.id\)\) return/.test(deck)) {
    errors.push('Support modal must not enter glass-card drag');
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
