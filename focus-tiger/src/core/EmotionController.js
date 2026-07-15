/**
 * EmotionController —— 上层业务与底层渲染实现之间的唯一桥梁。
 *
 * 对外只暴露 playEmotion(emotionKey, options)。
 * 换底层技术（GLB → Rive / 精灵等）时，只需重写本文件内的实现映射，
 * 不改调用方。
 *
 * 情绪标识符权威定义见 docs/EMOTION_BIBLE.md。
 */

import { POSE_KEYS } from '../character/PoseManager.js';

/** @typedef {Record<string, unknown>} EmotionOptions */

/**
 * 规范化 emotionKey：兼容 Bible PascalCase（Idle）与接口 camelCase（idle）。
 * @param {string} emotionKey
 * @returns {string}
 */
function normalizeEmotionKey(emotionKey) {
  if (!emotionKey || typeof emotionKey !== 'string') return '';
  const trimmed = emotionKey.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

/**
 * @param {string} emotionKey 规范化后的键
 * @returns {() => void}
 */
function unimplemented(emotionKey) {
  return () => {
    console.warn(
      `[EmotionController] "${emotionKey}" 尚未实现（见 EMOTION_BIBLE.md），已忽略本次调用`
    );
  };
}

/**
 * 互动反应 / 2D 序列尚未就绪时的占位：打日志方便验收检测层接线。
 * @param {string} emotionKey
 */
function pendingInteraction(emotionKey) {
  return (options = {}) => {
    console.log(
      `[EmotionController] playEmotion('${emotionKey}') — 互动动画素材待接入（占位）`,
      options
    );
  };
}

export class EmotionController {
  /**
   * @param {object} deps
   * @param {import('../character/PoseManager.js').PoseManager} deps.poseManager
   * @param {import('../effects/DynamicMotion.js').DynamicMotion} deps.dynamicMotion
   * @param {import('../effects/IncenseGreeting.js').IncenseGreeting} deps.incenseGreeting
   * @param {import('../feedback/TransitionFX.js').TransitionFX} [deps.transitionFX]
   * @param {import('../effects/EyeTracking.js').EyeTracking} [deps.eyeTracking]
   * @param {import('../character/SpriteSequencePlayer.js').SpriteSequencePlayer} [deps.spritePlayer]
   */
  constructor({
    poseManager,
    dynamicMotion,
    incenseGreeting,
    transitionFX = null,
    eyeTracking = null,
    spritePlayer = null
  }) {
    this.poseManager = poseManager;
    this.dynamicMotion = dynamicMotion;
    this.incenseGreeting = incenseGreeting;
    this.transitionFX = transitionFX;
    this.eyeTracking = eyeTracking;
    this.spritePlayer = spritePlayer;

    /** @type {string | null} */
    this._currentEmotionKey = null;

    /**
     * 情绪标识符 → 底层调用组合。
     * 更换渲染技术时，只改这里。
     * @type {Record<string, (options?: EmotionOptions) => void>}
     */
    this._implementations = {
      // —— 姿态层（已实现）——
      idle: () => {
        this.poseManager.setPose(POSE_KEYS.IDLE_CLOSED_EYES);
      },
      sleeping: () => {
        this.poseManager.setPose(POSE_KEYS.SLEEPING);
      },
      smiling: () => {
        this.poseManager.setPose(POSE_KEYS.IDLE_SMILING);
      },
      celebrating: () => {
        this.poseManager.setPose(POSE_KEYS.CELEBRATING);
        // Hover 由 DynamicMotion 在 CELEBRATING 姿态下自动叠加（受主开关控制）
        if (this.transitionFX) {
          this.transitionFX.playCelebrateBurst();
        }
        // 眼睛跟随由 EyeTracking 按姿态自动让位（闭眼/庆祝），无需改主开关
      },

      // —— 一次性反馈（已实现：不改变基底姿态枚举）——
      incenseComplete: () => {
        const model =
          this.poseManager.getActiveRoot?.() ?? this.poseManager.getVisibleRoot?.();
        if (!model) {
          console.warn('[EmotionController] incenseComplete: 无可用模型，跳过');
          return;
        }
        this.incenseGreeting.triggerDailyIncenseComplete(model);
      },

      // —— 2D PNG 序列帧（已接入真实素材，底层走 SpriteSequencePlayer）——
      // WelcomeBack（挥手欢迎）：一次性响应行为；播完淡出让位回落到 Idle。
      // 触发源见 EMOTION_BIBLE 第五部分（用户重新回来 / 10 分钟无互动 30% 挥手）。
      welcomeBack: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] welcomeBack: spritePlayer 未接入，跳过（占位）'
          );
          return;
        }
        this.spritePlayer.play('waveHello', {
          onComplete: () => {
            // 挥手结束温和回落（不制造焦虑）：回到日常静息基底态
            this.playEmotion('idle');
          },
          ...options
        });
      },

      // —— 调试专用 ——
      tPose: () => {
        this.poseManager.setPose(POSE_KEYS.T_POSE);
      },
      t_Pose: () => {
        this.poseManager.setPose(POSE_KEYS.T_POSE);
      },

      // —— 动态效果层开关（options.enabled，默认 true）——
      breathing: (options = {}) => {
        const enabled = options.enabled !== false;
        this.dynamicMotion.setBreathingEnabled(enabled);
      },
      rotation: (options = {}) => {
        const enabled = options.enabled !== false;
        this.dynamicMotion.setRotationEnabled(enabled);
      },
      hover: (options = {}) => {
        const enabled = options.enabled !== false;
        this.dynamicMotion.setHoverEnabled(enabled);
      },
      eyeTracking: (options = {}) => {
        if (!this.eyeTracking) return;
        const enabled = options.enabled !== false;
        this.eyeTracking.setEnabled(enabled);
      },

      // —— 待实现占位（EMOTION_BIBLE 基底 / 叠加）——
      blink: unimplemented('blink'),
      wakeUp: unimplemented('wakeUp'),
      snoringZZZ: unimplemented('snoringZZZ'),
      snoringZzz: unimplemented('snoringZZZ'),

      // —— 互动反应占位（PointerInteraction 刺激 → 待接 PNG 序列）——
      lookAtCursor: pendingInteraction('lookAtCursor'),
      smileSquint: pendingInteraction('smileSquint'),
      petHead: pendingInteraction('petHead'),
      dizzyBlink: pendingInteraction('dizzyBlink'),
      curiousTilt: pendingInteraction('curiousTilt'),

      // —— 阶段性正念认可（轻于 Celebrating；文案走 i18n）——
      mindfulAcknowledge: pendingInteraction('mindfulAcknowledge'),
      stretchReminder: pendingInteraction('stretchReminder')
    };
  }

  /**
   * 统一情绪播放入口。
   * @param {string} emotionKey EMOTION_BIBLE 标识符（如 'idle' / 'Idle' / 'incenseComplete'）
   * @param {EmotionOptions} [options]
   * @returns {boolean} 是否找到并执行了实现（占位也算成功执行）
   */
  playEmotion(emotionKey, options = {}) {
    const key = normalizeEmotionKey(emotionKey);
    const impl = this._implementations[key];

    if (!impl) {
      console.warn(
        `[EmotionController] 未知情绪 "${emotionKey}"（规范化: "${key}"），已忽略`
      );
      return false;
    }

    impl(options);
    // 叠加层开关及非模态提醒不抢占「当前基底情绪」记录
    if (
      key !== 'breathing' &&
      key !== 'rotation' &&
      key !== 'hover' &&
      key !== 'eyeTracking' &&
      key !== 'mindfulAcknowledge' &&
      key !== 'stretchReminder'
    ) {
      this._currentEmotionKey = key;
    }
    return true;
  }

  /** @returns {string | null} */
  getCurrentEmotionKey() {
    return this._currentEmotionKey;
  }

  /**
   * 调试面板：情绪按钮 + 动态效果层开关，全部走 playEmotion。
   * @param {HTMLElement} container
   */
  createDebugUI(container) {
    const buttons = [
      { key: 'idle', label: '坐禅闭眼' },
      { key: 'sleeping', label: '睡着了' },
      { key: 'smiling', label: '坐禅微笑' },
      { key: 'celebrating', label: '跳跃欢呼' },
      { key: 'tPose', label: 'T-Pose' },
      { key: 'incenseComplete', label: '模拟一炷香完成' },
      { key: 'welcomeBack', label: '挥手欢迎(2D序列)' },
      { key: 'blink', label: '眨眼(占位)' },
      { key: 'wakeUp', label: '唤醒(占位)' }
    ];

    const group = document.createElement('div');
    group.id = 'emotion-debug-ui';
    group.style.cssText =
      'position:fixed;top:12px;right:12px;z-index:20;display:flex;flex-direction:column;gap:6px;pointer-events:auto;';

    buttons.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.dataset.emotionKey = key;
      btn.style.cssText =
        'padding:6px 10px;font-size:12px;cursor:pointer;border:1px solid #8b2e2e;background:#fff;color:#2c1f14;border-radius:4px;';

      btn.addEventListener('click', () => {
        if (key === 'incenseComplete') {
          // 与旧调试行为一致：先切回闭眼坐禅，淡入后再播一炷香反馈
          this.playEmotion('idle');
          window.setTimeout(() => this.playEmotion('incenseComplete'), 560);
          return;
        }
        this.playEmotion(key);
      });

      group.appendChild(btn);
    });

    const layerGroup = document.createElement('div');
    layerGroup.id = 'dynamic-motion-debug-ui';
    layerGroup.style.cssText =
      'display:flex;flex-direction:column;gap:4px;margin-top:8px;padding-top:8px;border-top:1px solid #c4a882;';

    const title = document.createElement('div');
    title.textContent = '动态效果层';
    title.style.cssText = 'font-size:11px;color:#5c4a32;font-weight:600;';
    layerGroup.appendChild(title);

    const layerItems = [
      {
        id: 'dm-rotation',
        emotionKey: 'rotation',
        label: '绕 Y 轴旋转',
        get: () => this.dynamicMotion.isRotationEnabled()
      },
      {
        id: 'dm-breathing',
        emotionKey: 'breathing',
        label: '呼吸起伏',
        get: () => this.dynamicMotion.isBreathingEnabled()
      },
      {
        id: 'dm-hover',
        emotionKey: 'hover',
        label: '悬浮（仅庆祝态）',
        get: () => this.dynamicMotion.isHoverEnabled()
      },
      {
        id: 'dm-eye-tracking',
        emotionKey: 'eyeTracking',
        label: '眼睛跟随鼠标',
        get: () => this.eyeTracking?.isEnabled() ?? false,
        skip: !this.eyeTracking
      }
    ];

    layerItems.forEach(({ id, emotionKey, label, get, skip }) => {
      if (skip) return;
      const row = document.createElement('label');
      row.htmlFor = id;
      row.style.cssText =
        'display:flex;align-items:center;gap:6px;font-size:11px;color:#2c1f14;cursor:pointer;';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.checked = get();
      checkbox.addEventListener('change', () => {
        this.playEmotion(emotionKey, { enabled: checkbox.checked });
      });

      const text = document.createElement('span');
      text.textContent = label;

      row.appendChild(checkbox);
      row.appendChild(text);
      layerGroup.appendChild(row);
    });

    const hint = document.createElement('div');
    hint.id = 'dm-hover-hint';
    hint.style.cssText = 'font-size:10px;color:#8b7355;line-height:1.3;';
    hint.textContent =
      '眼睛跟随：请先切「坐禅微笑」；闭眼/欢呼时自动隐藏。悬浮仅庆祝姿态生效。';
    layerGroup.appendChild(hint);

    group.appendChild(layerGroup);
    container.appendChild(group);
    return group;
  }
}

/** 导出常量便于上层/测试引用（与 Bible 对齐的 camelCase 键） */
export const EMOTION_KEYS = Object.freeze({
  IDLE: 'idle',
  SLEEPING: 'sleeping',
  SMILING: 'smiling',
  CELEBRATING: 'celebrating',
  INCENSE_COMPLETE: 'incenseComplete',
  WELCOME_BACK: 'welcomeBack',
  WAKE_UP: 'wakeUp',
  BLINK: 'blink',
  BREATHING: 'breathing',
  ROTATION: 'rotation',
  HOVER: 'hover',
  EYE_TRACKING: 'eyeTracking',
  SNORING_ZZZ: 'snoringZZZ',
  T_POSE: 'tPose',
  LOOK_AT_CURSOR: 'lookAtCursor',
  SMILE_SQUINT: 'smileSquint',
  PET_HEAD: 'petHead',
  DIZZY_BLINK: 'dizzyBlink',
  CURIOUS_TILT: 'curiousTilt',
  MINDFUL_ACKNOWLEDGE: 'mindfulAcknowledge',
  STRETCH_REMINDER: 'stretchReminder'
});
