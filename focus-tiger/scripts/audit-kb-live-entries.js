#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * KB scaled production · Step 1 static live-entry audit.
 *
 *   npm run audit:kb-live-entries        — exit 1 on registry / locale / menu drift
 *   npm run audit:kb-live-entries -- --write  — refresh kb-live-entry-registry.md machine block
 *
 * @see docs/task-briefs/task-kb-scaled-production.md
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  listAllKbLiveEntryRows,
  listKbLiveMenuProxyRows
} from '../src/core/kbLiveEntryRegistry.js';
import { listSecondaryChromeEntries } from '../src/core/idleChromeOrchestration.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/kb-live-entry-registry.md');
const EN_LOCALE_PATH = join(ROOT, 'src/locales/en.json');

const BEGIN = '<!-- kb-live-entry-registry:begin -->';
const END = '<!-- kb-live-entry-registry:end -->';
const INSERT_AFTER = '## Live entry registry (machine block)';

/**
 * @param {Record<string, string>} dict
 * @param {string} key
 * @returns {string | undefined}
 */
export function resolveLocaleKey(dict, key) {
  if (dict[key] != null && dict[key] !== '') return dict[key];
  return undefined;
}

/**
 * @param {import('../src/core/kbLiveEntryRegistry.js').KbLiveEntryRow} row
 * @param {Record<string, string>} en
 * @returns {string[]}
 */
export function findMissingLocaleKeys(row, en) {
  return row.labelKeys.filter((key) => !resolveLocaleKey(en, key));
}

/**
 * @param {import('../src/core/kbLiveEntryRegistry.js').KbLiveEntryRow} row
 * @param {string} moduleSrc
 * @returns {string[]}
 */
export function findMissingCodeAnchors(row, moduleSrc) {
  return row.codeAnchors.filter((anchor) => !moduleSrc.includes(anchor));
}

/**
 * @param {string} relPath
 * @param {Map<string, string>} cache
 * @returns {string}
 */
function readModule(relPath, cache) {
  if (cache.has(relPath)) return cache.get(relPath);
  const abs = join(ROOT, relPath);
  const src = readFileSync(abs, 'utf8');
  cache.set(relPath, src);
  return src;
}

/**
 * Visibility that surfaces every optional menu row for proxy cross-check.
 * @returns {import('../src/core/idleChromeOrchestration.js').SecondaryEntryVisibility}
 */
export function buildKbLiveMenuAuditVisibility() {
  return {
    microRitualVisible: true,
    companionVisible: true,
    companionEnabled: true,
    reminderAvailable: true,
    confideUserVisible: true,
    yinCoinVisible: true,
    mustardSeedSealUnlocked: true,
    scenesEntitled: true,
    newsletterSubmitted: false
  };
}

/**
 * @param {readonly import('../src/core/kbLiveEntryRegistry.js').KbLiveEntryRow[]} registryRows
 * @param {readonly import('../src/core/idleChromeOrchestration.js').SecondaryChromeEntry[]} menuRows
 * @returns {{ missingFromMenu: string[], extraInMenu: string[] }}
 */
export function diffMenuProxyCoverage(registryRows, menuRows) {
  const registryProxies = new Set(
    registryRows
      .map((row) => row.proxy)
      .filter((proxy) => typeof proxy === 'string')
  );
  const menuProxies = new Set(
    menuRows
      .map((row) => row.proxy)
      .filter((proxy) => typeof proxy === 'string')
  );

  const optionalProxies = new Set([
    'companion',
    'reminder',
    'language',
    'yin-coin',
    'confide',
    'mustard-seed-seal',
    'newsletter',
    'account'
  ]);

  const missingFromMenu = [...registryProxies].filter(
    (proxy) => !menuProxies.has(proxy) && !optionalProxies.has(proxy)
  );
  const extraInMenu = [...menuProxies].filter(
    (proxy) => !registryProxies.has(proxy) && !optionalProxies.has(proxy)
  );

  return { missingFromMenu, extraInMenu };
}

/**
 * @returns {string}
 */
