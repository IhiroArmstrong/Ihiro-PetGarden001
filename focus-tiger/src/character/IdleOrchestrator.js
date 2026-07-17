/**
 * IdleOrchestrator —— 基础闲置循环与自发小动作的独立编排层。
 *
 * 不注册 emotion key，也不把随机调度塞进 SpriteSequencePlayer。
 * EmotionController 只负责在 idle 生命周期 start，在非 idle 表现前 stop。
 */

export const IDLE_VARIANT_MIN_INTERVAL_MS = 25_000;
export const IDLE_VARIANT_MAX_INTERVAL_MS = 45_000;
export const IDLE_VARIANT_COOLDOWN_MS = 10_000;

const DEFAULT_VARIANTS = Object.freeze([
  Object.freeze({ sequence: 'idleEyeGlance', weight: 1 }),
  Object.freeze({ sequence: 'blinkSmile', weight: 1 })
]);

export class IdleOrchestrator {
  /**
   * @param {object} deps
   * @param {import('./SpriteSequencePlayer.js').SpriteSequencePlayer} deps.player
   * @param {string} [deps.baseSequence]
   * @param {{sequence:string,weight?:number}[]} [deps.variants]
   * @param {number} [deps.minIntervalMs]
   * @param {number} [deps.maxIntervalMs]
   * @param {number} [deps.cooldownMs]
   * @param {() => number} [deps.random]
   * @param {typeof setTimeout} [deps.setTimeoutFn]
   * @param {typeof clearTimeout} [deps.clearTimeoutFn]
   */
  constructor({
    player,
    baseSequence = 'idleBreathing',
    variants = DEFAULT_VARIANTS,
    minIntervalMs = IDLE_VARIANT_MIN_INTERVAL_MS,
    maxIntervalMs = IDLE_VARIANT_MAX_INTERVAL_MS,
    cooldownMs = IDLE_VARIANT_COOLDOWN_MS,
    random = Math.random,
    setTimeoutFn = (...args) => globalThis.setTimeout(...args),
    clearTimeoutFn = (...args) => globalThis.clearTimeout(...args)
  }) {
    if (!player) throw new Error('[IdleOrchestrator] 需要 SpriteSequencePlayer');

    this.player = player;
    this.baseSequence = baseSequence;
    this.variants = variants.filter((item) => item?.sequence);
    this.minIntervalMs = minIntervalMs;
    this.maxIntervalMs = maxIntervalMs;
    this.cooldownMs = cooldownMs;
    this.random = random;
    this.setTimeoutFn = setTimeoutFn;
    this.clearTimeoutFn = clearTimeoutFn;

    this._active = false;
    this._timer = null;
  }

  /**
   * 启动（或重启）基础呼吸，并从 frame 001 开始。
   * @param {object} [playOptions] 透传给 SpriteSequencePlayer（如 crossFadeMs）
   */
  start(playOptions = {}) {
    this._active = true;
    this._clearTimer();
    this.player.play(this.baseSequence, playOptions);
    this._scheduleVariant(false);
  }

  /** 离开 idle：取消随机插入并清掉 2D overlay，让其他表现接管。 */
  stop({ clear = true } = {}) {
    this._active = false;
    this._clearTimer();
    this.player.stop({ clear });
  }

  isActive() {
    return this._active;
  }

  /**
   * DEV 调参入口；修改后若正在 idle，会从当前时刻重新计时。
   * @param {{minIntervalMs?:number,maxIntervalMs?:number,cooldownMs?:number}} timing
   */
  setTiming({ minIntervalMs, maxIntervalMs, cooldownMs } = {}) {
    if (Number.isFinite(minIntervalMs)) this.minIntervalMs = minIntervalMs;
    if (Number.isFinite(maxIntervalMs)) this.maxIntervalMs = maxIntervalMs;
    if (Number.isFinite(cooldownMs)) this.cooldownMs = cooldownMs;
    if (this._active && this.player.getCurrentSequence() === this.baseSequence) {
      this._clearTimer();
      this._scheduleVariant(false);
    }
  }

  getTiming() {
    return {
      minIntervalMs: this.minIntervalMs,
      maxIntervalMs: this.maxIntervalMs,
      cooldownMs: this.cooldownMs
    };
  }

  _scheduleVariant(afterVariant) {
    if (!this._active || this.variants.length === 0) return;
    const min = Math.max(0, Math.min(this.minIntervalMs, this.maxIntervalMs));
    const max = Math.max(min, Math.max(this.minIntervalMs, this.maxIntervalMs));
    const randomDelay = min + this.random() * (max - min);
    const delay = randomDelay + (afterVariant ? Math.max(0, this.cooldownMs) : 0);
    this._timer = this.setTimeoutFn(() => this._playVariant(), delay);
  }

  _playVariant() {
    this._timer = null;
    if (!this._active) return;

    // 只有基础循环正在占用播放器时才允许自发插入；否则不抢占外部表现。
    if (
      !this.player.isPlaying() ||
      this.player.getCurrentSequence() !== this.baseSequence
    ) {
      this._scheduleVariant(false);
      return;
    }

    const variant = this._chooseVariant();
    if (!variant) return;

    const started = this.player.play(variant.sequence, {
      loop: false,
      loopMode: 'none',
      onComplete: () => {
        if (!this._active) return;
        // 变体末帧为闭眼；统一从呼吸 frame 001 重开，避免恢复到任意中间帧。
        this.player.play(this.baseSequence);
        this._scheduleVariant(true);
      }
    });
    if (!started) this._scheduleVariant(false);
  }

  _chooseVariant() {
    const weighted = this.variants.map((variant) => ({
      ...variant,
      weight: Math.max(0, variant.weight ?? 1)
    }));
    const total = weighted.reduce((sum, variant) => sum + variant.weight, 0);
    if (total <= 0) return null;

    let cursor = this.random() * total;
    for (const variant of weighted) {
      cursor -= variant.weight;
      if (cursor <= 0) return variant;
    }
    return weighted[weighted.length - 1];
  }

  _clearTimer() {
    if (this._timer == null) return;
    this.clearTimeoutFn(this._timer);
    this._timer = null;
  }
}
