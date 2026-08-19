/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getDesktopShellBridge,
  isDesktopShellRuntime,
  openCheckoutUrl,
  applyShellVisibilityToAttention
} from './desktopShell.js';

describe('desktopShell', () => {
  it('getDesktopShellBridge returns null without preload', () => {
    assert.equal(getDesktopShellBridge({}), null);
    assert.equal(getDesktopShellBridge({ desktopShell: null }), null);
    assert.equal(isDesktopShellRuntime({}), false);
  });

  it('isDesktopShellRuntime true only with isDesktop flag', () => {
    assert.equal(
      isDesktopShellRuntime({ desktopShell: { isDesktop: true } }),
      true
    );
    assert.equal(isDesktopShellRuntime({ desktopShell: {} }), false);
  });

  it('openCheckoutUrl uses openExternal in the shell (does not assign)', async () => {
    const opened = [];
    const assigned = [];
    const mode = await openCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test', {
      desktopShell: {
        isDesktop: true,
        openExternal: async (url) => {
          opened.push(url);
        }
      },
      assign: (url) => assigned.push(url)
    });
    assert.equal(mode, 'external');
    assert.deepEqual(opened, ['https://checkout.stripe.com/c/pay/cs_test']);
    assert.deepEqual(assigned, []);
  });

  it('openCheckoutUrl navigates in the browser', async () => {
    const assigned = [];
    const mode = await openCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test', {
      desktopShell: null,
      assign: (url) => assigned.push(url)
    });
    assert.equal(mode, 'navigate');
    assert.deepEqual(assigned, ['https://checkout.stripe.com/c/pay/cs_test']);
  });

  it('openCheckoutUrl rejects when openExternal fails (UI must show existing error copy)', async () => {
    await assert.rejects(
      () =>
        openCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test', {
          desktopShell: {
            isDesktop: true,
            openExternal: async () => {
              throw new Error('external_url_blocked');
            }
          },
          assign: () => {
            throw new Error('must_not_navigate');
          }
        }),
      /external_url_blocked/
    );
  });

  it('applyShellVisibilityToAttention maps tray hideReason onto AttentionSignals', () => {
    const reasons = [];
    applyShellVisibilityToAttention(
      { setHideReason: (reason) => reasons.push(reason) },
      { hidden: true, hideReason: 'tray' }
    );
    applyShellVisibilityToAttention(
      { setHideReason: (reason) => reasons.push(reason) },
      { hidden: false, hideReason: 'none' }
    );
    assert.deepEqual(reasons, ['tray', 'none']);
  });
});
