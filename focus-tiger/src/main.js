// 入口文件：只做"拼装 + 主循环调度"，不允许直接创建 THREE.Scene() /
// THREE.PerspectiveCamera() / THREE.WebGLRenderer() 等底层对象——
// 这些必须封装在 core/Renderer.js 和 core/Scene.js 里，main.js 只负责调用。

import * as THREE from 'three';
import { createRenderer, setupSceneEnvironment } from './core/Renderer.js';
import { createScene } from './core/Scene.js';
import { createPostProcessing } from './core/PostProcessing.js';
import {
  FocusSession,
  resolveDemoSessionMinutes,
  shouldSuppressAwayReminders,
  shouldAutoStartFocusOnModeSelect,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS
} from './core/FocusSession.js';
import {
  loadPreferredFocusDurationMinutes,
  resolveFocusSessionTargetMinutes,
  savePreferredFocusDurationMinutes,
  shouldSkipFocusDurationPicker
} from './core/focusDuration.js';
import { SessionUiGate } from './core/SessionUiGate.js';
import { createSessionChromeSync } from './core/sessionChromeSync.js';
import { StateManager, STATES } from './core/StateManager.js';
import { TigerCharacter } from './character/TigerCharacter.js';
import { PoseManager } from './character/PoseManager.js';
import { MoodController } from './core/MoodController.js';
import {
  ARRIVAL_BREATH_SMILE_FPS,
  CAPCUT_DISSOLVE_MS,
  EmotionController
} from './core/EmotionController.js';

import { FocusVisualizer } from './feedback/FocusVisualizer.js';
import { TransitionFX } from './feedback/TransitionFX.js';
import { Ambience } from './feedback/Ambience.js';
import { FocusInput } from './input/FocusInput.js';
import { UIControls } from './input/UIControls.js';
import { FocusHUD } from './ui/FocusHUD.js';
import { ImmersivePresenceUI } from './ui/ImmersivePresenceUI.js';
import { createIdleChromeFacade } from './core/createIdleChromeFacade.js';
import {
  WeeklyPracticeHeatmap,
  WEEKLY_PRACTICE_HEATMAP_DAYS
} from './ui/WeeklyPracticeHeatmap.js';
import { ReminderPreferenceUI } from './ui/ReminderPreferenceUI.js';
import { InAppReminderBannerUI } from './ui/InAppReminderBannerUI.js';
import {
  InAppReminderBannerController,
  isReminderBusySession
} from './core/InAppReminderBannerController.js';
import { shouldPlayParrotMessengerOnBannerShow } from './core/parrotMessengerGate.js';
import {
  evaluateInAppReminderBanner,
  REMINDER_GENTLE_WAITING_MESSAGE_KEY
} from './core/reminderPreference.js';
import { FOCUS_SESSION_DEFAULT_MINUTES } from './utils/Constants.js';
import { IncenseGreeting } from './effects/IncenseGreeting.js';
import { LightProgression } from './effects/LightProgression.js';
import { DynamicMotion } from './effects/DynamicMotion.js';
import { PointerInteraction } from './input/PointerInteraction.js';
import { SpriteSequencePlayer } from './character/SpriteSequencePlayer.js';
import { IdleOrchestrator } from './character/IdleOrchestrator.js';
import { t, tPool, tInLocale, setLocale, getLocale, onLocaleChange, bootLocaleFromPreference } from './locales/i18n.js';
import { registerServiceWorker } from './pwa/registerServiceWorker.js';
import { LanguagePreferenceUI } from './ui/LanguagePreferenceUI.js';
import { ZenCinemaCardUI } from './ui/ZenCinemaCardUI.js';
import { FiveMomentsCompassUI } from './ui/FiveMomentsCompassUI.js';
import { JourneyLogUI } from './ui/JourneyLogUI.js';
import { MomentWhisperUI } from './ui/MomentWhisperUI.js';
import {
  shouldOfferFiveMomentsCompassFirstCard
} from './core/fiveMomentsCompassGate.js';
import {
  appendJourneyLogEntry,
  resolveJourneyMinutes
} from './core/journeyLogGate.js';
import { DailyZenQuoteCardUI } from './ui/DailyZenQuoteCardUI.js';
import { DigitalWallpapersCardUI } from './ui/DigitalWallpapersCardUI.js';
import { SanctuaryUnlockUI, bootSanctuaryReturnConfirm } from './ui/SanctuaryUnlockUI.js';
import { MembershipUnlockUI } from './ui/MembershipUnlockUI.js';
import { bootMembershipReturnConfirm } from './core/membershipCheckout.js';
import { TipJarUI } from './ui/TipJarUI.js';
import { TipKindnessBadgesChrome } from './ui/TipKindnessBadgesChrome.js';
import { SupportYinModalUI } from './ui/SupportYinModalUI.js';
import { ActiveRecoverAnchorUI } from './ui/ActiveRecoverAnchorUI.js';
import { NewsletterCaptureUI } from './ui/NewsletterCaptureUI.js';
import { ConfideToYinUI } from './ui/ConfideToYinUI.js';
import { canOpenConfidePanel } from './core/confide/confideUserVisibilityGate.js';
import { CONFIDE_ROUTE } from './core/confide/confideRoutes.js';
import { consumeTipReturnQuery } from './core/tipJarGate.js';
import { openCommunityExternalLink } from './core/communityLink.js';
import {
  setNewsletterProvider
} from './core/newsletter/newsletterProvider.js';
import {
  createMockNewsletterProvider
} from './core/newsletter/mockNewsletterProvider.js';
import { ReminderQuotaManager } from './core/ReminderQuotaManager.js';
import {
  MindfulReminderController,
  ACTIVE_RECOVER_COOLDOWN_MS
} from './core/MindfulReminderController.js';
import { AttentionSignals } from './input/AttentionSignals.js';
import {
  MindfulAcknowledgeToast,
  MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE
} from './ui/MindfulAcknowledgeToast.js';
import { FlowerBlowWelcomeBubbleUI } from './ui/FlowerBlowWelcomeBubbleUI.js';
import { resolveFlowerBlowWelcomeMessage } from './ui/flowerBlowWelcomeCopy.js';
import {
  isFlowerWelcomeEnabled,
  markFlowerWelcomeBubbleShown,
  readFlowerWelcomeState,
  resolveFlowerWelcomeForce,
  shouldPreferFlowerWelcomeOverWellness
} from './core/flowerWelcomeGate.js';
import { TigerReflectionMoment } from './ui/TigerReflectionMoment.js';
import { SessionEndFlow } from './core/SessionEndFlow.js';
import { DailyCompletionStore } from './core/DailyCompletionStore.js';
import { FocusSessionEndStore } from './core/FocusSessionEndStore.js';
import {
  PracticeDaysStore,
  PRACTICE_STREAK_RING_TOTAL,
  countRecentPracticeStreak
} from './core/PracticeDaysStore.js';
import {
  MilestoneGlowStore,
  projectedStreakIncludingToday
} from './core/MilestoneGlowStore.js';
import { triggerSessionCompletionFeedback } from './core/session-completion-feedback.js';
import {
  SCENE_ANIM_EVENTS,
  markLocaleGreetingPlayed,
  playOptionsForLocaleGreeting,
  resolveSceneAnimation,
  shouldAttemptLateNightOnBoot,
  pickRiseInterruptEmotion,
  isRiseInterruptHoldEmotion,
  LATE_NIGHT_FORCE_DORMANT_KEY
} from './core/sceneAnimationDispatcher.js';
import {
  shouldLateNightCloakOnSessionEnd,
  isLateNightCloakHoldEmotion,
  resolveForegroundReturnAction,
  resolveSessionEndHoldEmotion,
  FOREGROUND_RETURN_ACTIONS
} from './core/companionRestPolicy.js';
import { getLocalDateKey } from './utils/localDate.js';
import {
  WELLNESS_DAY_BANDS,
  resolveWellnessDayBand
} from './character/cloakVariant.js';
import {
  HonestyCheckInController,
  resolveHonestyBreathMs
} from './core/HonestyCheckInController.js';
import { HonestyCheckInUI } from './ui/HonestyCheckInUI.js';
import { HonestyBridgeStore } from './core/HonestyBridgeStore.js';
import { HonestyBridgeCtaController } from './core/HonestyBridgeCtaController.js';
import {
  RetentionFunnelStore,
  RETENTION_EVENTS,
  trackRetentionEvent
} from './core/RetentionTelemetry.js';
import { HonestyBridgeCtaUI } from './ui/HonestyBridgeCtaUI.js';
import { CompanionModePicker } from './ui/CompanionModePicker.js';
import { ArrivalPracticeUI } from './ui/ArrivalPracticeUI.js';
import { MicroRitualUI } from './ui/MicroRitualUI.js';
import {
  RitualFlowUI,
  resolveRitualBreathMsOverride
} from './ui/RitualFlowUI.js';
import { RitualCompletionStore } from './core/RitualCompletionStore.js';
import {
  getRitualConfig,
  RITUAL_MENU_PROXIES
} from './core/RitualFlow.js';
import {
  claimFeatureOwned,
  isEntitled,
  setEntitlementProvider,
  createMockEntitlementProvider,
  refreshEntitlement
} from './core/entitlement/entitlementGate.js';
import { FocusDurationPickerUI } from './ui/FocusDurationPickerUI.js';
import {
  hasMicroRitualMsOverride,
  resolveMicroRitualMs
} from './core/MicroRitual.js';
import {
  recordIntention,
  resolveSessionIntentionLatch
} from './core/SessionIntentionStore.js';
import { AcrossToolsIdleGuard } from './core/AcrossToolsIdleGuard.js';
import {
  AmbientSoundscapeController,
  AMBIENT_TRACK_OFF,
  DEFAULT_AMBIENT_TRACK_ID
} from './audio/AmbientSoundscapeController.js';
import { AmbientSoundscapeUI } from './ui/AmbientSoundscapeUI.js';
import {
  createHintsSeenStore,
  resolveAutoHintIds
} from './core/OnboardingHintsStore.js';
import { isClickTriggerHint } from './core/onboardingHintRegistry.js';
import { OnboardingHintsUI } from './ui/OnboardingHintsUI.js';
/** 有 `?sessionMinutes=` → 其值（e2e 可 1）；否则偏好 / 25。开表前无 URL 时再出时长 chip。 */
const DEMO_SESSION_MINUTES = resolveFocusSessionTargetMinutes(location.search);
/** 微仪式墙钟：产品按 chip 分钟；e2e 用 `?microRitualMs=` 缩短。 */
const MICRO_RITUAL_MS_OVERRIDE = hasMicroRitualMsOverride(location.search)
  ? resolveMicroRitualMs(location.search)
  : null;
/** Advanced RitualFlow breath: e2e `?ritualBreathMs=` shortens every breath step. */
const RITUAL_BREATH_MS_OVERRIDE = resolveRitualBreathMsOverride(location.search);
/** Honesty 呼吸默认 10s；e2e 用 `?honestyBreathMs=1500` 缩短。 */
const HONESTY_BREATH_MS_RESOLVED = resolveHonestyBreathMs(location.search);
const isPosterCapture = new URLSearchParams(location.search).has('capturePoster');

function revealScene({ showCanvas = false } = {}) {
  const poster = document.getElementById('poster');
  const canvas = document.getElementById('scene-canvas');

  // 2D 主线时保持 canvas 隐藏，避免透明精灵后露出 3D 垫底。
  canvas.style.opacity = showCanvas ? '1' : '0';
  if (poster) {
    poster.style.opacity = '0';
    poster.addEventListener(
      'transitionend',
      () => {
        poster.remove();
      },
      { once: true }
    );
  }
}

/** DEV 实验室：重置/引导类一次性 toast（不进入业务 localStorage）。 */
function showDevLabToast(message, durationMs = 8000) {
  const existing = document.getElementById('dev-lab-toast');
  existing?.remove();

  const toast = document.createElement('div');
  toast.id = 'dev-lab-toast';
  toast.textContent = message;
  toast.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:22;' +
    'max-width:min(92vw,520px);padding:12px 16px;font-size:13px;line-height:1.45;' +
    'background:rgba(44,31,20,0.92);color:#fff8f0;border-radius:10px;' +
    'box-shadow:0 8px 24px rgba(0,0,0,0.18);pointer-events:none;';
  document.body.appendChild(toast);
  globalThis.setTimeout(() => toast.remove(), durationMs);
}

