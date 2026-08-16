/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldIgnoreOutsideDismissTarget } from './outsideDismissGuard.js';

describe('shouldIgnoreOutsideDismissTarget', () => {
  it('ignores onboarding tip bubbles and help chrome', () => {
    const bubble = {
      closest: (sel) => (sel === 'ft-onboarding-hint-bubble' ? {} : null)
    };
    const purpose = {
      closest: (sel) => (sel === '#onboarding-app-purpose' ? {} : null)
    };
    const help = {
      closest: (sel) => (sel === '#onboarding-hint-help' ? {} : null)
    };
    const narrowHelp = {
      closest: (sel) => (sel === '#ft-narrow-help-btn' ? {} : null)
    };
    const blank = { closest: () => null };

    assert.equal(shouldIgnoreOutsideDismissTarget(bubble), true);
    assert.equal(shouldIgnoreOutsideDismissTarget(purpose), true);
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#onboarding-privacy-sheet' ? {} : null)
      }),
      true
    );
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#onboarding-wellness-first' ? {} : null)
      }),
      true
    );
    assert.equal(shouldIgnoreOutsideDismissTarget(help), true);
    assert.equal(shouldIgnoreOutsideDismissTarget(narrowHelp), true);
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#ft-narrow-home-quickstart' ? {} : null)
      }),
      true
    );
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#ft-hint-catalog-chip' ? {} : null)
      }),
      true
    );
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#ft-wide-more-menu' ? {} : null)
      }),
      true
    );
    assert.equal(
      shouldIgnoreOutsideDismissTarget({
        closest: (sel) => (sel === '#ft-narrow-options-drawer' ? {} : null)
      }),
      true
    );
    assert.equal(shouldIgnoreOutsideDismissTarget(blank), false);
    assert.equal(shouldIgnoreOutsideDismissTarget(null), false);
  });
});
