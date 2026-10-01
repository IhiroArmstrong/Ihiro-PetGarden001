#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Refresh all (a)-class doc machine blocks from code SSOT.
 *
 *   npm run docs:sync  — rewrite derived markdown blocks (no integrity gate)
 *
 * Pre-commit runs this before docs:check so registry/catalog edits cannot leave
 * kb-live-gap-audit.md (and siblings) stale and break CI (#951/#953).
 *
 * Does NOT run tracker:assemble (fragment workflow is opt-in).
 */

import { runGateContractDocCheck } from './gate-contract-doc-check.js';
import { runHintsDocCheck } from './hints-doc-check.js';
import { runStateMachineDocCheck } from './state-machine-doc-check.js';
import { runRulesAuthorityDocCheck } from './rules-authority-doc-check.js';
import { runVisibilityContractDocCheck } from './visibility-contract-doc-check.js';
import { runPracticeAggregateCoverageAudit } from './audit-practice-coverage.js';
import { runGrowthMetricsAudit } from './audit-growth-metrics.js';
import { runKbLiveEntryAudit } from './audit-kb-live-entries.js';
import { runKbLiveGapAudit } from './audit-kb-live-gap.js';

/** Markdown paths refreshed by docs:sync (pre-commit auto-stage allowlist). */
export const DOCS_SYNC_MACHINE_BLOCK_PATHS = Object.freeze([
  'docs/ONBOARDING_HINTS.md',
  'docs/HINTS_WIRING.md',
  'docs/SHARED_RESOURCES.md',
  'docs/ARCHITECTURE.md',
  'docs/RULES_INDEX.md',
  'docs/kb-live-entry-registry.md',
  'docs/kb-live-gap-audit.md',
  'docs/practice-aggregate-registry.md',
  'docs/GROWTH_METRICS_CHARTER.md'
]);

/**
 * @returns {boolean}
 */
export function runDocsSync() {
  runHintsDocCheck({ write: true });
  runGateContractDocCheck({ write: true });
  runVisibilityContractDocCheck({ write: true });
  runStateMachineDocCheck({ write: true });
  runRulesAuthorityDocCheck({ write: true });
  runPracticeAggregateCoverageAudit({ write: true });
  runGrowthMetricsAudit({ write: true });
  runKbLiveEntryAudit({ write: true });
  runKbLiveGapAudit({ write: true });
  console.log('\n[docs:sync] OK — machine blocks refreshed from code SSOT.');
  return true;
}

function main() {
  runDocsSync();
}

main();
