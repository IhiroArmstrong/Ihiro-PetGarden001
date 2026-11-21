#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * L3 static lint — purpose `title`, pulse class, pulse @keyframes (no browser).
 *
 *   npm run audit:entry-signal-lint
 *   npm run audit:entry-signal-lint -- --write-baseline
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ENTRY_SIGNAL_LINT_SCAN_ROOTS,
  ENTRY_SIGNAL_LINT_SKIP_NAME_PATTERNS,
  ENTRY_SIGNAL_TITLE_LINE_EXEMPT,
  ENTRY_SIGNAL_TITLE_VIOLATION_PATTERNS,
  ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST,
  ENTRY_SIGNAL_PULSE_ANIMATION_ALLOWLIST
} from '../src/core/entrySignalLedgerContract.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASELINE_PATH = join(
  ROOT,
  'docs/audit/entry-signal-native-title-baseline.json'
);

const PULSE_CLASS_NAME_ASSIGN =
  /\bclassName\s*=\s*(['"])([^'"]+)\1/g;
const PULSE_CLASS_LIST_CALL =
  /\bclassList\.(?:add|toggle|remove)\s*\(\s*(['"])([^'"]+)\1/g;

const CSS_CLASS_PULSE =
  /\.([a-zA-Z0-9_-]*(?:pulse|hint-dot|discovery-dot|hint-mint)[a-zA-Z0-9_-]*)\b/g;

const KEYFRAMES_PULSE = /@keyframes\s+([a-zA-Z0-9_-]*pulse[a-zA-Z0-9_-]*)/gi;
const ANIMATION_PULSE =
  /animation\s*:[^;{]*\b([a-zA-Z0-9_-]*pulse[a-zA-Z0-9_-]*)/gi;

/**
 * @param {string} relPosix
 */
function shouldSkipRel(relPosix) {
  return ENTRY_SIGNAL_LINT_SKIP_NAME_PATTERNS.some((re) =>
    re.test(relPosix.replace(/\\/g, '/'))
  );
}

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walkJsCss(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (shouldSkipRel(rel)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      walkJsCss(full, acc);
      continue;
    }
    if (!/\.(js|mjs|cjs|css)$/.test(name)) continue;
    if (rel.includes('/native/')) continue;
    acc.push(full);
  }
}

/**
 * @returns {string[]}
 */
function listLintFiles() {
  /** @type {string[]} */
  const files = [];
  for (const relRoot of ENTRY_SIGNAL_LINT_SCAN_ROOTS) {
    walkJsCss(join(ROOT, relRoot), files);
  }
  return files;
}

/**
 * @param {string} line
 */
function isTitleLineExempt(line) {
  return ENTRY_SIGNAL_TITLE_LINE_EXEMPT.some((re) => re.test(line));
}

/**
 * @param {string} relPosix
 * @param {string} source
 * @returns {string[]}
 */
export function scanNativeTitleViolations(relPosix, source) {
  const hits = [];
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!ENTRY_SIGNAL_TITLE_VIOLATION_PATTERNS.some((re) => re.test(line))) {
      continue;
    }
    if (isTitleLineExempt(line)) continue;
    hits.push(`${relPosix}:${i + 1}:${line.trim()}`);
  }
  return hits;
}

/**
 * @param {string} token
 */
function isSuspiciousPulseClassToken(token) {
  if (ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST.has(token)) return false;
  if (
    !/pulse|hint-dot|discovery-dot|discovery-pulse|hint-mint|hint-badge/i.test(
      token
    )
  ) {
    return false;
  }
  return true;
}

/**
 * @param {string} relPosix
 * @param {string} source
 * @returns {string[]}
 */
export function scanUnregisteredPulseClasses(relPosix, source) {
  /** @type {Set<string>} */
  const bad = new Set();
  for (const re of [PULSE_CLASS_NAME_ASSIGN, PULSE_CLASS_LIST_CALL, CSS_CLASS_PULSE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source))) {
      const raw = re === CSS_CLASS_PULSE ? m[1] : m[2];
      for (const token of String(raw).split(/\s+/)) {
        if (token && isSuspiciousPulseClassToken(token)) bad.add(token);
      }
    }
  }
  if (!bad.size) return [];
  return [...bad].map((token) => `${relPosix}: unregistered pulse class \`${token}\``);
}

/**
 * @param {string} relPosix
 * @param {string} source
 * @returns {string[]}
 */
export function scanUnlistedPulseAnimations(relPosix, source) {
  /** @type {Set<string>} */
  const names = new Set();
  for (const re of [KEYFRAMES_PULSE, ANIMATION_PULSE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(source))) {
      const name = m[1];
      if (name && name.toLowerCase().includes('pulse')) names.add(name);
    }
  }
  /** @type {string[]} */
  const hits = [];
  for (const name of names) {
    if (name === 'pulse') continue;
    if (!ENTRY_SIGNAL_PULSE_ANIMATION_ALLOWLIST.has(name)) {
      hits.push(`${relPosix}: pulse animation not whitelisted \`${name}\``);
    }
  }
  return hits;
}

