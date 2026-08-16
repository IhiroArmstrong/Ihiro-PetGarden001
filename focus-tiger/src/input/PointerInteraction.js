/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * PointerInteraction —— 鼠标/指针刺激源检测层。
 *
 * 只负责识别 EMOTION_BIBLE「互动反应清单 · 鼠标/指针类」中的刺激，
 * 并通过 EmotionController.playEmotion() 触发；不实现底层帧动画播放。
 *
 * 老虎显示区域：由当前姿态模型包围盒投影到屏幕得到（2D 主线落地后
 * 可改为读取 DOM/sprite 矩形，检测阈值语义保持不变）。
 */

import * as THREE from 'three';
import { POSE_KEYS } from '../character/PoseManager.js';
import { EMOTION_KEYS } from '../core/EmotionController.js';

/** 可调阈值（验收报告以此为准；后续视觉手感调优时改这里） */
export const POINTER_INTERACTION_CONFIG = {
  /** 相对老虎半对角线的倍率：进入此范围视为「靠近」 */
  nearRadiusFactor: 1.35,
  /** 靠近判定下限（CSS 像素），防止模型过小时区过小 */
  nearRadiusMinPx: 120,
  /** 离开靠近区后再额外宽容一点再恢复 Idle，减少边缘抖动 */
  leaveNearHysteresisPx: 28,

  /** 头部命中：从头顶向下占老虎包围盒高度的比例 */
  headHeightRatio: 0.42,
  /** 头部命中：水平方向相对中心的半宽比例（相对包围盒半宽） */
  headHalfWidthRatio: 0.55,

  /** 抚摸：pointerdown 后累计移动超过此值（CSS px）才算抚摸而非点击 */
  petMinTravelPx: 14,
  /** 点击头顶：总移动小于此值且落在头部区 */
  clickMaxTravelPx: 10,

  /** 绕圈：采样点缓冲长度 */
  circleSampleCapacity: 48,
  /** 绕圈：有效时间窗口（ms） */
  circleWindowMs: 1400,
  /** 绕圈：累计绝对角度变化阈值（弧度），约一周，略低于 2π 以提高容错 */
  circleAngleThresholdRad: Math.PI * 1.75,
  /** 绕圈：各采样点到中心距离相对均值的最大相对偏差（标准差/均值） */
  circleRadiusCvMax: 0.45,
  /** 绕圈：至少需要的有效采样点数 */
  circleMinSamples: 10,
  /** 绕圈成功后的冷却（ms），防止连触发 */
  circleCooldownMs: 2500,

  /** 长时间静止：在靠近区内移动小于此值视为未动（CSS px） */
  stillMoveEpsilonPx: 6,
  /** 长时间静止：持续时间（ms） */
  stillDurationMs: 4000,
  /** 好奇歪头触发后冷却（ms） */
  curiousCooldownMs: 6000,

  /** lookAt 进入区触发节流：同一段靠近期内只播一次 */
  lookAtRetriggerMs: 800
};

/**
 * @param {object} deps
 * @param {HTMLCanvasElement} deps.canvas
 * @param {THREE.Camera} deps.camera
 * @param {import('../character/PoseManager.js').PoseManager} deps.poseManager
 * @param {import('../core/EmotionController.js').EmotionController} deps.emotionController
 * @param {() => void} [deps.onIdleNearStill] Slice B curiosity opportunity (Idle hover)
 */
export class PointerInteraction {
  constructor({
    canvas,
    camera,
    poseManager,
    emotionController,
    onIdleNearStill = null
  }) {
    this.canvas = canvas;
    this.camera = camera;
    this.poseManager = poseManager;
    this.emotionController = emotionController;
    this.onIdleNearStill =
      typeof onIdleNearStill === 'function' ? onIdleNearStill : null;

    this._box = new THREE.Box3();
    this._center = new THREE.Vector3();
    this._proj = new THREE.Vector3();
    this._corners = Array.from({ length: 8 }, () => new THREE.Vector3());

    /** @type {{ left: number, top: number, right: number, bottom: number, cx: number, cy: number, w: number, h: number } | null} */
    this._tigerRect = null;

    this._isNear = false;
    this._lookAtActive = false;
    this._lastLookAtAt = 0;

    /** @type {{ x: number, y: number, t: number }[]} */
    this._circleSamples = [];
    this._lastCircleAt = 0;

    this._stillAnchor = /** @type {{ x: number, y: number, since: number } | null} */ (null);
    /** @type {ReturnType<typeof setTimeout> | null} */
    this._stillTimer = null;
    this._lastCuriousAt = 0;

    this._pointerDown = false;
    this._downInHead = false;
    this._downX = 0;
    this._downY = 0;
    this._travelPx = 0;
    this._petFired = false;
    this._petIgnoredForCelebrate = false;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerCancel = this._onPointerCancel.bind(this);
  }

