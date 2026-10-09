/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  macosSpeechHelperLayout,
  macosSpeechHelperPath,
  createSpeechHelperLineReader,
  parseMacosSpeechHelperJsonLines,
  parseMacosSpeechHelperStdout
} from './macosSpeechNative.js';

describe('macosSpeechNative helper layout', () => {
  it('places the binary inside a .app so Speech TCC can attach', () => {
    const layout = macosSpeechHelperLayout('/tmp/ft-speech-layout-test');
    assert.equal(path.basename(layout.appDir), 'FocusTigerSpeechHelper.app');
    assert.equal(
      layout.binPath,
      path.join(layout.appDir, 'Contents', 'MacOS', 'macos-speech-helper')
    );
    assert.equal(layout.plistPath, path.join(layout.appDir, 'Contents', 'Info.plist'));
    assert.equal(macosSpeechHelperPath().endsWith('FocusTigerSpeechHelper.app/Contents/MacOS/macos-speech-helper'), true);
  });

  it('maps a helper abort with empty stdout to helper_crashed', () => {
    const json = parseMacosSpeechHelperStdout('', 134, '');
    assert.equal(json.error, 'helper_crashed');
    assert.equal(json.ok, false);
    assert.equal(json.exitCode, 134);
  });

  it('parses multi-line speak stdout for started/finished phases', () => {
    const stdout = [
      '{"command":"speak","ok":true,"phase":"started","startLatencyMs":120}',
      '{"command":"speak","ok":true,"phase":"finished","startLatencyMs":120,"durationMs":1800}'
    ].join('\n');
    const lines = parseMacosSpeechHelperJsonLines(stdout);
    assert.equal(lines.length, 2);
    assert.equal(lines[0].phase, 'started');
    assert.equal(lines[1].phase, 'finished');
  });

  it('keeps the transcript when live level lines come first', () => {
    const stdout = [
      '{"command":"level","ok":true,"rms":0.02}',
      '{"command":"transcribe","ok":true,"transcript":"hello"}'
    ].join('\n');
    const json = parseMacosSpeechHelperStdout(stdout, 0, '');
    assert.equal(json.command, 'transcribe');
    assert.equal(json.transcript, 'hello');
  });

  it('reads live level lines as they arrive', () => {
    const seen = [];
    const read = createSpeechHelperLineReader((json) => {
      if (json.command === 'level' && Number.isFinite(Number(json.rms))) {
        seen.push(Number(json.rms));
      }
    });
    read('{"command":"level","ok":true,"rms":0.02}\n');
    read('{"command":"level","rms":"nope"}\n{"command":"transcribe","ok":true}\n');
    assert.deepEqual(seen, [0.02]);
  });
});
