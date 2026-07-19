// 入口文件：只做"拼装 + 主循环调度"，不允许直接创建 THREE.Scene() /
// THREE.PerspectiveCamera() / THREE.WebGLRenderer() 等底层对象——
// 这些必须封装在 core/Renderer.js 和 core/Scene.js 里，main.js 只负责调用。

import * as THREE from 'three';
import { createRenderer, setupSceneEnvironment } from './core/Renderer.js';
import { createScene } from './core/Scene.js';
import { createPostProcessing } from './core/PostProcessing.js';
import {
  FocusSession,
  shouldSuppressAwayReminders,
  canBeginFocusOnCompanionModeSelect,
  COMPANION_MODE_ACROSS_TOOLS
} from './core/FocusSession.js';
import { StateManager, STATES } from './core/StateManager.js';
import { TigerCharacter } from './character/TigerCharacter.js';
import { PoseManager } from './character/PoseManager.js';
import { MoodController } from './core/MoodController.js';
import { EmotionController } from './core/EmotionController.js';
import { FocusVisualizer } from './feedback/FocusVisualizer.js';
import { TransitionFX } from './feedback/TransitionFX.js';
import { Ambience } from './feedback/Ambience.js';
import { FocusInput } from './input/FocusInput.js';
import { UIControls } from './input/UIControls.js';
import { FocusHUD } from './ui/FocusHUD.js';
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
import { MindfulAcknowledgeToast } from './ui/MindfulAcknowledgeToast.js';
import { TigerReflectionMoment } from './ui/TigerReflectionMoment.js';
import { SessionEndFlow } from './core/SessionEndFlow.js';
import { DailyCompletionStore } from './core/DailyCompletionStore.js';
import { triggerSessionCompletionFeedback } from './core/session-completion-feedback.js';
import { HonestyCheckInController } from './core/HonestyCheckInController.js';
import { HonestyCheckInUI } from './ui/HonestyCheckInUI.js';
import { CompanionModePicker } from './ui/CompanionModePicker.js';
import { ArrivalPracticeUI } from './ui/ArrivalPracticeUI.js';
import { recordIntention } from './core/SessionIntentionStore.js';
import { AcrossToolsIdleGuard } from './core/AcrossToolsIdleGuard.js';
import { AmbientSoundscapeController } from './audio/AmbientSoundscapeController.js';
import { AmbientSoundscapeUI } from './ui/AmbientSoundscapeUI.js';

