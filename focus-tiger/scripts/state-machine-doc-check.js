#!/usr/bin/env node
/**
 * Sync / check ARCHITECTURE.md state-machine block against StateManager.js.
 *
 *   npm run state:doc-check   — exit 1 if committed md block differs from code
 *   npm run state:doc-sync    — rewrite md block from StateManager
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LEGAL_STATE_TRANSITIONS,
  STATES
} from '../src/core/StateManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/ARCHITECTURE.md');

const BEGIN = '<!-- state-machine-contract:begin -->';
const END = '<!-- state-machine-contract:end -->';
const DATAFLOW_TAIL =
  'TransitionFX单独处理"切换瞬间"的一次性过场，不长期持有状态';

/** @returns {string} */
function formatProductPathSummary() {
  const idle = STATES.IDLE;
  const focusing = STATES.FOCUSING;
  const celebrate = STATES.CELEBRATE;
  const dormant = STATES.DORMANT;
  return `\`${idle} ↔ ${dormant}\`、\`${idle} → ${focusing} → ${celebrate}|${idle}\`、\`${celebrate} → ${idle}\``;
}

/** @returns {string} */
export function renderStateMachineMarkdownBlock() {
  const stateRows = Object.entries(STATES)
    .map(([key, value]) => `| \`${key}\` | \`${value}\` |`)
    .join('\n');

  const transitionRows = Object.keys(STATES)
    .map((stateKey) => {
      const from = STATES[stateKey];
      const allowed = LEGAL_STATE_TRANSITIONS[from] ?? [];
      const targets =
        allowed.length > 0
          ? allowed.map((t) => `\`${t}\``).join(', ')
          : '—';
      return `| \`${from}\` | ${targets} |`;
    })
    .join('\n');

  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/StateManager.js`（`STATES` + `LEGAL_STATE_TRANSITIONS`）。刷新：`npm run state:doc-sync`。',
    '',
    '合法转移（产品路径）：' + formatProductPathSummary() + '。',
    '',
    '`setState` **不阻断**非法转移，但 `console.warn`（`LEGAL_STATE_TRANSITIONS`）。`BREAK` 已从枚举删除（无生产路径）。边角观察：`docs/EDGE_CASES.md`。',
    '',
    '### `STATES`',
    '',
    '| enum key | value |',
    '|---|---|',
    stateRows,
    '',
    '### `LEGAL_STATE_TRANSITIONS`',
    '',
    '| from | allowed next |',
    '|---|---|',
    transitionRows,
    '',
    END
  ];

  return `${lines.join('\n')}\n`;
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceStateMachineBlock(md) {
  const block = renderStateMachineMarkdownBlock();
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

  const anchor = md.indexOf(DATAFLOW_TAIL);
  if (anchor === -1) {
    throw new Error(
      `ARCHITECTURE.md missing ${BEGIN} markers and bootstrap anchor "${DATAFLOW_TAIL}"`
    );
  }
  const closeFence = md.indexOf('```', anchor);
  if (closeFence === -1) {
    throw new Error('ARCHITECTURE.md data-flow fence not closed before bootstrap');
  }
  const insertAt = closeFence + 3;
  return md.slice(0, insertAt) + '\n\n' + block + md.slice(insertAt);
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean}
 */
export function runStateMachineDocCheck({ write = false } = {}) {
  const md = readFileSync(MD_PATH, 'utf8');
  const next = replaceStateMachineBlock(md);

  if (write) {
    writeFileSync(MD_PATH, next, 'utf8');
    console.log(`[state:doc-sync] updated ${MD_PATH}`);
    return true;
  }

  if (next !== md) {
    console.error(
      '[state:doc-check] ARCHITECTURE.md state-machine block is out of sync with StateManager.js.'
    );
    console.error('Run: cd focus-tiger && npm run state:doc-sync');
    console.error('Then commit the updated docs/ARCHITECTURE.md machine block.');
    return false;
  }

  console.log(
    '[state:doc-check] OK — state-machine block matches StateManager.js'
  );
  return true;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runStateMachineDocCheck({ write });
  if (!ok && !write) process.exitCode = 1;
}
