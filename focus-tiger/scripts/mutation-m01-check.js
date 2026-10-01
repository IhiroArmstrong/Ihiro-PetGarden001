#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * DOC_CODE_CONTRACT M-01 static check (Slice 3).
 *
 *   npm run docs:check  — via docs-check.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  M01_BACKGROUND_EXEMPTIONS,
  M01_CLICK_MUTATION_FILES
} from '../src/core/mutationM01Contract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/**
 * @param {string} rel
 */
function readRel(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

/**
 * @returns {boolean}
 */
export function runMutationM01Check() {
  /** @type {string[]} */
  const errors = [];

  let cloudSrc = '';
  try {
    cloudSrc = readRel('src/core/cloudApiClient.js');
  } catch {
    errors.push('M-01: missing src/core/cloudApiClient.js');
  }
  if (cloudSrc) {
    if (!cloudSrc.includes('CLOUD_JSON_DEFAULT_TIMEOUT_MS')) {
      errors.push('M-01: postCloudJson missing CLOUD_JSON_DEFAULT_TIMEOUT_MS');
    }
    if (!cloudSrc.includes('withCloudJsonTimeout')) {
      errors.push('M-01: postCloudJson missing withCloudJsonTimeout');
    }
    if (!/status\s*=\s*408|\b408\b/.test(cloudSrc) || !cloudSrc.includes('timeout')) {
      errors.push('M-01: postCloudJson timeout must map to status 408');
    }
  }

  for (const rel of M01_CLICK_MUTATION_FILES) {
    let src = '';
    try {
      src = readRel(rel);
    } catch {
      errors.push(`M-01 click mutation missing file ${rel}`);
      continue;
    }
    if (/timeoutMs:\s*0\b/.test(src) && !rel.endsWith('.test.js')) {
      errors.push(`M-01 ${rel} must not disable timeout with timeoutMs: 0`);
    }
  }

  for (const row of M01_BACKGROUND_EXEMPTIONS) {
    try {
      readRel(row.file);
    } catch {
      errors.push(`M-01 exemption missing file ${row.file}`);
    }
    if (!row.reason) {
      errors.push(`M-01 exemption ${row.file} missing written reason`);
    }
  }

  let membershipSrc = '';
  try {
    membershipSrc = readRel('src/core/focusCircleMembership.js');
  } catch {
    errors.push('M-01: missing focusCircleMembership.js');
  }
  if (membershipSrc) {
    const leaveFn = membershipSrc.slice(
      membershipSrc.indexOf('export async function leaveFocusCircle')
    );
    const leaveBody = leaveFn.slice(0, leaveFn.indexOf('export async function refreshFocusCircleStatus'));
    const clearAt = leaveBody.indexOf('clearFocusCircleMembership(storage)');
    const postLeaveAt = leaveBody.indexOf("action: 'leave'");
    if (clearAt < 0 || postLeaveAt < 0 || clearAt < postLeaveAt) {
      const localOnlyClear =
        leaveBody.includes("reason: 'local_only'") &&
        leaveBody.indexOf('clearFocusCircleMembership(storage)') <
          leaveBody.indexOf("action: 'leave'");
      const successClear =
        leaveBody.includes("result.ok || result.reason === 'not_found'") &&
        leaveBody.indexOf("result.ok || result.reason === 'not_found'") <
          leaveBody.lastIndexOf('clearFocusCircleMembership(storage)');
      if (!(localOnlyClear && successClear && postLeaveAt >= 0)) {
        errors.push(
          'M-01: leaveFocusCircle must not clear local membership before cloud leave returns'
        );
      }
    }
  }

  let controlsSrc = '';
  try {
    controlsSrc = readRel('src/ui/FocusCircleControlsUI.js');
  } catch {
    errors.push('M-01: missing FocusCircleControlsUI.js');
  }
  if (controlsSrc) {
    const leaveHandler = controlsSrc.slice(controlsSrc.indexOf('async _handleLeave()'));
    const leaveBody = leaveHandler.slice(0, leaveHandler.indexOf('async _handleCopy()'));
    if (!leaveBody.includes('result.ok')) {
      errors.push('M-01: FocusCircleControlsUI leave must read result.ok');
    }
    if (!leaveBody.includes('PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT')) {
      errors.push('M-01: FocusCircleControlsUI leave must map timeout to fail copy');
    }
  }

  let witnessSrc = '';
  try {
    witnessSrc = readRel('src/core/focusCircleWitness.js');
  } catch {
    errors.push('M-01: missing focusCircleWitness.js');
  }
  if (witnessSrc && !witnessSrc.includes('status === 408')) {
    errors.push('M-01: postFocusCircleWitness must map HTTP 408 to timeout');
  }

  let wasHereSrc = '';
  try {
    wasHereSrc = readRel('src/core/focusCircleWasHere.js');
  } catch {
    errors.push('M-01: missing focusCircleWasHere.js');
  }
  if (wasHereSrc && !wasHereSrc.includes('status === 408')) {
    errors.push('M-01: postFocusCircleWasHereMark must map HTTP 408 to timeout');
  }

  let supportSrc = '';
  try {
    supportSrc = readRel('src/ui/SupportYinModalUI.js');
  } catch {
    errors.push('M-01: missing SupportYinModalUI.js');
  }
  if (supportSrc) {
    const runCheckout = supportSrc.slice(supportSrc.indexOf('async _runCheckout('));
    const runBody = runCheckout.slice(0, runCheckout.indexOf('async _setCheckoutBusy('));
    if (/this\.close\(\);\s*if \(kind === 'sanctuary'\)/.test(runBody)) {
      errors.push(
        'M-01: SupportYinModalUI must not close the modal before awaiting checkout handlers'
      );
    }
  }

  let reminderSrc = '';
  try {
    reminderSrc = readRel('src/ui/ReminderPreferenceUI.js');
  } catch {
    errors.push('M-01: missing ReminderPreferenceUI.js');
  }
  if (reminderSrc && !reminderSrc.includes('reminder-preference-saved')) {
    errors.push('M-01 cross-module: reminder success token missing from ReminderPreferenceUI');
  }

  if (errors.length) {
    for (const err of errors) {
      console.error(`[mutation-m01-check] ${err}`);
    }
    return false;
  }
  console.log('[mutation-m01-check] OK — M-01 timeout + leave order + reminder success token');
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(runMutationM01Check() ? 0 : 1);
}
