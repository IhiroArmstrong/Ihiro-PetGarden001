#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Refuse shipping guided-meditation media on r2.dev (dev/QA host only).
 *
 * Default: warn + exit 0 (develop / QA may still use r2.dev; empty license
 * rows also warn only).
 * --release-gate: exit 1 if GUIDED_MEDITATION_MEDIA_HOST or any lesson URL
 * contains r2.dev, or if the inventory 配乐授权 table has an empty cell
 * (merge-to-main / stable tag).
 *
 *   npm run check:guided-media-host
 *   npm run check:guided-media-host -- --release-gate
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const GUIDED_MEDITATION_LESSONS_PATH = join(
  PKG_ROOT,
  'src/core/guidedMeditationLessons.js'
);
export const GUIDED_MEDITATION_INVENTORY_PATH = join(
  PKG_ROOT,
  'docs/guided-meditation-source-inventory.md'
);
export const MUSIC_LICENSE_FIELD_KEYS = Object.freeze([
  '来源',
  '授权范围',
  '核实日期'
]);

/**
 * @param {string} value
 * @returns {boolean}
 */
export function mediaHostLooksLikeR2Dev(value) {
  const s = String(value || '').trim().toLowerCase();
  if (!s) return false;
  return s.includes('r2.dev');
}

/**
 * @param {string} source
 * @returns {{ host: string, urls: string[] }}
 */
export function parseGuidedMeditationMediaHosts(source) {
  const hostMatch = source.match(
    /export const GUIDED_MEDITATION_MEDIA_HOST\s*=\s*['"]([^'"]+)['"]/
  );
  const urls = [];
  const urlRe = /https?:\/\/[^'"`\s]+/g;
  let m;
  while ((m = urlRe.exec(source))) {
    urls.push(m[0]);
  }
  return { host: hostMatch ? hostMatch[1] : '', urls };
}

/**
 * @param {{ host: string, urls?: string[], mode?: 'inventory' | 'release' }} input
 * @returns {{ ok: boolean, r2: boolean, message: string }}
 */
export function evaluateGuidedMediaHostGate(input = {}) {
  const host = String(input.host || '');
  const urls = Array.isArray(input.urls) ? input.urls : [];
  const mode = input.mode === 'release' ? 'release' : 'inventory';
  const r2 =
    mediaHostLooksLikeR2Dev(host) || urls.some((u) => mediaHostLooksLikeR2Dev(u));
  if (r2 && mode === 'release') {
    return {
      ok: false,
      r2: true,
      message:
        '[guided-media-host] RELEASE GATE FAIL: media host still contains r2.dev. ' +
        'Swap GUIDED_MEDITATION_MEDIA_HOST to the custom subdomain before merging main.'
    };
  }
  if (r2) {
    return {
      ok: true,
      r2: true,
      message:
        '[guided-media-host] WARN: r2.dev is QA-only (rate limits, no cache/WAF). ' +
        'Do not treat develop as an external release.'
    };
  }
  return {
    ok: true,
    r2: false,
    message: '[guided-media-host] OK — media host is not r2.dev.'
  };
}

/**
 * Parse the first 「配乐授权」 table (not the empty-row template).
 * @param {string} markdown
 * @returns {{ present: boolean, fields: Record<string, string>, emptyKeys: string[] }}
 */
export function parseMusicLicenseFields(markdown) {
  const after = String(markdown || '').split(/^## 配乐授权[^\n]*/m)[1];
  if (!after) {
    return { present: false, fields: {}, emptyKeys: [...MUSIC_LICENSE_FIELD_KEYS] };
  }
  const section = after.split(/^## /m)[0];
  /** @type {Record<string, string>} */
  const fields = {};
  const emptyKeys = [];
  for (const key of MUSIC_LICENSE_FIELD_KEYS) {
    const re = new RegExp(`\\|\\s*${key}\\s*\\|\\s*([^|\\n]*)\\|`);
    const m = section.match(re);
    const value = m ? String(m[1]).trim() : '';
    fields[key] = value;
    if (!value) emptyKeys.push(key);
  }
  return { present: true, fields, emptyKeys };
}

/**
 * @param {{ markdown?: string, mode?: 'inventory' | 'release' }} input
 * @returns {{ ok: boolean, empty: boolean, emptyKeys: string[], message: string }}
 */
export function evaluateMusicLicenseGate(input = {}) {
  const mode = input.mode === 'release' ? 'release' : 'inventory';
  const parsed = parseMusicLicenseFields(input.markdown || '');
  const empty = !parsed.present || parsed.emptyKeys.length > 0;
  if (empty && mode === 'release') {
    const keys = parsed.emptyKeys.join(', ') || 'section missing';
    return {
      ok: false,
      empty: true,
      emptyKeys: parsed.emptyKeys,
      message:
        '[guided-media-host] RELEASE GATE FAIL: music license table has an empty cell ' +
        `(${keys}). Fill 来源 / 授权范围 / 核实日期 before merging main.`
    };
  }
  if (empty) {
    return {
      ok: true,
      empty: true,
      emptyKeys: parsed.emptyKeys,
      message:
        '[guided-media-host] WARN: music license table has empty cells. ' +
        'Do not treat develop as an external release until they are filled.'
    };
  }
  return {
    ok: true,
    empty: false,
    emptyKeys: [],
    message: '[guided-media-host] OK — music license table is filled.'
  };
}

/**
 * @param {{ releaseGate?: boolean, sourceText?: string, inventoryText?: string }} [opts]
 * @returns {{ ok: boolean, r2: boolean, licenseEmpty: boolean, message: string }}
 */
export function runGuidedMediaHostCheck(opts = {}) {
  const source =
    opts.sourceText ??
    readFileSync(GUIDED_MEDITATION_LESSONS_PATH, 'utf8');
  const inventory =
    opts.inventoryText ??
    readFileSync(GUIDED_MEDITATION_INVENTORY_PATH, 'utf8');
  const parsed = parseGuidedMeditationMediaHosts(source);
  const mode = opts.releaseGate ? 'release' : 'inventory';
  const hostResult = evaluateGuidedMediaHostGate({
    host: parsed.host,
    urls: parsed.urls,
    mode
  });
  const licenseResult = evaluateMusicLicenseGate({
    markdown: inventory,
    mode
  });
  return {
    ok: hostResult.ok && licenseResult.ok,
    r2: hostResult.r2,
    licenseEmpty: licenseResult.empty,
    message: `${hostResult.message}\n${licenseResult.message}`
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = runGuidedMediaHostCheck({
    releaseGate: process.argv.includes('--release-gate')
  });
  if (result.ok) {
    console.log(result.message);
    process.exit(0);
  }
  console.error(result.message);
  process.exit(1);
}
