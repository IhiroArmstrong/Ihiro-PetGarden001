/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Locale review pack · export / import bilingual TSV for human copy review.
 *
 * Canonical runtime dictionaries: src/locales/{en,ja,zh}.json
 * Reviewers edit the TSV; import writes ja.json (keys must match en.json 1:1).
 *
 *   npm run locale:export-ja
 *   npm run locale:import-ja
 *   node scripts/locale-pack.js export-ja [path.tsv]
 *   node scripts/locale-pack.js import-ja [path.tsv]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const localesDir = join(root, 'src', 'locales');
const defaultPackPath = join(localesDir, 'packs', 'ja-en-review.tsv');

/**
 * @param {string} value
 * @returns {string}
 */
function escapeCell(value) {
  const s = String(value ?? '');
  if (/[\t\n\r"]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Split one TSV line into cells (RFC4180-ish quotes).
 * @param {string} line
 * @returns {string[]}
 */
function parseTsvRow(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === '\t') {
      cells.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  return cells;
}

/**
 * @param {string} text
 * @returns {string[][]}
 */
function parseTsv(text) {
  const rows = [];
  let line = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      line += ch;
      if (inQuotes && text[i + 1] === '"') {
        line += text[i + 1];
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      if (line.length > 0) rows.push(parseTsvRow(line));
      line = '';
      continue;
    }
    line += ch;
  }
  if (line.length > 0) rows.push(parseTsvRow(line));
  return rows;
}

/**
 * @param {string} name
 * @returns {Record<string, string>}
 */
function loadJson(name) {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf8'));
}

/**
 * @param {string} packPath
 */
function exportJa(packPath) {
  const en = loadJson('en.json');
  const ja = loadJson('ja.json');
  const keys = Object.keys(en);
  const lines = ['key\ten\tja'];
  for (const key of keys) {
    lines.push(
      `${escapeCell(key)}\t${escapeCell(en[key])}\t${escapeCell(ja[key] ?? '')}`
    );
  }
  mkdirSync(dirname(packPath), { recursive: true });
  writeFileSync(packPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[locale-pack] exported ${keys.length} rows → ${packPath}`);
}

/**
 * @param {string} packPath
 */
function importJa(packPath) {
  const en = loadJson('en.json');
  const enKeys = Object.keys(en);
  const enSet = new Set(enKeys);
  const text = readFileSync(packPath, 'utf8');
  const rows = parseTsv(text).filter((r) => r.some((c) => String(c).trim()));
  if (rows.length < 2) {
    throw new Error('TSV needs header + at least one data row');
  }
  const header = rows[0].map((c) => String(c).trim().toLowerCase());
  const keyIdx = header.indexOf('key');
  const jaIdx = header.indexOf('ja');
  if (keyIdx < 0 || jaIdx < 0) {
    throw new Error('TSV header must include columns: key, ja (en optional)');
  }

  /** @type {Record<string, string>} */
  const fromPack = {};
  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const key = String(row[keyIdx] ?? '').trim();
    if (!key || key.startsWith('#')) continue;
    if (!enSet.has(key)) {
      throw new Error(`Unknown key in pack (not in en.json): ${key}`);
    }
    fromPack[key] = String(row[jaIdx] ?? '');
  }

  const missing = enKeys.filter((k) => !(k in fromPack));
  if (missing.length) {
    throw new Error(
      `Pack missing ${missing.length} en keys (first: ${missing.slice(0, 5).join(', ')})`
    );
  }

  /** @type {Record<string, string>} */
  const next = {};
  for (const key of enKeys) {
    next[key] = fromPack[key];
  }
  const outPath = join(localesDir, 'ja.json');
  writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`[locale-pack] imported ${enKeys.length} ja strings → ${outPath}`);
}

/**
 * @param {string | undefined} pathArg
 * @returns {string}
 */
function resolvePackPath(pathArg) {
  if (!pathArg) return defaultPackPath;
  return isAbsolute(pathArg) ? pathArg : join(process.cwd(), pathArg);
}

const [, , cmd, pathArg] = process.argv;
const packPath = resolvePackPath(pathArg);

try {
  if (cmd === 'export-ja') {
    exportJa(packPath);
  } else if (cmd === 'import-ja') {
    importJa(packPath);
  } else {
    console.error(
      'Usage: node scripts/locale-pack.js export-ja|import-ja [path.tsv]'
    );
    process.exit(1);
  }
} catch (err) {
  console.error(`[locale-pack] ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
