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
  shouldBeginFocusOnArrivalReady,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS
} from './core/FocusSession.js';
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
import { HonestyBridgeStore } from './core/HonestyBridgeStore.js';
import { HonestyBridgeCtaController } from './core/HonestyBridgeCtaController.js';
import { HonestyBridgeCtaUI } from './ui/HonestyBridgeCtaUI.js';
import { CompanionModePicker } from './ui/CompanionModePicker.js';
import { ArrivalPracticeUI } from './ui/ArrivalPracticeUI.js';
import { recordIntention } from './core/SessionIntentionStore.js';
import { AcrossToolsIdleGuard } from './core/AcrossToolsIdleGuard.js';
import { AmbientSoundscapeController } from './audio/AmbientSoundscapeController.js';
import { AmbientSoundscapeUI } from './ui/AmbientSoundscapeUI.js';
import { createHintsSeenStore } from './core/OnboardingHintsStore.js';
import { OnboardingHintsUI } from './ui/OnboardingHintsUI.js';
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
  /** @type {HonestyBridgeCtaController | null} */
  let honestyBridge = null;
  const dailyCompletionStore = new DailyCompletionStore();
  const honestyBridgeStore = new HonestyBridgeStore();
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
    },
    onCheckInComplete: () => {
      honestyCheckInUI.hideIdleEntry();
      honestyBridge?.onHonestyCheckInComplete();
    }
  });

  /** 在 beginFocusWithMode 定义后填入 onModeSelected / onNeedArrival / onExpandedChange */
  const companionModeHandlers = {};
  const companionModePicker = new CompanionModePicker(
    document.getElementById('ui-overlay'),
    focusButton,
    companionModeHandlers
  );

  let hasEndedAnySession = false;

  function syncHonestyIdleEntry() {
    const blocked =
      arrivalPractice?.isOpen?.() ||
      honestyBridge?.isVisible?.() ||
      reflectionMoment?.isOpen?.() ||
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE;
    if (blocked) {
      honestyCheckInUI.hideIdleEntry();
      return;
    }
    honestyCheckIn.syncIdleEntry();
  }

  function syncCompanionPostSessionChrome() {
    // 仅 Reflection 挡住 hint；Honesty 提示期间仍允许点 hint → 启动 Arrival
    //（与 Sit 可点路径一致，禁止「看得见却静默」）。
    companionModePicker.setPostSessionOverlayActive(reflectionMoment.isOpen());
  }

  const reflectionOpen = reflectionMoment.open.bind(reflectionMoment);
  reflectionMoment.open = (options) => {
    companionModePicker.hide();
    honestyCheckInUI.hideIdleEntry();
    reflectionOpen(options);
    syncCompanionPostSessionChrome();
    // 关掉 Rise/Sound 等会话中提示，只留 Reflection（锚在面板上方）
    onboardingHints?.syncVisibleAutos(['reflection']);
    requestAnimationFrame(() => onboardingHints?.repositionAll());
  };
  const reflectionOnDone = reflectionMoment.onDone;
  reflectionMoment.onDone = (result, hasAnyAnswer) => {
    reflectionOnDone?.(result, hasAnyAnswer);
    syncCompanionPostSessionChrome();
    onboardingHints?.markSeen('reflection');
    hasEndedAnySession = true;
    // Rise 过渡播完后：若仍是当日零完成，收回到 Sleeping；否则回 Idle 呼吸。
    const riseKey = emotionController.getCurrentEmotionKey();
    if (riseKey === 'riseStretchCasual' || riseKey === 'blinkBreathe') {
      if (stateManager.state === STATES.DORMANT) {
        emotionController.playEmotion('sleeping');
      } else {
        emotionController.playEmotion('idle');
      }
    }
    syncOnboardingAutoHints();
    syncHonestyIdleEntry();
  };

  const honestyShowPrompt = honestyCheckInUI.showPrompt.bind(honestyCheckInUI);
  honestyCheckInUI.showPrompt = () => {
    companionModePicker.hide();
    honestyShowPrompt();
    syncCompanionPostSessionChrome();
    syncOnboardingAutoHints();
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
    ambientSoundscape,
    {
      onBlockedTip: () => {
        // 未计时点 Sound：本地 nudge（已改漫画气泡样式）展示 AMBIENT_REQUIRES_FOCUS；
        // 同时写入 hints-seen，避免「?」补救与自动提示重复抢戏。
        onboardingHints?.store?.markSeen?.('ambient-gated');
      },
      onPanelOpened: () => {
        onboardingHints?.maybeShowAuto('ambient-soundscape');
      },
      onTrackChosen: () => {
        onboardingHints?.markSeen('ambient-soundscape');
        onboardingHints?.hideBubble('ambient-soundscape');
      }
    }
  );

  /** @type {OnboardingHintsUI | null} */
  let onboardingHints = null;

  function getOnboardingScene() {
    const arrivalPhase = arrivalPractice?.getStep?.() ?? null;
    return {
      honestyVisible: honestyCheckInUI.phase === 'prompt',
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
      arrivalReady: arrivalGateReady,
      hasEverCompletedSession: hasEndedAnySession
    };
  }

  function syncOnboardingAutoHints() {
    if (!onboardingHints) return;
    const scene = getOnboardingScene();
    /** @type {string[]} */
    let ids = [];
    if (scene.reflectionOpen) {
      ids = ['reflection'];
    } else if (scene.isFocusing) {
      // Rise 锚在主按钮；Sound 锚在 FAB——两句可同时出现（文档各有独立 hintId）
      ids = ['rise-button', 'ambient-soundscape'];
    } else if (scene.ambientPanelOpen) {
      ids = ['ambient-soundscape'];
    } else if (scene.arrivalOpen) {
      const step = arrivalPractice.getStep();
      if (step === 'breath') ids = ['breathing'];
      else if (step === 'choose') ids = ['choose'];
      else ids = ['notice'];
    } else if (scene.companionExpanded) {
      ids = ['companion-mode'];
    } else if (scene.honestyVisible) {
      ids = ['honesty-optional'];
    } else if (scene.isDormant) {
      ids = ['dormant-open'];
    } else if (scene.hasEverCompletedSession) {
      ids = ['idle-after-session', 'help-affordance'];
    } else {
      ids = ['sit-button', 'how-shall-we-sit', 'help-affordance'];
    }
    onboardingHints.syncVisibleAutos(ids);
    // 布局刚切换时 DOM 可能尚未量好，下一帧再贴一次锚点
    requestAnimationFrame(() => onboardingHints?.repositionAll());
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
              stateManager.state !== STATES.FOCUSING &&
              arrivalGateReady &&
              !completionPending
            ) {
              companionModePicker.open();
            }
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
        arrivalGateReady = true;
        companionModePicker.setArrivalReady(true);
        companionModePicker.setPostSessionOverlayActive(false);
        onboardingHints?.markSeen('notice');
        onboardingHints?.markSeen('breathing');
        onboardingHints?.markSeen('choose');
        onboardingHints?.markSeen('how-shall-we-sit');
        onboardingHints?.markSeen('sit-button');
        onboardingHints?.markSeen('dormant-open');
        onboardingHints?.markSeen('honesty-optional');
        // Skip — begin / Sit 整体跳过 =「直接开始」：用记忆模式立刻计时 → Rise。
        // Choose 确认：只开门闩；面板改在 intentionSet 播完后展开（见上）。
        if (shouldBeginFocusOnArrivalReady(info)) {
          beginFocusWithMode(companionModePicker.getSelectedMode());
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

  /**
   * 与 Sit / hint 门闩未就绪路径相同：完整 Arrival，不跳过、不开计时、不开 Ambient。
   */
  function startArrivalPracticeFromChrome() {
    sessionEndFlow.cancelPending();
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
    companionModePicker.setArrivalReady(false);
    companionModePicker.setPostSessionOverlayActive(true);
    companionModePicker.hide();
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('dormant-open');
    onboardingHints?.markSeen('honesty-optional');
    arrivalPractice.start();
    syncOnboardingAutoHints();
  }

  const honestyBridgeUI = new HonestyBridgeCtaUI(
    document.getElementById('ui-overlay')
  );
  honestyBridge = new HonestyBridgeCtaController({
    store: honestyBridgeStore,
    ui: honestyBridgeUI,
    onAccept: () => {
      if (completionPending) return;
      if (stateManager.state === STATES.FOCUSING) return;
      if (arrivalPractice.isOpen()) return;
      honestyCheckInUI.hideIdleEntry();
      startArrivalPracticeFromChrome();
    },
    onDecline: () => {
      emotionController.playEmotion('idle');
      syncHonestyIdleEntry();
    }
  });
  if (import.meta.env.DEV) {
    window.__honestyBridge = honestyBridge;
    window.__honestyBridgeStore = honestyBridgeStore;
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
    honestyBridge?.hide();
    honestyCheckInUI.hide();
    honestyCheckInUI.hideIdleEntry();
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
    onboardingHints?.markSeen('sit-button');
    onboardingHints?.markSeen('how-shall-we-sit');
    onboardingHints?.markSeen('companion-mode');
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
    completionPending = false;
    // 自动开计时路径须同步主按钮 → Rise（事件触发时 focusInput 已初始化）
    focusInput.beginFocusing(focusButton);
  }

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

  companionModeHandlers.onExpandedChange = (expanded) => {
    if (expanded) {
      onboardingHints?.maybeShowAuto('companion-mode');
      requestAnimationFrame(() => onboardingHints?.repositionAll());
    }
    syncOnboardingAutoHints();
  };

  /** hint 在门闩未就绪时启动 Arrival，禁止「点了没反应」 */
  companionModeHandlers.onNeedArrival = () => {
    if (completionPending) return;
    if (stateManager.state === STATES.FOCUSING) return;
    if (arrivalPractice.isOpen()) return;
    startArrivalPracticeFromChrome();
  };

  const focusInput = new FocusInput(
    () => {
      if (completionPending) return false;
      sessionEndFlow.cancelPending();
      honestyBridge?.hide();
      honestyCheckInUI.hide();

      if (arrivalPractice.isOpen()) {
        arrivalPractice.skipToBegin();
        return false;
      }

      if (!arrivalGateReady) {
        startArrivalPracticeFromChrome();
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
      honestyBridge?.hide();
      honestyCheckIn.onIncompleteSessionEnded();
      companionModePicker.setIdleChromeVisible(true);
      // Rise：伸懒腰→随意坐姿 pingpong（倒放回闭目首帧可衔接 idle），再进 Reflection。
      // MoodController 在 IDLE 时不覆盖 riseStretchCasual；DORMANT 睡态在其后再写也不抢本过渡。
      emotionController.playEmotion('riseStretchCasual');
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
    onboardingHints?.markSeen('rise-button');
    onboardingHints?.markSeen('ambient-soundscape');
  }

  const moodController = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: finishCompletedSession
  });
  // StateManager 初始 IDLE 不会主动发 onChange；显式启动 observer baseline。
  moodController.handleStateChange(stateManager.state);

  // 须在 wrap showPrompt/hide 与 MoodController 接线之后，否则首屏 Honesty / DORMANT 无视觉
  honestyCheckIn.onAppReady();
  syncOnboardingAutoHints();

  if (!productChrome) {
    const clearHintsBtn = document.createElement('button');
    clearHintsBtn.type = 'button';
    clearHintsBtn.textContent = '清空引导提示已读';
    clearHintsBtn.style.cssText =
      'position:fixed;top:12px;right:180px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b2e2e;background:#fff8f0;color:#2c1f14;border-radius:4px;';
    clearHintsBtn.addEventListener('click', () => {
      onboardingHints?.clearSeen();
      syncOnboardingAutoHints();
    });
    document.body.appendChild(clearHintsBtn);
  }

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
