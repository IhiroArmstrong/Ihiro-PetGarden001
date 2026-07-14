/**
 * EyeTracking —— 眼睛/瞳孔独立图层跟随鼠标（非 PNG 序列）。
 *
 * 瞳孔叠在脸部主体之上，在受限椭圆内阻尼跟随鼠标方向。
 * 闭眼类状态与 Celebrating 期间自动让位（隐藏 + 回正），
 * 亦可通过 setEnabled(false) 被外部暂停。
 *
 * 素材：默认使用 CSS 占位圆点；就绪后将 EYE_TRACKING_CONFIG.pupilImageUrl
 * 设为透明底瞳孔 PNG 路径即可替换。
 */

import * as THREE from 'three';
import { POSE_KEYS } from '../character/PoseManager.js';

/** @typedef {'IDLE_CLOSED_EYES'|'SLEEPING'|'IDLE_SMILING'|'CELEBRATING'|'T_POSE'} PoseKey */

export const EYE_TRACKING_CONFIG = {
  /**
   * 正式瞳孔图（透明底 PNG）。为空则使用占位圆点。
   * 建议规格见文件末尾注释 / 实现报告。
   */
  pupilImageUrl: '',

  /** 瞳孔显示尺寸（CSS px） */
  pupilSizePx: 11,

  /** 最大水平偏移（相对默认居中，CSS px） */
  maxOffsetXPx: 7,

  /** 最大垂直偏移（CSS px）——略小于 X，形成扁椭圆眼眶感 */
  maxOffsetYPx: 4.5,

  /**
   * 阻尼跟随速度（越大越跟手）。
   * 每帧：offset += (target - offset) * (1 - exp(-followDamping * dt))
   */
  followDamping: 14,

  /** 相对老虎屏幕包围盒：眼部纵向（从头顶向下的高度比例） */
  eyeYFromTopRatio: 0.22,

  /** 相对包围盒半宽：左右眼距中心的水平比例 */
  eyeHalfSpacingRatio: 0.16,

  /** 无正式图时的占位颜色 */
  placeholderColor: '#2a1810',

  placeholderHighlight: 'rgba(255,248,240,0.35)'
};

/** 无可视瞳孔 / 应让位的姿态 */
const EYES_CLOSED_OR_YIELDING = new Set([
  POSE_KEYS.IDLE_CLOSED_EYES,
  POSE_KEYS.SLEEPING,
  POSE_KEYS.CELEBRATING,
  POSE_KEYS.T_POSE
]);

/**
 * @param {object} deps
 * @param {HTMLElement} deps.container 叠层挂载点（通常 #app 或 body）
 * @param {HTMLCanvasElement} deps.canvas
 * @param {THREE.Camera} deps.camera
 * @param {import('../character/PoseManager.js').PoseManager} deps.poseManager
 */
export class EyeTracking {
  constructor({ container, canvas, camera, poseManager }) {
    this.container = container;
    this.canvas = canvas;
    this.camera = camera;
    this.poseManager = poseManager;

    /** 外部主开关（debug / Responsive Behavior） */
    this._enabled = true;
    /** 当前是否允许显示并跟随（综合姿态后） */
    this._active = false;
    this._pointerInWindow = true;

    this._mouseX = window.innerWidth * 0.5;
    this._mouseY = window.innerHeight * 0.5;

    this._offsetX = 0;
    this._offsetY = 0;
    this._targetX = 0;
    this._targetY = 0;

    this._box = new THREE.Box3();
    this._proj = new THREE.Vector3();
    this._corners = Array.from({ length: 8 }, () => new THREE.Vector3());

    this._root = document.createElement('div');
    this._root.id = 'eye-tracking-layer';
    this._root.setAttribute('aria-hidden', 'true');
    this._root.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:8;overflow:hidden;';

    this._leftPupil = this._createPupilEl('eye-pupil-left');
    this._rightPupil = this._createPupilEl('eye-pupil-right');
    this._root.appendChild(this._leftPupil);
    this._root.appendChild(this._rightPupil);
    container.appendChild(this._root);

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onMouseEnter = this._onMouseEnter.bind(this);
  }

