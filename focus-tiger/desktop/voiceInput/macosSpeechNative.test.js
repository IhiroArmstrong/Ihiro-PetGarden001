/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { macosSpeechHelperLayout, macosSpeechHelperPath, parseMacosSpeechHelperStdout } from './macosSpeechNative.js';

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
});
