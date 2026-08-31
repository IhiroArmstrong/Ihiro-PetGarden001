#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unified doc–code structural alignment check.
 *
 *   npm run docs:check  — runs all (a)/(c)/(d) registry ↔ markdown / consistency checks; exit 1 on drift
 *
 * (b) behavioral contract tests run via `npm run test:smoke` (see DOC_CODE_CONTRACT.md).
 */

import { runGateContractDocCheck } from './gate-contract-doc-check.js';
import { runHintsDocCheck } from './hints-doc-check.js';
import { runStateMachineDocCheck } from './state-machine-doc-check.js';
import { runRulesAuthorityDocCheck } from './rules-authority-doc-check.js';
import { runVisibilityContractDocCheck } from './visibility-contract-doc-check.js';
import { runDocsConsistencyCheck } from './check-docs-consistency.js';
import { runCopyrightHeaderCheck } from './copyright-header.js';
import { runTrackerFragmentCheck } from './assemble-tracker.js';
import { runOverlayContractUiCheck } from './overlay-contract-ui-check.js';

function main() {
  let ok = true;

  if (!runHintsDocCheck()) ok = false;
  if (!runGateContractDocCheck()) ok = false;
  if (!runVisibilityContractDocCheck()) ok = false;
  if (!runStateMachineDocCheck()) ok = false;
  if (!runRulesAuthorityDocCheck()) ok = false;
  if (!runDocsConsistencyCheck()) ok = false;
  if (!runCopyrightHeaderCheck()) ok = false;
  if (!runTrackerFragmentCheck()) ok = false;
  if (!runOverlayContractUiCheck()) ok = false;

  if (!ok) {
    console.error(
      '\n[docs:check] FAILED — doc machine blocks out of sync with code SSOT, and/or protected numeric restatement outside SSOT.'
    );
    process.exit(1);
  }

  console.log('\n[docs:check] OK — all machine blocks match code registries; docs consistency OK.');
}

main();
