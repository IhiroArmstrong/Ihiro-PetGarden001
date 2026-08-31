/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { supportPaidCardPresentation } from './supportPaidCardPresentation.js';

describe('supportPaidCardPresentation', () => {
  it('hides Pro and add-on before Lifetime, with no settled cards', () => {
    const p = supportPaidCardPresentation({});
    assert.equal(p.sanctuarySettled, false);
    assert.equal(p.showPro, true);
    assert.equal(p.showAddon, false);
    assert.equal(p.addonSettled, false);
    assert.equal(p.showWebLocalAiNote, true);
  });

  it('after Lifetime keeps Sanctuary faded and shows the add-on card', () => {
    const p = supportPaidCardPresentation({ lifetimeActive: true });
    assert.equal(p.sanctuarySettled, true);
    assert.equal(p.showPro, false);
    assert.equal(p.showAddon, true);
    assert.equal(p.addonSettled, false);
    assert.equal(p.showWebLocalAiNote, true);
  });

  it('after add-on payment keeps the add-on card faded instead of hiding it', () => {
    const p = supportPaidCardPresentation({
      lifetimeActive: true,
      addonActive: true
    });
    assert.equal(p.showAddon, true);
    assert.equal(p.addonSettled, true);
    assert.equal(p.sanctuarySettled, true);
  });

  it('omits the web Local AI note inside the Electron shell', () => {
    const p = supportPaidCardPresentation({
      lifetimeActive: true,
      isDesktopShell: true
    });
    assert.equal(p.showWebLocalAiNote, false);
    assert.equal(p.showAddon, true);
  });
});
