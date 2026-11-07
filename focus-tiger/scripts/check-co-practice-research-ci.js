#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 S4(a)(b) — practice study upload CI guards.
 *
 *   node scripts/check-co-practice-research-ci.js
 *
 * S4(a): research-payload.v1.schema.json — every string leaf is enum or frozen structural (uuid / pattern).
 * S4(b): coPracticeResearch* upload modules must not import Confide originals, Memory, or emotion buckets.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const RESEARCH_SCHEMA_REL = 'docs/research/research-payload.v1.schema.json';

/** Frozen pattern strings (S0); no free-text string fields in payload schema. */
export const RESEARCH_SCHEMA_ALLOWED_STRING_PATTERNS = new Set([
  '^[0-9]{4}-W[0-9]{2}$',
  '^[01]{7}$'
]);

/** Relative import path fragments forbidden in upload-module graph (S4(b)). */
export const CO_PRACTICE_RESEARCH_FORBIDDEN_IMPORT_FRAGMENTS = [
  'confideRoutes',
  'confideClassify',
  'confideSemantic',
  'confideEmotion',
  'CONFIDE_EMOTION',
  'yinPersonalMemory',
  'confideTurn',
  'turns.jsonl',
  'confideOriginal',
  'confideProductKnowledge',
  'confideCrisis',
  'confideToolCallParse',
  'memoryVerbal',
  'emotionBucket'
];

/** Explicit allow (observation ring buffer — chip/route ids only, no user text). */
export const CO_PRACTICE_RESEARCH_DEPS_ALLOWLIST = new Set([
  './confide/confideObservationTelemetry.js',
  '../confide/confideObservationTelemetry.js'
]);

/**
 * @param {unknown} schema
 * @param {string} [pathLabel]
 * @returns {string[]}
 */
export function collectResearchSchemaStringViolations(schema, pathLabel = '$') {
  const hits = [];
  if (!schema || typeof schema !== 'object') return hits;

  if (Array.isArray(schema)) {
    for (let i = 0; i < schema.length; i += 1) {
      hits.push(
        ...collectResearchSchemaStringViolations(schema[i], `${pathLabel}[${i}]`)
      );
    }
    return hits;
  }

  const record = /** @type {Record<string, unknown>} */ (schema);

  const typeVal = record.type;
  const isStringType =
    typeVal === 'string' ||
    (Array.isArray(typeVal) && typeVal.includes('string'));

  if (isStringType) {
    const hasEnum = Array.isArray(record.enum) && record.enum.length > 0;
    const format = record.format;
    const pattern = record.pattern;
    const patternOk =
      typeof pattern === 'string' &&
      RESEARCH_SCHEMA_ALLOWED_STRING_PATTERNS.has(pattern);
    const formatOk = format === 'uuid';
    if (!hasEnum && !patternOk && !formatOk) {
      hits.push(
        `${pathLabel}: string field must use enum, format \"uuid\", or frozen pattern (got ${JSON.stringify({
          enum: record.enum,
          format,
          pattern
        })})`
      );
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === 'enum' || key === 'format' || key === 'pattern') continue;
    if (value && typeof value === 'object') {
      hits.push(
        ...collectResearchSchemaStringViolations(value, `${pathLabel}.${key}`)
      );
    }
  }

  return hits;
}

/**
 * @param {unknown} schemaRoot
 * @returns {string[]}
 */
export function validateResearchPayloadSchemaStrings(schemaRoot) {
  return collectResearchSchemaStringViolations(schemaRoot, 'schema');
}

const IMPORT_FROM_RE =
  /\bimport\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const IMPORT_SIDE_EFFECT_RE = /\bimport\s+['"]([^'"]+)['"]/g;

/**
 * @param {string} source
 * @returns {string[]}
 */
export function extractEsmImportPaths(source) {
  const paths = new Set();
  for (const re of [IMPORT_FROM_RE, IMPORT_SIDE_EFFECT_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(source)) !== null) {
      paths.add(match[1]);
    }
  }
  return [...paths];
}

/**
 * @param {string} importPath
 * @returns {string | null}
 */
export function forbiddenCoPracticeResearchImportHit(importPath) {
  if (CO_PRACTICE_RESEARCH_DEPS_ALLOWLIST.has(importPath)) return null;
  const lowered = importPath.toLowerCase();
  for (const frag of CO_PRACTICE_RESEARCH_FORBIDDEN_IMPORT_FRAGMENTS) {
    if (lowered.includes(frag.toLowerCase())) {
      return frag;
    }
  }
  return null;
}

/**
 * @param {string} relPosix
 * @param {string} source
 * @returns {string[]}
 */
export function scanCoPracticeResearchUploadDeps(relPosix, source) {
  const hits = [];
  for (const importPath of extractEsmImportPaths(source)) {
    const frag = forbiddenCoPracticeResearchImportHit(importPath);
    if (frag) {
      hits.push(`${relPosix}: forbidden import \"${importPath}\" (${frag})`);
    }
  }
  return hits;
}

/**
 * @param {string} coreDir
 * @returns {string[]}
 */
function listCoPracticeResearchCoreFiles(coreDir) {
  return readdirSync(coreDir, { withFileTypes: true })
    .filter(
      (ent) =>
        ent.isFile() &&
        ent.name.startsWith('coPracticeResearch') &&
        ent.name.endsWith('.js') &&
        !ent.name.endsWith('.test.js')
    )
    .map((ent) => join(coreDir, ent.name));
}

function main() {
  let ok = true;
  const problems = [];

  const schemaPath = join(PKG_ROOT, RESEARCH_SCHEMA_REL);
  let schemaJson;
  try {
    schemaJson = JSON.parse(readFileSync(schemaPath, 'utf8'));
  } catch (err) {
    console.error(`[co-practice-research-ci] cannot read schema: ${err}`);
    process.exit(1);
  }

  const schemaHits = validateResearchPayloadSchemaStrings(schemaJson);
  if (schemaHits.length > 0) {
    ok = false;
    problems.push('[S4(a)] research-payload.v1.schema.json string fields:');
    problems.push(...schemaHits.map((h) => `  - ${h}`));
  }

  const coreDir = join(PKG_ROOT, 'src/core');
  const uploadFiles = listCoPracticeResearchCoreFiles(coreDir);
  /** @type {string[]} */
  const depHits = [];
  for (const abs of uploadFiles) {
    const rel = relative(PKG_ROOT, abs).split(sep).join('/');
    const source = readFileSync(abs, 'utf8');
    depHits.push(...scanCoPracticeResearchUploadDeps(rel, source));
  }
  if (depHits.length > 0) {
    ok = false;
    problems.push('[S4(b)] coPracticeResearch upload module imports:');
    problems.push(...depHits.map((h) => `  - ${h}`));
  }

  if (!ok) {
    console.error(problems.join('\n'));
    process.exit(1);
  }

  console.log(
    `[co-practice-research-ci] OK — schema strings + ${uploadFiles.length} upload module file(s)`
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
