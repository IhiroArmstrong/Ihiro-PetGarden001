/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  flattenPreferenceCenterEntries,
  listPreferenceCenterSubgroups
} from './preferencesCenterCatalog.js';
import { readPreferenceCenterStatus } from './preferencesCenterStatus.js';
import { REMINDER_PREFERENCE_STORAGE_KEY } from './reminderPreference.js';

const vis = {
  reminderAvailable: true,
  workEndAvailable: true,
  alwaysOnTopAvailable: true,
  trayTodaySatAvailable: true,
  windowLayoutAvailable: true,
  inputRhythmAvailable: true,
  newsletterSubmitted: false
};

describe('preferences center catalog', () => {
  it('keeps leftover Help / Backup / Study / Subscription in Account', () => {
    const groups = listPreferenceCenterSubgroups(vis, {
      shouldOfferLanguagePicker: () => true,
      accountRow: {
        proxy: 'account',
        labelKey: 'EMAIL_JOURNEY_MENU_LABEL',
        kind: 'action'
      },
      membershipTestId: 'idle-membership-cta'
    });
    const account = groups.find((g) => g.labelKey === 'PREF_CENTER_GROUP_ACCOUNT');
    assert.deepEqual(
      account.rows.map((r) => r.proxy),
      [
        'newsletter',
        'account',
        'help-center',
        'local-backup',
        'practice-study',
        'membership'
      ]
    );
  });

  it('marks Keep in front as an in-list toggle and Sound as a page', () => {
    const groups = listPreferenceCenterSubgroups(vis, {
      shouldOfferLanguagePicker: () => true,
      accountRow: { proxy: 'account', labelKey: 'EMAIL_JOURNEY_MENU_LABEL' }
    });
    const devices = groups.find((g) => g.labelKey === 'PREF_CENTER_GROUP_DEVICES');
    const sound = devices.rows.find((r) => r.proxy === 'sound');
    const pin = devices.rows.find((r) => r.proxy === 'always-on-top');
    const sat = devices.rows.find((r) => r.proxy === 'tray-today-sat');
    assert.equal(sound.kind, 'page');
    assert.equal(pin.kind, 'toggle');
    assert.equal(sat.kind, 'toggle');
  });

  it('flattens subgroup labels without dropping proxies', () => {
    const flat = flattenPreferenceCenterEntries(
      listPreferenceCenterSubgroups(vis, {
        shouldOfferLanguagePicker: () => false,
        accountRow: { proxy: 'account', labelKey: 'EMAIL_JOURNEY_MENU_LABEL' }
      })
    );
    assert.ok(flat.some((e) => e.kind === 'sub-group-label'));
    assert.ok(!flat.some((e) => e.proxy === 'language'));
    assert.ok(flat.some((e) => e.proxy === 'help-center'));
  });
});

describe('preferences center status', () => {
  it('shows Off when reminder is unset, and a clock when set', () => {
    const t = (key) => (key === 'PREF_CENTER_STATUS_OFF' ? 'Off' : key);
    const storage = {
      getItem: (key) =>
        key === REMINDER_PREFERENCE_STORAGE_KEY
          ? JSON.stringify({ hour: 7, minute: 5 })
          : null
    };
    assert.equal(
      readPreferenceCenterStatus('reminder', { t, storage: { getItem: () => null } }),
      'Off'
    );
    assert.equal(readPreferenceCenterStatus('reminder', { t, storage }), '07:05');
  });
});
