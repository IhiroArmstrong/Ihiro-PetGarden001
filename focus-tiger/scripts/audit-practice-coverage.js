#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Practice aggregate coverage audit (Batch 4).
 *
 *   npm run audit:practice-coverage        — exit 1 on registry / code drift
 *   npm run audit:practice-coverage -- --write  — refresh md machine block
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PRACTICE_AGGREGATE_CONSUMER_ROWS,
  PRACTICE_BASELINE_SOURCE_IDS,
  listPracticeAggregateCoverageGateRows
} from '../src/core/practiceAggregateConsumerRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/practice-aggregate-registry.md');

const BEGIN = '<!-- practice-aggregate-consumer-registry:begin -->';
const END = '<!-- practice-aggregate-consumer-registry:end -->';
const INSERT_AFTER = '## Consumer registry';

/**
 * @param {readonly string[]} baseline
 * @param {readonly string[] | null} reflected
 * @returns {{ missing: string[], extra: string[] }}
 */
export function diffBaselineCoverage(baseline, reflected) {
  if (!reflected) return { missing: [], extra: [] };
  const base = new Set(baseline);
  const refl = new Set(reflected);
  const missing = baseline.filter((id) => !refl.has(id));
  const extra = reflected.filter((id) => !base.has(id));
  return { missing, extra };
}

/**
 * @param {import('../src/core/practiceAggregateConsumerRegistry.js').PracticeAggregateConsumerRow} row
 * @param {string} moduleSrc
 * @returns {string[]}
 */
export function findMissingCodeAnchors(row, moduleSrc) {
  return row.codeAnchors.filter((anchor) => !moduleSrc.includes(anchor));
}

/**
 * @returns {string}
 */
export function renderPracticeAggregateRegistryMarkdownBlock() {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/practiceAggregateConsumerRegistry.js`。刷新：`npm run audit:practice-coverage -- --write`。',
    '',
    `**Baseline sources**: ${PRACTICE_BASELINE_SOURCE_IDS.map((id) => `\`${id}\``).join(' · ')}`,
    '',
    '| id | P | batch | status | module | anchors | reflected |',
    '|---|---:|---:|---|---|---|---|'
  ];

  for (const row of PRACTICE_AGGREGATE_CONSUMER_ROWS) {
    const reflected =
      row.reflectedSources == null
        ? '—'
        : row.reflectedSources.map((id) => `\`${id}\``).join(' ');
    lines.push(
      `| \`${row.id}\` | ${row.priority} | ${row.fixBatch ?? '—'} | ${row.coverageStatus} | \`${row.moduleRelPath}\` | ${row.codeAnchors.map((a) => `\`${a}\``).join(' ')} | ${reflected} |`
    );
  }

  lines.push('', END, '');
  return lines.join('\n');
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replacePracticeAggregateRegistryBlock(md) {
  const block = renderPracticeAggregateRegistryMarkdownBlock();
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
      `practice-aggregate-registry.md missing ${BEGIN} markers and anchor "${INSERT_AFTER}"`
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
export function runPracticeAggregateCoverageAudit({ write = false } = {}) {
  let ok = true;
  /** @type {Map<string, string>} */
  const moduleCache = new Map();

  for (const row of PRACTICE_AGGREGATE_CONSUMER_ROWS) {
    const absPath = join(ROOT, row.moduleRelPath);
    if (!existsSync(absPath)) {
      console.error(
        `[audit:practice-coverage] missing module for ${row.id}: ${row.moduleRelPath}`
      );
      ok = false;
      continue;
    }

    let src = moduleCache.get(row.moduleRelPath);
    if (src == null) {
      src = readFileSync(absPath, 'utf8');
      moduleCache.set(row.moduleRelPath, src);
    }

    const missingAnchors = findMissingCodeAnchors(row, src);
    if (missingAnchors.length > 0) {
      console.error(
        `[audit:practice-coverage] ${row.id}: missing anchors in ${row.moduleRelPath}: ${missingAnchors.join(', ')}`
      );
      ok = false;
    }
  }

  for (const row of listPracticeAggregateCoverageGateRows()) {
    const { missing, extra } = diffBaselineCoverage(
      PRACTICE_BASELINE_SOURCE_IDS,
      row.reflectedSources
    );
    if (missing.length > 0 || extra.length > 0) {
      console.error(
        `[audit:practice-coverage] ${row.id}: baseline delta missing=[${missing.join(', ')}] extra=[${extra.join(', ')}]`
      );
      ok = false;
    }
  }

  const md = readFileSync(MD_PATH, 'utf8');
  const nextMd = replacePracticeAggregateRegistryBlock(md);

  if (write) {
    writeFileSync(MD_PATH, nextMd, 'utf8');
    console.log(`[audit:practice-coverage] updated ${MD_PATH}`);
    return ok;
  }

  if (nextMd !== md) {
    console.error(
      '[audit:practice-coverage] docs/practice-aggregate-registry.md machine block out of sync.'
    );
    console.error('Run: cd focus-tiger && npm run audit:practice-coverage -- --write');
    ok = false;
  }

  if (ok) {
    console.log(
      `[audit:practice-coverage] OK — ${listPracticeAggregateCoverageGateRows().length} gated rows; baseline ${PRACTICE_BASELINE_SOURCE_IDS.length} sources`
    );
  }

  return ok;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runPracticeAggregateCoverageAudit({ write });
  if (!ok && !write) process.exitCode = 1;
}
