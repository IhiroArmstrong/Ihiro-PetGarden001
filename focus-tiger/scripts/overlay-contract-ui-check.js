#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Assert src/ui overlay status fns map to OVERLAY_SOURCE_CONTRACTS.
 *
 *   node scripts/overlay-contract-ui-check.js
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OVERLAY_SOURCE_CONTRACTS,
  OVERLAY_UI_FILE_SOURCES
} from '../src/core/overlaySlotContractRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_DIR = join(__dirname, '../src/ui');

const STATUS_FN = /(?:isOpen|isVisible|isPrivacySheetOpen|isPurposeCardOpen|isWellnessFirstCardOpen)\s*\(\s*\)\s*\{|phase\s*!==\s*'hidden'/;

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
 * @returns {boolean}
 */
export function runOverlayContractUiCheck() {
  const registered = new Set(OVERLAY_SOURCE_CONTRACTS.map((row) => row.id));
  const files = readdirSync(UI_DIR).filter((name) => name.endsWith('.js'));
  /** @type {string[]} */
  const errors = [];

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
