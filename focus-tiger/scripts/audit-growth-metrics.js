#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Growth metrics governance audit.
 *
 *   npm run audit:growth-metrics        — schema + persona regression + md sync
 *   npm run audit:growth-metrics -- --write  — refresh charter machine block
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GROWTH_METRIC_TRACK_ROWS,
  listAllGrowthMetricSchemaViolations
} from '../src/core/growthMetricsRegistry.js';
import {
  GROWTH_PERSONA_FIXTURES,
  getGrowthPersonaFixture
} from '../src/core/growthPersonaFixtures.js';
import { runGrowthPersonaRegression } from '../src/core/growthPersonaRegression.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CHARTER_PATH = join(ROOT, 'docs/GROWTH_METRICS_CHARTER.md');

const BEGIN = '<!-- growth-metrics-registry:begin -->';
const END = '<!-- growth-metrics-registry:end -->';
const INSERT_AFTER = '## Track registry (machine block)';

/**
 * @returns {string[]}
 */
export function listGrowthMetricPersonaLinkViolations() {
  /** @type {string[]} */
  const out = [];
  const personaIds = new Set(GROWTH_PERSONA_FIXTURES.map((p) => p.id));
  for (const row of GROWTH_METRIC_TRACK_ROWS) {
    for (const personaId of row.relatedPersonas) {
      if (!personaIds.has(personaId)) {
        out.push(`${row.id}: unknown persona ${personaId}`);
      }
    }
  }
  for (const persona of GROWTH_PERSONA_FIXTURES) {
    if (!persona.id.startsWith('qa-') && persona.id !== 'milestone-streak-7') {
      const linked = GROWTH_METRIC_TRACK_ROWS.some((row) =>
        row.relatedPersonas.includes(persona.id)
      );
      if (!linked) {
        out.push(`persona ${persona.id} not referenced by any track row`);
      }
    }
  }
  return out;
}

/**
 * @returns {string}
 */
export function renderGrowthMetricsRegistryMarkdownBlock() {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/growthMetricsRegistry.js` · persona：`src/core/growthPersonaFixtures.js`。刷新：`npm run audit:growth-metrics -- --write`。',
    '',
    '| id | purpose | window | formulaVersion | formulaSummary |',
    '|---|---|---|---|---|'
  ];

  for (const row of GROWTH_METRIC_TRACK_ROWS) {
    const summary = row.formulaSummary.replace(/\|/g, '\\|');
    lines.push(
      `| \`${row.id}\` | ${row.purpose} | ${row.aggregationWindow} | ${row.formulaVersion} | ${summary} |`
    );
  }

  lines.push('', '### Persona regression (contract)', '');
  lines.push('| id | label | intent | score | mustard | blooms | badges |');
  lines.push('|---|---|---|---:|---|---:|---:|');

  for (const persona of GROWTH_PERSONA_FIXTURES) {
    const e = persona.expectations;
    lines.push(
      `| \`${persona.id}\` | ${persona.label} | ${persona.intent.replace(/\|/g, '\\|')} | ${e.score} | ${e.mustardUnlocked ? 'yes' : 'no'} | ${e.visibleBloomCount} | ${e.freeBadgeCount} |`
    );
  }

  lines.push('', END, '');
  return lines.join('\n');
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceGrowthMetricsRegistryBlock(md) {
  const block = renderGrowthMetricsRegistryMarkdownBlock();
  const start = md.indexOf(BEGIN);
  const end = md.indexOf(END);

  if (start !== -1 && end !== -1 && end >= start) {
    const afterEnd = end + END.length;
    const before = md.slice(0, start).replace(/\n+$/, '');
    const after = md.slice(afterEnd).replace(/^\n+/, '');
    return after
      ? `${before}\n\n${block}\n${after}`
      : `${before}\n\n${block}\n`;
  }

  const anchor = md.indexOf(INSERT_AFTER);
  if (anchor === -1) {
    throw new Error(
      `GROWTH_METRICS_CHARTER.md missing ${BEGIN} markers and anchor "${INSERT_AFTER}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return `${md.slice(0, insertAt)}\n${block}${md.slice(insertAt)}`;
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runGrowthMetricsAudit({ write = false } = {}) {
  let ok = true;

  const schemaViolations = listAllGrowthMetricSchemaViolations();
  if (schemaViolations.length > 0) {
    console.error('[audit:growth-metrics] registry schema violations:');
    for (const msg of schemaViolations) console.error(`  - ${msg}`);
    ok = false;
  }

  const personaLinkViolations = listGrowthMetricPersonaLinkViolations();
  if (personaLinkViolations.length > 0) {
    console.error('[audit:growth-metrics] persona link violations:');
    for (const msg of personaLinkViolations) console.error(`  - ${msg}`);
    ok = false;
  }

  const regression = runGrowthPersonaRegression();
  if (!regression.ok) {
    console.error('[audit:growth-metrics] persona regression failed:');
    for (const fail of regression.failures) {
      console.error(`  ${fail.id}:`);
      for (const v of fail.violations) console.error(`    - ${v}`);
    }
    ok = false;
  }

  const md = readFileSync(CHARTER_PATH, 'utf8');
  const nextMd = replaceGrowthMetricsRegistryBlock(md);

  if (write) {
    writeFileSync(CHARTER_PATH, nextMd, 'utf8');
    console.log(`[audit:growth-metrics] updated ${CHARTER_PATH}`);
    return ok;
  }

  if (nextMd !== md) {
    console.error(
      '[audit:growth-metrics] docs/GROWTH_METRICS_CHARTER.md machine block out of sync.'
    );
    console.error('Run: cd focus-tiger && npm run audit:growth-metrics -- --write');
    ok = false;
  }

  if (ok) {
    console.log(
      `[audit:growth-metrics] OK — ${GROWTH_METRIC_TRACK_ROWS.length} tracks; ${GROWTH_PERSONA_FIXTURES.length} personas`
    );
  }

  return ok;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runGrowthMetricsAudit({ write });
  if (!ok && !write) process.exitCode = 1;
}

/**
 * Re-export for tests that need a single persona lookup.
 */
export { getGrowthPersonaFixture };
