/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * DEV「一键重置全部本地状态」· L-logic
 *
 * 用户无法逐项核对 localStorage 是否回到新用户；本文件锁：
 * 1) 白名单与各模块 STORAGE_KEY 完全一致（防漏清）
 * 2) 脏状态 clear 后 Store 读数等同全新用户
 * 3) sessionStorage 一次性 toast / boot-idle 标记行为
 *
 * 按钮可见性（实验室有 / ?product=1 无）见 e2e/product-shell.smoke.spec.js。
 * 跑法：`npm test` 或 `npm run test:smoke`
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { DailyCompletionStore, DAILY_COMPLETION_STORAGE_KEY } from './DailyCompletionStore.js';
import {
  FocusSessionEndStore,
  FOCUS_SESSION_END_STORAGE_KEY
} from './FocusSessionEndStore.js';
import {
  PracticeDaysStore,
  PRACTICE_DAYS_STORAGE_KEY
} from './PracticeDaysStore.js';
import {
  LotusPondStore,
  LOTUS_POND_STORAGE_KEY
} from './LotusPondStore.js';
import { MILESTONE_GLOW_STORAGE_KEY } from './MilestoneGlowStore.js';
import { RITUAL_COMPLETION_STORAGE_KEY } from './RitualCompletionStore.js';
import { COMPANION_MODE_STORAGE_KEY } from './FocusSession.js';
import { HonestyBridgeStore, HONESTY_BRIDGE_STORAGE_KEY } from './HonestyBridgeStore.js';
import {
  RetentionFunnelStore,
  RETENTION_FUNNEL_STORAGE_KEY
} from './RetentionTelemetry.js';
import {
  createHintsSeenStore,
  HINTS_SEEN_STORAGE_KEY
} from './OnboardingHintsStore.js';
import {
  ReminderQuotaManager,
  REMINDER_QUOTA_STORAGE_KEY
} from './ReminderQuotaManager.js';
import {
  getReminderPreference,
  setReminderPreference,
  REMINDER_PREFERENCE_STORAGE_KEY
} from './reminderPreference.js';
import { LOCALE_PREFERENCE_STORAGE_KEY } from '../locales/localePreference.js';
import { LOCALE_GREETING_STORAGE_KEY } from './localeGreeting.js';
import {
  SCENE_ANIM_COOLDOWN_STORAGE_KEY,
  SCENE_ANIM_DAILY_STORAGE_KEY
} from './sceneAnimationDispatcher.js';
import {
  FLOWER_WELCOME_FLAG_STORAGE_KEY,
  FLOWER_WELCOME_STORAGE_KEY
} from './flowerWelcomeGate.js';
import { INTENTION_STORAGE_KEY } from './SessionIntentionStore.js';
import { REFLECTION_STORAGE_KEY } from './SessionEndFlow.js';
import { TIP_JAR_STORAGE_KEY } from './tipJarGate.js';
import { CONTEXTUAL_TEA_TIP_STORAGE_KEY } from './contextualTeaTipGate.js';
import { MONETIZATION_FUNNEL_STORAGE_KEY } from './monetizationIntentFunnel.js';
import { MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY } from './monetizationFunnelOptIn.js';
import { NEWSLETTER_CAPTURE_STORAGE_KEY } from './newsletter/newsletterCaptureGate.js';
import { SANCTUARY_STORAGE_KEY } from './sanctuaryEntitlementGate.js';
import { ENTITLEMENT_CACHE_STORAGE_KEY } from './entitlement/entitlementState.js';
import { ENTITLEMENT_OWNERSHIP_STORAGE_KEY } from './entitlement/entitlementOwnership.js';
import { ENTITLEMENT_MOCK_STORAGE_KEY } from './entitlement/mockEntitlementProvider.js';
import { MEMBERSHIP_DEVICE_CREDENTIAL_KEY } from './membershipDeviceCredential.js';
import { FIVE_MOMENTS_COMPASS_SEEN_KEY } from './fiveMomentsCompassGate.js';
import { WELLNESS_DISCLAIMER_SEEN_KEY } from './wellnessDisclaimerGate.js';
import { MOMENT_WHISPERS_SEEN_KEY } from './momentWhispersGate.js';
import { JOURNEY_LOG_STORAGE_KEY } from './journeyLogGate.js';
import { DAILY_WISDOM_STORAGE_KEY } from './DailyWisdomStore.js';
import { MUSTARD_SEED_SEAL_STORAGE_KEY } from './mustardSeedSeal.js';
import { DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY } from './dailyZenQuote.js';
import { IDLE_COMPANION_PIP_STORAGE_KEY } from './idleCompanionPipGate.js';
import { PRACTICE_BACKUP_OPT_IN_KEY } from './practiceBackup/practiceBackupSnapshot.js';
import {
  FOCUS_TIGER_LOCAL_STORAGE_KEYS,
  clearAllFocusTigerLocalState,
  markDevResetToast,
  consumeDevResetToast,
  markDevBootIdle,
  consumeDevBootIdle,
  DEV_RESET_TOAST_SESSION_KEY,
  DEV_BOOT_IDLE_SESSION_KEY
} from './localStateKeys.js';

