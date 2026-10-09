/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Compile desktop main-process JS to V8 bytecode with Electron's own V8.
 * Does not replace the default pack. .js files stay; .jsc is an extra artifact.
 *
 *   cd focus-tiger/desktop && npm run bytecode:compile
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bytecodeCompileRefusal } from './v8BytecodeGate.js';

const refusal = bytecodeCompileRefusal(process.versions);
if (refusal) {
  process.stderr.write(`${refusal}\n`);
  process.exit(1);
}

const { compileFile } = await import('bytenode');
const here = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(here, '..');
const targets = ['main.js', 'preload.js'];

for (const name of targets) {
  const filename = join(desktopRoot, name);
  const output = filename.replace(/\.js$/, '.jsc');
  await compileFile({ filename, output });
  process.stdout.write(`compiled ${output}\n`);
}
