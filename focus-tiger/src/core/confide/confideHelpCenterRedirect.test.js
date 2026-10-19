/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import enBase from '../../locales/en.json' with { type: 'json' };
import { mergeLocalePack } from '../../locales/mergeLocaleSlices.js';
import redirectSlice from '../../locales/slices/confide-help-center-ask-redirect.json' with { type: 'json' };
import { isHelpCenterAskDestinationReachable } from './confideHelpCenterAskReachable.js';
import {
  CONFIDE_HELP_CENTER_ASK_REDIRECT_KEY,
  formatConfideHelpCenterAskRedirectReply,
  shouldRedirectConfideProductAskToHelpCenter
} from './confideHelpCenterRedirect.js';

describe('T23 Help Center ask redirect', () => {
  const { dictionaries } = mergeLocalePack(
    { en: enBase, zh: {}, ja: {} },
    [{ filename: 'confide-help-center-ask-redirect.json', data: redirectSlice }]
  );
  const tEn = (key) => dictionaries.en[key] || key;

  it('uses the locked English redirect sentence', () => {
    const line = formatConfideHelpCenterAskRedirectReply(tEn);
    assert.equal(
      line,
      'I keep how-to answers in Help Center. Open Help Center from the menu and type your question.'
    );
    assert.equal(CONFIDE_HELP_CENTER_ASK_REDIRECT_KEY, 'CONFIDE_HELP_CENTER_ASK_REDIRECT');
  });

  it('redirects high-confidence operational product asks only when the ask box exists', () => {
    assert.equal(
      shouldRedirectConfideProductAskToHelpCenter({
        text: 'How can I do some ground exercise',
        gateAction: 'hit',
        helpCenterAskReachable: true
      }),
      true
    );
    assert.equal(
      shouldRedirectConfideProductAskToHelpCenter({
        text: 'How can I meditate?',
        gateAction: 'honesty',
        helpCenterAskReachable: true
      }),
      true
    );
    assert.equal(
      shouldRedirectConfideProductAskToHelpCenter({
        text: 'How can I meditate?',
        gateAction: 'honesty',
        helpCenterAskReachable: false
      }),
      false
    );
  });

  it('does not redirect mood, motive, or unknown-name lines even if reachable', () => {
    for (const text of [
      "I feel quite sleepy. I don't want to practice anymore.",
      'Why should I do some meditation?',
      'Who is Tongtong?'
    ]) {
      assert.equal(
        shouldRedirectConfideProductAskToHelpCenter({
          text,
          gateAction: 'skip',
          helpCenterAskReachable: true
        }),
        false
      );
    }
  });

  it('treats a missing document as unreachable', () => {
    assert.equal(isHelpCenterAskDestinationReachable(null), false);
    assert.equal(
      isHelpCenterAskDestinationReachable({
        querySelector: (sel) => (sel === '#help-center' ? {} : null)
      }),
      false
    );
    assert.equal(
      isHelpCenterAskDestinationReachable({
        querySelector: (sel) =>
          sel === '#help-center' || sel === '[data-testid="help-center-ask-input"]' ? {} : null
      }),
      true
    );
  });
});
