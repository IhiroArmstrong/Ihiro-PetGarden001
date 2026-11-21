#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * L1 entry signal ledger — static registry → LABEL_HINT_TIP_AUDIT machine block.
 *
 *   npm run audit:entry-signal-ledger
 *   npm run audit:entry-signal-ledger -- --write
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildEntrySignalLedgerRows,
  collectRegisteredPulseClasses
} from '../src/core/entrySignalLedgerRegistry.js';
import { ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST } from '../src/core/entrySignalLedgerContract.js';
import { runEntrySignalLintScan } from './audit-entry-signal-lint.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/LABEL_HINT_TIP_AUDIT.md');

const BEGIN = '<!-- entry-signal-ledger:begin -->';
const END = '<!-- entry-signal-ledger:end -->';
const INSERT_AFTER = '## 机制对照（实现层，便于开工）';

/**
 * @param {string} selector
 * @returns {string[]}
 */
export function splitSelectorList(selector) {
  return selector
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * @param {string} dir
 * @param {Map<string, string>} index
 */
function indexSourceTree(dir, index) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (
      rel.includes('node_modules') ||
      rel.includes('/dist/') ||
      rel.includes('/release/')
    ) {
      continue;
    }
    const st = statSync(full);
    if (st.isDirectory()) {
      indexSourceTree(full, index);
      continue;
    }
    if (!/\.(js|mjs|cjs|css|html)$/.test(name)) continue;
    let source = '';
    try {
      source = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    index.set(rel, source);
  }
}

/**
 * @returns {Map<string, string>}
 */
export function buildStaticSourceIndex() {
  /** @type {Map<string, string>} */
  const index = new Map();
  for (const relRoot of ['src', 'ui-kit', 'desktop', 'index.html']) {
    const abs = join(ROOT, relRoot);
    try {
      const st = statSync(abs);
      if (st.isFile()) {
        index.set(relRoot, readFileSync(abs, 'utf8'));
      } else {
        indexSourceTree(abs, index);
      }
    } catch {
      /* optional */
    }
  }
  return index;
}

/**
 * @param {string} needle
 * @param {Map<string, string>} index
 */
export function selectorReferencedInSources(needle, index) {
  const variants = [
    needle,
    needle.replace(/^#/, ''),
    needle.replace(/^\./, '')
  ];
  for (const source of index.values()) {
    for (const v of variants) {
      if (v.length < 2) continue;
      if (source.includes(v)) return true;
    }
  }
  return false;
}

/**
 * @param {import('../src/core/entrySignalLedgerRegistry.js').EntrySignalLedgerRow[]} rows
 * @param {Map<string, string>} index
 * @returns {string[]}
 */
export function validateLedgerSelectors(rows, index) {
  /** @type {string[]} */
  const errors = [];
  for (const row of rows) {
    const parts = splitSelectorList(row.selector);
    if (!parts.length) {
      errors.push(`${row.controlId}: empty selector`);
      continue;
    }
    const missing = parts.filter((part) => !selectorReferencedInSources(part, index));
    if (missing.length === parts.length) {
      errors.push(
        `${row.controlId}: selector not found in static sources (${row.selector})`
      );
    }
  }
  return errors;
}

/**
 * @returns {string}
 */
export function renderEntrySignalLedgerMarkdownBlock() {
  const rows = buildEntrySignalLedgerRows();
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/entrySignalLedgerRegistry.js` + `onboardingHintRegistry.js`。刷新：`npm run audit:entry-signal-ledger -- --write`。仅静态扫描；**禁止** DOM / 浏览器。',
    '',
    '| controlId | selector | visibleLabel | tooltip | pulse | oneShot | touch | stackExempt |',
    '|---|---|---|---|---|---|---|---|'
  ];
  for (const row of rows) {
    lines.push(
      `| \`${row.controlId}\` | \`${row.selector}\` | ${row.visibleLabel} | \`${row.tooltip}\` | \`${row.pulse}\` | \`${row.oneShot}\` | \`${row.touch}\` | ${row.stackExempt || '—'} |`
    );
  }
  lines.push('', END, '');
  return lines.join('\n');
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceEntrySignalLedgerBlock(md) {
  const block = renderEntrySignalLedgerMarkdownBlock();
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
      `LABEL_HINT_TIP_AUDIT.md missing ${BEGIN} and anchor "${INSERT_AFTER}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return `${md.slice(0, insertAt)}\n${block}${md.slice(insertAt)}`;
}

/**
 * Pulse classes in repo must be allowlisted (L3) — ledger adds registered set for reporting only.
 * @returns {string[]}
 */
function validatePulseClassesAgainstAllowlist() {
  const scan = runEntrySignalLintScan();
  return scan.pulseClass;
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runEntrySignalLedgerAudit({ write = false } = {}) {
  const rows = buildEntrySignalLedgerRows();
  const index = buildStaticSourceIndex();
  /** @type {string[]} */
  const errors = [];

  errors.push(...validateLedgerSelectors(rows, index));

  const registeredPulse = collectRegisteredPulseClasses(rows);
  for (const cls of registeredPulse) {
    if (!ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST.has(cls)) {
      errors.push(`ledger references pulse class not in allowlist: ${cls}`);
    }
  }

  errors.push(...validatePulseClassesAgainstAllowlist());

  if (errors.length) {
    console.error('[audit:entry-signal-ledger] structural scan FAILED');
    for (const err of errors) console.error(`  - ${err}`);
    return false;
  }

  const md = readFileSync(MD_PATH, 'utf8');
  if (write) {
    writeFileSync(MD_PATH, replaceEntrySignalLedgerBlock(md), 'utf8');
    console.log(
      '[audit:entry-signal-ledger] wrote machine block to docs/LABEL_HINT_TIP_AUDIT.md'
    );
    return true;
  }

  const rendered = renderEntrySignalLedgerMarkdownBlock();
  if (!md.includes(BEGIN) || md.indexOf(rendered) === -1) {
    console.error(
      '[audit:entry-signal-ledger] LABEL_HINT_TIP_AUDIT.md machine block out of sync — run npm run audit:entry-signal-ledger -- --write'
    );
    return false;
  }

  console.log(
    `[audit:entry-signal-ledger] OK — ${rows.length} ledger rows; static selectors + pulse class gate`
  );
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const write = process.argv.includes('--write');
  if (!runEntrySignalLedgerAudit({ write })) process.exit(1);
}