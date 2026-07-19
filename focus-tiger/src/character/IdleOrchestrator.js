/**
 * IdleOrchestrator —— 闭目坐禅呼吸与偶发眨眼的固定编排。
 *
 * 默认节奏（2026-07-19 拍板）：
 *   idle-breathing 完整 pingpong × N（默认 5）→ 单次 blink-smile → 再呼吸 × N → …
 * 表示 Yin「偶尔看看」；**不**再随机插入哈欠 / 张望 / 一瞥等其它动作。
 *
 * EmotionController 只负责在 idle 生命周期 start，在非 idle 表现前 stop。
 */

/** 与 dormantWake → idle 一致的回落交叉淡入时长。 */
export const IDLE_VARIANT_CROSS_FADE_MS = 180;

/** 两次眨眼之间，idle-breathing 完整 pingpong 循环次数。 */
export const IDLE_BREATH_CYCLES_BEFORE_BLINK = 5;

/** @deprecated 保留常量以免外部引用断裂；默认 idle 已不再用随机间隔池。 */
export const IDLE_VARIANT_MIN_INTERVAL_MS = 25_000;
/** @deprecated */
export const IDLE_VARIANT_MAX_INTERVAL_MS = 45_000;
/** @deprecated */
export const IDLE_VARIANT_COOLDOWN_MS = 10_000;

/** @deprecated 睁眼类权重；默认池已取消。 */
export const IDLE_VARIANT_WEIGHT_EYE_GLANCE = 1;
/** @deprecated */
export const IDLE_VARIANT_WEIGHT_BLINK_SMILE = 1;
/** @deprecated */
export const IDLE_VARIANT_WEIGHT_GAZE = 1;
/** @deprecated */
export const IDLE_VARIANT_WEIGHT_YAWN_STRETCH_SUGGESTED = 0.3;

/**
 * 历史睁眼/张望变体清单（素材仍入库）。默认 Idle **不调度**；
 * 仅供调试或显式实验传入，正式闭目坐禅路径勿启用。
 */
export const IDLE_OPEN_EYE_VARIANTS = Object.freeze([
  Object.freeze({ sequence: 'idleEyeGlance', weight: IDLE_VARIANT_WEIGHT_EYE_GLANCE }),
  Object.freeze({
    id: 'gazeLookA',
    sequences: Object.freeze(['gazeP1CenterBlinkLeft', 'gazeP2LeftToUp']),
    weight: IDLE_VARIANT_WEIGHT_GAZE
  }),
  Object.freeze({
    id: 'gazeLookB',
    sequences: Object.freeze(['gazeP3TowardRight', 'gazeP4RightToDown']),
    weight: IDLE_VARIANT_WEIGHT_GAZE
  })
]);

export class IdleOrchestrator {
  /**
   * @param {object} deps
   * @param {import('./SpriteSequencePlayer.js').SpriteSequencePlayer} deps.player
   * @param {string} [deps.baseSequence]
   * @param {string} [deps.blinkSequence] 偶发「看看」用的眨眼序列（默认 blinkSmile）
   * @param {number} [deps.breathCyclesBeforeBlink] 眨眼前呼吸完整循环次数
   * @param {number} [deps.crossFadeMs] 眨眼 ↔ 呼吸 交叉淡入
   */
  constructor({
    player,
    baseSequence = 'idleBreathing',
    blinkSequence = 'blinkSmile',
    breathCyclesBeforeBlink = IDLE_BREATH_CYCLES_BEFORE_BLINK,
    crossFadeMs = IDLE_VARIANT_CROSS_FADE_MS
  }) {
    if (!player) throw new Error('[IdleOrchestrator] 需要 SpriteSequencePlayer');

    this.player = player;
    this.baseSequence = baseSequence;
    this.blinkSequence = blinkSequence;
    this.breathCyclesBeforeBlink = Math.max(
      1,
      Math.floor(Number(breathCyclesBeforeBlink) || IDLE_BREATH_CYCLES_BEFORE_BLINK)
    );
    this.crossFadeMs = Math.max(0, Number(crossFadeMs) || 0);

    /** @deprecated 兼容旧测试 / DEV；默认空，正式路径不用随机池 */
    this.variants = [];
    this.minIntervalMs = IDLE_VARIANT_MIN_INTERVAL_MS;
    this.maxIntervalMs = IDLE_VARIANT_MAX_INTERVAL_MS;
    this.cooldownMs = IDLE_VARIANT_COOLDOWN_MS;

    this._active = false;
    /** @type {'idle'|'breathing'|'blink'} */
    this._phase = 'idle';
    /** 本轮还需完成的呼吸 pingpong 次数（到 0 则眨眼） */
    this._breathsRemaining = 0;
    this._generation = 0;
  }

