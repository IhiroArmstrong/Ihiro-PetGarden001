#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * KB scaled production · Step 2 live-entry vs approved catalog gap audit.
 *
 *   npm run audit:kb-live-gap           — exit 1 on markdown drift / integrity errors
 *   npm run audit:kb-live-gap -- --write — refresh docs/kb-live-gap-audit.md machine block
 *
 * Gaps are expected output (not CI failures). CI only fails when the machine block
 * is out of sync with computed results.
 *
 * @see docs/task-briefs/task-kb-scaled-production.md §七 step 2
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listAllKbLiveEntryRows } from '../src/core/kbLiveEntryRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CATALOG_PATH = join(ROOT, 'src/core/confide/productKnowledgeCatalog.json');
const MD_PATH = join(ROOT, 'docs/kb-live-gap-audit.md');

const BEGIN = '<!-- kb-live-gap-audit:begin -->';
const END = '<!-- kb-live-gap-audit:end -->';
const INSERT_AFTER = '## Gap audit (machine block)';

/** Draft / unapproved ids documented in product-knowledge-base.md §4.2 */
export const KB_UNAPPROVED_IDS = Object.freeze([
  'KB-FUNC-0006',
  'KB-FUNC-0009'
]);

/**
 * Expected approved catalog links per live row (locale / menu SSOT alignment).
 * Cross-cutting approved rows (0014 / 0016 / 0017) intentionally have no live row.
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const KB_CANONICAL_LIVE_APPROVED_MAP = Object.freeze({
  'kb-live-sit': Object.freeze(['KB-FUNC-0001']),
  'kb-live-rise': Object.freeze(['KB-FUNC-0007']),
  'kb-live-breath': Object.freeze(['KB-FUNC-0011']),
  'kb-live-companion': Object.freeze(['KB-FUNC-0008']),
  'kb-live-ground': Object.freeze(['KB-FUNC-0002']),
  'kb-live-journey-log': Object.freeze(['KB-FUNC-0012']),
  'kb-live-presence-signals': Object.freeze(['KB-FUNC-0013']),
  'kb-live-yin-coin': Object.freeze(['KB-FUNC-0018']),
  'kb-live-confide': Object.freeze(['KB-FUNC-0010', 'KB-FUNC-0005']),
  'kb-live-local-backup': Object.freeze(['KB-FUNC-0003', 'KB-FUNC-0015']),
  'kb-live-hud-progress': Object.freeze(['KB-FUNC-0004']),
  'kb-live-five-moments': Object.freeze(['KB-FUNC-0019']),
  'kb-live-honesty': Object.freeze(['KB-FUNC-0020']),
  'kb-live-daily-quote': Object.freeze(['KB-FUNC-0021']),
  'kb-live-zen-cinema': Object.freeze(['KB-FUNC-0022']),
  'kb-live-wallpapers': Object.freeze(['KB-FUNC-0023']),
  'kb-live-ritual-morning': Object.freeze(['KB-FUNC-0024']),
  'kb-live-ritual-emotional-reset': Object.freeze(['KB-FUNC-0025']),
  'kb-live-ritual-work-transition': Object.freeze(['KB-FUNC-0026']),
  'kb-live-quiet-together': Object.freeze(['KB-FUNC-0027']),
  'kb-live-focus-circle': Object.freeze(['KB-FUNC-0028']),
  'kb-live-today-direction': Object.freeze(['KB-FUNC-0029']),
  'kb-live-sanctuary-nav': Object.freeze(['KB-FUNC-0030']),
  'kb-live-community': Object.freeze(['KB-FUNC-0031']),
  'kb-live-membership': Object.freeze(['KB-FUNC-0032'])
});

/** Approved catalog rows with no dedicated live surface (behavior / platform / concept facts). */
export const KB_CROSS_CUTTING_APPROVED_IDS = Object.freeze([
  'KB-FUNC-0014',
  'KB-FUNC-0016',
  'KB-FUNC-0017',
  'KB-EDU-0001',
  'KB-EDU-0002',
  'KB-EDU-0003',
  'KB-EDU-0004'
]);