export function renderKbLiveEntryRegistryMarkdownBlock() {
  const rows = listAllKbLiveEntryRows();
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/kbLiveEntryRegistry.js`。刷新：`npm run audit:kb-live-entries -- --write`。',
    '',
    `**Row count**: ${rows.length} (${rows.filter((r) => r.surface === 'menu' || r.surface === 'ritual').length} menu/ritual · ${rows.filter((r) => r.surface === 'home-ball').length} home-ball · ${rows.filter((r) => r.surface === 'hud').length} hud)`,
    '',
    '| id | surface | proxy | liveStatus | menuPath | labelKeys | catalogKbIds |',
    '|---|---|---|---|---|---|---|'
  ];

  for (const row of rows) {
    const keys = row.labelKeys.map((k) => `\`${k}\``).join(' ');
    const kb =
      row.catalogKbIds?.map((id) => `\`${id}\``).join(' ') ?? '—';
    const path = row.menuPath.replace(/\|/g, '\\|');
    lines.push(
      `| \`${row.id}\` | ${row.surface} | ${row.proxy ? `\`${row.proxy}\`` : '—'} | ${row.liveStatus} | ${path} | ${keys} | ${kb} |`
    );
  }

  lines.push('', END, '');
  return lines.join('\n');
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceKbLiveEntryRegistryBlock(md) {
  const block = renderKbLiveEntryRegistryMarkdownBlock();
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
      `kb-live-entry-registry.md missing ${BEGIN} markers and anchor "${INSERT_AFTER}"`
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
export function runKbLiveEntryAudit({ write = false } = {}) {
  let ok = true;
  const en = JSON.parse(readFileSync(EN_LOCALE_PATH, 'utf8'));
  /** @type {Map<string, string>} */
  const moduleCache = new Map();

  for (const row of listAllKbLiveEntryRows()) {
    const missingKeys = findMissingLocaleKeys(row, en);
    if (missingKeys.length > 0) {
      console.error(
        `[audit:kb-live-entries] ${row.id}: missing en locale keys: ${missingKeys.join(', ')}`
      );
      ok = false;
    }

    const srcSources = row.authoritativeSources.filter((relPath) =>
      relPath.startsWith('src/')
    );
    for (const relPath of row.authoritativeSources) {
      if (!relPath.startsWith('src/') && !relPath.startsWith('docs/')) continue;
      const abs = join(ROOT, relPath);
      if (!existsSync(abs)) {
        console.error(
          `[audit:kb-live-entries] ${row.id}: authoritative source missing: ${relPath}`
        );
        ok = false;
      }
    }
    if (row.codeAnchors.length > 0 && srcSources.length > 0) {
      for (const anchor of row.codeAnchors) {
        const found = srcSources.some((relPath) =>
          readModule(relPath, moduleCache).includes(anchor)
        );
        if (!found) {
          console.error(
            `[audit:kb-live-entries] ${row.id}: code anchor missing from authoritative src files: ${anchor}`
          );
          ok = false;
        }
      }
    }

    if (row.gate?.moduleRelPath) {
      const gatePath = row.gate.moduleRelPath;
      const gateAbs = join(ROOT, gatePath);
      if (!existsSync(gateAbs)) {
        console.error(
          `[audit:kb-live-entries] ${row.id}: gate module missing: ${gatePath}`
        );
        ok = false;
      } else if (row.gate.anchor) {
        const gateSrc = readModule(gatePath, moduleCache);
        if (!gateSrc.includes(row.gate.anchor)) {
          console.error(
            `[audit:kb-live-entries] ${row.id}: gate anchor missing in ${gatePath}: ${row.gate.anchor}`
          );
          ok = false;
        }
      }
    }
  }

  const menuRows = listSecondaryChromeEntries(
    'wide-more',
    buildKbLiveMenuAuditVisibility()
  );
  const { missingFromMenu, extraInMenu } = diffMenuProxyCoverage(
    listKbLiveMenuProxyRows(),
    menuRows
  );
  if (missingFromMenu.length > 0) {
    console.error(
      `[audit:kb-live-entries] registry proxies missing from wide-more menu: ${missingFromMenu.join(', ')}`
    );
    ok = false;
  }
  if (extraInMenu.length > 0) {
    console.error(
      `[audit:kb-live-entries] wide-more menu proxies missing from registry: ${extraInMenu.join(', ')}`
    );
    ok = false;
  }

  const orchestrationSrc = readModule(
    'src/core/idleChromeOrchestration.js',
    moduleCache
  );
  for (const row of listKbLiveMenuProxyRows()) {
    if (!row.proxy || row.surface === 'ritual') continue;
    const proxyAnchor = `proxy: '${row.proxy}'`;
    if (!orchestrationSrc.includes(proxyAnchor)) {
      console.error(
        `[audit:kb-live-entries] ${row.id}: proxy anchor missing in idleChromeOrchestration.js: ${proxyAnchor}`
      );
      ok = false;
    }
  }

  if (write) {
    const md = readFileSync(MD_PATH, 'utf8');
    writeFileSync(MD_PATH, replaceKbLiveEntryRegistryBlock(md), 'utf8');
    console.log('[audit:kb-live-entries] wrote machine block to docs/kb-live-entry-registry.md');
  } else {
    const md = readFileSync(MD_PATH, 'utf8');
    const rendered = renderKbLiveEntryRegistryMarkdownBlock();
    if (!md.includes(BEGIN) || md.indexOf(rendered) === -1) {
      console.error(
        '[audit:kb-live-entries] docs/kb-live-entry-registry.md machine block out of sync (run with --write)'
      );
      ok = false;
    }
  }

  if (ok) {
    console.log(
      `[audit:kb-live-entries] OK — ${listAllKbLiveEntryRows().length} live entries; menu proxy cross-check passed`
    );
  }

  return ok;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runKbLiveEntryAudit({ write });
  if (!ok) process.exitCode = 1;
}
