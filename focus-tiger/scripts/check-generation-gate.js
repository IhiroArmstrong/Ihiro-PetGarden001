#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 PR-1 generation-surface inventory check. Report-only by default.
 *
 *   node scripts/check-generation-gate.js           # print report, exit 0
 *   node scripts/check-generation-gate.js --check   # exit 1 when the table drifts
 *
 * PR-3 is what turns a drift into a required CI failure. This script does not
 * call the model and does not change what the user sees.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const SURFACES_DOC = join(PKG_ROOT, 'docs/GENERATION_SURFACES.md');

const SCAN_ROOTS = ['src', 'desktop', 'cloud'];
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git'
]);
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.py', '.toml', '.jsonc']);

const CLOUD_LLM_PATTERNS = [
  { id: 'openai', re: /api\.openai\.com/ },
  { id: 'anthropic', re: /api\.anthropic\.com/ },
  { id: 'gemini', re: /generativelanguage\.googleapis\.com/ },
  { id: 'groq', re: /api\.groq\.com/ },
  { id: 'openrouter', re: /openrouter\.ai/ },
  { id: 'together', re: /api\.together\.(?:xyz|ai)/ },
  { id: 'workers-ai', re: /@cf\/|workers-ai/ },
  { id: 'chat-completions', re: /chat\/completions/ },
  { id: 'ollama', re: /:11434|\bollama\b/i }
];

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      walk(abs, out);
      continue;
    }
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot) : '';
    if (!TEXT_EXT.has(ext)) continue;
    out.push(abs);
  }
}

/**
 * @param {string} text
 * @returns {Array<{ pathId: string, anchor: string, visible: string }>}
 */
export function parseGenerationSurfaces(text) {
  const lines = String(text || '').split('\n');
  /** @type {string[] | null} */
  let header = null;
  /** @type {Array<{ pathId: string, anchor: string, visible: string }>} */
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('|')) {
      header = null;
      continue;
    }
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/`/g, ''));
    if (cells.length === 0) continue;
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    if (cells.includes('pathId') && cells.includes('anchor')) {
      header = cells;
      continue;
    }
    if (!header) continue;
    /** @type {Record<string, string>} */
    const rec = {};
    header.forEach((key, index) => {
      rec[key] = cells[index] || '';
    });
    if (!rec.pathId || rec.pathId === 'pathId') continue;
    rows.push({
      pathId: rec.pathId,
      anchor: rec.anchor || '',
      visible: rec.visible || ''
    });
  }
  return rows;
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function parseWrapperAnchors(text) {
  const lines = String(text || '').split('\n');
  /** @type {string[] | null} */
  let header = null;
  /** @type {string[]} */
  const anchors = [];
  for (const line of lines) {
    if (!line.startsWith('|')) {
      header = null;
      continue;
    }
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/`/g, ''));
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    if (cells.includes('wrapperId') && cells.includes('anchor')) {
      header = cells;
      continue;
    }
    if (!header) continue;
    /** @type {Record<string, string>} */
    const rec = {};
    header.forEach((key, index) => {
      rec[key] = cells[index] || '';
    });
    if (rec.anchor && /\.js:\d+$/.test(rec.anchor)) anchors.push(rec.anchor);
  }
  return anchors;
}

/**
 * @param {string} root
 * @returns {{ promptSites: string[], cloudHits: string[], wrapperSites: string[] }}
 */
export function scanGenerationSources(root = PKG_ROOT) {
  /** @type {string[]} */
  const files = [];
  for (const rel of SCAN_ROOTS) walk(join(root, rel), files);
  /** @type {string[]} */
  const promptSites = [];
  /** @type {string[]} */
  const cloudHits = [];
  /** @type {string[]} */
  const wrapperSites = [];
  for (const abs of files) {
    const rel = relative(root, abs).split('\\').join('/');
    const raw = readFileSync(abs, 'utf8');
    const lines = raw.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        continue;
      }
      if (/\.prompt\s*\(/.test(line)) {
        promptSites.push(`${rel}:${i + 1}`);
      }
      if (/(?:session|hold)\.generate\s*\(/.test(line)) {
        wrapperSites.push(`${rel}:${i + 1}`);
      }
      for (const pattern of CLOUD_LLM_PATTERNS) {
        if (pattern.re.test(line)) {
          cloudHits.push(`${pattern.id} ${rel}:${i + 1}`);
        }
      }
    }
  }
  promptSites.sort();
  cloudHits.sort();
  wrapperSites.sort();
  return { promptSites, cloudHits, wrapperSites };
}