/**
 * @returns {{ title: string[], pulseClass: string[], pulseAnim: string[] }}
 */
export function runEntrySignalLintScan() {
  /** @type {string[]} */
  const title = [];
  /** @type {string[]} */
  const pulseClass = [];
  /** @type {string[]} */
  const pulseAnim = [];
  for (const abs of listLintFiles()) {
    const rel = relative(ROOT, abs).replace(/\\/g, '/');
    const source = readFileSync(abs, 'utf8');
    title.push(...scanNativeTitleViolations(rel, source));
    pulseClass.push(...scanUnregisteredPulseClasses(rel, source));
    pulseAnim.push(...scanUnlistedPulseAnimations(rel, source));
  }
  title.sort();
  pulseClass.sort();
  pulseAnim.sort();
  return { title, pulseClass, pulseAnim };
}

/**
 * @param {string[]} live
 * @param {string[]} baseline
 */
function diffNewViolations(live, baseline) {
  const base = new Set(baseline);
  return live.filter((line) => !base.has(line));
}

/**
 * @param {{ writeBaseline?: boolean }} [opts]
 * @returns {boolean}
 */
export function runEntrySignalLint({ writeBaseline = false } = {}) {
  const scan = runEntrySignalLintScan();

  let baselineTitle = [];
  try {
    const raw = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    baselineTitle = Array.isArray(raw.titleViolations) ? raw.titleViolations : [];
  } catch {
    if (!writeBaseline) {
      console.error(
        `[audit:entry-signal-lint] missing baseline ${relative(ROOT, BASELINE_PATH)} — run with --write-baseline once`
      );
      return false;
    }
  }

  if (writeBaseline) {
    const payload = {
      updated: new Date().toISOString().slice(0, 10),
      note: 'Purpose native title assignments grandfathered until L5 migration.',
      titleViolations: scan.title
    };
    writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(
      `[audit:entry-signal-lint] wrote baseline (${scan.title.length} title rows)`
    );
    baselineTitle = scan.title;
  }

  /** @type {string[]} */
  const errors = [];

  const newTitle = writeBaseline ? [] : diffNewViolations(scan.title, baselineTitle);
  if (newTitle.length) {
    errors.push(
      ...newTitle.map((line) => `NEW native title: ${line}`)
    );
  }

  if (writeBaseline) {
    baselineTitle = scan.title;
  }

  const removed = baselineTitle.filter((line) => !scan.title.includes(line));
  if (removed.length && !writeBaseline) {
    errors.push(
      `Title baseline stale (${removed.length} row(s) fixed in code — refresh with --write-baseline): ${removed[0]}`
    );
  }

  if (scan.pulseClass.length) {
    errors.push(...scan.pulseClass);
  }
  if (scan.pulseAnim.length) {
    errors.push(...scan.pulseAnim);
  }

  if (errors.length) {
    console.error('[audit:entry-signal-lint] FAILED');
    for (const err of errors) console.error(`  - ${err}`);
    return false;
  }

  if (writeBaseline) {
    console.log(
      `[audit:entry-signal-lint] baseline refreshed (${baselineTitle.length} title rows); pulse class/anim clean`
    );
    return true;
  }

  console.log(
    `[audit:entry-signal-lint] OK — title baseline ${baselineTitle.length}; pulse class/anim clean`
  );
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const writeBaseline = process.argv.includes('--write-baseline');
  if (!runEntrySignalLint({ writeBaseline })) process.exit(1);
}