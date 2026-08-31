/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hintsSrc = readFileSync(
  join(here, '../ui/OnboardingHintsUI.js'),
  'utf8'
);

describe('purpose card hover grace + left-ball no mint', () => {
  it('defines PURPOSE_HOVER_HIDE_GRACE_MS in the 200–500ms bridge band', () => {
    const m = hintsSrc.match(
      /export const PURPOSE_HOVER_HIDE_GRACE_MS\s*=\s*(\d+)/
    );
    assert.ok(m, 'PURPOSE_HOVER_HIDE_GRACE_MS export missing');
    const ms = Number(m[1]);
    assert.ok(ms >= 200);
    assert.ok(ms <= 500);
  });

  it('schedules hide on leave and cancels on re-enter (source contract)', () => {
    assert.match(hintsSrc, /_schedulePurposeHoverHide/);
    assert.match(hintsSrc, /_cancelPurposeHoverHide/);
    assert.match(hintsSrc, /NO_MINT_PULSE_HINT_IDS/);
    assert.match(hintsSrc, /'quick-start'/);
  });

  it('hover opens adjacent card without backdrop; click pins modal', () => {
    assert.match(hintsSrc, /_purposePinned/);
    assert.match(hintsSrc, /onboarding-app-purpose--pinned/);
    assert.match(hintsSrc, /ft-purpose-pinned/);
    assert.match(hintsSrc, /_positionPurposeCard\(\)/);
    assert.match(
      hintsSrc,
      /purposeBackdrop\.hidden = true[\s\S]*pinned/
    );
  });

  it('Privacy sheet opt-in lives in the scroll body; outside tap dismisses', () => {
    assert.match(
      hintsSrc,
      /sheet\.append\(title, body, back\);\s*body\.append\(ypeOptIn, optIn/
    );
    assert.match(hintsSrc, /isPrivacySheetOpen\(\)/);
    assert.match(hintsSrc, /_showPrivacyBackdrop\(\)/);
    assert.match(hintsSrc, /_dismissPrivacyAndPurpose\(\)/);
    assert.match(
      hintsSrc,
      /if \(privacyOpen\) \{[\s\S]*_dismissPrivacyAndPurpose/
    );
    assert.match(
      hintsSrc,
      /if \(this\.privacySheet && !this\.privacySheet\.hidden\) \{[\s\S]*_dismissPrivacyAndPurpose/
    );
  });

  it('Focus HUD click tips bind host hover and skip floating mint pulses', () => {
    assert.match(hintsSrc, /HOST_HOVER_NO_PULSE_HINT_IDS/);
    assert.match(hintsSrc, /_syncHudHostHover/);
    assert.match(hintsSrc, /_bindLiteralHostHover/);
    assert.match(hintsSrc, /literalOnScreenAnchor/);
    for (const id of [
      'focus-hud-ring',
      'focus-hud-progress',
      'focus-hud-streak'
    ]) {
      assert.match(
        hintsSrc,
        new RegExp(`HOST_HOVER_NO_PULSE_HINT_IDS[\\s\\S]*'${id}'`)
      );
    }
  });
});
