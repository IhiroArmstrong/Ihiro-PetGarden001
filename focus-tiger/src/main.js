// 入口文件：只做"拼装 + 主循环调度"，不允许直接创建 THREE.Scene() /
// THREE.PerspectiveCamera() / THREE.WebGLRenderer() 等底层对象——
// 这些必须封装在 core/Renderer.js 和 core/Scene.js 里，main.js 只负责调用。

import * as THREE from 'three';
import { createRenderer, setupSceneEnvironment } from './core/Renderer.js';
import { createScene } from './core/Scene.js';
import { createPostProcessing } from './core/PostProcessing.js';
import { FocusSession } from './core/FocusSession.js';
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
import { DynamicMotion } from './effects/DynamicMotion.js';
import { EyeTracking } from './effects/EyeTracking.js';
import { PointerInteraction } from './input/PointerInteraction.js';
import { SpriteSequencePlayer } from './character/SpriteSequencePlayer.js';
import { t, tPool, setLocale, getLocale, onLocaleChange } from './locales/i18n.js';

const DEMO_SESSION_MINUTES = 1;
const CELEBRATE_DURATION_MS = 4000;
const isPosterCapture = new URLSearchParams(location.search).has('capturePoster');

function revealScene() {
  const poster = document.getElementById('poster');
  const canvas = document.getElementById('scene-canvas');

  canvas.style.opacity = '1';
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

  const incenseGreeting = new IncenseGreeting(scene, mounts.tiger, camera);
  await incenseGreeting.init();

  const eyeTracking = new EyeTracking({
    container: app,
    canvas,
    camera,
    poseManager
  });
  eyeTracking.bind();

  const focusSession = new FocusSession(DEMO_SESSION_MINUTES);
  const stateManager = new StateManager();
  const transitionFX = new TransitionFX(scene);

  // 2D PNG 序列播放器（主线情绪表现载体）：overlay 挂在 #app、位于 3D canvas 之上、UI 之下。
  // 在 loading 遮罩下预加载首帧，避免播放时首帧卡顿。
  const spritePlayer = new SpriteSequencePlayer({ container: app });
  await spritePlayer.preload();

  const emotionController = new EmotionController({
    poseManager,
    dynamicMotion,
    incenseGreeting,
    transitionFX,
    eyeTracking,
    spritePlayer
  });
  emotionController.createDebugUI(document.body);

  if (import.meta.env.DEV) {
    window.__incenseGreeting = incenseGreeting;
    window.__poseManager = poseManager;
    window.__dynamicMotion = dynamicMotion;
    window.__emotionController = emotionController;
    window.__eyeTracking = eyeTracking;
    window.__spritePlayer = spritePlayer;
    window.__i18n = { t, tPool, setLocale, getLocale };
    window.__THREE = THREE;
  }

  console.info('[PoseManager] alignment records:', poseManager.alignmentRecords);

  PoseManager.setLoadingMaskVisible(false);

  const focusVisualizer = new FocusVisualizer(composer);
  await focusVisualizer.init(mounts.tiger);

  const moodController = new MoodController(stateManager, emotionController);
  void moodController;

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

  revealScene();

  const focusHUD = new FocusHUD(document.getElementById('focus-hud'));
  const focusButton = document.getElementById('btn-focus');

  let celebratePending = false;

  const focusInput = new FocusInput(
    () => {
      focusSession.start();
      stateManager.setState(STATES.FOCUSING);
      celebratePending = false;
    },
    () => {
      focusSession.stop();
      stateManager.setState(STATES.IDLE);
      tigerCharacter.setFocusLevel(0);
      celebratePending = false;
    }
  );

  const uiControls = new UIControls(focusInput);
  uiControls.bindAll();

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    focusSession.tick(delta);

    const focusLevel = focusSession.getFocusLevel();
    tigerCharacter.setFocusLevel(focusLevel);
    focusVisualizer.update(focusLevel);
    tigerCharacter.update(delta);
    dynamicMotion.update(delta);
    transitionFX.update(delta);
    incenseGreeting.update(delta);
    eyeTracking.update(delta);

    const tigerPos = tigerCharacter.getWorldPosition();
    transitionFX.setTigerPosition(tigerPos);

    if (
      focusLevel >= 1.0 &&
      stateManager.state === STATES.FOCUSING &&
      !celebratePending
    ) {
      celebratePending = true;
      focusSession.pause();
      stateManager.setState(STATES.CELEBRATE);

      setTimeout(() => {
        focusSession.stop();
        stateManager.setState(STATES.IDLE);
        tigerCharacter.setFocusLevel(0);
        focusInput.resetButton(focusButton);
        celebratePending = false;
      }, CELEBRATE_DURATION_MS);
    }

    focusHUD.render(focusSession, stateManager);
    composer.render();
  }

  animate();
}

init().catch((error) => {
  console.error('初始化失败:', error);
});
