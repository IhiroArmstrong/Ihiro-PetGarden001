/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * SpriteSequencePlayer —— 2D PNG 序列帧播放器（主线情绪表现载体）。
 *
 * 定位：`EmotionController` 映射表内的**底层实现**之一，业务侧不直连本类，
 * 统一通过 `EmotionController.playEmotion()` 触发（见 `docs/ARCHITECTURE.md`
 * 「2D PNG 序列技术方案」）。
 *
 * 渲染方式（已确认 · 决定 2A）：单个 `<img>` 元素逐帧替换 `.src`。
 * - 透明 PNG 天然支持，硬件合成，无需在同一画布里做图层混合
 *   （历史：眼睛跟随独立瞳孔图层曾由 `EyeTracking` 叠加；该功能已废弃，见 CORE_LOOP.md）。
 * - 帧全部经 `new Image()` 预加载进浏览器缓存，切帧命中缓存，避免首帧/切帧闪烁。
 * - 保留的 `Breathing` 呼吸效果后续用 CSS transform 叠加在 overlay 之上即可。
 *
 * 共存方式（已确认 · 决定 3A）：本类自建一个 overlay 容器挂在 `#app` 内、
 * 位于 3D `#scene-canvas`(z-index:2) 之上、`#ui-overlay`(z-index:10) 之下；
 * 默认隐藏，播放精灵情绪时才淡入，播完（非停留末帧）淡出让位给底层 3D。
 */

import { SPRITE_SEQUENCES } from './spriteManifest.js';
import { buildFramePaths } from './CharacterConfig.js';
import {
  computeSpriteDisplayTransform,
  spriteDisplayTransformCss
} from './spriteDisplayFit.js';
import { playbackZoomAtIndex } from './spritePlaybackZoom.js';

/**
 * @typedef {object} PlayOptions
 * @property {boolean} [loop] 覆盖清单的循环设置
 * @property {'none'|'forward'|'pingpong'} [loopMode] 循环模式；
 *   pingpong 为正放到末帧后从倒数第二帧倒放，回到首帧后从首帧重开
 * @property {number} [fps] 覆盖清单的帧率
 * @property {boolean} [holdLastFrame] 非循环时是否停在末帧（覆盖清单）
 * @property {Record<number, number>} [frameHolds] 单帧额外停留时长覆盖（覆盖清单）；
 *   键为 1 基帧号（与帧文件名序号一致），值为该帧在 fps 间隔之上额外停留的毫秒数
 * @property {number} [crossFadeMs] 从当前可见帧交叉淡入新序列首帧的时长
 * @property {boolean} [freezeUntilCrossFadeEnds]
 *   true 时：溶解期间定格新序列第 1 帧，不推进动画（CapCut 式两帧叠代）
 * @property {number} [maxCycles] 循环序列最多完整循环次数；达到后触发 onComplete（pingpong/forward）
 * @property {{ from: number, to: number }} [playbackZoom] 覆盖清单：镜头拉近 from→to
 * @property {(sequenceName: string) => void} [onComplete] 非循环序列播完，或循环达 maxCycles 时回调
 */

export const SPRITE_LOOP_MODES = Object.freeze({
  NONE: 'none',
  FORWARD: 'forward',
  PINGPONG: 'pingpong'
});

/**
 * 纯函数：计算序列的下一帧，供播放器与单元测试共用。
 * pingpong 的末帧不重复；首帧在一轮倒放结束与下一轮正放开始之间保留两拍，
 * 与已确认序列 001…021, 020…001, 001… 对齐。
 * @param {object} state
 * @param {number} state.frameIndex
 * @param {1|-1} state.direction
 * @param {number} state.frameCount
 * @param {'none'|'forward'|'pingpong'} state.loopMode
 * @returns {{frameIndex:number,direction:1|-1,complete:boolean}}
 */
