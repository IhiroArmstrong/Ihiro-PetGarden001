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
import { SPRITE_SEQUENCES } from '../character/spriteManifest.js';
import { COMPANION_GESTURE_CHAINS } from '../character/companionGestureCatalog.js';

/** @typedef {Record<string, unknown>} EmotionOptions */
/** sleeping → dormantWake 进入时的交叉淡入。 */
export const DORMANT_WAKE_CROSS_FADE_MS = 180;
/**
 * 离开 Honesty `dormantWake` 定格（睁眼坐姿）→ idle / smiling 等时的交叉淡入。
 * 须明显长于普通 180ms，避免定格硬切闭目呼吸。
 */
export const LEAVE_DORMANT_WAKE_CROSS_FADE_MS = 520;
/**
 * Arrival Breath（"Let's arrive together."）用眨眼微笑的播放帧率。
 * 默认 blink-smile 为 8fps；此处放慢约 2×，并保持微笑、不落入 idle-breathing。
 */
export const ARRIVAL_BREATH_SMILE_FPS = 4;
/** IntentionSet 合十末帧 → idle：CapCut 式约 1s 叠代溶解（两帧定格交叉淡化）。 */
export const INTENTION_SET_RETURN_CROSS_FADE_MS = 1000;
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

    /** @type {(() => void) | null} 调试「Honesty唤醒」→ 打开时长三选一 */
    this._debugHonestyWake = null;

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
          // 默认保活已在跑的「呼吸×N→眨眼」节奏；调试「坐禅闭眼」传 restart:true。
          if (
            !options.restart &&
            this.idleOrchestrator.isActive() &&
            this._currentEmotionKey === 'idle'
          ) {
            return;
          }
          this.idleOrchestrator.start({
            crossFadeMs: options.crossFadeMs,
            freezeUntilCrossFadeEnds: options.freezeUntilCrossFadeEnds
          });
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
      smiling: (options = {}) => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.IDLE_SMILING);
        if (this.spritePlayer) {
          const playOpts = {
            crossFadeMs: options.crossFadeMs
          };
          if (Number.isFinite(options.fps) && options.fps > 0) {
            playOpts.fps = options.fps;
          }
          this.spritePlayer.play('blinkSmile', playOpts);
        }
      },
      // Rise 后轻量过渡：blink-breathe pingpong 循环（可 maxCycles 后回落）。
      blinkBreathe: (options = {}) => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.IDLE_SMILING);
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] blinkBreathe: spritePlayer 未接入，回落 idle'
          );
          this._finishOneShot(options, 'blinkBreathe');
          return;
        }
        const playOpts = {
          crossFadeMs: options.crossFadeMs ?? 180,
          loop: true,
          loopMode: 'pingpong'
        };
        if (Number.isFinite(options.fps) && options.fps > 0) {
          playOpts.fps = options.fps;
        }
        const maxCycles = Number(options.maxCycles);
        if (Number.isFinite(maxCycles) && maxCycles > 0) {
          playOpts.maxCycles = maxCycles;
          playOpts.onComplete = () => this._finishOneShot(options, 'blinkBreathe');
        } else if (typeof options.onComplete === 'function') {
          playOpts.onComplete = () => options.onComplete('blinkBreathe');
        }
        const started = this.spritePlayer.play('blinkBreathe', playOpts);
        if (!started && Number.isFinite(maxCycles) && maxCycles > 0) {
          this._finishOneShot(options, 'blinkBreathe');
        }
      },
      celebrating: (options = {}) => {
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.poseManager.setPose(POSE_KEYS.CELEBRATING);
        if (this.transitionFX && !options.holdPose) {
          this.transitionFX.playCelebrateBurst();
        }
        const sequenceName = pickCelebrateDanceVariant(
          typeof options.random === 'function' ? options.random : Math.random
        );

        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] celebrating: spritePlayer 未接入，仅 3D 垫底；稍后回归 idle'
          );
          window.setTimeout(() => {
            this._finishOneShot(options, sequenceName);
          }, 4000);
          return;
        }

        const { random: _random, ...playOptions } = options;
        const started = this.spritePlayer.play(
          sequenceName,
          this._oneShotPlayOpts(playOptions, sequenceName)
        );
        if (!started) {
          this._finishOneShot(options, sequenceName);
        }
      },

      // Arrival Choose 确认合十：播完不抢 Companion Mode；由调用方在 onComplete 里开门闩。
      intentionSet: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] intentionSet: spritePlayer 未接入，直接完成'
          );
          if (typeof options.onComplete === 'function') {
            options.onComplete('intentionSet');
          }
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'palmsTogether',
          this._oneShotPlayOpts(
            {
              ...options,
              loop: false,
              loopMode: 'none',
              // 合十末帧已 displayFit 对齐 idle；短淡入掩盖残余像素差。
              // Dolly 须等本淡入结束后再拉回（见 main onIntentionSetPlay）。
              returnCrossFadeMs: INTENTION_SET_RETURN_CROSS_FADE_MS
            },
            'intentionSet'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'intentionSet');
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
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] milestoneGlow: spritePlayer 未接入，回落 idle'
          );
          this._finishOneShot(options, 'milestoneGlow');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const holdPose = Boolean(options.holdPose);
        const started = this.spritePlayer.play('milestoneGlow', {
          ...options,
          loop: false,
          loopMode: 'none',
          holdLastFrame: true,
          onComplete: () => {
            if (holdPose) {
              this._finishOneShot(options, 'milestoneGlow');
              return;
            }
            this._holdMilestoneLastFrame(() => {
              this._finishOneShot(options, 'milestoneGlow');
            });
          }
        });
        if (!started) {
          this._finishOneShot(options, 'milestoneGlow');
        }
      },

      // 每次完成的完整摆尾叙事；光环与粒子已烧录，播放期关闭常规实时金光。
      sessionComplete: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] sessionComplete: spritePlayer 未接入，回落 idle'
          );
          this._finishOneShot(options, 'sessionComplete');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.dynamicMotion.setBreathingEnabled(true);
        const started = this.spritePlayer.play(
          'sessionComplete',
          this._oneShotPlayOpts(
            { ...options, loop: false, loopMode: 'none' },
            'sessionComplete'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'sessionComplete');
        }
      },

      // WelcomeBack（挥手欢迎）：一次性响应行为；播完淡出让位回落到 Idle。
      welcomeBack: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] welcomeBack: spritePlayer 未接入，跳过（占位）'
          );
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        this.spritePlayer.play(
          'waveHello',
          this._oneShotPlayOpts(options, 'waveHello')
        );
      },

      // 点头致意：素材保留；靠近区默认不再自动触发（2026-07-19）。
      // 调试面板可手工播；播完回归 idle-breathing。
      nodGreeting: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] nodGreeting: spritePlayer 未接入，跳过（占位）'
          );
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'nodGreeting',
          this._oneShotPlayOpts(options, 'nodGreeting')
        );
        if (!started) {
          this._finishOneShot(options, 'nodGreeting');
        }
      },

      // 静止好奇：改用 blink-smile（更近坐禅姿态）。
      curiousTilt: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] curiousTilt: spritePlayer 未接入，跳过'
          );
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'blinkSmile',
          this._oneShotPlayOpts(
            {
              ...options,
              loop: false,
              loopMode: 'none',
              crossFadeMs: options.crossFadeMs ?? 180
            },
            'blinkSmile'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'blinkSmile');
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
      eyeTracking: () => {
        // 已废弃：实时瞳孔跟随鼠标；原因见 CORE_LOOP.md。保留键以免旧调用报未知。
      },

      // 眨眼微表情：单次 blink-smile；正式路径回 Idle/Smiling，调试 holdPose 定格末帧。
      blink: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn('[EmotionController] blink: spritePlayer 未接入，跳过');
          return;
        }
        const returnKey =
          this._currentEmotionKey === 'smiling' ? 'smiling' : 'idle';
        this._leaveIdleBaseline();
        this._use2DMainline();
        const holdPose = Boolean(options.holdPose);
        const callerOnComplete =
          typeof options.onComplete === 'function' ? options.onComplete : null;
        const started = this.spritePlayer.play('blinkSmile', {
          ...options,
          loop: false,
          loopMode: 'none',
          holdLastFrame: holdPose ? true : options.holdLastFrame,
          onComplete: () => {
            callerOnComplete?.('blinkSmile');
            if (!holdPose) this.playEmotion(returnKey);
          }
        });
        if (!started) {
          callerOnComplete?.('blinkSmile');
          if (!holdPose) this.playEmotion(returnKey);
        }
      },
      // 唤醒起身（调试 / 历史键）：伸懒腰 stretch-reminder 同源，与 Honesty 睡醒区分。
      wakeUp: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] wakeUp: spritePlayer 未接入，跳过'
          );
          return;
        }
        this._leaveIdleBaseline({ clear: false });
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'wakeUp',
          this._oneShotPlayOpts(options, 'wakeUp')
        );
        if (!started) {
          this._finishOneShot(options, 'wakeUp');
        }
      },
      // Honesty Check-in 唤醒：sleeping → dormant-wake → idle（暂不接金光/halo）。
      dormantWake: (options = {}) => {
        this._leaveIdleBaseline({ clear: false });
        this.dynamicMotion.setBreathingEnabled(true);

        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] dormantWake: spritePlayer 未接入，回落 idle'
          );
          window.setTimeout(() => {
            this._finishOneShot(options, 'dormantWake');
          }, 2800);
          return;
        }

        this._use2DMainline();
        const started = this.spritePlayer.play(
          'dormantWake',
          this._oneShotPlayOpts(
            {
              ...options,
              crossFadeMs:
                Number(options.crossFadeMs) || DORMANT_WAKE_CROSS_FADE_MS
            },
            'dormantWake'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'dormantWake');
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
      lookAtCursor: pendingInteraction('lookAtCursor'),
      smileSquint: pendingInteraction('smileSquint'),
      petHead: pendingInteraction('petHead'),
      dizzyBlink: pendingInteraction('dizzyBlink'),

      mindfulAcknowledge: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] mindfulAcknowledge: spritePlayer 未接入，回落 idle'
          );
          this._finishOneShot(options, 'nodBow');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'nodBow',
          this._oneShotPlayOpts(
            { ...options, loop: false, loopMode: 'none' },
            'nodBow'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'nodBow');
        }
      },
      stretchReminder: (options = {}) => {
        if (!this.spritePlayer) {
          console.warn(
            '[EmotionController] stretchReminder: spritePlayer 未接入，回落 idle'
          );
          this._finishOneShot(options, 'stretchReminder');
          return;
        }
        this._leaveIdleBaseline();
        this._use2DMainline();
        const started = this.spritePlayer.play(
          'stretchReminder',
          this._oneShotPlayOpts(
            { ...options, loop: false, loopMode: 'none' },
            'stretchReminder'
          )
        );
        if (!started) {
          this._finishOneShot(options, 'stretchReminder');
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
   * 一次性序列收尾：正式路径回落 idle；调试 holdPose 时定格末帧、不硬切默认闭目。
   * @param {EmotionOptions} options
   * @param {string} [tag]
   */
  _finishOneShot(options, tag) {
    if (typeof options.onComplete === 'function') {
      options.onComplete(tag);
    }
    if (!options.holdPose) {
      const crossFadeMs = Number(options.returnCrossFadeMs);
      if (Number.isFinite(crossFadeMs) && crossFadeMs > 0) {
        this.playEmotion('idle', {
          crossFadeMs,
          // CapCut 式：溶解期间定格 idle 首帧，避免呼吸动起来抢戏
          freezeUntilCrossFadeEnds: options.freezeUntilCrossFadeEnds !== false
        });
      } else {
        this.playEmotion('idle');
      }
    }
  }

  /**
   * 合并 holdPose → holdLastFrame，供 SpriteSequencePlayer 定格末帧。
   * @param {EmotionOptions} options
   * @param {string} tag
   */
  _oneShotPlayOpts(options, tag) {
    const holdPose = Boolean(options.holdPose);
    return {
      ...options,
      holdLastFrame: holdPose ? true : options.holdLastFrame,
      onComplete: () => this._finishOneShot(options, tag)
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

    if (key !== 'milestoneGlow') {
      this._cancelMilestoneHold();
    }
    if (BAKED_EFFECT_EMOTIONS.has(key)) {
      this._runtimeGlowSuppressed = true;
    } else if (!RUNTIME_GLOW_NEUTRAL_KEYS.has(key)) {
      this._runtimeGlowSuppressed = false;
    }

    // Honesty 睡醒定格末帧后，任何下一情绪默认加长交叉淡入，避免硬切。
    const leavingDormantWake =
      this._currentEmotionKey === 'dormantWake' && key !== 'dormantWake';
    const playOptions = leavingDormantWake
      ? {
          ...options,
          crossFadeMs:
            options.crossFadeMs ?? LEAVE_DORMANT_WAKE_CROSS_FADE_MS
        }
      : options;

    impl(playOptions);
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
   * 调试「Honesty唤醒」：打开补登时长 UI，而不是直接播 dormantWake。
   * @param {(() => void) | null} handler
   */
  setDebugHonestyWakeHandler(handler) {
    this._debugHonestyWake =
      typeof handler === 'function' ? handler : null;
  }

  /** @returns {boolean} 已烧录叙事光效播放期是否应关闭常规实时金光。 */
  shouldSuppressRuntimeGlow() {
    return this._runtimeGlowSuppressed;
  }

  /**
   * 调试面板：情绪入口 + **全部入库** `SPRITE_SEQUENCES` 逐条试播。
   * 3D DynamicMotion 仅奖励柜，不在此暴露。
   * @param {HTMLElement} container
   */
  createDebugUI(container) {
    const emotionButtons = [
      { key: 'idle', label: '坐禅闭眼' },
      { key: 'sleeping', label: '睡着了' },
      { key: 'smiling', label: '坐禅微笑' },
      { key: 'blinkBreathe', label: '眨眼深呼吸(Rise)' },
      { key: 'celebrating', label: '庆祝(随机v1/v2)' },
      { key: 'intentionSet', label: '合十确认' },
      { key: 'tPose', label: 'T-Pose' },
      { key: 'incenseComplete', label: '一炷香完成' },
      { key: 'milestoneGlow', label: '里程碑金辉' },
      { key: 'sessionComplete', label: '完成摆尾' },
      { key: 'welcomeBack', label: '挥手欢迎' },
      { key: 'nodGreeting', label: '点头致意' },
      { key: 'curiousTilt', label: '静止眨眼' },
      { key: 'mindfulAcknowledge', label: '正念点头鞠躬' },
      { key: 'stretchReminder', label: '两小时舒展' },
      { key: 'blink', label: '眨眼' },
      { key: 'wakeUp', label: '唤醒(伸懒腰)' },
      { key: 'dormantWake', label: 'Honesty唤醒(流程)' },
      { key: 'haloBreathing', label: '光环呼吸奖励' }
    ];

    /** @type {Record<string, string>} */
    const sequenceLabels = {
      idleBreathing: 'idle-breathing',
      idleEyeGlance: 'idle-eye-glance 一瞥',
      gazeP1CenterBlinkLeft: 'gaze-p1 中→眨→左',
      gazeP2LeftToUp: 'gaze-p2 左→上',
      gazeP3TowardRight: 'gaze-p3 转向右',
      gazeP4RightToDown: 'gaze-p4 右→下',
      yawnStretch: 'yawn-stretch 哈欠',
      teaDrinking: 'tea-drinking 喝茶',
      earWiggleHeadTouch: 'ear-wiggle 摇耳摸头',
      blinkBreathe: 'blink-breathe 眨眼深呼吸',
      waveHello: 'wave-hello 挥手',
      celebrateDance: 'celebrate-dance v1',
      celebrateDanceV2: 'celebrate-dance-v2',
      milestoneGlow: 'milestone-glow',
      breathHaloHq: 'breath-halo-hq 备选',
      palmsTogether: 'palms-together 合十',
      lotusFrontRising: 'lotus-front-rising',
      lotusChestHalo: 'lotus-chest-halo',
      sessionComplete: 'session-complete',
      nodBow: 'nod-bow',
      stretchReminder: 'stretch-reminder',
      wakeUp: 'wakeUp(=stretch)',
      sleeping: 'sleeping',
      dormantWake: 'dormant-wake 纯动画',
      haloBreathingIntro: 'halo-breathing intro',
      haloBreathingLoop: 'halo-breathing loop',
      haloBreathingPingpong: 'halo-breathing pingpong',
      blinkSmile: 'blink-smile',
      nodGreeting: 'nod-greeting',
      tiltThink: 'tilt-think'
    };

    const group = document.createElement('div');
    group.id = 'emotion-debug-ui';
    group.style.cssText =
      'position:fixed;top:12px;right:12px;z-index:20;display:flex;flex-direction:column;gap:6px;pointer-events:auto;max-height:calc(100vh - 24px);overflow-y:auto;padding-bottom:8px;';

    const addSectionLabel = (text) => {
      const el = document.createElement('div');
      el.style.cssText =
        'max-width:168px;font-size:10px;line-height:1.35;color:#8b7355;margin-top:8px;font-weight:600;';
      el.textContent = text;
      group.appendChild(el);
    };

    const btnCss =
      'padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b2e2e;background:#fff;color:#2c1f14;border-radius:4px;text-align:left;';
    const assetBtnCss =
      'padding:6px 10px;font-size:11px;cursor:pointer;border:1px solid #8b7355;background:#fffaf3;color:#2c1f14;border-radius:4px;text-align:left;';

    addSectionLabel('情绪入口');
    emotionButtons.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.dataset.emotionKey = key;
      btn.style.cssText = btnCss;

      btn.addEventListener('click', () => {
        if (key === 'dormantWake' && typeof this._debugHonestyWake === 'function') {
          this._debugHonestyWake();
          return;
        }
        const holdPoseKeys = new Set([
          'celebrating',
          'intentionSet',
          'milestoneGlow',
          'sessionComplete',
          'welcomeBack',
          'nodGreeting',
          'curiousTilt',
          'mindfulAcknowledge',
          'stretchReminder',
          'blink',
          'wakeUp',
          'dormantWake'
        ]);
        const opts = holdPoseKeys.has(key) ? { holdPose: true } : {};
        if (key === 'idle') opts.restart = true;

        if (key === 'incenseComplete') {
          this.playEmotion('incenseComplete');
          return;
        }
        if (key === 'milestoneGlow' && this.spritePlayer) {
          btn.disabled = true;
          void this.spritePlayer
            .preload(['milestoneGlow'])
            .then(() => this.playEmotion('milestoneGlow', opts))
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
        this.playEmotion(key, opts);
      });

      group.appendChild(btn);
    });

    const previewHint = document.createElement('div');
    previewHint.style.cssText =
      'max-width:168px;font-size:10px;line-height:1.35;color:#8b7355;margin-top:2px;';
    previewHint.textContent =
      '姿态预览：不连贯则定格末帧。点「坐禅闭眼」回呼吸×5→眨眼。候选手势用下方「入库素材 / 组合试播」，勿经 Idle 随机池。';
    group.appendChild(previewHint);

    addSectionLabel('入库素材（逐条试播）');
    const assetHint = document.createElement('div');
    assetHint.style.cssText =
      'max-width:168px;font-size:10px;line-height:1.35;color:#8b7355;';
    assetHint.textContent =
      '对照抠图：点哪条播哪条，播完定格。**不会**先切回闭目呼吸（避免假闪）。';
    group.appendChild(assetHint);

    const sequenceNames = Object.keys(SPRITE_SEQUENCES);
    sequenceNames.forEach((name) => {
      const def = SPRITE_SEQUENCES[name];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = sequenceLabels[name] ?? `${def.animation} (${name})`;
      btn.dataset.sequenceKey = name;
      btn.style.cssText = assetBtnCss;
      btn.addEventListener('click', () => {
        this._playDebugSequence(name, btn);
      });
      group.appendChild(btn);
    });

    addSectionLabel('组合试播（多段衔接·定格）');
    const chainHint = document.createElement('div');
    chainHint.style.cssText =
      'max-width:168px;font-size:10px;line-height:1.35;color:#8b7355;';
    chainHint.textContent =
      '张望整段链式试播：离开 Idle 后连续播，末帧定格。不自动、不回呼吸（避免闭目帧一闪）。';
    group.appendChild(chainHint);

    COMPANION_GESTURE_CHAINS.forEach(({ id, label, sequences }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.dataset.gestureChain = id;
      btn.style.cssText = assetBtnCss;
      btn.addEventListener('click', () => {
        this._playDebugSequenceChain(sequences, btn);
      });
      group.appendChild(btn);
    });

    container.appendChild(group);
    return group;
  }

  /**
   * 调试：直接播一条 SPRITE_SEQUENCES，便于验收抠图/衔接。
   * 离开 Idle 基底后播放；**不**先 restart 闭目呼吸（避免假闪）。
   * @param {string} sequenceName
   * @param {HTMLButtonElement} [btn]
   */
  _playDebugSequence(sequenceName, btn) {
    if (!this.spritePlayer) {
      console.warn('[EmotionController] spritePlayer 未接入，无法试播素材');
      return;
    }
    const def = SPRITE_SEQUENCES[sequenceName];
    if (!def) {
      console.warn(`[EmotionController] 未知序列 "${sequenceName}"`);
      return;
    }

    this._leaveIdleBaseline({ clear: false });
    this._use2DMainline();

    const run = () => {
      const loopMode = def.loopMode ?? 'none';
      // pingpong / forward 清单：按定义循环试播（如 breath-halo-hq、blink-breathe）
      if (loopMode === 'pingpong' || loopMode === 'forward') {
        this.spritePlayer.play(sequenceName, {
          loop: true,
          loopMode,
          holdLastFrame: false,
          crossFadeMs: 0
        });
      } else {
        this.spritePlayer.play(sequenceName, {
          loop: false,
          loopMode: 'none',
          holdLastFrame: true,
          // 调试切条：短淡入即可；0 可避免与闭目基底叠闪
          crossFadeMs: 0
        });
      }
      this._currentEmotionKey = `debug:${sequenceName}`;
    };

    if (def.preload === false) {
      if (btn) btn.disabled = true;
      void this.spritePlayer
        .preload([sequenceName])
        .then(run)
        .catch((error) => {
          console.warn(
            `[EmotionController] 预加载 ${sequenceName} 失败`,
            error
          );
        })
        .finally(() => {
          if (btn) btn.disabled = false;
        });
      return;
    }
    run();
  }

  /**
   * 调试：连续播多段序列，末帧定格；不回 Idle 呼吸（避免闭目帧闪一下）。
   * @param {ReadonlyArray<string>} sequences
   * @param {HTMLButtonElement} [btn]
   */
  _playDebugSequenceChain(sequences, btn) {
    if (!this.spritePlayer) {
      console.warn('[EmotionController] spritePlayer 未接入，无法试播组合');
      return;
    }
    const list = [...sequences].filter((name) => SPRITE_SEQUENCES[name]);
    if (list.length === 0) return;

    this._leaveIdleBaseline({ clear: false });
    this._use2DMainline();

    const needsPreload = list.filter(
      (name) => SPRITE_SEQUENCES[name]?.preload === false
    );

    const playAt = (index) => {
      const name = list[index];
      const isLast = index >= list.length - 1;
      this.spritePlayer.play(name, {
        loop: false,
        loopMode: 'none',
        holdLastFrame: true,
        crossFadeMs: 0,
        onComplete: isLast
          ? undefined
          : () => {
              playAt(index + 1);
            }
      });
      this._currentEmotionKey = `debug-chain:${list.join('+')}`;
    };

    const start = () => playAt(0);

    if (needsPreload.length > 0) {
      if (btn) btn.disabled = true;
      void this.spritePlayer
        .preload(needsPreload)
        .then(start)
        .catch((error) => {
          console.warn('[EmotionController] 组合预加载失败', error);
        })
        .finally(() => {
          if (btn) btn.disabled = false;
        });
      return;
    }
    start();
  }
}

/** 导出常量便于上层/测试引用（与 Bible 对齐的 camelCase 键） */
export const EMOTION_KEYS = Object.freeze({
  IDLE: 'idle',
  SLEEPING: 'sleeping',
  SMILING: 'smiling',
  BLINK_BREATHE: 'blinkBreathe',
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
