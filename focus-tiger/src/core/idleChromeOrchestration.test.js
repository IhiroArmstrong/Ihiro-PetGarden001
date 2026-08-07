import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveIdleChromeStage,
  resolveShellChromeProjection,
  resolveRoleVisibility,
  listSecondaryChromeEntries,
  SECONDARY_PROXY_HINT_IDS,
  secondaryProxyForHintId
} from './idleChromeOrchestration.js';

describe('resolveIdleChromeStage', () => {
  it('priority: focusing > arrival(quick-only) > overlay > bridge > idle', () => {
    assert.equal(
      resolveIdleChromeStage({
        focusing: true,
        arrivalOpen: true,
        overlayActive: true,
        honestyBusy: true,
        bridgeVisible: true
      }),
      'focusing'
    );
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: true,
        overlayActive: true,
        honestyBusy: false,
        bridgeVisible: true
      }),
      'arrival'
    );
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: true,
        honestyBusy: false,
        bridgeVisible: true
      }),
      'overlay-suppress'
    );
    // Honesty busy shares Arrival quick-only chrome (not full overlay suppress).
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: false,
        honestyBusy: true,
        bridgeVisible: false
      }),
      'arrival'
    );
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: false,
        honestyBusy: false,
        companionExpanded: true,
        bridgeVisible: false
      }),
      'arrival'
    );
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: false,
        honestyBusy: false,
        bridgeVisible: true
      }),
      'bridge'
    );
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: false,
        honestyBusy: false,
        bridgeVisible: false
      }),
      'idle'
    );
  });
});

describe('resolveShellChromeProjection', () => {
  it('Idle quiet → both shells idle, not suppressed', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: false
    });
    assert.deepEqual(p.narrow, {
      idle: true,
      suppressed: false,
      keepQuickStart: false
    });
    assert.deepEqual(p.wide, {
      idle: true,
      suppressed: false,
      keepQuickStart: false
    });
  });

  it('Arrival → suppress + keepQuickStart on narrow and wide', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: true,
      honestyBusy: false,
      arrivalOpen: true,
      bridgeVisible: false
    });
    assert.equal(p.narrow.suppressed, true);
    assert.equal(p.narrow.keepQuickStart, true);
    assert.equal(p.wide.suppressed, true);
    assert.equal(p.wide.keepQuickStart, true);
  });

  it('Honesty busy → suppress + keepQuickStart (Quick only, both viewports)', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: true,
      honestyBusy: true,
      arrivalOpen: false,
      bridgeVisible: false
    });
    assert.equal(p.narrow.suppressed, true);
    assert.equal(p.narrow.keepQuickStart, true);
    assert.equal(p.wide.suppressed, true);
    assert.equal(p.wide.keepQuickStart, true);
  });

  it('Companion expanded (post-Choose) → keepQuickStart even when Arrival closed', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: false,
      companionExpanded: true
    });
    assert.equal(p.narrow.suppressed, true);
    assert.equal(p.narrow.keepQuickStart, true);
    assert.equal(p.wide.suppressed, true);
    assert.equal(p.wide.keepQuickStart, true);
  });

  it('postChoosePending (nod gap) → keepQuickStart before Companion opens', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: false,
      postChoosePending: true
    });
    assert.equal(p.narrow.keepQuickStart, true);
    assert.equal(p.wide.keepQuickStart, true);
  });

  it('Reflection overlay alone → suppress without keepQuickStart', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: true,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: false,
      companionExpanded: false
    });
    assert.equal(p.narrow.suppressed, true);
    assert.equal(p.narrow.keepQuickStart, false);
    assert.equal(p.wide.keepQuickStart, false);
  });

  it('bridge alone → both shells suppressed (narrow hides home balls over Yes/No)', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: true
    });
    assert.equal(p.narrow.suppressed, true);
    assert.equal(p.narrow.keepQuickStart, false);
    assert.equal(p.wide.suppressed, true);
  });

  it('Focusing → idle false on both', () => {
    const p = resolveShellChromeProjection({
      focusing: true,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: false
    });
    assert.equal(p.narrow.idle, false);
    assert.equal(p.wide.idle, false);
  });
});

