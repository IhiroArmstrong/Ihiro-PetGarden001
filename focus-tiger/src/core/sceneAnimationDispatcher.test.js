/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SCENE_ANIM_EVENTS,
  SCENE_ANIM_COOLDOWN_STORAGE_KEY,
  SCENE_ANIM_DAILY_STORAGE_KEY,
  HONESTY_LONG_MIN_MINUTES,
  LIGHT_COMPLETE_POOL,
  WELCOME_POOL,
  RISE_INTERRUPT_POOL,
  shouldAttemptLateNightOnBoot,
  pickWeighted,
  pickRiseInterruptEmotion,
  isRiseInterruptHoldEmotion,
  emotionKeyForHonestyDuration,
  lightPoolIsCelebrateSafe,
  canPlaySceneAnimGate,
  resolveSceneAnimation,
  isCoolingDown,
  markCooldown,
  readDailySceneAnimState
} from './sceneAnimationDispatcher.js';
import {
  emotionKeyForLocaleGreeting,
  markLocaleGreetingPlayed
} from './localeGreeting.js';
import {
  FLOWER_WELCOME_EMOTION_KEY,
  FLOWER_WELCOME_FLAG_STORAGE_KEY,
  FLOWER_WELCOME_STORAGE_KEY,
  readFlowerWelcomeState
} from './flowerWelcomeGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    _map: map
  };
}

/** Phase 2b：既有欢迎池用例关闭吹花门闩，避免 Day1 空存储强制吹花 */
function disableFlowerWelcome(storage) {
  storage.setItem(FLOWER_WELCOME_FLAG_STORAGE_KEY, '0');
}

test('A′ locale: ja → bookReading; en → teaDrinking', () => {
  assert.equal(emotionKeyForLocaleGreeting('ja'), 'bookReading');
  assert.equal(emotionKeyForLocaleGreeting('en'), 'teaDrinking');
});

test('Honesty duration: ≤29 nod; ≥30 goldenHaloPalms', () => {
  assert.equal(emotionKeyForHonestyDuration(10), 'mindfulAcknowledge');
  assert.equal(emotionKeyForHonestyDuration(20), 'mindfulAcknowledge');
  assert.equal(emotionKeyForHonestyDuration(29), 'mindfulAcknowledge');
  assert.equal(emotionKeyForHonestyDuration(HONESTY_LONG_MIN_MINUTES), 'goldenHaloPalms');
  assert.equal(emotionKeyForHonestyDuration(45), 'goldenHaloPalms');
  assert.equal(emotionKeyForHonestyDuration(0), null);
});

test('light completion pool never includes celebrate dance', () => {
  assert.equal(lightPoolIsCelebrateSafe(LIGHT_COMPLETE_POOL), true);
  assert.equal(
    lightPoolIsCelebrateSafe([
      { key: 'sessionComplete', weight: 60 },
      { key: 'celebrateDanceV2', weight: 40 }
    ]),
    false
  );
});

test('LIGHT_COMPLETE_POOL has no curiousTilt; weights go to sessionComplete / nod / parrot', () => {
  assert.deepEqual(
    LIGHT_COMPLETE_POOL.map((e) => ({ key: e.key, weight: e.weight })),
    [
      { key: 'sessionComplete', weight: 70 },
      { key: 'mindfulAcknowledge', weight: 30 },
      { key: 'parrotEarVisit', weight: 8 }
    ]
  );
  assert.ok(!LIGHT_COMPLETE_POOL.some((e) => e.key === 'curiousTilt'));
  assert.equal(pickWeighted(LIGHT_COMPLETE_POOL, () => 0), 'sessionComplete');
  assert.equal(
    pickWeighted(LIGHT_COMPLETE_POOL, () => 0.99),
    'parrotEarVisit'
  );
});

test('WELCOME_POOL trial is magicBookReading + nodGreeting (wave out of cold-start)', () => {
  assert.deepEqual(
    WELCOME_POOL.map((e) => e.key),
    ['magicBookReading', 'nodGreeting']
  );
  assert.equal(pickWeighted(WELCOME_POOL, () => 0), 'magicBookReading');
  assert.equal(pickWeighted(WELCOME_POOL, () => 0.99), 'nodGreeting');
  assert.ok(!WELCOME_POOL.some((e) => e.key === 'welcomeBack'));
  assert.ok(!WELCOME_POOL.some((e) => e.key === 'teaDrinking'));
  assert.ok(!WELCOME_POOL.some((e) => e.key === 'yawnStretch'));
  assert.ok(!WELCOME_POOL.some((e) => e.key === 'stretchReminder'));
});

