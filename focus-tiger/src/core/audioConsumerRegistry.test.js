/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AUDIO_CONSUMERS,
  SPEAK_SYSTEM_TTS_INFRA_FILES
} from './audioConsumerRegistry.js';
import { readFileSync as read } from 'node:fs';

const SRC_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_ROOT = join(SRC_ROOT, '..');

/**
 * @param {string} dir
 * @returns {string[]}
 */
function walkJs(dir) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkJs(full));
      continue;
    }
    if (!name.endsWith('.js')) continue;
    out.push(full);
  }
  return out;
}

describe('audioConsumerRegistry', () => {
  it('lists guided meditation under the Voice announcements switch', () => {
    const row = AUDIO_CONSUMERS.find((item) => item.id === 'guided-meditation-speech');
    assert.equal(row?.gate, 'system-tts-announcements');
    const src = read(
      new URL('./guidedMeditationSpeech.js', import.meta.url),
      'utf8'
    );
    assert.match(src, /isSystemTtsAnnouncementsEnabled/);
  });

  it('fails when speakSystemTts appears outside the census', () => {
    const allowed = new Set([
      ...AUDIO_CONSUMERS.map((row) => row.file),
      ...SPEAK_SYSTEM_TTS_INFRA_FILES
    ]);
    const offenders = [];
    for (const file of walkJs(SRC_ROOT)) {
      const rel = relative(PKG_ROOT, file).split('\\').join('/');
      const text = readFileSync(file, 'utf8');
      if (!text.includes('speakSystemTts(')) continue;
      if (allowed.has(rel)) continue;
      if (rel.endsWith('.test.js')) continue;
      offenders.push(rel);
    }
    assert.deepEqual(offenders, []);
  });
});
