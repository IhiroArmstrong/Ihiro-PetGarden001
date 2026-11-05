/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FILE_HEADER_COPYRIGHT_LINE,
  FILE_HEADER_OWNERSHIP,
  FILE_HEADER_PRODUCT_LINE,
  PURPOSE_COLOPHON_BYLINE,
  PURPOSE_COLOPHON_COPYRIGHT,
  PURPOSE_COLOPHON_KEYS,
  PURPOSE_COLOPHON_MARK
} from './copyrightNotice.js';
import {
  fileHasCopyrightHeader,
  listCopyrightHeaderFiles
} from '../../scripts/copyright-header.js';
import { mergeLocalePack } from '../locales/mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../locales/localeSliceModules.js';

const here = dirname(fileURLToPath(import.meta.url));

test('file-header ownership names Twinsology and the author', () => {
  assert.match(FILE_HEADER_OWNERSHIP, /Focus Tiger™ is a product of Twinsology/);
  assert.match(FILE_HEADER_OWNERSHIP, /Twinsology & Ihiro Armstrong/);
  assert.equal(
    FILE_HEADER_OWNERSHIP,
    `${FILE_HEADER_PRODUCT_LINE} ${FILE_HEADER_COPYRIGHT_LINE}`
  );
});

test('in-app colophon is creator-first (not the file-header legal line)', () => {
  assert.equal(PURPOSE_COLOPHON_MARK, 'Samatia™');
  assert.equal(
    PURPOSE_COLOPHON_BYLINE,
    'Created by Ihiro Armstrong / Twinsology'
  );
  assert.equal(
    PURPOSE_COLOPHON_COPYRIGHT,
    '© 2026 Ihiro Armstrong. All rights reserved.'
  );
  assert.deepEqual(PURPOSE_COLOPHON_KEYS, [
    'HINT_APP_PURPOSE_COLOPHON_MARK',
    'HINT_APP_PURPOSE_COLOPHON_BYLINE',
    'HINT_APP_PURPOSE_COLOPHON_COPYRIGHT'
  ]);
  assert.equal(PURPOSE_COLOPHON_COPYRIGHT.includes('Twinsology &'), false);
});

test('locale colophon keys match the in-app constants', () => {
  const localesDir = join(here, '../locales');
  const bases = {
    en: JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8')),
    ja: JSON.parse(readFileSync(join(localesDir, 'ja.json'), 'utf8')),
    zh: JSON.parse(readFileSync(join(localesDir, 'zh.json'), 'utf8'))
  };
  const { dictionaries, errors } = mergeLocalePack(bases, LOCALE_SLICES);
  assert.equal(errors.length, 0, errors.join('; '));
  for (const locale of ['en', 'ja', 'zh']) {
    const map = dictionaries[locale];
    assert.equal(map.HINT_APP_PURPOSE_COLOPHON_MARK, PURPOSE_COLOPHON_MARK);
    assert.equal(map.HINT_APP_PURPOSE_COLOPHON_BYLINE, PURPOSE_COLOPHON_BYLINE);
    assert.equal(
      map.HINT_APP_PURPOSE_COLOPHON_COPYRIGHT,
      PURPOSE_COLOPHON_COPYRIGHT
    );
  }
});

test('first-party JS/CSS/HTML files carry the copyright header', () => {
  const files = listCopyrightHeaderFiles();
  assert.ok(files.length > 50, 'expected a non-trivial first-party set');
  const missing = files.filter((p) => !fileHasCopyrightHeader(p));
  assert.deepEqual(missing, [], missing.join('\n'));
});