  /**
   * 启动（或重启）闭目呼吸 → 偶发眨眼 节奏。
   * @param {object} [playOptions]
   * @param {number} [playOptions.crossFadeMs]
   */
  start(playOptions = {}) {
    this._active = true;
    this._generation += 1;
    this._breathsRemaining = this.breathCyclesBeforeBlink;
    this._phase = 'breathing';
    this._playNextBreath(playOptions);
  }

  /** 离开 idle：打断编排，让其他表现接管。 */
  stop({ clear = true } = {}) {
    this._active = false;
    this._generation += 1;
    this._phase = 'idle';
    this._breathsRemaining = 0;
    this.player.stop({ clear });
  }

  isActive() {
    return this._active;
  }

  /** DEV：当前编排相位（呼吸剩余次数 / 是否在眨眼）。 */
  getStatus() {
    return {
      active: this._active,
      phase: this._phase,
      breathsRemaining: this._breathsRemaining,
      breathCyclesBeforeBlink: this.breathCyclesBeforeBlink,
      currentSequence: this.player.getCurrentSequence?.() ?? null
    };
  }

  /**
   * DEV 调参：呼吸循环次数 / 交叉淡入。
   * @param {{breathCyclesBeforeBlink?:number,crossFadeMs?:number,minIntervalMs?:number,maxIntervalMs?:number,cooldownMs?:number}} timing
   */
  setTiming({
    breathCyclesBeforeBlink,
    crossFadeMs,
    minIntervalMs,
    maxIntervalMs,
    cooldownMs
  } = {}) {
    if (Number.isFinite(breathCyclesBeforeBlink) && breathCyclesBeforeBlink >= 1) {
      this.breathCyclesBeforeBlink = Math.floor(breathCyclesBeforeBlink);
    }
    if (Number.isFinite(crossFadeMs)) {
      this.crossFadeMs = Math.max(0, crossFadeMs);
    }
    if (Number.isFinite(minIntervalMs)) this.minIntervalMs = minIntervalMs;
    if (Number.isFinite(maxIntervalMs)) this.maxIntervalMs = maxIntervalMs;
    if (Number.isFinite(cooldownMs)) this.cooldownMs = cooldownMs;

    if (this._active) {
      this.start();
    }
  }

  getTiming() {
    return {
      breathCyclesBeforeBlink: this.breathCyclesBeforeBlink,
      crossFadeMs: this.crossFadeMs,
      minIntervalMs: this.minIntervalMs,
      maxIntervalMs: this.maxIntervalMs,
      cooldownMs: this.cooldownMs
    };
  }

  /**
   * 逐次播放 1 个完整 pingpong；扣减剩余次数，到 0 后眨眼。
   * （比一次性 maxCycles:N 更易验收：status.breathsRemaining 会递减。）
   */
  _playNextBreath(playOptions = {}) {
    if (!this._active) return;
    const gen = this._generation;
    this._phase = 'breathing';

    if (this._breathsRemaining <= 0) {
      this._playBlink();
      return;
    }

    const started = this.player.play(this.baseSequence, {
      crossFadeMs: playOptions.crossFadeMs,
      maxCycles: 1,
      holdLastFrame: true,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._breathsRemaining -= 1;
        if (this._breathsRemaining <= 0) {
          this._playBlink();
        } else {
          this._playNextBreath();
        }
      }
    });
    if (!started) {
      console.warn('[IdleOrchestrator] 无法播放呼吸基底，停止编排');
      this._active = false;
    }
  }

  _playBlink() {
    if (!this._active) return;
    const gen = this._generation;
    this._phase = 'blink';
    this._breathsRemaining = 0;

    const started = this.player.play(this.blinkSequence, {
      loop: false,
      loopMode: 'none',
      holdLastFrame: true,
      crossFadeMs: this.crossFadeMs,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._breathsRemaining = this.breathCyclesBeforeBlink;
        this._playNextBreath({ crossFadeMs: this.crossFadeMs });
      }
    });
    if (!started) {
      this._breathsRemaining = this.breathCyclesBeforeBlink;
      this._playNextBreath({ crossFadeMs: this.crossFadeMs });
    }
  }
}