function createMapStorage(seed = {}) {
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

/**
 * AmbientSoundscapeUI 的 key（不从此处 import UI 模块，避免 node 测拖进 DOM/i18n）。
 * 须与 `AmbientSoundscapeUI.AMBIENT_NUDGE_STORAGE_KEY` / SHARED_RESOURCES 字面量一致。
 */
const AMBIENT_NUDGE_STORAGE_KEY = 'focus-tiger.ambient-nudge.seen.v1';
const AMBIENT_PREF_STORAGE_KEY = 'focus-tiger.ambient-pref.v1';
const SESSION_CUE_PREF_STORAGE_KEY = 'focus-tiger.session-cues.v1';

/** 各模块导出的 localStorage key —— 与白名单必须集合相等。 */
const MODULE_LOCAL_STORAGE_KEYS = Object.freeze([
  DAILY_COMPLETION_STORAGE_KEY,
  FOCUS_SESSION_END_STORAGE_KEY,
  PRACTICE_DAYS_STORAGE_KEY,
  LOTUS_POND_STORAGE_KEY,
  MILESTONE_GLOW_STORAGE_KEY,
  RITUAL_COMPLETION_STORAGE_KEY,
  HONESTY_BRIDGE_STORAGE_KEY,
  RETENTION_FUNNEL_STORAGE_KEY,
  INTENTION_STORAGE_KEY,
  REFLECTION_STORAGE_KEY,
  COMPANION_MODE_STORAGE_KEY,
  REMINDER_QUOTA_STORAGE_KEY,
  REMINDER_PREFERENCE_STORAGE_KEY,
  HINTS_SEEN_STORAGE_KEY,
  AMBIENT_NUDGE_STORAGE_KEY,
  AMBIENT_PREF_STORAGE_KEY,
  SESSION_CUE_PREF_STORAGE_KEY,
  LOCALE_PREFERENCE_STORAGE_KEY,
  LOCALE_GREETING_STORAGE_KEY,
  SCENE_ANIM_COOLDOWN_STORAGE_KEY,
  SCENE_ANIM_DAILY_STORAGE_KEY,
  FLOWER_WELCOME_STORAGE_KEY,
  FLOWER_WELCOME_FLAG_STORAGE_KEY,
  TIP_JAR_STORAGE_KEY,
  CONTEXTUAL_TEA_TIP_STORAGE_KEY,
  MONETIZATION_FUNNEL_STORAGE_KEY,
  MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY,
  NEWSLETTER_CAPTURE_STORAGE_KEY,
  SANCTUARY_STORAGE_KEY,
  ENTITLEMENT_CACHE_STORAGE_KEY,
  ENTITLEMENT_OWNERSHIP_STORAGE_KEY,
  ENTITLEMENT_MOCK_STORAGE_KEY,
  MEMBERSHIP_DEVICE_CREDENTIAL_KEY,
  FIVE_MOMENTS_COMPASS_SEEN_KEY,
  WELLNESS_DISCLAIMER_SEEN_KEY,
  MOMENT_WHISPERS_SEEN_KEY,
  JOURNEY_LOG_STORAGE_KEY,
  PRACTICE_BACKUP_OPT_IN_KEY,
  DAILY_WISDOM_STORAGE_KEY,
  MUSTARD_SEED_SEAL_STORAGE_KEY,
  DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY,
  IDLE_COMPANION_PIP_STORAGE_KEY
]);

test('whitelist matches every module STORAGE_KEY (no orphan / no missing)', () => {
  const whitelist = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEYS);
  const modules = new Set(MODULE_LOCAL_STORAGE_KEYS);

  assert.equal(whitelist.size, FOCUS_TIGER_LOCAL_STORAGE_KEYS.length, 'whitelist has duplicates');
  assert.equal(modules.size, MODULE_LOCAL_STORAGE_KEYS.length, 'module keys have duplicates');

  for (const key of modules) {
    assert.ok(whitelist.has(key), `whitelist missing module key: ${key}`);
  }
  for (const key of whitelist) {
    assert.ok(modules.has(key), `whitelist orphan (no module export): ${key}`);
  }
});

