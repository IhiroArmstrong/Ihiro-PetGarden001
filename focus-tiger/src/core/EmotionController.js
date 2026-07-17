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
export const DORMANT_WAKE_CROSS_FADE_MS = 180;

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
   * @param {import('../character/IdleOrchestrator.js').IdleOrchestrator} [deps.idleOrchestrator]
   */
  constructor({
    poseManager,
    dynamicMotion,
    incenseGreeting,
    transitionFX = null,
    eyeTracking = null,
    spritePlayer = null,
    idleOrchestrator = null
  }) {
    this.poseManager = poseManager;
    this.dynamicMotion = dynamicMotion;
    this.incenseGreeting = incenseGreeting;
    this.transitionFX = transitionFX;
    this.eyeTracking = eyeTracking;
    this.spritePlayer = spritePlayer;
    this.idleOrchestrator = idleOrchestrator;

    /** @type {string | null} */
    this._currentEmotionKey = null;

    /**
     * 情绪标识符 → 底层调用组合。
     * 更换渲染技术时，只改这里。
     * @type {Record<string, (options?: EmotionOptions) => void>}
     */
    this._implementations = {
      // —— 姿态层（已实现）——
      idle: (options = {}) => {
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.IDLE_CLOSED_EYES);
        // 3D 坐姿仅保留给奖励柜；主线走 2D pingpong 呼吸。
        if (this.idleOrchestrator) {
          this.idleOrchestrator.start(options);
        } else if (this.spritePlayer) {
          this.spritePlayer.play('idleBreathing', options);
        }
      },
      sleeping: () => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.SLEEPING);
        if (this.spritePlayer) {
          this.spritePlayer.play('sleeping');
        }
      },
      smiling: () => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.IDLE_SMILING);
        if (this.spritePlayer) {
          this.spritePlayer.play('blinkSmile');
        }
      },
      celebrating: (options = {}) => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.CELEBRATING);
        if (this.transitionFX) {
          this.transitionFX.playCelebrateBurst();
        }
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;

        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] celebrating: spritePlayer 未接入，仅 3D 垫底；稍后回归 idle'
          );
          window.setTimeout(() => {
            this.playEmotion('idle');
            callerOnComplete?.('celebrateDance');
          }, 4000);
          return;
        }

        const started = this.spritePlayer.play('celebrateDance', {
          ...options,
          onComplete: () => {
            // 情绪来了又走：完整弧线播完 → 回归坐姿呼吸基底
            this.playEmotion('idle');
            callerOnComplete?.('celebrateDance');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('celebrateDance');
        }
      },

      // —— 一次性反馈（已实现：不改变基底姿态枚举）——
      incenseComplete: () => {
        // 莲花 / 金色粒子走 DOM 叠层（在 2D Yin 之上）；不再依赖可见 3D 模型。
        this.incenseGreeting.triggerDailyIncenseComplete();
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
        this._leaveIdleBaseline();
        this._use2DMainline();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        this.spritePlayer.play('waveHello', {
          ...options,
          onComplete: () => {
            callerOnComplete?.('waveHello');
            // 挥手结束温和回落（不制造焦虑）：回到日常静息基底态
            this.playEmotion('idle');
          }
        });
      },

      // 点头致意：鼠标进入靠近区时的礼貌一次性反应；播完回归 idle-breathing。
      // 替代原 lookAtCursor 占位的视觉承载；检测链路仍由 PointerInteraction 驱动。
      nodGreeting: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] nodGreeting: spritePlayer 未接入，跳过（占位）'
          );
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        const started = this.spritePlayer.play('nodGreeting', {
          ...options,
          onComplete: () => {
            this.playEmotion('idle');
            callerOnComplete?.('nodGreeting');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('nodGreeting');
        }
      },

      // —— 调试专用 ——
      tPose: () => {
        this._leaveIdleBaseline();
        this.poseManager.setCanvasHidden?.(false);
        this.poseManager.setPose(POSE_KEYS.T_POSE);
      },
      t_Pose: () => {
        this._leaveIdleBaseline();
        this.poseManager.setCanvasHidden?.(false);
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

      // 眨眼微表情：单次 blink-smile，播完回到进入前的 Idle / Smiling 基底。
      blink: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn('[EmotionController] blink: spritePlayer 未接入，跳过');
          return;
        }
        const returnKey =
          this._currentEmotionKey === 'smiling' ? 'smiling' : 'idle';
        this._leaveIdleBaseline();
        this._use2DMainline();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        const started = this.spritePlayer.play('blinkSmile', {
          ...options,
          loop: false,
          loopMode: 'none',
          onComplete: () => {
            this.playEmotion(returnKey);
            callerOnComplete?.('blinkSmile');
          }
        });
        if (!started) {
          this.playEmotion(returnKey);
          callerOnComplete?.('blinkSmile');
        }
      },
      wakeUp: unimplemented('wakeUp'),
      // Honesty Check-in 唤醒：sleeping → dormant-wake → halo-breathing 奖励呼吸。
      dormantWake: (options = {}) => {
        // 保留当前 sleeping 可见帧，交给播放器双层交叉淡入 dormant_wake_001。
        this._leaveIdleBaseline({ clear: false });
        this.dynamicMotion.setBreathingEnabled(true);
        if (this.transitionFX) {
          this.transitionFX.playCelebrateBurst();
        }
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;

        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] dormantWake: spritePlayer 未接入，使用既有光效占位'
          );
          window.setTimeout(() => {
            this.playEmotion('haloBreathing');
            callerOnComplete?.('dormantWake');
          }, 2800);
          return;
        }

        this._use2DMainline();
        const started = this.spritePlayer.play('dormantWake', {
          ...options,
          crossFadeMs:
            Number(options.crossFadeMs) || DORMANT_WAKE_CROSS_FADE_MS,
          onComplete: () => {
            this.playEmotion('haloBreathing', {
              crossFadeMs: DORMANT_WAKE_CROSS_FADE_MS,
              onComplete: () => callerOnComplete?.('dormantWake')
            });
          }
        });
        if (!started) {
          this.playEmotion('haloBreathing');
          callerOnComplete?.('dormantWake');
        }
      },

      // Honesty 唤醒后的奖励：halo 引入 → 光环呼吸循环，直到下一情绪打断。
      haloBreathing: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] haloBreathing: spritePlayer 未接入，回落 idle'
          );
          this.playEmotion('idle');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        const crossFadeMs = Number(options.crossFadeMs) || 0;
        const started = this.spritePlayer.play('haloBreathingIntro', {
          crossFadeMs,
          onComplete: () => {
            this.spritePlayer.play('haloBreathingLoop');
            callerOnComplete?.('haloBreathing');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('haloBreathing');
        }
      },
      snoringZZZ: unimplemented('snoringZZZ'),
      snoringZzz: unimplemented('snoringZZZ'),

      // —— 互动反应占位（PointerInteraction 刺激 → 待接 PNG 序列）——
      // lookAtCursor：历史靠近占位键；正式视觉已改走 nodGreeting，保留键以免旧调用报未知。
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

  /** 2D 主线：隐藏 3D canvas，避免透明精灵后露出垫底老虎。 */
  _use2DMainline() {
    this.poseManager.setCanvasHidden?.(true);
  }

  /** 离开基础坐姿 / 持续 2D 态前：取消 idle 调度并让出 overlay。 */
  _leaveIdleBaseline({ clear = true } = {}) {
    if (this.idleOrchestrator?.isActive()) {
      this.idleOrchestrator.stop({ clear });
      return;
    }
    if (this.spritePlayer) {
      this.spritePlayer.stop({ clear });
    }
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
      key !== 'stretchReminder' &&
      key !== 'incenseComplete'
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
      { key: 'celebrating', label: '庆祝跳舞(2D)' },
      { key: 'tPose', label: 'T-Pose' },
      { key: 'incenseComplete', label: '模拟一炷香完成' },
      { key: 'welcomeBack', label: '挥手欢迎(2D序列)' },
      { key: 'nodGreeting', label: '点头致意(2D)' },
      { key: 'blink', label: '眨眼(blink-smile)' },
      { key: 'wakeUp', label: '唤醒(占位)' },
      { key: 'dormantWake', label: 'Honesty唤醒' },
      { key: 'haloBreathing', label: '光环呼吸奖励' }
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
  DORMANT_WAKE: 'dormantWake',
  HALO_BREATHING: 'haloBreathing',
  BLINK: 'blink',
  BREATHING: 'breathing',
  ROTATION: 'rotation',
  HOVER: 'hover',
  EYE_TRACKING: 'eyeTracking',
  SNORING_ZZZ: 'snoringZZZ',
  T_POSE: 'tPose',
  LOOK_AT_CURSOR: 'lookAtCursor',
  NOD_GREETING: 'nodGreeting',
  SMILE_SQUINT: 'smileSquint',
  PET_HEAD: 'petHead',
  DIZZY_BLINK: 'dizzyBlink',
  CURIOUS_TILT: 'curiousTilt',
  MINDFUL_ACKNOWLEDGE: 'mindfulAcknowledge',
  STRETCH_REMINDER: 'stretchReminder'
});
