/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import {
  canEnterImmersivePresence,
  formatMmSs,
  hasDocumentPictureInPictureShape,
  markDocumentPictureInPictureUnavailable,
  needsDocumentPictureInPictureProbe,
  probeDocumentPictureInPicture,
  resetDocumentPictureInPictureProbeState,
  shouldShowDocumentPictureInPictureEntry,
  supportsElementFullscreen
} from './immersivePresenceSupport.js';

describe('immersivePresenceSupport', () => {
  beforeEach(() => {
    resetDocumentPictureInPictureProbeState();
  });

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

  it('detects missing Document PiP shape without throwing', () => {
    assert.equal(hasDocumentPictureInPictureShape({}), false);
    assert.equal(
      hasDocumentPictureInPictureShape({
        documentPictureInPicture: { requestWindow: async () => ({}) }
      }),
      true
    );
  });

  it('hides PiP entry on Electron until probe succeeds', async () => {
    const win = {
      desktopShell: { isDesktop: true },
      documentPictureInPicture: {
        requestWindow: async () => {
          throw new Error('not supported');
        }
      }
    };
    assert.equal(needsDocumentPictureInPictureProbe(win), true);
    assert.equal(shouldShowDocumentPictureInPictureEntry(win), false);
    const ok = await probeDocumentPictureInPicture(win);
    assert.equal(ok, false);
    assert.equal(shouldShowDocumentPictureInPictureEntry(win), false);
  });

  it('marks PiP unavailable after failed probe and hides entry', async () => {
    const win = {
      desktopShell: { isDesktop: true },
      documentPictureInPicture: {
        requestWindow: async () => ({ close() {} })
      }
    };
    assert.equal(await probeDocumentPictureInPicture(win), true);
    assert.equal(shouldShowDocumentPictureInPictureEntry(win), true);
    markDocumentPictureInPictureUnavailable();
    assert.equal(shouldShowDocumentPictureInPictureEntry(win), false);
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
