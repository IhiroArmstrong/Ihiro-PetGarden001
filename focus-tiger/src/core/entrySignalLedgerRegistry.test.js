/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEntrySignalLedgerRows,
  collectRegisteredPulseClasses
} from './entrySignalLedgerRegistry.js';
import {
  ENTRY_SIGNAL_NO_MINT_HINT_IDS,
  ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST
} from './entrySignalLedgerContract.js';

describe('entrySignalLedgerRegistry', () => {
  it('quick-start click hint stays pulse none', () => {
    const rows = buildEntrySignalLedgerRows();
    const quick = rows.find((row) => row.controlId === 'hint:quick-start');
    assert.ok(quick);
    assert.equal(quick.pulse, 'none');
    assert.ok(ENTRY_SIGNAL_NO_MINT_HINT_IDS.has('quick-start'));
  });

  it('how-shall-we-sit mint maps to inline', () => {
    const rows = buildEntrySignalLedgerRows();
    const how = rows.find((row) => row.controlId === 'hint:how-shall-we-sit');
    assert.ok(how);
    assert.equal(how.pulse, 'mint-inline:how-shall-we-sit');
  });

  it('registered pulse classes stay allowlisted', () => {
    const rows = buildEntrySignalLedgerRows();
    const classes = collectRegisteredPulseClasses(rows);
    assert.ok(classes.has('onboarding-hint-badge'));
    assert.ok(classes.has('ft-secondary-menu-hint-dot'));
  });

  it('L5 globe clock and note use glass-ear query skin', () => {
    const rows = buildEntrySignalLedgerRows();
    const globe = rows.find((row) => row.controlId === 'hint:language-preference');
    const clock = rows.find((row) => row.controlId === 'hint:in-app-reminder');
    const note = rows.find((row) => row.controlId === 'hint:ambient-soundscape');
    const volume = rows.find((row) => row.controlId === 'ambient-volume-slider');
    assert.equal(globe?.tooltip, 'glass-ear');
    assert.equal(clock?.tooltip, 'glass-ear');
    assert.equal(note?.tooltip, 'glass-ear');
    assert.equal(globe?.touch, 'execute-plus-first-toast');
    assert.equal(clock?.touch, 'execute-plus-first-toast');
    assert.equal(volume?.tooltip, 'glass-ear');
    assert.equal(volume?.touch, 'label-enough');
  });

  it('L2 dead C/D pulse classes are not allowlisted', () => {
    assert.equal(ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST.has('ft-hint-discovery-dot'), false);
    assert.equal(
      ENTRY_SIGNAL_PULSE_CLASS_ALLOWLIST.has('ft-home-sanctuary-nav-pulse'),
      false
    );
  });
});