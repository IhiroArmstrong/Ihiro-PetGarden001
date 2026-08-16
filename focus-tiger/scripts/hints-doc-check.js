#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Sync / check onboarding hint docs against onboardingHintRegistry.js.
 *
 *   npm run hints:doc-check   — exit 1 if committed md blocks differ from registry
 *   npm run hints:doc-sync    — rewrite md blocks from registry
 *
 * Checks:
 *   1) ONBOARDING_HINTS.md anchor machine block
 *   2) HINTS_WIRING.md inventory machine block (every registry id must be listed
 *      with an explicit batch cluster A–E / legacy — analyst hard gate)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ONBOARDING_HINT_REGISTRY } from '../src/core/onboardingHintRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HINTS_MD_PATH = join(ROOT, 'docs/ONBOARDING_HINTS.md');
const WIRING_MD_PATH = join(ROOT, 'docs/HINTS_WIRING.md');

const ANCHOR_BEGIN = '<!-- onboarding-hints-registry:anchors:begin -->';
const ANCHOR_END = '<!-- onboarding-hints-registry:anchors:end -->';
const ANCHOR_INSERT_AFTER = '共 **20** 个可自动提示';

const WIRING_BEGIN = '<!-- hints-wiring-registry:inventory:begin -->';
const WIRING_END = '<!-- hints-wiring-registry:inventory:end -->';

/**
 * Batch cluster for HINTS_WIRING (HINTS_WIRING.md §五).
 * Every registry id MUST appear here — new tip without a cluster → docs:check fails.
 * @type {Readonly<Record<string, 'A' | 'B' | 'C' | 'D' | 'E' | 'legacy'>>}
 */
export const HINT_WIRING_BATCH_CLUSTER = Object.freeze({
  'dormant-open': 'legacy',
  'honesty-optional': 'A',
  'honesty-bridge': 'B',
  'sit-button': 'A',
  'quick-start': 'A',
  'how-shall-we-sit': 'A',
  notice: 'B',
  breathing: 'B',
  choose: 'B',
  'companion-mode': 'B',
  'companion-stay': 'B',
  'companion-away': 'B',
  'companion-across-tools': 'B',
  'ambient-gated': 'C',
  'ambient-soundscape': 'C',
  'rise-button': 'D',
  reflection: 'B',
  'idle-after-session': 'A',
  'weekly-heatmap': 'C',
  'language-preference': 'C',
  'in-app-reminder': 'C',
  'micro-ritual': 'C',
  'focus-hud-ring': 'D',
  'focus-hud-progress': 'D',
  'focus-hud-streak': 'D',
  'narrow-drawer-menu': 'C',
  'wide-more-menu': 'C',
  'help-affordance': 'E',
  'help-remedy': 'E',
  'help-fallback': 'E'
});

/**
 * @param {'A' | 'B' | 'C' | 'D' | 'E' | 'legacy'} cluster
 * @returns {string[]}
 */
export function listHintIdsForWiringCluster(cluster) {
  return Object.entries(HINT_WIRING_BATCH_CLUSTER)
    .filter(([, c]) => c === cluster)
    .map(([id]) => id)
    .sort();
}

/** @returns {string} */
export function renderHintsAnchorMarkdownBlock() {
  const lines = [
    ANCHOR_BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`src/core/onboardingHintRegistry.js`。刷新：`npm run hints:doc-sync`。',
    '',
    '| hintId | localeKey | triggerMode | tier | selector | placement | tip | anchorGroup |',
    '|---|---|---|---|---|---|---|---|'
  ];

  for (const entry of ONBOARDING_HINT_REGISTRY) {
    const { id, localeKey, triggerMode, tier, anchor, anchorGroup } = entry;
    const group = anchorGroup ?? '';
    const tierCell = tier ? `\`${tier}\`` : '—';
    lines.push(
      `| \`${id}\` | \`${localeKey}\` | \`${triggerMode}\` | ${tierCell} | \`${anchor.selector}\` | ${anchor.placement} | ${anchor.tip} | ${group ? `\`${group}\`` : '—'} |`
    );
  }

  lines.push('', ANCHOR_END);
  return `${lines.join('\n')}\n\n`;
}

/**
 * @returns {{ ok: boolean, missingCluster: string[], unknownCluster: string[] }}
 */
export function validateHintWiringClusters() {
  const missingCluster = [];
  const unknownCluster = [];
  const registryIds = new Set(ONBOARDING_HINT_REGISTRY.map((e) => e.id));

  for (const id of registryIds) {
    if (!Object.prototype.hasOwnProperty.call(HINT_WIRING_BATCH_CLUSTER, id)) {
      missingCluster.push(id);
    }
  }
  for (const id of Object.keys(HINT_WIRING_BATCH_CLUSTER)) {
    if (!registryIds.has(id)) unknownCluster.push(id);
  }

  missingCluster.sort();
  unknownCluster.sort();
  return {
    ok: missingCluster.length === 0 && unknownCluster.length === 0,
    missingCluster,
    unknownCluster
  };
}

/** @returns {string} */
export function renderHintsWiringInventoryMarkdownBlock() {
  const clusterCheck = validateHintWiringClusters();
  if (!clusterCheck.ok) {
    const parts = [];
    if (clusterCheck.missingCluster.length) {
      parts.push(
        `missing HINT_WIRING_BATCH_CLUSTER: ${clusterCheck.missingCluster.join(', ')}`
      );
    }
    if (clusterCheck.unknownCluster.length) {
      parts.push(
        `unknown ids in HINT_WIRING_BATCH_CLUSTER: ${clusterCheck.unknownCluster.join(', ')}`
      );
    }
    throw new Error(
      `[hints-wiring] cluster map out of sync with registry (${parts.join('; ')}). Update scripts/hints-doc-check.js HINT_WIRING_BATCH_CLUSTER.`
    );
  }

  const lines = [
    WIRING_BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`onboardingHintRegistry.js` + `HINT_WIRING_BATCH_CLUSTER`（`scripts/hints-doc-check.js`）。刷新：`npm run hints:doc-sync`。',
    '> 硬闸：registry 每条 hint 必须出现在本表；新增 tip 须同时改 cluster 映射，否则 `docs:check` 失败。',
    '',
    '| hintId | triggerMode | batchCluster |',
    '|---|---|---|'
  ];

  for (const entry of ONBOARDING_HINT_REGISTRY) {
    const cluster = HINT_WIRING_BATCH_CLUSTER[entry.id];
    lines.push(
      `| \`${entry.id}\` | \`${entry.triggerMode}\` | **${cluster}** |`
    );
  }

  lines.push('', WIRING_END);
  return `${lines.join('\n')}\n\n`;
}