const DEMO_SESSION_MINUTES = 1;
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
    // EyeTracking 实时瞳孔跟随已废弃（见 CORE_LOOP.md）；gaze 张望走 IdleOrchestrator。
    eyeTracking: null,
    spritePlayer,
    idleOrchestrator
  });
  emotionController.createDebugUI(document.body);

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

  // Honesty Check-in / DORMANT：当日零完成 → 打瞌睡 + 可忽略补登提示
  let honestyGlowLevel = null;
  const dailyCompletionStore = new DailyCompletionStore();
  const honestyCheckInUI = new HonestyCheckInUI(
    document.getElementById('ui-overlay')
  );
  const honestyCheckIn = new HonestyCheckInController({
    store: dailyCompletionStore,
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
    }
  });

  /** 在 beginFocusWithMode 定义后填入 onModeSelected / onNeedArrival */
  const companionModeHandlers = {};
  const companionModePicker = new CompanionModePicker(
    document.getElementById('ui-overlay'),
    focusButton,
    companionModeHandlers
  );

  function syncCompanionPostSessionChrome() {
    // 仅 Reflection 挡住 hint；Honesty 提示期间仍允许点 hint → 启动 Arrival
    //（与 Sit 可点路径一致，禁止「看得见却静默」）。
    companionModePicker.setPostSessionOverlayActive(reflectionMoment.isOpen());
  }

  const reflectionOpen = reflectionMoment.open.bind(reflectionMoment);
  reflectionMoment.open = (options) => {
    companionModePicker.hide();
    reflectionOpen(options);
    syncCompanionPostSessionChrome();
  };
  const reflectionOnDone = reflectionMoment.onDone;
  reflectionMoment.onDone = (result, hasAnyAnswer) => {
    reflectionOnDone?.(result, hasAnyAnswer);
    syncCompanionPostSessionChrome();
  };

  const honestyShowPrompt = honestyCheckInUI.showPrompt.bind(honestyCheckInUI);
  honestyCheckInUI.showPrompt = () => {
    companionModePicker.hide();
    honestyShowPrompt();
    syncCompanionPostSessionChrome();
  };
  const honestyShowDuration = honestyCheckInUI.showDurationChoices.bind(
    honestyCheckInUI
  );
  honestyCheckInUI.showDurationChoices = () => {
    companionModePicker.hide();
    honestyShowDuration();
    syncCompanionPostSessionChrome();
  };
  const honestyHide = honestyCheckInUI.hide.bind(honestyCheckInUI);
  honestyCheckInUI.hide = () => {
    honestyHide();
    syncCompanionPostSessionChrome();
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
    ambientSoundscape
  );

  if (import.meta.env.DEV) {
    window.__reminderQuotaManager = reminderQuotaManager;
    window.__mindfulReminderController = mindfulReminderController;
    window.__attentionSignals = attentionSignals;
    window.__reflectionMoment = reflectionMoment;
    window.__dailyCompletionStore = dailyCompletionStore;
    window.__honestyCheckIn = honestyCheckIn;
    window.__companionModePicker = companionModePicker;
    window.__acrossToolsIdleGuard = acrossToolsIdleGuard;
    window.__ambientSoundscape = ambientSoundscape;
    window.__ambientSoundscapeUI = ambientSoundscapeUI;
  }

  let completionPending = false;
  /** Arrival Practice 完成后才允许 Sit 真正开计时 */
  let arrivalGateReady = false;
  /** @type {{ text: string, source: 'icon' | 'typed' } | null} */
  let pendingChoose = null;
  /** @type {string} 本次会话 Choose 内容；达标与未达标结束均回显 */
  let currentSessionIntention = '';
  /** @type {'icon' | 'typed'} */
  let currentIntentionSource = 'typed';

  const arrivalPractice = new ArrivalPracticeUI(
    document.getElementById('ui-overlay'),
    {
      onBegin: () => lightProgression.beginArrival(),
      onWelcome: () => {
        emotionController.playEmotion('smiling');
      },
      onNoticeSelected: () => lightProgression.onNoticeSelected(),
      onBreath: () => lightProgression.beginBreath(),
      onAfterBreath: () => lightProgression.endBreath(),
      onChooseConfirmed: () => lightProgression.onChooseConfirmed(),
      // 合十动作与坐垫 CSS 光晕叠加；跳过 Choose 时不播。
      onIntentionSetPlay: (done) => {
        emotionController.playEmotion('intentionSet', {
          onComplete: () => done?.()
        });
      },
      onClearLight: () => lightProgression.clearArrivalEffects(),
      onReady: () => {
        pendingChoose = arrivalPractice.getChooseResult();
        arrivalGateReady = true;
        companionModePicker.setArrivalReady(true);
        companionModePicker.setPostSessionOverlayActive(false);
        companionModePicker.open();
      }
    }
  );
  if (import.meta.env.DEV) {
    window.__arrivalPractice = arrivalPractice;
    window.__lightProgression = lightProgression;
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
      completionPending ||
      stateManager.state !== STATES.FOCUSING ||
      !focusSession.hasReachedTarget()
    ) {
      return;
    }

    completionPending = true;
    endFocusChrome();
    focusSession.pause();
    // 本次记账发生在反馈播完后，因此这里读取的是“完成本次之前”的自然日状态。
    // 当日首次只播 Celebrating；同日后续只播 SessionComplete，二者不叠加。
    triggerSessionCompletionFeedback({
      hasCompletedToday: dailyCompletionStore.hasCompletedToday(),
      emotionController,
      startCelebrating: () => stateManager.setState(STATES.CELEBRATE),
      onComplete: finishCompletedSession
    });
  }

  function beginFocusWithMode(companionMode) {
    sessionEndFlow.cancelPending();
    honestyCheckInUI.hide();
    honestyGlowLevel = null;
    currentSessionIntention = pendingChoose?.text ?? '';
    currentIntentionSource = pendingChoose?.source === 'icon' ? 'icon' : 'typed';
    pendingChoose = null;
    arrivalGateReady = false;
    if (currentSessionIntention) {
      recordIntention(currentSessionIntention, {
        source: currentIntentionSource
      });
    }
    companionModePicker.setIdleChromeVisible(false);
    companionModePicker.setArrivalReady(false);
    focusSession.start({ companionMode });
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
    completionPending = false;
    // 自动开计时路径须同步主按钮 → Rise（事件触发时 focusInput 已初始化）
    focusInput.beginFocusing(focusButton);
  }

  companionModeHandlers.onModeSelected = (mode) => {
    if (
      !canBeginFocusOnCompanionModeSelect({
        mode,
        arrivalGateReady,
        completionPending,
        arrivalOpen: arrivalPractice.isOpen(),
        isFocusing: stateManager.state === STATES.FOCUSING
      })
    ) {
      return;
    }
    beginFocusWithMode(mode);
  };

  /** hint 在门闩未就绪时启动 Arrival，禁止「点了没反应」 */
  companionModeHandlers.onNeedArrival = () => {
    if (completionPending) return;
    if (stateManager.state === STATES.FOCUSING) return;
    if (arrivalPractice.isOpen()) return;
    sessionEndFlow.cancelPending();
    honestyCheckInUI.hide();
    companionModePicker.setArrivalReady(false);
    companionModePicker.setPostSessionOverlayActive(true);
    companionModePicker.hide();
    arrivalPractice.start();
  };

  const focusInput = new FocusInput(
    () => {
      if (completionPending) return false;
      sessionEndFlow.cancelPending();
      honestyCheckInUI.hide();

      if (arrivalPractice.isOpen()) {
        arrivalPractice.skipToBegin();
        return false;
      }

      if (!arrivalGateReady) {
        companionModePicker.setArrivalReady(false);
        companionModePicker.setPostSessionOverlayActive(true);
        companionModePicker.hide();
        arrivalPractice.start();
        return false;
      }

      beginFocusWithMode(companionModePicker.getSelectedMode());
      return true;
    },
    () => {
      companionModePicker.hide();
      arrivalPractice.hide();
      arrivalGateReady = false;
      companionModePicker.setArrivalReady(false);
      pendingChoose = null;
      endFocusChrome();
      focusSession.stop();
      completionPending = false;
      honestyGlowLevel = null;
      tigerCharacter.setFocusLevel(0);
      honestyCheckIn.onIncompleteSessionEnded();
      companionModePicker.setIdleChromeVisible(true);
      sessionEndFlow.onSessionEnded({
        completed: false,
        intention: currentSessionIntention,
        intentionSource: currentIntentionSource
      });
      currentSessionIntention = '';
      currentIntentionSource = 'typed';
    }
  );

  function finishCompletedSession() {
    if (!completionPending) return;
    focusSession.stop();
    honestyCheckIn.onTimedSessionCompleted(focusSession.targetMinutes);
    stateManager.setState(STATES.IDLE);
    honestyGlowLevel = null;
    tigerCharacter.setFocusLevel(0);
    focusInput.resetButton(focusButton);
    completionPending = false;
    companionModePicker.setIdleChromeVisible(true);
    sessionEndFlow.onSessionEnded({
      completed: true,
      intention: currentSessionIntention,
      intentionSource: currentIntentionSource
    });
    currentSessionIntention = '';
    currentIntentionSource = 'typed';
  }

  const moodController = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: finishCompletedSession
  });
  // StateManager 初始 IDLE 不会主动发 onChange；显式启动 observer baseline。
  moodController.handleStateChange(stateManager.state);

  // 须在 wrap showPrompt/hide 与 MoodController 接线之后，否则首屏 Honesty / DORMANT 无视觉
  honestyCheckIn.onAppReady();

  const uiControls = new UIControls(focusInput);
  uiControls.bindAll();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      beginSessionCompleteIfNeeded();
    }
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    focusSession.tick(delta);
    mindfulReminderController.update(delta);

    const focusLevel =
      honestyGlowLevel != null && stateManager.state !== STATES.FOCUSING
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

    focusHUD.render(focusSession, stateManager);
    composer.render();
  }

  animate();
}

init().catch((error) => {
  console.error('初始化失败:', error);
});
