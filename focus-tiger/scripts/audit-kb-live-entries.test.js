/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  diffMenuProxyCoverage,
  findMissingCodeAnchors,
  findMissingLocaleKeys
} from './audit-kb-live-entries.js';
import {
  KB_LIVE_ENTRY_ROWS,
  listAllKbLiveEntryRows,
  listKbLiveRitualEntryRows
} from '../src/core/kbLiveEntryRegistry.js';
import { runKbLiveEntryAudit } from './audit-kb-live-entries.js';

describe('kbLiveEntryRegistry', () => {
  it('has unique entry ids', () => {
    const ids = listAllKbLiveEntryRows().map((row) => row.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('includes ritual rows from RitualFlow SSOT', () => {
    assert.ok(listKbLiveRitualEntryRows().length >= 3);
    assert.ok(
      listAllKbLiveEntryRows().length >
        KB_LIVE_ENTRY_ROWS.length
    );
  });
});

describe('audit-kb-live-entries helpers', () => {
  it('findMissingLocaleKeys reports absent keys', () => {
    const row = {
      id: 'test',
      labelKeys: ['BTN_FOCUS_START', 'MISSING_KEY']
    };
    const missing = findMissingLocaleKeys(row, { BTN_FOCUS_START: 'Sit' });
    assert.deepEqual(missing, ['MISSING_KEY']);
  });

  it('findMissingCodeAnchors reports absent strings', () => {
    const row = {
      id: 'test',
      codeAnchors: ["proxy: 'ground-exercise'"]
    };
    assert.deepEqual(findMissingCodeAnchors(row, '// empty'), [
      "proxy: 'ground-exercise'"
    ]);
  });

  it('diffMenuProxyCoverage ignores optional conditional proxies', () => {
    const registry = [
      { proxy: 'ground-exercise' },
      { proxy: 'language' },
      { proxy: 'confide' }
    ];
    const menu = [{ proxy: 'ground-exercise' }, { proxy: 'newsletter' }];
    const { missingFromMenu, extraInMenu } = diffMenuProxyCoverage(
      registry,
      menu
    );
    assert.deepEqual(missingFromMenu, []);
    assert.deepEqual(extraInMenu, []);
  });
});

describe('audit-kb-live-entries live audit', () => {
  it('passes on repo SSOT', () => {
    assert.equal(runKbLiveEntryAudit(), true);
  });
});
