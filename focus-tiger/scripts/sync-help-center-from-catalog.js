#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Knife 1 helper: catalog export fields + Help Center EN bodies from catalog.
 *
 *   node scripts/sync-help-center-from-catalog.js --apply-schema
 *   node scripts/sync-help-center-from-catalog.js --write-locale-en
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HELP_CENTER_ARTICLES } from '../src/core/helpCenterCatalog.js';
import {
  helpCenterLocaleStem,
  listHelpCenterVisibleCatalogEntries
} from '../src/core/confide/productKnowledgeCatalogGate.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_PATH = join(ROOT, 'src/core/confide/productKnowledgeCatalog.json');
const SLICE_PATH = join(ROOT, 'src/locales/slices/help-center.json');

const HELP_ONLY_KEYWORDS = Object.freeze({
  'KB-FUNC-0006': Object.freeze([
    '呼吸练习盘点',
    'left orb inventory',
    'Leave 不记账细节',
    'KB-FUNC-0006 inventory'
  ]),
  'HELP-DEVICES-SAFARI': Object.freeze([
    'Safari on iPhone',
    'no App Store app',
    'TestFlight',
    'Home Screen shortcut',
    'iPad Safari'
  ]),
  'HELP-APPLE-HEALTH-LOG': Object.freeze([
    'Apple Health',
    'HealthKit',
    'Log to Health',
    'mindful minutes shortcut'
  ]),
  'HELP-BREATH-DURATION': Object.freeze([
    'How long Breath practice can last',
    '1, 3, 5, 10, or 20 minutes'
  ]),
  'HELP-LOTUS-BLOOMS': Object.freeze(['What the lotus blooms mean']),
  'HELP-BUY-COLLECTIONS': Object.freeze(["Buying Yin's Collections"]),
  'HELP-BADGE-NOT-COIN': Object.freeze(['Badges are not focus coins'])
});

function loadCatalog() {
  return JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
}

function loadSlice() {
  return JSON.parse(readFileSync(SLICE_PATH, 'utf8'));
}

function articleMetaById() {
  /** @type {Map<string, { sectionId: string, order: number }>} */
  const map = new Map();
  HELP_CENTER_ARTICLES.forEach((row, index) => {
    map.set(row.id, { sectionId: row.sectionId, order: index });
  });
  return map;
}

function helpOnlyEntry(id, slice, meta) {
  const stem = helpCenterLocaleStem(id);
  const body = slice.en[`${stem}_BODY`];
  if (!body) {
    throw new Error(`missing EN help body for ${id}`);
  }
  const info = meta.get(id);
  if (!info) {
    throw new Error(`missing Help Center article row for ${id}`);
  }
  return {
    id,
    yinMayRetrieve: false,
    helpCenterVisible: true,
    helpSectionId: info.sectionId,
    helpCenterOrder: info.order,
    shortAnswerEn: body,
    keywords: [...(HELP_ONLY_KEYWORDS[id] || [])]
  };
}

export function applyCatalogExportSchema(catalog, slice) {
  const meta = articleMetaById();
  const existingIds = new Set(catalog.entries.map((row) => row.id));
  const nextEntries = catalog.entries.map((entry) => {
    const info = meta.get(entry.id);
    return {
      ...entry,
      yinMayRetrieve:
        typeof entry.yinMayRetrieve === 'boolean' ? entry.yinMayRetrieve : true,
      helpCenterVisible:
        typeof entry.helpCenterVisible === 'boolean'
          ? entry.helpCenterVisible
          : true,
      helpSectionId: entry.helpSectionId || info?.sectionId,
      helpCenterOrder:
        Number.isFinite(entry.helpCenterOrder) ? entry.helpCenterOrder : info?.order
    };
  });
  for (const row of HELP_CENTER_ARTICLES) {
    if (existingIds.has(row.id)) continue;
    nextEntries.push(helpOnlyEntry(row.id, slice, meta));
  }
  return {
    ...catalog,
    schemaVersion: 2,
    gate: 'per-entry yinMayRetrieve and helpCenterVisible; unapproved drafts stay out of this file',
    entries: nextEntries
  };
}

export function writeEnglishHelpBodiesFromCatalog(catalog, slice) {
  const next = structuredClone(slice);
  for (const entry of listHelpCenterVisibleCatalogEntries(catalog)) {
    const stem = helpCenterLocaleStem(entry.id);
    const key = `${stem}_BODY`;
    for (const loc of ['en', 'zh', 'ja']) {
      if (!next[loc] || typeof next[loc][key] !== 'string') {
        throw new Error(`missing ${loc} ${key}`);
      }
    }
    if (entry.yinMayRetrieve === false) {
      next.en[key] = entry.shortAnswerEn;
    }
  }
  return next;
}

function main(argv) {
  const applySchema = argv.includes('--apply-schema');
  const writeLocale = argv.includes('--write-locale-en');
  if (!applySchema && !writeLocale) {
    throw new Error('pass --apply-schema and/or --write-locale-en');
  }
  let catalog = loadCatalog();
  const slice = loadSlice();
  if (applySchema) {
    catalog = applyCatalogExportSchema(catalog, slice);
    writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);
  }
  if (writeLocale) {
    const nextSlice = writeEnglishHelpBodiesFromCatalog(catalog, loadSlice());
    writeFileSync(SLICE_PATH, `${JSON.stringify(nextSlice, null, 2)}\n`);
  }
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  main(process.argv.slice(2));
}
