/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveIdleChromeStage,
  resolveShellChromeProjection,
  resolveRoleVisibility,
  listSecondaryChromeEntries,
  SECONDARY_PROXY_HINT_IDS,
  SECONDARY_PROXY_DISPATCH,
  secondaryProxyForHintId,
  resolveSecondaryChromeDispatch,
  dispatchSecondaryChromeProxy,
  ritualMenuLockAccessibleName,
  invokeHandler,
  resolveHandlerStrictEnv
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
      keepQuickStart: false,
      honestyBridgeActive: false
    });
    assert.deepEqual(p.wide, {
      idle: true,
      suppressed: false,
      keepQuickStart: false,
      honestyBridgeActive: false
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
    assert.equal(p.narrow.honestyBridgeActive, false);
    assert.equal(p.wide.keepQuickStart, false);
    assert.equal(p.wide.honestyBridgeActive, false);
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
    assert.equal(p.narrow.honestyBridgeActive, true);
    assert.equal(p.wide.suppressed, true);
    assert.equal(p.wide.honestyBridgeActive, true);
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

  it('overlay-suppress: menu escape hatch stays visible (both viewports)', () => {
    for (const viewport of /** @type {const} */ (['narrow', 'wide'])) {
      const r = resolveRoleVisibility({ stage: 'overlay-suppress', viewport });
      assert.equal(r.sit, 'hidden');
      assert.equal(r.quickStart, 'hidden');
      assert.equal(r.honesty, 'hidden');
      assert.equal(r.moreOrGrabber, 'visible');
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

  it('focusing: home balls hidden; ⋯ / grabber edge-recall (T47)', () => {
    for (const viewport of /** @type {const} */ (['narrow', 'wide'])) {
      const r = resolveRoleVisibility({ stage: 'focusing', viewport });
      assert.equal(r.sit, 'hidden');
      assert.equal(r.quickStart, 'hidden');
      assert.equal(r.honesty, 'hidden');
      assert.equal(r.moreOrGrabber, 'edge-recall');
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
    reminderAvailable: true,
    workEndAvailable: true
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
    assert.equal(proxies[quoteIdx + 1], 'zen-cinema');
    assert.equal(sealIdx, quoteIdx + 2);
  });

  it('narrow drawer omits honesty and breath; includes companion/reminder/language/five-moments/zen-cinema/…', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', allOn);
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'sanctuary-nav',
        'companion',
        'ground-exercise',
        'five-moments',
        'honesty',
        'journey-log',
        'presence-signals',
        'yin-coin',
        'daily-quote',
        'zen-cinema',
        'wallpapers',
        'art-collection',
        'quiet-together',
        'focus-circle',
        'community',
        'reminder',
        'work-end',
        'language',
        'sound',
        'mindflow-nebula',
        'today-direction',
        'newsletter',
        'account',
        'help-center',
        'local-backup',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
    assert.ok(entries.some((e) => e.kind === 'group-label'));
    assert.deepEqual(
      entries.filter((e) => e.kind === 'group-label').map((e) => e.labelKey),
      [
        'MENU_GROUP_PRACTICE',
        'MENU_GROUP_RECORDS',
        'MENU_GROUP_INSPIRATION',
        'MENU_GROUP_NOT_ALONE',
        'MENU_GROUP_PREFERENCES',
        'ritual.menu_group'
      ]
    );
  });

  it('wide more omits honesty and breath; includes companion/reminder/language/five-moments/zen-cinema/…', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'sanctuary-nav',
        'companion',
        'ground-exercise',
        'five-moments',
        'honesty',
        'journey-log',
        'presence-signals',
        'yin-coin',
        'daily-quote',
        'zen-cinema',
        'wallpapers',
        'art-collection',
        'quiet-together',
        'focus-circle',
        'community',
        'reminder',
        'work-end',
        'language',
        'sound',
        'mindflow-nebula',
        'today-direction',
        'newsletter',
        'account',
        'help-center',
        'local-backup',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
  });

  it('includes always-on-top on wide and narrow when available', () => {
    assert.ok(
      !listSecondaryChromeEntries('wide-more', allOn).some(
        (e) => e.proxy === 'always-on-top'
      )
    );
    const on = { ...allOn, alwaysOnTopAvailable: true };
    assert.ok(
      listSecondaryChromeEntries('wide-more', on).some(
        (e) => e.proxy === 'always-on-top'
      )
    );
    assert.ok(
      listSecondaryChromeEntries('narrow-drawer', on).some(
        (e) => e.proxy === 'always-on-top'
      )
    );
  });

  it('includes input-rhythm on wide and narrow when available', () => {
    assert.ok(
      !listSecondaryChromeEntries('wide-more', allOn).some(
        (e) => e.proxy === 'input-rhythm'
      )
    );
    const on = { ...allOn, inputRhythmAvailable: true };
    assert.ok(
      listSecondaryChromeEntries('wide-more', on).some(
        (e) => e.proxy === 'input-rhythm'
      )
    );
    assert.ok(
      listSecondaryChromeEntries('narrow-drawer', on).some(
        (e) => e.proxy === 'input-rhythm'
      )
    );
  });

  it('includes window-layout on wide and narrow when available', () => {
    assert.ok(
      !listSecondaryChromeEntries('wide-more', allOn).some(
        (e) => e.proxy === 'window-layout'
      )
    );
    const on = { ...allOn, windowLayoutAvailable: true };
    assert.ok(
      listSecondaryChromeEntries('wide-more', on).some(
        (e) => e.proxy === 'window-layout'
      )
    );
    assert.ok(
      listSecondaryChromeEntries('narrow-drawer', on).some(
        (e) => e.proxy === 'window-layout'
      )
    );
  });

  it('Preferences includes Sound on wide and narrow (system-tts menu row removed)', () => {
    const wide = listSecondaryChromeEntries('wide-more', allOn);
    const narrow = listSecondaryChromeEntries('narrow-drawer', allOn);
    assert.ok(!wide.some((e) => e.proxy === 'system-tts'));
    assert.ok(!narrow.some((e) => e.proxy === 'system-tts'));
    const wideProxies = wide.filter((e) => e.proxy).map((e) => e.proxy);
    const narrowProxies = narrow.filter((e) => e.proxy).map((e) => e.proxy);
    assert.ok(wideProxies.includes('sound'));
    assert.ok(narrowProxies.includes('sound'));
    assert.ok(wideProxies.indexOf('sound') > wideProxies.indexOf('language'));
    assert.ok(wideProxies.indexOf('sound') < wideProxies.indexOf('today-direction'));
  });

  it('wide companion requires enabled !== false', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      companionEnabled: false
    });
    assert.ok(!entries.some((e) => e.proxy === 'companion'));
  });

  it('language + five-moments + gift rows remain when secondary gates off (Sound stays in Preferences)', () => {
    const entries = listSecondaryChromeEntries('narrow-drawer', {
      microRitualVisible: false,
      companionVisible: false,
      reminderAvailable: false
    });
    assert.deepEqual(
      entries.filter((e) => e.proxy).map((e) => e.proxy),
      [
        'sanctuary-nav',
        'ground-exercise',
        'five-moments',
        'honesty',
        'journey-log',
        'presence-signals',
        'yin-coin',
        'daily-quote',
        'zen-cinema',
        'wallpapers',
        'art-collection',
        'quiet-together',
        'focus-circle',
        'community',
        'language',
        'sound',
        'mindflow-nebula',
        'today-direction',
        'newsletter',
        'account',
        'help-center',
        'local-backup',
        'membership',
        'ritual-morning',
        'ritual-emotional-reset',
        'ritual-work-transition'
      ]
    );
  });

  it('yin-coin sits immediately after presence-signals; flag-off hides the row', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const proxies = entries.filter((e) => e.proxy).map((e) => e.proxy);
    assert.equal(
      proxies.indexOf('yin-coin'),
      proxies.indexOf('presence-signals') + 1
    );
    const hidden = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      yinCoinVisible: false
    });
    assert.equal(
      hidden.some((e) => e.proxy === 'yin-coin'),
      false
    );
  });

  it('community sits in You are not alone, not Preferences', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const proxies = entries.filter((e) => e.proxy).map((e) => e.proxy);
    const communityIdx = proxies.indexOf('community');
    const focusCircleIdx = proxies.indexOf('focus-circle');
    const reminderIdx = proxies.indexOf('reminder');
    assert.ok(communityIdx > focusCircleIdx);
    assert.ok(reminderIdx > communityIdx);
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

  it('membership row sits after local-backup and immediately above Rituals group', () => {
    const entries = listSecondaryChromeEntries('wide-more', allOn);
    const localBackupIdx = entries.findIndex((e) => e.proxy === 'local-backup');
    const membershipIdx = entries.findIndex((e) => e.proxy === 'membership');
    const ritualsIdx = entries.findIndex(
      (e) => e.labelKey === 'ritual.menu_group'
    );
    assert.ok(localBackupIdx >= 0);
    assert.equal(membershipIdx, localBackupIdx + 1);
    assert.equal(ritualsIdx, membershipIdx + 1);
    assert.equal(entries[ritualsIdx]?.kind, 'group-label');
    assert.equal(entries[membershipIdx]?.labelKey, 'MENU_SUBSCRIPTION_ROW');
    assert.equal(entries[membershipIdx]?.emphasis, undefined);
  });

  it('Subscription row uses CTA testId when scenes are locked', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      scenesEntitled: false
    });
    const row = entries.find((e) => e.proxy === 'membership');
    assert.equal(row?.labelKey, 'MENU_SUBSCRIPTION_ROW');
    assert.equal(row?.emphasis, undefined);
    assert.equal(row?.interactive, undefined);
    assert.equal(row?.testId, 'idle-membership-cta');
  });

  it('Subscription row uses unlocked testId when scenes are entitled', () => {
    const entries = listSecondaryChromeEntries('wide-more', {
      ...allOn,
      scenesEntitled: true
    });
    const row = entries.find((e) => e.proxy === 'membership');
    assert.equal(row?.labelKey, 'MENU_SUBSCRIPTION_ROW');
    assert.equal(row?.interactive, undefined);
    assert.equal(row?.emphasis, undefined);
    assert.equal(row?.testId, 'idle-membership-unlocked');
  });

  it('lock accessible name includes requires-subscription copy', () => {
    const zh = ritualMenuLockAccessibleName(
      '晨间仪式',
      '需订阅，按回车查看。'
    );
    assert.match(zh, /需订阅/);
    const en = ritualMenuLockAccessibleName(
      'Morning Ritual',
      'Requires subscription. Press Return to view.'
    );
    assert.match(en, /Requires subscription/);
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

  it('every clickable catalog proxy declares a handler that resolves', () => {
    const maxVis = {
      ...allOn,
      mustardSeedSealUnlocked: true,
      systemTtsAvailable: true,
      confideUserVisible: true,
      companionGeneration: true
    };
    for (const surface of /** @type {const} */ (['wide-more', 'narrow-drawer'])) {
      const entries = listSecondaryChromeEntries(surface, maxVis);
      for (const row of entries) {
        if (!row.proxy) continue;
        if (row.interactive === false) {
          if (row.proxy === 'account') {
            assert.equal(row.handler, undefined);
          }
          continue;
        }
        assert.equal(
          typeof row.handler,
          'string',
          `${surface} ${row.proxy} missing handler`
        );
        const spec = resolveSecondaryChromeDispatch(row.proxy);
        assert.ok(spec, `${surface} ${row.proxy} missing dispatch spec`);
        assert.equal(spec.handler, row.handler);
      }
    }
  });
});

