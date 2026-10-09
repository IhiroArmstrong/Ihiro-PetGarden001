/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { listAllKbLiveEntryRows } from '../src/core/kbLiveEntryRegistry.js';
import { renderInternalHandbook } from './write-internal-handbook.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('internal handbook', () => {
  it('lists every live entry and forbids pasting into the recitable catalog', () => {
    const rows = listAllKbLiveEntryRows();
    const md = renderInternalHandbook(rows);
    assert.match(md, /Do not paste this file into `product-knowledge-base.md`/);
    for (const row of rows) {
      assert.match(md, new RegExp(row.id));
    }
    const onDisk = readFileSync(
      join(here, '../docs/internal-handbook/live-surfaces.md'),
      'utf8'
    );
    assert.equal(onDisk, md);
  });
});
