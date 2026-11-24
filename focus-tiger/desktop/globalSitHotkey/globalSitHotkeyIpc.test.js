/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { DEFAULT_GLOBAL_SIT_ACCELERATOR } from '../../src/core/globalSitHotkeyPolicy.js';
import { attachGlobalSitHotkey } from './globalSitHotkeyIpc.js';

function mockHost(platform) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gsh-ipc-'));
  const handlers = new Map();
  const appHandlers = [];
  const registered = [];
  const navigated = [];
  const host = {
    app: {
      getPath: () => dir,
      on: (_name, fn) => appHandlers.push(fn)
    },
    ipcMain: {
      handle: (channel, fn) => handlers.set(channel, fn)
    },
    globalShortcut: {
      register: (acc, onFire) => {
        registered.push({ acc, onFire });
        return true;
      },
      unregister: () => {}
    },
    showMainWindow: () => navigated.push('show'),
    navigatePractice: (url) => navigated.push(url),
    platform
  };
  return { host, handlers, appHandlers, registered, navigated };
}

describe('attachGlobalSitHotkey', () => {
  it('registers default Command+Control+Shift+S on darwin and fires the sit deep link', async () => {
    const { host, handlers, registered, navigated } = mockHost('darwin');
    attachGlobalSitHotkey(host);
    assert.equal(registered[0].acc, 'Control+Shift+Command+S');
    assert.equal(
      registered[0].acc.split('+').sort().join('+'),
      DEFAULT_GLOBAL_SIT_ACCELERATOR.split('+').sort().join('+')
    );
    const snap = await handlers.get('desktop:global-sit-hotkey-get')();
    assert.equal(snap.registered, true);
    assert.equal(snap.available, true);
    registered[0].onFire();
    assert.equal(navigated[0], 'show');
    assert.match(navigated[1], /product=1&start=sit&min=5/);
  });

  it('does not register on non-darwin', async () => {
    const { host, handlers, registered } = mockHost('linux');
    attachGlobalSitHotkey(host);
    assert.equal(registered.length, 0);
    const snap = await handlers.get('desktop:global-sit-hotkey-get')();
    assert.equal(snap.available, false);
    assert.equal(snap.registered, false);
  });

  it('rejects Control+Shift+Y over IPC', async () => {
    const { host, handlers } = mockHost('darwin');
    attachGlobalSitHotkey(host);
    const result = await handlers.get('desktop:global-sit-hotkey-set')(
      null,
      'Control+Shift+Y'
    );
    assert.equal(result.ok, false);
    assert.equal(result.reason, 't10-reserved');
    assert.equal(result.saved, false);
  });
});
