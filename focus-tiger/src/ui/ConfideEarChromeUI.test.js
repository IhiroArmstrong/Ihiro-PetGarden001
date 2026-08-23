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
  assert.match(src, /CONFIDE_EAR_TOOLTIP/);
  assert.match(src, /\.confide-ear-chrome:active/);
  assert.match(src, /@media \(max-width: 479px\)/);
});

test('constructor does not call canShow (boot must not touch later overlay refs)', () => {
  assert.match(src, /this\.btn\.hidden = true;/);
  assert.doesNotMatch(
    src,
    /onLocaleChange\(\(\) => this\._refreshLabel\(\)\);\s*this\.sync\(\);/
  );
});

test('main.js predeclares Arrival / Honesty UI so ear canOpen cannot TDZ', () => {
  const main = readFileSync(join(here, '../main.js'), 'utf8');
  assert.match(main, /let honestyCheckInUI = null;/);
  assert.match(main, /let arrivalPractice = null;/);
});

test('wide ear chrome stays ghost-quiet until hover or keyboard focus', () => {
  assert.match(src, /opacity: 0\.3;/);
  assert.match(src, /opacity: 0\.8;/);
  assert.match(src, /confide-ear-chrome__tip/);
  assert.match(src, /role', 'tooltip'/);
  assert.doesNotMatch(src, /this\.btn\.title\s*=/);
  assert.match(src, /@media \(hover: none\)/);
});
