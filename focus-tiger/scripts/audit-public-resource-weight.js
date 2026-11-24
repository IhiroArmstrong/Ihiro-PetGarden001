#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 *
 * Lists public/ weight for first-pack DMG extraResources planning.
 * SSOT: docs/task-briefs/task-first-pack-resource-weight-audit.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(rootDir, '..', 'public');

function walkPublic(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, ent.name);
      if (ent.isDirectory()) walk(abs);
      else {
        out.push({
          rel: path.relative(publicDir, abs).replaceAll(path.sep, '/'),
          bytes: fs.statSync(abs).size
        });
      }
    }
  }
  walk(dir);
  return out;
}

function mib(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

const files = walkPublic(publicDir);
if (files.length === 0) {
  console.error('audit-public-resource-weight: public/ missing or empty');
  process.exit(1);
}

const total = files.reduce((s, f) => s + f.bytes, 0);
const byTop = {};
for (const f of files) {
  const top = f.rel.split('/')[0] || '(root)';
  byTop[top] = (byTop[top] || 0) + f.bytes;
}

console.log('Focus Tiger · public/ resource weight');
console.log(`Total: ${(total / 1024 / 1024 / 1024).toFixed(3)} GiB · ${files.length} files\n`);

console.log('By top-level folder:');
for (const [name, bytes] of Object.entries(byTop).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${mib(bytes).padStart(12)}  ${name}`);
}

const sorted = [...files].sort((a, b) => b.bytes - a.bytes);
console.log('\nTop 10 files:');
sorted.slice(0, 10).forEach((f, i) => {
  console.log(`  ${i + 1}. ${mib(f.bytes).padStart(12)}  ${f.rel}`);
});

const robeRoot = path.join(publicDir, 'sprites', 'tiger-cub', 'monk-robe-default');
if (fs.existsSync(robeRoot)) {
  const seqs = [];
  for (const ent of fs.readdirSync(robeRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const seqDir = path.join(robeRoot, ent.name);
    const seqFiles = walkPublic(seqDir);
    const bytes = seqFiles.reduce((s, f) => s + f.bytes, 0);
    seqs.push({ name: ent.name, bytes, frames: seqFiles.length });
  }
  seqs.sort((a, b) => b.bytes - a.bytes);
  console.log('\nTop 10 sequences (monk-robe-default):');
  seqs.slice(0, 10).forEach((s, i) => {
    console.log(
      `  ${i + 1}. ${mib(s.bytes).padStart(12)}  ${s.frames} frames  ${s.name}`
    );
  });
}

console.log('\nOK · see docs/task-briefs/task-first-pack-resource-weight-audit.md');
