/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import fs from 'fs';
import path from 'path';

const repo = path.resolve('focus-tiger');
const root = path.join(repo, 'src');

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith('.js')) acc.push(p);
  }
  return acc;
}

const files = walk(root);
const rel = (p) => path.relative(root, p).replaceAll('\\', '/');
const linesOf = (p) => fs.readFileSync(p, 'utf8').split(/\n/).length;

const byTop = {};
let testFiles = 0;
let prodFiles = 0;
let testLines = 0;
let prodLines = 0;
const ranked = [];
for (const f of files) {
  const r = rel(f);
  const top = r.split('/')[0];
  const n = linesOf(f);
  byTop[top] ??= { files: 0, lines: 0 };
  byTop[top].files += 1;
  byTop[top].lines += n;
  const isTest = /\.test\.js$/.test(r);
  if (isTest) {
    testFiles += 1;
    testLines += n;
  } else {
    prodFiles += 1;
    prodLines += n;
    ranked.push({ r, n });
  }
}
ranked.sort((a, b) => b.n - a.n);

const importRe = /(?:import|export)\s+(?:[^'";]*?\sfrom\s+)?['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g;

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

const graph = new Map();
const unresolved = [];
const cross = {};

function bucket(r) {
  return r.split('/')[0];
}

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const deps = new Set();
  importRe.lastIndex = 0;
  let m;
  while ((m = importRe.exec(text))) {
    const spec = m[1] || m[2];
    const abs = resolveSpec(f, spec);
    if (!abs) {
      unresolved.push(`${rel(f)} -> ${spec}`);
      continue;
    }
    if (!abs.startsWith(root)) continue;
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

const color = new Map();
const stack = [];
const cycles = [];

function dfs(node) {
  color.set(node, 1);
  stack.push(node);
  for (const nxt of graph.get(node) || []) {
    const c = color.get(nxt) || 0;
    if (c === 0) dfs(nxt);
    else if (c === 1) {
      const i = stack.indexOf(nxt);
      if (i >= 0 && cycles.length < 30) {
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

const emptyCatch = [];
const swallow = [];
const catchRe = /catch\s*(\([^)]*\))?\s*\{([^{}]*)\}/g;
for (const f of files) {
  if (/\.test\.js$/.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  catchRe.lastIndex = 0;
  let m;
  while ((m = catchRe.exec(text))) {
    const body = m[2].trim();
    const line = text.slice(0, m.index).split('\n').length;
    if (!body) emptyCatch.push(`${rel(f)}:${line}`);
    else if (!/throw|console\.|report|warn|error/.test(body) && body.length < 90) {
      swallow.push(`${rel(f)}:${line} :: ${body.replace(/\s+/g, ' ').slice(0, 70)}`);
    }
  }
}

const urlHits = [];
const urlRe = /https?:\/\/[^\s'"`)]+/g;
for (const f of files) {
  if (/\.test\.js$/.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  const seen = new Set();
  let m;
  while ((m = urlRe.exec(text))) {
    const u = m[0].replace(/[.,;]+$/, '');
    if (seen.has(u)) continue;
    seen.add(u);
    if (urlHits.length < 60) urlHits.push(`${rel(f)} ${u}`);
  }
}

const threeFiles = [];
const schemaFiles = [];
for (const f of files) {
  if (/\.test\.js$/.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  if (/from ['"]three['"]|from ['"]three\//.test(text)) threeFiles.push(rel(f));
  if (/schemaVersion/.test(text)) schemaFiles.push(rel(f));
}

const lsDirect = [];
for (const f of files) {
  if (/\.test\.js$/.test(f)) continue;
  const text = fs.readFileSync(f, 'utf8');
  const n = (text.match(/localStorage\./g) || []).length;
  if (n) lsDirect.push({ r: rel(f), n });
}
lsDirect.sort((a, b) => b.n - a.n);

const out = {
  generatedBy: 'node focus-tiger/docs/audit/findings/2026-11-09/evidence/b1-static-scan.mjs',
  scope: 'focus-tiger/src/**/*.js relative imports only',
  jsFiles: files.length,
  prodFiles,
  testFiles,
  prodLines,
  testLines,
  byTop,
  topProd: ranked.slice(0, 25),
  cycleSample: cycles.map((c) => c.path),
  unresolvedCount: unresolved.length,
  unresolvedSample: unresolved.slice(0, 25),
  cross,
  emptyCatchCount: emptyCatch.length,
  emptyCatch: emptyCatch.slice(0, 50),
  quietCatchSample: swallow.slice(0, 30),
  threeImportFiles: threeFiles,
  schemaVersionProdFiles: schemaFiles,
  localStorageDirectFileCount: lsDirect.length,
  localStorageDirectTop: lsDirect.slice(0, 25),
  hardcodedUrlSample: urlHits,
};

const dest = path.join(
  repo,
  'docs/audit/findings/2026-11-09/evidence/b1-static-scan.json',
);
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify({
  jsFiles: out.jsFiles,
  prodFiles,
  testFiles,
  prodLines,
  testLines,
  cycles: cycles.length,
  emptyCatch: emptyCatch.length,
  three: threeFiles.length,
  schema: schemaFiles.length,
  lsFiles: lsDirect.length,
  unresolved: unresolved.length,
  top: ranked.slice(0, 8),
  crossTop: Object.entries(cross).sort((a, b) => b[1] - a[1]).slice(0, 15),
}, null, 2));
