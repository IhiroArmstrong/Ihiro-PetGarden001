import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveIdleChromeStage,
  resolveShellChromeProjection,
  resolveRoleVisibility,
  listSecondaryChromeEntries
} from './idleChromeOrchestration.js';

describe('resolveIdleChromeStage', () => {
  it('priority: focusing > arrival > overlay > bridge > idle', () => {
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
    assert.equal(
      resolveIdleChromeStage({
        focusing: false,
        arrivalOpen: false,
        overlayActive: false,
        honestyBusy: true,
        bridgeVisible: false
      }),
      'overlay-suppress'
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
    assert.deepEqual(p.wide, { idle: true, suppressed: false });
  });

  it('Arrival → suppress + keepQuickStart on narrow; wide suppressed', () => {
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
  });

  it('bridge alone → narrow not suppressed; wide suppressed (Yes/No clear)', () => {
    const p = resolveShellChromeProjection({
      focusing: false,
      overlayActive: false,
      honestyBusy: false,
      arrivalOpen: false,
      bridgeVisible: true
    });
    assert.equal(p.narrow.suppressed, false);
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

  it('idle wide: Sit + ⚡ visible; Honesty in-menu; ⋯ visible', () => {
    assert.deepEqual(resolveRoleVisibility({ stage: 'idle', viewport: 'wide' }), {
      sit: 'visible',
      quickStart: 'visible',
      honesty: 'in-menu',
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

  it('bridge: wide More hidden; narrow grabber still visible', () => {
    assert.equal(
      resolveRoleVisibility({ stage: 'bridge', viewport: 'wide' }).moreOrGrabber,
      'hidden'
    );
    assert.equal(
      resolveRoleVisibility({ stage: 'bridge', viewport: 'narrow' })
        .moreOrGrabber,
      'visible'
    );
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

describe('listSecondaryChromeEntries', () => {
  const allOn = {
    microRitualVisible: true,
    companionVisible: true,
    companionEnabled: true,
    reminderAvailable: true
  };

  it('narrow drawer omits honesty; includes breath/companion/reminder/language', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', allOn);
    assert.deepEqual(
      entries.map((e) => e.proxy),
      ['breath', 'companion', 'reminder', 'language']
    );
  });

  it('wide more lists honesty first', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    assert.deepEqual(
      entries.map((e) => e.proxy),
      ['honesty', 'breath', 'companion', 'reminder', 'language']
    );
  });

  it('wide companion requires enabled !== false', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      companionEnabled: false
    });
    assert.ok(!entries.some((e) => e.proxy === 'companion'));
  });

  it('language remains when secondary gates off (Sound is not a menu row)', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', {
      microRitualVisible: false,
      companionVisible: false,
      reminderAvailable: false
    });
    assert.deepEqual(entries.map((e) => e.proxy), ['language']);
  });
});
