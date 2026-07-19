/**
 * IdleOrchestrator —— 闭目坐禅呼吸与偶发眨眼的固定编排。
 *
 * 正式节奏（2026-07-19 / 2026-07-20 确认）：
 *   idle-breathing 完整 pingpong × N（默认 5）→ 单次 blink-smile → 再呼吸 × N → …
 * 表示 Yin「偶尔看看」。**不**插入张望 / 哈欠 / 喝茶等其它动作
 * （那些是独立候选情绪序列，见 companionGestureCatalog，勿绑本编排器）。
 *
 * EmotionController 只负责在 idle 生命周期 start，在非 idle 表现前 stop。
 *
 * 回归锁（2026-07-20）：呼吸↔眨眼 **必须** cross-fade + freezeUntilCrossFadeEnds。
 * 只淡入却让新序列在溶解期跑帧 = 切换一刻「闪一下」（与调试变体假闪同类）。
 * 闭目呼吸 ↔ 睁眼眨眼 画幅/姿态不衔接 → 用 CapCut 式约 1s 叠代（非 180ms 微切）。
 */

/** 闭目↔睁眼不衔接：与 EmotionController.CAPCUT_DISSOLVE_MS 同值（避免循环 import）。 */
export const IDLE_VARIANT_CROSS_FADE_MS = 1000;

/** 两次眨眼之间，idle-breathing 完整 pingpong 循环次数。 */
export const IDLE_BREATH_CYCLES_BEFORE_BLINK = 5;

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

    const crossFadeMs = playOptions.crossFadeMs;
    const freezeDuringFade =
      Number(crossFadeMs) > 0 && playOptions.freezeUntilCrossFadeEnds !== false;

    const started = this.player.play(this.baseSequence, {
      crossFadeMs,
      // 溶解期间定格呼吸首帧，避免与上一姿态叠跑造成闪一下
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
      // 关键：溶解期必须定格眨眼第 1 帧，否则淡入同时跑帧 = 切换闪一下
      freezeUntilCrossFadeEnds: this.crossFadeMs > 0,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._breathsRemaining = this.breathCyclesBeforeBlink;
        this._playBreathBlock({
          crossFadeMs: this.crossFadeMs,
          freezeUntilCrossFadeEnds: true
        });
      }
    });
    if (!started) {
      this._breathsRemaining = this.breathCyclesBeforeBlink;
      this._playBreathBlock({
        crossFadeMs: this.crossFadeMs,
        freezeUntilCrossFadeEnds: true
      });
    }
  }
}
