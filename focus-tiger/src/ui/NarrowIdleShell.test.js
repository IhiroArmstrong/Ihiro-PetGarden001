import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'NarrowIdleShell.js'), 'utf8');

test('narrow drawer rows have :active press (Journey log 0–1s)', () => {
  assert.match(src, /\.ft-narrow-sheet__item:active:not\(:disabled\)/);
});