/**
 * oneshot 播完是否立刻藏 overlay。
 * 有 onComplete（常见：回 Idle CapCut）时必须保留可见末帧，否则下一 play()
 * 因 opacity===0 跳过叠化（2026-08-02 回归：挥手正+倒后无 ~1s CapCut）。
 * @param {{ holdLastFrame?: boolean, hasOnComplete?: boolean }} state
 */
export function shouldHideOverlayOnFinish({
  holdLastFrame = false,
  hasOnComplete = false
} = {}) {
  return !holdLastFrame && !hasOnComplete;
}

export function advanceSpriteFrame({
  frameIndex,
  direction,
  frameCount,
  loopMode
}) {
  if (frameCount <= 1) {
    return {
      frameIndex: 0,
      direction: 1,
      complete: loopMode === SPRITE_LOOP_MODES.NONE,
      cycleComplete: loopMode !== SPRITE_LOOP_MODES.NONE
    };
  }

  if (loopMode === SPRITE_LOOP_MODES.PINGPONG) {
    if (direction === 1) {
      if (frameIndex < frameCount - 1) {
        return {
          frameIndex: frameIndex + 1,
          direction: 1,
          complete: false,
          cycleComplete: false
        };
      }
      return {
        frameIndex: frameCount - 2,
        direction: -1,
        complete: false,
        cycleComplete: false
      };
    }
    if (frameIndex > 0) {
      return {
        frameIndex: frameIndex - 1,
        direction: -1,
        complete: false,
        cycleComplete: false
      };
    }
    // 倒放回到首帧并准备下一轮正放 → 完成一整次 pingpong 循环
    return {
      frameIndex: 0,
      direction: 1,
      complete: false,
      cycleComplete: true
    };
  }

  if (frameIndex < frameCount - 1) {
    return {
      frameIndex: frameIndex + 1,
      direction: 1,
      complete: false,
      cycleComplete: false
    };
  }
  if (loopMode === SPRITE_LOOP_MODES.FORWARD) {
    return {
      frameIndex: 0,
      direction: 1,
      complete: false,
      cycleComplete: true
    };
  }
  return {
    frameIndex,
    direction: 1,
    complete: true,
    cycleComplete: true
  };
}

