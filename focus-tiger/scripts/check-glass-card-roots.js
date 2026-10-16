#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A11.1 — floating card *roots* must not paint a one-off dark / near-opaque plate.
 * Inner chips, gold CTAs, mint tracks, and Support dim are out of scope.
 *
 *   node scripts/check-glass-card-roots.js
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLASS_CARD_ELEMENT_IDS } from '../src/ui/glassCardDeck.js';
import { A11_DARK_VOICE_CARD_BEFORE_1147 } from './fixtures/a11-dark-voice-card-before-1147.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const UI_DIR = join(PKG_ROOT, 'src/ui');

/** Extra panel roots from the A11 Brief variant matrix, not in the drag deck. */
export const GLASS_CARD_EXTRA_ROOT_TARGETS = Object.freeze([
  {
    id: 'system-tts-preference-panel',
    selectors: ['.system-tts-pref__panel', '#system-tts-preference-panel']
  },
  {
    id: 'honesty-check-in',
    selectors: ['#honesty-check-in']
  },
  {
    id: 'arrival-practice',
    selectors: ['#arrival-practice'],
    allowTransparentRoot: true
  },
  {
    id: 'companion-mode-panel',
    selectors: ['.session-start-dock__panel']
  },
  {
    id: 'focus-duration-picker',
    selectors: ['#focus-duration-picker']
  }
]);

/**
 * Live roots that are not sanctuary glass yet.
 * Dark plates on these ids still fail. Opaque cream is no longer held out
 * (A11.2 moved `#presence-signals-panel` onto `GLASS_FILL`).
 */
export const GLASS_CARD_ROOT_HOLDOUT_IDS = Object.freeze([]);

/**
 * Cards often use `#id` plus a shorter class (e.g. yin-membership-card → .yin-membership).
 * Wrapper roots may paint glass on `__actions` / `__panel` instead of the outer shell.
 * @param {string} id
 * @returns {string[]}
 */
export function derivedRootSelectors(id) {
  const sels = [`#${id}`, `.${id}`];
  if (id.endsWith('-card')) sels.push(`.${id.slice(0, -5)}`);
  sels.push(`.${id}__panel`, `.${id}__sheet`, `.${id}__actions`);
  return sels;
}

/**
 * @returns {{ id: string, selectors: string[], allowTransparentRoot?: boolean }[]}
 */
export function listGlassCardRootTargets() {
  const deck = Object.values(GLASS_CARD_ELEMENT_IDS).map((id) => ({
    id,
    selectors: derivedRootSelectors(id)
  }));
  return [...deck, ...GLASS_CARD_EXTRA_ROOT_TARGETS];
}

/**
 * Template interpolations contain `}` and truncate CSS rule bodies.
 * @param {string} src
 */
export function stripJsTemplateExprs(src) {
  return src.replace(/\$\{([A-Za-z0-9_.]+)\}/g, 'TOKEN_$1');
}

/**
 * @param {string} src
 * @param {string} selector
 * @returns {string[]}
 */
export function extractRuleBodiesForSelector(src, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g');
  const bodies = [];
  let match;
  while ((match = re.exec(src))) {
    bodies.push(match[1]);
  }
  return bodies;
}

/**
 * @param {string} src
 * @param {string} elementId
 * @returns {string[]}
 */
