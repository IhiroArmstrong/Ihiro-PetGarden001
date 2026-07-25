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
  shouldAutoStartFocusAfterArrivalNod,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS
} from './core/FocusSession.js';
import { SessionUiGate, computePostSessionOverlayActive } from './core/SessionUiGate.js';
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
import { NarrowIdleShell } from './ui/NarrowIdleShell.js';
import { WideIdleMoreMenu } from './ui/WideIdleMoreMenu.js';
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
import { t, tPool, setLocale, getLocale, onLocaleChange } from './locales/i18n.js';
import { ReminderQuotaManager } from './core/ReminderQuotaManager.js';
import { MindfulReminderController } from './core/MindfulReminderController.js';
import { AttentionSignals } from './input/AttentionSignals.js';
import {
  MindfulAcknowledgeToast,
  MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE
} from './ui/MindfulAcknowledgeToast.js';
import { TigerReflectionMoment } from './ui/TigerReflectionMoment.js';
import { SessionEndFlow } from './core/SessionEndFlow.js';
import { DailyCompletionStore } from './core/DailyCompletionStore.js';
import { FocusSessionEndStore } from './core/FocusSessionEndStore.js';
import {
  PracticeDaysStore,
  PRACTICE_STREAK_RING_TOTAL
} from './core/PracticeDaysStore.js';
import { triggerSessionCompletionFeedback } from './core/session-completion-feedback.js';
import { HonestyCheckInController } from './core/HonestyCheckInController.js';
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
  MICRO_RITUAL_DURATION_MINUTES,
  resolveMicroRitualMs
} from './core/MicroRitual.js';
import {
  recordIntention,
  resolveSessionIntentionLatch
} from './core/SessionIntentionStore.js';
import { AcrossToolsIdleGuard } from './core/AcrossToolsIdleGuard.js';
import { AmbientSoundscapeController } from './audio/AmbientSoundscapeController.js';
import { AmbientSoundscapeUI } from './ui/AmbientSoundscapeUI.js';
import {
  createHintsSeenStore,
  resolveAutoHintIds
} from './core/OnboardingHintsStore.js';
import { OnboardingHintsUI } from './ui/OnboardingHintsUI.js';
/** 默认 1 分钟；场景 B 真实切页 Re-focus 用 `?sessionMinutes=5`。 */
const DEMO_SESSION_MINUTES = resolveDemoSessionMinutes(location.search);
/** 微仪式默认 60s；e2e 用 `?microRitualMs=1500` 缩短。 */
const MICRO_RITUAL_MS = resolveMicroRitualMs(location.search);
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

  console.info('[PoseManager] alignment records:', poseManager.alignmentRecords);

  PoseManager.setLoadingMaskVisible(false);

  const focusVisualizer = new FocusVisualizer(composer);
  await focusVisualizer.init(mounts.tiger);

  const pointerInteraction = new PointerInteraction({
    canvas,
    camera,
    poseManager,
    emotionController
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

  const focusHUD = new FocusHUD(document.getElementById('focus-hud'));
  const narrowIdleShell = new NarrowIdleShell({
    root: document.body,
    getHudStateEl: () => document.getElementById('hud-state'),
    getHudTimeEl: () => document.getElementById('hud-time')
  });
  if (import.meta.env.DEV) {
    window.__narrowIdleShell = narrowIdleShell;
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
  /** Assigned after Arrival / stores are ready. */
  let syncInAppReminderBanner = () => {};
  const inAppReminderBannerUI = new InAppReminderBannerUI(
    document.getElementById('ui-overlay'),
    {
      onDismiss: () => {
        inAppReminderBannerController.dismiss();
        syncInAppReminderBanner();
      }
    }
  );
  const reminderPreferenceUI = new ReminderPreferenceUI(
    weeklyPracticeHeatmap.getClusterEl(),
    {
      onPreferenceChange: () => {
        syncInAppReminderBanner();
      },
      onClose: () => {
        document.body.classList.remove('ft-narrow-stage-reminder');
      }
    }
  );
  const focusButton = document.getElementById('btn-focus');
  const reminderQuotaManager = new ReminderQuotaManager();
  const mindfulToast = new MindfulAcknowledgeToast(
    document.getElementById('ui-overlay')
  );
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
      if (type === 'refocus') lightProgression.playRecoverDisturbance();
    }
  });
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

  // Honesty Check-in：当日零完成 → Idle 闭目坐禅 + 可忽略补登提示（不开 Sleeping）
  let honestyGlowLevel = null;
  /** @type {HonestyBridgeCtaController | null} */
  let honestyBridge = null;
  /** @type {MicroRitualUI | null} */
  let microRitualUI = null;
  const now = () => new Date();
  const dailyCompletionStore = new DailyCompletionStore({ now });
  const focusSessionEndStore = new FocusSessionEndStore({ now });
  const practiceDaysStore = new PracticeDaysStore();
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
      honestyBridge?.onHonestyCheckInComplete();
      // onShown 亦会 sync；此处双保险，避免桥接挡住一分钟呼吸 / Honesty 入口
      syncHonestyIdleEntry();
      syncOnboardingAutoHints();
    },
    onPracticeDay: ({ durationMinutes } = {}) => {
      practiceDaysStore.markToday(durationMinutes);
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
  /** Wide ≥480 Idle declutter (Sit + ⚡ + ⋯); inert on narrow where NarrowIdleShell owns chrome. */
  const wideIdleMoreMenu = new WideIdleMoreMenu();
  window.__wideIdleMoreMenu = wideIdleMoreMenu;

  microRitualUI = new MicroRitualUI(document.getElementById('ui-overlay'), {
    onIdleEntryClick: () => {
      if (
        stateManager.state === STATES.FOCUSING ||
        stateManager.state === STATES.CELEBRATE ||
        arrivalPractice?.isOpen?.() ||
        reflectionMoment?.isOpen?.() ||
        microRitualUI?.isOpen?.()
      ) {
        return;
      }
      onboardingHints?.markSeen('micro-ritual');
      beginMicroRitualChrome();
      microRitualUI.startBreath(MICRO_RITUAL_MS);
    },
    onBreathStart: () => {
      lightProgression.beginBreath();
      emotionController.playEmotion('smiling', {
        fps: ARRIVAL_BREATH_SMILE_FPS
      });
      resyncSessionChrome();
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

  let hasEndedAnySession = false;

  function syncHonestyIdleEntry() {
    const bridgeVisible = honestyBridge?.isVisible?.() === true;
    companionModePicker.setHonestyBridgeActive(bridgeVisible);
    const blocked =
      arrivalPractice?.isOpen?.() ||
      bridgeVisible ||
      reflectionMoment?.isOpen?.() ||
      microRitualUI?.isOpen?.() ||
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE;
    if (blocked) {
      honestyCheckInUI.hideIdleEntry();
    } else {
      honestyCheckIn.syncIdleEntry();
    }
    syncMicroRitualIdleEntry();
    const honestyBusy =
      Boolean(honestyCheckInUI?.phase) && honestyCheckInUI.phase !== 'hidden';
    const overlayActive = computePostSessionOverlayActive(
      getPostSessionOverlaySources()
    );
    // Bridge can appear without a full resync — keep wide ⋯ suppressed with dock pills
    wideIdleMoreMenu.setSuppressed(
      overlayActive || honestyBusy || bridgeVisible
    );
  }

  function syncMicroRitualIdleEntry() {
    const honestyBusy =
      honestyCheckInUI.phase === 'duration' ||
      honestyCheckInUI.phase === 'breath' ||
      honestyCheckInUI.phase === 'thanks';
    const blocked =
      arrivalPractice?.isOpen?.() ||
      honestyBridge?.isVisible?.() ||
      reflectionMoment?.isOpen?.() ||
      microRitualUI?.isOpen?.() ||
      honestyBusy ||
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE;
    if (blocked) {
      microRitualUI?.hideIdleEntry();
      return;
    }
    microRitualUI?.showIdleEntry();
  }

  /** Arrival / 叠层 / 完成中门闩的唯一可变源（见 SessionUiGate） */
  const sessionUiGate = new SessionUiGate();
  if (import.meta.env.DEV) {
    window.__sessionUiGate = sessionUiGate;
  }

  /**
   * 叠层占用源（可扩展：追加 `() => otherOverlay.isOpen()` 即可，无需改聚合函数）。
   * Honesty 提示/时长**故意不列入**——仍允许点 hint 展开三选一（禁止「看得见却静默」）。
   * @returns {Array<() => boolean>}
   */
  function getPostSessionOverlaySources() {
    return [
      () => arrivalPractice.isOpen(),
      () => reflectionMoment.isOpen(),
      () => microRitualUI?.isOpen() === true
    ];
  }

  /**
   * 单一入口：按源聚合 overlay → Gate + Companion UI 投影；并禁用完成中选项。
   * 禁止 Reflection-only / Arrival-only 双路互相覆盖。
   */
  function resyncSessionChrome() {
    const overlayActive = computePostSessionOverlayActive(
      getPostSessionOverlaySources()
    );
    sessionUiGate.setPostSessionOverlayActive(overlayActive);
    companionModePicker.setPostSessionOverlayActive(overlayActive);
    companionModePicker.setOptionSelectEnabled(
      !overlayActive && !sessionUiGate.completionPending
    );
    companionModePicker.setArrivalActive(Boolean(arrivalPractice?.isOpen?.()));
    const focusing =
      stateManager.state === STATES.FOCUSING ||
      microRitualUI?.isOpen?.() === true;
    const honestyBusy =
      Boolean(honestyCheckInUI?.phase) && honestyCheckInUI.phase !== 'hidden';
    const bridgeVisible = honestyBridge?.isVisible?.() === true;
    const chromeSuppressed = overlayActive || honestyBusy || bridgeVisible;
    narrowIdleShell.setIdle(!focusing);
    narrowIdleShell.setSuppressed(chromeSuppressed);
    wideIdleMoreMenu.setIdle(!focusing);
    wideIdleMoreMenu.setSuppressed(chromeSuppressed);
    syncInAppReminderBanner();
  }

  /** 先点 Here & Now / Flow 再进 Arrival 时记住，结束后自动开表（禁止再逼点 Sit） */
  let pendingAutoStartMode = null;
  /** Choose 点头期间已开表则勿再展开 Companion */
  let suppressCompanionOpenAfterNod = false;
  /** 本轮 Arrival 是否完整走过 Choose（供鞠躬结束后自动开表判定） */
  let arrivalChoseThisRun = false;

  /** @param {boolean} ready */
  function syncArrivalGateReady(ready) {
    sessionUiGate.setArrivalGateReady(ready);
    companionModePicker.setArrivalReady(ready);
  }

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
    setFocusButtonEnabled(false);
    microRitualUI?.hideIdleEntry();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  }

  function endMicroRitualChrome() {
    lightProgression.endBreath({ releaseDolly: true });
    lightProgression.clearArrivalEffects();
    setFocusButtonEnabled(true);
    companionModePicker.setIdleChromeVisible(true);
    resyncSessionChrome();
    syncHonestyIdleEntry();
    syncOnboardingAutoHints();
  }

  function completeMicroRitual() {
    dailyCompletionStore.recordCompletion(MICRO_RITUAL_DURATION_MINUTES);
    practiceDaysStore.markToday(MICRO_RITUAL_DURATION_MINUTES);
    trackRetentionEvent(RETENTION_EVENTS.MICRO_RITUAL_COMPLETE, {
      durationMinutes: MICRO_RITUAL_DURATION_MINUTES
    });
    mindfulToast.show(t('micro_ritual.complete'), {
      placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
      visibleMs: 4_500
    });
    endMicroRitualChrome();
    emotionController.playEmotion('sessionComplete', {
      onComplete: () => {
        syncHonestyIdleEntry();
      }
    });
  }

  function leaveMicroRitualQuietly() {
    endMicroRitualChrome();
    emotionController.playEmotion('idle');
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
  };
  const reflectionOnDone = reflectionMoment.onDone;
  reflectionMoment.onDone = (result, hasAnyAnswer) => {
    reflectionOnDone?.(result, hasAnyAnswer);
    resyncSessionChrome();
    onboardingHints?.markSeen('reflection');
    hasEndedAnySession = true;
    // Rise 过渡播完后：回 Idle 闭目坐禅（零完成也不再落入 Sleeping）。
    const riseKey = emotionController.getCurrentEmotionKey();
    if (riseKey === 'riseStretchCasual' || riseKey === 'blinkBreathe') {
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
  // 挂 body：避免落在 pointer-events:none 的 ui-overlay 栈内，并压过调试栏
  const ambientSoundscapeUI = new AmbientSoundscapeUI(
    document.body,
    ambientSoundscape,
    {
      onPanelOpened: () => {
        onboardingHints?.maybeShowAuto('ambient-soundscape');
      },
      onTrackChosen: () => {
        onboardingHints?.markSeen('ambient-soundscape');
        onboardingHints?.hideBubble('ambient-soundscape');
      },
      onToggleMusic: () => {
        onboardingHints?.markSeen('ambient-soundscape');
        onboardingHints?.hideBubble('ambient-soundscape');
      }
    }
  );
  void ambientSoundscapeUI.bootDefaultMusic();

  wideIdleMoreMenu.setHandlers({
    onCompanion: () => {
      companionModePicker.open();
    },
    onClearCompanion: () => {
      companionModePicker.hide();
    },
    onReminder: () => {
      reminderPreferenceUI.openPanel();
    },
    onHonesty: () => {
      honestyCheckIn.openDurationChoices({ force: true });
    },
    onSound: () => {
      // Align with narrow drawer: open Soundscape panel, never FAB / gated tip.
      ambientSoundscapeUI.activateSoundFromNarrow();
    },
    onClearStage: () => {
      companionModePicker.hide();
      reminderPreferenceUI.closePanel();
      ambientSoundscapeUI.clearNarrowSoundStage();
    }
  });

  narrowIdleShell.setHandlers({
    onMute: async () => {
      await ambientSoundscapeUI.toggleMuteFromUi();
      narrowIdleShell.syncMuteVisual({
        musicOn: ambientSoundscapeUI.wantsMusicOn()
      });
    },
    onSound: () => {
      ambientSoundscapeUI.activateSoundFromNarrow();
    },
    onCompanion: () => {
      companionModePicker.open();
    },
    onReminder: () => {
      reminderPreferenceUI.openPanel();
    },
    onHonesty: () => {
      honestyCheckIn.openDurationChoices({ force: true });
    },
    onQuickStart: () => {
      const el = document.getElementById('quick-start-focus');
      if (!el || el.disabled || el.hidden) return;
      const prev = el.style.pointerEvents;
      el.style.pointerEvents = 'auto';
      el.click();
      el.style.pointerEvents = prev;
    },
    onClearStage: () => {
      companionModePicker.hide();
      reminderPreferenceUI.closePanel();
      ambientSoundscapeUI.clearNarrowSoundStage();
      document.body.classList.remove(
        'ft-wide-stage-sound',
        'ft-wide-stage-companion',
        'ft-wide-stage-reminder'
      );
    }
  });
  narrowIdleShell.syncMuteVisual({
    musicOn: ambientSoundscapeUI.wantsMusicOn()
  });

  /** @type {OnboardingHintsUI | null} */
  let onboardingHints = null;

  function getOnboardingScene() {
    const arrivalPhase = arrivalPractice?.getStep?.() ?? null;
    return {
      honestyVisible: honestyCheckInUI.phase === 'prompt',
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
      reflectionOpen: reflectionMoment?.isOpen?.() ?? false,
      ambientPanelOpen: ambientSoundscapeUI?.isPanelOpen?.() ?? false,
      isDormant: stateManager.state === STATES.DORMANT,
      arrivalReady: sessionUiGate.arrivalGateReady,
      hasEverCompletedSession: hasEndedAnySession,
      weeklyHeatmapVisible: weeklyPracticeHeatmap?.isVisible?.() === true,
      microRitualEntryVisible: microRitualUI?.isIdleEntryVisible?.() === true,
      quickStartVisible: (() => {
        const el = document.getElementById('quick-start-focus');
        return Boolean(el && !el.hidden && el.getClientRects().length > 0);
      })()
    };
  }

  function syncOnboardingAutoHints() {
    if (!onboardingHints) return;
    const ids = resolveAutoHintIds(getOnboardingScene());
    onboardingHints.syncVisibleAutos(ids);
    // 布局刚切换时 DOM 可能尚未量好，下一帧再贴一次锚点
    requestAnimationFrame(() => {
      onboardingHints?.repositionAll();
      onboardingHints?.syncDiscoveryDots();
    });
  }

  onboardingHints = new OnboardingHintsUI(document.body, {
    store: createHintsSeenStore(),
    getScene: getOnboardingScene
  });
  if (import.meta.env.DEV) {
    window.__onboardingHints = onboardingHints;
  }

  if (import.meta.env.DEV) {
    window.__reminderQuotaManager = reminderQuotaManager;
    window.__mindfulReminderController = mindfulReminderController;
    window.__attentionSignals = attentionSignals;
    window.__reflectionMoment = reflectionMoment;
    window.__dailyCompletionStore = dailyCompletionStore;
    window.__practiceDaysStore = practiceDaysStore;
    window.__honestyCheckIn = honestyCheckIn;
    window.__companionModePicker = companionModePicker;
    window.__acrossToolsIdleGuard = acrossToolsIdleGuard;
    window.__ambientSoundscape = ambientSoundscape;
    window.__ambientSoundscapeUI = ambientSoundscapeUI;
  }

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
          fps: ARRIVAL_BREATH_SMILE_FPS
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
        // 若仍定格在 dormantWake，playEmotion 会自动加长 cross-fade，避免硬切微笑。
        emotionController.playEmotion('smiling');
        syncOnboardingAutoHints();
      },
      onBegin: () => {
        lightProgression.beginArrival();
        syncOnboardingAutoHints();
      },
      // Choose 确认：立刻开门闩（Sit 可用）；点头播完后再展开 Companion，避免挡鞠躬。
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
              const mode = companionModePicker.getSelectedMode();
              if (
                shouldAutoStartFocusAfterArrivalNod({
                  chose: arrivalChoseThisRun,
                  storedMode: mode
                })
              ) {
                beginFocusWithMode(mode);
              } else {
                companionModePicker.open();
              }
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
        resyncSessionChrome();
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
        if (beginNow) {
          // 预选 Here & Now / Flow 后走完 Choose：开表并跳过「再点一次模式 / Sit」
          if (info.chose && resumeMode) {
            suppressCompanionOpenAfterNod = true;
          }
          beginFocusWithMode(resumeMode || companionModePicker.getSelectedMode());
        } else if (!info.chose) {
          companionModePicker.open();
        }
        syncOnboardingAutoHints();
      }
    }
  );
  if (import.meta.env.DEV) {
    window.__arrivalPractice = arrivalPractice;
    window.__lightProgression = lightProgression;
  }

  syncInAppReminderBanner = () => {
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
    if (decision.action === 'show') {
      inAppReminderBannerUI.show(
        decision.messageKey || REMINDER_GENTLE_WAITING_MESSAGE_KEY
      );
    } else if (inAppReminderBannerUI.isVisible()) {
      inAppReminderBannerUI.hide({ silent: true });
    }
  };

  if (import.meta.env.DEV) {
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
      banner: inAppReminderBannerUI
    };
  }

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
  if (import.meta.env.DEV) {
    window.__honestyBridge = honestyBridge;
    window.__honestyBridgeStore = honestyBridgeStore;
    window.__retentionFunnel = retentionFunnelStore;
  }

  function endFocusChrome() {
    attentionSignals.setEnabled(false);
    mindfulReminderController.stopSession();
    acrossToolsIdleGuard.stop();
    ambientSoundscape.endSession();
    ambientSoundscapeUI.setSessionActive(false);
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
    triggerSessionCompletionFeedback({
      hasCelebratedToday: dailyCompletionStore.hasCelebratedToday(),
      emotionController,
      startCelebrating: () => {
        dailyCompletionStore.markCelebratedToday();
        stateManager.setState(STATES.CELEBRATE);
      },
      onComplete: finishCompletedSession
    });
  }

  function beginFocusWithMode(companionMode) {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    microRitualUI?.hideIdleEntry();
    microRitualUI?.hide();
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
    sessionUiGate.clearArrivalGateForFocusStart();
    if (currentSessionIntention) {
      recordIntention(currentSessionIntention, {
        source: currentIntentionSource
      });
    }
    companionModePicker.setIdleChromeVisible(false);
    syncArrivalGateReady(false);
    focusSession.start({ companionMode });
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('companion-mode');
    onboardingHints?.markSeen('weekly-heatmap');
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
    beginFocusWithMode(mode);
  };

  /** ⚡ Quick Start：跳过 Arrival（若开着）并以记忆 Companion 模式立刻 Focusing */
  companionModeHandlers.onQuickStart = () => {
    if (sessionUiGate.completionPending) return;
    if (stateManager.state === STATES.FOCUSING) return;
    if (
      reflectionMoment?.isOpen?.() ||
      microRitualUI?.isOpen?.() ||
      honestyBridge?.isVisible?.()
    ) {
      return;
    }
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    companionModePicker.hide();
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('quick-start');
    if (arrivalPractice.isOpen()) {
      arrivalPractice.skipToBegin();
      return;
    }
    // Idle 且无 Arrival：直接开表（不走仪式）
    pendingChoose = null;
    currentSessionIntention = '';
    currentIntentionSource = 'typed';
    arrivalChoseThisRun = false;
    pendingAutoStartMode = null;
    suppressCompanionOpenAfterNod = false;
    syncArrivalGateReady(true);
    beginFocusWithMode(companionModePicker.getSelectedMode());
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
    if (!expanded) {
      document.body.classList.remove('ft-narrow-stage-companion');
    }
    if (expanded) {
      onboardingHints?.maybeShowAuto('companion-mode');
      requestAnimationFrame(() => onboardingHints?.repositionAll());
    }
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

      beginFocusWithMode(companionModePicker.getSelectedMode());
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
      syncArrivalGateReady(false);
      pendingChoose = null;
      pendingAutoStartMode = null;
      suppressCompanionOpenAfterNod = false;
      endFocusChrome();
      focusSession.stop();
      sessionUiGate.setCompletionPending(false);
      resyncSessionChrome();
      honestyGlowLevel = null;
      tigerCharacter.setFocusLevel(0);
      honestyBridge?.hide();
      honestyCheckIn.onIncompleteSessionEnded();
      companionModePicker.setIdleChromeVisible(true);
      // Rise：伸懒腰→随意坐姿正放一次，Reflection 期间定格箕坐；关面板后再回 idle。
      // MoodController 在 IDLE 时不覆盖 riseStretchCasual。
      emotionController.playEmotion('riseStretchCasual', { holdPose: true });
      sessionEndFlow.onSessionEnded({
        completed: false,
        intention: currentSessionIntention,
        intentionSource: currentIntentionSource
      });
      currentSessionIntention = '';
      currentIntentionSource = 'typed';
      onboardingHints?.markSeen('rise-button');
      onboardingHints?.markSeen('ambient-soundscape');
      hasEndedAnySession = true;
      syncOnboardingAutoHints();
    }
  );

  function finishCompletedSession() {
    if (!sessionUiGate.completionPending) return;
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
    onboardingHints?.markSeen('ambient-soundscape');
  }

  const moodController = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: finishCompletedSession
  });
  // StateManager 初始 IDLE 不会主动发 onChange；显式启动 observer baseline。
  moodController.handleStateChange(stateManager.state);

  // 须在 wrap showPrompt/hide 与 MoodController 接线之后，否则首屏 Honesty 无视觉
  honestyCheckIn.onAppReady();
  retentionFunnelStore.noteAppOpen();
  syncHonestyIdleEntry();
  syncOnboardingAutoHints();

  if (import.meta.env.DEV && !productChrome) {
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

  // DEV 实验室调试入口（生产构建与 ?product=1 均不出现）
  if (import.meta.env.DEV && !productChrome) {
    const clearHintsBtn = document.createElement('button');
    clearHintsBtn.type = 'button';
    clearHintsBtn.textContent = '清空引导提示已读';
    clearHintsBtn.style.cssText =
      'position:fixed;top:12px;right:180px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b2e2e;background:#fff8f0;color:#2c1f14;border-radius:4px;';
    clearHintsBtn.addEventListener('click', () => {
      onboardingHints?.clearSeen();
      onboardingHints?.hideBubble();
      syncOnboardingAutoHints();
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
      clearAllFocusTigerLocalState();
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
      clearAllFocusTigerLocalState();
      markDevBootIdle();
      window.location.reload();
    });
    document.body.appendChild(resetIdleBtn);
  }

  const uiControls = new UIControls(focusInput);
  uiControls.bindAll();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      beginSessionCompleteIfNeeded();
      honestyCheckIn.syncDormantState();
      syncInAppReminderBanner();
    }
  });

  syncInAppReminderBanner();

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    focusSession.tick(delta);
    mindfulReminderController.update(delta);

    const microOpen = microRitualUI?.isOpen() === true;
    const microElapsed = microOpen ? microRitualUI.getElapsedSeconds() : null;
    const microProgress = microOpen ? microRitualUI.getProgress() : null;

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
      treatAsFocusing: microOpen,
      liveElapsedSeconds: microElapsed,
      focusLevelOverride: microProgress
    });
    weeklyPracticeHeatmap.render({
      visible: stateManager.state === STATES.IDLE && !microOpen,
      days: practiceDaysStore.getLastNDays(WEEKLY_PRACTICE_HEATMAP_DAYS)
    });
    reminderPreferenceUI.setVisible(
      stateManager.state === STATES.IDLE && !microOpen
    );
    composer.render();
  }

  stateManager.onChange(() => {
    syncInAppReminderBanner();
  });

  animate();
}

init().catch((error) => {
  console.error('初始化失败:', error);
});