/**
 * @returns {readonly string[]}
 */
export function loadApprovedCatalogIds() {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  return Object.freeze(
    catalog.entries.map((entry) => entry.id).sort((a, b) => a.localeCompare(b))
  );
}

/**
 * @param {readonly string[] | undefined} ids
 * @returns {readonly string[]}
 */
function normalizeIds(ids) {
  return Object.freeze([...(ids ?? [])].sort((a, b) => a.localeCompare(b)));
}

/**
 * @param {readonly string[]} a
 * @param {readonly string[]} b
 * @returns {boolean}
 */
function sameIdSet(a, b) {
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

/**
 * @returns {KbLiveGapReport}
 */
export function computeKbLiveGapReport() {
  const approvedIds = new Set(loadApprovedCatalogIds());
  const liveRows = listAllKbLiveEntryRows();

  /** @type {KbLiveGapRow[]} */
  const liveSurfaceWithoutApprovedKb = [];
  /** @type {KbRegistryDriftRow[]} */
  const registryMappingDrift = [];
  /** @type {KbRegistryDriftRow[]} */
  const registryLinksUnapproved = [];
  /** @type {KbBatch2CandidateRow[]} */
  const batch2Candidates = [];

  for (const row of liveRows) {
    const registryIds = normalizeIds(row.catalogKbIds);
    const canonicalIds = normalizeIds(KB_CANONICAL_LIVE_APPROVED_MAP[row.id]);
    const approvedLinked = registryIds.filter((id) => approvedIds.has(id));
    const unapprovedLinked = registryIds.filter((id) => !approvedIds.has(id));

    if (unapprovedLinked.length > 0) {
      registryLinksUnapproved.push({
        liveId: row.id,
        menuPath: row.menuPath,
        liveStatus: row.liveStatus,
        registryKbIds: registryIds,
        unapprovedKbIds: unapprovedLinked
      });
    }

    if (canonicalIds.length > 0 && !sameIdSet(registryIds, canonicalIds)) {
      registryMappingDrift.push({
        liveId: row.id,
        menuPath: row.menuPath,
        liveStatus: row.liveStatus,
        registryKbIds: registryIds,
        canonicalKbIds: canonicalIds
      });
    }

    const hasApprovedCoverage =
      approvedLinked.length > 0 ||
      canonicalIds.some((id) => approvedIds.has(id));

    if (!hasApprovedCoverage) {
      if (
        row.liveStatus === 'live' ||
        row.liveStatus === 'gated-default-on' ||
        row.liveStatus === 'entitlement-gated'
      ) {
        batch2Candidates.push({
          liveId: row.id,
          menuPath: row.menuPath,
          liveStatus: row.liveStatus,
          labelKeys: row.labelKeys,
          reason: 'live surface with no approved KB-FUNC link'
        });
      } else {
        liveSurfaceWithoutApprovedKb.push({
          liveId: row.id,
          menuPath: row.menuPath,
          liveStatus: row.liveStatus,
          labelKeys: row.labelKeys,
          note:
            row.liveStatus === 'gated-default-off'
              ? 'gated off by default — draft only after PO re-opens user mount'
              : 'conditional / optional surface — draft after PO confirms scope'
        });
      }
    }
  }

  const approvedWithoutLiveSurface = [...approvedIds].filter(
    (id) =>
      !KB_CROSS_CUTTING_APPROVED_IDS.includes(id) &&
      !Object.values(KB_CANONICAL_LIVE_APPROVED_MAP).some((linked) =>
        linked.includes(id)
      )
  );

  return Object.freeze({
    generatedAt: new Date().toISOString().slice(0, 10),
    liveRowCount: liveRows.length,
    approvedCatalogCount: approvedIds.size,
    approvedCatalogIds: [...approvedIds],
    crossCuttingApprovedIds: [...KB_CROSS_CUTTING_APPROVED_IDS],
    liveSurfaceWithoutApprovedKb,
    registryMappingDrift,
    registryLinksUnapproved,
    batch2Candidates,
    approvedWithoutLiveSurface
  });
}

/**
 * @param {KbLiveGapReport} report
 * @returns {string}
 */
export function renderKbLiveGapAuditMarkdownBlock(report) {
  const lines = [
    BEGIN,
    '',
    '> **机器块 · 勿手改**。真源：`scripts/audit-kb-live-gap.js` + `kbLiveEntryRegistry.js` + `productKnowledgeCatalog.json`。刷新：`npm run audit:kb-live-gap -- --write`。',
    '',
    `**Snapshot**: ${report.generatedAt} · ${report.liveRowCount} live rows · ${report.approvedCatalogCount} approved catalog ids`,
    '',
    '### Summary counts',
    '',
    '| bucket | count | next step |',
    '|---|---:|---|',
    `| batch-2 live-surface candidates | ${report.batch2Candidates.length} | Step 4 authoritative draft → PO tone spot-check |`,
    `| registry mapping drift | ${report.registryMappingDrift.length} | fix \`catalogKbIds\` on registry rows (docs-only) |`,
    `| registry links unapproved | ${report.registryLinksUnapproved.length} | swap to approved ids or wait for PO on 0006/0009 |`,
    `| conditional/gated-off without approved KB | ${report.liveSurfaceWithoutApprovedKb.length} | PO scope before drafting |`,
    `| cross-cutting approved (no live row) | ${report.crossCuttingApprovedIds.length} | keep as behavior/platform facts |`,
    '',
    '### Batch-2 candidates (live · default-on · entitlement-gated · no approved link)',
    '',
    '| liveId | liveStatus | menuPath | labelKeys |',
    '|---|---|---|---|'
  ];

  for (const row of report.batch2Candidates) {
    const keys = row.labelKeys.map((k) => `\`${k}\``).join(' ');
    lines.push(
      `| \`${row.liveId}\` | ${row.liveStatus} | ${row.menuPath.replace(/\|/g, '\\|')} | ${keys} |`
    );
  }

  lines.push(
    '',
    '### Registry mapping drift (registry `catalogKbIds` ≠ canonical approved map)',
    '',
    '| liveId | liveStatus | registryKbIds | canonicalKbIds |',
    '|---|---|---|---|'
  );

  for (const row of report.registryMappingDrift) {
    const registry = row.registryKbIds.map((id) => `\`${id}\``).join(' ') || '—';
    const canonical =
      row.canonicalKbIds.map((id) => `\`${id}\``).join(' ') || '—';
    lines.push(
      `| \`${row.liveId}\` | ${row.liveStatus} | ${registry} | ${canonical} |`
    );
  }

  lines.push(
    '',
    '### Registry links to unapproved ids',
    '',
    '| liveId | liveStatus | registryKbIds | unapprovedKbIds |',
    '|---|---|---|---|'
  );

  for (const row of report.registryLinksUnapproved) {
    const registry = row.registryKbIds.map((id) => `\`${id}\``).join(' ') || '—';
    const unapproved =
      row.unapprovedKbIds.map((id) => `\`${id}\``).join(' ') || '—';
    lines.push(
      `| \`${row.liveId}\` | ${row.liveStatus} | ${registry} | ${unapproved} |`
    );
  }

  lines.push(
    '',
    '### Conditional / gated-off surfaces (no approved KB yet)',
    '',
    '| liveId | liveStatus | menuPath | note |',
    '|---|---|---|---|'
  );

  for (const row of report.liveSurfaceWithoutApprovedKb) {
    lines.push(
      `| \`${row.liveId}\` | ${row.liveStatus} | ${row.menuPath.replace(/\|/g, '\\|')} | ${row.note} |`
    );
  }

  lines.push(
    '',
    '### Cross-cutting approved catalog rows (no live row required)',
    '',
    report.crossCuttingApprovedIds.map((id) => `- \`${id}\``).join('\n'),
    '',
    END,
    ''
  );

  return lines.join('\n');
}

/**
 * @param {string} md
 * @param {KbLiveGapReport} report
 * @returns {string}
 */
export function replaceKbLiveGapAuditBlock(md, report) {
  const block = renderKbLiveGapAuditMarkdownBlock(report);
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
      `kb-live-gap-audit.md missing ${BEGIN} markers and anchor "${INSERT_AFTER}"`
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
export function runKbLiveGapAudit({ write = false } = {}) {
  let ok = true;
  const report = computeKbLiveGapReport();

  if (!existsSync(CATALOG_PATH)) {
    console.error('[audit:kb-live-gap] missing productKnowledgeCatalog.json');
    return false;
  }

  if (report.approvedWithoutLiveSurface.length > 0) {
    console.error(
      `[audit:kb-live-gap] approved catalog ids missing canonical live map: ${report.approvedWithoutLiveSurface.join(', ')}`
    );
    ok = false;
  }

  if (write) {
    const md = readFileSync(MD_PATH, 'utf8');
    writeFileSync(MD_PATH, replaceKbLiveGapAuditBlock(md, report), 'utf8');
    console.log('[audit:kb-live-gap] wrote machine block to docs/kb-live-gap-audit.md');
  } else if (!existsSync(MD_PATH)) {
    console.error('[audit:kb-live-gap] docs/kb-live-gap-audit.md missing');
    ok = false;
  } else {
    const md = readFileSync(MD_PATH, 'utf8');
    const rendered = renderKbLiveGapAuditMarkdownBlock(report);
    if (!md.includes(BEGIN) || md.indexOf(rendered) === -1) {
      console.error(
        '[audit:kb-live-gap] docs/kb-live-gap-audit.md machine block out of sync (run with --write)'
      );
      ok = false;
    }
  }

  if (ok) {
    console.log(
      `[audit:kb-live-gap] OK — ${report.batch2Candidates.length} batch-2 candidates; ${report.registryMappingDrift.length} mapping drift; ${report.registryLinksUnapproved.length} unapproved links`
    );
  }

  return ok;
}

/**
 * @typedef {object} KbLiveGapRow
 * @property {string} liveId
 * @property {string} menuPath
 * @property {string} liveStatus
 * @property {readonly string[]} labelKeys
 * @property {string} note
 */

/**
 * @typedef {object} KbRegistryDriftRow
 * @property {string} liveId
 * @property {string} menuPath
 * @property {string} liveStatus
 * @property {readonly string[]} registryKbIds
 * @property {readonly string[]} [canonicalKbIds]
 * @property {readonly string[]} [unapprovedKbIds]
 */

/**
 * @typedef {object} KbBatch2CandidateRow
 * @property {string} liveId
 * @property {string} menuPath
 * @property {string} liveStatus
 * @property {readonly string[]} labelKeys
 * @property {string} reason
 */

/**
 * @typedef {object} KbLiveGapReport
 * @property {string} generatedAt
 * @property {number} liveRowCount
 * @property {number} approvedCatalogCount
 * @property {readonly string[]} approvedCatalogIds
 * @property {readonly string[]} crossCuttingApprovedIds
 * @property {readonly KbLiveGapRow[]} liveSurfaceWithoutApprovedKb
 * @property {readonly KbRegistryDriftRow[]} registryMappingDrift
 * @property {readonly KbRegistryDriftRow[]} registryLinksUnapproved
 * @property {readonly KbBatch2CandidateRow[]} batch2Candidates
 * @property {readonly string[]} approvedWithoutLiveSurface
 */

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runKbLiveGapAudit({ write });
  if (!ok) process.exitCode = 1;
}
