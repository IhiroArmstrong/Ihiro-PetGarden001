/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RESEARCH_SCHEMA_REL,
  collectResearchSchemaStringViolations,
  forbiddenCoPracticeResearchImportHit,
  scanCoPracticeResearchUploadDeps,
  validateResearchPayloadSchemaStrings
} from './check-co-practice-research-ci.js';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('T81 S4(a) research payload schema strings', () => {
  it('frozen SSOT schema has no free-text string fields', () => {
    const schema = JSON.parse(
      readFileSync(join(PKG_ROOT, RESEARCH_SCHEMA_REL), 'utf8')
    );
    const hits = validateResearchPayloadSchemaStrings(schema);
    assert.equal(hits.length, 0, hits.join('; '));
  });

  it('flags a bare string property without enum or frozen pattern', () => {
    const hits = collectResearchSchemaStringViolations({
      type: 'object',
      properties: {
        note: { type: 'string' }
      }
    });
    assert.ok(hits.some((h) => h.includes('.properties.note')));
  });

  it('allows frozen week pattern and locale enum', () => {
    const hits = collectResearchSchemaStringViolations({
      type: 'object',
      properties: {
        week: { type: 'string', pattern: '^[0-9]{4}-W[0-9]{2}$' },
        locale: { type: 'string', enum: ['en'] }
      }
    });
    assert.equal(hits.length, 0);
  });
});

describe('T81 S4(b) upload module dependency graph', () => {
  it('allows confide observation telemetry only', () => {
    assert.equal(
      forbiddenCoPracticeResearchImportHit('./confide/confideObservationTelemetry.js'),
      null
    );
  });

  it('rejects emotion bucket and memory modules', () => {
    assert.ok(forbiddenCoPracticeResearchImportHit('./confide/confideRoutes.js'));
    assert.ok(forbiddenCoPracticeResearchImportHit('./yinPersonalMemoryStore.js'));
  });

  it('scanner catches forbidden import in fixture source', () => {
    const hits = scanCoPracticeResearchUploadDeps(
      'fixture/coPracticeResearchBad.js',
      `import x from './confide/confideClassify.js';\n`
    );
    assert.equal(hits.length, 1);
    assert.match(hits[0], /confideClassify/);
  });
});