/**
 * @param {string[]} sites
 * @param {Array<{ pathId: string, anchor: string }>} rows
 */
export function diffPromptSites(sites, rows) {
  const anchors = rows
    .map((row) => row.anchor)
    .filter((anchor) => /\.(?:js|mjs|cjs|ts|tsx):\d+$/.test(anchor));
  const anchorSet = new Set(anchors);
  const siteSet = new Set(sites);
  const missingFromTable = sites.filter((site) => !anchorSet.has(site));
  const missingFromCode = [...anchorSet].filter((anchor) => !siteSet.has(anchor));
  return { missingFromTable, missingFromCode, anchors };
}

/**
 * @param {{ check?: boolean, root?: string, docText?: string }} [opts]
 * @returns {{ exitCode: number, lines: string[] }}
 */
export function runGenerationGateReport(opts = {}) {
  const root = opts.root || PKG_ROOT;
  const docText =
    typeof opts.docText === 'string' ? opts.docText : readFileSync(SURFACES_DOC, 'utf8');
  const rows = parseGenerationSurfaces(docText);
  const wrappers = parseWrapperAnchors(docText);
  const scanned = scanGenerationSources(root);
  const diff = diffPromptSites(scanned.promptSites, rows);
  const wrapperSet = new Set(wrappers);
  const wrapperMissingFromTable = scanned.wrapperSites.filter((site) => !wrapperSet.has(site));
  const wrapperMissingFromCode = wrappers.filter((site) => !scanned.wrapperSites.includes(site));
  const drift =
    diff.missingFromTable.length +
    diff.missingFromCode.length +
    wrapperMissingFromTable.length +
    wrapperMissingFromCode.length +
    scanned.cloudHits.length;
  /** @type {string[]} */
  const lines = [];
  let runtimeText = '';
  try {
    runtimeText = readFileSync(join(root, 'desktop/companion/l1Runtime.js'), 'utf8');
  } catch {
    runtimeText = '';
  }
  const productWired = /guardedGenerate\s*\(/.test(runtimeText);
  if (!productWired) {
    drift += 1;
  }
  lines.push(`[generation-gate] mode=${opts.check ? 'check' : 'report'}`);
  lines.push(`[generation-gate] surfaces=${rows.length}`);
  lines.push(`[generation-gate] prompt-sites=${scanned.promptSites.length}`);
  for (const site of scanned.promptSites) lines.push(`  prompt ${site}`);
  lines.push(`[generation-gate] prompt-missing-from-table=${diff.missingFromTable.length}`);
  for (const site of diff.missingFromTable) lines.push(`  missing-table ${site}`);
  lines.push(`[generation-gate] prompt-missing-from-code=${diff.missingFromCode.length}`);
  for (const site of diff.missingFromCode) lines.push(`  missing-code ${site}`);
  lines.push(`[generation-gate] session-generate=${scanned.wrapperSites.length}`);
  for (const site of scanned.wrapperSites) lines.push(`  wrapper ${site}`);
  lines.push(`[generation-gate] wrapper-missing-from-table=${wrapperMissingFromTable.length}`);
  for (const site of wrapperMissingFromTable) lines.push(`  missing-table ${site}`);
  lines.push(`[generation-gate] wrapper-missing-from-code=${wrapperMissingFromCode.length}`);
  for (const site of wrapperMissingFromCode) lines.push(`  missing-code ${site}`);
  lines.push(`[generation-gate] cloud-llm=${scanned.cloudHits.length}`);
  for (const hit of scanned.cloudHits) lines.push(`  cloud ${hit}`);
  lines.push(
    '[generation-gate] cloud-scope=focus-tiger/src,focus-tiger/desktop,focus-tiger/cloud; patterns=openai,anthropic,gemini,groq,openrouter,together,workers-ai,@cf/,chat/completions,ollama,:11434'
  );
  if (scanned.cloudHits.length === 0) {
    lines.push('[generation-gate] cloud-llm-result=已查、无');
  }
  lines.push(
    productWired
      ? '[generation-gate] product-generate=guardedGenerate'
      : '[generation-gate] product-generate=unwired'
  );
  lines.push(
    drift === 0
      ? '[generation-gate] drift=0'
      : `[generation-gate] drift=${drift}${opts.check ? '' : ' (report-only; --check exits 1)'}`
  );
  const exitCode = opts.check && drift > 0 ? 1 : 0;
  return { exitCode, lines, drift, scanned, rows, diff };
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  const check = process.argv.includes('--check');
  const report = runGenerationGateReport({ check });
  for (const line of report.lines) console.log(line);
  process.exit(report.exitCode);
}
