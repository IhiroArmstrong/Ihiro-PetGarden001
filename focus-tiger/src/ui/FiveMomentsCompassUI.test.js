import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'FiveMomentsCompassUI.js'), 'utf8');

test('Compass moment chips and card buttons have :active press (Z Reflect)', () => {
  assert.match(src, /\.five-moments-compass__moment:active:not\(:disabled\)/);
  assert.match(src, /\.five-moments-compass__btn:active/);
});
