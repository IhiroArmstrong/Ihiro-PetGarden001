/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'ConfideEarChromeUI.js'), 'utf8');
const iconPng = join(here, '../../public/icons/icon-confide-to-yin.png');

test('wide ear chrome is a top-left Idle disc with press feedback', () => {
  assert.equal(existsSync(iconPng), true);
  assert.match(src, /ROOT_ID = 'confide-ear-chrome'/);
  assert.match(src, /left: max\(14px/);
  assert.match(src, /icon-confide-to-yin\.png/);
  assert.match(src, /CONFIDE_MENU_LABEL/);
  assert.match(src, /\.confide-ear-chrome:active/);
  assert.match(src, /@media \(max-width: 479px\)/);
});
