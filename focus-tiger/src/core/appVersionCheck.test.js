import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatSoftUpdateLabel,
  isUpdateAvailable,
  parseVersionManifest,
  readForceUpdatePromptFlag,
  shouldRevealSoftUpdatePrompt
} from './appVersionCheck.js';

describe('appVersionCheck', () => {
  it('parseVersionManifest requires buildId', () => {
    assert.equal(parseVersionManifest(null), null);
    assert.equal(parseVersionManifest({ version: '1.0.0' }), null);
    assert.deepEqual(parseVersionManifest({ buildId: 'abc' }), {
      buildId: 'abc',
      version: 'abc'
    });
    assert.deepEqual(
      parseVersionManifest({ version: '1.2.3', buildId: 'sha' }),
      { version: '1.2.3', buildId: 'sha' }
    );
  });

  it('isUpdateAvailable only when build ids differ (or force)', () => {
    assert.equal(
      isUpdateAvailable({ localBuildId: 'a', remoteBuildId: 'a' }),
      false
    );
    assert.equal(
      isUpdateAvailable({ localBuildId: 'a', remoteBuildId: 'b' }),
      true
    );
    assert.equal(
      isUpdateAvailable({ localBuildId: '', remoteBuildId: 'b' }),
      false
    );
    assert.equal(
      isUpdateAvailable({
        localBuildId: 'a',
        remoteBuildId: 'a',
        force: true
      }),
      true
    );
  });

  it('shouldRevealSoftUpdatePrompt hides when busy or no update', () => {
    assert.equal(
      shouldRevealSoftUpdatePrompt({
        updateAvailable: true,
        busySession: false
      }),
      true
    );
    assert.equal(
      shouldRevealSoftUpdatePrompt({
        updateAvailable: true,
        busySession: true
      }),
      false
    );
    assert.equal(
      shouldRevealSoftUpdatePrompt({
        updateAvailable: false,
        busySession: false
      }),
      false
    );
  });

  it('formatSoftUpdateLabel substitutes {version}', () => {
    assert.equal(
      formatSoftUpdateLabel('Update to Ver {version}', '1.0.1'),
      'Update to Ver 1.0.1'
    );
  });

  it('readForceUpdatePromptFlag', () => {
    assert.equal(readForceUpdatePromptFlag('?product=1'), false);
    assert.equal(
      readForceUpdatePromptFlag('?forceUpdatePrompt=1&product=1'),
      true
    );
  });
});
