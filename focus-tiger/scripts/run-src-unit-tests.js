/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Run every src unit test file (name ends with .test.js) via node --test <files…>.
 * Portable on Node 20+ (CI): a quoted glob like "src/**" + "/*.test.js" is treated
 * as a literal path and fails with "Could not find …".
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const srcRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'src');

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectTestFiles(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await collectTestFiles(p)));
    } else if (ent.name.endsWith('.test.js')) {
      out.push(p);
    }
  }
  return out;
}

const files = (await collectTestFiles(srcRoot)).sort();
if (files.length === 0) {
  console.error('[run-src-unit-tests] no *.test.js under src/');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit'
});
process.exit(result.status === null ? 1 : result.status);
