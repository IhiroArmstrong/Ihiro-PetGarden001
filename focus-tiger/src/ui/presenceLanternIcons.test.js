/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'presenceLanternIcons.js'), 'utf8');

test('exports svg lantern builders with unique gradient ids', () => {
  assert.match(src, /export function createGlobalLanternIcon/);
  assert.match(src, /export function createCircleLanternIcon/);
  assert.match(src, /export function createPresenceLanternShell/);
  assert.match(src, /\$\{kind\}-presence-lantern-grad-\$\{index\}/);
});

test('global lantern uses warm gold palette and paper-lantern silhouette', () => {
  assert.match(src, /#FFE9B8/);
  assert.match(src, /#D4A24A/);
  assert.match(src, /stroke-dasharray': '1 1'/);
  assert.match(src, /width: '14'/);
});

test('circle lantern supports was-here muted palette', () => {
  assert.match(src, /variant === 'was-here'/);
  assert.match(src, /#DCE4EE/);
  assert.match(src, /focus-circle-presence__lantern--was-here/);
});