test('RISE_INTERRUPT_POOL is stretch 60 / tea 25 / book 15; no magic/yawn/celebrate', () => {
  assert.deepEqual(
    RISE_INTERRUPT_POOL.map((e) => ({ key: e.key, weight: e.weight })),
    [
      { key: 'riseStretchCasual', weight: 60 },
      { key: 'teaDrinking', weight: 25 },
      { key: 'bookReading', weight: 15 }
    ]
  );
  assert.equal(pickRiseInterruptEmotion(() => 0), 'riseStretchCasual');
  assert.equal(pickRiseInterruptEmotion(() => 0.59), 'riseStretchCasual');
  assert.equal(pickRiseInterruptEmotion(() => 0.6), 'teaDrinking');
  assert.equal(pickRiseInterruptEmotion(() => 0.84), 'teaDrinking');
  assert.equal(pickRiseInterruptEmotion(() => 0.85), 'bookReading');
  assert.equal(pickRiseInterruptEmotion(() => 0.99), 'bookReading');
  assert.ok(!RISE_INTERRUPT_POOL.some((e) => e.key === 'magicBookReading'));
  assert.ok(!RISE_INTERRUPT_POOL.some((e) => e.key === 'yawnStretch'));
  assert.ok(!RISE_INTERRUPT_POOL.some((e) => e.key === 'celebrating'));
  assert.ok(!RISE_INTERRUPT_POOL.some((e) => e.key === 'blinkBreathe'));
});

test('isRiseInterruptHoldEmotion covers pool keys + debug blinkBreathe', () => {
  assert.equal(isRiseInterruptHoldEmotion('riseStretchCasual'), true);
  assert.equal(isRiseInterruptHoldEmotion('teaDrinking'), true);
  assert.equal(isRiseInterruptHoldEmotion('bookReading'), true);
  assert.equal(isRiseInterruptHoldEmotion('blinkBreathe'), true);
  assert.equal(isRiseInterruptHoldEmotion('idle'), false);
  assert.equal(isRiseInterruptHoldEmotion('magicBookReading'), false);
  assert.equal(isRiseInterruptHoldEmotion(null), false);
});

test('cold-start: late night deferred when welcome plays; allowed when welcome skipped', () => {
  assert.equal(
    shouldAttemptLateNightOnBoot({ play: true, emotionKey: 'magicBookReading' }),
    false
  );
  assert.equal(
    shouldAttemptLateNightOnBoot({ play: false, reason: 'quota' }),
    true
  );
  assert.equal(shouldAttemptLateNightOnBoot(null), true);

  // Composition: night boot with fresh welcome must not also resolve late-night
  // if caller follows shouldAttemptLateNightOnBoot (main.js contract).
  const storage = memoryStorage();
  disableFlowerWelcome(storage);
  const night = () => new Date(2026, 7, 2, 23, 40);
  const welcome = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage,
    now: night,
    random: () => 0
  });
  assert.equal(welcome.play, true);
  assert.ok(
    ['magicBookReading', 'nodGreeting'].includes(welcome.emotionKey)
  );
  assert.equal(shouldAttemptLateNightOnBoot(welcome), false);

  const storageQuota = memoryStorage();
  disableFlowerWelcome(storageQuota);
  writeWelcomePlayed(storageQuota, night);
  const skipped = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage: storageQuota,
    now: night,
    random: () => 0
  });
  assert.equal(skipped.play, false);
  assert.equal(shouldAttemptLateNightOnBoot(skipped), true);
  const late = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LATE_NIGHT,
    sessionState: 'IDLE',
    storage: storageQuota,
    now: night,
    random: () => 0
  });
  assert.equal(late.play, true);
  assert.equal(late.emotionKey, 'forceDormant');
});