describe('resolveRoleVisibility (stage × viewport)', () => {
  it('idle narrow: Sit + ⚡ + Honesty + grabber + ActionBar', () => {
    assert.deepEqual(resolveRoleVisibility({ stage: 'idle', viewport: 'narrow' }), {
      sit: 'visible',
      quickStart: 'visible',
      honesty: 'visible',
      moreOrGrabber: 'visible',
      actionBar: 'visible'
    });
  });

  it('idle wide: Sit + ⚡ + Honesty home balls; ⋯ visible', () => {
    assert.deepEqual(resolveRoleVisibility({ stage: 'idle', viewport: 'wide' }), {
      sit: 'visible',
      quickStart: 'visible',
      honesty: 'visible',
      moreOrGrabber: 'visible',
      actionBar: 'na'
    });
  });

  it('arrival: Sit/Honesty/More hidden; Quick Start visible (both viewports)', () => {
    for (const viewport of /** @type {const} */ (['narrow', 'wide'])) {
      const r = resolveRoleVisibility({ stage: 'arrival', viewport });
      assert.equal(r.sit, 'hidden');
      assert.equal(r.quickStart, 'visible');
      assert.equal(r.honesty, 'hidden');
      assert.equal(r.moreOrGrabber, 'hidden');
    }
  });

  it('bridge: narrow hides Sit/Quick/Honesty/grabber; ActionBar stays; wide More hidden', () => {
    const narrow = resolveRoleVisibility({
      stage: 'bridge',
      viewport: 'narrow'
    });
    assert.deepEqual(narrow, {
      sit: 'hidden',
      quickStart: 'hidden',
      honesty: 'hidden',
      moreOrGrabber: 'hidden',
      actionBar: 'visible'
    });
    const wide = resolveRoleVisibility({ stage: 'bridge', viewport: 'wide' });
    assert.equal(wide.moreOrGrabber, 'hidden');
    assert.equal(wide.sit, 'visible');
    assert.equal(wide.quickStart, 'visible');
    assert.equal(wide.honesty, 'visible');
  });

  it('must not claim Arrival Sit visible (failure lock)', () => {
    for (const viewport of /** @type {const} */ (['narrow', 'wide'])) {
      assert.notEqual(
        resolveRoleVisibility({ stage: 'arrival', viewport }).sit,
        'visible'
      );
    }
  });
});

describe('secondaryProxyForHintId', () => {
  it('inverses SECONDARY_PROXY_HINT_IDS; unknown → null', () => {
    assert.equal(secondaryProxyForHintId('how-shall-we-sit'), 'companion');
    assert.equal(secondaryProxyForHintId('micro-ritual'), null);
    assert.equal(secondaryProxyForHintId('in-app-reminder'), 'reminder');
    assert.equal(secondaryProxyForHintId('honesty-optional'), 'honesty');
    assert.equal(secondaryProxyForHintId('sit-button'), null);
    assert.equal(secondaryProxyForHintId(''), null);
    for (const [proxy, hintId] of Object.entries(SECONDARY_PROXY_HINT_IDS)) {
      assert.equal(secondaryProxyForHintId(hintId), proxy);
    }
  });
});

describe('listSecondaryChromeEntries', () => {
  const allOn = {
    microRitualVisible: true,
    companionVisible: true,
    companionEnabled: true,
    reminderAvailable: true
  };

  it('narrow drawer omits honesty and breath; includes companion/reminder/language/zen-cinema/daily-quote/tip-jar', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', allOn);
    assert.deepEqual(
      entries.map((e) => e.proxy),
      ['companion', 'reminder', 'language', 'zen-cinema', 'daily-quote', 'tip-jar']
    );
  });

  it('wide more omits honesty and breath; includes companion/reminder/language/zen-cinema/daily-quote/tip-jar', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    assert.deepEqual(
      entries.map((e) => e.proxy),
      ['companion', 'reminder', 'language', 'zen-cinema', 'daily-quote', 'tip-jar']
    );
  });

  it('wide companion requires enabled !== false', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      companionEnabled: false
    });
    assert.ok(!entries.some((e) => e.proxy === 'companion'));
  });

  it('language + zen-cinema + daily-quote remain when secondary gates off (Sound is not a menu row)', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', {
      microRitualVisible: false,
      companionVisible: false,
      reminderAvailable: false
    });
    assert.deepEqual(entries.map((e) => e.proxy), [
      'language',
      'zen-cinema',
      'daily-quote',
      'tip-jar'
    ]);
  });
});
