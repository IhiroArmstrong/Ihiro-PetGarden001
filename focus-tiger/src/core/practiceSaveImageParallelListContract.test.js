/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { listPracticeSaveImageArtifacts } from './practiceExperienceRegistry.js';

const coreRoot = path.dirname(fileURLToPath(import.meta.url));

describe('practiceSaveImageParallelListContract (A9 registry)', () => {
  it('each save-image artifact declares builder markers in its module', () => {
    for (const row of listPracticeSaveImageArtifacts()) {
      const modulePath = path.join(coreRoot, row.builderModule);
      const src = fs.readFileSync(modulePath, 'utf8');
      for (const marker of row.builderSourceMarkers) {
        assert.ok(
          src.includes(marker),
          `${row.artifactId}: ${row.builderModule} missing ${marker}`
        );
      }
      if (row.builderExport) {
        assert.ok(
          src.includes(`export function ${row.builderExport}`) ||
            src.includes(`function ${row.builderExport}`),
          `${row.artifactId} missing export ${row.builderExport}`
        );
      }
    }
  });
});
