/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HELP_OUTSIDE_DISMISS,
  resolveHelpOutsideDismissAction
} from './helpOverlayOutsideDismiss.js';

const closed = {
  wellnessFirstOpen: false,
  wellnessFirstContains: false,
  wellnessDetailOpen: false,
  wellnessDetailContains: false,
  privacyOpen: false,
  privacyContains: false,
  purposeOpen: false,
  purposeContains: false,
  helpContains: false
};

describe('resolveHelpOutsideDismissAction', () => {
  it('closes Privacy when purpose is hidden and the tap is outside the sheet', () => {
    assert.equal(
      resolveHelpOutsideDismissAction({
        ...closed,
        privacyOpen: true,
        privacyContains: false,
        purposeOpen: false
      }),
      HELP_OUTSIDE_DISMISS.CLOSE_PRIVACY
    );
  });

  it('does not close Privacy when the tap is inside the sheet', () => {
    assert.equal(
      resolveHelpOutsideDismissAction({
        ...closed,
        privacyOpen: true,
        privacyContains: true,
        purposeOpen: false
      }),
      HELP_OUTSIDE_DISMISS.IGNORE
    );
  });

  it('closes purpose when Privacy is not open and tap is blank', () => {
    assert.equal(
      resolveHelpOutsideDismissAction({
        ...closed,
        purposeOpen: true,
        purposeContains: false
      }),
      HELP_OUTSIDE_DISMISS.CLOSE_PURPOSE
    );
  });
});
