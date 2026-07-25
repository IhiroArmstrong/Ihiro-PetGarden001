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
    assert.equal(shouldIgnoreOutsideDismissTarget(help), true);
    assert.equal(shouldIgnoreOutsideDismissTarget(narrowHelp), true);
    assert.equal(shouldIgnoreOutsideDismissTarget(blank), false);
    assert.equal(shouldIgnoreOutsideDismissTarget(null), false);
  });
});
