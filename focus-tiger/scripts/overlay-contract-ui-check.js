#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Assert overlay UI occupancy map + O-04 surface checklist
 * (`mutationFeedback.{pending,success,fail}`).
 *
 *   node scripts/overlay-contract-ui-check.js
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OVERLAY_SOURCE_CONTRACTS,
  OVERLAY_UI_FILE_SOURCES,
  OVERLAY_UI_POINTER_HIT_TEST_REQUIRED
} from '../src/core/overlaySlotContractRegistry.js';
import {
  OVERLAY_UI_MUTATION_FEEDBACK_KEYS,
  OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL,
  OVERLAY_UI_SURFACE
} from '../src/core/overlayUiSurfaceContract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const UI_DIR = join(PKG_ROOT, 'src/ui');

const STATUS_FN = /(?:isOpen|isVisible|isPrivacySheetOpen|isPurposeCardOpen|isWellnessFirstCardOpen)\s*\(\s*\)\s*\{|phase\s*!==\s*'hidden'/;
const POINTER_HIT_TEST = /pointer-events\s*:\s*auto/;
const Z_INDEX = /z-index\s*:\s*(\d+)/gi;

/** Chrome / hits / nested controls — not independent occupancy overlays. */
const WHITELIST_FILES = new Set([
  'ActiveRecoverAnchorUI.js',
  'IdleYinTapAnchorUI.js',
  'WeeklyPracticeHeatmap.js',
  'AmbientSoundscapeUI.js',
  'ConfideEarChromeUI.js',
  'ImmersivePresenceUI.js',
  'IdleCompanionPipUI.js',
  'LocalPracticeDataUI.js',
  'LocalPracticeDataPanelUI.js',
  'QuietTogetherPanelUI.js',
  'FocusCirclePanelUI.js',
  'FocusCirclePresenceChrome.js',
  'FocusCircleWitnessChrome.js',
  'SeasonalThemeChromeUI.js',
  'SoftUpdatePromptUI.js',
  'NarrowIdleShell.js',
  'WideIdleMoreMenu.js',
  'ReminderPreferenceUI.js',
  'ft-onboarding-hint-bubble.js',
  'HonestyBridgeCtaUI.js',
  'YinPersonalMemoryUI.js',
  'SanctuaryEnsoMarkChrome.js',
  'TipKindnessBadgesChrome.js',
  'LotusPondChrome.js',
  'MindfulAcknowledgeToast.js',
  'RewardToast.js',
  'FocusHUD.js',
  'focusHudHalo.js',
  'focusHudLive.js',
  'LotusPondRuntime.js',
  'Screenshot.js',
  'glassPanelStyles.js',
  'idleSecondaryPanels.js',
  'outsideDismissGuard.js',
  'helpOverlayOutsideDismiss.js',
  'onboardingHintAnchors.js',
  'hintDiscoveryDots.js',
  'privacyNoticeCopy.js',
  'IdleChromeFacade.js',
  'IdleCompanionPipUI.js'
]);

/**
 * @param {string} src
 * @returns {number}
 */
function maxDeclaredZIndex(src) {
  let max = 0;
  for (const match of src.matchAll(Z_INDEX)) {
    max = Math.max(max, Number(match[1]));
  }
  return max;
}

/**
 * @param {object} claim
 * @param {string} label
 * @param {string} fileSrc
 * @param {(rel: string) => string} readRel
 * @returns {string[]}
 */
function scanClaim(claim, label, fileSrc, readRel) {
  /** @type {string[]} */
  const errors = [];
  if (!claim || typeof claim.mode !== 'string') {
    errors.push(`${label}: missing mode`);
    return errors;
  }
  if (claim.mode === 'gap') {
    if (claim.grandfather !== true) {
      errors.push(
        `${label}: mode gap is only allowed with grandfather:true (legacy rows)`
      );
    }
    return errors;
  }
  if (claim.mode === 'na') {
    if (!claim.reason) errors.push(`${label}: na requires reason`);
    return errors;
  }
  if (claim.mode === 'derive') {
    return errors;
  }
  if (claim.mode === 'token') {
    const tokens = claim.tokens || [];
    if (tokens.length === 0) errors.push(`${label}: token list empty`);
    const haystacks = [fileSrc];
    for (const rel of claim.files || []) {
      try {
        haystacks.push(readRel(rel));
      } catch {
        errors.push(`${label}: missing file ${rel}`);
      }
    }
    for (const token of tokens) {
      if (!haystacks.some((text) => text.includes(token))) {
        errors.push(`${label}: missing token ${token}`);
      }
    }
    return errors;
  }
  if (claim.mode === 'spec') {
    if (!claim.path) {
      errors.push(`${label}: spec missing path`);
      return errors;
    }
    let specSrc = '';
    try {
      specSrc = readRel(claim.path);
    } catch {
      errors.push(`${label}: missing spec ${claim.path}`);
      return errors;
    }
    for (const token of claim.tokens || []) {
      if (!specSrc.includes(token)) {
        errors.push(`${label}: spec ${claim.path} missing token ${token}`);
      }
    }
    return errors;
  }
  if (claim.mode === 'silent-behavior') {
    if (!claim.id) errors.push(`${label}: silent-behavior missing id`);
    return errors;
  }
  errors.push(`${label}: unknown mode ${claim.mode}`);
  return errors;
}

/**
 * O-04 persistence three-state: pending / success / fail must all exist;
 * tokens must not cross keys; known success tokens must not sit on fail.
 *
 * @param {object} row
 * @param {string} fileSrc
 * @param {(rel: string) => string} readRel
 * @returns {string[]}
 */
function scanMutationFeedback(row, fileSrc, readRel) {
  /** @type {string[]} */
  const errors = [];
  const label = `${row.file} mutationFeedback`;
  if (Object.prototype.hasOwnProperty.call(row, 'failureFeedback')) {
    errors.push(
      `${row.file}: failureFeedback is retired; use mutationFeedback.{pending,success,fail}`
    );
  }
  const mf = row.mutationFeedback;
  if (!mf || typeof mf !== 'object' || Array.isArray(mf)) {
    errors.push(`${label}: missing object`);
    return errors;
  }
  for (const key of OVERLAY_UI_MUTATION_FEEDBACK_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(mf, key)) {
      errors.push(`${label}: missing ${key}`);
      continue;
    }
    errors.push(...scanClaim(mf[key], `${label}.${key}`, fileSrc, readRel));
  }
  for (const key of Object.keys(mf)) {
    if (!OVERLAY_UI_MUTATION_FEEDBACK_KEYS.includes(key)) {
      errors.push(`${label}: unknown key ${key}`);
    }
  }
  /** @type {Map<string, string[]>} */
  const tokenKeys = new Map();
  for (const key of OVERLAY_UI_MUTATION_FEEDBACK_KEYS) {
    for (const token of mf[key]?.tokens || []) {
      const list = tokenKeys.get(token) || [];
      list.push(key);
      tokenKeys.set(token, list);
    }
  }
  for (const [token, keys] of tokenKeys) {
    if (keys.length > 1) {
      errors.push(
        `${label}: token ${token} must not appear in multiple keys (${keys.join(',')})`
      );
    }
  }
  const failTokens = mf.fail?.tokens || [];
  for (const token of OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL) {
    if (failTokens.includes(token)) {
      errors.push(`${label}.fail must not include success token ${token}`);
    }
  }
  return errors;
}

