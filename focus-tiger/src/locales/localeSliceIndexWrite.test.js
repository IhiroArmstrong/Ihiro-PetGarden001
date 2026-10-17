/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, statSync, unlinkSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  LOCALE_SLICE_INDEX_LOCK_ENV,
  MODULE_PATH,
  REWRITE_PROBE_PATH,
  writeLocaleSliceIndex
} from '../../scripts/write-locale-slice-index.js';

test('refuses to rewrite the live index while tests are locked', () => {
  const prev = process.env[LOCALE_SLICE_INDEX_LOCK_ENV];
  process.env[LOCALE_SLICE_INDEX_LOCK_ENV] = '1';
  try {
    assert.throws(
      () => writeLocaleSliceIndex(),
      /frozen during parallel tests/
    );
  } finally {
    if (prev === undefined) delete process.env[LOCALE_SLICE_INDEX_LOCK_ENV];
    else process.env[LOCALE_SLICE_INDEX_LOCK_ENV] = prev;
  }
});

test('locale slice index rewrite does not break concurrent importers', async () => {
  const liveMtime = existsSync(MODULE_PATH) ? statSync(MODULE_PATH).mtimeMs : null;
  writeLocaleSliceIndex(REWRITE_PROBE_PATH);
  const moduleUrl = pathToFileURL(REWRITE_PROBE_PATH).href;
  const code = `const { LOCALE_SLICES } = await import('${moduleUrl}');
if (!Array.isArray(LOCALE_SLICES) || typeof LOCALE_SLICES[0]?.filename !== 'string') process.exit(2);`;
  const children = Array.from({ length: 8 }, () =>
    spawn(process.execPath, ['--input-type=module', '-e', code])
  );
  for (let i = 0; i < 30; i++) {
    writeLocaleSliceIndex(REWRITE_PROBE_PATH);
  }
  const exits = await Promise.all(
    children.map(
      (child) =>
        new Promise((resolve) => {
          child.on('exit', (code) => resolve(code));
        })
    )
  );
  try {
    assert.deepEqual(exits, Array(8).fill(0));
    if (liveMtime != null) {
      assert.equal(
        statSync(MODULE_PATH).mtimeMs,
        liveMtime,
        'this test is red if the rewrite probe touches the live locale index'
      );
    }
  } finally {
    unlinkSync(REWRITE_PROBE_PATH);
  }
});
