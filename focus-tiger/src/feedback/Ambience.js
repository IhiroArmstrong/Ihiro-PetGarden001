/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：只负责与 focusLevel 无关的静态环境基调（水墨雾气、柔光）。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';

export class Ambience {
  constructor(scene) {
    this.scene = scene;
  }

  setup() {
    // 密度从 0.06 降至 0.035，保留水墨氛围同时减轻模型发闷发糊
    this.scene.fog = new THREE.FogExp2(COLORS.ambienceFog, 0.035);
  }
}
