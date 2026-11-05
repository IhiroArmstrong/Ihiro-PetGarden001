/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T87 residual scan: legacy public product name in user-facing runtime copy.
 * Scope grows per `task-samatia-user-facing-rename.md`.
 * A2 = locale/KB/pools. B adds Electron display name / tray / About / permission copy.
 * C adds marketing HTML, store-listing drafts, and DNS cutover notes.
 * D adds Checkout-related hardcoded customer-visible strings in cloud routes.
 * Full release gate waits until A1–A2 + B + C + D merge; scanSamatiaD is that gate surface.
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

/** Extra paths scanned at T87-B (Electron user-visible config). */
export const SAMATIA_B_SCAN_REL_PATHS = Object.freeze([
  'desktop/package.json',
  'desktop/main.js',
  'desktop/trayPolicy.js',
  'desktop/native/macos-speech-helper-Info.plist',
  'desktop/native/macos-input-rhythm-helper-Info.plist'
]);

/** Extra paths scanned at T87-C (repo-root relative, not under focus-tiger/). */
export const SAMATIA_C_SCAN_REL_FROM_REPO = Object.freeze([
  'marketing-site/index.html',
  'marketing-site/ja.html',
  'marketing-site/privacy.html',
  'marketing-site/wellness.html',
  'marketing-site/404.html',
  'marketing-site/store-listing-en.txt',
  'marketing-site/store-listing-ja.txt'
]);

/** Extra paths scanned at T87-D (Stripe Checkout hardcoded customer-visible copy). */
export const SAMATIA_D_SCAN_REL_PATHS = Object.freeze([
  'cloud/src/routes/confirmProSession.ts'
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
  return scanSamatiaUserFacingResiduals(focusTigerRoot, SAMATIA_A2_SCAN_REL_PATHS);
}

/**
 * T87-B = A2 surface + Electron display name / tray / About / permission strings.
 * @param {string} focusTigerRoot
 * @returns {SamatiaResidualHit[]}
 */
export function scanSamatiaBUserFacingResiduals(focusTigerRoot) {
  return scanSamatiaUserFacingResiduals(focusTigerRoot, [
    ...SAMATIA_A2_SCAN_REL_PATHS,
    ...SAMATIA_B_SCAN_REL_PATHS
  ]);
}

/**
 * T87-C = B surface + marketing HTML / store-listing drafts.
 * @param {string} focusTigerRoot
 * @returns {SamatiaResidualHit[]}
 */
export function scanSamatiaCUserFacingResiduals(focusTigerRoot) {
  const repoRoot = path.join(focusTigerRoot, '..');
  return [
    ...scanSamatiaBUserFacingResiduals(focusTigerRoot),
    ...scanSamatiaUserFacingResiduals(repoRoot, SAMATIA_C_SCAN_REL_FROM_REPO)
  ];
}

/**
 * T87-D = C surface + Checkout hardcoded customer-visible strings.
 * @param {string} focusTigerRoot
 * @returns {SamatiaResidualHit[]}
 */
export function scanSamatiaDUserFacingResiduals(focusTigerRoot) {
  return [
    ...scanSamatiaCUserFacingResiduals(focusTigerRoot),
    ...scanSamatiaUserFacingResiduals(focusTigerRoot, SAMATIA_D_SCAN_REL_PATHS)
  ];
}

/**
 * @param {string} focusTigerRoot absolute path to focus-tiger/
 * @param {readonly string[]} relPaths
 * @returns {SamatiaResidualHit[]}
 */
export function scanSamatiaUserFacingResiduals(focusTigerRoot, relPaths) {
  /** @type {SamatiaResidualHit[]} */
  const hits = [];
  for (const rel of relPaths) {
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
