#!/usr/bin/env node
/**
 * Unified doc–code structural alignment check.
 *
 *   npm run docs:check  — runs all (a) registry ↔ markdown diff checks; exit 1 on drift
 *
 * (b) behavioral contract tests run via `npm run test:smoke` (see DOC_CODE_CONTRACT.md).
 */

import { runGateContractDocCheck } from './gate-contract-doc-check.js';
import { runHintsDocCheck } from './hints-doc-check.js';
import { runStateMachineDocCheck } from './state-machine-doc-check.js';

function main() {
  let ok = true;

  if (!runHintsDocCheck()) ok = false;
  if (!runGateContractDocCheck()) ok = false;
  if (!runStateMachineDocCheck()) ok = false;

  if (!ok) {
    console.error('\n[docs:check] FAILED — doc machine blocks out of sync with code SSOT.');
    process.exit(1);
  }

  console.log('\n[docs:check] OK — all machine blocks match code registries.');
}

main();
