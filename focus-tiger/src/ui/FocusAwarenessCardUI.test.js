import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COPY_POOLS } from '../locales/i18n.js';

const here = dirname(fileURLToPath(import.meta.url));

test('FOCUS_AWARENESS pool has six observational keys', () => {
  assert.equal(COPY_POOLS.FOCUS_AWARENESS.length, 6);
  for (const key of COPY_POOLS.FOCUS_AWARENESS) {
    assert.match(key, /^FOCUS_AWARENESS_\d+$/);
  }
});

test('FocusAwarenessCardUI source does not touch Moment Whisper gate', () => {
  const src = readFileSync(join(here, 'FocusAwarenessCardUI.js'), 'utf8');
  assert.equal(src.includes('momentWhispersGate'), false);
  assert.equal(src.includes('markMomentWhisperSeen'), false);
  assert.equal(src.includes('moment-whispers-seen'), false);
});