  bind() {
    const target = this.canvas;
    target.addEventListener('pointermove', this._onPointerMove);
    target.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('pointercancel', this._onPointerCancel);
    // 指针移出 canvas 时也要更新「离开靠近区」
    target.addEventListener('pointerleave', this._onPointerMove);
  }

  dispose() {
    const target = this.canvas;
    target.removeEventListener('pointermove', this._onPointerMove);
    target.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('pointercancel', this._onPointerCancel);
    target.removeEventListener('pointerleave', this._onPointerMove);
    this._clearStillTimer();
  }

  /** 是否处于 Celebrating（欢呼期间摸头忽略） */
  isCelebrating() {
    const key = this.emotionController.getCurrentEmotionKey?.();
    if (key === EMOTION_KEYS.CELEBRATING || key === 'celebrating') return true;
    return this.poseManager.getVisiblePoseKey?.() === POSE_KEYS.CELEBRATING;
  }

  /**
   * 仅在 idle / smiling 基底上允许响应行为（点头等）。
   * 调试试播其它姿态、睡觉、庆祝等期间禁止。
   */
  isPointerResponseAllowed() {
    if (this.isCelebrating()) return false;
    const key = this.emotionController.getCurrentEmotionKey?.();
    if (!key) return true;
    return (
      key === EMOTION_KEYS.IDLE ||
      key === 'idle' ||
      key === EMOTION_KEYS.SMILING ||
      key === 'smiling'
    );
  }

  /**
   * 静止好奇（curiousTilt）：仅 smiling 基底。
   * 闭目坐禅 idle 已有「呼吸×5→眨眼」自带偶尔看看，再插 curiousTilt 会打断节奏。
   */
  isCuriousTiltAllowed() {
    if (!this.isPointerResponseAllowed()) return false;
    const key = this.emotionController.getCurrentEmotionKey?.();
    return key === EMOTION_KEYS.SMILING || key === 'smiling';
  }

  /**
   * 刷新老虎屏幕矩形。
   * @returns {typeof this._tigerRect}
   */
  updateTigerScreenRect() {
    const root =
      this.poseManager.getVisibleRoot?.() ?? this.poseManager.getActiveRoot?.();
    if (!root) {
      this._tigerRect = null;
      return null;
    }

    this._box.setFromObject(root);
    if (this._box.isEmpty()) {
      this._tigerRect = null;
      return null;
    }

    const { min, max } = this._box;
    const pts = this._corners;
    pts[0].set(min.x, min.y, min.z);
    pts[1].set(min.x, min.y, max.z);
    pts[2].set(min.x, max.y, min.z);
    pts[3].set(min.x, max.y, max.z);
    pts[4].set(max.x, min.y, min.z);
    pts[5].set(max.x, min.y, max.z);
    pts[6].set(max.x, max.y, min.z);
    pts[7].set(max.x, max.y, max.z);

    const rect = this.canvas.getBoundingClientRect();
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < 8; i++) {
      this._proj.copy(pts[i]).project(this.camera);
      const sx = (this._proj.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-this._proj.y * 0.5 + 0.5) * rect.height + rect.top;
      left = Math.min(left, sx);
      right = Math.max(right, sx);
      top = Math.min(top, sy);
      bottom = Math.max(bottom, sy);
    }

