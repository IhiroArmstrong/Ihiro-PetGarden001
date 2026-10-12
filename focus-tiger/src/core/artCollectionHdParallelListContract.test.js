/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { listArtCollectionHdIds } from './artCollectionCatalog.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const cloudCatalogPath = path.join(
  here,
  '../../cloud/src/lib/artCollectionCatalog.ts'
);

describe('artCollectionHdParallelListContract (A3)', () => {
  it('every client hdId appears in the Worker catalog mirror', () => {
    const cloudSrc = fs.readFileSync(cloudCatalogPath, 'utf8');
    for (const hdId of listArtCollectionHdIds()) {
      assert.match(
        cloudSrc,
        new RegExp(`"${hdId}"`),
        `cloud artCollectionCatalog.ts missing hdId ${hdId}`
      );
    }
  });
});
