/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
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
    assert.equal(trayMenuLabels('en-US').show, 'Show');
    assert.equal(trayMenuLabels('en-US').quit, 'Quit');
    assert.equal(trayMenuLabels('ja').show, '表示');
    assert.equal(trayMenuLabels('ja').quit, '終了');
    assert.equal(trayMenuLabels('zh-CN').show, '显示');
    assert.equal(trayMenuLabels('zh-CN').quit, '退出');
    assert.ok(trayMenuLabels('en-US').floatingMarker);
    assert.ok(trayMenuLabels('zh-CN').hideInFullScreen);
    assert.equal(trayMenuLabels('en-US').alwaysOnTop, 'Keep in front');
    assert.equal(trayMenuLabels('zh-CN').alwaysOnTop, '始终在最前');
    assert.equal(trayMenuLabels('ja').alwaysOnTop, '常に手前に表示');
    assert.equal(trayMenuLabels('en-US').companionWindow, 'Companion window');
    assert.equal(trayMenuLabels('zh-CN').companionWindow, '适中陪伴窗');
    assert.equal(trayMenuLabels('en-US').sitFullscreen, 'Sit fullscreen');
    assert.equal(trayMenuLabels('zh-CN').sitFullscreen, '全屏静坐');
  });
});
