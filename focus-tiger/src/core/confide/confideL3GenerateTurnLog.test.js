/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { sanitizeL3GenerateTurnLogRecord } from '../../../desktop/companion/l3GenerateTurnLog.js';

const UTTERANCE = 'SENTINEL_USER_UTTERANCE_l3_generate_a1b2c3';

const runtimeUrl = new URL(
  '../../../desktop/companion/l1Runtime.js',
  import.meta.url
);

describe('l3 generate turn log must not keep the user utterance', () => {
  it('drops text and raw so a unique utterance cannot appear in the record', () => {
    const record = {
      kind: 'l3_generate',
      locale: 'en',
      text: UTTERANCE,
      raw: 'model-raw-must-also-leave',
      reply: 'Sit a while. Tea is still warm.',
      ok: true,
      verdict: 'pass'
    };
    const sanitized = sanitizeL3GenerateTurnLogRecord(record);
    assert.equal(Object.hasOwn(sanitized, 'text'), false);
    assert.equal(sanitized.raw, '');
    assert.equal(sanitized.textLength, UTTERANCE.length);
    assert.equal(typeof sanitized.queryHash, 'string');
    assert.match(sanitized.queryHash, /^[0-9a-f]{8}$/);
    assert.equal(sanitized.reply, record.reply);
    const dumped = JSON.stringify(sanitized);
    assert.equal(dumped.includes(UTTERANCE), false);
    assert.equal(dumped.includes('model-raw-must-also-leave'), false);
  });

  it('l1Runtime writes l3_generate only through the sanitizer', () => {
    const src = readFileSync(fileURLToPath(runtimeUrl), 'utf8');
    assert.match(src, /sanitizeL3GenerateTurnLogRecord/);
    assert.match(
      src,
      /kind === ['"]l3_generate['"][\s\S]{0,120}sanitizeL3GenerateTurnLogRecord/
    );
  });
});