/**
 * @param {string} md
 * @param {string} begin
 * @param {string} end
 * @param {string} block
 * @param {string} [bootstrapNeedle]
 * @returns {string}
 */
function replaceMarkedBlock(md, begin, end, block, bootstrapNeedle) {
  const start = md.indexOf(begin);
  const endIdx = md.indexOf(end);

  if (start !== -1 && endIdx !== -1 && endIdx >= start) {
    const afterEnd = endIdx + end.length;
    const before = md.slice(0, start).replace(/\n+$/, '');
    const after = md.slice(afterEnd).replace(/^\n+/, '');
    const normalizedBlock = block.replace(/\n+$/, '\n');
    return after
      ? `${before}\n\n${normalizedBlock}\n${after}`
      : `${before}\n\n${normalizedBlock}\n`;
  }

  if (!bootstrapNeedle) {
    throw new Error(`Missing ${begin} markers and no bootstrap needle`);
  }
  const anchor = md.indexOf(bootstrapNeedle);
  if (anchor === -1) {
    throw new Error(
      `Missing ${begin} markers and bootstrap anchor "${bootstrapNeedle}"`
    );
  }
  const lineEnd = md.indexOf('\n', anchor);
  const insertAt = lineEnd === -1 ? md.length : lineEnd + 1;
  return md.slice(0, insertAt) + '\n' + block + md.slice(insertAt);
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceAnchorBlock(md) {
  return replaceMarkedBlock(
    md,
    ANCHOR_BEGIN,
    ANCHOR_END,
    renderHintsAnchorMarkdownBlock(),
    ANCHOR_INSERT_AFTER
  );
}

/**
 * @param {string} md
 * @returns {string}
 */
export function replaceWiringInventoryBlock(md) {
  return replaceMarkedBlock(
    md,
    WIRING_BEGIN,
    WIRING_END,
    renderHintsWiringInventoryMarkdownBlock(),
    '## 九、变更记录'
  );
}

/**
 * @param {{ write?: boolean }} [opts]
 * @returns {boolean} true if already in sync (check mode)
 */
export function runHintsDocCheck({ write = false } = {}) {
  const clusterCheck = validateHintWiringClusters();
  if (!clusterCheck.ok) {
    if (clusterCheck.missingCluster.length) {
      console.error(
        '[hints-wiring] registry ids missing HINT_WIRING_BATCH_CLUSTER:',
        clusterCheck.missingCluster.join(', ')
      );
    }
    if (clusterCheck.unknownCluster.length) {
      console.error(
        '[hints-wiring] HINT_WIRING_BATCH_CLUSTER has unknown ids:',
        clusterCheck.unknownCluster.join(', ')
      );
    }
    console.error(
      'Update focus-tiger/scripts/hints-doc-check.js HINT_WIRING_BATCH_CLUSTER, then npm run hints:doc-sync.'
    );
    return false;
  }

  const hintsMd = readFileSync(HINTS_MD_PATH, 'utf8');
  const wiringMd = readFileSync(WIRING_MD_PATH, 'utf8');
  const nextHints = replaceAnchorBlock(hintsMd);
  let nextWiring;
  try {
    nextWiring = replaceWiringInventoryBlock(wiringMd);
  } catch (err) {
    console.error(String(err?.message || err));
    return false;
  }

  if (write) {
    writeFileSync(HINTS_MD_PATH, nextHints, 'utf8');
    writeFileSync(WIRING_MD_PATH, nextWiring, 'utf8');
    console.log(`[hints:doc-sync] updated ${HINTS_MD_PATH}`);
    console.log(`[hints:doc-sync] updated ${WIRING_MD_PATH}`);
    return true;
  }

  let ok = true;
  if (nextHints !== hintsMd) {
    console.error(
      '[hints:doc-check] ONBOARDING_HINTS.md anchor block is out of sync with registry.'
    );
    console.error('Run: cd focus-tiger && npm run hints:doc-sync');
    ok = false;
  } else {
    console.log(
      '[hints:doc-check] OK — anchor block matches onboardingHintRegistry.js'
    );
  }

  if (nextWiring !== wiringMd) {
    console.error(
      '[hints:doc-check] HINTS_WIRING.md inventory block is out of sync with registry/cluster map.'
    );
    console.error('Run: cd focus-tiger && npm run hints:doc-sync');
    ok = false;
  } else {
    console.log(
      '[hints:doc-check] OK — HINTS_WIRING inventory matches registry + batch clusters'
    );
  }

  return ok;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runHintsDocCheck({ write });
  if (!ok && !write) process.exitCode = 1;
}
