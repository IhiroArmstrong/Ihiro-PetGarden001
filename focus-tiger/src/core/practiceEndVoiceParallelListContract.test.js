/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { listPracticeExperiences } from './practiceExperienceRegistry.js';

const srcRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {string} relativePath
 */
function readSrc(relativePath) {
  return fs.readFileSync(path.join(srcRoot, relativePath), 'utf8');
}

describe('practiceEndVoiceParallelListContract (A9 registry)', () => {
  it('each practice kind wires end-voice markers in its declared file', () => {
    for (const row of listPracticeExperiences()) {
      const src = readSrc(row.endVoiceWiringRelativePath);
      for (const marker of row.endVoiceWiringMarkers) {
        assert.ok(
          src.includes(marker),
          `${row.practiceKindId}: ${row.endVoiceWiringRelativePath} missing ${marker}`
        );
      }
    }
  });

  it('timed sit and breath micro-ritual both close with system_tts.focus_end in main.js', () => {
    const main = readSrc('main.js');
    assert.match(main, /maybeSpeakFocusEndAnnouncement\(\)/);
    const start = main.indexOf('function completeMicroRitual');
    const end = main.indexOf('function leaveMicroRitualQuietly');
    const body = main.slice(start, end);
    assert.match(body, /t\('system_tts\.focus_end'\)/);
  });
});
