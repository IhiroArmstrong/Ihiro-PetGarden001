#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Internal onboarding handbook seed.
 * Built only from the live-entry registry. Not for Yin to recite.
 *
 *   node scripts/write-internal-handbook.js
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAllKbLiveEntryRows } from '../src/core/kbLiveEntryRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/internal-handbook/live-surfaces.md');

/**
 * @param {readonly { id: string, surface: string, liveStatus: string, menuPath: string, labelKeys?: readonly string[], catalogKbIds?: readonly string[] }[]} rows
 */
export function renderInternalHandbook(rows) {
  const lines = [
    '# Internal handbook · live surfaces',
    '',
    'Team onboarding only. **Do not paste this file into `product-knowledge-base.md` or the Confide catalog.**',
    'Yin may recite only rows that already passed the knowledge-base review. This list is the scan, not a script.',
    '',
    'Source: `src/core/kbLiveEntryRegistry.js`. Refresh: `node scripts/write-internal-handbook.js`.',
    '',
    '| id | where | status | path | labels | catalog |',
    '|---|---|---|---|---|---|'
  ];
  for (const row of rows) {
    const labels = (row.labelKeys || []).join(' ');
    const catalog = (row.catalogKbIds || []).join(' ') || '—';
    lines.push(
      `| \`${row.id}\` | ${row.surface} | ${row.liveStatus} | ${row.menuPath} | ${labels} | ${catalog} |`
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  const body = renderInternalHandbook(listAllKbLiveEntryRows());
  writeFileSync(OUT, body);
  process.stdout.write(`wrote ${OUT}\n`);
}
