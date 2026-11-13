/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { diffMenuProxyCoverage } from '../../scripts/audit-kb-live-entries.js';
import {
  listKbLiveArchiveSealEntryRows,
  listKbLiveMenuProxyRows
} from './kbLiveEntryRegistry.js';
import { KB_LIVE_MENU_CHROME_EXEMPTIONS } from './kbLiveMenuChromeExemptions.js';

describe('kb live menu proxy contract (knife 2)', () => {
  it('treats an unregistered listSecondaryChromeEntries proxy as CI red', () => {
    const { extraInMenu } = diffMenuProxyCoverage(
      [{ proxy: 'ground-exercise' }],
      [{ proxy: 'ground-exercise' }, { proxy: 'account' }]
    );
    assert.deepEqual(extraInMenu, ['account']);
  });

  it('registers Brief-named menu proxies including account', () => {
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

  it('keeps §2.3 exemptions as non-proxy chrome', () => {
    const help = KB_LIVE_MENU_CHROME_EXEMPTIONS.find(
      (row) => row.id === 'help-center-shortcut'
    );
    assert.ok(help);
    assert.deepEqual([...help.registeredMenuProxies], ['help-center']);
  });
});