    const w = right - left;
    const h = bottom - top;
    this._tigerRect = {
      left,
      top,
      right,
      bottom,
      cx: (left + right) * 0.5,
      cy: (top + bottom) * 0.5,
      w,
      h
    };
    return this._tigerRect;
  }

  _nearRadiusPx(rect) {
    const halfDiag = Math.hypot(rect.w, rect.h) * 0.5;
    return Math.max(
      POINTER_INTERACTION_CONFIG.nearRadiusMinPx,
      halfDiag * POINTER_INTERACTION_CONFIG.nearRadiusFactor
    );
  }

  _distanceToCenter(clientX, clientY, rect) {
    return Math.hypot(clientX - rect.cx, clientY - rect.cy);
  }

  _isInHeadRegion(clientX, clientY, rect) {
    const { headHeightRatio, headHalfWidthRatio } = POINTER_INTERACTION_CONFIG;
    // 屏幕 Y 向下增大：头部 = 从包围盒顶边向下 headHeightRatio 高度
    const headYMax = rect.top + rect.h * headHeightRatio;
    const halfW = rect.w * 0.5 * headHalfWidthRatio;
    const inY = clientY >= rect.top && clientY <= headYMax;
    const inX = Math.abs(clientX - rect.cx) <= halfW;
    return inX && inY;
  }

  _play(emotionKey, options = {}) {
    console.log(
      `[PointerInteraction] 刺激触发 → playEmotion('${emotionKey}')`,
      options
    );
    this.emotionController.playEmotion(emotionKey, options);
  }

  _onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;

    const rect = this.updateTigerScreenRect();
    if (!rect) return;

    const { clientX, clientY } = event;
    this._pointerDown = true;
    this._downX = clientX;
    this._downY = clientY;
    this._travelPx = 0;
    this._petFired = false;
    this._petIgnoredForCelebrate = false;
    this._downInHead = this._isInHeadRegion(clientX, clientY, rect);
  }

  _onPointerMove(event) {
    const rect = this.updateTigerScreenRect();
    if (!rect) return;

    const { clientX, clientY } = event;
    const dist = this._distanceToCenter(clientX, clientY, rect);
    const nearR = this._nearRadiusPx(rect);
    const leaveR = nearR + POINTER_INTERACTION_CONFIG.leaveNearHysteresisPx;
    const now = performance.now();

    // —— 抚摸：按住 + 头部起点 + 累计位移 ——
    if (this._pointerDown && this._downInHead) {
      this._travelPx = Math.hypot(clientX - this._downX, clientY - this._downY);
      if (
        !this._petFired &&
        !this._petIgnoredForCelebrate &&
        this._travelPx >= POINTER_INTERACTION_CONFIG.petMinTravelPx
      ) {
        if (this.isCelebrating()) {
          this._petIgnoredForCelebrate = true;
          console.log(
            '[PointerInteraction] 抚摸忽略：当前正在 Celebrating，不排队'
          );
        } else {
          this._petFired = true;
          this._play(EMOTION_KEYS.PET_HEAD, { travelPx: this._travelPx });
        }
      }
    }

    // —— 靠近 / 离开 ——
    // 2026-07-19：默认态不再自动播 nodGreeting（用户反馈：开局默认动画里不应有点头）。
    // 素材与调试「点头致意」保留；靠近区仍用于 curiousTilt（仅 smiling）等。
    if (!this._isNear && dist <= nearR) {
      this._isNear = true;
      this._resetStillAnchor(clientX, clientY, now);
      this._circleSamples = [];
    } else if (this._isNear && dist > leaveR) {
      this._isNear = false;
      this._stillAnchor = null;
      this._clearStillTimer();
      this._circleSamples = [];
      this._lookAtActive = false;
    }

    if (!this._isNear) return;

    // —— 长时间静止 → curiousTilt ——
    this._updateStill(clientX, clientY, now);

    // —— 快速绕圈 → dizzyBlink ——
    this._updateCircle(clientX, clientY, now, rect);
  }

  _updateStill(clientX, clientY, now) {
    if (!this._stillAnchor) {
      this._resetStillAnchor(clientX, clientY, now);
      return;
    }

    const moved = Math.hypot(
      clientX - this._stillAnchor.x,
      clientY - this._stillAnchor.y
    );
    if (moved > POINTER_INTERACTION_CONFIG.stillMoveEpsilonPx) {
      this._resetStillAnchor(clientX, clientY, now);
      return;
    }

    this._tryTriggerStill(now);
  }

  _resetStillAnchor(clientX, clientY, now) {
    this._stillAnchor = { x: clientX, y: clientY, since: now };
    this._scheduleStillCheck(now);
  }

  _clearStillTimer() {
    if (this._stillTimer === null) return;
    globalThis.clearTimeout(this._stillTimer);
    this._stillTimer = null;
  }

  /**
   * 独立计时器保证鼠标完全静止、不再产生 pointermove 时仍可触发。
   * pointermove 只负责在位移超过阈值时重置锚点与倒计时。
   */
  _scheduleStillCheck(now = performance.now()) {
    this._clearStillTimer();
    if (!this._isNear || !this._stillAnchor) return;

    const stillRemaining = Math.max(
      0,
      POINTER_INTERACTION_CONFIG.stillDurationMs -
        (now - this._stillAnchor.since)
    );
    const cooldownRemaining = Math.max(
      0,
      POINTER_INTERACTION_CONFIG.curiousCooldownMs -
        (now - this._lastCuriousAt)
    );
    const delay = Math.max(stillRemaining, cooldownRemaining);

    this._stillTimer = globalThis.setTimeout(() => {
      this._stillTimer = null;
      this._tryTriggerStill(performance.now());
    }, delay);
  }

  _tryTriggerStill(now) {
    if (!this._isNear || !this._stillAnchor) {
      this._clearStillTimer();
      return;
    }

    const elapsed = now - this._stillAnchor.since;
    const cooldownElapsed = now - this._lastCuriousAt;
    if (
      elapsed >= POINTER_INTERACTION_CONFIG.stillDurationMs &&
      cooldownElapsed >= POINTER_INTERACTION_CONFIG.curiousCooldownMs
    ) {
      if (this.isCuriousTiltAllowed()) {
        this._lastCuriousAt = now;
        const { x, y } = this._stillAnchor;
        this._stillAnchor = { x, y, since: now };
        this._play(EMOTION_KEYS.CURIOUS_TILT, { stillMs: elapsed });
      } else if (
        this.onIdleNearStill &&
        this.isPointerResponseAllowed() &&
        !this.isCuriousTiltAllowed()
      ) {
        // Idle 靠近悬停：交给 Scene Animation Dispatcher（5% + 1h 冷却）
        const key = this.emotionController.getCurrentEmotionKey?.();
        if (key === EMOTION_KEYS.IDLE || key === 'idle' || !key) {
          this._lastCuriousAt = now;
          const { x, y } = this._stillAnchor;
          this._stillAnchor = { x, y, since: now };
          this.onIdleNearStill();
        }
      }
    }

    // 保留既有冷却语义；非 idle 基底（含 Celebrating / 调试试播）时短暂后再检查但不排队动作。
    const retryNow = performance.now();
    if (!this.isPointerResponseAllowed()) {
      this._clearStillTimer();
      this._stillTimer = globalThis.setTimeout(() => {
        this._stillTimer = null;
        this._tryTriggerStill(performance.now());
      }, 250);
      return;
    }
    this._scheduleStillCheck(retryNow);
  }

  _updateCircle(clientX, clientY, now, rect) {
    if (now - this._lastCircleAt < POINTER_INTERACTION_CONFIG.circleCooldownMs) {
      return;
    }

    const samples = this._circleSamples;
    samples.push({ x: clientX, y: clientY, t: now });
    const windowMs = POINTER_INTERACTION_CONFIG.circleWindowMs;
    while (samples.length && now - samples[0].t > windowMs) {
      samples.shift();
    }
    if (samples.length > POINTER_INTERACTION_CONFIG.circleSampleCapacity) {
      samples.splice(0, samples.length - POINTER_INTERACTION_CONFIG.circleSampleCapacity);
    }

    if (samples.length < POINTER_INTERACTION_CONFIG.circleMinSamples) return;

    const cx = rect.cx;
    const cy = rect.cy;
    let angleSum = 0;
    /** @type {number[]} */
    const radii = [];
    let prevAngle = Math.atan2(samples[0].y - cy, samples[0].x - cx);
    radii.push(Math.hypot(samples[0].x - cx, samples[0].y - cy));

    for (let i = 1; i < samples.length; i++) {
      const ang = Math.atan2(samples[i].y - cy, samples[i].x - cx);
      let delta = ang - prevAngle;
      // 展开到 (-π, π]
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      angleSum += delta;
      prevAngle = ang;
      radii.push(Math.hypot(samples[i].x - cx, samples[i].y - cy));
    }

    const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
    if (meanR < 8) return;
    let varSum = 0;
    for (const r of radii) varSum += (r - meanR) ** 2;
    const cv = Math.sqrt(varSum / radii.length) / meanR;

    if (
      Math.abs(angleSum) >= POINTER_INTERACTION_CONFIG.circleAngleThresholdRad &&
      cv <= POINTER_INTERACTION_CONFIG.circleRadiusCvMax
    ) {
      this._lastCircleAt = now;
      this._circleSamples = [];
      this._play(EMOTION_KEYS.DIZZY_BLINK, {
        angleSumRad: angleSum,
        radiusCv: cv,
        sampleCount: samples.length
      });
    }
  }

  _onPointerUp(event) {
    if (!this._pointerDown) return;

    const wasDownInHead = this._downInHead;
    const travel = this._travelPx;
    const petFired = this._petFired;
    const petIgnored = this._petIgnoredForCelebrate;

    this._pointerDown = false;
    this._downInHead = false;

    // 轻点头顶（非抚摸）→ smileSquint
    if (
      wasDownInHead &&
      !petFired &&
      !petIgnored &&
      travel <= POINTER_INTERACTION_CONFIG.clickMaxTravelPx
    ) {
      const rect = this.updateTigerScreenRect();
      const { clientX, clientY } = event;
      if (rect && this._isInHeadRegion(clientX, clientY, rect)) {
        this._play(EMOTION_KEYS.SMILE_SQUINT, { travelPx: travel });
      } else if (rect && wasDownInHead && travel <= POINTER_INTERACTION_CONFIG.clickMaxTravelPx) {
        // 起点在头、抬起时轻微偏移仍算点击
        this._play(EMOTION_KEYS.SMILE_SQUINT, { travelPx: travel });
      }
    }
  }

  _onPointerCancel() {
    this._pointerDown = false;
    this._downInHead = false;
    this._petFired = false;
    this._petIgnoredForCelebrate = false;
  }
}
