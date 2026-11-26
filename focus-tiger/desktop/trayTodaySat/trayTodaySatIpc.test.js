/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { attachTrayTodaySat } from './trayTodaySatIpc.js';

describe('attachTrayTodaySat', () => {
  it('refreshes presentation after IPC without polling', () => {
    const handlers = new Map();
    let changes = 0;
    const runtime = attachTrayTodaySat({
      ipcMain: {
        handle(channel, fn) {
          handlers.set(channel, fn);
        }
      },
      onChange: () => {
        changes += 1;
      },
      now: () => new Date('2026-11-26T08:00:00'),
      productName: 'Samatia'
    });
    const before = runtime.presentation('zh-CN');
    assert.equal(before.title, '');
    assert.equal(before.menuLabel, null);
    handlers.get('desktop:tray-today-sat-set')(null, {
      enabled: true,
      minutes: 12,
      dateKey: '2026-11-26'
    });
    assert.equal(changes, 1);
    const after = runtime.presentation('zh-CN');
    assert.equal(after.title, '12m');
    assert.equal(after.menuLabel, '今日已坐 · 12 分钟');
  });
});
