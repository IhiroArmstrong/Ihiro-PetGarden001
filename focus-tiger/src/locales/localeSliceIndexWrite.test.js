/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { writeLocaleSliceIndex, MODULE_PATH } from '../../scripts/write-locale-slice-index.js';

test('locale slice index rewrite does not break concurrent importers', async () => {
  writeLocaleSliceIndex();
  const moduleUrl = pathToFileURL(MODULE_PATH).href;
  const code = `const { LOCALE_SLICES } = await import('${moduleUrl}');
if (!Array.isArray(LOCALE_SLICES) || typeof LOCALE_SLICES[0]?.filename !== 'string') process.exit(2);`;
  const children = Array.from({ length: 8 }, () =>
    spawn(process.execPath, ['--input-type=module', '-e', code])
  );
  for (let i = 0; i < 30; i++) {
    writeLocaleSliceIndex();
  }
  const exits = await Promise.all(
    children.map(
      (child) =>
        new Promise((resolve) => {
          child.on('exit', (code) => resolve(code));
        })
    )
  );
  assert.deepEqual(exits, Array(8).fill(0));
});
