/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

describe('ConfideToYinUI consent wiring', () => {
  it('opens the in-card consent layer and guards send', () => {
    const src = readFileSync(join(here, 'ConfideToYinUI.js'), 'utf8');
    assert.match(src, /confide-consent-modal/);
    assert.match(src, /hasValidConfideConsent\(\)/);
    assert.match(src, /recordConfideConsent\(/);
    assert.match(src, /_onChatConsentConfirm/);
    assert.match(src, /CONFIDE_CONSENT_ERROR/);
    assert.doesNotMatch(src, /988|0120-279-338/);
  });
});