describe('dispatchSecondaryChromeProxy', () => {
  it('maps honesty to onHonesty (not onFiveMoments)', () => {
    const calls = [];
    const result = dispatchSecondaryChromeProxy('honesty', {
      handlers: {
        onHonesty: () => calls.push('honesty'),
        onFiveMoments: () => calls.push('five-moments')
      },
      clearStage: () => calls.push('clear'),
      close: () => calls.push('close')
    });
    assert.equal(result, 'invoked');
    assert.deepEqual(calls, ['clear', 'close', 'honesty']);
  });

  it('routes locked ritual rows to membership and still blocks static rows', () => {
    const calls = [];
    assert.equal(
      dispatchSecondaryChromeProxy(
        'ritual-morning',
        {
          handlers: {
            onRitualFlow: () => calls.push('ritual'),
            onMembership: () => calls.push('membership')
          },
          close: () => calls.push('close'),
          clearStage: () => calls.push('clear')
        },
        { locked: true }
      ),
      'invoked'
    );
    assert.deepEqual(calls, ['clear', 'close', 'membership']);
    assert.equal(
      dispatchSecondaryChromeProxy(
        'newsletter',
        { handlers: { onNewsletter: () => calls.push('newsletter') } },
        { interactive: false }
      ),
      'blocked'
    );
    assert.equal(calls.includes('newsletter'), false);
    assert.equal(calls.includes('ritual'), false);
  });

  it('missing handler throws in dev/test and does not close chrome', () => {
    const calls = [];
    assert.throws(
      () =>
        dispatchSecondaryChromeProxy('membership', {
          handlers: {},
          clearStage: () => calls.push('clear'),
          close: () => calls.push('close')
        }),
      /missing handler onMembership/
    );
    assert.deepEqual(calls, []);
  });

  it('missing handler in production logs and keeps chrome open', () => {
    const calls = [];
    const errors = [];
    const orig = console.error;
    console.error = (...args) => errors.push(args.join(' '));
    try {
      const result = invokeHandler({}, 'onMembership', [], { strict: false });
      assert.equal(result, undefined);
      const dispatched = dispatchSecondaryChromeProxy('membership', {
        handlers: {},
        handlerStrict: false,
        clearStage: () => calls.push('clear'),
        close: () => calls.push('close')
      });
      assert.equal(dispatched, 'missing-handler');
    } finally {
      console.error = orig;
    }
    assert.deepEqual(calls, []);
    assert.ok(errors.some((line) => String(line).includes('onMembership')));
  });

  it('invokeHandler throws by default in the test runner', () => {
    assert.equal(resolveHandlerStrictEnv({ nodeEnv: 'test' }), true);
    assert.equal(
      resolveHandlerStrictEnv({ nodeEnv: 'production', viteProd: true }),
      false
    );
    assert.throws(() => invokeHandler({}, 'onSound'), /missing handler onSound/);
    let called = 0;
    invokeHandler({ onSound: () => called++ }, 'onSound');
    assert.equal(called, 1);
  });

  it('missing prelude throws in dev/test before the main handler', () => {
    let companion = 0;
    assert.throws(
      () =>
        dispatchSecondaryChromeProxy('companion', {
          handlers: { onCompanion: () => companion++ },
          clearStage: () => {},
          addStage: () => {}
        }),
      /missing handler onClearCompanion/
    );
    assert.equal(companion, 0);
  });

  it('companion keeps menu open and runs prelude when present', () => {
    const calls = [];
    const result = dispatchSecondaryChromeProxy('companion', {
      handlers: {
        onClearCompanion: () => calls.push('clear-companion'),
        onCompanion: () => calls.push('companion')
      },
      clearStage: () => calls.push('clear'),
      close: () => calls.push('close'),
      addStage: (stage) => calls.push(`stage:${stage}`)
    });
    assert.equal(result, 'invoked');
    assert.deepEqual(calls, [
      'clear',
      'stage:companion',
      'clear-companion',
      'companion'
    ]);
  });

  it('narrow surface skips companion prelude', () => {
    const calls = [];
    dispatchSecondaryChromeProxy('companion', {
      handlers: {
        onClearCompanion: () => calls.push('clear-companion'),
        onCompanion: () => calls.push('companion')
      },
      runPrelude: false,
      clearStage: () => calls.push('clear'),
      addStage: (stage) => calls.push(`stage:${stage}`)
    });
    assert.deepEqual(calls, ['clear', 'stage:companion', 'companion']);
  });

  it('sanctuary-nav passes true; rituals pass proxy', () => {
    const args = [];
    dispatchSecondaryChromeProxy('sanctuary-nav', {
      handlers: { onSanctuaryNav: (v) => args.push(['nav', v]) },
      clearStage: () => {}
    });
    dispatchSecondaryChromeProxy('ritual-morning', {
      handlers: { onRitualFlow: (v) => args.push(['ritual', v]) },
      clearStage: () => {}
    });
    assert.deepEqual(args, [
      ['nav', true],
      ['ritual', 'ritual-morning']
    ]);
  });

  it('unknown proxy is not consumed', () => {
    assert.equal(
      dispatchSecondaryChromeProxy('sit', { handlers: {} }),
      'unknown'
    );
    assert.equal(SECONDARY_PROXY_DISPATCH.membership.handler, 'onMembership');
  });
});
