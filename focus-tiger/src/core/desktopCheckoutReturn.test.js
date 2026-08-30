/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCheckoutSessionBody } from './desktopCheckoutReturn.js';

describe('desktopCheckoutReturn', () => {
  it('does not add returnSurface without desktop shell', () => {
    const prev = globalThis.desktopShell;
    delete globalThis.desktopShell;
    try {
      assert.deepEqual(buildCheckoutSessionBody({ email: 'a@b.co' }), {
        email: 'a@b.co'
      });
    } finally {
      if (prev !== undefined) globalThis.desktopShell = prev;
    }
  });

  it('marks desktop when isDesktopShellRuntime would be true', () => {
    const prev = globalThis.desktopShell;
    globalThis.desktopShell = { isDesktop: true };
    try {
      assert.deepEqual(buildCheckoutSessionBody({}), {
        returnSurface: 'desktop'
      });
    } finally {
      if (prev === undefined) delete globalThis.desktopShell;
      else globalThis.desktopShell = prev;
    }
  });
});