function writeWelcomePlayed(storage, now) {
  storage.setItem(
    SCENE_ANIM_DAILY_STORAGE_KEY,
    JSON.stringify({
      dateKey: `${now().getFullYear()}-${String(now().getMonth() + 1).padStart(2, '0')}-${String(now().getDate()).padStart(2, '0')}`,
      welcome: true
    })
  );
}

test('canPlaySceneAnimGate blocks FOCUSING / CELEBRATE / overlay', () => {
  assert.equal(canPlaySceneAnimGate({ sessionState: 'IDLE' }), true);
  assert.equal(canPlaySceneAnimGate({ sessionState: 'FOCUSING' }), false);
  assert.equal(canPlaySceneAnimGate({ sessionState: 'CELEBRATE' }), false);
  assert.equal(
    canPlaySceneAnimGate({ sessionState: 'IDLE', overlayBusy: true }),
    false
  );
});

test('LANGUAGE_CHANGED via dispatcher: ja bookReading; quota after mark; gate', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 7, 1, 12);

  const first = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LANGUAGE_CHANGED,
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'bookReading');
  // Resolve does not consume — same resolve again would still allow play.
  const stillOpen = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LANGUAGE_CHANGED,
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(stillOpen.play, true);

  assert.equal(markLocaleGreetingPlayed({ locale: 'ja', storage, now }), true);

  const again = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LANGUAGE_CHANGED,
    locale: 'ja',
    sessionState: 'IDLE',
    storage,
    now
  });
  assert.equal(again.play, false);
  assert.equal(again.reason, 'quota');

  const gated = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LANGUAGE_CHANGED,
    locale: 'en',
    sessionState: 'FOCUSING',
    storage: memoryStorage(),
    now
  });
  assert.equal(gated.play, false);
  assert.equal(gated.reason, 'gate');
});

test('HONESTY_COMPLETED: short nod; long halo; dormant skips', () => {
  const storage = memoryStorage();
  const short = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.HONESTY_COMPLETED,
    sessionState: 'IDLE',
    durationMinutes: 20,
    storage
  });
  assert.deepEqual(
    { play: short.play, emotionKey: short.emotionKey },
    { play: true, emotionKey: 'mindfulAcknowledge' }
  );

  const long = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.HONESTY_COMPLETED,
    sessionState: 'IDLE',
    durationMinutes: 30,
    storage
  });
  assert.equal(long.emotionKey, 'goldenHaloPalms');

  const dormant = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.HONESTY_COMPLETED,
    sessionState: 'IDLE',
    durationMinutes: 30,
    wokeFromDormant: true,
    storage
  });
  assert.equal(dormant.play, false);
  assert.equal(dormant.reason, 'dormant-wake-path');
});

test('SESSION_COMPLETE_LIGHT / MICRO_RITUAL pick from celebrate-safe pool', () => {
  const storage = memoryStorage();
  const random = () => 0;
  const light = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.SESSION_COMPLETE_LIGHT,
    sessionState: 'IDLE',
    storage,
    random
  });
  assert.equal(light.play, true);
  assert.equal(light.emotionKey, 'sessionComplete');
  assert.ok(LIGHT_COMPLETE_POOL.some((e) => e.key === light.emotionKey));

  const micro = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.MICRO_RITUAL_COMPLETE,
    sessionState: 'IDLE',
    storage,
    random: () => 0.99
  });
  assert.equal(micro.play, true);
  assert.ok(
    !['celebrating', 'celebrateDanceV2'].includes(micro.emotionKey)
  );
});

test('LIGHT_COMPLETE_POOL includes rare parrotEarVisit easter egg', () => {
  assert.ok(LIGHT_COMPLETE_POOL.some((e) => e.key === 'parrotEarVisit'));
  const storage = memoryStorage();
  // weight 8/108 ≈ last bucket: roll near 1.0
  const rare = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.MICRO_RITUAL_COMPLETE,
    sessionState: 'IDLE',
    storage,
    random: () => 0.999
  });
  assert.equal(rare.play, true);
  assert.equal(rare.emotionKey, 'parrotEarVisit');
});

test('WELCOME_APP once per day', () => {
  const storage = memoryStorage();
  disableFlowerWelcome(storage);
  const now = () => new Date(2026, 7, 1, 9);
  const first = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage,
    now,
    random: () => 0
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'magicBookReading');
  assert.equal(readDailySceneAnimState(storage, now).welcome, true);

  const second = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage,
    now,
    random: () => 0
  });
  assert.equal(second.play, false);
  assert.equal(second.reason, 'quota');
  assert.ok(storage.getItem(SCENE_ANIM_DAILY_STORAGE_KEY));
});

