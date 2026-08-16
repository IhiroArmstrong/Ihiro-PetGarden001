#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Run Playwright specs that lock VISIBILITY_CONTRACTS anchors.
 * CI: triggered when suppress/hide-related paths change.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listVisibilityE2eSpecFiles } from '../src/core/visibilityContractRegistry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const specs = listVisibilityE2eSpecFiles();

if (specs.length === 0) {
  console.error('[test:e2e:visibility] no e2e specs derived from registry');
  process.exit(1);
}

console.log('[test:e2e:visibility] running:', specs.join(', '));

const result = spawnSync(
  'npx',
  ['playwright', 'test', ...specs],
  {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  }
);

process.exit(result.status ?? 1);
