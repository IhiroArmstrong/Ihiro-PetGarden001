/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：3D 奖励柜动态效果层——绕 Y 轴旋转、呼吸起伏、庆祝态悬浮。
// 2D 主界面不叠加本层；调试开关已从 EmotionController.createDebugUI 移除。
// 变换叠加在 PoseManager 归一化对齐之后的 mount 节点上，不修改各姿态 root 的 position/scale。

import * as THREE from 'three';
import { POSE_KEYS } from '../character/PoseManager.js';
import { sineWave } from '../utils/Easing.js';

/** 可调参数（调试后定稿） */
export const DYNAMIC_MOTION_CONFIG = {
  rotation: {
    /** 完整一圈耗时（秒），越大越慢 */
    periodSec: 48,
    phaseRad: 0
  },
  breathing: {
    cycleSec: 3.5,
    /** scale.y 相对变化幅度（±1.5%） */
    scaleAmplitude: 0.015,
    /** position.y 位移幅度（局部单位） */
    positionAmplitude: 0.008,
    phaseRad: 0
  },
  hover: {
    cycleSec: 5.0,
    /** 恒定抬高：庆祝态下整体脱离蒲团（相对对齐基准） */
    baseLift: 0.16,
    /** 在抬高之上的缓慢上下摆动幅度 */
    oscillationAmplitude: 0.05,
    phaseRad: Math.PI / 2
  }
};

export class DynamicMotion {
  /**
   * @param {THREE.Object3D} mountNode 老虎挂载点（scene mounts.tiger）
   * @param {import('../character/PoseManager.js').PoseManager} poseManager
   */
  constructor(mountNode, poseManager) {
    this.mountNode = mountNode;
    this.poseManager = poseManager;

    this._basePosition = mountNode.position.clone();
    this._baseRotation = mountNode.rotation.clone();
    this._baseScale = mountNode.scale.clone();

    this._elapsedSec = 0;
    this._rotationAngle = 0;

    this._rotationEnabled = true;
    this._breathingEnabled = true;
    this._hoverEnabled = true;
  }

  setRotationEnabled(enabled) {
    this._rotationEnabled = Boolean(enabled);
    if (!this._rotationEnabled) {
      this.mountNode.rotation.y = this._baseRotation.y;
    }
  }

  setBreathingEnabled(enabled) {
    this._breathingEnabled = Boolean(enabled);
  }

  setHoverEnabled(enabled) {
    this._hoverEnabled = Boolean(enabled);
  }

  /** @returns {boolean} */
  isRotationEnabled() {
    return this._rotationEnabled;
  }

  /** @returns {boolean} */
  isBreathingEnabled() {
    return this._breathingEnabled;
  }

  /** @returns {boolean} */
  isHoverEnabled() {
    return this._hoverEnabled;
  }

  /**
   * @param {number} dt 帧间隔（秒）
   */
  update(dt) {
    this._elapsedSec += dt;

    if (this._rotationEnabled) {
      const { periodSec } = DYNAMIC_MOTION_CONFIG.rotation;
      this._rotationAngle += (Math.PI * 2 / periodSec) * dt;
      this.mountNode.rotation.y = this._baseRotation.y + this._rotationAngle;
    }

    const visiblePoseKey = this.poseManager.getVisiblePoseKey();
    const hoverShouldEnable =
      this._hoverEnabled && visiblePoseKey === POSE_KEYS.CELEBRATING;

    let breathScaleDelta = 0;
    let breathPosY = 0;
    if (this._breathingEnabled) {
      const { cycleSec, scaleAmplitude, positionAmplitude, phaseRad } =
        DYNAMIC_MOTION_CONFIG.breathing;
      const wave = sineWave(this._elapsedSec, cycleSec, phaseRad);
      breathScaleDelta = wave * scaleAmplitude;
      breathPosY = wave * positionAmplitude;
    }

    let hoverPosY = 0;
    if (hoverShouldEnable) {
      const { cycleSec, baseLift, oscillationAmplitude, phaseRad } =
        DYNAMIC_MOTION_CONFIG.hover;
      hoverPosY =
        baseLift +
        sineWave(this._elapsedSec, cycleSec, phaseRad) * oscillationAmplitude;
    }

    const totalPosY = breathPosY + hoverPosY;
    this._applyMotionTransforms(breathScaleDelta, totalPosY);
  }

  /**
   * 每帧统一写入 mount 变换，避免多效果分别赋值互相覆盖。
   * @param {number} scaleDelta scale.y 相对增量
   * @param {number} positionYDelta 相对基准 position.y 的总偏移
   */
  _applyMotionTransforms(scaleDelta, positionYDelta) {
    this.mountNode.scale.y = this._baseScale.y * (1 + scaleDelta);
    this.mountNode.position.y = this._basePosition.y + positionYDelta;
  }

  /**
   * @deprecated 调试面板已迁移至 EmotionController.createDebugUI()，
   * 开关请通过 playEmotion('rotation'|'breathing'|'hover', { enabled }) 触发。
   * @param {HTMLElement} _container
   */
  createDebugUI(_container) {
    console.warn(
      '[DynamicMotion.createDebugUI] 已弃用：请使用 EmotionController.createDebugUI()'
    );
    return null;
  }
}