test('WELCOME_APP Day1 / absence force flower; XOR same-day welcome quota', () => {
  const now = () => new Date(2026, 7, 6, 10);
  const day1 = memoryStorage();
  const first = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage: day1,
    now,
    random: () => 0
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, FLOWER_WELCOME_EMOTION_KEY);
  assert.equal(first.flowerWelcome, true);
  assert.equal(first.flowerBilingual, true);
  assert.equal(first.reason, 'flower-day1');
  assert.equal(readDailySceneAnimState(day1, now).welcome, true);
  assert.equal(readFlowerWelcomeState(day1).lastOpenDateKey, '2026-08-06');

  const second = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage: day1,
    now,
    random: () => 0
  });
  assert.equal(second.play, false);
  assert.equal(second.reason, 'quota');

  const absence = memoryStorage();
  absence.setItem(
    FLOWER_WELCOME_STORAGE_KEY,
    JSON.stringify({
      lastOpenDateKey: '2026-08-02',
      firstBubbleDone: true
    })
  );
  const longAway = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage: absence,
    now,
    random: () => 0
  });
  assert.equal(longAway.emotionKey, FLOWER_WELCOME_EMOTION_KEY);
  assert.equal(longAway.reason, 'flower-absence');
  assert.equal(longAway.flowerBilingual, false);

  const ordinary = memoryStorage();
  ordinary.setItem(
    FLOWER_WELCOME_STORAGE_KEY,
    JSON.stringify({
      lastOpenDateKey: '2026-08-05',
      firstBubbleDone: true
    })
  );
  const nextDay = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage: ordinary,
    now,
    random: () => 0
  });
  assert.equal(nextDay.emotionKey, 'magicBookReading');
  assert.equal(nextDay.flowerWelcome, false);
});

test('LATE_NIGHT cooldown 1h; CURIOSITY chance + cooldown', () => {
  const storage = memoryStorage();
  const night = () => new Date(2026, 7, 1, 23, 30);
  const first = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LATE_NIGHT,
    sessionState: 'IDLE',
    storage,
    now: night,
    random: () => 0
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'forceDormant');

  // Stay within the same late-night hour window (23:xx) while cooling down
  const cool = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LATE_NIGHT,
    sessionState: 'IDLE',
    storage,
    now: () => new Date(2026, 7, 1, 23, 45),
    random: () => 0
  });
  assert.equal(cool.reason, 'cooldown');

  const afterStorage = memoryStorage();
  // Seed prior cooldown then advance past 1h still at late night
  markCooldown(afterStorage, 'late_night', new Date(2026, 7, 1, 22, 0).getTime());
  const after = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.LATE_NIGHT,
    sessionState: 'IDLE',
    storage: afterStorage,
    now: () => new Date(2026, 7, 1, 23, 30),
    random: () => 0.9
  });
  assert.equal(after.play, true);
  assert.equal(after.emotionKey, 'forceDormant');

  const miss = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.CURIOSITY,
    sessionState: 'IDLE',
    storage: memoryStorage(),
    now: night,
    random: () => 0.99
  });
  assert.equal(miss.reason, 'chance');

  const curStorage = memoryStorage();
  const hit = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.CURIOSITY,
    sessionState: 'IDLE',
    storage: curStorage,
    now: night,
    random: () => 0
  });
  assert.equal(hit.play, true);
  assert.ok(['earWiggleHeadTouch', 'gazeLookAround'].includes(hit.emotionKey));
  assert.equal(
    isCoolingDown(curStorage, 'curiosity', night().getTime() + 1000),
    true
  );
  assert.ok(curStorage.getItem(SCENE_ANIM_COOLDOWN_STORAGE_KEY));
});

test('STRETCH_REMINDER pool includes yawn', () => {
  const yawn = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.STRETCH_REMINDER,
    sessionState: 'IDLE',
    storage: memoryStorage(),
    random: () => 0.99
  });
  assert.equal(yawn.emotionKey, 'yawnStretch');
});
