import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SCENE_ANIM_EVENTS,
  SCENE_ANIM_COOLDOWN_STORAGE_KEY,
  SCENE_ANIM_DAILY_STORAGE_KEY,
  HONESTY_LONG_MIN_MINUTES,
  LIGHT_COMPLETE_POOL,
  WELCOME_POOL,
  pickWeighted,
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

test('A′ locale: ja → palmsTogether; en → mindfulAcknowledge', () => {
  assert.equal(emotionKeyForLocaleGreeting('ja'), 'palmsTogether');
  assert.equal(emotionKeyForLocaleGreeting('en'), 'mindfulAcknowledge');
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

test('WELCOME_POOL trial includes welcomeBack + magicBookReading + nodGreeting', () => {
  assert.deepEqual(
    WELCOME_POOL.map((e) => e.key),
    ['welcomeBack', 'magicBookReading', 'nodGreeting']
  );
  assert.equal(pickWeighted(WELCOME_POOL, () => 0), 'welcomeBack');
  assert.equal(pickWeighted(WELCOME_POOL, () => 0.99), 'nodGreeting');
  assert.ok(WELCOME_POOL.some((e) => e.key === 'magicBookReading'));
});

test('canPlaySceneAnimGate blocks FOCUSING / CELEBRATE / overlay', () => {
  assert.equal(canPlaySceneAnimGate({ sessionState: 'IDLE' }), true);
  assert.equal(canPlaySceneAnimGate({ sessionState: 'FOCUSING' }), false);
  assert.equal(canPlaySceneAnimGate({ sessionState: 'CELEBRATE' }), false);
  assert.equal(
    canPlaySceneAnimGate({ sessionState: 'IDLE', overlayBusy: true }),
    false
  );
});

test('LANGUAGE_CHANGED via dispatcher: ja palmsTogether; quota after mark; gate', () => {
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
  assert.equal(first.emotionKey, 'palmsTogether');
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

test('WELCOME_APP once per day', () => {
  const storage = memoryStorage();
  const now = () => new Date(2026, 7, 1, 9);
  const first = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.WELCOME_APP,
    sessionState: 'IDLE',
    storage,
    now,
    random: () => 0
  });
  assert.equal(first.play, true);
  assert.equal(first.emotionKey, 'welcomeBack');
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
  assert.equal(first.emotionKey, 'yawnStretch');

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
  assert.equal(after.emotionKey, 'teaDrinking');

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
