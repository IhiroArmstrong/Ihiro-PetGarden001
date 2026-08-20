/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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

  it('includes mustard-seed-seal only when unlocked', () => {
    const closed = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      mustardSeedSealUnlocked: false
    });
    assert.equal(
      closed.some((e) => e.proxy === 'mustard-seed-seal'),
      false
    );
    const open = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      mustardSeedSealUnlocked: true
    });
    const proxies = open.filter((e) => e.proxy).map((e) => e.proxy);
    const quoteIdx = proxies.indexOf('daily-quote');
    const sealIdx = proxies.indexOf('mustard-seed-seal');
    assert.ok(quoteIdx >= 0);
    assert.equal(sealIdx, quoteIdx + 1);
  });

  it('narrow drawer omits honesty and breath; includes companion/reminder/language/five-moments/zen-cinema/…', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', allOn);
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'companion',
        'reminder',
        'language',
        'five-moments',
        'journey-log',
        'yin-coin',
        'zen-cinema',
        'daily-quote',
        'wallpapers',
        'newsletter',
        'community',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
    assert.ok(entries.some((e) => e.kind === 'group-label'));
  });

  it('wide more omits honesty and breath; includes companion/reminder/language/five-moments/zen-cinema/…', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'companion',
        'reminder',
        'language',
        'five-moments',
        'journey-log',
        'yin-coin',
        'zen-cinema',
        'daily-quote',
        'wallpapers',
        'newsletter',
        'community',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
  });

  it('wide companion requires enabled !== false', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      companionEnabled: false
    });
    assert.ok(!entries.some((e) => e.proxy === 'companion'));
  });

  it('language + five-moments + gift rows remain when secondary gates off (Sound is not a menu row)', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', {
      microRitualVisible: false,
      companionVisible: false,
      reminderAvailable: false
    });
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'language',
        'five-moments',
        'journey-log',
        'yin-coin',
        'zen-cinema',
        'daily-quote',
        'wallpapers',
        'newsletter',
        'community',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
  });

  it('yin-coin sits immediately after journey-log; flag-off hides the row', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const proxies = entries.filter((e) => e.proxy).map((e) => e.proxy);
    assert.equal(proxies.indexOf('yin-coin'), proxies.indexOf('journey-log') + 1);
    const hidden = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      yinCoinVisible: false
    });
    assert.equal(
      hidden.some((e) => e.proxy === 'yin-coin'),
      false
    );
  });

  it('newsletter becomes non-interactive confirmation row when submitted', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      newsletterSubmitted: true
    });
    const row = entries.find((e) => e.proxy === 'newsletter');
    assert.equal(row?.labelKey, 'NEWSLETTER_MENU_CONFIRMED');
    assert.equal(row?.interactive, false);
    assert.ok(entries.some((e) => e.proxy === 'community'));
  });

  it('membership row sits after community and immediately above Rituals group', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const communityIdx = entries.findIndex((e) => e.proxy === 'community');
    const membershipIdx = entries.findIndex((e) => e.proxy === 'membership');
    const ritualsIdx = entries.findIndex((e) => e.kind === 'group-label');
    assert.ok(communityIdx >= 0);
    assert.equal(membershipIdx, communityIdx + 1);
    assert.equal(ritualsIdx, membershipIdx + 1);
    assert.equal(entries[ritualsIdx]?.labelKey, 'ritual.menu_group');
  });

  it('membership row is beige subscribe CTA when scenes are locked', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      scenesEntitled: false
    });
    const row = entries.find((e) => e.proxy === 'membership');
    assert.equal(row?.labelKey, 'MEMBERSHIP_MENU_CTA');
    assert.equal(row?.emphasis, 'beige-cta');
    assert.equal(row?.interactive, undefined);
    assert.equal(row?.testId, 'idle-membership-cta');
  });

  it('membership row is You\'re subscribed when scenes are entitled', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      scenesEntitled: true
    });
    const row = entries.find((e) => e.proxy === 'membership');
    assert.equal(row?.labelKey, 'MEMBERSHIP_MENU_SUBSCRIBED');
    assert.equal(row?.interactive, undefined);
    assert.equal(row?.emphasis, undefined);
    assert.equal(row?.testId, 'idle-membership-subscribed');
  });

  it('confide row hidden while safety copy draft; visible only when gate open', () => {
    const closed = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      confideUserVisible: false
    });
    assert.ok(!closed.some((e) => e.proxy === 'confide'));
    const open = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      confideUserVisible: true
    });
    const row = open.find((e) => e.proxy === 'confide');
    assert.equal(row?.labelKey, 'CONFIDE_MENU_LABEL');
  });

  it('desktop companionGeneration shows Confide on wide-more only', () => {
    const wide = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      confideUserVisible: false,
      companionGeneration: true
    });
    assert.equal(wide.some((e) => e.proxy === 'confide'), true);
    const narrow = listSecondaryChromeEntries('narrow-drawer', {
      ...allOn,
      confideUserVisible: false,
      companionGeneration: true
    });
    assert.equal(narrow.some((e) => e.proxy === 'confide'), false);
  });

  it('ritual rows are locked when not entitled', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const rituals = entries.filter((e) =>
      String(e.proxy || '').startsWith('ritual-')
    );
    assert.equal(rituals.length, 3);
    assert.ok(rituals.every((e) => e.locked === true));
  });
});
