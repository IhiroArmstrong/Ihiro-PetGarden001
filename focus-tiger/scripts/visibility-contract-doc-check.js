#!/usr/bin/env node
/**
 * Sync / check SHARED_RESOURCES.md §6 visibility machine block
 * against visibilityContractRegistry.js.
 *
 *   npm run visibility:doc-check
 *   npm run visibility:doc-sync
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VISIBILITY_CONTRACTS,
  VISIBILITY_SUPPRESS_TRIGGER_PATHS,
  listVisibilityLockGaps
} from '../src/core/visibilityContractRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/SHARED_RESOURCES.md');

const BEGIN = '<!-- visibility-contract:begin -->';
const END = '<!-- visibility-contract:end -->';
const INSERT_AFTER = '## 6. 双壳共享契约（窄 / 宽不变量 · 2026-07-25）';

/** @returns {string} */
export function renderVisibilityContractMarkdownBlock() {
  const gaps = listVisibilityLockGaps();
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/visibilityContractRegistry.js`。刷新：`npm run visibility:doc-sync`。',
    '> 改 `setSuppressed` / park / hide 相关源时：CI 跑 `npm run test:e2e:visibility`（整表锚点）。',
    '',
    '### 可见性契约（状态 × 视口 × 用户可见宿主）',
    '',
    '| id | state | viewport | role | must | wideSelector | narrowSelector | lockStatus | testAnchorWide | testAnchorNarrow |',
    '|---|---|---|---|---|---|---|---|---|---|'
  ];

  for (const c of VISIBILITY_CONTRACTS) {
    lines.push(
      `| \`${c.id}\` | ${c.state} | ${c.viewport} | ${c.role} | ${c.must} | ${c.wideSelector ? '`' + c.wideSelector + '`' : '—'} | ${c.narrowSelector ? '`' + c.narrowSelector + '`' : '—'} | **${c.lockStatus}** | ${c.testAnchorWide ? '`' + c.testAnchorWide + '`' : '—'} | ${c.testAnchorNarrow ? '`' + c.testAnchorNarrow + '`' : '—'} |`
    );
  }

  lines.push(
    '',
    '### 当前假绿缺口（须逐条补锚）',
    '',
    gaps.length === 0
      ? '_（无）_'
      : gaps
          .map(
            (c) =>
              `- **\`${c.id}\`** (${c.lockStatus}) — ${c.notes}`
          )
          .join('\n'),
    '',
    '### Suppress / hide 变更触发路径（CI）',
    '',
    ...VISIBILITY_SUPPRESS_TRIGGER_PATHS.map((p) => `- \`${p}\``),
    '',
    END
  );

  return `${lines.join('\n')}\n\n`;
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceVisibilityContractBlock(md) {
  const block = renderVisibilityContractMarkdownBlock();
  const start = md.indexOf(BEGIN);
  const end = md.indexOf(END);

  if (start !== -1 && end !== -1 && end >= start) {
    return (
      md.slice(0, start) + block + md.slice(end + END.length).replace(/^\n*/, '')
    );
  }

  const insertAt = md.indexOf(INSERT_AFTER);
  if (insertAt === -1) {
    throw new Error(
      `[visibility:doc-check] missing heading "${INSERT_AFTER}" in SHARED_RESOURCES.md`
    );
  }
  const afterHeading = md.indexOf('\n', insertAt);
  const pos = afterHeading === -1 ? md.length : afterHeading + 1;
  return md.slice(0, pos) + '\n' + block + md.slice(pos);
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runVisibilityContractDocCheck(opts = {}) {
  const write = Boolean(opts.write);
  const md = readFileSync(MD_PATH, 'utf8');
  const next = replaceVisibilityContractBlock(md);

  if (write) {
    writeFileSync(MD_PATH, next);
    console.log(
      '[visibility:doc-sync] OK — wrote §6 visibility machine block from registry'
    );
    return true;
  }

  if (next !== md) {
    console.error(
      '[visibility:doc-check] FAIL — SHARED_RESOURCES.md §6 machine block drifts from visibilityContractRegistry.js'
    );
    console.error('  Fix: npm run visibility:doc-sync');
    return false;
  }

  console.log(
    '[visibility:doc-check] OK — §6 machine block matches visibilityContractRegistry.js'
  );
  return true;
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const write = process.argv.includes('--write');
  const ok = runVisibilityContractDocCheck({ write });
  process.exit(ok ? 0 : 1);
}
