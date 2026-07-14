/**
 * SpriteSequencePlayer —— 2D PNG 序列帧播放器（主线情绪表现载体）。
 *
 * 定位：`EmotionController` 映射表内的**底层实现**之一，业务侧不直连本类，
 * 统一通过 `EmotionController.playEmotion()` 触发（见 `docs/ARCHITECTURE.md`
 * 「2D PNG 序列技术方案」）。
 *
 * 渲染方式（已确认 · 决定 2A）：单个 `<img>` 元素逐帧替换 `.src`。
 * - 透明 PNG 天然支持，硬件合成，无需在同一画布里做图层混合
 *   （眼睛跟随的独立瞳孔图层由 `EyeTracking` 另行叠加，不在此合成）。
 * - 帧全部经 `new Image()` 预加载进浏览器缓存，切帧命中缓存，避免首帧/切帧闪烁。
 * - 保留的 `Breathing` 呼吸效果后续用 CSS transform 叠加在 overlay 之上即可。
 *
 * 共存方式（已确认 · 决定 3A）：本类自建一个 overlay 容器挂在 `#app` 内、
 * 位于 3D `#scene-canvas`(z-index:2) 之上、`#ui-overlay`(z-index:10) 之下；
 * 默认隐藏，播放精灵情绪时才淡入，播完（非停留末帧）淡出让位给底层 3D。
 */

import { SPRITE_SEQUENCES } from './spriteManifest.js';

/**
 * @typedef {object} PlayOptions
 * @property {boolean} [loop] 覆盖清单的循环设置
 * @property {number} [fps] 覆盖清单的帧率
 * @property {boolean} [holdLastFrame] 非循环时是否停在末帧（覆盖清单）
 * @property {(sequenceName: string) => void} [onComplete] 非循环序列播完回调（循环序列不触发）
 */

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
    const overlay = document.createElement('div');
    overlay.id = 'sprite-overlay';
    overlay.style.cssText =
      'position:absolute;inset:0;z-index:3;display:flex;align-items:center;' +
      'justify-content:center;pointer-events:none;opacity:0;' +
      'transition:opacity 200ms ease;';

    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.style.cssText =
      'max-width:100%;max-height:100%;object-fit:contain;' +
      'will-change:transform;user-select:none;';

    overlay.appendChild(img);
    container.appendChild(overlay);

    this.overlayEl = overlay;
    this.imgEl = img;

    // —— 播放状态 ——
    this._raf = 0;
    this._playing = false;
    /** @type {string | null} */
    this._currentName = null;
    /** @type {string[]} */
    this._frames = [];
    this._frameIndex = 0;
    this._fps = 12;
    this._loop = false;
    this._holdLastFrame = false;
    /** @type {((name: string) => void) | null} */
    this._onComplete = null;
    this._lastFrameTime = 0;

    this._tick = this._tick.bind(this);
  }

  /**
   * 预加载一组（默认全部）序列的所有帧到浏览器缓存。
   * 应在初始化阶段（loading 遮罩下）调用，避免播放时首帧卡顿。
   * @param {string[]} [names] 需要预加载的序列名；缺省预加载清单内全部
   * @returns {Promise<this>}
   */
  async preload(names = Object.keys(this.manifest)) {
    /** @type {string[]} */
    const paths = [];
    for (const name of names) {
      const def = this.manifest[name];
      if (!def) {
        console.warn(`[SpriteSequencePlayer] preload: 未知序列 "${name}"，跳过`);
        continue;
      }
      for (const p of def.frames) paths.push(p);
    }
    await Promise.all(paths.map((p) => this._loadImage(p)));
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
    if (!def.frames || def.frames.length === 0) {
      console.warn(`[SpriteSequencePlayer] play: 序列 "${name}" 无帧，已忽略`);
      return false;
    }

    // 立即打断当前序列（满足「中途打断切换」要求）
    this._cancelRaf();

    this._currentName = name;
    this._frames = def.frames;
    this._frameIndex = 0;
    this._fps = options.fps ?? def.fps ?? 12;
    this._loop = options.loop ?? def.loop ?? false;
    this._holdLastFrame = options.holdLastFrame ?? def.holdLastFrame ?? false;
    this._onComplete =
      typeof options.onComplete === 'function' ? options.onComplete : null;

    // 预加载兜底：若首次调用前未预加载，异步补载（播放仍立即开始，靠浏览器缓存收敛）
    if (!this._allCached(this._frames)) {
      void this.preload([name]);
    }

    this._show();
    this._renderFrame(0);
    this._playing = true;
    this._lastFrameTime = performance.now();
    this._raf = requestAnimationFrame(this._tick);
    return true;
  }

  /**
   * 停止播放。
   * @param {object} [opts]
   * @param {boolean} [opts.clear] true = 隐藏 overlay；false（默认）= 停在当前帧
   */
  stop({ clear = false } = {}) {
    this._cancelRaf();
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

  /** 释放：停止播放、移除 overlay、清空缓存。 */
  dispose() {
    this._cancelRaf();
    this._playing = false;
    this.overlayEl.remove();
    this._cache.clear();
  }

  // —— 内部实现 ——

  /**
   * rAF 主循环：用累加时间对齐目标帧率，播放速度与显示器刷新率解耦。
   * @param {number} now
   */
  _tick(now) {
    if (!this._playing) return;

    const frameDur = 1000 / this._fps;
    const elapsed = now - this._lastFrameTime;

    if (elapsed >= frameDur) {
      const advance = Math.floor(elapsed / frameDur);
      this._lastFrameTime += advance * frameDur;
      const next = this._frameIndex + advance;

      if (next >= this._frames.length) {
        if (this._loop) {
          this._frameIndex = next % this._frames.length;
          this._renderFrame(this._frameIndex);
        } else {
          // 非循环：定格末帧
          this._frameIndex = this._frames.length - 1;
          if (this._holdLastFrame) this._renderFrame(this._frameIndex);
          this._finish();
          return;
        }
      } else {
        this._frameIndex = next;
        this._renderFrame(next);
      }
    }

    this._raf = requestAnimationFrame(this._tick);
  }

  /** 非循环序列自然播完的收尾。 */
  _finish() {
    this._playing = false;
    this._raf = 0;
    const cb = this._onComplete;
    const name = this._currentName;
    this._onComplete = null;
    // 不停留末帧 → 淡出 overlay，让位给底层基底态（如 3D Idle）
    if (!this._holdLastFrame) this._hide();
    if (cb && name) cb(name);
  }

  /** @param {number} index */
  _renderFrame(index) {
    const path = this._frames[index];
    if (!path) return;
    // 命中预加载缓存时，赋值 src 不会触发网络请求，浏览器直接复用解码结果
    this.imgEl.src = path;
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
