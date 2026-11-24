/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MEMBERSHIP_PLAN_ID,
  MEMBERSHIP_PLAN_ID_MONTHLY,
  MEMBERSHIP_PLAN_ID_YEARLY,
  normalizeMembershipPlanId
} from './membershipPlanId.js';

describe('normalizeMembershipPlanId (client read layer)', () => {
  it('grandfathers yin-membership as monthly', () => {
    assert.equal(
      normalizeMembershipPlanId(MEMBERSHIP_PLAN_ID),
      MEMBERSHIP_PLAN_ID_MONTHLY
    );
  });

  it('accepts yearly canonical id', () => {
    assert.equal(
      normalizeMembershipPlanId('yin-membership-yearly'),
      MEMBERSHIP_PLAN_ID_YEARLY
    );
  });
});
