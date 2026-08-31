/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCheckoutErrorOverlay } from './checkoutErrorOverlayPolicy.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('resolveCheckoutErrorOverlay', () => {
  it('keeps an open card so the error line can update', () => {
    assert.equal(
      resolveCheckoutErrorOverlay({ overlayOpen: true, userDismissed: false }),
      'show-on-open'
    );
  });

  it('does not reopen after the user closed the card', () => {
    assert.equal(
      resolveCheckoutErrorOverlay({ overlayOpen: false, userDismissed: true }),
      'leave-closed'
    );
  });

  it('does not reopen a closed card even if dismiss was not flagged', () => {
    assert.equal(
      resolveCheckoutErrorOverlay({ overlayOpen: false, userDismissed: false }),
      'leave-closed'
    );
  });
});

describe('Sanctuary / Membership / Tip jar wire the policy', () => {
  it('SanctuaryUnlockUI uses the helper and does not reopen on error', () => {
    const src = readFileSync(join(root, 'ui/SanctuaryUnlockUI.js'), 'utf8');
    assert.match(src, /resolveCheckoutErrorOverlay/);
    assert.doesNotMatch(src, /if \(!this\._open\) this\.open\(\)/);
  });

  it('MembershipUnlockUI checkout error does not reopen', () => {
    const src = readFileSync(join(root, 'ui/MembershipUnlockUI.js'), 'utf8');
    assert.match(src, /resolveCheckoutErrorOverlay/);
  });

  it('Support backdrop does not steal clicks while fading', () => {
    const src = readFileSync(join(root, 'ui/SupportYinModalUI.js'), 'utf8');
    assert.match(src, /\.yin-support-backdrop \{[\s\S]*pointer-events: none;/);
    assert.match(src, /\.yin-support-backdrop\.is-visible \{[\s\S]*pointer-events: auto;/);
    assert.match(src, /\.yin-support-modal \{[\s\S]*pointer-events: none;/);
    assert.match(src, /\.yin-support-modal\.is-visible \{[\s\S]*pointer-events: auto;/);
  });

  it('Vite dev proxies /api so feature-branch ports are not CORS-blocked', () => {
    const src = readFileSync(join(root, '../vite.config.js'), 'utf8');
    assert.match(src, /proxy:\s*\{/);
    assert.match(src, /['"]\/api['"]/);
    assert.match(src, /focus-tiger-cloud\.ihiro\.workers\.dev/);
  });
});
