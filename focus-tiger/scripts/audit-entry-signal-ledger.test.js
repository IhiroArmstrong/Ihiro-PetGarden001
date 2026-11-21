/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { splitSelectorList, selectorReferencedInSources } from './audit-entry-signal-ledger.js';
import { buildEntrySignalLedgerRows } from '../src/core/entrySignalLedgerRegistry.js';
import { scanUnregisteredPulseClasses } from './audit-entry-signal-lint.js';

describe('audit-entry-signal-ledger', () => {
  it('splits comma-separated selectors', () => {
    assert.deepEqual(splitSelectorList('#a, .b'), ['#a', '.b']);
  });

  it('finds selector substring in static sources', () => {
    const index = new Map([['src/foo.js', "querySelector('#btn-focus')"]]);
    assert.equal(selectorReferencedInSources('#btn-focus', index), true);
    assert.equal(selectorReferencedInSources('#missing', index), false);
  });

  it('ledger includes protected support fab', () => {
    const rows = buildEntrySignalLedgerRows();
    assert.ok(
      rows.some(
        (row) =>
          row.selector.includes('yin-support-fab') &&
          row.pulse === 'none' &&
          row.stackExempt === 'protected-payment-path'
      )
    );
  });
});

describe('audit-entry-signal-lint pulse gate', () => {
  it('rejects unregistered discovery pulse class', () => {
    const hits = scanUnregisteredPulseClasses(
      'src/ui/Evil.js',
      "dot.className = 'ft-evil-discovery-pulse';"
    );
    assert.equal(hits.length, 1);
    assert.match(hits[0], /ft-evil-discovery-pulse/);
  });
});