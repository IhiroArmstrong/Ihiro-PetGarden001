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
export const MILESTONE_GLOW_HOLD_MS = 2500;

const BAKED_EFFECT_EMOTIONS = new Set([
  'celebrating',
  'milestoneGlow',
  'sessionComplete'
]);
const RUNTIME_GLOW_NEUTRAL_KEYS = new Set([
  'breathing',
  'rotation',
  'hover',
  'eyeTracking',
  'incenseComplete'
]);

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

/** Celebrating 两个 2D 变体；MVP 每次触发 50/50，不做轮换记账。 */
export const CELEBRATE_DANCE_VARIANTS = Object.freeze([
  'celebrateDance',
  'celebrateDanceV2'
]);

/**
 * @param {() => number} [random] 可注入；默认 Math.random
 * @returns {'celebrateDance' | 'celebrateDanceV2'}
 */
export function pickCelebrateDanceVariant(random = Math.random) {
  return random() < 0.5
    ? CELEBRATE_DANCE_VARIANTS[0]
    : CELEBRATE_DANCE_VARIANTS[1];
}

/** Bible 对齐的公开情绪常量；保留 camelCase 供业务层直接调用。 */
export const EMOTIONS = Object.freeze({
  milestoneGlow: 'milestoneGlow',
  sessionComplete: 'sessionComplete',
  mindfulAcknowledge: 'mindfulAcknowledge',
  stretchReminder: 'stretchReminder',
  intentionSet: 'intentionSet'
});