  _createPupilEl(id) {
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = [
      'position:fixed',
      'width:' + EYE_TRACKING_CONFIG.pupilSizePx + 'px',
      'height:' + EYE_TRACKING_CONFIG.pupilSizePx + 'px',
      'margin:0',
      'padding:0',
      'border-radius:50%',
      'pointer-events:none',
      'will-change:transform,left,top',
      'opacity:0',
      'transition:opacity 180ms ease',
      'box-sizing:border-box'
    ].join(';');

    const url = EYE_TRACKING_CONFIG.pupilImageUrl;
    if (url) {
      el.style.background = `center / contain no-repeat url("${url}")`;
      el.style.backgroundColor = 'transparent';
    } else {
      el.style.background = EYE_TRACKING_CONFIG.placeholderColor;
      el.style.boxShadow = `inset 2px 2px 3px ${EYE_TRACKING_CONFIG.placeholderHighlight}`;
      el.dataset.placeholder = 'true';
    }

    return el;
  }

  bind() {
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', this._onMouseLeave);
    document.documentElement.addEventListener('mouseenter', this._onMouseEnter);
    // 部分浏览器对 documentElement 的 leave 不稳定，再兜一层 window blur
    window.addEventListener('blur', this._onMouseLeave);
  }

  dispose() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.documentElement.removeEventListener('mouseleave', this._onMouseLeave);
    document.documentElement.removeEventListener('mouseenter', this._onMouseEnter);
    window.removeEventListener('blur', this._onMouseLeave);
    this._root.remove();
  }

  /**
   * 启用/禁用接口（Responsive Behavior / Celebrating 让位时调用）。
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = Boolean(enabled);
    if (!this._enabled) {
      this._targetX = 0;
      this._targetY = 0;
    }
    this._refreshActiveState();
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /** @returns {boolean} 当前是否正在跟随（含姿态闸门） */
  isActive() {
    return this._active;
  }

  /**
   * 情绪层可见时是否应跟随（闭眼 / 庆祝自动 false）。
   * @param {PoseKey | string | null} [poseKey]
   */
  _poseAllowsTracking(poseKey) {
    const key = poseKey ?? this.poseManager.getVisiblePoseKey?.();
    if (!key) return false;
    return !EYES_CLOSED_OR_YIELDING.has(key);
  }

  _refreshActiveState() {
    const allow = this._enabled && this._poseAllowsTracking();
    this._active = allow;
    const opacity = allow ? '1' : '0';
    this._leftPupil.style.opacity = opacity;
    this._rightPupil.style.opacity = opacity;
    if (!allow) {
      this._targetX = 0;
      this._targetY = 0;
    }
  }

  _onMouseMove(event) {
    this._pointerInWindow = true;
    this._mouseX = event.clientX;
    this._mouseY = event.clientY;
  }

  _onMouseLeave() {
    this._pointerInWindow = false;
    this._targetX = 0;
    this._targetY = 0;
  }

  _onMouseEnter() {
    this._pointerInWindow = true;
  }

  /**
   * @returns {{ left: number, top: number, right: number, bottom: number, cx: number, cy: number, w: number, h: number } | null}
   */
  _getTigerScreenRect() {
    const root =
      this.poseManager.getVisibleRoot?.() ?? this.poseManager.getActiveRoot?.();
    if (!root) return null;

    this._box.setFromObject(root);
    if (this._box.isEmpty()) return null;

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

    const canvasRect = this.canvas.getBoundingClientRect();
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (let i = 0; i < 8; i++) {
      this._proj.copy(pts[i]).project(this.camera);
      const sx = (this._proj.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left;
      const sy = (-this._proj.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top;
      left = Math.min(left, sx);
      right = Math.max(right, sx);
      top = Math.min(top, sy);
      bottom = Math.max(bottom, sy);
    }

    return {
      left,
      top,
      right,
      bottom,
      cx: (left + right) * 0.5,
      cy: (top + bottom) * 0.5,
      w: right - left,
      h: bottom - top
    };
  }

  /**
   * 将目标偏移限制在椭圆内：(ox/maxX)^2 + (oy/maxY)^2 <= 1
   */
  _clampToEllipse(ox, oy) {
    const maxX = EYE_TRACKING_CONFIG.maxOffsetXPx;
    const maxY = EYE_TRACKING_CONFIG.maxOffsetYPx;
    if (maxX <= 0 || maxY <= 0) return { x: 0, y: 0 };
    const nx = ox / maxX;
    const ny = oy / maxY;
    const d2 = nx * nx + ny * ny;
    if (d2 <= 1) return { x: ox, y: oy };
    const s = 1 / Math.sqrt(d2);
    return { x: ox * s, y: oy * s };
  }

  _updateTargets(tigerRect) {
    if (!this._active || !this._pointerInWindow || !tigerRect) {
      this._targetX = 0;
      this._targetY = 0;
      return;
    }

    const faceCx = tigerRect.cx;
    const faceCy = tigerRect.top + tigerRect.h * EYE_TRACKING_CONFIG.eyeYFromTopRatio;
    const dx = this._mouseX - faceCx;
    const dy = this._mouseY - faceCy;

    // 方向→单位方向 × 最大可偏（再椭圆夹紧），远处鼠标也只推到眼眶边缘
    const len = Math.hypot(dx, dy) || 1;
    const rawX = (dx / len) * EYE_TRACKING_CONFIG.maxOffsetXPx;
    const rawY = (dy / len) * EYE_TRACKING_CONFIG.maxOffsetYPx;
    // 随距离略做缩放：脸附近跟满幅，过近时幅度更小
    const faceScale = Math.min(1, Math.hypot(dx, dy) / (tigerRect.w * 0.35 + 1));
    const clamped = this._clampToEllipse(rawX * faceScale, rawY * faceScale);
    this._targetX = clamped.x;
    this._targetY = clamped.y;
  }

  /**
   * @param {number} dt 秒
   */
  update(dt) {
    this._refreshActiveState();

    const tigerRect = this._getTigerScreenRect();
    this._updateTargets(tigerRect);

    const damp = 1 - Math.exp(-EYE_TRACKING_CONFIG.followDamping * Math.max(dt, 0));
    this._offsetX += (this._targetX - this._offsetX) * damp;
    this._offsetY += (this._targetY - this._offsetY) * damp;

    if (!tigerRect) {
      this._leftPupil.style.opacity = '0';
      this._rightPupil.style.opacity = '0';
      return;
    }

    const size = EYE_TRACKING_CONFIG.pupilSizePx;
    const half = size * 0.5;
    const eyeY =
      tigerRect.top + tigerRect.h * EYE_TRACKING_CONFIG.eyeYFromTopRatio - half;
    const spacing = tigerRect.w * 0.5 * EYE_TRACKING_CONFIG.eyeHalfSpacingRatio;
    const baseLeftX = tigerRect.cx - spacing - half;
    const baseRightX = tigerRect.cx + spacing - half;

    const ox = this._offsetX;
    const oy = this._offsetY;

    this._leftPupil.style.left = `${baseLeftX + ox}px`;
    this._leftPupil.style.top = `${eyeY + oy}px`;
    this._rightPupil.style.left = `${baseRightX + ox}px`;
    this._rightPupil.style.top = `${eyeY + oy}px`;
  }
}

/*
 * —— 正式瞳孔素材替换说明 ——
 * 1. 放置路径建议：public/textures/tiger-pupil.png（或同级目录）
 * 2. 将 EYE_TRACKING_CONFIG.pupilImageUrl 设为 '/textures/tiger-pupil.png'
 * 3. 规格建议：
 *    - 透明背景 PNG（RGBA）
 *    - 内容为正圆或接近正圆的瞳孔，四周留足透明边距
 *    - 源图约 64×64 ~ 128×128 px 即可（显示尺寸由 pupilSizePx 控制）
 *    - 左右眼可共用同一资源
 */
