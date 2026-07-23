#!/usr/bin/env node
/**
 * Sync / check ONBOARDING_HINTS.md machine anchor block against onboardingHintRegistry.js.
 *
 *   npm run hints:doc-check   — exit 1 if committed md block differs from registry
 *   npm run hints:doc-sync    — rewrite md block from registry
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ONBOARDING_HINT_REGISTRY } from '../src/core/onboardingHintRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD_PATH = join(ROOT, 'docs/ONBOARDING_HINTS.md');

const BEGIN = '<!-- onboarding-hints-registry:anchors:begin -->';
const END = '<!-- onboarding-hints-registry:anchors:end -->';
const INSERT_AFTER = '共 **20** 个可自动提示';

/** @returns {string} */
export function renderHintsAnchorMarkdownBlock() {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/onboardingHintRegistry.js`。刷新：`npm run hints:doc-sync`。',
    '',
    '| hintId | localeKey | triggerMode | selector | placement | tip | anchorGroup |',
    '|---|---|---|---|---|---|---|'
  ];

  for (const entry of ONBOARDING_HINT_REGISTRY) {
    const { id, localeKey, triggerMode, anchor, anchorGroup } = entry;
    const group = anchorGroup ?? '';
    lines.push(
      `| \`${id}\` | \`${localeKey}\` | \`${triggerMode}\` | \`${anchor.selector}\` | ${anchor.placement} | ${anchor.tip} | ${group ? `\`${group}\`` : '—'} |`
    );
  }

  lines.push('', END);
  return `${lines.join('\n')}\n\n`;
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceAnchorBlock(md) {
  const block = renderHintsAnchorMarkdownBlock();
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
      `ONBOARDING_HINTS.md missing ${BEGIN} markers and bootstrap anchor "${INSERT_AFTER}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return md.slice(0, insertAt) + '\n' + block + md.slice(insertAt);
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean} true if already in sync (check mode)
 */
export function runHintsDocCheck({ write = false } = {}) {
  const md = readFileSync(MD_PATH, 'utf8');
  const next = replaceAnchorBlock(md);

  if (write) {
    writeFileSync(MD_PATH, next, 'utf8');
    console.log(`[hints:doc-sync] updated ${MD_PATH}`);
    return true;
  }

  if (next !== md) {
    console.error('[hints:doc-check] ONBOARDING_HINTS.md anchor block is out of sync with registry.');
    console.error('Run: cd focus-tiger && npm run hints:doc-sync');
    console.error('Then commit the updated docs/ONBOARDING_HINTS.md anchor block.');
    return false;
  }

  console.log('[hints:doc-check] OK — anchor block matches onboardingHintRegistry.js');
  return true;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runHintsDocCheck({ write });
  if (!ok && !write) process.exitCode = 1;
}