export class EmotionController {
  static EMOTIONS = EMOTIONS;

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
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._milestoneHoldTimer = null;
    this._milestoneHoldToken = 0;
    this._runtimeGlowSuppressed = false;

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
        const sequenceName = pickCelebrateDanceVariant(
          typeof options.random === 'function' ? options.random : Math.random
        );

        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] celebrating: spritePlayer 未接入，仅 3D 垫底；稍后回归 idle'
          );
          window.setTimeout(() => {
            this.playEmotion('idle');
            callerOnComplete?.(sequenceName);
          }, 4000);
          return;
        }

        const { random: _random, ...playOptions } = options;
        const started = this.spritePlayer.play(sequenceName, {
          ...playOptions,
          onComplete: () => {
            // 情绪来了又走：完整弧线播完 → 回归坐姿呼吸基底
            this.playEmotion('idle');
            callerOnComplete?.(sequenceName);
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.(sequenceName);
        }
      },

      // Arrival Choose 确认合十：播完不抢 Companion Mode；由调用方在 onComplete 里开门闩。
      intentionSet: (options = {}) => {
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] intentionSet: spritePlayer 未接入，直接完成'
          );
          callerOnComplete?.('intentionSet');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play('palmsTogether', {
          ...options,
          loop: false,
          loopMode: 'none',
          onComplete: () => {
            this.playEmotion('idle');
            callerOnComplete?.('intentionSet');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('intentionSet');
        }
      },

      // —— 一次性反馈（已实现：不改变基底姿态枚举）——
      incenseComplete: () => {
        // 莲花 / 金色粒子走 DOM 叠层（在 2D Yin 之上）；不再依赖可见 3D 模型。
        this.incenseGreeting.triggerDailyIncenseComplete();
      },

      // —— 2D PNG 序列帧（已接入真实素材，底层走 SpriteSequencePlayer）——
      // 里程碑金辉时刻：当前仅供调试预览，不接真实里程碑判定。
      // 序列末帧固定停留 2.5s，让烧录在末段的金光与蝴蝶自然收束后回落。
      milestoneGlow: (options = {}) => {
        this._cancelMilestoneHold();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] milestoneGlow: spritePlayer 未接入，回落 idle'
          );
          this.playEmotion('idle');
          callerOnComplete?.('milestoneGlow');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play('milestoneGlow', {
          ...options,
          loop: false,
          loopMode: 'none',
          holdLastFrame: true,
          onComplete: () => {
            this._holdMilestoneLastFrame(() => {
              this.playEmotion('idle');
              callerOnComplete?.('milestoneGlow');
            });
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('milestoneGlow');
        }
      },

      // 每次完成的完整摆尾叙事；光环与粒子已烧录，播放期关闭常规实时金光。
      sessionComplete: (options = {}) => {
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] sessionComplete: spritePlayer 未接入，回落 idle'
          );
          this.playEmotion('idle');
          callerOnComplete?.('sessionComplete');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.dynamicMotion.setBreathingEnabled(true);
        const started = this.spritePlayer.play('sessionComplete', {
          ...options,
          loop: false,
          loopMode: 'none',
          onComplete: () => {
            // 一次性反馈结束后恢复观照者坐姿呼吸基底。
            this.playEmotion('idle');
            callerOnComplete?.('sessionComplete');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('sessionComplete');
        }
      },

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

      // 歪头思考：鼠标在老虎附近静止触发；一次性播放后回归 idle-breathing。
      curiousTilt: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] curiousTilt: spritePlayer 未接入，跳过'
          );
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        const started = this.spritePlayer.play('tiltThink', {
          ...options,
          onComplete: () => {
            this.playEmotion('idle');
            callerOnComplete?.('tiltThink');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('tiltThink');
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

      // —— 阶段性正念认可（轻于 SessionComplete / Celebrating；文案走 i18n）——
      // Re-focus 通过 options.subtype === 'refocus' 复用同一小幅点头鞠躬，不另建 key。
      mindfulAcknowledge: (options = {}) => {
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] mindfulAcknowledge: spritePlayer 未接入，回落 idle'
          );
          this.playEmotion('idle');
          callerOnComplete?.('nodBow');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play('nodBow', {
          ...options,
          loop: false,
          loopMode: 'none',
          onComplete: () => {
            this.playEmotion('idle');
            callerOnComplete?.('nodBow');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('nodBow');
        }
      },
      stretchReminder: (options = {}) => {
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] stretchReminder: spritePlayer 未接入，回落 idle'
          );
          this.playEmotion('idle');
          callerOnComplete?.('stretchReminder');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play('stretchReminder', {
          ...options,
          loop: false,
          loopMode: 'none',
          onComplete: () => {
            this.playEmotion('idle');
            callerOnComplete?.('stretchReminder');
          }
        });
        if (!started) {
          this.playEmotion('idle');
          callerOnComplete?.('stretchReminder');
        }
      }
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
   * MilestoneGlow 的金光与蝴蝶已烧录在帧中；末帧按固定时长停留后直接完成。
   * @param {() => void} onComplete
   */
  _holdMilestoneLastFrame(onComplete) {
    this._cancelMilestoneHold();
    const token = ++this._milestoneHoldToken;
    this._milestoneHoldTimer = globalThis.setTimeout(() => {
      if (token !== this._milestoneHoldToken) return;
      this._milestoneHoldTimer = null;
      onComplete();
    }, MILESTONE_GLOW_HOLD_MS);
  }

  _cancelMilestoneHold() {
    this._milestoneHoldToken += 1;
    if (this._milestoneHoldTimer !== null) {
      globalThis.clearTimeout(this._milestoneHoldTimer);
      this._milestoneHoldTimer = null;
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

    if (key !== 'milestoneGlow') {
      this._cancelMilestoneHold();
    }
    if (BAKED_EFFECT_EMOTIONS.has(key)) {
      this._runtimeGlowSuppressed = true;
    } else if (!RUNTIME_GLOW_NEUTRAL_KEYS.has(key)) {
      this._runtimeGlowSuppressed = false;
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

  /** @returns {boolean} 已烧录叙事光效播放期是否应关闭常规实时金光。 */
  shouldSuppressRuntimeGlow() {
    return this._runtimeGlowSuppressed;
  }

  /**
   * 调试面板：2D 情绪按钮（走 playEmotion）。
   * 3D DynamicMotion（旋转/呼吸起伏/悬浮）仅保留给奖励柜场景，不在 2D 主界面暴露开关。
   * @param {HTMLElement} container
   */
  createDebugUI(container) {
    const buttons = [
      { key: 'idle', label: '坐禅闭眼' },
      { key: 'sleeping', label: '睡着了' },
      { key: 'smiling', label: '坐禅微笑' },
      { key: 'celebrating', label: '庆祝跳舞(2D)' },
      { key: 'intentionSet', label: '合十确认(2D)' },
      { key: 'tPose', label: 'T-Pose' },
      { key: 'incenseComplete', label: '模拟一炷香完成' },
      { key: 'milestoneGlow', label: '里程碑金辉(2D预览)' },
      { key: 'sessionComplete', label: '完成摆尾(2D)' },
      { key: 'welcomeBack', label: '挥手欢迎(2D序列)' },
      { key: 'nodGreeting', label: '点头致意(2D)' },
      { key: 'curiousTilt', label: '歪头思考(2D)' },
      { key: 'mindfulAcknowledge', label: '正念点头鞠躬(2D)' },
      { key: 'stretchReminder', label: '两小时舒展(2D)' },
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
        if (key === 'milestoneGlow' && this.spritePlayer) {
          // 约 24MB 的调试专用序列不进入启动预加载；首次点击时先完整缓存再播放。
          btn.disabled = true;
          void this.spritePlayer
            .preload(['milestoneGlow'])
            .then(() => this.playEmotion('milestoneGlow'))
            .catch((error) => {
              console.warn(
                '[EmotionController] milestoneGlow 调试素材预加载失败',
                error
              );
            })
            .finally(() => {
              btn.disabled = false;
            });
          return;
        }
        this.playEmotion(key);
      });

      group.appendChild(btn);
    });

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
  INTENTION_SET: EMOTIONS.intentionSet,
  INCENSE_COMPLETE: 'incenseComplete',
  MILESTONE_GLOW: EMOTIONS.milestoneGlow,
  SESSION_COMPLETE: EMOTIONS.sessionComplete,
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
  MINDFUL_ACKNOWLEDGE: EMOTIONS.mindfulAcknowledge,
  STRETCH_REMINDER: EMOTIONS.stretchReminder
});
