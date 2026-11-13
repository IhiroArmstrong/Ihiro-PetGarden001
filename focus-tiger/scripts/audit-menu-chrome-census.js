#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * MENU_CHROME_CENSUS.md §2.2 machine block from listSecondaryChromeEntries.
 *
 *   npm run audit:menu-chrome-census
 *   npm run audit:menu-chrome-census -- --write
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listSecondaryChromeEntries } from '../src/core/idleChromeOrchestration.js';
import { buildKbLiveMenuAuditVisibility } from './audit-kb-live-entries.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/MENU_CHROME_CENSUS.md');

const BEGIN = '<!-- menu-chrome-census-proxies:begin -->';
const END = '<!-- menu-chrome-census-proxies:end -->';
const INSERT_AFTER = '### 2.2 菜单里已有的功能（SSOT 分组）';

/**
 * @param {import('../src/core/idleChromeOrchestration.js').SecondaryChromeEntry[]} entries
 * @returns {Array<{ group: string, proxies: string[] }>}
 */
export function groupSecondaryChromeProxies(entries) {
  /** @type {Array<{ group: string, proxies: string[] }>} */
  const groups = [];
  /** @type {{ group: string, proxies: string[] } | null} */
  let current = null;
  for (const row of entries) {
    if (row.kind === 'group-label') {
      current = { group: row.labelKey, proxies: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { group: '(ungrouped)', proxies: [] };
      groups.push(current);
    }
    if (typeof row.proxy === 'string' && row.proxy) {
      if (!current.proxies.includes(row.proxy)) current.proxies.push(row.proxy);
    }
  }
  return groups;
}

/**
 * @returns {string}
 */
export function renderMenuChromeCensusMarkdownBlock() {
  const groups = groupSecondaryChromeProxies(
    listSecondaryChromeEntries('wide-more', buildKbLiveMenuAuditVisibility())
  );
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`listSecondaryChromeEntries`（`idleChromeOrchestration.js`）。刷新：`npm run audit:menu-chrome-census -- --write`。角落豁免见 §2.3 与 `src/core/kbLiveMenuChromeExemptions.js`。',
    '',
    '| 组 locale key | 菜单 proxy（审计最大可见集） |',
    '|---|---|'
  ];
  for (const group of groups) {
    const proxies = group.proxies.map((proxy) => `\`${proxy}\``).join(' · ');
    lines.push(`| \`${group.group}\` | ${proxies || '—'} |`);
  }
  lines.push('', END, '');
  return lines.join('\n');
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceMenuChromeCensusBlock(md) {
  const block = renderMenuChromeCensusMarkdownBlock();
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
      `MENU_CHROME_CENSUS.md missing ${BEGIN} markers and anchor "${INSERT_AFTER}"`
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
export function runMenuChromeCensusAudit({ write = false } = {}) {
  const md = readFileSync(MD_PATH, 'utf8');
  if (write) {
    writeFileSync(MD_PATH, replaceMenuChromeCensusBlock(md), 'utf8');
    console.log(
      '[audit:menu-chrome-census] wrote machine block to docs/MENU_CHROME_CENSUS.md'
    );
    return true;
  }
  const rendered = renderMenuChromeCensusMarkdownBlock();
  if (!md.includes(BEGIN) || md.indexOf(rendered) === -1) {
    console.error(
      '[audit:menu-chrome-census] docs/MENU_CHROME_CENSUS.md §2.2 machine block out of sync (run with --write)'
    );
    return false;
  }
  if (!md.includes('src/core/kbLiveMenuChromeExemptions.js')) {
    console.error(
      '[audit:menu-chrome-census] §2.3 must link src/core/kbLiveMenuChromeExemptions.js'
    );
    return false;
  }
  console.log('[audit:menu-chrome-census] OK — §2.2 matches listSecondaryChromeEntries');
  return true;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runMenuChromeCensusAudit({ write });
  if (!ok) process.exitCode = 1;
}
