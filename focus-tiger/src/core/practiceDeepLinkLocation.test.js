/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRACTICE_DEEP_LINK_EVENT,
  buildPracticeDeepLinkHref,
  replacePracticeDeepLinkSearch
} from './practiceDeepLinkLocation.js';
import { attachDesktopShellDeepLinks } from './desktopShellDeepLinks.js';

describe('practice deep-link in-page location', () => {
  it('keeps product=1 and does not reload', () => {
    assert.equal(
      buildPracticeDeepLinkHref('/index.html', '', 'start=sit&min=5'),
      '/index.html?start=sit&min=5&product=1'
    );
    const calls = [];
    const href = replacePracticeDeepLinkSearch(
      { replaceState: (...args) => calls.push(args) },
      { pathname: '/index.html', hash: '' },
      '?start=sit&min=5'
    );
    assert.equal(href, '/index.html?start=sit&min=5&product=1');
    assert.equal(calls.length, 1);
    assert.equal(calls[0][2], href);
  });
});

describe('attachDesktopShellDeepLinks', () => {
  it('delivers practice IPC in-page and still ticks checkout resume', () => {
    const resumes = [];
    let practiceCb = null;
    const events = [];
    const historyCalls = [];
    const doc = {
      visibilityState: 'visible',
      addEventListener() {}
    };
    const win = {
      location: { pathname: '/index.html', hash: '', search: '?product=1' },
      history: { replaceState: (_s, _t, href) => historyCalls.push(href) },
      addEventListener() {},
      setInterval() {},
      dispatchEvent(ev) {
        events.push(ev.type);
        return true;
      }
    };
    attachDesktopShellDeepLinks({
      isDesktopShell: () => true,
      resumeCheckout: (search) => resumes.push(search ?? 'tick'),
      getShell: () => ({
        onShellVisibility() {},
        onCheckoutReturn() {},
        onPracticeDeepLink(cb) {
          practiceCb = cb;
        }
      }),
      readCheckoutPending: () => null,
      doc,
      win
    });
    assert.deepEqual(resumes, ['tick']);
    practiceCb('start=sit&min=5');
    assert.equal(historyCalls[0], '/index.html?start=sit&min=5&product=1');
    assert.deepEqual(events, [PRACTICE_DEEP_LINK_EVENT]);
    assert.equal(resumes.length, 1);
  });
});