/**
 * @returns {boolean}
 */
export function runOverlayContractUiCheck() {
  const registered = new Set(OVERLAY_SOURCE_CONTRACTS.map((row) => row.id));
  const files = readdirSync(UI_DIR).filter((name) => name.endsWith('.js'));
  /** @type {string[]} */
  const errors = [];
  const readRel = (rel) => readFileSync(join(PKG_ROOT, rel), 'utf8');

  for (const name of files) {
    if (name.endsWith('.test.js')) continue;
    if (WHITELIST_FILES.has(name)) continue;
    const src = readFileSync(join(UI_DIR, name), 'utf8');
    if (!STATUS_FN.test(src)) continue;
    const ids = OVERLAY_UI_FILE_SOURCES[name];
    if (!ids || ids.length === 0) {
      errors.push(`${name} has overlay status fn but is not in OVERLAY_UI_FILE_SOURCES`);
      continue;
    }
    for (const id of ids) {
      if (!registered.has(id)) {
        errors.push(`${name} maps to unregistered overlay id ${id}`);
      }
    }
  }

  for (const name of OVERLAY_UI_POINTER_HIT_TEST_REQUIRED) {
    const path = join(UI_DIR, name);
    let src;
    try {
      src = readFileSync(path, 'utf8');
    } catch {
      errors.push(`${name} listed in OVERLAY_UI_POINTER_HIT_TEST_REQUIRED but file missing`);
      continue;
    }
    if (!POINTER_HIT_TEST.test(src)) {
      errors.push(
        `${name} mounts under #ui-overlay but lacks pointer-events: auto (O-02)`
      );
    }
  }

  const occupancyFiles = new Set(Object.keys(OVERLAY_UI_FILE_SOURCES));
  const surfaceFiles = new Set();
  for (const row of OVERLAY_UI_SURFACE) {
    if (!row?.file) {
      errors.push('O-04 surface row missing file');
      continue;
    }
    surfaceFiles.add(row.file);
    const uiPath = join(UI_DIR, row.file);
    let src = '';
    try {
      src = readFileSync(uiPath, 'utf8');
    } catch {
      errors.push(`${row.file} listed in OVERLAY_UI_SURFACE but file missing`);
      continue;
    }

    if (row.occupancy !== false && !occupancyFiles.has(row.file)) {
      errors.push(`${row.file} occupancy surface row is not in OVERLAY_UI_FILE_SOURCES`);
    }
    if (row.occupancy === false && occupancyFiles.has(row.file)) {
      errors.push(`${row.file} occupancy:false but is in OVERLAY_UI_FILE_SOURCES`);
    }

    const slot = row.slotRequest;
    if (!slot?.mode) {
      errors.push(`${row.file} missing slotRequest`);
    } else if (slot.mode === 'request') {
      for (const token of slot.uiTokens || []) {
        if (!src.includes(token)) {
          errors.push(`${row.file} slotRequest missing UI token ${token}`);
        }
      }
      for (const rel of slot.wiringFiles || []) {
        let wiring = '';
        try {
          wiring = readRel(rel);
        } catch {
          errors.push(`${row.file} slotRequest missing wiring file ${rel}`);
          continue;
        }
        for (const token of slot.wiringTokens || ['requestOverlaySlot']) {
          if (!wiring.includes(token)) {
            errors.push(`${row.file} wiring ${rel} missing token ${token}`);
          }
        }
      }
    } else if (slot.mode === 'derive' || slot.mode === 'na' || slot.mode === 'gap') {
      errors.push(
        ...scanClaim(slot, `${row.file} slotRequest`, src, readRel)
      );
      if (row.occupancy !== false && slot.mode === 'na') {
        errors.push(`${row.file} occupancy overlay cannot use slotRequest na`);
      }
    } else {
      errors.push(`${row.file} slotRequest unknown mode ${slot.mode}`);
    }

    const zFloor = row.zIndexFloor;
    if (zFloor?.mode === 'body-min') {
      const maxZ = maxDeclaredZIndex(src);
      if (maxZ < Number(zFloor.min)) {
        errors.push(
          `${row.file} body-min z-index ${maxZ} < ${zFloor.min} (hint/shell floor)`
        );
      }
    } else if (zFloor?.mode === 'ui-overlay-stack') {
      if (!POINTER_HIT_TEST.test(src)) {
        errors.push(`${row.file} ui-overlay-stack lacks pointer-events: auto`);
      }
    } else {
      errors.push(
        ...scanClaim(zFloor, `${row.file} zIndexFloor`, src, readRel)
      );
    }

    if (row.mount === 'ui-overlay' || row.mount === 'mixed') {
      if (!POINTER_HIT_TEST.test(src)) {
        errors.push(`${row.file} mount ${row.mount} lacks pointer-events: auto (O-02)`);
      }
    } else if (row.mount !== 'body') {
      errors.push(`${row.file} mount must be body | ui-overlay | mixed`);
    }

    errors.push(...scanMutationFeedback(row, src, readRel));
    errors.push(
      ...scanClaim(row.e2eOverlap, `${row.file} e2eOverlap`, src, readRel)
    );
    errors.push(
      ...scanClaim(
        row.trackerCoverage,
        `${row.file} trackerCoverage`,
        src,
        readRel
      )
    );
  }

  for (const name of occupancyFiles) {
    if (!surfaceFiles.has(name)) {
      errors.push(`${name} is in OVERLAY_UI_FILE_SOURCES but missing O-04 surface row`);
    }
  }

  if (errors.length) {
    console.error('[overlay-contract-ui-check] FAILED');
    for (const line of errors) console.error(`  - ${line}`);
    return false;
  }
  console.log('[overlay-contract-ui-check] OK');
  return true;
}

function main() {
  if (!runOverlayContractUiCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
