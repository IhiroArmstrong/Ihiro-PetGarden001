// 职责：只负责 focusLevel 数值 → 光效/粒子/背景暖度参数的映射。
// 不允许在这个类里处理与 focusLevel 无关的环境效果（那是 Ambience.js 的职责）。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { loadTexture } from '../utils/Loaders.js';

const MAX_PARTICLES = 200;

function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 230, 160, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function getTargetParticleCount(focusLevel) {
  if (focusLevel < 0.3) return 0;
  if (focusLevel < 0.7) {
    const t = (focusLevel - 0.3) / 0.4;
    return Math.round(50 + t * (150 - 50));
  }
  const t = (focusLevel - 0.7) / 0.3;
  return Math.round(150 + t * (MAX_PARTICLES - 150));
}

export class FocusVisualizer {
  constructor(postProcessing) {
    this.postProcessing = postProcessing;
    this.mountNode = null;
    this.points = null;
    this._positions = null;
    this._velocities = [];
    this._lifetimes = [];
    this._maxLifetimes = [];
    this._activeCount = 0;
    this._focusLevel = 0;
    this._elapsed = 0;
  }

  async init(mountNode) {
    this.mountNode = mountNode;
    const scene = this.postProcessing.passes[0]?.scene;
    if (!scene) return;

    this._positions = new Float32Array(MAX_PARTICLES * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this._positions, 3));

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this._velocities.push(new THREE.Vector3());
      this._lifetimes.push(0);
      this._maxLifetimes.push(1);
      this._positions[i * 3 + 1] = -9999;
    }

    let particleMap;
    try {
      particleMap = await loadTexture('/textures/particle-glow.png');
    } catch {
      particleMap = createGlowTexture();
    }

    const material = new THREE.PointsMaterial({
      map: particleMap,
      color: new THREE.Color(COLORS.focusGoldMid),
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  _respawnParticle(index) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.4 + Math.random() * 0.35;
    const height = 0.2 + Math.random() * 0.5;

    this._positions[index * 3] = Math.cos(angle) * radius;
    this._positions[index * 3 + 1] = height;
    this._positions[index * 3 + 2] = Math.sin(angle) * radius;

    this._velocities[index].set(
      (Math.random() - 0.5) * 0.08,
      0.15 + Math.random() * 0.2,
      (Math.random() - 0.5) * 0.08
    );

    this._lifetimes[index] = 0;
    this._maxLifetimes[index] = 1.5 + Math.random() * 1.5;
  }

  update(focusLevel) {
    if (!this.points || !this.mountNode) return;

    this._focusLevel = focusLevel;
    const targetCount = getTargetParticleCount(focusLevel);
    const dt = 1 / 60;
    this._elapsed += dt;

    while (this._activeCount < targetCount && this._activeCount < MAX_PARTICLES) {
      this._respawnParticle(this._activeCount);
      this._activeCount += 1;
    }

    if (this._activeCount > targetCount) {
      for (let i = targetCount; i < this._activeCount; i++) {
        this._positions[i * 3 + 1] = -9999;
      }
      this._activeCount = targetCount;
    }

    const worldPos = new THREE.Vector3();
    this.mountNode.getWorldPosition(worldPos);

    for (let i = 0; i < this._activeCount; i++) {
      this._lifetimes[i] += dt;
      const lifeT = this._lifetimes[i] / this._maxLifetimes[i];

      this._positions[i * 3] += this._velocities[i].x * dt;
      this._positions[i * 3 + 1] += this._velocities[i].y * dt;
      this._positions[i * 3 + 2] += this._velocities[i].z * dt;

      if (this._lifetimes[i] >= this._maxLifetimes[i]) {
        this._respawnParticle(i);
      }
    }

    this.points.position.copy(worldPos);
    this.points.geometry.attributes.position.needsUpdate = true;

    const brightness = focusLevel < 0.7
      ? THREE.MathUtils.mapLinear(focusLevel, 0.3, 0.7, 0.3, 0.7)
      : THREE.MathUtils.mapLinear(focusLevel, 0.7, 1.0, 0.7, 1.0);

    this.points.material.opacity = THREE.MathUtils.clamp(brightness, 0, 1);
    this.points.material.size = 0.08 + brightness * 0.08;
    this.points.visible = this._activeCount > 0;
  }
}