async function init() {
  // Locale before UI: restore ready preference (default en).
  bootLocaleFromPreference();

  // PWA: network-only SW in production only (no Cache Storage).
  void registerServiceWorker();

  // i18n：静态 HTML 已是默认语言（en）；此处接管标题/遮罩并跟随语言切换刷新
  document.title = t('APP_TITLE');
  const loadingMask = document.getElementById('loading-mask');
  if (loadingMask) loadingMask.textContent = t('LOADING');
  onLocaleChange(() => {
    document.title = t('APP_TITLE');
    const mask = document.getElementById('loading-mask');
    if (mask) mask.textContent = t('LOADING');
  });

  const app = document.querySelector('#app');
  const canvas = document.getElementById('scene-canvas');
  const { renderer, camera, lights } = createRenderer(app, canvas);
  const { scene, mounts } = createScene();
  setupSceneEnvironment(renderer, scene);
  lights.forEach((light) => scene.add(light));

  const ambience = new Ambience(scene);
  ambience.setup();

  const composer = createPostProcessing(renderer, scene, camera);

  PoseManager.setLoadingMaskVisible(true);

  const poseManager = new PoseManager(mounts.tiger);
  const tigerCharacter = new TigerCharacter(mounts.tiger);
  await poseManager.preload(renderer);
  tigerCharacter.bindPoseManager(poseManager);

  const dynamicMotion = new DynamicMotion(mounts.tiger, poseManager);

  const incenseGreeting = new IncenseGreeting(scene, mounts.tiger, camera, {
    fxContainer: app
  });
  await incenseGreeting.init();

  const focusSession = new FocusSession(DEMO_SESSION_MINUTES);
  const stateManager = new StateManager();
  const transitionFX = new TransitionFX(scene);

  // 2D PNG 序列播放器（主线情绪表现载体）：overlay 挂在 #app、位于 3D canvas 之上、UI 之下。
  // 在 loading 遮罩下预加载首帧，避免播放时首帧卡顿。
  const spritePlayer = new SpriteSequencePlayer({ container: app });
  await spritePlayer.preload();
  const idleOrchestrator = new IdleOrchestrator({ player: spritePlayer });

  const emotionController = new EmotionController({
    poseManager,
    dynamicMotion,
    incenseGreeting,
    transitionFX,
    // EyeTracking 已废弃；正式 Idle 仅呼吸×5→眨眼。张望等素材仅调试面板试播。
    eyeTracking: null,
    spritePlayer,
    idleOrchestrator
  });
  // 实验室默认挂调试面板；?product=1 或 ?mode=product → 产品壳（场景故事测）
  const productChrome =
    new URLSearchParams(window.location.search).get('product') === '1' ||
    new URLSearchParams(window.location.search).get('mode') === 'product';
  if (!productChrome) {
    emotionController.createDebugUI(document.body);
  }

  if (import.meta.env.DEV) {
    window.__incenseGreeting = incenseGreeting;
    window.__poseManager = poseManager;
    window.__dynamicMotion = dynamicMotion;
    window.__emotionController = emotionController;
    window.__spritePlayer = spritePlayer;
    window.__idleOrchestrator = idleOrchestrator;
    window.__i18n = { t, tPool, setLocale, getLocale };
    window.__THREE = THREE;
  }

  PoseManager.setLoadingMaskVisible(false);

  const focusVisualizer = new FocusVisualizer(composer);
  await focusVisualizer.init(mounts.tiger);

  /** Shared overlay-busy for scene Animation Dispatcher */
  function isSceneAnimOverlayBusy() {
    return (
      honestyCheckInUI?.phase !== 'hidden' ||
      arrivalPractice?.isOpen?.() === true ||
      reflectionMoment?.isOpen?.() === true ||
      microRitualUI?.isOpen?.() === true ||
      focusDurationPicker?.isOpen?.() === true
    );
  }

  /** Phase 2a/2b 气泡；在下方构造后赋值（tryPlay 闭包晚绑定） */
  let flowerBlowWelcomeBubble =
    /** @type {import('./ui/FlowerBlowWelcomeBubbleUI.js').FlowerBlowWelcomeBubbleUI | null} */ (
      null
    );

  function tryPlaySceneAnim(event, extra = {}) {
    const { playOptions, ...resolveOpts } = extra;
    const decision = resolveSceneAnimation({
      event,
      sessionState: stateManager.state,
      overlayBusy: isSceneAnimOverlayBusy(),
      ...resolveOpts
    });
    if (!decision.play || !decision.emotionKey) return decision;
    sceneAnimationDispatch.lastPlay = {
      event,
      emotionKey: decision.emotionKey,
      reason: decision.reason
    };
    // Expand A：深夜 Idle → 进 DORMANT 披斗篷（替代旧 yawn/tea 池）。
    if (decision.emotionKey === LATE_NIGHT_FORCE_DORMANT_KEY) {
      if (stateManager.state === STATES.IDLE) {
        honestyCheckIn.syncDormantState({
          allowEnterDormant: true,
          forceDormant: true
        });
      }
      return decision;
    }
    const started = emotionController.playEmotion(
      decision.emotionKey,
      playOptions || {}
    );
    // Phase 2b：吹花产品路径与 Lab 同气泡（非孤儿字）
    if (
      started &&
      decision.flowerWelcome &&
      decision.emotionKey === 'conjureFlowersBlowAway'
    ) {
      const flowerStorage =
        typeof localStorage !== 'undefined' ? localStorage : null;
      const prevFlower = readFlowerWelcomeState(flowerStorage);
      const msg = resolveFlowerBlowWelcomeMessage({
        bilingual: decision.flowerBilingual === true,
        locale: getLocale(),
        avoidCopyKey: prevFlower.lastCopyKey,
        tInLocale
      });
      flowerBlowWelcomeBubble?.show(msg.lines);
      markFlowerWelcomeBubbleShown(flowerStorage, { copyKey: msg.copyKey });
    }
    // Locale greeting: consume daily quota only after playEmotion starts
    // (resolve no longer writes — avoids burning the slot when play is skipped).
    if (
      started &&
      event === SCENE_ANIM_EVENTS.LANGUAGE_CHANGED &&
      typeof resolveOpts.locale === 'string'
    ) {
      markLocaleGreetingPlayed({ locale: resolveOpts.locale });
    }
    return decision;
  }

  const sceneAnimationDispatch = {
    lastPlay: /** @type {{ event: string, emotionKey: string, reason: string } | null} */ (
      null
    ),
    tryPlay: tryPlaySceneAnim
  };
  window.__sceneAnimationDispatch = sceneAnimationDispatch;

  const pointerInteraction = new PointerInteraction({
    canvas,
    camera,
    poseManager,
    emotionController,
    onIdleNearStill: () => {
      tryPlaySceneAnim(SCENE_ANIM_EVENTS.CURIOSITY);
    }
  });
  pointerInteraction.bind();
  if (import.meta.env.DEV) {
    window.__pointerInteraction = pointerInteraction;
  }

  composer.render();

  if (isPosterCapture) {
    window.__posterCaptureReady = true;
    window.__posterDataUrl = canvas.toDataURL('image/png');
    return;
  }

  revealScene({ showCanvas: false });
  poseManager.setCanvasHidden(true);

  // Entitlement mock provider (Prompt 1) — lab URL `?entitlementMock=subscription|lifetime|both`.
  setEntitlementProvider(
    createMockEntitlementProvider({ search: location.search })
  );
  void refreshEntitlement();

  // Stay in touch — mock provider until ESP / Worker is chosen (optional; not a login).
  setNewsletterProvider(createMockNewsletterProvider());

  const focusHUD = new FocusHUD(document.getElementById('focus-hud'));
  const idleChrome = createIdleChromeFacade({
    root: document.body,
    getHudStateEl: () => document.getElementById('hud-state')
  });
  if (import.meta.env.DEV) {
    window.__idleChrome = idleChrome;
    // Adapters remain reachable for legacy DEV probes
    window.__narrowIdleShell = idleChrome.narrow;
    window.__wideIdleMoreMenu = idleChrome.wide;
  }
  const weeklyPracticeHeatmap = new WeeklyPracticeHeatmap(
    document.getElementById('ui-overlay')
  );
  /** @type {Date | null} */
  let reminderNowOverride = null;
  const reminderNow = () => reminderNowOverride ?? new Date();
  const inAppReminderBannerController = new InAppReminderBannerController({
    // 2026-07-23 已拍板：suppress（忙碌隐藏、不排队）；勿改 defer 到产品路径
    busyPolicy: 'suppress'
  });
  /**
   * Scene A：欢迎池正在播时横幅可出、鹦鹉让位；结束后（或欢迎被打断后）补播。
   * 只认 live emotion key——勿 sticky latch：欢迎若被打断且未走 onComplete，sticky 会永久封死信使。
   */
  let pendingParrotMessengerAfterWelcome = false;
  /** E2E 观测：本页是否曾播过信使（不阻断再次播） */
  let parrotMessengerPlayedThisPageSession = false;
  /** Assigned after Arrival / stores are ready. */
  let syncInAppReminderBanner = () => {};

  const WELCOME_EMOTION_KEYS = new Set(['magicBookReading', 'nodGreeting']);
  function isColdStartWelcomePlaying() {
    return WELCOME_EMOTION_KEYS.has(emotionController.getCurrentEmotionKey());
  }
  function playParrotMessengerNow() {
    parrotMessengerPlayedThisPageSession = true;
    pendingParrotMessengerAfterWelcome = false;
    emotionController.playEmotion('parrotEarVisit');
  }
  /** 欢迎已结束/被打断后：补播挂起的信使（不依赖 sticky latch） */
  function flushPendingParrotMessengerAfterWelcome() {
    if (!pendingParrotMessengerAfterWelcome) return;
    if (isColdStartWelcomePlaying()) return;
    if (!inAppReminderBannerUI.isVisible()) return;
    playParrotMessengerNow();
  }
  const inAppReminderBannerUI = new InAppReminderBannerUI(
    document.getElementById('ui-overlay'),
    {
      onDismiss: () => {
        inAppReminderBannerController.dismiss();
        syncInAppReminderBanner();
      }
    }
  );
  /** Assigned after DailyCompletionStore is ready (soft notes need hasCompletedToday; cluster mount needs heatmap only). */
  let reminderPreferenceUI = null;
  /** @type {LanguagePreferenceUI | null} */
  let languagePreferenceUI = null;
  const focusButton = document.getElementById('btn-focus');
  const reminderQuotaManager = new ReminderQuotaManager();
  const mindfulToast = new MindfulAcknowledgeToast(
    document.getElementById('ui-overlay')
  );
  // E2E / lab: show bottom wellness toast without waiting for wall-clock late night.
  window.__mindfulToast = mindfulToast;
  /** Phase 2a Lab + Phase 2b 产品冷启动共用 */
  flowerBlowWelcomeBubble = new FlowerBlowWelcomeBubbleUI(
    document.getElementById('ui-overlay')
  );
  emotionController.setFlowerBlowLabBubbleHandler((opts = {}) => {
    const bilingual = opts.bilingual !== false;
    const msg = resolveFlowerBlowWelcomeMessage({
      bilingual,
      locale: getLocale(),
      tInLocale
    });
    flowerBlowWelcomeBubble?.show(msg.lines);
  });
  if (import.meta.env.DEV) {
    window.__flowerBlowWelcomeBubble = flowerBlowWelcomeBubble;
  }
  const lightProgression = new LightProgression({
    appEl: app,
    getSpriteOverlay: () => spritePlayer.overlayEl
  });
  const mindfulReminderController = new MindfulReminderController({
    quotaManager: reminderQuotaManager,
    emotionController,
    toast: mindfulToast,
    getCopy: tPool,
    onReminderShown: (type) => {
      if (type === 'refocus' || type === 'activeRecover') {
        lightProgression.playRecoverDisturbance();
      }
      if (type === 'activeRecover') {
        maybeOfferMomentWhisper('recover', { delayMs: 200 });
      }
    }
  });
  const activeRecoverAnchor = new ActiveRecoverAnchorUI(
    document.getElementById('ui-overlay'),
    {
      onActivate: () => {
        const result = mindfulReminderController.triggerActiveRecover();
        if (result.ok) {
          activeRecoverAnchor.enterCooldown(ACTIVE_RECOVER_COOLDOWN_MS);
        }
        return result;
      }
    }
  );
  window.__activeRecoverAnchor = activeRecoverAnchor;
  const attentionSignals = new AttentionSignals({
    onAway: () => mindfulReminderController.setAttentionAway(true),
    onResume: () => mindfulReminderController.setAttentionAway(false),
    onReturn: (event) =>
      mindfulReminderController.handleAttentionReturn(event)
  });
  attentionSignals.bind();

  // 结束反思：正常完成在庆祝播完回归坐姿后淡入；主动结束不播完成反馈，短暂留白后淡入。
  const reflectionMoment = new TigerReflectionMoment(
    document.getElementById('ui-overlay')
  );
  const sessionEndFlow = new SessionEndFlow({ reflectionMoment });

  const momentWhisperUI = new MomentWhisperUI(
    document.getElementById('ui-overlay') || document.body,
    {}
  );
  window.__momentWhisper = momentWhisperUI;

  /** @param {string} forKey */
  function isMomentWhisperBusy(forKey) {
    if (fiveMomentsCompassUI.isOpen()) return true;
    if (stateManager.state === STATES.CELEBRATE) return true;
    if (microRitualUI?.isOpen?.() === true) return true;
    // Arrive may open while Honesty idle entry is still painted — do not block Arrive.
    if (
      forKey !== 'arrive' &&
      honestyCheckInUI?.phase &&
      honestyCheckInUI.phase !== 'hidden'
    ) {
      return true;
    }
    if (companionModePicker?.isOpen?.() === true) return true;
    if (forKey !== 'arrive' && arrivalPractice?.isOpen?.() === true) {
      return true;
    }
    if (forKey !== 'reflect' && reflectionMoment?.isOpen?.() === true) {
      return true;
    }
    return false;
  }

  /**
   * @param {string} key
   * @param {{ delayMs?: number }} [opts]
   */
  function maybeOfferMomentWhisper(key, opts = {}) {
    const delayMs =
      Number.isFinite(opts.delayMs) && opts.delayMs >= 0 ? opts.delayMs : 280;
    window.setTimeout(() => {
      momentWhisperUI.tryShow(key, {
        busy: isMomentWhisperBusy(key)
      });
    }, delayMs);
  }

  // Honesty Check-in：冷启动 / 零完成 → Idle 闭目坐禅 + 可忽略补登提示（不开 Sleeping / 不披毯）
  let honestyGlowLevel = null;
  /** @type {HonestyBridgeCtaController | null} */
  let honestyBridge = null;
  /** @type {MicroRitualUI | null} */
  let microRitualUI = null;
  /** @type {RitualFlowUI | null} */
  let ritualFlowUI = null;
  /** @type {FocusDurationPickerUI | null} */
  let focusDurationPicker = null;
  /** Companion 已选、等待时长 chip 的模式 */
  let pendingFocusDurationMode = null;
  const now = () => new Date();
  const dailyCompletionStore = new DailyCompletionStore({ now });
  const ritualCompletionStore = new RitualCompletionStore({ now });
  reminderPreferenceUI = new ReminderPreferenceUI(
    weeklyPracticeHeatmap.getClusterEl(),
    {
      onPreferenceChange: () => {
        syncInAppReminderBanner();
      },
      onOpen: () => {
        onboardingHints?.markSeen('in-app-reminder');
      },
      onClose: () => {
        document.body.classList.remove('ft-narrow-stage-reminder');
        document.body.classList.remove('ft-wide-stage-reminder');
      },
      hasCompletedToday: () => dailyCompletionStore.hasCompletedToday(),
      now: reminderNow
    }
  );
  languagePreferenceUI = new LanguagePreferenceUI(document.body, {
    onOpen: () => {
      onboardingHints?.markSeen('language-preference');
    },
    onClose: () => {
      document.body.classList.remove('ft-narrow-stage-language');
      document.body.classList.remove('ft-wide-stage-language');
    },
    onLocaleChosen: () => {
      onboardingHints?.markSeen('language-preference');
    }
  });
  // Product + CI preview: e2e may open panel without ⋯ (narrow fallback)
  window.__languagePreference = languagePreferenceUI;
  const zenCinemaCardUI = new ZenCinemaCardUI(document.body, {});
  window.__zenCinemaCard = zenCinemaCardUI;

  const fiveMomentsCompassUI = new FiveMomentsCompassUI(document.body, {});
  window.__fiveMomentsCompass = fiveMomentsCompassUI;
  const journeyLogUI = new JourneyLogUI(document.body, {});
  window.__journeyLog = journeyLogUI;
  const dailyZenQuoteCardUI = new DailyZenQuoteCardUI(document.body, {});
  window.__dailyZenQuoteCard = dailyZenQuoteCardUI;
  const digitalWallpapersCardUI = new DigitalWallpapersCardUI(document.body, {});
  window.__digitalWallpapersCard = digitalWallpapersCardUI;
  const tipKindnessBadgesChrome = new TipKindnessBadgesChrome(document.body, {});
  window.__tipKindnessBadges = tipKindnessBadgesChrome;
  const sanctuaryUnlockUI = new SanctuaryUnlockUI(document.body, {
    onBadgesChanged: () => tipKindnessBadgesChrome.refresh()
  });
  window.__sanctuaryUnlock = sanctuaryUnlockUI;
  const membershipUnlockUI = new MembershipUnlockUI(document.body, {
    onEntitlementChanged: () => {
      // Ritual lock rows re-read isEntitled on next menu/drawer open.
    }
  });
  window.__membershipUnlock = membershipUnlockUI;
  const tipJarUI = new TipJarUI(document.body, {
    onBadgesChanged: () => tipKindnessBadgesChrome.refresh(),
    onTipThanks: ({ isRepeatTip }) => {
      // Ritual thank-you with existing sequences (no new tip-only assets).
      emotionController.playEmotion(
        isRepeatTip ? 'teaDrinking' : 'nodGreeting'
      );
    }
  });
  window.__tipJar = tipJarUI;

  const newsletterCaptureUI = new NewsletterCaptureUI(document.body, {
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'newsletter' });
    },
    onSubmitted: () => {
      // Menu rows rebuild on next open; nothing else to unlock.
    }
  });
  window.__newsletterCapture = newsletterCaptureUI;

  const confideToYinUI = new ConfideToYinUI(document.body, {
    canOpen: () => {
      const busy =
        stateManager.state === STATES.FOCUSING ||
        Boolean(arrivalPractice?.isOpen?.()) ||
        Boolean(reflectionMoment?.isOpen?.()) ||
        Boolean(microRitualUI?.isOpen?.()) ||
        Boolean(honestyBridge?.isVisible?.()) ||
        (honestyCheckInUI?.phase && honestyCheckInUI.phase !== 'hidden');
      if (busy) return false;
      return canOpenConfidePanel({
        search: location.search,
        stage: 'idle'
      });
    },
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'confide' });
    },
    onReplied: ({ route }) => {
      if (route === CONFIDE_ROUTE.SAFETY_REDIRECT) {
        emotionController.playEmotion('nodBow');
        return;
      }
      emotionController.playEmotion('mindfulAcknowledge');
    }
  });
  window.__confideToYin = confideToYinUI;

  function closeGrowthOverlayCards({ except = null } = {}) {
    if (except !== 'support') supportYinModalUI.close();
    if (except !== 'quote') dailyZenQuoteCardUI.close();
    if (except !== 'wallpapers') digitalWallpapersCardUI.close();
    if (except !== 'sanctuary') sanctuaryUnlockUI.close();
    if (except !== 'membership') membershipUnlockUI.close();
    if (except !== 'tip') tipJarUI.close();
    if (except !== 'newsletter') newsletterCaptureUI.close();
    if (except !== 'confide') confideToYinUI.close();
    if (except !== 'cinema') zenCinemaCardUI.close();
    if (except !== 'moments') fiveMomentsCompassUI.close();
    if (except !== 'journey') journeyLogUI.close();
  }

  const supportYinModalUI = new SupportYinModalUI(document.body, {
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'support' });
    },
    // Support CTAs open the same detail cards as the Idle menu — user confirms
    // Subscribe/Unlock/Buy on the card. (Auto startCheckout skipped a visible card
    // and felt like “menu opens Stripe with no card”.)
    onUnlockSanctuary: () => {
      closeGrowthOverlayCards({ except: 'sanctuary' });
      sanctuaryUnlockUI.open();
    },
    onJoinMembership: () => {
      closeGrowthOverlayCards({ except: 'membership' });
      membershipUnlockUI.open();
    },
    onBuyTea: () => {
      closeGrowthOverlayCards({ except: 'tip' });
      tipJarUI.open();
    }
  });
  window.__supportYin = supportYinModalUI;
  consumeTipReturnQuery({});
  void bootSanctuaryReturnConfirm({});
  void bootMembershipReturnConfirm({});
  const focusSessionEndStore = new FocusSessionEndStore({ now });
  const practiceDaysStore = new PracticeDaysStore();
  const milestoneGlowStore = new MilestoneGlowStore();
  const honestyBridgeStore = new HonestyBridgeStore();
  const retentionFunnelStore = new RetentionFunnelStore({ now });
  const honestyCheckInUI = new HonestyCheckInUI(
    document.getElementById('ui-overlay')
  );
  const honestyCheckIn = new HonestyCheckInController({
    store: dailyCompletionStore,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui: honestyCheckInUI,
    breathMs: HONESTY_BREATH_MS_RESOLVED,
    applyFocusGlow: (level) => {
      honestyGlowLevel = level;
      tigerCharacter.setFocusLevel(level);
    },
    clearFocusGlow: () => {
      honestyGlowLevel = null;
      if (stateManager.state !== STATES.FOCUSING) {
        tigerCharacter.setFocusLevel(0);
      }
    },
    isIdleEntryBlocked: () =>
      honestyBridge?.isVisible?.() === true ||
      arrivalPractice?.isOpen?.() === true ||
      reflectionMoment?.isOpen?.() === true ||
      microRitualUI?.isOpen?.() === true,
    onCheckInComplete: () => {
      honestyCheckInUI.hideIdleEntry();
      onboardingHints?.markSeen('honesty-optional');
      const streak = practiceDaysStore.getRecentStreakDays();
      const nodeId = milestoneGlowStore.claimOffer(streak);
      const revealBridge = () => {
        honestyBridge?.onHonestyCheckInComplete();
        // onShown 亦会 sync；此处双保险，避免桥接挡住一分钟呼吸 / Honesty 入口
        syncHonestyIdleEntry();
        syncOnboardingAutoHints();
      };
      if (nodeId) {
        emotionController.playEmotion('milestoneGlow', {
          milestoneNodeId: nodeId,
          onComplete: revealBridge
        });
      } else {
        revealBridge();
      }
    },
    onPracticeDay: ({ durationMinutes } = {}) => {
      practiceDaysStore.markToday(durationMinutes);
      tipKindnessBadgesChrome.refresh();
    },
    onSessionRecorded: ({ durationMinutes }) => {
      retentionFunnelStore.noteSessionComplete({ durationMinutes });
    },
    notifyUser: () => {
      mindfulToast.show(t('HONESTY_PENDING_LOST'));
    },
    notifyRecorded: () => {
      // 与微仪式 complete 共用同一中置锚点（MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE）
      mindfulToast.show(t('HONESTY_CHECKIN_RECORDED'), {
        placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
        visibleMs: 4_500
      });
    },
    now
  });

  /** 在 beginFocusWithMode 定义后填入 onModeSelected / onAutoStartNeedsArrival / onExpandedChange */
  const companionModeHandlers = {};
  const companionModePicker = new CompanionModePicker(
    document.getElementById('ui-overlay'),
    focusButton,
    companionModeHandlers
  );

  microRitualUI = new MicroRitualUI(document.getElementById('ui-overlay'), {
    onIdleEntryClick: () => {
      if (
        stateManager.state === STATES.FOCUSING ||
        stateManager.state === STATES.CELEBRATE ||
        arrivalPractice?.isOpen?.() ||
        reflectionMoment?.isOpen?.() ||
        microRitualUI?.isOpen?.() ||
        ritualFlowUI?.isOpen?.()
      ) {
        return;
      }
      onboardingHints?.markSeen('micro-ritual');
      beginMicroRitualChrome();
      microRitualUI.openDurationPicker();
      resyncSessionChrome();
      syncOnboardingAutoHints();
    },
    resolveDurationMs: () =>
      MICRO_RITUAL_MS_OVERRIDE != null ? MICRO_RITUAL_MS_OVERRIDE : undefined,
    onBreathStart: () => {
      lightProgression.beginBreath();
      emotionController.playEmotion('smiling', {
        fps: ARRIVAL_BREATH_SMILE_FPS,
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true
      });
      // Ephemeral ambient: do NOT startSession / presence (Focus-bound path).
      void (async () => {
        const preferred = ambientSoundscape.getPreferredTrackId();
        const trackId =
          preferred === AMBIENT_TRACK_OFF
            ? DEFAULT_AMBIENT_TRACK_ID
            : preferred;
        await ambientSoundscape.playTrackEphemeral(trackId);
      })();
      resyncSessionChrome();
      // startBreath already set phase=breath — sync tips only after isOpen()
      // so sit-button / idle-after-session cannot orphan over hidden Sit.
      syncOnboardingAutoHints();
    },
    onComplete: () => {
      completeMicroRitual();
    },
    onLeave: () => {
      leaveMicroRitualQuietly();
    }
  });
  if (import.meta.env.DEV) {
    window.__microRitualUI = microRitualUI;
  }

  ritualFlowUI = new RitualFlowUI(document.getElementById('ui-overlay'), {
    resolveBreathMs: (durationMs) =>
      RITUAL_BREATH_MS_OVERRIDE != null
        ? RITUAL_BREATH_MS_OVERRIDE
        : durationMs,
    onBreathStart: () => {
      lightProgression.beginBreath();
      emotionController.playEmotion('smiling', {
        fps: ARRIVAL_BREATH_SMILE_FPS,
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true
      });
      void (async () => {
        const preferred = ambientSoundscape.getPreferredTrackId();
        const trackId =
          preferred === AMBIENT_TRACK_OFF
            ? DEFAULT_AMBIENT_TRACK_ID
            : preferred;
        await ambientSoundscape.playTrackEphemeral(trackId);
      })();
      resyncSessionChrome();
      syncOnboardingAutoHints();
    },
    onBreathEnd: () => {
      lightProgression.endBreath({ releaseDolly: false });
    },
    onComplete: ({ ritualId, selections }) => {
      completeRitualFlow(ritualId, selections);
    },
    onLeave: () => {
      leaveRitualFlowQuietly();
    }
  });
  if (import.meta.env.DEV) {
    window.__ritualFlowUI = ritualFlowUI;
    window.__ritualCompletionStore = ritualCompletionStore;
  }

  focusDurationPicker = new FocusDurationPickerUI({
    preferredMinutes: () => loadPreferredFocusDurationMinutes(),
    onDurationSelected: (minutes) => {
      const mode =
        pendingFocusDurationMode || companionModePicker.getSelectedMode();
      pendingFocusDurationMode = null;
      savePreferredFocusDurationMinutes(minutes);
      focusSession.setTargetMinutes(minutes);
      companionModePicker.setMicroRitualActive(false);
      beginFocusWithMode(mode);
    },
    onLeave: () => {
      pendingFocusDurationMode = null;
      companionModePicker.setIdleChromeVisible(true);
      companionModePicker.setMicroRitualActive(false);
      setFocusButtonEnabled(true);
      resyncSessionChrome();
      syncOnboardingAutoHints();
    }
  });
  if (import.meta.env.DEV) {
    window.__focusDurationPicker = focusDurationPicker;
  }

  let hasEndedAnySession = false;

  /** Arrival / 叠层 / 完成中门闩的唯一可变源（见 SessionUiGate） */
  const sessionUiGate = new SessionUiGate();

  const immersivePresenceUI = new ImmersivePresenceUI(
    document.getElementById('ui-overlay'),
    {
      getGateState: () => ({
        isFocusing: stateManager.state === STATES.FOCUSING,
        completionPending: sessionUiGate.completionPending
      }),
      getElapsedSeconds: () => focusSession.getElapsedSeconds(),
      getSpriteFrameSrc: () => {
        const img = spritePlayer?.imgEl;
        if (!img) return null;
        return img.currentSrc || img.src || null;
      }
    }
  );
  window.__immersivePresence = immersivePresenceUI;

  /**
   * Choose 确认后、Companion 展开前（点头动画窗口）：Arrival 已关，
   * 仍须 Quick-only，避免三球闪回（W3）。
   */
  const postChooseChrome = { pending: false };

  /**
   * Idle 入口 + 叠层门闩 / 窄宽壳投影（等价抽离；见 sessionChromeSync.js）。
   * Honesty 提示/时长**故意不列入** overlay 源——仍允许点 hint 展开三选一。
   */
  const {
    syncHonestyIdleEntry,
    resyncSessionChrome,
    syncArrivalGateReady
  } = createSessionChromeSync({
    getHonestyBridge: () => honestyBridge,
    getArrivalPractice: () => arrivalPractice,
    getReflectionMoment: () => reflectionMoment,
    getMicroRitualUI: () => microRitualUI,
    getRitualFlowUI: () => ritualFlowUI,
    getFocusDurationPicker: () => focusDurationPicker,
    honestyCheckInUI,
    honestyCheckIn,
    companionModePicker,
    idleChrome,
    stateManager,
    sessionUiGate,
    getPostChoosePending: () => postChooseChrome.pending,
    syncInAppReminderBanner: () => syncInAppReminderBanner(),
    setFocusButtonEnabled
  });
  // E2E：注入 completionPending 后须 resync 才能禁用 Sit（EDGE #5）
  window.__sessionUiGate = sessionUiGate;
  window.__resyncSessionChrome = resyncSessionChrome;

  /** 先点 Here & Now / Flow 再进 Arrival 时记住，结束后自动开表（禁止再逼点 Sit） */
  let pendingAutoStartMode = null;
  /** Choose 点头期间已开表则勿再展开 Companion */
  let suppressCompanionOpenAfterNod = false;
  /** 本轮 Arrival 是否完整走过 Choose（供鞠躬结束后自动开表判定） */
  let arrivalChoseThisRun = false;
  /** Focus 结束后、Reflection 关闭前暂存的 Journey Log 草稿（非 tip-jar） */
  /** @type {{ minutes: number, arrive: boolean } | null} */
  let pendingJourneyDraft = null;

  function stashPendingJourneyDraft({ completed }) {
    const elapsedSeconds = focusSession.getElapsedSeconds();
    pendingJourneyDraft = {
      minutes: resolveJourneyMinutes({
        completed: Boolean(completed),
        targetMinutes: focusSession.targetMinutes,
        elapsedSeconds
      }),
      arrive: Boolean(arrivalChoseThisRun)
    };
  }

  function clearPendingJourneyDraft() {
    pendingJourneyDraft = null;
  }

  function commitPendingJourneyDraft(hasAnyAnswer) {
    if (!pendingJourneyDraft) return;
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    appendJourneyLogEntry(storage, {
      minutes: pendingJourneyDraft.minutes,
      arrive: pendingJourneyDraft.arrive,
      reflect: Boolean(hasAnyAnswer)
    });
    pendingJourneyDraft = null;
  }

  const sessionEndFlowCancelPending = sessionEndFlow.cancelPending.bind(
    sessionEndFlow
  );
  sessionEndFlow.cancelPending = () => {
    clearPendingJourneyDraft();
    sessionEndFlowCancelPending();
  };

  function setFocusButtonEnabled(enabled) {
    focusButton.disabled = !enabled;
    focusButton.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    focusButton.style.pointerEvents = enabled ? '' : 'none';
    focusButton.style.opacity = enabled ? '' : '0.45';
  }

  /**
   * 微仪式进行中：收起 Idle chrome、禁 Sit；离开/完成后由 endMicroRitualChrome 还原。
   */
  function beginMicroRitualChrome() {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    companionModePicker.hide();
    companionModePicker.setIdleChromeVisible(false);
    companionModePicker.setMicroRitualActive(true);
    setFocusButtonEnabled(false);
    microRitualUI?.hideIdleEntry();
    resyncSessionChrome();
    // Tip sync for microRitualOpen must wait until startBreath → onBreathStart
    // (isOpen() is still false here).
  }

  function endMicroRitualChrome() {
    lightProgression.endBreath({ releaseDolly: true });
    lightProgression.clearArrivalEffects();
    companionModePicker.setMicroRitualActive(false);
    setFocusButtonEnabled(true);
    companionModePicker.setIdleChromeVisible(true);
    resyncSessionChrome();
    syncHonestyIdleEntry();
    syncOnboardingAutoHints();
  }

  /**
   * Advanced RitualFlow chrome — same dock suppress as MicroRitual;
   * does not share MicroRitualUI / completeMicroRitual / Reflection.
   */
  function beginRitualFlowChrome() {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    companionModePicker.hide();
    companionModePicker.setIdleChromeVisible(false);
    companionModePicker.setMicroRitualActive(true);
    setFocusButtonEnabled(false);
    microRitualUI?.hideIdleEntry();
    resyncSessionChrome();
  }

  function endRitualFlowChrome() {
    ambientSoundscape.stopPlaybackEphemeral();
    lightProgression.endBreath({ releaseDolly: true });
    lightProgression.clearArrivalEffects();
    companionModePicker.setMicroRitualActive(false);
    setFocusButtonEnabled(true);
    companionModePicker.setIdleChromeVisible(true);
    resyncSessionChrome();
    syncHonestyIdleEntry();
    syncOnboardingAutoHints();
  }

  /**
   * @param {string} proxy menu proxy from Idle More / drawer
   */
  function openRitualFlowFromMenu(proxy) {
    const ritualId = Object.entries(RITUAL_MENU_PROXIES).find(
      ([, p]) => p === proxy
    )?.[0];
    if (!ritualId) return;
    const config = getRitualConfig(ritualId);
    if (!config) return;
    if (!isEntitled(config.accessFeatureKey)) {
      mindfulToast.show(t('ritual.menu_locked'), {
        placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
        visibleMs: 3_500
      });
      return;
    }
    if (
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE ||
      arrivalPractice?.isOpen?.() ||
      reflectionMoment?.isOpen?.() ||
      microRitualUI?.isOpen?.() ||
      ritualFlowUI?.isOpen?.() ||
      focusDurationPicker?.isOpen?.()
    ) {
      return;
    }
    beginRitualFlowChrome();
    const opened = ritualFlowUI?.open(ritualId);
    if (!opened) {
      endRitualFlowChrome();
      return;
    }
    resyncSessionChrome();
    syncOnboardingAutoHints();
  }

  /**
   * @param {string} ritualId
   * @param {Record<string, string>} selections
   */
  function completeRitualFlow(ritualId, selections) {
    ambientSoundscape.stopPlaybackEphemeral();
    const config = getRitualConfig(ritualId);
    ritualCompletionStore.recordCompletion(ritualId, { selections });
    if (config) {
      for (const featureKey of config.persistentFeatureKeys) {
        claimFeatureOwned(featureKey, {
          meta: { ritualId, source: 'ritual_flow_complete' }
        });
      }
    }
    trackRetentionEvent(RETENTION_EVENTS.RITUAL_FLOW_COMPLETE, {
      ritualId,
      selections
    });
    mindfulToast.show(t(config?.completeToastKey || 'ritual.shared.complete'), {
      placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
      visibleMs: 4_500
    });
    endRitualFlowChrome();
    emotionController.playEmotion('sessionComplete', {
      crossFadeMs: CAPCUT_DISSOLVE_MS,
      freezeUntilCrossFadeEnds: true,
      onComplete: () => {
        syncHonestyIdleEntry();
      }
    });
    // Explicit: do NOT call sessionEndFlow / TigerReflectionMoment.
  }

  function leaveRitualFlowQuietly() {
    endRitualFlowChrome();
    emotionController.playEmotion('idle', {
      crossFadeMs: CAPCUT_DISSOLVE_MS,
      freezeUntilCrossFadeEnds: true
    });
    syncHonestyIdleEntry();
  }

  function completeMicroRitual() {
    ambientSoundscape.stopPlaybackEphemeral();
    const durationMinutes =
      microRitualUI?.getDurationMinutes?.() ?? 1;
    dailyCompletionStore.recordCompletion(durationMinutes);
    practiceDaysStore.markToday(durationMinutes);
    tipKindnessBadgesChrome.refresh();
    trackRetentionEvent(RETENTION_EVENTS.MICRO_RITUAL_COMPLETE, {
      durationMinutes
    });
    mindfulToast.show(t('micro_ritual.complete'), {
      placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
      visibleMs: 4_500
    });
    endMicroRitualChrome();
    const decision = tryPlaySceneAnim(SCENE_ANIM_EVENTS.MICRO_RITUAL_COMPLETE, {
      playOptions: {
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true,
        onComplete: () => {
          syncHonestyIdleEntry();
        }
      }
    });
    if (!decision.play) {
      emotionController.playEmotion('sessionComplete', {
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true,
        onComplete: () => {
          syncHonestyIdleEntry();
        }
      });
    }
    // Shallow Reflection handoff — do not wait for sessionComplete animation.
    sessionEndFlow.onSessionEnded({ completed: true });
  }

  function leaveMicroRitualQuietly() {
    ambientSoundscape.stopPlaybackEphemeral();
    endMicroRitualChrome();
    emotionController.playEmotion('idle', {
      crossFadeMs: CAPCUT_DISSOLVE_MS,
      freezeUntilCrossFadeEnds: true
    });
    syncHonestyIdleEntry();
  }

  const reflectionOpen = reflectionMoment.open.bind(reflectionMoment);
  reflectionMoment.open = (options) => {
    companionModePicker.hide();
    honestyCheckInUI.hideIdleEntry();
    reflectionOpen(options);
    resyncSessionChrome();
    // 关掉 Rise/Sound 等会话中提示，只留 Reflection（锚在面板上方）
    onboardingHints?.syncVisibleAutos(['reflection']);
    requestAnimationFrame(() => onboardingHints?.repositionAll());
    maybeOfferMomentWhisper('reflect', { delayMs: 400 });
  };
  const reflectionOnDone = reflectionMoment.onDone;
  reflectionMoment.onDone = (result, hasAnyAnswer) => {
    reflectionOnDone?.(result, hasAnyAnswer);
    commitPendingJourneyDraft(hasAnyAnswer);
    resyncSessionChrome();
    onboardingHints?.markSeen('reflection');
    hasEndedAnySession = true;
    // Rise 过渡播完后：回 Idle 闭目坐禅（零完成也不再落入 Sleeping）。
    const riseKey = emotionController.getCurrentEmotionKey();
    if (
      isRiseInterruptHoldEmotion(riseKey) ||
      isLateNightCloakHoldEmotion(riseKey)
    ) {
      emotionController.playEmotion('idle');
    }
    syncOnboardingAutoHints();
    syncHonestyIdleEntry();
  };

  const honestyShowPrompt = honestyCheckInUI.showPrompt.bind(honestyCheckInUI);
  honestyCheckInUI.showPrompt = () => {
    companionModePicker.hide();
    microRitualUI?.hideIdleEntry();
    honestyShowPrompt();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  };
  const honestyShowDuration = honestyCheckInUI.showDurationChoices.bind(
    honestyCheckInUI
  );
  honestyCheckInUI.showDurationChoices = () => {
    companionModePicker.hide();
    microRitualUI?.hideIdleEntry();
    onboardingHints?.markSeen('honesty-optional');
    honestyShowDuration();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  };
  const honestyHide = honestyCheckInUI.hide.bind(honestyCheckInUI);
  honestyCheckInUI.hide = () => {
    honestyHide();
    resyncSessionChrome();
    syncHonestyIdleEntry();
  };

  const honestyStartBreath = honestyCheckInUI.startBreathGuide.bind(
    honestyCheckInUI
  );
  honestyCheckInUI.startBreathGuide = (durationMs) => {
    microRitualUI?.hideIdleEntry();
    honestyStartBreath(durationMs);
  };

  // 调试「Honesty唤醒」→ 直接打开时长三选一（不经 Sit with Yin）
  emotionController.setDebugHonestyWakeHandler(() => {
    honestyCheckIn.openDurationChoices({ force: true });
  });

  const acrossToolsIdleGuard = new AcrossToolsIdleGuard();
  const ambientSoundscape = new AmbientSoundscapeController();
  // Avoid TDZ: AmbientSoundscapeUI paints during construct, before `let onboardingHints`.
  /** @type {{ hints: import('./ui/OnboardingHintsUI.js').OnboardingHintsUI | null }} */
  const onboardingHintHost = { hints: null };
  // 挂 body：避免落在 pointer-events:none 的 ui-overlay 栈内，并压过调试栏
  const ambientSoundscapeUI = new AmbientSoundscapeUI(
    document.body,
    ambientSoundscape,
    {
      onPanelOpened: () => {
        onboardingHintHost.hints?.revealClickHint('ambient-soundscape');
      },
      onTrackChosen: () => {
        onboardingHintHost.hints?.markSeen('ambient-soundscape');
        onboardingHintHost.hints?.hideBubble('ambient-soundscape');
        idleChrome.syncMuteVisual({
          musicOn: ambientSoundscapeUI.wantsMusicOn()
        });
      },
      onToggleMusic: () => {
        // Mute/unmute alone does not clear the discovery mint — only choosing a track does.
        idleChrome.syncMuteVisual({
          musicOn: ambientSoundscapeUI.wantsMusicOn()
        });
      },
      onMuteChromePainted: () => {
        onboardingHintHost.hints?.syncDiscoveryDots();
      }
    }
  );
  void ambientSoundscapeUI.bootDefaultMusic();

  idleChrome.setHandlers({
    isHintUnread: (hintId) => {
      if (!onboardingHints?.store) return false;
      const store = onboardingHints.store;
      if (isClickTriggerHint(hintId)) return !store.isDone(hintId);
      return !store.isSeen(hintId);
    },
    onCompanion: () => {
      companionModePicker.open();
    },
    onClearCompanion: () => {
      companionModePicker.hide();
    },
    onReminder: () => {
      reminderPreferenceUI.openPanel();
    },
    onLanguage: () => {
      languagePreferenceUI.openPanel();
    },
    onFiveMoments: () => {
      closeGrowthOverlayCards({ except: 'moments' });
      fiveMomentsCompassUI.open({ markSeenOnOpen: true });
    },
    onJourneyLog: () => {
      closeGrowthOverlayCards({ except: 'journey' });
      journeyLogUI.open();
    },
    onConfide: () => {
      closeGrowthOverlayCards({ except: 'confide' });
      confideToYinUI.open();
    },
    onZenCinema: () => {
      closeGrowthOverlayCards({ except: 'cinema' });
      zenCinemaCardUI.open();
    },
    onDailyQuote: () => {
      closeGrowthOverlayCards({ except: 'quote' });
      dailyZenQuoteCardUI.open();
    },
    onWallpapers: () => {
      closeGrowthOverlayCards({ except: 'wallpapers' });
      digitalWallpapersCardUI.open();
    },
    onSanctuary: () => {
      closeGrowthOverlayCards({ except: 'sanctuary' });
      sanctuaryUnlockUI.open();
    },
    onMembership: () => {
      closeGrowthOverlayCards({ except: 'membership' });
      membershipUnlockUI.open();
    },
    onTipJar: () => {
      closeGrowthOverlayCards({ except: 'tip' });
      tipJarUI.open();
    },
    onNewsletter: () => {
      closeGrowthOverlayCards({ except: 'newsletter' });
      newsletterCaptureUI.open();
    },
    onCommunity: () => {
      closeGrowthOverlayCards();
      openCommunityExternalLink();
    },
    onRitualFlow: (proxy) => {
      openRitualFlowFromMenu(proxy);
    },
    onHonesty: () => {
      honestyCheckIn.openDurationChoices({ force: true });
    },
    onSound: () => {
      // Narrow ActionBar ♪: audible+panel open → mute; audible+panel closed →
      // open list (change track); else open (+ resume after note-mute).
      ambientSoundscapeUI.openSoundPanelFromNote();
      idleChrome.syncMuteVisual({
        musicOn: ambientSoundscapeUI.wantsMusicOn()
      });
    },
    onSoundHover: () => {
      // Narrow ActionBar ♪ hover — always from real mouse (see openSoundPanelFromHover).
      ambientSoundscapeUI.openSoundPanelFromHover({ fromMouse: true });
      idleChrome.syncMuteVisual({
        musicOn: ambientSoundscapeUI.wantsMusicOn()
      });
    },
    onQuickStart: () => {
      // Call the real handler — do not proxy via #quick-start-focus.
      // Arrival keepQuickStart parks/hides the dock ⚡ while the home ball stays;
      // clicking a [hidden] button was a silent no-op (user: Arrival ⚡ 没反应).
      companionModeHandlers.onQuickStart?.();
    },
    onClearStage: () => {
      companionModePicker.hide();
      reminderPreferenceUI.closePanel();
      languagePreferenceUI.closePanel();
      closeGrowthOverlayCards();
      momentWhisperUI.hide({ immediate: true });
      ambientSoundscapeUI.clearNarrowSoundStage();
      idleChrome.clearAllStageClasses();
    },
    onSheetChange: () => {
      syncOnboardingAutoHints();
    },
    onMenuChange: () => {
      syncOnboardingAutoHints();
    }
  });
  idleChrome.syncMuteVisual({
    musicOn: ambientSoundscapeUI.wantsMusicOn()
  });

  /** @type {OnboardingHintsUI | null} */
  let onboardingHints = null;

  function getOnboardingScene() {
    const arrivalPhase = arrivalPractice?.getStep?.() ?? null;
    const honestyEntry = document.getElementById('honesty-idle-entry');
    return {
      honestyVisible: honestyCheckInUI.phase === 'prompt',
      honestyIdleEntryVisible: Boolean(
        honestyEntry && !honestyEntry.hidden && honestyEntry.isConnected
      ),
      // Prefer on-canvas ⚡ ball when dock pill is wide/narrow-parked off-screen.
      quickStartVisible: (() => {
        for (const id of [
          'ft-wide-home-quickstart',
          'ft-narrow-home-quickstart',
          'quick-start-focus'
        ]) {
          const el = document.getElementById(id);
          if (!el || el.hidden || !el.isConnected) continue;
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0) {
            if (r.top < window.innerHeight && r.left < window.innerWidth) {
              return true;
            }
          }
        }
        return false;
      })(),
      honestyBridgeVisible: honestyBridge?.isVisible?.() === true,
      arrivalOpen: arrivalPractice?.isOpen?.() ?? false,
      arrivalPhase:
        arrivalPhase === 'welcome'
          ? 'notice'
          : arrivalPhase === 'ready'
            ? null
            : arrivalPhase,
      companionExpanded: companionModePicker?.isOpen?.() ?? false,
      isFocusing: stateManager.state === STATES.FOCUSING,
      microRitualOpen: microRitualUI?.isOpen?.() === true,
      reflectionOpen: reflectionMoment?.isOpen?.() ?? false,
      ambientPanelOpen: ambientSoundscapeUI?.isPanelOpen?.() ?? false,
      isDormant: stateManager.state === STATES.DORMANT,
      arrivalReady: sessionUiGate.arrivalGateReady,
      hasEverCompletedSession: hasEndedAnySession,
      weeklyHeatmapVisible: weeklyPracticeHeatmap?.isVisible?.() === true,
      languageFabVisible: languagePreferenceUI?.isFabVisible?.() === true,
      microRitualEntryVisible: microRitualUI?.isIdleEntryVisible?.() === true,
      narrowPark: document.body.classList.contains('ft-narrow-park'),
      narrowSheetOpen: idleChrome?.isSheetOpen?.() === true,
      wideParkSecondary: document.body.classList.contains('ft-wide-park-secondary'),
      wideMoreOpen: document.body.classList.contains('ft-wide-more-open')
    };
  }

  let _syncingOnboardingHints = false;
  function syncOnboardingAutoHints() {
    if (!onboardingHints || _syncingOnboardingHints) return;
    _syncingOnboardingHints = true;
    try {
      const ids = resolveAutoHintIds(getOnboardingScene());
      onboardingHints.syncVisibleAutos(ids);
      // 布局刚切换时 DOM 可能尚未量好，下一帧再贴一次锚点
      requestAnimationFrame(() => {
        onboardingHints?.repositionAll();
        onboardingHints?.syncDiscoveryDots();
      });
    } finally {
      _syncingOnboardingHints = false;
    }
  }

  onboardingHints = new OnboardingHintsUI(document.body, {
    store: createHintsSeenStore(),
    getScene: getOnboardingScene,
    onOpenFiveMoments: () => {
      closeGrowthOverlayCards({ except: 'moments' });
      fiveMomentsCompassUI.open({ markSeenOnOpen: true });
    }
  });
  onboardingHintHost.hints = onboardingHints;
  // Hints e2e (pulse ownership / clear seen) needs this in vite preview (DEV=false),
  // same contract as `__ambientSoundscape` / `__honestyBridge`.
  window.__onboardingHints = onboardingHints;

  // Reminder / companion e2e hooks — must work in `vite preview` (DEV=false),
  // same contract as `__honestyBridge`.
  window.__dailyCompletionStore = dailyCompletionStore;
  window.__companionModePicker = companionModePicker;
  // Ambient e2e (mute↔resume / Focusing track audible) needs these in
  // `vite preview` production builds — same contract as `__honestyBridge`.
  window.__ambientSoundscape = ambientSoundscape;
  window.__ambientSoundscapeUI = ambientSoundscapeUI;
  if (import.meta.env.DEV) {
    window.__reminderQuotaManager = reminderQuotaManager;
    window.__mindfulReminderController = mindfulReminderController;
    window.__attentionSignals = attentionSignals;
    window.__reflectionMoment = reflectionMoment;
    window.__honestyCheckIn = honestyCheckIn;
    window.__acrossToolsIdleGuard = acrossToolsIdleGuard;
  }
  // MilestoneGlow / streak e2e — production preview (CI) needs these hooks.
  window.__milestoneGlowStore = milestoneGlowStore;
  window.__practiceDaysStore = practiceDaysStore;

  /** @type {{ text: string, source: 'icon' | 'typed' } | null} */
  let pendingChoose = null;
  /** @type {string} 本次会话 Choose 内容；达标与未达标结束均回显 */
  let currentSessionIntention = '';
  /** @type {'icon' | 'typed'} */
  let currentIntentionSource = 'typed';

  const arrivalPractice = new ArrivalPracticeUI(
    document.getElementById('ui-overlay'),
    {
      onNoticeSelected: () => {
        lightProgression.onNoticeSelected();
        onboardingHints?.markSeen('notice');
        syncOnboardingAutoHints();
      },
      onBreath: () => {
        lightProgression.beginBreath();
        // Breath「Let's arrive together」：放慢眨眼微笑并保持，不落入 idle-breathing（硬切闭目不连贯）。
        // Choose 确认用 intentionNod（16:9 点头），不在此步播放。
        emotionController.playEmotion('smiling', {
          fps: ARRIVAL_BREATH_SMILE_FPS,
          crossFadeMs: CAPCUT_DISSOLVE_MS,
          freezeUntilCrossFadeEnds: true
        });
        onboardingHints?.markSeen('notice');
        onboardingHints?.maybeShowAuto('breathing');
      },
      onAfterBreath: () => {
        // 只收呼吸光环，保持 Dolly 推近至合十→idle 淡入完成，避免缓缓拉回造成跳动。
        lightProgression.endBreath({ releaseDolly: false });
        onboardingHints?.markSeen('breathing');
        syncOnboardingAutoHints();
      },
      onChooseConfirmed: () => {
        lightProgression.onChooseConfirmed();
        onboardingHints?.markSeen('choose');
      },
      onWelcome: () => {
        // 若仍定格在 dormantWake，playEmotion 会自动注入 CapCut，避免硬切微笑。
        emotionController.playEmotion('smiling', {
          crossFadeMs: CAPCUT_DISSOLVE_MS,
          freezeUntilCrossFadeEnds: true
        });
        syncOnboardingAutoHints();
      },
      onBegin: () => {
        lightProgression.beginArrival();
        syncOnboardingAutoHints();
      },
      // Choose 确认：立刻开门闩；点头播完后展开 Companion 点选开表（L249）。
      // 预选 Here & Now / Flow 回流：onReady 已 beginFocus 时 suppress，勿再展开。
      // 16:9 点头 pingpong 并行；与前后动画 1s CapCut 叠化。
      onIntentionSetPlay: (done) => {
        done?.();
        emotionController.playEmotion('intentionSet', {
          onComplete: () => {
            if (
              !suppressCompanionOpenAfterNod &&
              stateManager.state !== STATES.FOCUSING &&
              sessionUiGate.arrivalGateReady &&
              !sessionUiGate.completionPending
            ) {
              companionModePicker.open();
            }
            suppressCompanionOpenAfterNod = false;
            arrivalChoseThisRun = false;
            lightProgression.clearArrivalAtmosphere();
            window.setTimeout(() => {
              lightProgression.releaseDolly();
            }, CAPCUT_DISSOLVE_MS + 40);
          }
        });
      },
      onClearLight: () => lightProgression.clearArrivalEffects(),
      onCancel: () => {
        // Notice / Choose 点外侧：取消仪式回 Idle（禁止当成 Skip — begin）
        pendingAutoStartMode = null;
        arrivalChoseThisRun = false;
        suppressCompanionOpenAfterNod = false;
        pendingChoose = null;
        postChooseChrome.pending = false;
        syncArrivalGateReady(false);
        resyncSessionChrome();
        syncHonestyIdleEntry();
        syncOnboardingAutoHints();
        emotionController.playEmotion('idle');
      },
      onReady: (info = {}) => {
        pendingChoose = arrivalPractice.getChooseResult();
        // 本轮 Arrival 结果立刻闩上：有 Choose 则锁定；Skip/未选则清空。
        // 勿等到 beginFocus 才写入——二次 beginFocus 曾用 `?? ''` 把已选意图抹掉。
        const latched = resolveSessionIntentionLatch(
          {
            text: currentSessionIntention,
            source: currentIntentionSource
          },
          pendingChoose,
          { clearIfEmpty: true }
        );
        currentSessionIntention = latched.text;
        currentIntentionSource = latched.source;
        arrivalChoseThisRun = Boolean(info.chose);
        syncArrivalGateReady(true);
        onboardingHints?.markSeen('notice');
        onboardingHints?.markSeen('breathing');
        onboardingHints?.markSeen('choose');
        onboardingHints?.markSeen('how-shall-we-sit');
        onboardingHints?.markSeen('sit-button');
        onboardingHints?.markSeen('dormant-open');
        onboardingHints?.markSeen('honesty-optional');
        const resumeMode = pendingAutoStartMode;
        pendingAutoStartMode = null;
        const beginNow = sessionUiGate.shouldBeginFocusOnArrivalReady({
          ...info,
          pendingAutoStartMode: resumeMode
        });
        // Arrival already hidden: latch Quick-only through nod → Companion open.
        postChooseChrome.pending = !beginNow;
        resyncSessionChrome();
        if (beginNow) {
          postChooseChrome.pending = false;
          // 预选 Here & Now / Flow 后走完 Choose：开表并跳过「再点一次模式 / Sit」
          if (info.chose && resumeMode) {
            suppressCompanionOpenAfterNod = true;
          }
          requestBeginFocusWithMode(
            resumeMode || companionModePicker.getSelectedMode()
          );
        } else if (!info.chose) {
          companionModePicker.open();
        }
        syncOnboardingAutoHints();
      }
    }
  );
  // E2e skip Arrival → Focus (home left ball is Breath practice, not skip).
  // Must work in vite preview (DEV=false), same as `__honestyBridge`.
  window.__arrivalPractice = arrivalPractice;
  if (import.meta.env.DEV) {
    window.__lightProgression = lightProgression;
  }

  /** Slice A/A′：切语问候；e2e 可读 lastLocaleGreeting（兼容钩） */
  const sceneAnimationSliceA = {
    lastLocaleGreeting: /** @type {string | null} */ (null)
  };
  window.__sceneAnimationSliceA = sceneAnimationSliceA;
  onLocaleChange((locale) => {
    const decision = tryPlaySceneAnim(SCENE_ANIM_EVENTS.LANGUAGE_CHANGED, {
      locale,
      // JA book / EN tea: oneshot (no reverse) + ~1s CapCut idle
      playOptions: playOptionsForLocaleGreeting(locale)
    });
    if (decision.play && decision.emotionKey) {
      sceneAnimationSliceA.lastLocaleGreeting = decision.emotionKey;
    }
  });

  syncInAppReminderBanner = () => {
    reminderPreferenceUI?.refresh?.();
    flushPendingParrotMessengerAfterWelcome();
    const candidate = evaluateInAppReminderBanner({
      now: reminderNow,
      hasCompletedToday: () => dailyCompletionStore.hasCompletedToday()
    });
    const busy = isReminderBusySession({
      state: stateManager.state,
      arrivalOpen: Boolean(arrivalPractice?.isOpen?.()),
      reflectionOpen: Boolean(reflectionMoment?.isOpen?.()),
      microRitualOpen: Boolean(microRitualUI?.isOpen?.())
    });
    const decision = inAppReminderBannerController.resolve(candidate, {
      isBusySession: busy
    });
    const bannerWasVisible = inAppReminderBannerUI.isVisible();
    if (decision.action === 'show') {
      inAppReminderBannerUI.show(
        decision.messageKey || REMINDER_GENTLE_WAITING_MESSAGE_KEY
      );
      const holdForWelcome = isColdStartWelcomePlaying();
      if (
        shouldPlayParrotMessengerOnBannerShow({
          action: decision.action,
          bannerWasVisible,
          holdForWelcome
        })
      ) {
        playParrotMessengerNow();
      } else if (
        !bannerWasVisible &&
        holdForWelcome &&
        decision.action === 'show'
      ) {
        // 欢迎还在播：记下，等欢迎 onComplete / 下次 sync flush
        pendingParrotMessengerAfterWelcome = true;
      }
    } else if (inAppReminderBannerUI.isVisible()) {
      inAppReminderBannerUI.hide({ silent: true });
    }
  };

  // E2E clocks the reminder via `__inAppReminder` (in-app-reminder.spec.js).
  // Must work in `vite preview` production builds where `import.meta.env.DEV === false`.
  window.__inAppReminder = {
    sync: () => syncInAppReminderBanner(),
    setNow: (value) => {
      reminderNowOverride =
        value == null ? null : value instanceof Date ? value : new Date(value);
    },
    clearNow: () => {
      reminderNowOverride = null;
    },
    controller: inAppReminderBannerController,
    settings: reminderPreferenceUI,
    banner: inAppReminderBannerUI,
    /** DEV/E2E：清观测戳（不重置横幅 dismiss） */
    resetParrotMessenger: () => {
      parrotMessengerPlayedThisPageSession = false;
      pendingParrotMessengerAfterWelcome = false;
    },
    get parrotMessengerPlayed() {
      return parrotMessengerPlayedThisPageSession;
    },
    get pendingParrotMessengerAfterWelcome() {
      return pendingParrotMessengerAfterWelcome;
    },
    get isColdStartWelcomePlaying() {
      return isColdStartWelcomePlaying();
    },
    /** E2E（含 vite preview production）：观测信使开播后的 emotion key */
    getCurrentEmotionKey: () => emotionController.getCurrentEmotionKey()
  };

  /**
   * 与 Sit / hint 门闩未就绪路径相同：完整 Arrival，不跳过、不开计时、不开 Ambient。
   * @param {{ autoStartMode?: string | null }} [opts]
   *   先点选 Here & Now / Flow 再进 Arrival 时传入，结束后自动开表。
   */
  function startArrivalPracticeFromChrome({ autoStartMode = null } = {}) {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    microRitualUI?.hideIdleEntry();
    // 新一轮 Arrival：清掉上场未消费的 Choose，避免错挂到本场 Reflection
    pendingChoose = null;
    currentSessionIntention = '';
    currentIntentionSource = 'typed';
    arrivalChoseThisRun = false;
    pendingAutoStartMode =
      autoStartMode && shouldAutoStartFocusOnModeSelect(autoStartMode)
        ? autoStartMode
        : null;
    suppressCompanionOpenAfterNod = false;
    postChooseChrome.pending = false;
    syncArrivalGateReady(false);
    companionModePicker.hide();
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('dormant-open');
    onboardingHints?.markSeen('honesty-optional');
    arrivalPractice.start();
    resyncSessionChrome();
    syncHonestyIdleEntry();
    syncOnboardingAutoHints();
    maybeOfferMomentWhisper('arrive', { delayMs: 500 });
  }

  const honestyBridgeUI = new HonestyBridgeCtaUI(
    document.getElementById('ui-overlay')
  );
  honestyBridge = new HonestyBridgeCtaController({
    store: honestyBridgeStore,
    ui: honestyBridgeUI,
    trackEvent: (event) => {
      if (event === RETENTION_EVENTS.DORMANT_BRIDGE_SHOWN) {
        retentionFunnelStore.trackBridgeShown();
        return;
      }
      if (event === RETENTION_EVENTS.DORMANT_BRIDGE_ACCEPTED) {
        retentionFunnelStore.trackBridgeAccepted();
        return;
      }
      if (event === RETENTION_EVENTS.DORMANT_BRIDGE_DECLINED) {
        retentionFunnelStore.trackBridgeDeclined();
      }
    },
    onShown: () => {
      syncHonestyIdleEntry();
      resyncSessionChrome();
      syncOnboardingAutoHints();
    },
    onHidden: () => {
      honestyCheckIn.endCheckInFlow();
      resyncSessionChrome();
      syncHonestyIdleEntry();
      syncOnboardingAutoHints();
    },
    onAccept: () => {
      onboardingHints?.markSeen('honesty-bridge');
      if (
        !sessionUiGate.canStartArrivalFromChrome({
          isFocusing: stateManager.state === STATES.FOCUSING,
          arrivalOpen: arrivalPractice.isOpen()
        })
      ) {
        mindfulToast.show(t('COMPANION_SELECT_BLOCKED'));
        return;
      }
      honestyCheckInUI.hideIdleEntry();
      startArrivalPracticeFromChrome();
    },
    onDecline: () => {
      onboardingHints?.markSeen('honesty-bridge');
      emotionController.playEmotion('idle');
      syncHonestyIdleEntry();
      syncOnboardingAutoHints();
    }
  });
  // E2E injects bridge via `__honestyBridge` (micro-ritual.spec.js). Must work in
  // CI `vite preview` production builds where `import.meta.env.DEV === false`.
  window.__honestyBridge = honestyBridge;
  window.__honestyBridgeStore = honestyBridgeStore;
  if (import.meta.env.DEV) {
    window.__retentionFunnel = retentionFunnelStore;
  }

  function endFocusChrome() {
    attentionSignals.setEnabled(false);
    mindfulReminderController.stopSession();
    acrossToolsIdleGuard.stop();
    ambientSoundscape.endSession();
    ambientSoundscapeUI.setSessionActive(false);
    supportYinModalUI.setFabVisible(true);
    tipKindnessBadgesChrome.setVisible(true);
    activeRecoverAnchor.setFocusing(false);
    immersivePresenceUI.setFocusing(false);
    companionModePicker.setIdleChromeVisible(true);
  }

  function beginSessionCompleteIfNeeded() {
    if (
      sessionUiGate.completionPending ||
      stateManager.state !== STATES.FOCUSING ||
      !focusSession.hasReachedTarget()
    ) {
      return;
    }

    sessionUiGate.setCompletionPending(true);
    resyncSessionChrome();
    endFocusChrome();
    focusSession.pause();
    // 庆祝戳与完成记录解耦：Honesty 补登不占 Celebrating；首次计时达标仍须舞。
    // 里程碑（如连续 7 天）同刻只播 MilestoneGlow，庆祝戳仍记账。
    const todayKey = getLocalDateKey(now());
    const projectedStreak = projectedStreakIncludingToday(
      practiceDaysStore.getPracticedDateKeys(),
      todayKey,
      countRecentPracticeStreak
    );
    const milestoneNode = milestoneGlowStore.peekOffer(projectedStreak);
    // Expand B：深夜达标 → 披斗篷定格进 Reflection（不做常规庆祝舞；里程碑仍优先）。
    if (shouldLateNightCloakOnSessionEnd(now()) && !milestoneNode) {
      dailyCompletionStore.markCelebratedToday();
      finishCompletedSession();
      emotionController.playEmotion('cloakSleep', { holdPose: true });
      return;
    }
    triggerSessionCompletionFeedback({
      hasCelebratedToday: dailyCompletionStore.hasCelebratedToday(),
      preferMilestoneGlow: Boolean(milestoneNode),
      emotionController,
      startCelebrating: () => {
        dailyCompletionStore.markCelebratedToday();
        stateManager.setState(STATES.CELEBRATE);
      },
      startMilestoneGlow: () => {
        const claimed = milestoneGlowStore.claimOffer(projectedStreak);
        dailyCompletionStore.markCelebratedToday();
        emotionController.playEmotion('milestoneGlow', {
          milestoneNodeId: claimed,
          onComplete: finishCompletedSession
        });
      },
      onComplete: finishCompletedSession
    });
  }

  /**
   * 开表入口：无 `?sessionMinutes=` 时先出 15/25/45/60 chip；有则跳过（e2e）。
   * @param {string} companionMode
   */
  function requestBeginFocusWithMode(companionMode) {
    focusDurationPicker?.hide();
    microRitualUI?.hide();
    if (shouldSkipFocusDurationPicker(location.search)) {
      focusSession.setTargetMinutes(
        resolveDemoSessionMinutes(location.search)
      );
      beginFocusWithMode(companionMode);
      return;
    }
    pendingFocusDurationMode = companionMode;
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    companionModePicker.hide();
    companionModePicker.setIdleChromeVisible(false);
    // Reuse micro-ritual chrome latch so Sit stays disabled while picking.
    companionModePicker.setMicroRitualActive(true);
    setFocusButtonEnabled(false);
    microRitualUI?.hideIdleEntry();
    focusDurationPicker.open();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  }

  function beginFocusWithMode(companionMode) {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    microRitualUI?.hideIdleEntry();
    microRitualUI?.hide();
    focusDurationPicker?.hide();
    pendingFocusDurationMode = null;
    companionModePicker.setMicroRitualActive(false);
    honestyGlowLevel = null;
    // 只在仍有 pending Choose 时写入；空 pending 不得把已闩意图抹成 ''（二次 beginFocus 回归锁）
    const latched = resolveSessionIntentionLatch(
      {
        text: currentSessionIntention,
        source: currentIntentionSource
      },
      pendingChoose,
      { clearIfEmpty: false }
    );
    currentSessionIntention = latched.text;
    currentIntentionSource = latched.source;
    pendingChoose = null;
    // Arrival/⚡ 解锁后保持门闩：Rise 回流点 Here & Now / Flow 须立刻 Focusing（勿清 false）
    if (currentSessionIntention) {
      recordIntention(currentSessionIntention, {
        source: currentIntentionSource
      });
    }
    companionModePicker.setIdleChromeVisible(false);
    postChooseChrome.pending = false;
    focusSession.start({ companionMode });
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('companion-mode');
    onboardingHints?.markSeen('weekly-heatmap');
    onboardingHints?.markSeen('in-app-reminder');
    onboardingHints?.markSeen('micro-ritual');
    onboardingHints?.markSeen('ambient-gated');
    onboardingHints?.maybeShowAuto('rise-button');
    onboardingHints?.maybeShowAuto('ambient-soundscape');
    requestAnimationFrame(() => onboardingHints?.repositionAll());
    mindfulReminderController.startSession({
      suppressAwayReminders: shouldSuppressAwayReminders(companionMode),
      getSessionElapsedSeconds: () => focusSession.getElapsedSeconds()
    });
    ambientSoundscape.startSession();
    ambientSoundscapeUI.setSessionActive(true);
    supportYinModalUI.setFabVisible(false);
    tipKindnessBadgesChrome.setVisible(false);
    activeRecoverAnchor.setFocusing(true);
    immersivePresenceUI.setFocusing(true);
    attentionSignals.setEnabled(true);
    acrossToolsIdleGuard.stop();
    if (companionMode === COMPANION_MODE_ACROSS_TOOLS) {
      acrossToolsIdleGuard.start({
        onIdle: () => {
          mindfulToast.show(tPool('ACROSS_TOOLS_IDLE'));
        }
      });
    }
    stateManager.setState(STATES.FOCUSING);
    sessionUiGate.setCompletionPending(false);
    resyncSessionChrome();
    // 自动开计时路径须同步主按钮 → Rise（事件触发时 focusInput 已初始化）
    focusInput.beginFocusing(focusButton);
    maybeOfferMomentWhisper('focus', { delayMs: 600 });
  }

  companionModeHandlers.canBeginFocus = (mode) =>
    sessionUiGate.canBeginFocusOnCompanionModeSelect(mode, {
      arrivalOpen: arrivalPractice.isOpen(),
      isFocusing: stateManager.state === STATES.FOCUSING
    });

  companionModeHandlers.resolveNeedsArrival = (mode) =>
    sessionUiGate.resolveAutoStartNeedsArrival(mode, {
      arrivalOpen: arrivalPractice.isOpen(),
      isFocusing: stateManager.state === STATES.FOCUSING
    });

  companionModeHandlers.onSelectRejected = () => {
    mindfulToast.show(t('COMPANION_SELECT_BLOCKED'));
  };

  companionModeHandlers.onModeSelected = (mode) => {
    onboardingHints?.markSeen('companion-mode');
    if (mode === COMPANION_MODE_STAY) onboardingHints?.markSeen('companion-stay');
    if (mode === COMPANION_MODE_STEP_AWAY) {
      onboardingHints?.markSeen('companion-away');
    }
    if (mode === COMPANION_MODE_ACROSS_TOOLS) {
      onboardingHints?.markSeen('companion-across-tools');
    }
    if (
      !sessionUiGate.canBeginFocusOnCompanionModeSelect(mode, {
        arrivalOpen: arrivalPractice.isOpen(),
        isFocusing: stateManager.state === STATES.FOCUSING
      })
    ) {
      // Picker 已 commit；竞态下仍拒绝开表时给反馈（禁止静默）
      mindfulToast.show(t('COMPANION_SELECT_BLOCKED'));
      return;
    }
    requestBeginFocusWithMode(mode);
  };

  /** 首页左球：Breath practice（原 ⚡ Quick Start 跳过 Arrival 开表） */
  companionModeHandlers.onQuickStart = () => {
    if (sessionUiGate.completionPending) return;
    if (
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE
    ) {
      return;
    }
    if (
      reflectionMoment?.isOpen?.() ||
      microRitualUI?.isOpen?.() ||
      focusDurationPicker?.isOpen?.() ||
      honestyBridge?.isVisible?.()
    ) {
      return;
    }
    // Arrival 开着：收仪式回 Idle 门闩，再开呼吸练习（不再 skip→Focus）
    if (arrivalPractice?.isOpen?.()) {
      arrivalPractice.hide();
      pendingAutoStartMode = null;
      arrivalChoseThisRun = false;
      suppressCompanionOpenAfterNod = false;
      pendingChoose = null;
      postChooseChrome.pending = false;
      syncArrivalGateReady(false);
    }
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    companionModePicker.hide();
    focusDurationPicker?.hide();
    pendingFocusDurationMode = null;
    onboardingHints?.markSeen('quick-start');
    onboardingHints?.markSeen('micro-ritual');
    beginMicroRitualChrome();
    microRitualUI.openDurationPicker();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  };

  /** 门闩未就绪时选模式 → 启动 Arrival；返回是否已启动（Picker 凭此写 storage） */
  companionModeHandlers.onAutoStartNeedsArrival = (mode) => {
    if (
      !sessionUiGate.canStartArrivalFromChrome({
        isFocusing: stateManager.state === STATES.FOCUSING,
        arrivalOpen: arrivalPractice.isOpen()
      })
    ) {
      return false;
    }
    startArrivalPracticeFromChrome({
      autoStartMode: mode
    });
    return true;
  };

  companionModeHandlers.onExpandedChange = (expanded) => {
    if (expanded) {
      // Choose 鞠躬后 open() 也须 stage：否则窄屏 park 下三选一在屏外，
      // 只剩 home 三球，误读成「没弹出三选一」（ca20d07；本分支曾丢此修复）。
      document.body.classList.remove(
        'ft-narrow-stage-sound',
        'ft-narrow-stage-reminder'
      );
      document.body.classList.add('ft-narrow-stage-companion');
      onboardingHints?.maybeShowAuto('companion-mode');
      requestAnimationFrame(() => onboardingHints?.repositionAll());
    } else {
      document.body.classList.remove('ft-narrow-stage-companion');
    }
    // Companion owns Quick-only via companionExpanded; clear Choose→nod latch.
    if (expanded) postChooseChrome.pending = false;
    resyncSessionChrome();
    syncOnboardingAutoHints();
  };

  const focusInput = new FocusInput(
    () => {
      if (sessionUiGate.completionPending) return false;
      sessionEndFlow.cancelPending();
      honestyBridge?.hide();
      honestyCheckInUI.hide();

      if (arrivalPractice.isOpen()) {
        // 仪式进行中：Sit 不再充当 Skip — begin；快速开表请用 ⚡ Quick Start
        return false;
      }

      const sitAction = sessionUiGate.resolveSitClickWhenIdle({
        isFocusing: stateManager.state === STATES.FOCUSING
      });
      if (sitAction === 'ignore') return false;
      if (sitAction === 'start-arrival') {
        startArrivalPracticeFromChrome();
        return false;
      }

      requestBeginFocusWithMode(companionModePicker.getSelectedMode());
      return true;
    },
    () => {
      const riseAction = sessionUiGate.resolveRiseClickDuringFocus({
        state: stateManager.state,
        hasReachedTarget: focusSession.hasReachedTarget()
      });
      if (riseAction === 'ignore') return false;
      if (riseAction === 'complete') {
        beginSessionCompleteIfNeeded();
        return false;
      }

      companionModePicker.hide();
      arrivalPractice.hide();
      // 保持 arrivalGateReady：本场若经 Arrival/⚡ 解锁，回流 Companion 可直接开表
      pendingChoose = null;
      pendingAutoStartMode = null;
      suppressCompanionOpenAfterNod = false;
      postChooseChrome.pending = false;
      endFocusChrome();
      stashPendingJourneyDraft({ completed: false });
      focusSession.stop();
      sessionUiGate.setCompletionPending(false);
      honestyGlowLevel = null;
      tigerCharacter.setFocusLevel(0);
      honestyBridge?.hide();
      // Must reach IDLE before chrome resync — otherwise shells stay in Focusing
      // layout and #btn-focus briefly shows Sit (Rise flash of old orange pill).
      honestyCheckIn.onIncompleteSessionEnded();
      resyncSessionChrome();
      companionModePicker.setIdleChromeVisible(true);
      // Rise：白天加权池（伸懒腰 60% / 喝茶 25% / 单程看书 15%）；
      // 深夜 Expand B：披斗篷定格 → Reflection；关面板后再回 idle。
      // MoodController 在 IDLE 时不覆盖池内 / 披斗篷 hold 键。
      const riseEmotion = resolveSessionEndHoldEmotion({
        date: now(),
        pickDaytimeRiseEmotion: pickRiseInterruptEmotion
      });
      emotionController.playEmotion(riseEmotion, { holdPose: true });
      sessionEndFlow.onSessionEnded({
        completed: false,
        intention: currentSessionIntention,
        intentionSource: currentIntentionSource
      });
      currentSessionIntention = '';
      currentIntentionSource = 'typed';
      // ambient-soundscape stays unread until a track is actually chosen
      // (ONBOARDING_HINTS: only track choice clears the mint note dot).
      onboardingHints?.markSeen('rise-button');
      hasEndedAnySession = true;
      syncOnboardingAutoHints();
    }
  );

  function finishCompletedSession() {
    if (!sessionUiGate.completionPending) return;
    stashPendingJourneyDraft({ completed: true });
    focusSession.stop();
    honestyCheckIn.onTimedSessionCompleted(focusSession.targetMinutes);
    stateManager.setState(STATES.IDLE);
    honestyGlowLevel = null;
    tigerCharacter.setFocusLevel(0);
    focusInput.resetButton(focusButton);
    sessionUiGate.setCompletionPending(false);
    resyncSessionChrome();
    companionModePicker.setIdleChromeVisible(true);
    sessionEndFlow.onSessionEnded({
      completed: true,
      intention: currentSessionIntention,
      intentionSource: currentIntentionSource
    });
    currentSessionIntention = '';
    currentIntentionSource = 'typed';
    onboardingHints?.markSeen('rise-button');
  }

  const moodController = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: finishCompletedSession
  });
  // StateManager 初始 IDLE 不会主动发 onChange；显式启动 observer baseline。
  moodController.handleStateChange(stateManager.state);

  // 须在 wrap showPrompt/hide 与 MoodController 接线之后，否则首屏 Honesty 无视觉
  // Wellness 冷启动时段（2A）：深夜可披斗篷；清晨苏醒仪式；白天仍禁 2h 戳开场即睡。
  // 2026-08-06 纠正：Day1 / ≥3 日久别吹花 **高于** wellness——首次看产品必须先吹花。
  const wellnessBand = resolveWellnessDayBand(new Date());
  const flowerForceBoot = resolveFlowerWelcomeForce({
    storage: typeof localStorage !== 'undefined' ? localStorage : null,
    now: () => new Date(),
    enabled: isFlowerWelcomeEnabled({
      storage: typeof localStorage !== 'undefined' ? localStorage : null
    })
  });
  const preferFlowerOverWellness =
    shouldPreferFlowerWelcomeOverWellness(flowerForceBoot);
  let skipWelcomeForWellness = false;
  if (preferFlowerOverWellness) {
    honestyCheckIn.onAppReady();
    skipWelcomeForWellness = false;
  } else if (wellnessBand === WELLNESS_DAY_BANDS.LATE_NIGHT) {
    honestyCheckIn.syncDormantState({
      allowEnterDormant: true,
      forceDormant: true
    });
    mindfulToast.show(t('WELLNESS_LATE_NIGHT_REST'), { visibleMs: 5200 });
    skipWelcomeForWellness = true;
  } else if (wellnessBand === WELLNESS_DAY_BANDS.MORNING) {
    honestyCheckIn.onAppReady();
    emotionController.playEmotion('dormantWake', {
      holdPose: true,
      onComplete: () => {
        emotionController.playEmotion('idle', {
          crossFadeMs: CAPCUT_DISSOLVE_MS
        });
      }
    });
    mindfulToast.show(t('WELLNESS_MORNING_WAKE'), { visibleMs: 5200 });
    skipWelcomeForWellness = true;
  } else {
    honestyCheckIn.onAppReady();
  }
  retentionFunnelStore.noteAppOpen();
  syncHonestyIdleEntry();
  syncOnboardingAutoHints();

  function maybeOfferFiveMomentsCompassFirstCard() {
    if (!productChrome) return;
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    if (!shouldOfferFiveMomentsCompassFirstCard(storage)) return;
    if (stateManager.state !== STATES.IDLE) return;
    if (isSceneAnimOverlayBusy()) return;
    if (fiveMomentsCompassUI.isOpen()) return;
    if (onboardingHints?.purposeCard && !onboardingHints.purposeCard.hidden) {
      return;
    }
    if (onboardingHints?.privacySheet && !onboardingHints.privacySheet.hidden) {
      return;
    }
    closeGrowthOverlayCards({ except: 'moments' });
    fiveMomentsCompassUI.open({ firstRun: true });
  }

  // Quiet Idle first-run: after welcome settle, once. Skip/Got it marks seen.
  if (productChrome) {
    window.setTimeout(() => maybeOfferFiveMomentsCompassFirstCard(), 4500);
  }

  // Slice B：冷启动欢迎池（同日 1 次）。深夜生命感（≥23:00，1h 冷却）
  // 不得与欢迎同 tick 叠播——否则 ≥23:00 时 tea/yawn 会盖掉书/点头（见 DEV_WORKFLOW §6.9）。
  // wellness 深夜披斗篷 / 清晨苏醒仪式时跳过欢迎与 yawn/tea，避免抢戏。
  // 提醒横幅可与欢迎并存文案，但鹦鹉信使不得抢 Welcome（欢迎结束后补播）。
  const welcomeBoot = skipWelcomeForWellness
    ? { play: false, emotionKey: null, reason: 'wellness-band' }
    : tryPlaySceneAnim(SCENE_ANIM_EVENTS.WELCOME_APP, {
        playOptions: {
          onComplete: () => {
            // 必须延后：_finishOneShot 在 onComplete 之后还会 playEmotion('idle')，
            // 同步播信使会被立刻盖掉（e2e 见 played=true 但 key 永为 idle）。
            const playMessenger =
              pendingParrotMessengerAfterWelcome &&
              inAppReminderBannerUI.isVisible();
            window.setTimeout(() => {
              if (playMessenger) {
                playParrotMessengerNow();
                return;
              }
              pendingParrotMessengerAfterWelcome = false;
              syncInAppReminderBanner();
            }, 0);
          }
        }
      });
  if (
    !skipWelcomeForWellness &&
    shouldAttemptLateNightOnBoot(welcomeBoot)
  ) {
    tryPlaySceneAnim(SCENE_ANIM_EVENTS.LATE_NIGHT);
  }

  // Expand A 白天 Idle 无操作披毯已关（2026-08-04 plan A）。保留：深夜 Idle→DORMANT、
  // 2h 练完后 live sync、Expand B。无操作计时器删除 → 藏 tab 也不会「后台涨满」误睡。

  // 回前台：2B 长离苏醒（FOCUSING + hidden≥30min）与 2h→DORMANT（非 Focusing）互补；
  // 深夜 LATE_NIGHT 仍可 forceDormant（仅 Idle）。
  let pageHiddenAtMs = /** @type {number | null} */ (null);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pageHiddenAtMs = Date.now();
      return;
    }
    const hiddenMs =
      pageHiddenAtMs == null ? 0 : Date.now() - pageHiddenAtMs;
    pageHiddenAtMs = null;

    beginSessionCompleteIfNeeded();

    if (
      resolveForegroundReturnAction({
        sessionState: stateManager.state,
        hiddenMs
      }) === FOREGROUND_RETURN_ACTIONS.LONG_AWAY_WAKE
    ) {
      emotionController.playEmotion('dormantWake', {
        holdPose: true,
        onComplete: () => {
          emotionController.playEmotion('idle', {
            crossFadeMs: CAPCUT_DISSOLVE_MS
          });
        }
      });
    } else {
      honestyCheckIn.syncDormantState();
      tryPlaySceneAnim(SCENE_ANIM_EVENTS.LATE_NIGHT);
    }
    syncInAppReminderBanner();
  });

  // Lab chrome: vite `serve` (DEV) or local Playwright `vite build --mode development`
  // (MODE=development but DEV still false on any `build`). Product shell / CI prod build: off.
  const labDevChrome =
    (import.meta.env.DEV || import.meta.env.MODE === 'development') &&
    !productChrome;

  if (labDevChrome) {
    void (async () => {
      const {
        consumeDevBootIdle,
        consumeDevResetToast
      } = await import('./core/localStateKeys.js');

      if (consumeDevBootIdle()) {
        stateManager.setState(STATES.IDLE);
        honestyCheckInUI.hide();
        honestyCheckInUI.hideIdleEntry();
        honestyBridge?.hide();
        emotionController.playEmotion('idle', { restart: true });
        resyncSessionChrome();
        syncOnboardingAutoHints();
        syncHonestyIdleEntry();
      } else if (consumeDevResetToast()) {
        showDevLabToast(
          '已重置为全新用户：当日零完成 → Idle 闭目坐禅 + Honesty 提示（场景 A 正常开局）。调试「睡着了」仍可试 Sleeping。',
          12_000
        );
      }
    })();
  }

  // DEV / local e2e development-mode 实验室调试入口（CI production preview 与 ?product=1 均不出现）
  if (labDevChrome) {
    const clearHintsBtn = document.createElement('button');
    clearHintsBtn.type = 'button';
    clearHintsBtn.textContent = '清空引导提示已读';
    clearHintsBtn.style.cssText =
      'position:fixed;top:12px;right:180px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b2e2e;background:#fff8f0;color:#2c1f14;border-radius:4px;';
    clearHintsBtn.id = 'dev-clear-hints-seen';
    clearHintsBtn.title =
      '仅实验室页有效（勿带 ?product=1）。清空 focus-tiger.hints-seen.v1 后刷新 tip/薄荷绿。';
    clearHintsBtn.addEventListener('click', () => {
      if (!onboardingHints) {
        showDevLabToast(
          '引导 UI 尚未就绪，请等页面加载完再点「清空引导提示已读」。',
          6_000
        );
        return;
      }
      onboardingHints.clearSeen();
      onboardingHints.hideBubble();
      syncOnboardingAutoHints();
      // Menu/drawer may already be open — repaint row mints (was silent no-op).
      idleChrome.wide.refreshSecondaryHintDots?.();
      idleChrome.narrow.refreshSecondaryHintDots?.();
      showDevLabToast(
        '已清空引导已读。测产品壳请再开 ?product=1；⋯/抽屉未读行应见薄荷绿。',
        8_000
      );
    });
    document.body.appendChild(clearHintsBtn);

    const resetAllBtn = document.createElement('button');
    resetAllBtn.type = 'button';
    resetAllBtn.id = 'dev-reset-all-local-state';
    resetAllBtn.textContent = '重置全部本地状态';
    resetAllBtn.title =
      '清空 focus-tiger.* localStorage 并刷新 → 场景 A：零完成 Idle 坐禅 + Honesty 入口（不是自动 DORMANT）';
    resetAllBtn.style.cssText =
      'position:fixed;top:12px;right:320px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b2e2e;background:#fff0f0;color:#2c1f14;border-radius:4px;';
    resetAllBtn.addEventListener('click', async () => {
      const confirmed = globalThis.confirm(
        '将清空全部 focus-tiger 本地数据并刷新。\n\n' +
          '刷新后 = 场景 A 全新用户：\n' +
          '• 当日零完成\n' +
          '• 阿寅 Idle 闭目坐禅（无专注结束记录 → 不自动 DORMANT）\n' +
          '• Honesty 正念登入小钮可见\n\n' +
          '（DORMANT 需距上次专注结束 ≥2h；要测 idle 动画请用「重置并 idle 坐禅」。）\n\n' +
          '确定重置？'
      );
      if (!confirmed) return;

      const {
        clearAllFocusTigerLocalState,
        markDevResetToast
      } = await import('./core/localStateKeys.js');
      const { clearAllUserAmbientTracks } = await import(
        './audio/UserAmbientLibrary.js'
      );
      clearAllFocusTigerLocalState();
      await clearAllUserAmbientTracks();
      markDevResetToast();
      window.location.reload();
    });
    document.body.appendChild(resetAllBtn);

    const resetIdleBtn = document.createElement('button');
    resetIdleBtn.type = 'button';
    resetIdleBtn.id = 'dev-reset-all-local-state-idle';
    resetIdleBtn.textContent = '重置并 idle 坐禅';
    resetIdleBtn.title =
      '清空 localStorage 并刷新后直接进入 idle pingpong（测动画 / 跳过 DORMANT）';
    resetIdleBtn.style.cssText =
      'position:fixed;top:12px;right:470px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #2e6b8b;background:#f0f8ff;color:#2c1f14;border-radius:4px;';
    resetIdleBtn.addEventListener('click', async () => {
      const confirmed = globalThis.confirm(
        '将清空全部 focus-tiger 本地数据并刷新，然后直接进入 idle 坐禅 pingpong（不显示 DORMANT / Honesty）。\n\n' +
          '用于测 idle 动画。确定？'
      );
      if (!confirmed) return;

      const {
        clearAllFocusTigerLocalState,
        markDevBootIdle
      } = await import('./core/localStateKeys.js');
      const { clearAllUserAmbientTracks } = await import(
        './audio/UserAmbientLibrary.js'
      );
      clearAllFocusTigerLocalState();
      await clearAllUserAmbientTracks();
      markDevBootIdle();
      window.location.reload();
    });
    document.body.appendChild(resetIdleBtn);
  }

  const uiControls = new UIControls(focusInput);
  uiControls.bindAll();

  // 同页静候到期：无 tab 切换时也要能在提醒时分 hidden→show（并触发信使）。
  window.setInterval(() => {
    syncInAppReminderBanner();
  }, 60_000);

  syncInAppReminderBanner();

  const clock = new THREE.Clock();
  /** Tracks heatmap Idle visibility so click mints re-sync after first paint. */
  let _prevWeeklyHeatmapVisibleForHints = weeklyPracticeHeatmap.isVisible();
  /** Tracks language FAB visibility for mint re-sync (wide Idle only). */
  let _prevLanguageFabVisibleForHints = languagePreferenceUI.isFabVisible();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    focusSession.tick(delta);
    mindfulReminderController.update(delta);

    const microOpen = microRitualUI?.isOpen() === true;
    const microBreathing = microRitualUI?.phase === 'breath';
    const microElapsed = microBreathing
      ? microRitualUI.getElapsedSeconds()
      : null;
    const microProgress = microBreathing ? microRitualUI.getProgress() : null;

    const focusLevel =
      microProgress != null
        ? microProgress
        : honestyGlowLevel != null && stateManager.state !== STATES.FOCUSING
          ? honestyGlowLevel
          : focusSession.getFocusLevel();
    const presenceBoost =
      stateManager.state === STATES.FOCUSING
        ? ambientSoundscape.getPresenceBoost(focusSession.targetMinutes)
        : 0;
    // 已烧录金光的叙事动画播放期归零实时光效，避免与帧内光环/粒子过曝。
    const visualLevel = emotionController.shouldSuppressRuntimeGlow()
      ? 0
      : Math.min(1, focusLevel + presenceBoost);
    tigerCharacter.setFocusLevel(visualLevel);
    focusVisualizer.update(visualLevel);
    lightProgression.updateFocusGlow(visualLevel, delta);
    tigerCharacter.update(delta);
    dynamicMotion.update(delta);
    transitionFX.update(delta);
    incenseGreeting.update(delta);

    const tigerPos = tigerCharacter.getWorldPosition();
    transitionFX.setTigerPosition(tigerPos);

    beginSessionCompleteIfNeeded();

    focusHUD.render(focusSession, stateManager, {
      todayCompletedMinutes: dailyCompletionStore.getTodayTotalMinutes(),
      softTargetMinutes: FOCUS_SESSION_DEFAULT_MINUTES,
      practiceRingFilled: practiceDaysStore.getRingFilled(PRACTICE_STREAK_RING_TOTAL),
      practiceRingTotal: PRACTICE_STREAK_RING_TOTAL,
      treatAsFocusing: microBreathing,
      liveElapsedSeconds: microElapsed,
      focusLevelOverride: microProgress,
      sessionTargetMinutes: microBreathing
        ? microRitualUI?.getDurationMinutes?.()
        : focusSession.targetMinutes
    });
    weeklyPracticeHeatmap.render({
      // Home presence chrome: Idle + Dormant (late-night cloak still shows the week).
      // Hide during Focusing / overlays / micro-ritual.
      visible:
        (stateManager.state === STATES.IDLE ||
          stateManager.state === STATES.DORMANT) &&
        !microOpen,
      days: practiceDaysStore.getLastNDays(WEEKLY_PRACTICE_HEATMAP_DAYS)
    });
    reminderPreferenceUI.setVisible(
      stateManager.state === STATES.IDLE && !microOpen
    );
    languagePreferenceUI.setFabVisible(
      stateManager.state === STATES.IDLE && !microOpen
    );
    // Heatmap / reminder / language FAB mount after first Idle paint — re-sync
    // click mints once they become on-screen.
    if (
      weeklyPracticeHeatmap.isVisible() !== _prevWeeklyHeatmapVisibleForHints
    ) {
      _prevWeeklyHeatmapVisibleForHints = weeklyPracticeHeatmap.isVisible();
      syncOnboardingAutoHints();
    }
    if (languagePreferenceUI.isFabVisible() !== _prevLanguageFabVisibleForHints) {
      _prevLanguageFabVisibleForHints = languagePreferenceUI.isFabVisible();
      syncOnboardingAutoHints();
    }
    composer.render();
  }

  stateManager.onChange(() => {
    syncInAppReminderBanner();
    if (stateManager.state === STATES.IDLE) {
      window.setTimeout(() => maybeOfferFiveMomentsCompassFirstCard(), 900);
    }
  });

  // E2E readiness: all primary UI/controllers are wired, initial syncs ran,
  // and the product shell can now be safely queried/clicked.
  window.__FT_APP_READY__ = true;
  window.dispatchEvent(new Event('ft:app-ready'));

  animate();
}

init().catch((error) => {
  console.error('初始化失败:', error);
});
