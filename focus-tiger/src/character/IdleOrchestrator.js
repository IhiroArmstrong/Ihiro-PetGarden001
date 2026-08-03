/**
 * IdleOrchestrator —— 闭目坐禅 Idle 两段 pingpong 编排。
 *
 * 2026-07-20：同源 `idle-breathing` 按播放序切分（用户验收帧界）：
 *   1. 闭目呼吸 `idleBreathClosed`（frame_001–019，至 videoframe_4433）pingpong ×2
 *   2. 睁眼一瞥 `idleBlinkArc`（frame_001–033，至 videoframe_6646 / 6937 前）pingpong ×1
 *   → 往复。同目录同首帧，衔接硬切 crossFadeMs=0，避免叠化闪帧。
 *
 * EmotionController 只负责在 idle 生命周期 start，在非 idle 表现前 stop。
 */

/** 跨动画变体进入时的默认叠化（与 CapCut 同长）。Idle 闭目↔睁眼弧仍用 `IDLE_BREATH_GLANCE_SEAM_MS=0`。 */
export const IDLE_VARIANT_CROSS_FADE_MS = 1000;

/** 闭目段 ↔ 眨眼弧：同素材族、首帧同为闭目，禁止叠化。 */
export const IDLE_BREATH_GLANCE_SEAM_MS = 0;

/** 闭目 pingpong 完整循环次数（默认 2）。 */
export const IDLE_BREATH_PINGPONG_CYCLES = 2;

/** 睁眼弧 pingpong 完整循环次数（默认 1）。 */
export const IDLE_BLINK_PINGPONG_CYCLES = 1;

/** @deprecated 旧 API 别名；现指闭目 pingpong 循环次数。 */
export const IDLE_BREATH_CYCLES_BEFORE_BLINK = IDLE_BREATH_PINGPONG_CYCLES;

export class IdleOrchestrator {
  /**
   * @param {object} deps
   * @param {import('./SpriteSequencePlayer.js').SpriteSequencePlayer} deps.player
   * @param {string} [deps.breathSequence]
   * @param {string} [deps.blinkSequence]
   * @param {number} [deps.breathPingpongCycles]
   * @param {number} [deps.blinkPingpongCycles]
   * @param {number} [deps.crossFadeMs]
   */
  constructor({
    player,
    breathSequence = 'idleBreathClosed',
    blinkSequence = 'idleBlinkArc',
    breathPingpongCycles = IDLE_BREATH_PINGPONG_CYCLES,
    blinkPingpongCycles = IDLE_BLINK_PINGPONG_CYCLES,
    crossFadeMs = IDLE_BREATH_GLANCE_SEAM_MS
  }) {
    if (!player) throw new Error('[IdleOrchestrator] 需要 SpriteSequencePlayer');

    this.player = player;
    this.breathSequence = breathSequence;
    this.blinkSequence = blinkSequence;
    this.breathPingpongCycles = Math.max(
      1,
      Math.floor(Number(breathPingpongCycles) || IDLE_BREATH_PINGPONG_CYCLES)
    );
    this.blinkPingpongCycles = Math.max(
      1,
      Math.floor(Number(blinkPingpongCycles) || IDLE_BLINK_PINGPONG_CYCLES)
    );
    this.crossFadeMs = Math.max(0, Number(crossFadeMs) || 0);

    this._active = false;
    /** @type {'breath'|'blink'|'idle'} */
    this._phase = 'idle';
    this._generation = 0;
  }

  /**
   * 启动（或重启）闭目 ×2 → 睁眼弧 ×1 节奏。
   * @param {object} [playOptions]
   * @param {number} [playOptions.crossFadeMs]
   * @param {boolean} [playOptions.freezeUntilCrossFadeEnds]
   */
  start(playOptions = {}) {
    this._active = true;
    this._generation += 1;
    this._playBreathBlock(playOptions);
  }

  stop({ clear = true } = {}) {
    this._active = false;
    this._generation += 1;
    this._phase = 'idle';
    this.player.stop({ clear });
  }

  isActive() {
    return this._active;
  }

  getStatus() {
    return {
      active: this._active,
      phase: this._phase,
      breathPingpongCycles: this.breathPingpongCycles,
      blinkPingpongCycles: this.blinkPingpongCycles,
      currentSequence: this.player.getCurrentSequence?.() ?? null
    };
  }

  /**
   * DEV 调参。
   * @param {{breathPingpongCycles?:number,blinkPingpongCycles?:number,breathCyclesBeforeBlink?:number,crossFadeMs?:number}} timing
   */
  setTiming({
    breathPingpongCycles,
    blinkPingpongCycles,
    breathCyclesBeforeBlink,
    crossFadeMs
  } = {}) {
    const breathCycles = breathPingpongCycles ?? breathCyclesBeforeBlink;
    if (Number.isFinite(breathCycles) && breathCycles >= 1) {
      this.breathPingpongCycles = Math.floor(breathCycles);
    }
    if (Number.isFinite(blinkPingpongCycles) && blinkPingpongCycles >= 1) {
      this.blinkPingpongCycles = Math.floor(blinkPingpongCycles);
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
      breathPingpongCycles: this.breathPingpongCycles,
      blinkPingpongCycles: this.blinkPingpongCycles,
      crossFadeMs: this.crossFadeMs
    };
  }

  /**
   * @param {object} [playOptions]
   */
  _playBreathBlock(playOptions = {}) {
    if (!this._active) return;
    const gen = this._generation;
    this._phase = 'breath';

    const crossFadeMs =
      playOptions.crossFadeMs !== undefined
        ? playOptions.crossFadeMs
        : this.crossFadeMs;
    const freezeDuringFade =
      Number(crossFadeMs) > 0 && playOptions.freezeUntilCrossFadeEnds !== false;

    const started = this.player.play(this.breathSequence, {
      loop: true,
      loopMode: 'pingpong',
      crossFadeMs,
      freezeUntilCrossFadeEnds: freezeDuringFade,
      maxCycles: this.breathPingpongCycles,
      holdLastFrame: true,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._playBlinkBlock();
      }
    });

    if (!started) {
      console.warn('[IdleOrchestrator] 无法播放闭目段，停止编排');
      this._active = false;
    }
  }

  _playBlinkBlock() {
    if (!this._active) return;
    const gen = this._generation;
    this._phase = 'blink';

    const started = this.player.play(this.blinkSequence, {
      loop: true,
      loopMode: 'pingpong',
      crossFadeMs: this.crossFadeMs,
      freezeUntilCrossFadeEnds: this.crossFadeMs > 0,
      maxCycles: this.blinkPingpongCycles,
      holdLastFrame: true,
      onComplete: () => {
        if (!this._active || gen !== this._generation) return;
        this._playBreathBlock({
          crossFadeMs: this.crossFadeMs,
          freezeUntilCrossFadeEnds: this.crossFadeMs > 0
        });
      }
    });

    if (!started) {
      this._playBreathBlock({
        crossFadeMs: this.crossFadeMs,
        freezeUntilCrossFadeEnds: this.crossFadeMs > 0
      });
    }
  }
}