export function extractRootCssTextConsts(src, elementId) {
  const idHit = new RegExp(
    `(?:this\\.)?root\\.id\\s*=\\s*['"]${elementId}['"]`
  ).test(src);
  if (!idHit) return [];
  const assign = src.match(/(?:this\.)?root\.style\.cssText\s*=\s*([A-Z_][A-Z0-9_]*)/);
  if (!assign) return [];
  const name = assign[1];
  const block = src.match(
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*\\.join`)
  );
  return block ? [block[1]] : [];
}

/**
 * @param {string} chunk
 * @returns {string[]}
 */
export function extractBackgroundValues(chunk) {
  const values = [];
  const re = /background(?:-color)?\s*:\s*([^;]+)/gi;
  let match;
  while ((match = re.exec(chunk))) {
    values.push(match[1].trim());
  }
  return values;
}

/**
 * @param {string} raw
 * @returns {{ r: number, g: number, b: number, a: number } | null}
 */
export function parseRgba(raw) {
  const m = String(raw)
    .replace(/\s+/g, '')
    .match(/^rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)$/i);
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] == null ? 1 : Number(m[4])
  };
}

/**
 * @param {string} raw
 * @returns {'token' | 'warm-rice' | 'transparent' | 'dark-plate' | 'opaque-cream' | 'other'}
 */
export function classifyGlassRootFill(raw) {
  const v = String(raw).trim();
  if (!v) return 'transparent';
  if (/GLASS_FILL(_STRONG|_CHROME)?/.test(v)) return 'token';
  if (/glassPanelSurfaceDecls|createGlassCard/.test(v)) return 'token';
  if (/^(transparent|none|inherit|initial|unset)$/i.test(v)) return 'transparent';
  const rgba = parseRgba(v);
  if (!rgba) return 'other';
  const { r, g, b, a } = rgba;
  if (r <= 80 && g <= 80 && b <= 80 && a >= 0.4) return 'dark-plate';
  const cream = r >= 240 && g >= 235 && b >= 220;
  if (cream && a >= 0.93) return 'opaque-cream';
  if (cream && a >= 0.5 && a < 0.93) return 'warm-rice';
  if (a < 0.2) return 'transparent';
  return 'other';
}

/**
 * @param {string} src
 * @param {{ id: string, selectors: string[], allowTransparentRoot?: boolean }} target
 * @returns {{ ok: boolean, problems: string[], classes: string[] }}
 */
export function scanGlassCardRootSource(src, target) {
  const prepared = stripJsTemplateExprs(src);
  const chunks = [
    ...target.selectors.flatMap((sel) => extractRuleBodiesForSelector(prepared, sel)),
    ...extractRootCssTextConsts(prepared, target.id)
  ];
  const values = chunks.flatMap(extractBackgroundValues);
  const classes = values.map(classifyGlassRootFill);
  const problems = [];
  for (let i = 0; i < values.length; i += 1) {
    const kind = classes[i];
    if (kind === 'dark-plate' || kind === 'opaque-cream' || kind === 'other') {
      problems.push(`${target.id}: root fill "${values[i]}" is ${kind}`);
    }
  }
  const hasSurface = classes.some(
    (kind) => kind === 'token' || kind === 'warm-rice'
  );
  const onlyTransparent =
    classes.length === 0 || classes.every((kind) => kind === 'transparent');
  if (!hasSurface && !target.allowTransparentRoot) {
    problems.push(`${target.id}: card root has no sanctuary glass fill`);
  }
  if (onlyTransparent && target.allowTransparentRoot) {
    return { ok: problems.length === 0, problems, classes };
  }
  return { ok: problems.length === 0, problems, classes };
}

function listUiSourceFiles() {
  return readdirSync(UI_DIR)
    .filter((name) => name.endsWith('.js') && !name.endsWith('.test.js'))
    .map((name) => join(UI_DIR, name));
}

/**
 * @param {string} abs
 * @returns {string}
 */
function readSrc(abs) {
  return readFileSync(abs, 'utf8');
}

/**
 * @param {{ id: string, selectors: string[] }} target
 * @param {string[]} files
 * @returns {string[]}
 */
function filesForTarget(target, files) {
  return files.filter((abs) => {
    const src = readSrc(abs);
    if (src.includes(`'${target.id}'`) || src.includes(`"${target.id}"`)) return true;
    return target.selectors.some((sel) => src.includes(sel));
  });
}

/**
 * Fixture must go red. Live deck + extra roots must stay green without restyling.
 * @returns {boolean}
 */
export function runGlassCardRootCheck() {
  const errors = [];
  const fixture = scanGlassCardRootSource(A11_DARK_VOICE_CARD_BEFORE_1147, {
    id: 'system-tts-preference-panel',
    selectors: ['.system-tts-pref__panel']
  });
  if (fixture.ok) {
    errors.push('#1147 dark voice-card fixture must fail the scanner');
  } else if (!fixture.problems.some((p) => p.includes('dark-plate'))) {
    errors.push('#1147 fixture must fail as a dark-plate, not another reason');
  }

  const files = listUiSourceFiles();
  for (const target of listGlassCardRootTargets()) {
    const hits = filesForTarget(target, files).filter(
      (abs) => !abs.endsWith('glassCardDeck.js') && !abs.endsWith('glassPanelStyles.js')
    );
    if (!hits.length) {
      errors.push(`${target.id}: no UI source assigns this card root`);
      continue;
    }
    let okSomewhere = false;
    const fileProblems = [];
    for (const abs of hits) {
      const result = scanGlassCardRootSource(readSrc(abs), target);
      if (result.ok && (result.classes.some((k) => k === 'token' || k === 'warm-rice') || target.allowTransparentRoot)) {
        okSomewhere = true;
        break;
      }
      fileProblems.push(...result.problems.map((p) => `${abs.slice(PKG_ROOT.length + 1)}: ${p}`));
    }
    if (!okSomewhere) {
      const holdout = GLASS_CARD_ROOT_HOLDOUT_IDS.includes(target.id);
      const onlyA11_2 =
        holdout &&
        fileProblems.every(
          (p) =>
            p.includes('opaque-cream') ||
            p.includes('no sanctuary glass fill') ||
            p.includes('other')
        );
      if (onlyA11_2) continue;
      errors.push(
        fileProblems.join('; ') || `${target.id}: sanctuary glass fill not found on root`
      );
    }
  }

  if (errors.length) {
    console.error('[glass-card-roots] FAILED');
    for (const err of errors) console.error(`  - ${err}`);
    return false;
  }
  console.log(
    `[glass-card-roots] OK — ${listGlassCardRootTargets().length} card roots; #1147 fixture still fails`
  );
  return true;
}

function main() {
  if (!runGlassCardRootCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
