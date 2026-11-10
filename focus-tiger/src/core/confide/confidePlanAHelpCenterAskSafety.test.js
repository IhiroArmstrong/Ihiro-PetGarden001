/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  HELP_CENTER_ASK_SAFETY_T92_TESTID,
  helpCenterAskSafetyT92Message
} from './confidePlanAHelpCenterAskSafety.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../..');

describe('confidePlanAHelpCenterAskSafety', () => {
  it('reuses T92 blocked-open copy for Help Center crisis ask', () => {
    const en = helpCenterAskSafetyT92Message('en');
    assert.match(en, /local crisis helpline/i);
    const zh = helpCenterAskSafetyT92Message('zh');
    assert.match(zh, /请您拨打本地求助热线/);
  });

  it('exposes a stable ask-safety test id', () => {
    assert.equal(HELP_CENTER_ASK_SAFETY_T92_TESTID, 'help-center-ask-safety-t92');
  });
});

describe('Plan A §6 voice + Help Center wiring', () => {
  const confideUi = readFileSync(join(repoRoot, 'src/ui/ConfideToYinUI.js'), 'utf8');
  const helpUi = readFileSync(join(repoRoot, 'src/ui/HelpCenterUI.js'), 'utf8');

  it('voice push-to-talk stops send when Confide open is blocked', () => {
    assert.match(confideUi, /submitVoiceCommandRaw\(raw\)/);
    assert.match(
      confideUi,
      /submitVoiceCommandRaw\(raw\) \{[\s\S]*?if \(!this\._open\) \{[\s\S]*?this\._voiceRawForSend = null;[\s\S]*?return;/
    );
    assert.match(confideUi, /onOpenBlocked/);
  });

  it('Help Center safety submit renders inline T92', () => {
    assert.match(helpUi, /_renderAskSafetyT92/);
    assert.match(helpUi, /helpCenterAskSafetyT92Message/);
    assert.match(helpUi, /HELP_CENTER_ASK_SAFETY_T92_TESTID/);
  });
});
