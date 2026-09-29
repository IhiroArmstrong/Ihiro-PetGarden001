/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  SYSTEM_TTS_PROBE_SAMPLES,
  createTtsProvider,
  mapTtsFailureReason
} from './ttsProvider.js';

const mainSrc = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'main.js'),
  'utf8'
);

function sourceBetween(startMarker, endMarker) {
  const start = mainSrc.indexOf(startMarker);
  const end = mainSrc.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, `missing markers ${startMarker} / ${endMarker}`);
  return mainSrc.slice(start, end);
}

describe('systemTts lab probe window', () => {
  it('denies companion preload before either lab probe window opens', () => {
    assert.match(mainSrc, /registerLabProbeCompanionDenied/);
    assert.match(
      mainSrc,
      /function registerLabProbeCompanionDenied\(\) \{\s*ipcMain\.on\('desktop:companion-allowed', \(event\) => \{\s*event\.returnValue = false;/
    );
    for (const marker of ['if (isSystemTtsProbeMode()) {', 'if (isVoiceInputProbeMode()) {']) {
      const block = sourceBetween(marker, 'createMainWindow()');
      assert.match(block, /registerLabProbeCompanionDenied\(\)/);
    }
  });
});

describe('systemTts ttsProvider', () => {
  it('ships EN/JA probe samples', () => {
    assert.equal(SYSTEM_TTS_PROBE_SAMPLES['en-US'], 'Return to a single breath.');
    assert.equal(SYSTEM_TTS_PROBE_SAMPLES['ja-JP'], '一つの呼吸に戻りましょう。');
  });

  it('maps voice_unavailable to user-facing copy', () => {
    assert.match(
      mapTtsFailureReason({ error: 'voice_unavailable' }),
      /No system voice/
    );
  });

  it('interrupts an in-flight speak session when a new one starts', async () => {
    let stopCalls = 0;
    let speakCalls = 0;
    const provider = createTtsProvider({
      startSpeak: () => {
        speakCalls += 1;
        if (speakCalls === 1) {
          return {
            child: {
              stdin: { write() {}, destroyed: false },
              killed: false
            },
            started: Promise.resolve({ ok: true, phase: 'started', startLatencyMs: 10 }),
            finished: new Promise(() => {})
          };
        }
        return {
          child: {
            stdin: { write() {}, destroyed: false },
            killed: false
          },
          started: Promise.resolve({ ok: true, phase: 'started', startLatencyMs: 10 }),
          finished: Promise.resolve({
            ok: true,
            json: { ok: true, phase: 'finished', startLatencyMs: 10, durationMs: 20 }
          })
        };
      },
      stopSpeak: () => {
        stopCalls += 1;
        return true;
      }
    });
    void provider.speak('en-US', 'first line');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const result = await provider.speak('en-US', 'second line');
    assert.equal(stopCalls, 1);
    assert.equal(speakCalls, 2);
    assert.equal(result.ok, true);
  });
});
