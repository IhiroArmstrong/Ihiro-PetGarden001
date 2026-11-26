/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DESKTOP_DISPLAY_NAME } from '../../desktop/trayPolicy.js';
import {
  normalizeTrayTodaySatSnapshot,
  presentTrayTodaySat
} from './trayTodaySatPolicy.js';

describe('trayTodaySatPolicy', () => {
  it('defaults the switch on and drops non-positive minutes', () => {
    assert.deepEqual(normalizeTrayTodaySatSnapshot({}), {
      enabled: true,
      minutes: 0,
      dateKey: ''
    });
    assert.equal(normalizeTrayTodaySatSnapshot({ minutes: 12.9 }).minutes, 12);
    assert.equal(normalizeTrayTodaySatSnapshot({ enabled: false }).enabled, false);
  });

  it('writes 12m only when enabled, same day, and minutes > 0', () => {
    const sat = presentTrayTodaySat({
      enabled: true,
      minutes: 12,
      dateKey: '2026-11-26',
      todayKey: '2026-11-26',
      locale: 'zh-CN'
    });
    assert.equal(sat.title, '12m');
    assert.equal(sat.menuLabel, '今日已坐 · 12 分钟');
    assert.match(sat.tooltip, /12/);

    const off = presentTrayTodaySat({
      enabled: false,
      minutes: 12,
      dateKey: '2026-11-26',
      todayKey: '2026-11-26',
      productName: DESKTOP_DISPLAY_NAME
    });
    assert.equal(off.title, '');
    assert.equal(off.menuLabel, null);
    assert.equal(off.tooltip, DESKTOP_DISPLAY_NAME);

    const nextDay = presentTrayTodaySat({
      enabled: true,
      minutes: 12,
      dateKey: '2026-11-25',
      todayKey: '2026-11-26',
      locale: 'en'
    });
    assert.equal(nextDay.title, '');
    assert.equal(nextDay.menuLabel, null);
  });

  it('does not mention streaks or missed days', () => {
    const empty = presentTrayTodaySat({
      enabled: true,
      minutes: 0,
      dateKey: '2026-11-26',
      todayKey: '2026-11-26',
      locale: 'zh-CN'
    });
    assert.doesNotMatch(empty.tooltip, /连续|streak|缺席|昨天/);
  });
});
