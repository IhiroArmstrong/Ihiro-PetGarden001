/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HIDE_REASON_TRAY,
  isTrayHideReason,
  shouldQuitOnWindowClose,
  trayMenuLabels
} from '../../desktop/trayPolicy.js';

describe('trayPolicy', () => {
  it('red-close does not quit unless isQuitting', () => {
    assert.equal(shouldQuitOnWindowClose({ isQuitting: false }), false);
    assert.equal(shouldQuitOnWindowClose({}), false);
    assert.equal(shouldQuitOnWindowClose({ isQuitting: true }), true);
  });

  it('recognizes tray hide reason', () => {
    assert.equal(isTrayHideReason(HIDE_REASON_TRAY), true);
    assert.equal(isTrayHideReason('none'), false);
    assert.equal(isTrayHideReason(null), false);
  });

  it('picks tray labels from locale', () => {
    assert.deepEqual(trayMenuLabels('en-US'), { show: 'Show', quit: 'Quit' });
    assert.deepEqual(trayMenuLabels('ja'), { show: '表示', quit: '終了' });
    assert.deepEqual(trayMenuLabels('zh-CN'), { show: '显示', quit: '退出' });
  });
});
