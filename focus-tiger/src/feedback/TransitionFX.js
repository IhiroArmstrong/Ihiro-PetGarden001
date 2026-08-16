/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：只处理状态切换瞬间的一次性过场特效（如CELEBRATE时的金色光波），
// 播放完毕即结束，不长期持有任何状态。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';

export class TransitionFX {
  constructor(scene) {
    this.scene = scene;
    this._activeBursts = [];
    this._tigerPosition = new THREE.Vector3(0, 0.5, 0);
  }

  setTigerPosition(position) {
    this._tigerPosition.copy(position);
  }

  playCelebrateBurst() {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.3, 64),
      new THREE.MeshBasicMaterial({
        color: COLORS.focusGoldFull,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );

    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(this._tigerPosition);
    ring.position.y += 0.15;
    this.scene.add(ring);

    this._activeBursts.push({
      mesh: ring,
      age: 0,
      duration: 1.5
    });
  }

  update(deltaTime) {
    for (let i = this._activeBursts.length - 1; i >= 0; i--) {
      const burst = this._activeBursts[i];
      burst.age += deltaTime;
      const t = burst.age / burst.duration;

      burst.mesh.scale.setScalar(1 + t * 5);
      burst.mesh.material.opacity = 0.85 * (1 - t);

      if (burst.age >= burst.duration) {
        this.scene.remove(burst.mesh);
        burst.mesh.geometry.dispose();
        burst.mesh.material.dispose();
        this._activeBursts.splice(i, 1);
      }
    }
  }
}
