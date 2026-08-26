/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
import {
  createSessionChromeSync,
  isHonestyPhaseBusy,
  isHonestyUiBusy
} from './core/sessionChromeSync.js';
import {
  buildOverlaySnapshot,
  deriveTeaBubbleBusyTarget,
  deriveReminderBusySessionTarget,
  deriveFocusAwarenessCardBusy,
  canAttemptFirstCard
} from './core/overlaySlotArbitration.js';
import { OVERLAY_SOURCES } from './core/overlaySlotContractRegistry.js';
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
import {
  needsDocumentPictureInPictureProbe,
  probeDocumentPictureInPicture
} from './core/immersivePresenceSupport.js';
import { IdleCompanionPipUI } from './ui/IdleCompanionPipUI.js';
import { createIdleChromeFacade } from './core/createIdleChromeFacade.js';
import {
  WeeklyPracticeHeatmap,
  WEEKLY_PRACTICE_HEATMAP_DAYS
} from './ui/WeeklyPracticeHeatmap.js';
import { ReminderPreferenceUI } from './ui/ReminderPreferenceUI.js';
import { InAppReminderBannerUI } from './ui/InAppReminderBannerUI.js';
import { SoftUpdatePromptUI } from './ui/SoftUpdatePromptUI.js';
import {
  InAppReminderBannerController
} from './core/InAppReminderBannerController.js';
import {
  isUpdateAvailable,
  parseVersionManifest,
  readForceUpdatePromptFlag,
  shouldRevealSoftUpdatePrompt,
  LOCAL_APP_BUILD_ID
} from './core/appVersionCheck.js';
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
import { FocusCoinsPanelUI } from './ui/FocusCoinsPanelUI.js';
import { MomentWhisperUI } from './ui/MomentWhisperUI.js';
import { ContextualTeaTipBubbleUI } from './ui/ContextualTeaTipBubbleUI.js';
import {
  resolveFiveMomentAction,
  shouldOfferFiveMomentsCompassFirstCard
} from './core/fiveMomentsCompassGate.js';
import {
  hasSeenWellnessDisclaimer,
  markWellnessDisclaimerSeen,
  shouldOfferWellnessDisclaimerFirstCard
} from './core/wellnessDisclaimerGate.js';
import {
  appendJourneyLogEntry,
  microRitualJourneyDraft,
  resolveJourneyMinutes
} from './core/journeyLogGate.js';
import { appendArrivalNoticeSignal } from './core/presenceSignalsGate.js';
import {
  appendRitualChipPresenceSignals,
  consumeRitualLeaveRetrospective
} from './core/ritualPresenceBridge.js';
import {
  markPresenceSignalsDisclosureSeen,
  shouldShowPresenceSignalsDisclosure
} from './core/presenceSignalsDisclosureGate.js';
import {
  hasOpenedInsightSparkToday
} from './core/dailyZenQuote.js';
import {
  schedulePracticeBackupUpload,
  flushPracticeBackupUpload,
  maybeRestorePracticeBackupOnBoot,
  setPracticeBackupBusyProbe,
  PRACTICE_BACKUP_IDLE_FLUSH_MS,
  PRACTICE_BACKUP_BOOT_RESTORE_MS
} from './core/practiceBackup/practiceBackupSync.js';
import {
  scheduleYpePersonalizationIngest,
  flushYpePersonalizationIngest,
  flushYpePersonalizationDelete,
  setYpePersonalizationBusyProbe,
  YPE_PERSONALIZATION_IDLE_FLUSH_MS
} from './core/ypePersonalizationSync.js';
import { DailyZenQuoteCardUI } from './ui/DailyZenQuoteCardUI.js';
import { MustardSeedSealCardUI } from './ui/MustardSeedSealCardUI.js';
import {
  MUSTARD_SEED_SEAL_CASES,
  resolveMustardSeedSeal,
  shouldOfferMustardSeedSealAfterCeremony,
  clearMustardSeedSealState
} from './core/mustardSeedSeal.js';
import { DigitalWallpapersCardUI } from './ui/DigitalWallpapersCardUI.js';
import { SanctuaryUnlockUI, bootSanctuaryReturnConfirm } from './ui/SanctuaryUnlockUI.js';
import { MembershipUnlockUI } from './ui/MembershipUnlockUI.js';
import { bootMembershipReturnConfirm } from './core/membershipCheckout.js';
import { bootProReturnConfirm } from './core/proCheckout.js';
import { bootCompanionAddonReturnConfirm } from './core/companionAddonCheckout.js';
import { bootSeasonalThemeChrome } from './core/seasonal/bootSeasonalThemeChrome.js';
import { TipJarUI } from './ui/TipJarUI.js';
import { TipKindnessBadgesChrome } from './ui/TipKindnessBadgesChrome.js';
import { SanctuaryEnsoMarkChrome } from './ui/SanctuaryEnsoMarkChrome.js';
import { SupportYinModalUI } from './ui/SupportYinModalUI.js';
import { shouldLeadSupportModalWithTea } from './core/supportModalLead.js';
import { ActiveRecoverAnchorUI } from './ui/ActiveRecoverAnchorUI.js';
import { IdleYinTapAnchorUI } from './ui/IdleYinTapAnchorUI.js';
import {
  IDLE_YIN_TAP_EMOTION_KEY,
  canPlayIdleYinTap,
  wrapPlayEmotionWithIdleYinTapSync
} from './core/idleYinTapGate.js';
import { NewsletterCaptureUI } from './ui/NewsletterCaptureUI.js';
import { ConfideToYinUI } from './ui/ConfideToYinUI.js';
import { YinPersonalMemoryUI } from './ui/YinPersonalMemoryUI.js';
import { ConfideEarChromeUI } from './ui/ConfideEarChromeUI.js';
import { canOpenConfidePanel } from './core/confide/confideUserVisibilityGate.js';
import { CONFIDE_ROUTE } from './core/confide/confideRoutes.js';
import { consumeTipReturnQuery } from './core/tipJarGate.js';
import { getMonetizationFunnelStore } from './core/monetizationIntentFunnel.js';
import {
  formatMonetizationFunnelOptInSummary,
  flushMonetizationFunnelUpload,
  scheduleMonetizationFunnelUploadAfterRecord
} from './core/monetizationFunnelUpload.js';
import {
  isMonetizationFunnelOptInEnabled,
  setMonetizationFunnelOptIn
} from './core/monetizationFunnelOptIn.js';
import {
  emotionKeyForPaymentThanks,
  peekCheckoutReturnThanksKind,
  resolveCheckoutReturnWelcomeGate
} from './core/paymentCheckoutThanks.js';
import { openCommunityExternalLink } from './core/communityLink.js';
import {
  setNewsletterProvider
} from './core/newsletter/newsletterProvider.js';
import {
  createMockNewsletterProvider
} from './core/newsletter/mockNewsletterProvider.js';
import { createWorkerNewsletterProvider } from './core/newsletter/workerNewsletterProvider.js';
import { ReminderQuotaManager } from './core/ReminderQuotaManager.js';
import {
  MindfulReminderController,
  ACTIVE_RECOVER_COOLDOWN_MS
} from './core/MindfulReminderController.js';
import { AttentionSignals } from './input/AttentionSignals.js';
import { bindDesktopShellAttention } from './core/desktopShell.js';
import { bindElectronIdleContextMenu } from './core/electronIdleContextMenu.js';
import {
  canRegisterDesktopCompanionGeneration,
  getDesktopCompanionBridge,
  hasDesktopCompanionBridge
} from './core/desktopCompanionGate.js';
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
import { applyQaPracticeSeedFromSearch } from './core/qaPracticeSeed.js';
import { LotusPondStore } from './core/LotusPondStore.js';
import { GRANT_KIND } from './core/focusCoinsLedger.js';
import { FocusCoinsStore } from './core/focusCoinsStore.js';
import {
  applyFocusCoinsGrant,
  applyBreathPracticeFocusCoinsGrant,
  maybeResetFocusCoinsSession
} from './core/focusCoinsAward.js';
import {
  applyFocusCoinsRedeem,
  applyFocusCoinsEquipTitle,
  buildFocusCoinRedeemContext
} from './core/focusCoinsRedeem.js';
import { applyFocusCoinsCosmetics } from './core/focusCoinsCosmetics.js';
import { isFocusCoinsAwardEnabled } from './core/focusCoinsAwardGate.js';
import {
  COLLECTIONS_WAVE_HELLO_EMOTION_KEY,
  evaluateCollectionsWaveHelloPlay
} from './core/collectionsWaveHelloGate.js';
import { applyQaLotusPondSeedFromSearch } from './core/qaLotusPondSeed.js';
import { LotusPondRuntime } from './ui/LotusPondRuntime.js';
import { triggerSessionCompletionFeedback } from './core/session-completion-feedback.js';
import {
  SCENE_ANIM_EVENTS,
  markLocaleGreetingPlayed,
  playOptionsForLocaleGreeting,
  readDailySceneAnimState,
  resolveSceneAnimation,
  pickRiseInterruptEmotion,
  isRiseInterruptHoldEmotion,
  LATE_NIGHT_FORCE_DORMANT_KEY
} from './core/sceneAnimationDispatcher.js';
import { isLateNightHour } from './core/lateNightHour.js';
import {
  SPRITE_OCCUPANCY,
  SPRITE_SOURCES,
  arbitrateSpriteChannel,
  dormantDeltaFromDecision,
  resolveBootSpriteOccupancy,
  resolveSessionEndSpriteOccupancy,
  resolveVisibilitySpriteOccupancy
} from './core/spriteChannelArbitration.js';
import {
  isLateNightCloakHoldEmotion,
  resolveForegroundReturnAction,
  resolveSessionEndHoldEmotion,
  FOREGROUND_RETURN_ACTIONS
} from './core/companionRestPolicy.js';
import { getLocalDateKey } from './utils/localDate.js';
import {
  getTasteLayerStatus,
  prefetchTasteLayer,
  resetTasteLayerSyncForTests
} from './core/tasteLayerSync.js';
import { resetTasteLayerOverlayForTests } from './core/tasteLayerOverlay.js';
import { resolveWellnessDayBand } from './character/cloakVariant.js';
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
import { createCloudEntitlementProvider } from './core/entitlement/cloudEntitlementProvider.js';
import { getCloudApiBaseUrl } from './core/cloudApiClient.js';
import { parseEntitlementMockSearch } from './core/entitlement/mockEntitlementProvider.js';
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
  DEFAULT_AMBIENT_TRACK_ID,
  AMBIENT_DUCK_FADE_MS
} from './audio/AmbientSoundscapeController.js';
import { parseAmbientAuditionMs } from './audio/ambientAudition.js';
import { SessionCueController } from './audio/SessionCueController.js';
import { AmbientSoundscapeUI } from './ui/AmbientSoundscapeUI.js';
import { FocusAwarenessCardUI } from './ui/FocusAwarenessCardUI.js';
import {
  createHintsSeenStore,
  resolveAutoHintIds
} from './core/OnboardingHintsStore.js';
import { isClickTriggerHint } from './core/onboardingHintRegistry.js';
import { OnboardingHintsUI } from './ui/OnboardingHintsUI.js';
import { createIdleSecondaryPanelCoordinator } from './ui/idleSecondaryPanels.js';
/** 有 `?sessionMinutes=` → 其值（e2e 可 1）；否则偏好 / 10。开表前无 URL 时再出时长 chip。 */
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
  // Taste overlay: do NOT fetch here — races `spritePlayer.preload()` and
  // Arrival/Honesty 1s CapCut (RB-20260820-L330). Kick after sprites + welcome/idle.

  // PWA: network-only SW in production only (no Cache Storage).
  // Electron Step A: never register — custom protocol + extraResources.
  void registerServiceWorker({
    isDesktop: Boolean(globalThis.desktopShell?.isDesktop)
  });

  // i18n：静态 HTML 已是默认语言（en）；此处接管标题/遮罩并跟随语言切换刷新
  document.title = t('APP_TITLE');
  const loadingMask = document.getElementById('loading-mask');
  if (loadingMask) loadingMask.textContent = t('LOADING');
  /** Late-bound so locale change can wait for Arrival/Honesty chrome. */
  let prefetchTasteLayerForLocale = () => {};
  onLocaleChange(() => {
    document.title = t('APP_TITLE');
    const mask = document.getElementById('loading-mask');
    if (mask) mask.textContent = t('LOADING');
    prefetchTasteLayerForLocale();
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

  // Keep Loading mask until 2D sprite paints. Early hide used to flash the
  // dark 3D `#poster` (small black Yin) before colorful Idle.
  poseManager.setCanvasHidden(true);
  {
    const poster = document.getElementById('poster');
    if (poster) {
      poster.style.transition = 'none';
      poster.style.opacity = '0';
      poster.remove();
    }
  }
  // Loading mask stays until welcome/idle boot below.

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
  prefetchTasteLayerForLocale = () => {
    void prefetchTasteLayer({
      search: location.search,
      locale: getLocale(),
      canApply: () => !isSceneAnimOverlayBusy()
    });
  };

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
    // Occupancy / overlay / 2h 由仲裁层决定，不在此硬 forceDormant。
    if (decision.emotionKey === LATE_NIGHT_FORCE_DORMANT_KEY) {
      applySpriteChannelDecision(
        arbitrateSpriteChannel({
          intent: SPRITE_OCCUPANCY.DORMANT_ENTER,
          source: SPRITE_SOURCES.LATE_NIGHT_IDLE,
          context: {
            sessionState: stateManager.state,
            overlayBusy: isSceneAnimOverlayBusy(),
            occupancy: spriteOccupancy,
            now: new Date()
          }
        })
      );
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
    PoseManager.setLoadingMaskVisible(false);
    window.__posterCaptureReady = true;
    window.__posterDataUrl = canvas.toDataURL('image/png');
    return;
  }

  revealScene({ showCanvas: false });
  // Canvas already force-hidden above; keep the latch for setPose transitions.
  poseManager.setCanvasHidden(true);

  // Entitlement provider: cloud when API base set; mock for lab / ?entitlementMock=.
  {
    const mockOverride = parseEntitlementMockSearch(location.search);
    if (mockOverride || !getCloudApiBaseUrl()) {
      setEntitlementProvider(
        createMockEntitlementProvider({ search: location.search })
      );
    } else {
      setEntitlementProvider(createCloudEntitlementProvider());
    }
  }
  void refreshEntitlement();

  // Stay in touch — Worker + Resend when cloud API is configured; mock in labs.
  {
    const forceMock = /(?:^|[?&])newsletterMock=1(?:&|$)/.test(
      location.search || ''
    );
    if (forceMock || !getCloudApiBaseUrl()) {
      setNewsletterProvider(createMockNewsletterProvider());
    } else {
      setNewsletterProvider(createWorkerNewsletterProvider());
    }
  }

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
  /** Occupancy winner for Yin sprites (sleep / welcome / payment / ceremony). */
  let spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
  /** Filled after Honesty exists — Stripe confirm may resolve after boot sleep. */
  let applyPaymentThanksSprite = (kind) => {
    emotionController.playEmotion(emotionKeyForPaymentThanks(kind));
  };

  const WELCOME_EMOTION_KEYS = new Set(['magicBookReading', 'nodGreeting']);
  function isColdStartWelcomePlaying() {
    return WELCOME_EMOTION_KEYS.has(emotionController.getCurrentEmotionKey());
  }
  function playParrotMessengerNow() {
    if (deriveReminderBusySessionTarget(buildLiveOverlaySnapshot())) return;
    const decision = arbitrateSpriteChannel({
      intent: SPRITE_OCCUPANCY.PARROT,
      source: SPRITE_SOURCES.PARROT,
      context: {
        sessionState: stateManager.state,
        overlayBusy: isSceneAnimOverlayBusy(),
        occupancy: spriteOccupancy,
        now: new Date()
      }
    });
    if (decision.occupy !== SPRITE_OCCUPANCY.PARROT) return;
    spriteOccupancy = decision.occupy;
    parrotMessengerPlayedThisPageSession = true;
    pendingParrotMessengerAfterWelcome = false;
    emotionController.playEmotion('parrotEarVisit', {
      onComplete: () => {
        spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
      }
    });
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
  /** Soft update chip: only when remote buildId differs (or ?forceUpdatePrompt=1). */
  let softUpdateAvailable = false;
  let softUpdateVersionLabel = '';
  let syncSoftUpdatePrompt = () => {};
  const softUpdatePromptUI = new SoftUpdatePromptUI(document.body, {
    onUpdate: () => {
      try {
        globalThis.location.reload();
      } catch {
        // ignore
      }
    }
  });
  syncSoftUpdatePrompt = () => {
    const busy = deriveReminderBusySessionTarget(buildLiveOverlaySnapshot());
    const reveal = shouldRevealSoftUpdatePrompt({
      updateAvailable: softUpdateAvailable,
      busySession: busy,
      desktopShell: Boolean(globalThis.desktopShell?.isDesktop)
    });
    if (reveal && softUpdateVersionLabel) {
      softUpdatePromptUI.setVersionLabel(softUpdateVersionLabel);
    }
    softUpdatePromptUI.setRevealed(reveal);
  };
  async function refreshSoftUpdateAvailability() {
    const force = readForceUpdatePromptFlag(globalThis.location?.search || '');
    if (force) {
      softUpdateAvailable = true;
      softUpdateVersionLabel = softUpdateVersionLabel || 'dev';
      syncSoftUpdatePrompt();
      return;
    }
    if (!LOCAL_APP_BUILD_ID) {
      softUpdateAvailable = false;
      syncSoftUpdatePrompt();
      return;
    }
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (!res.ok) {
        softUpdateAvailable = false;
        syncSoftUpdatePrompt();
        return;
      }
      const remote = parseVersionManifest(await res.json());
      softUpdateAvailable = isUpdateAvailable({
        localBuildId: LOCAL_APP_BUILD_ID,
        remoteBuildId: remote?.buildId || ''
      });
      softUpdateVersionLabel = remote?.version || remote?.buildId || '';
    } catch {
      softUpdateAvailable = false;
    }
    syncSoftUpdatePrompt();
  }
  window.__softUpdatePrompt = {
    sync: () => syncSoftUpdatePrompt(),
    refresh: () => refreshSoftUpdateAvailability(),
    ui: softUpdatePromptUI,
    get available() {
      return softUpdateAvailable;
    }
  };
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
          awardFocusCoins({ kind: GRANT_KIND.ACTIVE_RECOVER });
          activeRecoverAnchor.enterCooldown(ACTIVE_RECOVER_COOLDOWN_MS);
        }
        return result;
      },
      onCooldownTap: () => {
        mindfulReminderController.acknowledgeActiveRecoverCooldownTap();
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
  bindDesktopShellAttention(attentionSignals);

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

  const focusAwarenessCardUI = new FocusAwarenessCardUI(
    document.getElementById('ui-overlay') || document.body
  );
  window.__focusAwarenessCard = focusAwarenessCardUI;

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

  /** Busy overlays → skip awareness card (interval chime may still play). */
  function isFocusAwarenessCardBusy() {
    return deriveFocusAwarenessCardBusy(buildLiveOverlaySnapshot());
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
  /** @type {HonestyCheckInUI | null} */
  let honestyCheckInUI = null;
  /** @type {ArrivalPracticeUI | null} */
  let arrivalPractice = null;
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

  const fiveMomentsCompassUI = new FiveMomentsCompassUI(document.body, {
    onMomentSelect: (momentId) => handleFiveMomentSelect(momentId),
    onOpen: () => syncInAppReminderBanner()
  });
  window.__fiveMomentsCompass = fiveMomentsCompassUI;
  const journeyLogUI = new JourneyLogUI(document.body, {});
  window.__journeyLog = journeyLogUI;
  const yinPersonalMemoryUI = new YinPersonalMemoryUI(document.body, {});
  window.__yinPersonalMemory = yinPersonalMemoryUI;
  /** @type {FocusCoinsPanelUI | null} */
  let yinCoinPanelUI = null;
  const dailyZenQuoteCardUI = new DailyZenQuoteCardUI(document.body, {});
  window.__dailyZenQuoteCard = dailyZenQuoteCardUI;
  /** @type {null | { completed: boolean, intention: string, intentionSource: string }} */
  let pendingReflectionAfterMustardSeed = null;
  const mustardSeedSealCardUI = new MustardSeedSealCardUI(document.body, {
    storage: typeof localStorage !== 'undefined' ? localStorage : null,
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'mustard-seed' });
      sessionUiGate.setPostSessionOverlayActive(true);
      resyncSessionChrome();
    },
    onClose: () => {
      const pending = pendingReflectionAfterMustardSeed;
      pendingReflectionAfterMustardSeed = null;
      if (pending) {
        sessionEndFlow.onSessionEnded(pending);
      } else if (
        !reflectionMoment?.isOpen?.() &&
        !honestyBridge?.isVisible?.()
      ) {
        sessionUiGate.setPostSessionOverlayActive(false);
        resyncSessionChrome();
      }
    }
  });
  window.__mustardSeedSeal = {
    open: (opts) => mustardSeedSealCardUI.open(opts || { mode: 'force' }),
    close: () => mustardSeedSealCardUI.close(),
    resolve: () =>
      resolveMustardSeedSeal(
        typeof localStorage !== 'undefined' ? localStorage : null
      ),
    cases: () => MUSTARD_SEED_SEAL_CASES.map((entry) => entry.id),
    clear: () =>
      clearMustardSeedSealState(
        typeof localStorage !== 'undefined' ? localStorage : null
      )
  };
  const digitalWallpapersCardUI = new DigitalWallpapersCardUI(document.body, {});
  window.__digitalWallpapersCard = digitalWallpapersCardUI;
  const tipKindnessBadgesChrome = new TipKindnessBadgesChrome(document.body, {});
  window.__tipKindnessBadges = tipKindnessBadgesChrome;
  const sanctuaryEnsoMarkChrome = new SanctuaryEnsoMarkChrome(document.body, {});
  window.__sanctuaryEnsoMark = sanctuaryEnsoMarkChrome;
  const sanctuaryUnlockUI = new SanctuaryUnlockUI(document.body, {
    onBadgesChanged: () => {
      tipKindnessBadgesChrome.refresh();
      sanctuaryEnsoMarkChrome.refresh();
    }
  });
  window.__sanctuaryUnlock = sanctuaryUnlockUI;
  /** @type {{ close: (opts?: object) => void }} */
  const idleSecondaryPanelHost = { close: () => {} };
  const membershipUnlockUI = new MembershipUnlockUI(document.body, {
    onOpen: () => idleSecondaryPanelHost.close({ except: 'membership' }),
    onEntitlementChanged: () => {
      // Ritual lock rows re-read isEntitled on next menu/drawer open.
      tipKindnessBadgesChrome.refresh();
      sanctuaryEnsoMarkChrome.refresh();
    }
  });
  window.__membershipUnlock = membershipUnlockUI;
  // Peek before TipJarUI consumes `?tip=1` (and before welcome boot).
  const checkoutReturnKind = peekCheckoutReturnThanksKind(
    typeof location !== 'undefined' ? location.search : ''
  );
  const checkoutWelcomeGate =
    resolveCheckoutReturnWelcomeGate(checkoutReturnKind);

  const tipJarUI = new TipJarUI(document.body, {
    onBadgesChanged: () => tipKindnessBadgesChrome.refresh(),
    onTipThanks: () => {
      // Tip emotion is deferred to the welcome boot slot so WELCOME_APP
      // cannot overwrite teaDrinking on Stripe full-page return.
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

  const canOpenConfideNow = () => {
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
      stage: 'idle',
      companionGeneration: canRegisterDesktopCompanionGeneration({
        hasBridge: hasDesktopCompanionBridge(),
        widthPx: window.innerWidth
      })
    });
  };
  const confideToYinUI = new ConfideToYinUI(document.body, {
    canOpen: canOpenConfideNow,
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'confide' });
    },
    onOpenMemoryPanel: () => {
      closeGrowthOverlayCards({ except: 'yin-memory' });
      yinPersonalMemoryUI.open();
    },
    onMemoryForgotten: (memoryId) => {
      yinPersonalMemoryUI.removeMemoryIfOpen(memoryId);
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
  confideToYinUI.bindDesktopCompanion(getDesktopCompanionBridge());
  const confideEarChrome = new ConfideEarChromeUI(document.body, {
    canShow: canOpenConfideNow,
    onOpen: () => {
      closeGrowthOverlayCards({ except: 'confide' });
      confideToYinUI.open();
    }
  });
  window.__confideEarChrome = confideEarChrome;
  const syncConfideEarChrome = () => {
    confideEarChrome.sync();
    idleChrome.narrow?.setConfideEarVisible?.(canOpenConfideNow());
  };
  window.addEventListener('resize', () => syncConfideEarChrome());
  syncConfideEarChrome();

  function closeGrowthOverlayCards({ except = null } = {}) {
    if (except !== 'support') supportYinModalUI.close();
    if (except !== 'quote') dailyZenQuoteCardUI.close();
    if (except !== 'mustard-seed') mustardSeedSealCardUI.close();
    if (except !== 'wallpapers') digitalWallpapersCardUI.close();
    if (except !== 'sanctuary') sanctuaryUnlockUI.close();
    if (except !== 'membership') membershipUnlockUI.close();
    if (except !== 'tip') tipJarUI.close();
    if (except !== 'newsletter') newsletterCaptureUI.close();
    if (except !== 'confide') confideToYinUI.close();
    if (except !== 'cinema') zenCinemaCardUI.close();
    if (except !== 'moments') fiveMomentsCompassUI.close();
    if (except !== 'journey') journeyLogUI.close();
    if (except !== 'yin-memory') yinPersonalMemoryUI.close();
    if (except !== 'yin-coin') yinCoinPanelUI?.close();
  }

  /**
   * Compass chips jump to existing Arrive / Focus / Recover / Transition / Reflect
   * surfaces (locked rituals still toast via openRitualFlowFromMenu).
   * @param {string} momentId
   */
  function handleFiveMomentSelect(momentId) {
    const action = resolveFiveMomentAction(momentId);
    if (!action) return;
    fiveMomentsCompassUI.close();
    if (action.type === 'arrival') {
      if (
        !sessionUiGate.canStartArrivalFromChrome({
          isFocusing: stateManager.state === STATES.FOCUSING,
          arrivalOpen: arrivalPractice?.isOpen?.() === true
        })
      ) {
        mindfulToast.show(t('COMPANION_SELECT_BLOCKED'));
        return;
      }
      startArrivalPracticeFromChrome();
      return;
    }
    if (action.type === 'companion') {
      closeGrowthOverlayCards();
      companionModePicker.open();
      return;
    }
    if (action.type === 'ritual') {
      openRitualFlowFromMenu(action.proxy);
      return;
    }
    if (action.type === 'journey-log') {
      closeGrowthOverlayCards({ except: 'journey' });
      journeyLogUI.open();
    }
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

  const contextualTeaTipBubbleUI = new ContextualTeaTipBubbleUI(
    document.getElementById('ui-overlay') || document.body,
    {
      isBusy: () => deriveTeaBubbleBusyTarget(buildLiveOverlaySnapshot()),
      onBuyTea: () => {
        contextualTeaTipBubbleUI.hide({ immediate: true });
        closeGrowthOverlayCards({ except: 'tip' });
        tipJarUI.open();
      }
    }
  );
  window.__contextualTeaTip = contextualTeaTipBubbleUI;

  const monetizationFunnelStore = getMonetizationFunnelStore();
  monetizationFunnelStore.afterRecord = (name) => {
    scheduleMonetizationFunnelUploadAfterRecord(name);
  };

  consumeTipReturnQuery({});
  void bootSanctuaryReturnConfirm({}).then((ret) => {
    if (ret?.outcome === 'success') {
      monetizationFunnelStore.checkoutComplete('sanctuary', 'return');
      applyPaymentThanksSprite('sanctuary');
    }
  });
  void bootMembershipReturnConfirm({}).then((ret) => {
    if (ret?.outcome === 'success') {
      monetizationFunnelStore.checkoutComplete('membership', 'return');
      applyPaymentThanksSprite('membership');
    }
  });
  void bootProReturnConfirm({}).then((ret) => {
    if (ret?.outcome === 'success') {
      monetizationFunnelStore.checkoutComplete('pro', 'return');
      applyPaymentThanksSprite('pro');
    }
  });
  void bootCompanionAddonReturnConfirm({}).then((ret) => {
    if (ret?.outcome === 'success') {
      monetizationFunnelStore.checkoutComplete('companion-addon', 'return');
      applyPaymentThanksSprite('companion-addon');
    }
  });
  const focusSessionEndStore = new FocusSessionEndStore({ now });
  applyQaPracticeSeedFromSearch({
    search: window.location.search,
    storage: typeof localStorage !== 'undefined' ? localStorage : null
  });
  applyQaLotusPondSeedFromSearch({
    search: window.location.search,
    storage: typeof localStorage !== 'undefined' ? localStorage : null
  });
  const practiceDaysStore = new PracticeDaysStore();
  confideToYinUI.bindPracticeDaysStore(practiceDaysStore);
  const focusCoinsStore = new FocusCoinsStore({ now });
  function awardFocusCoins(event) {
    return applyFocusCoinsGrant({
      event,
      store: focusCoinsStore,
      practiceDaysStore,
      now,
      enabled: isFocusCoinsAwardEnabled({ search: location.search })
    });
  }
  function resetFocusCoinsSession() {
    maybeResetFocusCoinsSession({
      store: focusCoinsStore,
      search: location.search
    });
  }
  const lotusPondStore = new LotusPondStore();
  const lotusPondRuntime = new LotusPondRuntime({
    store: lotusPondStore,
    overlayEl: spritePlayer.overlayEl,
    incenseGreeting
  });
  lotusPondRuntime.boot();
  supportYinModalUI.setShouldLeadWithTea(() =>
    shouldLeadSupportModalWithTea({
      lifetimeMinutes: lotusPondStore.getLifetimeMinutes(),
      practicedDayCount: practiceDaysStore.getPracticedDateKeys().length
    })
  );
  function syncFocusCoinsCosmetics() {
    applyFocusCoinsCosmetics(focusCoinsStore.getSnapshot(), {
      documentElement: document.documentElement,
      enabled: isFocusCoinsAwardEnabled({ search: location.search })
    });
  }
  window.__tasteLayer = {
    status: () => getTasteLayerStatus(),
    prefetch: () =>
      prefetchTasteLayer({
        search: location.search,
        locale: getLocale(),
        canApply: () => !isSceneAnimOverlayBusy()
      }),
    reset: () => {
      resetTasteLayerSyncForTests();
      resetTasteLayerOverlayForTests();
    }
  };
  window.__focusCoins = {
    getBalance: () => focusCoinsStore.getBalance(),
    getSnapshot: () => focusCoinsStore.getSnapshot(),
    redeem: (skuId) => {
      const result = applyFocusCoinsRedeem({
        skuId,
        store: focusCoinsStore,
        practiceDaysStore,
        lotusPondStore,
        search: location.search
      });
      syncFocusCoinsCosmetics();
      yinCoinPanelUI?.refresh?.();
      return result;
    },
    equipTitle: (titleId) => {
      const result = applyFocusCoinsEquipTitle({
        titleId,
        store: focusCoinsStore,
        search: location.search
      });
      syncFocusCoinsCosmetics();
      yinCoinPanelUI?.refresh?.();
      return result;
    },
    playWave: () => playCollectionsWaveHello()
  };
  yinCoinPanelUI = new FocusCoinsPanelUI(document.body, {
    getContext: () => ({
      ...buildFocusCoinRedeemContext({
        store: focusCoinsStore,
        practiceDaysStore,
        lotusPondStore
      }),
      equippedTitle: focusCoinsStore.getSnapshot().equippedTitle
    }),
    redeem: (skuId) => window.__focusCoins.redeem(skuId),
    equipTitle: (titleId) => window.__focusCoins.equipTitle(titleId),
    playWave: () => window.__focusCoins.playWave(),
    onMessage: (message) =>
      mindfulToast.show(message, { placement: 'center' })
  });
  window.__yinCoinPanel = yinCoinPanelUI;
  syncFocusCoinsCosmetics();
  const milestoneGlowStore = new MilestoneGlowStore();
  const honestyBridgeStore = new HonestyBridgeStore();
  const retentionFunnelStore = new RetentionFunnelStore({ now });
  honestyCheckInUI = new HonestyCheckInUI(
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
    onCheckInComplete: ({ durationMinutes, wokeFromDormant } = {}) => {
      awardFocusCoins({
        kind: GRANT_KIND.HONESTY,
        durationMinutes
      });
      if (
        wokeFromDormant &&
        isFocusCoinsAwardEnabled({ search: location.search })
      ) {
        focusCoinsStore.markLifetime({ honestyWake: true });
      }
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
          onComplete: () => {
            revealBridge();
            lotusPondRuntime.releaseBirths();
          }
        });
      } else {
        revealBridge();
        lotusPondRuntime.releaseBirths();
      }
    },
    onPracticeDay: ({ durationMinutes } = {}) => {
      practiceDaysStore.markToday(durationMinutes);
      lotusPondRuntime.notePracticeMinutes(durationMinutes);
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

  function applySpriteChannelDecision(decision) {
    if (!decision) return decision;
    honestyCheckIn.applyDormantSessionDelta(
      dormantDeltaFromDecision(decision.sessionDelta)
    );
    if (
      decision.occupy &&
      decision.occupy !== SPRITE_OCCUPANCY.KEEP
    ) {
      spriteOccupancy = decision.occupy;
    }
    if (decision.play?.emotionKey) {
      emotionController.playEmotion(decision.play.emotionKey, {
        holdPose: decision.play.holdPose === true
      });
    }
    syncIdleYinTap();
    return decision;
  }

  applyPaymentThanksSprite = (kind) => {
    const emotionKey = emotionKeyForPaymentThanks(kind);
    applySpriteChannelDecision(
      arbitrateSpriteChannel({
        intent: SPRITE_OCCUPANCY.PAYMENT_THANKS,
        source: SPRITE_SOURCES.PAYMENT_ASYNC,
        emotionKey,
        context: {
          sessionState: stateManager.state,
          overlayBusy: isSceneAnimOverlayBusy(),
          occupancy: spriteOccupancy,
          now: new Date()
        }
      })
    );
  };

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
      // Timed Breath practice sits with the existing Idle 闭目坐禅 loop
      // (idleBreathClosed ×2 → glance). Do not override with blink-smile —
      // that made a 1-min "Exhale..." look like Arrival's short greeting beat.
      sessionCues.preload();
      sessionCues.playStart({ ambient: ambientSoundscape });
      sessionCues.startIntervalSession();
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
    onComplete: ({ ritualId, selections, ritualSessionId }) => {
      completeRitualFlow(ritualId, selections, ritualSessionId);
    },
    onLeave: ({ ritualId, selections, ritualSessionId }) => {
      leaveRitualFlowQuietly({ ritualId, selections, ritualSessionId });
    },
    consumeLeaveRetrospective: (ritualId) => {
      const storage =
        typeof localStorage !== 'undefined' ? localStorage : null;
      return consumeRitualLeaveRetrospective(storage, ritualId);
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

  const readSpriteFrameSrc = () => {
    const img = spritePlayer?.imgEl;
    if (!img) return null;
    return img.currentSrc || img.src || null;
  };

  const immersivePresenceUI = new ImmersivePresenceUI(
    document.getElementById('ui-overlay'),
    {
      getGateState: () => ({
        isFocusing: stateManager.state === STATES.FOCUSING,
        completionPending: sessionUiGate.completionPending
      }),
      getElapsedSeconds: () => focusSession.getElapsedSeconds(),
      getSpriteFrameSrc: readSpriteFrameSrc,
      onPipUnavailable: () => {
        mindfulToast.show(t('IMMERSIVE_PIP_UNAVAILABLE'), {
          placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
          visibleMs: 2800
        });
      }
    }
  );
  window.__immersivePresence = immersivePresenceUI;

  const idleCompanionPipUI = new IdleCompanionPipUI(
    weeklyPracticeHeatmap.getClusterEl(),
    {
      getIsIdle: () =>
        stateManager.state === STATES.IDLE &&
        !Boolean(microRitualUI?.isOpen?.()),
      getSpriteFrameSrc: readSpriteFrameSrc
    }
  );
  window.__idleCompanionPip = idleCompanionPipUI;

  if (needsDocumentPictureInPictureProbe()) {
    void probeDocumentPictureInPicture().then((ok) => {
      if (!ok) return;
      immersivePresenceUI.refreshPipEntry?.();
      idleCompanionPipUI.refreshPipEntry?.();
    });
  }

  /**
   * Choose 确认后、Companion 展开前（点头动画窗口）：Arrival 已关，
   * 仍须 Quick-only，避免三球闪回（W3）。
   */
  const postChooseChrome = { pending: false };

  /**
   * Idle 入口 + 叠层门闩 / 窄宽壳投影（等价抽离；见 sessionChromeSync.js）。
   * Honesty 提示/时长**故意不列入** overlay 源——仍允许点 hint 展开三选一。
   */
  const sessionChromeSyncApi = createSessionChromeSync({
    getHonestyBridge: () => honestyBridge,
    getArrivalPractice: () => arrivalPractice,
    getReflectionMoment: () => reflectionMoment,
    getMicroRitualUI: () => microRitualUI,
    getRitualFlowUI: () => ritualFlowUI,
    getFocusDurationPicker: () => focusDurationPicker,
    getMustardSeedSealUI: () => mustardSeedSealCardUI,
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
  const { syncHonestyIdleEntry, syncArrivalGateReady } = sessionChromeSyncApi;
  /** @type {IdleYinTapAnchorUI | null} */
  let idleYinTapAnchor = null;

  function buildLiveOverlaySnapshot() {
    return buildOverlaySnapshot({
      sessionState: stateManager.state,
      completionPending: sessionUiGate.completionPending,
      honestyPhase: honestyCheckInUI?.phase,
      honestyBridgeVisible: honestyBridge?.isVisible?.() === true,
      arrivalOpen: arrivalPractice?.isOpen?.() === true,
      reflectionOpen: reflectionMoment?.isOpen?.() === true,
      microRitualOpen: microRitualUI?.isOpen?.() === true,
      ritualFlowOpen: ritualFlowUI?.isOpen?.() === true,
      focusDurationPickerOpen: focusDurationPicker?.isOpen?.() === true,
      companionPickerOpen: companionModePicker?.isOpen?.() === true,
      postSessionOverlayActive: sessionUiGate.postSessionOverlayActive,
      compassOpen: fiveMomentsCompassUI.isOpen(),
      mustardSeedOpen: mustardSeedSealCardUI.isOpen?.() === true,
      tipJarOpen: tipJarUI.isOpen() === true,
      supportModalOpen: supportYinModalUI.isOpen() === true,
      sanctuaryOpen: sanctuaryUnlockUI.isOpen?.() === true,
      membershipOpen: membershipUnlockUI.isOpen?.() === true,
      flowerWelcomeVisible: flowerBlowWelcomeBubble?.isOpen?.() === true
    });
  }

  function playCollectionsWaveHello() {
    const result = evaluateCollectionsWaveHelloPlay({
      sessionState: stateManager.state,
      focusing: stateManager.state === STATES.FOCUSING,
      emotionKey: emotionController.getCurrentEmotionKey()
    });
    if (!result.ok) {
      yinCoinPanelUI?.refresh?.();
      return result;
    }
    emotionController.playEmotion(COLLECTIONS_WAVE_HELLO_EMOTION_KEY, {
      onComplete: () => {
        yinCoinPanelUI?.refresh?.();
        syncIdleYinTap();
      }
    });
    yinCoinPanelUI?.refresh?.();
    syncIdleYinTap();
    return result;
  }

  function isIdleYinTapOverlayBusy() {
    return (
      sessionUiGate.postSessionOverlayActive === true ||
      honestyCheckInUI?.phase === 'duration' ||
      honestyCheckInUI?.phase === 'breath' ||
      honestyCheckInUI?.phase === 'thanks' ||
      supportYinModalUI?.isOpen?.() === true ||
      tipJarUI?.isOpen?.() === true ||
      sanctuaryUnlockUI?.isOpen?.() === true ||
      membershipUnlockUI?.isOpen?.() === true
    );
  }

  function syncIdleYinTap() {
    if (!idleYinTapAnchor) return;
    idleYinTapAnchor.setArmed(
      canPlayIdleYinTap({
        sessionState: stateManager.state,
        focusing: stateManager.state === STATES.FOCUSING,
        overlayBusy: isIdleYinTapOverlayBusy(),
        emotionKey: emotionController.getCurrentEmotionKey(),
        occupancy: spriteOccupancy
      })
    );
  }

  function resyncSessionChrome() {
    sessionChromeSyncApi.resyncSessionChrome();
    syncIdleYinTap();
    syncConfideEarChrome();
  }

  idleYinTapAnchor = new IdleYinTapAnchorUI(
    document.getElementById('ui-overlay') || document.body,
    {
      onTap: () => {
        if (
          !canPlayIdleYinTap({
            sessionState: stateManager.state,
            focusing: stateManager.state === STATES.FOCUSING,
            overlayBusy: isIdleYinTapOverlayBusy(),
            emotionKey: emotionController.getCurrentEmotionKey(),
            occupancy: spriteOccupancy
          })
        ) {
          syncIdleYinTap();
          return;
        }
        emotionController.playEmotion(IDLE_YIN_TAP_EMOTION_KEY, {
          onComplete: () => syncIdleYinTap()
        });
        syncIdleYinTap();
      }
    }
  );
  wrapPlayEmotionWithIdleYinTapSync(emotionController, syncIdleYinTap);
  window.__idleYinTapAnchor = idleYinTapAnchor;
  const openHonestyDuration = honestyCheckIn.openDurationChoices.bind(
    honestyCheckIn
  );
  honestyCheckIn.openDurationChoices = (opts) => {
    const result = openHonestyDuration(opts);
    syncIdleYinTap();
    return result;
  };
  syncIdleYinTap();

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
      reflect: Boolean(hasAnyAnswer),
      insightSpark: hasOpenedInsightSparkToday({ storage })
    });
    pendingJourneyDraft = null;
    schedulePracticeBackupUpload({ storage });
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
   * @param {string} [ritualSessionId]
   */
  function completeRitualFlow(ritualId, selections, ritualSessionId) {
    ambientSoundscape.stopPlaybackEphemeral();
    const config = getRitualConfig(ritualId);
    ritualCompletionStore.recordCompletion(ritualId, { selections });
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    if (storage && ritualSessionId) {
      appendRitualChipPresenceSignals(storage, ritualId, selections, {
        ritualSessionId,
        ritualCompleted: true,
        now
      });
    }
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
    spriteOccupancy = SPRITE_OCCUPANCY.LIGHT_COMPLETE;
    emotionController.playEmotion('sessionComplete', {
      crossFadeMs: CAPCUT_DISSOLVE_MS,
      freezeUntilCrossFadeEnds: true,
      onComplete: () => {
        spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
        syncHonestyIdleEntry();
      }
    });
    // Explicit: do NOT call sessionEndFlow / TigerReflectionMoment.
  }

  /**
   * @param {{
   *   ritualId: string,
   *   selections: Record<string, string>,
   *   ritualSessionId: string
   * }} payload
   */
  function leaveRitualFlowQuietly(payload) {
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    if (storage && payload?.ritualSessionId) {
      appendRitualChipPresenceSignals(
        storage,
        payload.ritualId,
        payload.selections,
        {
          ritualSessionId: payload.ritualSessionId,
          ritualCompleted: false,
          now
        }
      );
    }
    endRitualFlowChrome();
    emotionController.playEmotion('idle', {
      crossFadeMs: CAPCUT_DISSOLVE_MS,
      freezeUntilCrossFadeEnds: true
    });
    syncHonestyIdleEntry();
  }

  function completeMicroRitual() {
    sessionCues.stopIntervalSession();
    const stopAmbientAfterEndCue = () => {
      ambientSoundscape.stopPlaybackEphemeral();
    };
    const playedEndCue = sessionCues.playEnd({
      ambient: ambientSoundscape,
      onCueEnded: stopAmbientAfterEndCue
    });
    if (!playedEndCue) {
      stopAmbientAfterEndCue();
    }
    const durationMinutes =
      microRitualUI?.getDurationMinutes?.() ?? 1;
    dailyCompletionStore.recordCompletion(durationMinutes);
    practiceDaysStore.markToday(durationMinutes);
    lotusPondRuntime.notePracticeMinutes(durationMinutes);
    applyBreathPracticeFocusCoinsGrant({
      durationMinutes,
      store: focusCoinsStore,
      practiceDaysStore,
      now,
      enabled: isFocusCoinsAwardEnabled({ search: location.search })
    });
    tipKindnessBadgesChrome.refresh();
    trackRetentionEvent(RETENTION_EVENTS.MICRO_RITUAL_COMPLETE, {
      durationMinutes
    });
    mindfulToast.show(t('micro_ritual.complete'), {
      placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
      visibleMs: 4_500
    });
    endMicroRitualChrome();
    spriteOccupancy = SPRITE_OCCUPANCY.LIGHT_COMPLETE;
    const decision = tryPlaySceneAnim(SCENE_ANIM_EVENTS.MICRO_RITUAL_COMPLETE, {
      playOptions: {
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true,
        onComplete: () => {
          lotusPondRuntime.releaseBirths();
          syncHonestyIdleEntry();
        }
      }
    });
    if (!decision.play) {
      emotionController.playEmotion('sessionComplete', {
        crossFadeMs: CAPCUT_DISSOLVE_MS,
        freezeUntilCrossFadeEnds: true,
        onComplete: () => {
          lotusPondRuntime.releaseBirths();
          syncHonestyIdleEntry();
        }
      });
    }
    // Shallow Reflection handoff — do not wait for sessionComplete animation.
    // Product-equivalent sitting: stash before Reflection so Skip still logs.
    const draft = microRitualJourneyDraft(durationMinutes);
    if (draft) pendingJourneyDraft = draft;
    sessionEndFlow.onSessionEnded({ completed: true });
  }

  function leaveMicroRitualQuietly() {
    sessionCues.cancelPending();
    sessionCues.stopIntervalSession();
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
  const ambientSoundscape = new AmbientSoundscapeController({
    auditionMs: parseAmbientAuditionMs(
      typeof location !== 'undefined' ? location.search : ''
    )
  });
  const sessionCues = new SessionCueController();
  sessionCues.preload();
  // Avoid TDZ: AmbientSoundscapeUI paints during construct, before `let onboardingHints`.
  /** @type {{ hints: import('./ui/OnboardingHintsUI.js').OnboardingHintsUI | null }} */
  const onboardingHintHost = { hints: null };
  // 挂 body：避免落在 pointer-events:none 的 ui-overlay 栈内，并压过调试栏
  const ambientSoundscapeUI = new AmbientSoundscapeUI(
    document.body,
    ambientSoundscape,
    {
      sessionCues,
      onPanelOpened: () => {
        idleSecondaryPanelHost.close({ except: 'soundscape' });
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
      },
      onLockedDeepTrack: (trackId) => {
        void ambientSoundscape
          .startDeepAudition(trackId, {
            onEnded: ({ reason }) => {
              ambientSoundscapeUI.renderAfterAudition?.();
              idleChrome.syncMuteVisual({
                musicOn: ambientSoundscapeUI.wantsMusicOn()
              });
              // Soft unlock hint after timed audition — dismissible; do not force Support.
              if (reason === 'duration') {
                mindfulToast.show(t('AMBIENT_AUDITION_UNLOCK_HINT'), {
                  placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
                  visibleMs: 5_000
                });
              }
            }
          })
          .then((result) => {
            if (result.started) {
              ambientSoundscapeUI.renderAfterAudition?.();
              idleChrome.syncMuteVisual({
                musicOn: ambientSoundscapeUI.wantsMusicOn()
              });
              return;
            }
            // Fallback: entitled path already playing, or play failed → keep prior toast+Support.
            if (result.reason === 'entitled') {
              ambientSoundscapeUI.renderAfterAudition?.();
              return;
            }
            mindfulToast.show(t('AMBIENT_TRACK_LOCKED_TOAST'), {
              placement: MINDFUL_TOAST_PLACEMENT_ACKNOWLEDGE,
              visibleMs: 4_000
            });
            supportYinModalUI.open();
          });
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
    onYinCoin: () => {
      closeGrowthOverlayCards({ except: 'yin-coin' });
      yinCoinPanelUI?.open();
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
    onMustardSeedSeal: () => {
      closeGrowthOverlayCards({ except: 'mustard-seed' });
      mustardSeedSealCardUI.open({ mode: 'menu' });
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
      idleSecondaryPanelHost.close();
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

  bindElectronIdleContextMenu({
    getIsIdleContextMenuAllowed: () => {
      if (stateManager.state !== STATES.IDLE) return false;
      if (idleChrome.isSecondaryMenuOpen?.()) return false;
      if (arrivalPractice?.isOpen?.()) return false;
      if (reflectionMoment?.isOpen?.()) return false;
      if (microRitualUI?.isOpen?.()) return false;
      if (isHonestyUiBusy(honestyCheckInUI?.phase)) return false;
      if (companionModePicker?.isOpen?.()) return false;
      return true;
    },
    onOpenSecondaryMenu: () => {
      idleChrome.openSecondaryMenu?.();
    }
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
    },
    onPurposeOpen: () => idleSecondaryPanelHost.close({ except: 'purpose' }),
    onWellnessFirstDismiss: () => {
      scheduleFirstCardOffers();
    }
  });
  onboardingHintHost.hints = onboardingHints;
  const { closeIdleSecondaryPanels } = createIdleSecondaryPanelCoordinator({
    membershipUnlockUI,
    getOnboardingHints: () => onboardingHintHost.hints,
    ambientSoundscapeUI,
    closeGrowthOverlayCards
  });
  idleSecondaryPanelHost.close = closeIdleSecondaryPanels;
  // Hints e2e (pulse ownership / clear seen) needs this in vite preview (DEV=false),
  // same contract as `__ambientSoundscape` / `__honestyBridge`.
  window.__onboardingHints = onboardingHints;
  window.__wellnessDisclaimer = {
    hasSeen: () =>
      hasSeenWellnessDisclaimer(
        typeof localStorage !== 'undefined' ? localStorage : null
      ),
    markSeen: () =>
      markWellnessDisclaimerSeen(
        typeof localStorage !== 'undefined' ? localStorage : null
      ),
    openFirst: () => onboardingHints?.openWellnessFirstCard?.()
  };

  // Reminder / companion e2e hooks — must work in `vite preview` (DEV=false),
  // same contract as `__honestyBridge`.
  window.__dailyCompletionStore = dailyCompletionStore;
  window.__companionModePicker = companionModePicker;
  // Ambient e2e (mute↔resume / Focusing track audible) needs these in
  // `vite preview` production builds — same contract as `__honestyBridge`.
  window.__ambientSoundscape = ambientSoundscape;
  window.__ambientSoundscapeUI = ambientSoundscapeUI;
  window.__sessionCues = sessionCues;
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
  window.__lotusPondStore = lotusPondStore;

  /** @type {{ text: string, source: 'icon' | 'typed' } | null} */
  let pendingChoose = null;
  /** @type {string} 本次会话 Choose 内容；达标与未达标结束均回显 */
  let currentSessionIntention = '';
  /** @type {'icon' | 'typed'} */
  let currentIntentionSource = 'typed';

  arrivalPractice = new ArrivalPracticeUI(
    document.getElementById('ui-overlay'),
    {
      onNoticeSelected: (noticeId) => {
        const storage =
          typeof localStorage !== 'undefined' ? localStorage : null;
        const row = appendArrivalNoticeSignal(storage, noticeId);
        const showDisclosure =
          Boolean(row) && shouldShowPresenceSignalsDisclosure(storage);
        if (showDisclosure) {
          markPresenceSignalsDisclosureSeen(storage);
        }
        lightProgression.onNoticeSelected();
        onboardingHints?.markSeen('notice');
        syncOnboardingAutoHints();
        return showDisclosure;
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
            // 鞠躬回落与 idle CapCut 同拍淡出暖幕；禁止 clearArrivalAtmosphere() 硬切（闪一下）。
            lightProgression.clearArrivalAtmosphere({
              animate: true,
              durationMs: CAPCUT_DISSOLVE_MS
            });
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
        if (arrivalChoseThisRun) {
          awardFocusCoins({ kind: GRANT_KIND.ARRIVE });
        }
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
  // Seasonal Theme (Phase 3): soft wash + once-per-day line for entitled B users.
  const seasonalThemeBoot = bootSeasonalThemeChrome({
    appEl: app,
    overlayEl: document.getElementById('ui-overlay'),
    storage: typeof localStorage !== 'undefined' ? localStorage : null,
    search: window.location.search,
    isBusy: () =>
      arrivalPractice?.isOpen?.() === true ||
      reflectionMoment?.isOpen?.() === true ||
      microRitualUI?.isOpen?.() === true
  });
  window.__seasonalTheme = seasonalThemeBoot;
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
    const busy = deriveReminderBusySessionTarget(buildLiveOverlaySnapshot());
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
    syncSoftUpdatePrompt();
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
    resetFocusCoinsSession();
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
    onboardingHints?.hideWellnessFirstCard({ markSeen: true, notify: false });
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

  function endFocusChrome({ stopAmbient = true } = {}) {
    attentionSignals.setEnabled(false);
    mindfulReminderController.stopSession();
    acrossToolsIdleGuard.stop();
    sessionCues.stopIntervalSession();
    focusAwarenessCardUI.hide({ immediate: true });
    if (stopAmbient) {
      ambientSoundscape.endSession();
    }
    ambientSoundscapeUI.setSessionActive(false);
    supportYinModalUI.setFabVisible(true);
    tipKindnessBadgesChrome.setVisible(true);
    sanctuaryEnsoMarkChrome.setFocusing(false);
    sanctuaryEnsoMarkChrome.setVisible(true);
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
    // Plan A: duck → end chime → fadeOutAndStop ambient (do not hard-stop first).
    const stopAmbientAfterEndCue = () => {
      if (ambientSoundscape.isAudiblePlaying()) {
        void ambientSoundscape.fadeOutAndStop({ fadeMs: AMBIENT_DUCK_FADE_MS });
        return;
      }
      ambientSoundscape.endSession();
    };
    const playedEndCue = sessionCues.playEnd({
      ambient: ambientSoundscape,
      onCueEnded: stopAmbientAfterEndCue
    });
    if (!playedEndCue) {
      stopAmbientAfterEndCue();
    }
    endFocusChrome({ stopAmbient: false });
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
    // Reflect 仍是同坐：达标走庆祝 / 轻完成 / 里程碑，不得 cloakSleep 进未填的 Reflection。
    // 深夜休息仍走 Expand A（Idle ≥23 → DORMANT），不在本分支抢戏。
    const teaTipReason = milestoneNode ? 'milestone' : 'session-complete';
    const endDec = resolveSessionEndSpriteOccupancy({
      completed: true,
      preferMilestoneGlow: Boolean(milestoneNode),
      hasCelebratedToday: dailyCompletionStore.hasCelebratedToday()
    });
    if (endDec.occupy !== SPRITE_OCCUPANCY.KEEP) {
      spriteOccupancy = endDec.occupy;
    }
    triggerSessionCompletionFeedback({
      hasCelebratedToday: dailyCompletionStore.hasCelebratedToday(),
      preferMilestoneGlow: Boolean(milestoneNode),
      emotionController,
      startCelebrating: () => {
        dailyCompletionStore.markCelebratedToday();
        stateManager.setState(STATES.CELEBRATE);
        syncIdleYinTap();
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
    contextualTeaTipBubbleUI.tryOffer(teaTipReason, { delayMs: 1800 });
  }

  /**
   * 开表入口：无 `?sessionMinutes=` 时先出 10/15/25/45 chip；有则跳过（e2e）。
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
    sessionCues.preload();
    focusDurationPicker.open();
    resyncSessionChrome();
    syncOnboardingAutoHints();
  }

  function beginFocusWithMode(companionMode) {
    resetFocusCoinsSession();
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
    void ambientSoundscape.startSittingMusic().then(() => {
      ambientSoundscapeUI.renderAfterAudition?.();
      idleChrome.syncMuteVisual({
        musicOn: ambientSoundscapeUI.wantsMusicOn()
      });
    });
    // Free core cue — not Ambient entitlement; sync play on this gesture.
    sessionCues.playStart({ ambient: ambientSoundscape });
    focusAwarenessCardUI.resetSession();
    sessionCues.startIntervalSession();
    supportYinModalUI.setFabVisible(false);
    tipKindnessBadgesChrome.setVisible(false);
    // Enso stays in the page corner during Focusing — fade only (Brief opacity 0.45–0.55).
    sanctuaryEnsoMarkChrome.setVisible(true);
    sanctuaryEnsoMarkChrome.setFocusing(true);
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
        'ft-narrow-stage-reminder',
        'ft-wide-stage-sound',
        'ft-wide-stage-reminder'
      );
      document.body.classList.add(
        'ft-narrow-stage-companion',
        'ft-wide-stage-companion'
      );
      onboardingHints?.maybeShowAuto('companion-mode');
      requestAnimationFrame(() => onboardingHints?.repositionAll());
    } else {
      document.body.classList.remove(
        'ft-narrow-stage-companion',
        'ft-wide-stage-companion'
      );
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
      // Early Rise: no end chime; cancel any in-flight start/interval cue + duck.
      sessionCues.cancelPending();
      sessionCues.stopIntervalSession();
      focusAwarenessCardUI.hide({ immediate: true });
      ambientSoundscape.cancelDuck();
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
      // Rise：加权池（伸懒腰 60% / 喝茶 25% / 单程看书 15%）hold 进 Reflection；
      // 关面板后再回 idle。深夜亦同——不得披斗篷睡着问「今天注意到什么」。
      // MoodController 在 IDLE 时不覆盖池内 hold 键。
      const riseOccupy = resolveSessionEndSpriteOccupancy({ completed: false });
      if (riseOccupy.occupy !== SPRITE_OCCUPANCY.KEEP) {
        spriteOccupancy = riseOccupy.occupy;
      }
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
    awardFocusCoins({
      kind: GRANT_KIND.TIMED,
      reachedTarget: true,
      companionMode: focusSession.companionMode,
      durationMinutes: focusSession.targetMinutes
    });
    awardFocusCoins({ kind: GRANT_KIND.REFLECT });
    lotusPondRuntime.releaseBirths();
    stateManager.setState(STATES.IDLE);
    honestyGlowLevel = null;
    tigerCharacter.setFocusLevel(0);
    focusInput.resetButton(focusButton);
    sessionUiGate.setCompletionPending(false);
    resyncSessionChrome();
    companionModePicker.setIdleChromeVisible(true);
    const endOpts = {
      completed: true,
      intention: currentSessionIntention,
      intentionSource: currentIntentionSource
    };
    currentSessionIntention = '';
    currentIntentionSource = 'typed';
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    const seal = resolveMustardSeedSeal(storage);
    if (
      shouldOfferMustardSeedSealAfterCeremony({
        completed: true,
        unlocked: seal.unlocked,
        hasUnrevealedCase: Boolean(seal.nextCase)
      })
    ) {
      pendingReflectionAfterMustardSeed = endOpts;
      closeGrowthOverlayCards({ except: 'mustard-seed' });
      mustardSeedSealCardUI.open({ mode: 'auto' });
    } else {
      sessionEndFlow.onSessionEnded(endOpts);
    }
    onboardingHints?.markSeen('rise-button');
  }

  const moodController = new MoodController(stateManager, emotionController, {
    onCelebrateComplete: finishCompletedSession
  });
  // Do not play Mood Idle before the boot occupancy winner (avoids an Idle
  // flash under welcome / flower / cloak). Mood still observes later DORMANT.

  const bootNow = new Date();
  const bootStorage =
    typeof localStorage !== 'undefined' ? localStorage : null;
  const wellnessBand = resolveWellnessDayBand(bootNow);
  const flowerForceBoot = resolveFlowerWelcomeForce({
    storage: bootStorage,
    now: () => bootNow,
    enabled: isFlowerWelcomeEnabled({ storage: bootStorage })
  });
  const skipWelcomeForCheckout = checkoutWelcomeGate.skipWelcome;
  const paymentThanksAtWelcome = checkoutWelcomeGate.playAtWelcomeSlot;
  const welcomeUsed =
    readDailySceneAnimState(bootStorage, () => bootNow).welcome === true;
  const bootDecision = resolveBootSpriteOccupancy({
    now: bootNow,
    sessionState: stateManager.state,
    overlayBusy: isSceneAnimOverlayBusy(),
    wellnessBand,
    flowerForce: shouldPreferFlowerWelcomeOverWellness(flowerForceBoot),
    checkoutThanksKind: checkoutReturnKind,
    playAtWelcomeSlot: paymentThanksAtWelcome,
    welcomeAvailable: !welcomeUsed && !skipWelcomeForCheckout,
    lateNight: isLateNightHour(bootNow)
  });

  honestyCheckIn.onAppReady();
  if (
    bootDecision.occupy &&
    bootDecision.occupy !== SPRITE_OCCUPANCY.KEEP
  ) {
    spriteOccupancy = bootDecision.occupy;
  }

  let tastePrefetchStarted = false;
  function startTastePrefetchOnce() {
    if (tastePrefetchStarted) return;
    tastePrefetchStarted = true;
    void prefetchTasteLayer({
      search: location.search,
      locale: getLocale(),
      canApply: () => !isSceneAnimOverlayBusy()
    });
  }
  window.setTimeout(startTastePrefetchOnce, 12000);

  const welcomePlayOptions = {
    onComplete: () => {
      spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
      startTastePrefetchOnce();
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
  };

  if (bootDecision.sessionDelta === 'enter-dormant') {
    honestyCheckIn.applyDormantSessionDelta('enter-dormant');
    mindfulToast.show(t('WELLNESS_LATE_NIGHT_REST'), { visibleMs: 5200 });
    startTastePrefetchOnce();
  } else if (bootDecision.occupy === SPRITE_OCCUPANCY.MORNING_WAKE) {
    emotionController.playEmotion('dormantWake', {
      holdPose: true,
      onComplete: () => {
        spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
        emotionController.playEmotion('idle', {
          crossFadeMs: CAPCUT_DISSOLVE_MS
        });
        window.setTimeout(startTastePrefetchOnce, CAPCUT_DISSOLVE_MS + 250);
      }
    });
    mindfulToast.show(t('WELLNESS_MORNING_WAKE'), { visibleMs: 5200 });
  } else if (
    bootDecision.occupy === SPRITE_OCCUPANCY.PAYMENT_THANKS &&
    paymentThanksAtWelcome
  ) {
    emotionController.playEmotion(paymentThanksAtWelcome, {
      onComplete: () => {
        spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
        startTastePrefetchOnce();
      }
    });
  } else if (
    bootDecision.occupy === SPRITE_OCCUPANCY.FLOWER ||
    bootDecision.occupy === SPRITE_OCCUPANCY.WELCOME
  ) {
    const welcomeStarted = tryPlaySceneAnim(SCENE_ANIM_EVENTS.WELCOME_APP, {
      playOptions: welcomePlayOptions
    });
    if (!welcomeStarted?.play) startTastePrefetchOnce();
  } else {
    emotionController.playEmotion('idle');
    startTastePrefetchOnce();
  }
  retentionFunnelStore.noteAppOpen();
  syncHonestyIdleEntry();
  syncOnboardingAutoHints();

  let wellnessFirstConsumedThisPage = false;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let firstCardOfferTimer = null;

  function onboardingHintsBlockFirstCard() {
    if (onboardingHints?.purposeCard && !onboardingHints.purposeCard.hidden) {
      return true;
    }
    if (onboardingHints?.privacySheet && !onboardingHints.privacySheet.hidden) {
      return true;
    }
    return false;
  }

  function maybeOfferWellnessDisclaimerFirstCard() {
    if (!productChrome) return false;
    if (onboardingHints?.isWellnessFirstCardOpen?.()) return true;
    if (wellnessFirstConsumedThisPage) return false;
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    if (
      !shouldOfferWellnessDisclaimerFirstCard(storage, location.search)
    ) {
      return false;
    }
    if (stateManager.state !== STATES.IDLE) return false;
    if (onboardingHintsBlockFirstCard()) return false;
    const snapshot = buildLiveOverlaySnapshot();
    if (
      !canAttemptFirstCard(OVERLAY_SOURCES.WELLNESS_FIRST, snapshot)
    ) {
      return false;
    }
    closeGrowthOverlayCards();
    onboardingHints?.openWellnessFirstCard();
    wellnessFirstConsumedThisPage = true;
    return true;
  }

  function maybeOfferFiveMomentsCompassFirstCard() {
    if (!productChrome) return;
    const storage =
      typeof localStorage !== 'undefined' ? localStorage : null;
    if (!shouldOfferFiveMomentsCompassFirstCard(storage)) return;
    if (onboardingHints?.isWellnessFirstCardOpen?.()) return;
    if (
      !wellnessFirstConsumedThisPage &&
      shouldOfferWellnessDisclaimerFirstCard(storage, location.search)
    ) {
      return;
    }
    if (stateManager.state !== STATES.IDLE) return;
    if (onboardingHintsBlockFirstCard()) return;
    const snapshot = buildLiveOverlaySnapshot();
    if (!canAttemptFirstCard(OVERLAY_SOURCES.GROWTH_COMPASS, snapshot)) {
      return;
    }
    closeGrowthOverlayCards({ except: 'moments' });
    fiveMomentsCompassUI.open({ firstRun: true });
  }

  function scheduleFirstCardOffers(delayMs = 0) {
    if (!productChrome) return;
    if (firstCardOfferTimer != null) {
      window.clearTimeout(firstCardOfferTimer);
      firstCardOfferTimer = null;
    }
    firstCardOfferTimer = window.setTimeout(() => {
      firstCardOfferTimer = null;
      if (maybeOfferWellnessDisclaimerFirstCard()) return;
      maybeOfferFiveMomentsCompassFirstCard();
      const storage =
        typeof localStorage !== 'undefined' ? localStorage : null;
      const wantsWellness = shouldOfferWellnessDisclaimerFirstCard(
        storage,
        location.search
      );
      const wantsCompass = shouldOfferFiveMomentsCompassFirstCard(storage);
      if (!wantsWellness && !wantsCompass) return;
      const snapshot = buildLiveOverlaySnapshot();
      const stillBlocked =
        (wantsWellness &&
          !wellnessFirstConsumedThisPage &&
          !canAttemptFirstCard(OVERLAY_SOURCES.WELLNESS_FIRST, snapshot)) ||
        (wantsCompass &&
          !canAttemptFirstCard(OVERLAY_SOURCES.GROWTH_COMPASS, snapshot));
      if (stillBlocked) {
        scheduleFirstCardOffers(4000);
      }
    }, delayMs);
  }

  // Quiet Idle first-run: Compass (wellness auto-card is off; lookup is ?).
  // Defer queue via canAttemptFirstCard (flower > compass > wellness).
  if (productChrome) {
    scheduleFirstCardOffers();
  }

  // Occupancy already decided the first paint (welcome / flower / thanks /
  // cloak / idle). Do not also fire LATE_NIGHT on the same tick.
  // Lift mask on next frame after sprite overlay has a chance to show.
  requestAnimationFrame(() => {
    PoseManager.setLoadingMaskVisible(false);
  });

  // Expand A 白天 Idle 无操作披毯已关（2026-08-04 plan A）。保留：深夜 Idle→DORMANT、
  // 2h 练完后 live sync、2B。会话结束进 Reflection 不再披毯（2026-08-18 收回 Expand B）。
  // 无操作计时器删除 → 藏 tab 也不会「后台涨满」误睡。

  // 回前台：2B 长离苏醒（FOCUSING + hidden≥30min）与 2h→DORMANT 互补。
  // 短切 tab（hiddenMs < 2h）不得用陈旧 session-end 披毯 / 深夜 forceDormant。
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
      const wake = arbitrateSpriteChannel({
        intent: SPRITE_OCCUPANCY.LONG_AWAY_WAKE,
        source: SPRITE_SOURCES.VISIBILITY,
        emotionKey: 'dormantWake',
        context: {
          sessionState: stateManager.state,
          overlayBusy: isSceneAnimOverlayBusy(),
          occupancy: spriteOccupancy,
          now: new Date()
        }
      });
      if (wake.occupy === SPRITE_OCCUPANCY.LONG_AWAY_WAKE) {
        spriteOccupancy = wake.occupy;
        emotionController.playEmotion('dormantWake', {
          holdPose: true,
          onComplete: () => {
            spriteOccupancy = SPRITE_OCCUPANCY.IDLE_BASELINE;
            emotionController.playEmotion('idle', {
              crossFadeMs: CAPCUT_DISSOLVE_MS
            });
          }
        });
      }
    } else {
      applySpriteChannelDecision(
        resolveVisibilitySpriteOccupancy({
          sessionState: stateManager.state,
          overlayBusy: isSceneAnimOverlayBusy(),
          occupancy: spriteOccupancy,
          hiddenMs,
          lastEndedAt: focusSessionEndStore.getLastEndedAt(),
          now: new Date()
        })
      );
    }
    syncInAppReminderBanner();
    void refreshSoftUpdateAvailability();
  });

  void refreshSoftUpdateAvailability();

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

    const funnelBtn = document.createElement('button');
    funnelBtn.type = 'button';
    funnelBtn.id = 'dev-monetization-funnel';
    funnelBtn.textContent = '意愿漏斗';
    funnelBtn.title =
      '本地付费意愿漏斗 + opt-in 状态（Support → CTA → Checkout → 完成）';
    funnelBtn.style.cssText =
      'position:fixed;top:12px;right:470px;z-index:21;padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #5a6b4a;background:#f4f8f0;color:#2c1f14;border-radius:4px;';
    funnelBtn.addEventListener('click', () => {
      const text = [
        getMonetizationFunnelStore().formatSummary(),
        '',
        formatMonetizationFunnelOptInSummary(globalThis.localStorage)
      ].join('\n');
      // eslint-disable-next-line no-alert
      globalThis.alert(text);
      console.log(text);
    });
    document.body.appendChild(funnelBtn);
    window.__monetizationFunnel = getMonetizationFunnelStore();
    window.__monetizationFunnelOptIn = {
      isEnabled: () => isMonetizationFunnelOptInEnabled(globalThis.localStorage),
      setEnabled: (on) => {
        const next = setMonetizationFunnelOptIn(globalThis.localStorage, !!on);
        if (next.enabled) void flushMonetizationFunnelUpload({ force: true });
        return next;
      },
      flush: () => flushMonetizationFunnelUpload({ force: true }),
      formatSummary: () =>
        formatMonetizationFunnelOptInSummary(globalThis.localStorage)
    };

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

    if (
      stateManager.state === STATES.FOCUSING &&
      !sessionUiGate.completionPending
    ) {
      sessionCues.tickInterval({
        elapsedSeconds: focusSession.getElapsedSeconds(),
        targetSeconds: focusSession.targetMinutes * 60,
        ambient: ambientSoundscape,
        onIntervalPlayed: () => {
          window.setTimeout(() => {
            if (stateManager.state !== STATES.FOCUSING) return;
            if (sessionUiGate.completionPending) return;
            focusAwarenessCardUI.tryShow({
              busy:
                isFocusAwarenessCardBusy() ||
                !sessionCues.isAwarenessCardEnabled()
            });
          }, 120);
        }
      });
    } else if (microBreathing) {
      sessionCues.tickInterval({
        elapsedSeconds: microElapsed ?? 0,
        targetSeconds: (microRitualUI?.getDurationMinutes?.() ?? 1) * 60,
        ambient: ambientSoundscape
      });
    }

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
    idleCompanionPipUI.syncVisibility();
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
    syncIdleYinTap();
    const companion = getDesktopCompanionBridge();
    if (companion && typeof companion.setFocusing === 'function') {
      void companion.setFocusing(stateManager.state === STATES.FOCUSING);
    }
    if (stateManager.state === STATES.FOCUSING) {
      confideToYinUI.close();
    }
    syncConfideEarChrome();
    syncInAppReminderBanner();
    if (stateManager.state === STATES.IDLE) {
      scheduleFirstCardOffers(900);
      // Practice-memory backup: Idle flush after first breath has room (not 400ms).
      schedulePracticeBackupUpload({
        storage: typeof localStorage !== 'undefined' ? localStorage : null,
        debounceMs: PRACTICE_BACKUP_IDLE_FLUSH_MS,
        forceSoon: true
      });
      scheduleYpePersonalizationIngest({
        storage: typeof localStorage !== 'undefined' ? localStorage : null,
        debounceMs: YPE_PERSONALIZATION_IDLE_FLUSH_MS,
        forceSoon: true
      });
    }
  });

  setPracticeBackupBusyProbe(() => {
    const s = stateManager.state;
    const focusing = s === STATES.FOCUSING || s === STATES.CELEBRATE;
    const overlay =
      Boolean(sessionUiGate?.postSessionOverlayActive) ||
      arrivalPractice?.isOpen?.() === true ||
      isHonestyPhaseBusy(honestyCheckInUI?.phase);
    return {
      busy: focusing || overlay,
      retry: overlay && !focusing
    };
  });
  setYpePersonalizationBusyProbe(() => {
    const s = stateManager.state;
    const focusing = s === STATES.FOCUSING || s === STATES.CELEBRATE;
    const overlay =
      Boolean(sessionUiGate?.postSessionOverlayActive) ||
      arrivalPractice?.isOpen?.() === true ||
      isHonestyPhaseBusy(honestyCheckInUI?.phase);
    return {
      busy: focusing || overlay,
      retry: overlay && !focusing
    };
  });

  // After sprite preload + shell ready: empty-whitelist restore (busy-gated).
  window.setTimeout(() => {
    void maybeRestorePracticeBackupOnBoot({
      storage: typeof localStorage !== 'undefined' ? localStorage : null
    });
    void flushYpePersonalizationDelete({
      storage: typeof localStorage !== 'undefined' ? localStorage : null,
      force: true
    });
  }, PRACTICE_BACKUP_BOOT_RESTORE_MS);

  // DEV / QA: force upload / restore without waiting for 10min debounce.
  // Product enable already force-flushes; Idle→idleFlushMs also schedules forceSoon.
  window.__practiceBackup = {
    flush: () =>
      flushPracticeBackupUpload({
        storage: typeof localStorage !== 'undefined' ? localStorage : null,
        force: true
      }),
    restore: () =>
      maybeRestorePracticeBackupOnBoot({
        storage: typeof localStorage !== 'undefined' ? localStorage : null
      }),
    status: () => {
      try {
        const raw = localStorage.getItem('focus-tiger.practice-backup.v1');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  };

  // E2E readiness: all primary UI/controllers are wired, initial syncs ran,
  // and the product shell can now be safely queried/clicked.
  window.__FT_APP_READY__ = true;
  window.dispatchEvent(new Event('ft:app-ready'));

  animate();
}

init().catch((error) => {
  console.error('初始化失败:', error);
});