test('FOCUS_TIGER_LOCAL_STORAGE_KEYS stays kebab focus-tiger.*.v1 style', () => {
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    assert.match(key, /^focus-tiger\.[a-z0-9.-]+\.v1$/);
  }
});

test('clearAllFocusTigerLocalState removes every known Focus Tiger key', () => {
  const storage = createMapStorage();
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    storage.setItem(key, 'dirty');
  }
  storage.setItem('unrelated.app.v1', 'keep');

  const cleared = clearAllFocusTigerLocalState(storage);
  assert.equal(cleared.length, FOCUS_TIGER_LOCAL_STORAGE_KEYS.length);
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    assert.equal(storage.getItem(key), null);
  }
  assert.equal(storage.getItem('unrelated.app.v1'), 'keep');
});

test('clearAllFocusTigerLocalState → stores read as new user (zero / unseen)', () => {
  const storage = createMapStorage();

  const dirtyCompletions = new DailyCompletionStore({ storage });
  dirtyCompletions.recordCompletion(20);
  assert.equal(dirtyCompletions.hasCompletedToday(), true);

  const dirtyPractice = new PracticeDaysStore({ storage });
  dirtyPractice.markToday();
  assert.ok(dirtyPractice.getRecentStreakDays() >= 1);

  const dirtyLotus = new LotusPondStore({ storage });
  dirtyLotus.addMinutes(25);
  assert.equal(dirtyLotus.getVisibleBloomCount(), 1);

  const dirtyBridge = new HonestyBridgeStore({ storage });
  dirtyBridge.markShown();
  assert.equal(dirtyBridge.hasShownToday(), true);

  const dirtyRetention = new RetentionFunnelStore({
    storage,
    track: () => {}
  });
  dirtyRetention.noteAppOpen();
  assert.ok(dirtyRetention.getState().firstOpenAt != null);

  const dirtyQuota = new ReminderQuotaManager({ storage, dailyLimit: 3 });
  assert.equal(dirtyQuota.tryConsume(), true);
  assert.equal(dirtyQuota.tryConsume(), true);
  assert.equal(dirtyQuota.tryConsume(), true);
  assert.equal(dirtyQuota.tryConsume(), false);

  assert.equal(
    setReminderPreference({ hour: 18, minute: 0 }, { storage }),
    true
  );
  assert.deepEqual(getReminderPreference({ storage }), {
    hour: 18,
    minute: 0
  });

  storage.setItem(COMPANION_MODE_STORAGE_KEY, 'stay');
  storage.setItem(INTENTION_STORAGE_KEY, JSON.stringify([{ text: 'x' }]));
  storage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify([{ text: 'y' }]));
  storage.setItem(AMBIENT_NUDGE_STORAGE_KEY, '1');
  storage.setItem(
    AMBIENT_PREF_STORAGE_KEY,
    JSON.stringify({ enabled: false, trackId: 'rain' })
  );
  storage.setItem(
    SESSION_CUE_PREF_STORAGE_KEY,
    JSON.stringify({
      sessionStartBellEnabled: false,
      sessionEndBellEnabled: false
    })
  );

  const hintsBag = {
    getItem: (k) => storage.getItem(k),
    setItem: (k, v) => storage.setItem(k, v),
    removeItem: (k) => storage.removeItem(k)
  };
  const dirtyHints = createHintsSeenStore(
    () => JSON.parse(hintsBag.getItem(HINTS_SEEN_STORAGE_KEY) || '{}'),
    (value) => hintsBag.setItem(HINTS_SEEN_STORAGE_KEY, JSON.stringify(value))
  );
  dirtyHints.markSeen('sit-button');
  assert.equal(dirtyHints.isSeen('sit-button'), true);

  clearAllFocusTigerLocalState(storage);

  // 新实例 = 刷新后的新用户（内存缓存不会自动失效）
  const freshCompletions = new DailyCompletionStore({ storage });
  assert.equal(freshCompletions.hasCompletedToday(), false);
  assert.deepEqual(freshCompletions.getTodaySessions(), []);

  const freshPractice = new PracticeDaysStore({ storage });
  assert.equal(freshPractice.getRecentStreakDays(), 0);
  assert.equal(freshPractice.getRingFilled(7), 0);

  const freshLotus = new LotusPondStore({ storage });
  assert.equal(freshLotus.getLifetimeMinutes(), 0);
  assert.equal(freshLotus.getVisibleBloomCount(), 0);

  const freshBridge = new HonestyBridgeStore({ storage });
  assert.equal(freshBridge.hasShownToday(), false);

  const freshRetention = new RetentionFunnelStore({ storage });
  assert.equal(freshRetention.getState().firstOpenAt, null);

  const freshQuota = new ReminderQuotaManager({ storage, dailyLimit: 3 });
  assert.equal(freshQuota.tryConsume(), true);

  assert.equal(getReminderPreference({ storage }), null);

  assert.equal(storage.getItem(COMPANION_MODE_STORAGE_KEY), null);
  assert.equal(storage.getItem(INTENTION_STORAGE_KEY), null);
  assert.equal(storage.getItem(REFLECTION_STORAGE_KEY), null);
  assert.equal(storage.getItem(AMBIENT_NUDGE_STORAGE_KEY), null);
  assert.equal(storage.getItem(AMBIENT_PREF_STORAGE_KEY), null);
  assert.equal(storage.getItem(SESSION_CUE_PREF_STORAGE_KEY), null);

  const freshHints = createHintsSeenStore(
    () => JSON.parse(storage.getItem(HINTS_SEEN_STORAGE_KEY) || '{}'),
    (value) => storage.setItem(HINTS_SEEN_STORAGE_KEY, JSON.stringify(value))
  );
  assert.equal(freshHints.isSeen('sit-button'), false);
});

test('dev session flags are one-shot consume (sessionStorage, not wiped by clear)', () => {
  const session = createMapStorage();
  const local = createMapStorage({
    [DAILY_COMPLETION_STORAGE_KEY]: '{"sessions":[]}'
  });

  markDevResetToast(session);
  markDevBootIdle(session);
  clearAllFocusTigerLocalState(local);

  // clear 只动 localStorage；session 标记仍在，供刷新后 toast / idle boot
  assert.equal(session.getItem(DEV_RESET_TOAST_SESSION_KEY), '1');
  assert.equal(session.getItem(DEV_BOOT_IDLE_SESSION_KEY), '1');
  assert.equal(local.getItem(DAILY_COMPLETION_STORAGE_KEY), null);

  assert.equal(consumeDevResetToast(session), true);
  assert.equal(consumeDevResetToast(session), false);
  assert.equal(consumeDevBootIdle(session), true);
  assert.equal(consumeDevBootIdle(session), false);
});
