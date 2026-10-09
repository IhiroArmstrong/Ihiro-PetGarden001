#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Validate locale slices and refuse edits to en.json / zh.json / ja.json.
 *
 *   node scripts/check-locale-slices.js
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  localeHotspotError,
  mergeLocalePack
} from '../src/locales/mergeLocaleSlices.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(root, '..');
const localesDir = join(root, 'src', 'locales');
const slicesDir = join(localesDir, 'slices');

/**
 * @param {string} rev
 * @param {string} gitPath
 * @returns {string}
 */
function gitShow(rev, gitPath) {
  return execFileSync('git', ['show', `${rev}:${gitPath}`], {
    cwd: repoRoot,
    encoding: 'utf8'
  });
}

/**
 * @param {string} rev
 * @returns {boolean}
 */
function refExists(rev) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', rev], {
      cwd: repoRoot,
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * @returns {{ filename: string, data: unknown }[]}
 */
function slicesFromDisk() {
  if (!existsSync(slicesDir)) return [];
  return readdirSync(slicesDir)
    .filter((name) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name))
    .sort()
    .map((filename) => ({
      filename,
      data: JSON.parse(readFileSync(join(slicesDir, filename), 'utf8'))
    }));
}

/**
 * @param {string} rev
 * @returns {{ filename: string, data: unknown }[]}
 */
function slicesFromRev(rev) {
  let listing = '';
  try {
    listing = execFileSync(
      'git',
      ['ls-tree', '-r', '--name-only', rev, '--', 'focus-tiger/src/locales/slices'],
      { cwd: repoRoot, encoding: 'utf8' }
    );
  } catch {
    listing = '';
  }
  return listing
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.json'))
    .map((gitPath) => ({
      filename: gitPath.slice('focus-tiger/src/locales/slices/'.length),
      data: JSON.parse(gitShow(rev, gitPath))
    }));
}

/**
 * @param {string} name
 * @returns {Record<string, string>}
 */
function baseFromDisk(name) {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf8'));
}

/**
 * @param {string} rev
 * @param {string} name
 * @returns {Record<string, string>}
 */
function baseFromRev(rev, name) {
  return JSON.parse(gitShow(rev, `focus-tiger/src/locales/${name}`));
}

/**
 * @param {string} baseRef
 * @param {string} headRev
 * @returns {string[]}
 */
function changedPaths(baseRef, headRev) {
  if (headRev) {
    return execFileSync('git', ['diff', '--name-only', `${baseRef}...${headRev}`], {
      cwd: repoRoot,
      encoding: 'utf8'
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  const chunks = [
    execFileSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], {
      cwd: repoRoot,
      encoding: 'utf8'
    }),
    execFileSync('git', ['diff', '--name-only'], {
      cwd: repoRoot,
      encoding: 'utf8'
    }),
    execFileSync('git', ['diff', '--name-only', '--cached'], {
      cwd: repoRoot,
      encoding: 'utf8'
    })
  ];
  return [
    ...new Set(
      chunks
        .flatMap((chunk) => chunk.split('\n'))
        .map((line) => line.trim())
        .filter(Boolean)
    )
  ];
}

/**
 * @returns {{ dictionaries: Record<string, Record<string, string>>, errors: string[] }}
 */
export function loadMergedFromDisk() {
  return mergeLocalePack(
    {
      en: baseFromDisk('en.json'),
      zh: baseFromDisk('zh.json'),
      ja: baseFromDisk('ja.json')
    },
    slicesFromDisk()
  );
}

/**
 * @returns {boolean}
 */
export function runLocaleSliceCheck() {
  const headRev = process.env.LOCALE_GUARD_HEAD || '';
  const slices = headRev ? slicesFromRev(headRev) : slicesFromDisk();
  const bases = headRev
    ? {
        en: baseFromRev(headRev, 'en.json'),
        zh: baseFromRev(headRev, 'zh.json'),
        ja: baseFromRev(headRev, 'ja.json')
      }
    : {
        en: baseFromDisk('en.json'),
        zh: baseFromDisk('zh.json'),
        ja: baseFromDisk('ja.json')
      };
  const merged = mergeLocalePack(bases, slices);
  if (merged.errors.length > 0) {
    console.error('[locale:slices] FAILED — 文案小片不合格：');
    for (const err of merged.errors) console.error(`  - ${err}`);
    return false;
  }
  console.log(`[locale:slices] OK — ${slices.length} 片。`);
  const baseRef =
    process.env.LOCALE_GUARD_BASE ||
    (refExists('origin/develop') ? 'origin/develop' : '');
  if (!baseRef) {
    console.log('[locale:slices] 未找到 origin/develop，跳过总表改动检查。');
    return true;
  }
  const hotspot = localeHotspotError(changedPaths(baseRef, headRev));
  if (hotspot) {
    console.error(`[locale:slices] FAILED — ${hotspot}`);
    return false;
  }
  return true;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(runLocaleSliceCheck() ? 0 : 1);
}
