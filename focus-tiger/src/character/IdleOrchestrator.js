/**
 * IdleOrchestrator —— 闭目坐禅呼吸与偶发眨眼的固定编排。
 *
 * 正式节奏（2026-07-20）：
 *   idle-breathing 完整 pingpong × N（默认 5）→ 单次 idle-eye-glance → 再呼吸 × N → …
 * 表示 Yin「偶尔看看」。**不**插入张望 / 哈欠 / 喝茶等其它动作。
 *
 * 为何不用 blink-smile：其首/末帧为睁眼微笑，与闭目 idle-breathing 硬切/叠化都会「闪一下」。
 * idle-eye-glance 为闭↔睁↔闭微表情，与闭目基底同画幅、衔接处坐姿一致。
 *
 * **衔接转场**：呼吸 ↔ 一瞥 **同姿同尺寸** → **硬切**（crossFadeMs = 0）。
 * 叠化/溶解仅用于衔接处前后帧差异大或画幅不同（见 PRINCIPLES / CAPCUT_DISSOLVE_MS）；
 * 此处滥用 cross-fade 会在 180ms 内混两帧 → 肉眼「闪一下」。
 *
 * EmotionController 只负责在 idle 生命周期 start，在非 idle 表现前 stop。
 * 从其它情绪回落 idle 时，仍可由 start(playOptions) 传入 crossFadeMs（仅首段呼吸）。
 */

/** 同源微表情 / 其它路径仍可用 ~180ms；呼吸↔一瞥 **不用**。 */
export const IDLE_VARIANT_CROSS_FADE_MS = 180;

/** 呼吸 ↔ idle-eye-glance：衔接处同姿同尺寸，禁止叠化。 */
export const IDLE_BREATH_GLANCE_SEAM_MS = 0;

/** 两次一瞥之间，idle-breathing 完整 pingpong 循环次数。 */
export const IDLE_BREATH_CYCLES_BEFORE_BLINK = 5;

export class IdleOrchestrator {
  /**
   * @param {object} deps
   * @param {import('./SpriteSequencePlayer.js').SpriteSequencePlayer} deps.player
   * @param {string} [deps.baseSequence]
   * @param {string} [deps.blinkSequence] 偶发「看看」（默认 idleEyeGlance）
   * @param {number} [deps.breathCyclesBeforeBlink] 一瞥前呼吸完整循环次数
   * @param {number} [deps.crossFadeMs] 呼吸 ↔ 一瞥 衔接（默认同姿硬切 0）
   */
  constructor({
    player,
    baseSequence = 'idleBreathing',
    blinkSequence = 'idleEyeGlance',
    breathCyclesBeforeBlink = IDLE_BREATH_CYCLES_BEFORE_BLINK,
    crossFadeMs = IDLE_BREATH_GLANCE_SEAM_MS
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

    this._active = false;
    /** @type {'idle'|'breathing'|'blink'} */
    this._phase = 'idle';
    /** 本轮呼吸阶段目标循环次数（status 用） */
    this._breathsRemaining = 0;
    this._generation = 0;
  }

  /**
   * 启动（或重启）闭目呼吸 → 偶发眨眼 节奏。
   * @param {object} [playOptions]
   * @param {number} [playOptions.crossFadeMs]
   * @param {boolean} [playOptions.freezeUntilCrossFadeEnds]
   */
  start(playOptions = {}) {
    this._active = true;
    this._generation += 1;
    this._phase = 'breathing';
    this._breathsRemaining = this.breathCyclesBeforeBlink;
    this._playBreathBlock(playOptions);
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
   * @param {{breathCyclesBeforeBlink?:number,crossFadeMs?:number}} timing
   */
  setTiming({ breathCyclesBeforeBlink, crossFadeMs } = {}) {
    if (Number.isFinite(breathCyclesBeforeBlink) && breathCyclesBeforeBlink >= 1) {
      this.breathCyclesBeforeBlink = Math.floor(breathCyclesBeforeBlink);
    }
    if (Number.isFinite(crossFadeMs)) {
      this.crossFadeMs = Math.max(0, crossFadeMs);
    }

    if (this._active) {
      this.start();
    }
  }

  getTiming() {
    return {
      breathCyclesBeforeBlink: this.breathCyclesBeforeBlink,
      crossFadeMs: this.crossFadeMs
    };
  }

  /**
   * 连续播 N 次完整呼吸 pingpong（一次 play，避免逐次 restart 接缝），再眨眼。
   * @param {object} [playOptions]
   */
  _playBreathBlock(playOptions = {}) {
    if (!this._active) return;
    const gen = this._generation;
    this._phase = 'breathing';
    this._breathsRemaining = this.breathCyclesBeforeBlink;

    const crossFadeMs =
      playOptions.crossFadeMs !== undefined
        ? playOptions.crossFadeMs
        : this.crossFadeMs;
    const freezeDuringFade =
      Number(crossFadeMs) > 0 && playOptions.freezeUntilCrossFadeEnds !== false;

    const started = this.player.play(this.baseSequence, {
      crossFadeMs,
      freezeUntilCrossFadeEnds: freezeDuringFade,
      maxCycles: this.breathCyclesBeforeBlink,
      holdLastFrame: true,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._breathsRemaining = 0;
        this._playBlink();
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
      freezeUntilCrossFadeEnds: this.crossFadeMs > 0,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._breathsRemaining = this.breathCyclesBeforeBlink;
        this._playBreathBlock({
          crossFadeMs: this.crossFadeMs,
          freezeUntilCrossFadeEnds: this.crossFadeMs > 0
        });
      }
    });
    if (!started) {
      this._breathsRemaining = this.breathCyclesBeforeBlink;
      this._playBreathBlock({
        crossFadeMs: this.crossFadeMs,
        freezeUntilCrossFadeEnds: this.crossFadeMs > 0
      });
    }
  }
}
