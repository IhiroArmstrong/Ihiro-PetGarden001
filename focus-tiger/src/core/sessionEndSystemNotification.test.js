/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  shouldOfferSessionEndSystemNotification,
  showSessionEndSystemNotification
} from './sessionEndSystemNotification.js';

describe('sessionEndSystemNotification', () => {
  it('offers notification only when app or tab is hidden', () => {
    assert.equal(
      shouldOfferSessionEndSystemNotification({
        documentHidden: false,
        shellHidden: false
      }),
      false
    );
    assert.equal(
      shouldOfferSessionEndSystemNotification({
        documentHidden: true,
        shellHidden: false
      }),
      true
    );
    assert.equal(
      shouldOfferSessionEndSystemNotification({
        documentHidden: false,
        shellHidden: true
      }),
      true
    );
  });

  it('uses desktop shell IPC when available', async () => {
    let called = false;
    const ok = await showSessionEndSystemNotification(
      { title: 't', body: 'b' },
      {
        desktopShell: {
          showSessionEndNotification: async (payload) => {
            called = true;
            assert.deepEqual(payload, { title: 't', body: 'b' });
          }
        }
      }
    );
    assert.equal(called, true);
    assert.equal(ok, true);
  });
});
