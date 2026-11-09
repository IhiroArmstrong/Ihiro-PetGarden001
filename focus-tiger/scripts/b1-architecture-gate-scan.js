/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * B1 architecture gate metrics (import cycles, core→ui, main.js size).
 * Logic aligned with docs/audit/findings/2026-11-09/evidence/b1-static-scan.mjs
 */

import fs from 'node:fs';
import path from 'node:path';

const importRe =
  /(?:import|export)\s+(?:[^'";]*?\sfrom\s+)?['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g;

/**
 * @param {string} srcRoot absolute path to focus-tiger/src
 */
export function computeB1ArchitectureGateMetrics(srcRoot) {
  /** @param {string} dir @param {string[]} acc */
  function walk(dir, acc = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name === 'node_modules') continue;
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p, acc);
      else if (ent.name.endsWith('.js')) acc.push(p);
    }
    return acc;
  }

  const files = walk(srcRoot);
  const rel = (p) => path.relative(srcRoot, p).replaceAll('\\', '/');

  /** @param {string} fromAbs @param {string} spec */
  function resolveSpec(fromAbs, spec) {
    const base = path.resolve(path.dirname(fromAbs), spec);
    const cands = [base, `${base}.js`, path.join(base, 'index.js')];
    for (const c of cands) {
      try {
        if (fs.statSync(c).isFile()) return c;
      } catch {
        /* missing */
      }
    }
    return null;
  }

  /** @param {string} r */
  function bucket(r) {
    return r.split('/')[0];
  }

  /** @type {Map<string, string[]>} */
  const graph = new Map();
  const cross = {};

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const deps = new Set();
    importRe.lastIndex = 0;
    let m;
    while ((m = importRe.exec(text))) {
      const spec = m[1] || m[2];
      const abs = resolveSpec(f, spec);
      if (!abs || !abs.startsWith(srcRoot)) continue;
      deps.add(abs);
      const a = bucket(rel(f));
      const b = bucket(rel(abs));
      if (a !== b) {
        const k = `${a} -> ${b}`;
        cross[k] = (cross[k] || 0) + 1;
      }
    }
    graph.set(f, [...deps]);
  }

  /** @type {Map<string, number>} */
  const color = new Map();
  /** @type {string[]} */
  const stack = [];
  /** @type {{ key: string, path: string[] }[]} */
  const cycles = [];

  /** @param {string} node */
  function dfs(node) {
    color.set(node, 1);
    stack.push(node);
    for (const nxt of graph.get(node) || []) {
      const c = color.get(nxt) || 0;
      if (c === 0) dfs(nxt);
      else if (c === 1) {
        const i = stack.indexOf(nxt);
        if (i >= 0) {
          const cyc = stack.slice(i).map(rel);
          const key = [...cyc].sort().join('|');
          if (!cycles.some((x) => x.key === key)) {
            cycles.push({ key, path: [...cyc, rel(nxt)] });
          }
        }
      }
    }
    stack.pop();
    color.set(node, 2);
  }

  for (const f of files) {
    if (!color.get(f)) dfs(f);
  }

  const mainPath = path.join(srcRoot, 'main.js');
  const mainJsLineCount = fs.existsSync(mainPath)
    ? fs.readFileSync(mainPath, 'utf8').split(/\n/).length
    : 0;

  return {
    relativeImportCycleCount: cycles.length,
    coreToUiCrossImports: cross['core -> ui'] || 0,
    mainJsLineCount,
    cycleSample: cycles.slice(0, 5).map((c) => c.path)
  };
}