export class SpriteSequencePlayer {
  /**
   * @param {object} deps
   * @param {HTMLElement} deps.container overlay 挂载容器（通常为 `#app`）
   * @param {Record<string, import('./spriteManifest.js').SpriteSequenceDef>} [deps.manifest]
   */
  constructor({ container, manifest = SPRITE_SEQUENCES }) {
    if (!container) {
      throw new Error('[SpriteSequencePlayer] 需要有效的 container');
    }
    this.manifest = manifest;

    /** 帧路径 → 已加载 Image 缓存 @type {Map<string, HTMLImageElement>} */
    this._cache = new Map();

    // —— overlay 容器（3D canvas 之上、UI 之下；默认隐藏）——
    // LightProgression Dolly 缩放挂在 overlay；舞台 inset 在 stage 上，
    // 给冷启动首屏留白呼吸感（约缩 12% + 略上抬），不改情绪序列本身。
    const overlay = document.createElement('div');
    overlay.id = 'sprite-overlay';
    overlay.style.cssText =
      // fixed + 独立合成层，确保在 WebGL canvas 上方稳定显示（仍低于 UI z-index:10）
      'position:fixed;inset:0;z-index:3;display:block;' +
      'pointer-events:none;opacity:0;' +
      'isolation:isolate;transform:translateZ(0);transition:opacity 200ms ease;';

    const stage = document.createElement('div');
    stage.id = 'sprite-stage';
    stage.className = 'ft-sprite-stage';
    // top/side/bottom：底部更多 → 角色上抬并离开球带；整体相对全屏约缩 20–22%
    stage.style.cssText =
      'position:absolute;top:6%;right:11%;bottom:20%;left:11%;' +
      'pointer-events:none;';

    const imageStyle =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;' +
      'will-change:transform,opacity;user-select:none;';
    const outgoingImg = document.createElement('img');
    outgoingImg.alt = '';
    outgoingImg.decoding = 'async';
    outgoingImg.draggable = false;
    outgoingImg.style.cssText = imageStyle + 'opacity:0;';

    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.style.cssText = imageStyle + 'opacity:1;';

    stage.appendChild(outgoingImg);
    stage.appendChild(img);
    overlay.appendChild(stage);
    container.appendChild(overlay);

    this.overlayEl = overlay;
    /** @type {HTMLElement} 角色绘制盒（inset 后的布局尺寸，供 displayFit） */
    this.stageEl = stage;
    this.imgEl = img;
    this.outgoingImgEl = outgoingImg;

    /** @type {ResizeObserver | null} */
    this._resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        this._refreshDisplayFit();
      });
      this._resizeObserver.observe(stage);
    }

    // —— 播放状态 ——
    this._raf = 0;
    this._playing = false;
    /** @type {string | null} */
    this._currentName = null;
    /** @type {import('./spriteDisplayFit.js').SpriteDisplayFit | null} */
    this._currentDisplayFit = null;
    /** @type {import('./spriteDisplayFit.js').SpriteDisplayFit | null} */
    this._outgoingDisplayFit = null;
    this._playbackZoomFrom = 1;
    this._playbackZoomTo = 1;
    this._currentZoom = 1;
    this._outgoingZoom = 1;
    /** @type {string[]} */
    this._frames = [];
    this._frameIndex = 0;
    this._fps = 12;
    this._loop = false;
    this._loopMode = SPRITE_LOOP_MODES.NONE;
    /** @type {1|-1} */
    this._direction = 1;
    this._holdLastFrame = false;
    /** 单帧额外停留（键为 1 基帧号）@type {Record<number, number>} */
    this._frameHolds = {};
    this._cyclesCompleted = 0;
    this._maxCycles = 0;
    /** @type {((name: string) => void) | null} */
    this._onComplete = null;
    this._lastFrameTime = 0;
    this._crossFadeRaf = 0;
    this._crossFadeTimer = null;

    this._tick = this._tick.bind(this);
  }

  /**
   * 预加载一组（默认全部）序列的所有帧到浏览器缓存。
   * 应在初始化阶段（loading 遮罩下）调用，避免播放时首帧卡顿。
   * @param {string[]} [names] 需要预加载的序列名；缺省预加载清单内 preload !== false 的序列
   * @returns {Promise<this>}
   */
  async preload(
    names = Object.keys(this.manifest).filter(
      (name) => this.manifest[name]?.preload !== false
    )
  ) {
    /** @type {Set<string>} */
    const paths = new Set();
    for (const name of names) {
      const def = this.manifest[name];
      if (!def) {
        console.warn(`[SpriteSequencePlayer] preload: 未知序列 "${name}"，跳过`);
        continue;
      }
      // 帧路径按「当前生效外观」实时解析（角色/装扮可替换预留）
      for (const p of this._resolveFrames(def)) paths.add(p);
    }
    await Promise.all([...paths].map((p) => this._loadImage(p)));
    return this;
  }

  /**
   * 播放指定序列。若正有序列在播，**立即打断**并切到新序列（不等当前播完）。
   * @param {string} name 序列名（见 spriteManifest）
   * @param {PlayOptions} [options]
   * @returns {boolean} 是否成功开始播放
   */
  play(name, options = {}) {
    const def = this.manifest[name];
    if (!def) {
      console.warn(`[SpriteSequencePlayer] play: 未知序列 "${name}"，已忽略`);
      return false;
    }
    const frames = this._resolveFrames(def);
    if (frames.length === 0) {
      console.warn(`[SpriteSequencePlayer] play: 序列 "${name}" 无帧，已忽略`);
      return false;
    }

    const crossFadeMs = Math.max(0, Number(options.crossFadeMs) || 0);
    const previousSrc = this.imgEl.getAttribute('src');
    const shouldCrossFade =
      crossFadeMs > 0 &&
      Boolean(previousSrc) &&
      this.overlayEl.style.opacity !== '0';

    // 立即打断当前序列（满足「中途打断切换」要求）
    this._cancelRaf();
    // 取消进行中的溶解计时，但先别把主图 opacity 强行拉回 1——
    // 否则在随后设 opacity:0 之前可能闪一帧新内容（Idle 眨眼切换曾踩坑）。
    this._cancelCrossFadeTimers();
    if (shouldCrossFade) {
      this.outgoingImgEl.style.transition = 'none';
      this.outgoingImgEl.src = previousSrc;
      this.outgoingImgEl.style.opacity = '1';
      this.imgEl.style.transition = 'none';
      this.imgEl.style.opacity = '0';
      this._outgoingDisplayFit = this._currentDisplayFit;
      this._outgoingZoom = this._currentZoom;
      this._applyDisplayFit(
        this.outgoingImgEl,
        this._outgoingDisplayFit,
        this._outgoingZoom
      );
    } else {
      this._resetCrossFade();
    }

    this._currentName = name;
    this._frames = frames;
    this._frameIndex = 0;
    this._fps = options.fps ?? def.fps ?? 12;
    this._loopMode = this._resolveLoopMode(def, options);
    this._loop = this._loopMode !== SPRITE_LOOP_MODES.NONE;
    this._direction = 1;
    this._holdLastFrame = options.holdLastFrame ?? def.holdLastFrame ?? false;
    this._frameHolds = options.frameHolds ?? def.frameHolds ?? {};
    this._cyclesCompleted = 0;
    this._maxCycles = Math.max(0, Number(options.maxCycles) || 0);
    this._onComplete =
      typeof options.onComplete === 'function' ? options.onComplete : null;
    this._currentDisplayFit = def.displayFit ?? null;
    const zoomOpt = options.playbackZoom ?? def.playbackZoom;
    this._playbackZoomFrom = Number(zoomOpt?.from);
    this._playbackZoomTo = Number(zoomOpt?.to);
    if (!Number.isFinite(this._playbackZoomFrom)) this._playbackZoomFrom = 1;
    if (!Number.isFinite(this._playbackZoomTo)) this._playbackZoomTo = 1;
    this._applyDisplayFit(this.imgEl, this._currentDisplayFit, 1);

    // 预加载兜底：若首次调用前未预加载，异步补载（播放仍立即开始，靠浏览器缓存收敛）
    if (!this._allCached(this._frames)) {
      void this.preload([name]);
    }

    this._show();
    this._renderFrame(0);

    const freezeUntilCrossFadeEnds =
      shouldCrossFade && Boolean(options.freezeUntilCrossFadeEnds);

    this._playing = true;

    if (shouldCrossFade) {
      const beginFade = () => {
        if (!this._playing || this._currentName !== name) return;
        this._startCrossFade(crossFadeMs, () => {
          if (freezeUntilCrossFadeEnds && this._playing) {
            this._beginPlaybackClock();
          }
        });
      };
      // Safari：新帧未 decode 就淡入会先绘透明/错帧 →「闪一下」。定格叠代时等解码。
      if (
        freezeUntilCrossFadeEnds &&
        typeof this.imgEl.decode === 'function'
      ) {
        this.imgEl
          .decode()
          .catch(() => {})
          .finally(beginFade);
      } else {
        beginFade();
      }
    }

    if (!freezeUntilCrossFadeEnds) {
      this._beginPlaybackClock();
    }
    return true;
  }

  /** 启动 rAF 换帧时钟（溶解结束后或无溶解时调用）。 */
  _beginPlaybackClock() {
    this._lastFrameTime = performance.now();
    if (!this._raf) {
      this._raf = requestAnimationFrame(this._tick);
    }
  }

  /**
   * 停止播放。
   * @param {object} [opts]
   * @param {boolean} [opts.clear] true = 隐藏 overlay；false（默认）= 停在当前帧
   */
  stop({ clear = false } = {}) {
    this._cancelRaf();
    this._resetCrossFade();
    this._playing = false;
    if (clear) this._hide();
  }

  /** @returns {boolean} */
  isPlaying() {
    return this._playing;
  }

  /** @returns {string | null} */
  getCurrentSequence() {
    return this._currentName;
  }

  /**
   * overlay 是否对用户可见（opacity > 0）。
   * @returns {boolean}
   */
  isOverlayVisible() {
    const opacity = Number.parseFloat(this.overlayEl.style.opacity || '0');
    return opacity > 0.01;
  }

  /**
   * 当前精灵在屏幕上的 object-fit:contain 显示框（供 EyeTracking 等叠层对齐）。
   * overlay 不可见或尚无 naturalSize 时返回 null。含 displayFit 变换。
   * @returns {{ left: number, top: number, width: number, height: number, scale: number, naturalWidth: number, naturalHeight: number } | null}
   */
  getDisplayRect() {
    if (!this.isOverlayVisible()) return null;
    const img = this.imgEl;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw || !nh) return null;

    const stageBox = this.stageEl.getBoundingClientRect();
    if (stageBox.width < 1 || stageBox.height < 1) return null;

    // displayFit 按舞台布局盒计算；Dolly 的 CSS scale 再乘到最终屏幕框上。
    const layoutW = this.stageEl.clientWidth || stageBox.width;
    const layoutH = this.stageEl.clientHeight || stageBox.height;
    const container = stageBox;
    const baseScale = Math.min(layoutW / nw, layoutH / nh);
    let width = nw * baseScale;
    let height = nh * baseScale;
    let localLeft = (layoutW - width) * 0.5;
    let localTop = (layoutH - height) * 0.5;

    const fit = computeSpriteDisplayTransform(this._currentDisplayFit, {
      width: layoutW,
      height: layoutH
    });
    if (fit.scale !== 1 || fit.tx !== 0 || fit.ty !== 0) {
      localLeft = localLeft * fit.scale + fit.tx;
      localTop = localTop * fit.scale + fit.ty;
      width *= fit.scale;
      height *= fit.scale;
    }

    // overlay 可能带 Dolly CSS scale；用 rect/layout 比估算视觉放大
    const visualScaleX = container.width / layoutW;
    const visualScaleY = container.height / layoutH;
    return {
      left: container.left + localLeft * visualScaleX,
      top: container.top + localTop * visualScaleY,
      width: width * visualScaleX,
      height: height * visualScaleY,
      scale: baseScale * fit.scale * visualScaleX,
      naturalWidth: nw,
      naturalHeight: nh
    };
  }

  /** 释放：停止播放、移除 overlay、清空缓存。 */
  dispose() {
    this._cancelRaf();
    this._resetCrossFade();
    this._playing = false;
    this.overlayEl.remove();
    this._cache.clear();
  }

  // —— 内部实现 ——

  /**
   * 按当前生效外观解析序列的帧路径（清单只存动作名 + 帧数，不存路径）。
   * @param {import('./spriteManifest.js').SpriteSequenceDef} def
   * @returns {string[]}
   */
  _resolveFrames(def) {
    if (!def.animation || !def.frameCount || def.frameCount <= 0) return [];
    return buildFramePaths(def.animation, def.frameCount, {
      startFrame: def.startFrame,
      frameIndices: def.frameIndices
    });
  }

  /**
   * 兼容既有 loop 布尔值；显式 loopMode 优先。
   * @param {import('./spriteManifest.js').SpriteSequenceDef} def
   * @param {PlayOptions} options
   * @returns {'none'|'forward'|'pingpong'}
   */
  _resolveLoopMode(def, options) {
    const explicitMode = options.loopMode;
    if (Object.values(SPRITE_LOOP_MODES).includes(explicitMode)) {
      return explicitMode;
    }
    if (options.loop === false) return SPRITE_LOOP_MODES.NONE;

    const manifestMode = def.loopMode;
    if (Object.values(SPRITE_LOOP_MODES).includes(manifestMode)) {
      return options.loop === true || def.loop !== false
        ? manifestMode
        : SPRITE_LOOP_MODES.NONE;
    }
    return options.loop ?? def.loop
      ? SPRITE_LOOP_MODES.FORWARD
      : SPRITE_LOOP_MODES.NONE;
  }

  /**
   * 当前帧应停留的总时长（ms）= fps 基础间隔 + 该帧的额外停留覆盖值。
   * `_frameHolds` 键为 1 基帧号（与帧文件名序号一致），内部索引为 0 基，故 +1。
   * @param {number} frameIndex 0 基帧索引
   * @returns {number}
   */
  _frameDurationMs(frameIndex) {
    const base = 1000 / this._fps;
    const extra = this._frameHolds[frameIndex + 1] ?? 0;
    return base + extra;
  }

  /**
   * rAF 主循环：用累加时间对齐帧时长，播放速度与显示器刷新率解耦。
   * 帧时长逐帧独立计算（支持单帧停留覆盖），落后时逐帧消耗补帧。
   * @param {number} now
   */
  _tick(now) {
    if (!this._playing) return;

    let dur = this._frameDurationMs(this._frameIndex);

    while (now - this._lastFrameTime >= dur) {
      this._lastFrameTime += dur;
      const next = advanceSpriteFrame({
        frameIndex: this._frameIndex,
        direction: this._direction,
        frameCount: this._frames.length,
        loopMode: this._loopMode
      });

      if (next.complete) {
        // 非循环：定格末帧
        this._frameIndex = this._frames.length - 1;
        if (this._holdLastFrame) this._renderFrame(this._frameIndex);
        this._finish();
        return;
      }

      this._frameIndex = next.frameIndex;
      this._direction = next.direction;
      this._renderFrame(this._frameIndex);

      if (next.cycleComplete && this._maxCycles > 0) {
        this._cyclesCompleted += 1;
        if (this._cyclesCompleted >= this._maxCycles) {
          this._finish();
          return;
        }
      }

      dur = this._frameDurationMs(this._frameIndex);
    }

    this._raf = requestAnimationFrame(this._tick);
  }

  /** 非循环序列自然播完的收尾。 */
  _finish() {
    this._cancelRaf();
    this._playing = false;
    const cb = this._onComplete;
    const name = this._currentName;
    this._onComplete = null;
    if (
      shouldHideOverlayOnFinish({
        holdLastFrame: this._holdLastFrame,
        hasOnComplete: Boolean(cb)
      })
    ) {
      this._hide();
    }
    if (cb && name) cb(name);
  }

  /** @param {number} index */
  _renderFrame(index) {
    const path = this._frames[index];
    if (!path) return;
    // 命中预加载缓存时，赋值 src 不会触发网络请求，浏览器直接复用解码结果
    // sync：叠代淡入前尽量避免 Safari 异步解码导致的透明闪帧
    this.imgEl.decoding = 'sync';
    this.imgEl.src = path;
    const zoom = playbackZoomAtIndex(
      index,
      this._frames.length,
      this._playbackZoomFrom,
      this._playbackZoomTo
    );
    this._currentZoom = zoom;
    this._applyDisplayFit(this.imgEl, this._currentDisplayFit, zoom);
  }

  /**
   * @param {string} path
   * @returns {Promise<HTMLImageElement>}
   */
  _loadImage(path) {
    const cached = this._cache.get(path);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`[SpriteSequencePlayer] 帧加载失败: ${path}`);
        resolve(img);
      };
      img.src = path;
      this._cache.set(path, img);
    });
  }

  /**
   * @param {string[]} frames
   * @returns {boolean}
   */
  _allCached(frames) {
    for (const p of frames) {
      const img = this._cache.get(p);
      if (!img || !img.complete || img.naturalWidth === 0) return false;
    }
    return true;
  }

  /**
   * @param {number} durationMs
   * @param {(() => void) | null} [onDone]
   */
  _startCrossFade(durationMs, onDone = null) {
    // 强制提交首帧的 opacity:0。Safari 单次 rAF 常不够，需双 rAF 再开 transition，
    // 否则会跳过起点直接淡入 → 闪一下。
    void this.outgoingImgEl.offsetWidth;
    void this.imgEl.offsetWidth;
    this._crossFadeRaf = requestAnimationFrame(() => {
      this._crossFadeRaf = requestAnimationFrame(() => {
        this._crossFadeRaf = 0;
        const transition = `opacity ${durationMs}ms ease-in-out`;
        this.outgoingImgEl.style.transition = transition;
        this.imgEl.style.transition = transition;
        this.outgoingImgEl.style.opacity = '0';
        this.imgEl.style.opacity = '1';
        this._crossFadeTimer = globalThis.setTimeout(() => {
          this._crossFadeTimer = null;
          this.outgoingImgEl.style.transition = 'none';
          this.imgEl.style.transition = 'none';
          this.outgoingImgEl.removeAttribute('src');
          this.outgoingImgEl.style.transform = '';
          this._outgoingDisplayFit = null;
          this._outgoingZoom = 1;
          if (typeof onDone === 'function') onDone();
        }, durationMs + 34);
      });
    });
  }

  _cancelCrossFadeTimers() {
    if (this._crossFadeRaf) {
      cancelAnimationFrame(this._crossFadeRaf);
      this._crossFadeRaf = 0;
    }
    if (this._crossFadeTimer != null) {
      globalThis.clearTimeout(this._crossFadeTimer);
      this._crossFadeTimer = null;
    }
  }

  _resetCrossFade() {
    this._cancelCrossFadeTimers();
    this.outgoingImgEl.style.transition = 'none';
    this.outgoingImgEl.style.opacity = '0';
    this.outgoingImgEl.style.transform = '';
    this.outgoingImgEl.removeAttribute('src');
    this._outgoingDisplayFit = null;
    this._outgoingZoom = 1;
    this.imgEl.style.transition = 'none';
    this.imgEl.style.opacity = '1';
  }

  /**
   * @param {HTMLImageElement} imgEl
   * @param {import('./spriteDisplayFit.js').SpriteDisplayFit | null | undefined} fitDef
   * @param {number} [zoom=1]
   */
  _applyDisplayFit(imgEl, fitDef, zoom = 1) {
    // 必须用舞台布局尺寸（clientWidth），不能用 getBoundingClientRect：
    // LightProgression Dolly 的 CSS scale 会放大 rect，但 object-fit 仍按布局盒计算。
    const width = this.stageEl.clientWidth;
    const height = this.stageEl.clientHeight;
    const t = computeSpriteDisplayTransform(fitDef, { width, height });
    const fitCss = spriteDisplayTransformCss(t);
    const z = Number(zoom);
    const useZoom = Number.isFinite(z) && Math.abs(z - 1) > 1e-6;

    if (fitCss && useZoom) {
      // displayFit 用 origin 0 0；再叠相对中心的拉近（先移到中心、缩放、移回）
      const cx = width / 2;
      const cy = height / 2;
      imgEl.style.transformOrigin = '0 0';
      imgEl.style.transform =
        `${fitCss} translate(${cx}px, ${cy}px) scale(${z}) ` +
        `translate(${-cx}px, ${-cy}px)`;
      return;
    }
    if (useZoom) {
      imgEl.style.transformOrigin = '50% 50%';
      imgEl.style.transform = `scale(${z})`;
      return;
    }
    imgEl.style.transformOrigin = '0 0';
    imgEl.style.transform = fitCss;
  }

  _refreshDisplayFit() {
    this._applyDisplayFit(
      this.imgEl,
      this._currentDisplayFit,
      this._currentZoom
    );
    if (this.outgoingImgEl.getAttribute('src')) {
      this._applyDisplayFit(
        this.outgoingImgEl,
        this._outgoingDisplayFit,
        this._outgoingZoom
      );
    }
  }

  _cancelRaf() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = 0;
    }
  }

  _show() {
    this.overlayEl.style.opacity = '1';
  }

  _hide() {
    this.overlayEl.style.opacity = '0';
  }
}
