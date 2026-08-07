#!/usr/bin/env node
/**
 * Sync / check SHARED_RESOURCES.md §4 machine block against sessionUiGateContractRegistry.js.
 *
 *   npm run gate:doc-check   — exit 1 if committed md block differs from registry
 *   npm run gate:doc-sync    — rewrite md block from registry
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPANION_MODE_SELECT_COMMIT_OUTCOMES,
  SESSION_UI_GATE_BEHAVIOR_CONTRACTS,
  SESSION_UI_GATE_FIELDS
} from '../src/core/sessionUiGateContractRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/SHARED_RESOURCES.md');

const BEGIN = '<!-- session-ui-gate-contract:begin -->';
const END = '<!-- session-ui-gate-contract:end -->';
const INSERT_AFTER = '## 4. 门闩 / 叠层共享状态（非 storage）';

/** @returns {string} */
export function renderGateContractMarkdownBlock() {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/sessionUiGateContractRegistry.js`。刷新：`npm run gate:doc-sync`。',
    '',
    '### 门闩字段（可变态）',
    '',
    '| id | setter | readers | impact |',
    '|---|---|---|---|'
  ];

  for (const field of SESSION_UI_GATE_FIELDS) {
    lines.push(
      `| \`${field.id}\` | \`${field.setter}\` | ${field.readers} | ${field.impact} |`
    );
  }

  lines.push(
    '',
    '### 行为契约（失败即 bug）',
    '',
    '| contractId | api | when | must | testAnchor |',
    '|---|---|---|---|---|'
  );

  for (const contract of SESSION_UI_GATE_BEHAVIOR_CONTRACTS) {
    lines.push(
      `| \`${contract.id}\` | \`${contract.api}\` | ${contract.when} | ${contract.must} | \`${contract.testAnchor}\` |`
    );
  }

  lines.push(
    '',
    '### `resolveCompanionModeSelectCommit` 合法结果',
    '',
    COMPANION_MODE_SELECT_COMMIT_OUTCOMES.map((o) => `- \`${o}\``).join('\n'),
    '',
    END
  );

  return `${lines.join('\n')}\n\n`;
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceGateContractBlock(md) {
  const block = renderGateContractMarkdownBlock();
  const start = md.indexOf(BEGIN);
  const end = md.indexOf(END);

  if (start !== -1 && end !== -1 && end >= start) {
    const afterEnd = end + END.length;
    const before = md.slice(0, start).replace(/\n+$/, '');
    const after = md.slice(afterEnd).replace(/^\n+/, '');
    const normalizedBlock = block.replace(/\n+$/, '\n');
    return after
      ? `${before}\n\n${normalizedBlock}\n${after}`
      : `${before}\n\n${normalizedBlock}\n`;
  }

  const anchor = md.indexOf(INSERT_AFTER);
  if (anchor === -1) {
    throw new Error(
      `SHARED_RESOURCES.md missing ${BEGIN} markers and bootstrap anchor "${INSERT_AFTER}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return md.slice(0, insertAt) + '\n' + block + md.slice(insertAt);
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runGateContractDocCheck({ write = false } = {}) {
  const md = readFileSync(MD_PATH, 'utf8');
  const next = replaceGateContractBlock(md);

  if (write) {
    writeFileSync(MD_PATH, next, 'utf8');
    console.log(`[gate:doc-sync] updated ${MD_PATH}`);
    return true;
  }

  if (next !== md) {
    console.error(
      '[gate:doc-check] SHARED_RESOURCES.md §4 machine block is out of sync with registry.'
    );
    console.error('Run: cd focus-tiger && npm run gate:doc-sync');
    console.error('Then commit the updated docs/SHARED_RESOURCES.md machine block.');
    return false;
  }

  console.log(
    '[gate:doc-check] OK — §4 machine block matches sessionUiGateContractRegistry.js'
  );
  return true;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runGateContractDocCheck({ write });
  if (!ok && !write) process.exitCode = 1;
}
