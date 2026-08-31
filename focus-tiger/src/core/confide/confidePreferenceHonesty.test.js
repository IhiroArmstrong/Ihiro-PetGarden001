/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import {
  formatConfidePreferenceHonestyReply,
  isConfidePreferenceQuery,
  shouldHandleConfidePreferenceHonesty
} from './confidePreferenceHonesty.js';

describe('confidePreferenceHonesty', () => {
  it('matches preference-profile questions without inventing a store', () => {
    const text = 'What have you learned about my preferences so far?';
    assert.equal(isConfidePreferenceQuery(text), true);
    assert.equal(confideClassify(text), CONFIDE_ROUTE.FALLBACK);
    assert.equal(
      shouldHandleConfidePreferenceHonesty({ route: CONFIDE_ROUTE.FALLBACK, text }),
      true
    );
    assert.equal(
      shouldHandleConfidePreferenceHonesty({ route: CONFIDE_ROUTE.SAD, text }),
      false
    );
    assert.equal(isConfidePreferenceQuery('Show me what you remember'), false);
  });

  it('formats locale key only', () => {
    assert.equal(
      formatConfidePreferenceHonestyReply((key) => key),
      'CONFIDE_PREFERENCE_HONESTY'
    );
  });
});
