/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  removeOrphanSanctuaryNavPulses,
  resolveSanctuaryNavCompassFab,
  SANCTUARY_NAV_COMPASS_FAB_ID,
  syncSanctuaryNavPulseChrome
} from './homeSanctuaryNavPulseChrome.js';
import { markHomeSanctuaryNavSeen } from './homeSanctuaryNavGate.js';

test('removeOrphanSanctuaryNavPulses clears stray corner pulses', () => {
  if (typeof document === 'undefined') return;
  const host = document.createElement('div');
  document.body.appendChild(host);
  const dot = document.createElement('span');
  dot.className = 'ft-home-sanctuary-nav-pulse';
  host.appendChild(dot);
  removeOrphanSanctuaryNavPulses();
  assert.equal(document.querySelector('.ft-home-sanctuary-nav-pulse'), null);
  host.remove();
});

test('syncSanctuaryNavPulseChrome with nav disabled keeps FAB clean', () => {
  if (typeof document === 'undefined') return;
  const storage = new Map();
  const ls = {
    getItem: (k) => storage.get(k) ?? null,
    setItem: (k, v) => storage.set(k, v)
  };
  const fab = document.createElement('button');
  fab.id = SANCTUARY_NAV_COMPASS_FAB_ID;
  document.body.appendChild(fab);
  const orphan = document.createElement('span');
  orphan.className = 'ft-home-sanctuary-nav-pulse';
  document.body.appendChild(orphan);

  syncSanctuaryNavPulseChrome(ls);
  assert.equal(fab.querySelector('.ft-home-sanctuary-nav-pulse'), null);
  assert.equal(document.body.querySelector('.ft-home-sanctuary-nav-pulse'), null);

  markHomeSanctuaryNavSeen(ls);
  syncSanctuaryNavPulseChrome(ls);
  assert.equal(fab.querySelector('.ft-home-sanctuary-nav-pulse'), null);

  fab.remove();
});

test('resolveSanctuaryNavCompassFab ignores hidden FAB', () => {
  if (typeof document === 'undefined') return;
  const fab = document.createElement('button');
  fab.id = SANCTUARY_NAV_COMPASS_FAB_ID;
  fab.hidden = true;
  document.body.appendChild(fab);
  assert.equal(resolveSanctuaryNavCompassFab(), null);
  fab.remove();
});