/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSelfHostedUpdaterEnabled,
  resolveUpdateChannel
} from './desktopUpdaterChannel.js';

describe('desktopUpdaterChannel', () => {
  it('resolveUpdateChannel defaults to direct', () => {
    assert.equal(resolveUpdateChannel({}), 'direct');
    assert.equal(resolveUpdateChannel({ FT_UPDATE_CHANNEL: '' }), 'direct');
  });

  it('resolveUpdateChannel recognizes store channels', () => {
    assert.equal(resolveUpdateChannel({ FT_UPDATE_CHANNEL: 'setapp' }), 'setapp');
    assert.equal(resolveUpdateChannel({ FT_UPDATE_CHANNEL: 'MAS' }), 'mas');
  });

  it('isSelfHostedUpdaterEnabled only for direct', () => {
    assert.equal(isSelfHostedUpdaterEnabled('direct'), true);
    assert.equal(isSelfHostedUpdaterEnabled('setapp'), false);
    assert.equal(isSelfHostedUpdaterEnabled('mas'), false);
  });
});
