import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canEnterImmersivePresence,
  formatMmSs,
  supportsDocumentPictureInPicture,
  supportsElementFullscreen
} from './immersivePresenceSupport.js';

describe('immersivePresenceSupport', () => {
  it('allows enter only while focusing and not completion-pending', () => {
    assert.equal(canEnterImmersivePresence({ isFocusing: true }), true);
    assert.equal(
      canEnterImmersivePresence({ isFocusing: true, completionPending: false }),
      true
    );
    assert.equal(canEnterImmersivePresence({ isFocusing: false }), false);
    assert.equal(
      canEnterImmersivePresence({ isFocusing: true, completionPending: true }),
      false
    );
  });

  it('detects missing Document PiP without throwing', () => {
    assert.equal(supportsDocumentPictureInPicture({}), false);
    assert.equal(
      supportsDocumentPictureInPicture({
        documentPictureInPicture: { requestWindow: async () => ({}) }
      }),
      true
    );
  });

  it('detects fullscreen helpers without throwing', () => {
    assert.equal(
      supportsElementFullscreen({
        documentElement: {}
      }),
      false
    );
    assert.equal(
      supportsElementFullscreen({
        documentElement: { requestFullscreen: async () => {} }
      }),
      true
    );
  });
});

describe('formatMmSs', () => {
  it('pads minutes and seconds', () => {
    assert.equal(formatMmSs(0), '00:00');
    assert.equal(formatMmSs(65), '01:05');
    assert.equal(formatMmSs(3599), '59:59');
  });
});
