/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T87-A2 residual scan: legacy public product name in user-facing runtime copy.
 * Scope grows per `task-samatia-user-facing-rename.md` (A1 surface + A2 pools/prompts).
 * Full release gate waits until B/C/D merge; this module gates A2 paths only.
 */

import fs from 'node:fs';
import path from 'node:path';

/** @typedef {{ file: string, line: number, snippet: string }} SamatiaResidualHit */

export const SAMATIA_LEGACY_PUBLIC_NAME_RES =
  /Focus Tiger(™)?|FocusTiger|フォーカス・タイガー\s*Pro|フォーカス・タイガー(?![コイン])/;

/** Paths under `focus-tiger/` scanned at T87-A2 (repo-relative). */
export const SAMATIA_A2_SCAN_REL_PATHS = Object.freeze([
  'src/locales/slices/samatia-display-name.json',
  'src/locales/slices/help-center.json',
  'src/locales/slices/yin-voice-operating-access.json',
  'src/core/copyrightNotice.js',
  'src/core/confide/productKnowledgeCatalog.json',
  'src/core/voiceProductLexicon.js',
  'src/core/mindfulnessScroll.js',
  'src/core/journeyDailyCard.js',
  'src/core/dailyZenQuote.js',
  'src/core/saveMustardSeedSealImage.js',
  'cloud/src/lib/newsletterCopy.ts',
  'cloud/src/lib/resend.ts',
  'cloud/src/routes/desktopCheckoutReturn.ts'
]);

const COPYRIGHT_HEADER_MARK = 'Focus Tiger™ is a product of Twinsology';

/**
 * @param {string} line
 * @returns {boolean}
 */
export function isSamatiaScanLineWhitelisted(line) {
  const trimmed = line.trim();
  if (trimmed.includes(COPYRIGHT_HEADER_MARK)) return true;
  if (/focus-tiger-pro|focus-tiger\.|clearAllFocusTiger|FOCUS_TIGER_/i.test(line)) {
    return true;
  }
  if (/Focus practice|focus practice|focus sit|focus level|focus coins/i.test(line)) {
    return true;
  }
  if (/到着 → フォーカス|→ フォーカス|フォーカスコイン/.test(line)) return true;
  return false;
}

/**
 * @param {string} focusTigerRoot absolute path to focus-tiger/
 * @returns {SamatiaResidualHit[]}
 */
export function scanSamatiaA2UserFacingResiduals(focusTigerRoot) {
  /** @type {SamatiaResidualHit[]} */
  const hits = [];
  for (const rel of SAMATIA_A2_SCAN_REL_PATHS) {
    const abs = path.join(focusTigerRoot, rel);
    if (!fs.existsSync(abs)) {
      hits.push({ file: rel, line: 0, snippet: '[missing file]' });
      continue;
    }
    const lines = fs.readFileSync(abs, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (!SAMATIA_LEGACY_PUBLIC_NAME_RES.test(line)) return;
      if (isSamatiaScanLineWhitelisted(line)) return;
      hits.push({
        file: rel,
        line: index + 1,
        snippet: line.trim().slice(0, 160)
      });
    });
  }
  return hits;
}
