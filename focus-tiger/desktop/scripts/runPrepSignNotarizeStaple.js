/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Repeatable T95 prep-week pipeline:
 *   pack (Developer ID sign) → notarize → staple → llama GUI probe
 *
 * Skip steps with env:
 *   FT_PREP_SKIP_PACK=1
 *   FT_PREP_SKIP_NOTARIZE=1
 *   FT_PREP_SKIP_STAPLE=1
 *   FT_PREP_SKIP_PROBE=1
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function runNpm(script) {
  const run = spawnSync('npm', ['run', script], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  });
  return run.status ?? 1;
}

function runNodeScript(name) {
  const run = spawnSync(process.execPath, [path.join(desktopDir, 'scripts', name)], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: process.env
  });
  return run.status ?? 1;
}

const steps = [];

if (process.env.FT_PREP_SKIP_PACK !== '1') {
  steps.push(['pack:prep', () => runNpm('pack:prep')]);
}
if (process.env.FT_PREP_SKIP_NOTARIZE !== '1') {
  steps.push(['notarize:prep', () => runNodeScript('notarizePrepDmg.js')]);
}
if (process.env.FT_PREP_SKIP_STAPLE !== '1') {
  steps.push(['staple:prep', () => runNodeScript('staplePrepArtifacts.js')]);
}
if (process.env.FT_PREP_SKIP_PROBE !== '1') {
  steps.push(['probe llama', () => runNodeScript('probePackagedLlamaGui.js')]);
}

for (const [label, fn] of steps) {
  console.log(`prep pipeline: ${label}`);
  const code = fn();
  if (code !== 0) {
    console.error(`prep pipeline: stopped at ${label} (exit ${code})`);
    process.exit(code);
  }
}

console.log('prep pipeline: finished');