#!/usr/bin/env node
/**
 * Lightweight local Playwright runner: requires explicit spec paths / args.
 * Example: npm run test:e2e:changed -- e2e/foo.spec.js
 *
 * No CI gate — for small, intentional local checks only.
 * Full suite: CI (when available) or RUN_E2E_LOCAL=true npm run test:e2e
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    [
      'Usage: npm run test:e2e:changed -- e2e/foo.spec.js [more playwright args…]',
      'Pass at least one spec path (or other `playwright test` args).',
      'Full suite is gated: use CI, or RUN_E2E_LOCAL=true npm run test:e2e'
    ].join('\n')
  );
  process.exit(1);
}

const result = spawnSync('npx', ['playwright', 'test', ...args], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.exit(result.status ?? 1);
