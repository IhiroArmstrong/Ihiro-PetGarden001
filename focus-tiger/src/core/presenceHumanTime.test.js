/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPresenceExactTime,
  formatPresenceMomentTime,
  presenceMomentDayBucket
} from './presenceHumanTime.js';

const LOOKUP = {
  PRESENCE_TIME_TODAY: 'Today · {time}',
  PRESENCE_TIME_YESTERDAY: 'Yesterday · {time}',
  PRESENCE_TIME_DATE: '{date} · {time}'
};

test('presenceMomentDayBucket classifies today and yesterday', () => {
  const ref = new Date('2026-09-13T12:00:00');
  assert.equal(
    presenceMomentDayBucket(new Date('2026-09-13T02:47:00'), ref),
    'today'
  );
  assert.equal(
    presenceMomentDayBucket(new Date('2026-09-12T22:00:00'), ref),
    'yesterday'
  );
  assert.equal(
    presenceMomentDayBucket(new Date('2026-09-10T08:00:00'), ref),
    'other'
  );
});

test('formatPresenceMomentTime uses Today · time for same calendar day', () => {
  const ref = new Date('2026-09-13T12:00:00');
  const label = formatPresenceMomentTime('2026-09-13T02:47:00', {
    t: (key) => LOOKUP[key],
    reference: ref,
    timeOptions: { hour: 'numeric', minute: '2-digit', hour12: true }
  });
  assert.match(label, /^Today · /);
  assert.match(label, /47/);
});

test('formatPresenceExactTime keeps full locale string', () => {
  const exact = formatPresenceExactTime('2026-09-13T02:47:00');
  assert.match(exact, /2026|9|13|47/);
});
