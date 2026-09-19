/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONFIDE_TURNS_MAX_BYTES,
  pruneConfideTurnsJsonlContent,
  shouldKeepConfideTurnRow
} from './confideTurnsJsonlRetention.js';

const NOW = Date.parse('2026-09-20T12:00:00.000Z');

function row(kind, daysAgo) {
  const at = new Date(NOW - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  return JSON.stringify({ at, kind, text: 'sample' });
}

describe('confideTurnsJsonlRetention', () => {
  it('drops shadow audit rows older than 7 days but keeps recent ones', () => {
    assert.equal(
      shouldKeepConfideTurnRow(
        { at: new Date(NOW - 8 * 86400000).toISOString(), kind: 'semantic_shadow_classify' },
        NOW
      ),
      false
    );
    assert.equal(
      shouldKeepConfideTurnRow(
        { at: new Date(NOW - 2 * 86400000).toISOString(), kind: 'semantic_shadow_classify' },
        NOW
      ),
      true
    );
  });

  it('keeps l3_generate rows up to 30 days', () => {
    assert.equal(
      shouldKeepConfideTurnRow(
        { at: new Date(NOW - 20 * 86400000).toISOString(), kind: 'l3_generate' },
        NOW
      ),
      true
    );
    assert.equal(
      shouldKeepConfideTurnRow(
        { at: new Date(NOW - 31 * 86400000).toISOString(), kind: 'l3_generate' },
        NOW
      ),
      false
    );
  });

  it('prunes mixed kinds by simulated time', () => {
    const content = [
      row('semantic_shadow_classify', 10),
      row('semantic_shadow_classify', 1),
      row('l3_generate', 10),
      row('l3_generate', 40)
    ].join('\n');
    const result = pruneConfideTurnsJsonlContent(`${content}\n`, NOW);
    assert.equal(result.droppedByAge, 2);
    assert.equal(result.kept, 2);
    const kinds = result.content
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line).kind);
    assert.deepEqual(kinds, ['semantic_shadow_classify', 'l3_generate']);
  });

  it('trims oldest lines when byte cap exceeded', () => {
    const big = 'x'.repeat(200_000);
    const lines = Array.from({ length: 30 }, (_, i) =>
      JSON.stringify({
        at: new Date(NOW - i * 3600000).toISOString(),
        kind: 'l3_generate',
        payload: big
      })
    );
    const result = pruneConfideTurnsJsonlContent(`${lines.join('\n')}\n`, NOW);
    assert.ok(result.droppedByBytes > 0);
    assert.ok(new TextEncoder().encode(result.content).length <= CONFIDE_TURNS_MAX_BYTES);
  });
});
