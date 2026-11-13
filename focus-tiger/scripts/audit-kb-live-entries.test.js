/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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
  listKbLiveArchiveSealEntryRows,
  listKbLiveMenuProxyRows,
  listKbLiveRitualEntryRows
} from '../src/core/kbLiveEntryRegistry.js';
import { runKbLiveEntryAudit } from './audit-kb-live-entries.js';
import { KB_LIVE_MENU_CHROME_EXEMPTIONS } from '../src/core/kbLiveMenuChromeExemptions.js';

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

  it('diffMenuProxyCoverage flags unregistered menu proxies (CI red, not warning)', () => {
    const registry = [
      { proxy: 'ground-exercise' },
      { proxy: 'language' }
    ];
    const menu = [{ proxy: 'ground-exercise' }, { proxy: 'account' }];
    const { missingFromMenu, extraInMenu } = diffMenuProxyCoverage(
      registry,
      menu
    );
    assert.deepEqual(missingFromMenu, []);
    assert.deepEqual(extraInMenu, ['account']);
  });

  it('diffMenuProxyCoverage still allows language to be hidden by runtime gate', () => {
    const registry = [{ proxy: 'ground-exercise' }, { proxy: 'language' }];
    const menu = [{ proxy: 'ground-exercise' }];
    const { missingFromMenu, extraInMenu } = diffMenuProxyCoverage(
      registry,
      menu
    );
    assert.deepEqual(missingFromMenu, []);
    assert.deepEqual(extraInMenu, []);
  });
});

describe('kb live menu proxy registration (knife 2)', () => {
  it('registers account and other Brief-named menu proxies', () => {
    const proxies = new Set(
      listKbLiveMenuProxyRows()
        .map((row) => row.proxy)
        .filter(Boolean)
    );
    for (const proxy of [
      'account',
      'work-end',
      'always-on-top',
      'window-layout',
      'input-rhythm',
      'art-collection',
      'newsletter',
      'mustard-seed-seal',
      'sound'
    ]) {
      assert.equal(proxies.has(proxy), true, `missing registry proxy ${proxy}`);
    }
    assert.ok(listKbLiveArchiveSealEntryRows().length >= 1);
  });

  it('lists §2.3 chrome exemptions without skipping menu proxies', () => {
    const ids = KB_LIVE_MENU_CHROME_EXEMPTIONS.map((row) => row.id);
    assert.ok(ids.includes('help-center-shortcut'));
    assert.ok(ids.includes('corner-sound-note'));
    const help = KB_LIVE_MENU_CHROME_EXEMPTIONS.find(
      (row) => row.id === 'help-center-shortcut'
    );
    assert.deepEqual([...help.registeredMenuProxies], ['help-center']);
  });
});

describe('audit-kb-live-entries live audit', () => {
  it('passes on repo SSOT', () => {
    assert.equal(runKbLiveEntryAudit(), true);
  });
});
