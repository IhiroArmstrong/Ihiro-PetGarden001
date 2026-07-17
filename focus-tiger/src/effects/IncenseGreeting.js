// 职责："今日一炷香"完成反馈——渐显莲花 + 满屏金色粒子。
// 不对老虎模型做任何变换。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { easeInOutQuad, easeOutQuad } from '../utils/Easing.js';
import { loadTexture } from '../utils/Loaders.js';

const LOTUS_TEXTURE_PATH = '/textures/lotus.png';

/** 可调参数 */
export const INCENSE_GREETING_CONFIG = {
  lotus: {
    /** 相对老虎世界包围盒的偏移（身旁地面、略靠镜头前方） */
    offset: { x: -0.38, y: 0.02, z: 0.22 },
    targetHeight: 0.72,
    fadeInMs: 1200,
    holdMs: 2500,
    fadeOutMs: 1000,
    fadeOutLift: 0.08,
    startScaleRatio: 0.6
  },
  particles: {
    count: 32,
    spawnSpreadMs: 1400,
    /** 比莲花总时长略长，收尾更平静 */
    effectDurationMs: 5200,
    size: 0.16,
    opacity: 0.52,
    riseSpeed: 0.35,
    driftSpeed: 0.28,
    turbulence: 0.1,
    /** 摄像机前方可视深度范围（世界单位） */
    viewDepthMin: 1.8,
    viewDepthMax: 5.2,
    viewSpreadX: 0.92,
    viewSpreadY: 0.82
  },
  /** 右下角水印裁切区域（相对图片宽高的比例，PixMiller 标记） */
  watermarkCrop: {
    widthRatio: 0.32,
    heightRatio: 0.11
  }
};

/**
 * 预处理莲花贴图：透明 PNG 直接使用，仅清除右下角水印区域。
 * @param {THREE.Texture} texture
 */
function prepareLotusTexture(texture) {
  const image = texture.image;
  if (!image?.width) return texture;

  const canvas = document.createElement('canvas');
  const width = image.width;
  const height = image.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  const { widthRatio, heightRatio } = INCENSE_GREETING_CONFIG.watermarkCrop;

  const cropX = Math.floor(width * (1 - widthRatio));
  const cropY = Math.floor(height * (1 - heightRatio));

  for (let y = cropY; y < height; y++) {
    for (let x = cropX; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const processed = new THREE.CanvasTexture(canvas);
  processed.colorSpace = THREE.SRGBColorSpace;
  processed.needsUpdate = true;
  texture.dispose();
  return processed;
}

function createSmokeTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 235, 170, 1)');
  gradient.addColorStop(0.35, 'rgba(240, 192, 96, 0.75)');
  gradient.addColorStop(0.7, 'rgba(224, 185, 121, 0.35)');
  gradient.addColorStop(1, 'rgba(240, 192, 96, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * 在摄像机视锥内随机取点（保持透视景深）。
 * @param {THREE.PerspectiveCamera} camera
 */
function randomPointInView(camera) {
  const { viewDepthMin, viewDepthMax, viewSpreadX, viewSpreadY } =
    INCENSE_GREETING_CONFIG.particles;
  const depth = viewDepthMin + Math.random() * (viewDepthMax - viewDepthMin);
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const visibleHeight = 2 * Math.tan(fovRad / 2) * depth;
  const visibleWidth = visibleHeight * camera.aspect;

  const localX = (Math.random() - 0.5) * visibleWidth * viewSpreadX;
  const localY = (Math.random() - 0.5) * visibleHeight * viewSpreadY + 0.15;

  const offset = new THREE.Vector3(localX, localY, -depth);
  offset.applyQuaternion(camera.quaternion);
  return camera.position.clone().add(offset);
}

/**
 * 计算莲花精灵世界坐标（老虎身旁地面）。
 * @param {THREE.Object3D} model
 */
function computeLotusWorldPosition(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const { offset } = INCENSE_GREETING_CONFIG.lotus;

  return new THREE.Vector3(
    center.x + offset.x,
    box.min.y + offset.y,
    box.max.z + offset.z
  );
}

class SmokeParticle {
  constructor(texture, parent) {
    this.maxLife = 2.4 + Math.random() * 1.6;
    this.life = 0;
    this.active = false;
    this.velocity = new THREE.Vector3();
    this._turbPhase = Math.random() * Math.PI * 2;
    this._goldTint = new THREE.Color(COLORS.focusGoldFull);
    this.sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: this._goldTint,
        transparent: true,
        opacity: INCENSE_GREETING_CONFIG.particles.opacity,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      })
    );
    this.sprite.renderOrder = 12;
    this.sprite.center.set(0.5, 0.25);
    this.sprite.visible = false;
    parent.add(this.sprite);
  }

  spawn(worldPos) {
    this.life = 0;
    this.active = true;
    this.maxLife = 2.4 + Math.random() * 1.6;
    this._turbPhase = Math.random() * Math.PI * 2;
    this.sprite.position.copy(worldPos);
    this.sprite.visible = true;

    const { size, riseSpeed, driftSpeed } = INCENSE_GREETING_CONFIG.particles;
    const particleSize = size * (0.65 + Math.random() * 0.7);
    this.sprite.scale.set(particleSize, particleSize * (0.9 + Math.random() * 0.5), 1);

    this.velocity.set(
      (Math.random() - 0.5) * driftSpeed * 2,
      riseSpeed * (0.55 + Math.random() * 0.75),
      (Math.random() - 0.5) * driftSpeed * 1.4
    );

    const goldMid = new THREE.Color(COLORS.focusGoldMid);
    const goldFull = new THREE.Color(COLORS.focusGoldFull);
    this._goldTint.copy(goldMid).lerp(goldFull, Math.random());
    this.sprite.material.color.copy(this._goldTint);
    this.sprite.material.opacity = INCENSE_GREETING_CONFIG.particles.opacity;
  }

  update(dt) {
    if (!this.active) return false;

    this.life += dt;
    this._turbPhase += dt * 2.2;

    const { turbulence } = INCENSE_GREETING_CONFIG.particles;
    this.sprite.position.x += Math.sin(this._turbPhase) * turbulence * dt;
    this.sprite.position.z += Math.cos(this._turbPhase * 0.85) * turbulence * dt;
    this.sprite.position.addScaledVector(this.velocity, dt);

    const lifeT = this.life / this.maxLife;
    const fade = 1 - easeInOutQuad(Math.min(lifeT, 1));
    this.sprite.material.opacity = INCENSE_GREETING_CONFIG.particles.opacity * fade;
    this.sprite.scale.multiplyScalar(1 + dt * 0.14);

    if (this.life >= this.maxLife) {
      this.dispose();
      return false;
    }

    return true;
  }

  dispose() {
    this.active = false;
    this.sprite.visible = false;
    this.sprite.material.opacity = 0;
  }
}

export class IncenseGreeting {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Object3D} mountNode
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(scene, mountNode, camera, { fxContainer } = {}) {
    this.scene = scene;
    this.mountNode = mountNode;
    this.camera = camera;
    this._fxContainer =
      fxContainer ||
      document.getElementById('app') ||
      document.body;

    this._smokeTexture = createSmokeTexture();
    this._smokeGroup = new THREE.Group();
    this._smokeGroup.name = 'incense-smoke';
    scene.add(this._smokeGroup);

    /** @type {SmokeParticle[]} */
    this._particlePool = [];
    /** @type {SmokeParticle[]} */
    this._activeParticles = [];

    this._lotusTexture = null;
    this._lotusSprite = null;
    this._lotusMaterial = null;
    this._lotusPlaying = false;
    this._lotusElapsedMs = 0;
    this._lotusBasePos = new THREE.Vector3();
    this._lotusBaseScale = 1;
    this._lotusAspect = 1;

    this._smokePlaying = false;
    this._smokeElapsedMs = 0;
    this._smokeSpawned = 0;
    this._spawnPos = new THREE.Vector3();

    /** DOM 叠层（位于 2D sprite 之上） */
    this._fxRoot = null;
    this._domLotus = null;
    this._domLotusPlaying = false;
    this._domLotusElapsedMs = 0;
    this._domParticles = [];
    this._domSmokePlaying = false;
    this._domSmokeElapsedMs = 0;
    this._domSmokeSpawned = 0;
  }

  async init() {
    try {
      const raw = await loadTexture(LOTUS_TEXTURE_PATH);
      raw.colorSpace = THREE.SRGBColorSpace;
      this._lotusTexture = prepareLotusTexture(raw);
      if (this._lotusTexture.image) {
        this._lotusAspect =
          this._lotusTexture.image.width / Math.max(this._lotusTexture.image.height, 1);
      }
    } catch (err) {
      console.warn('[IncenseGreeting] 莲花贴图加载失败，使用占位图形', err);
      this._lotusTexture = this._createPlaceholderLotusTexture();
      this._lotusAspect = 1;
    }
  }

  _createPlaceholderLotusTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2 + 10;
    ctx.strokeStyle = 'rgba(200, 160, 180, 0.85)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * 18,
        cy + Math.sin(angle) * 14,
        28,
        18,
        angle,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(180, 200, 160, 0.7)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 8, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 160, 100, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 20);
    ctx.lineTo(cx, size - 20);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  _ensureLotusSprite() {
    if (this._lotusSprite || !this._lotusTexture) return;

    this._lotusMaterial = new THREE.SpriteMaterial({
      map: this._lotusTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false
    });

    this._lotusSprite = new THREE.Sprite(this._lotusMaterial);
    this._lotusSprite.renderOrder = 20;
    this._lotusSprite.center.set(0.5, 0);
    this._lotusSprite.visible = false;
    this.scene.add(this._lotusSprite);
  }

  /**
   * 触发莲花渐显-停留-消失。
   * 主线已改 DOM 叠层（在 2D Yin 之上）；保留方法名兼容旧调用。
   * @param {THREE.Object3D} [_model]
   */
  playLotusBloom(_model) {
    this._playDomIncense();
  }

  playGoldenParticles() {
    this._ensureFxRoot();
    this._domSmokeElapsedMs = 0;
    this._domSmokeSpawned = 0;
    this._domSmokePlaying = true;
  }

  /** 统一入口：莲花 + 满屏金色粒子（DOM 叠层，保证在 2D Yin 之上） */
  triggerDailyIncenseComplete(_model) {
    this._playDomIncense();
  }

  /** @deprecated 保留旧名兼容 */
  triggerIncenseGreeting(model) {
    this.triggerDailyIncenseComplete(model);
  }

  _ensureFxRoot() {
    if (this._fxRoot?.isConnected) return this._fxRoot;
    const root = document.createElement('div');
    root.id = 'incense-fx-overlay';
    root.style.cssText =
      'position:fixed;inset:0;z-index:4;pointer-events:none;overflow:hidden;';
    this._fxContainer.appendChild(root);
    this._fxRoot = root;
    return root;
  }

  _playDomIncense() {
    const root = this._ensureFxRoot();
    this._disposeDomLotus();
    this._clearDomParticles();

    const lotus = document.createElement('img');
    lotus.alt = '';
    lotus.draggable = false;
    lotus.src = LOTUS_TEXTURE_PATH;
    lotus.style.cssText = [
      'position:absolute',
      'left:22%',
      'bottom:18%',
      'width:min(28vw,220px)',
      'height:auto',
      'opacity:0',
      'transform:scale(0.6)',
      'transform-origin:50% 100%',
      'filter:drop-shadow(0 8px 18px rgba(120,80,40,.28))',
      'will-change:opacity,transform'
    ].join(';');
    root.appendChild(lotus);
    this._domLotus = lotus;
    this._domLotusElapsedMs = 0;
    this._domLotusPlaying = true;

    this._domSmokeElapsedMs = 0;
    this._domSmokeSpawned = 0;
    this._domSmokePlaying = true;
  }

  _disposeDomLotus() {
    this._domLotus?.remove();
    this._domLotus = null;
    this._domLotusPlaying = false;
  }

  _clearDomParticles() {
    for (const p of this._domParticles) p.el.remove();
    this._domParticles = [];
    this._domSmokePlaying = false;
  }

  _spawnDomParticle() {
    const root = this._ensureFxRoot();
    const el = document.createElement('div');
    const size = 10 + Math.random() * 18;
    const x = 8 + Math.random() * 84;
    const y = 12 + Math.random() * 70;
    el.style.cssText = [
      'position:absolute',
      `left:${x}%`,
      `top:${y}%`,
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      'background:radial-gradient(circle,rgba(255,220,120,.95) 0%,rgba(212,160,48,.55) 45%,rgba(212,160,48,0) 72%)',
      'opacity:0',
      'pointer-events:none',
      'will-change:transform,opacity'
    ].join(';');
    root.appendChild(el);
    this._domParticles.push({
      el,
      age: 0,
      life: 2.4 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 28,
      vy: -18 - Math.random() * 36,
      x,
      y,
      size
    });
  }

  update(dt) {
    this._updateDomLotus(dt);
    this._updateDomSmoke(dt);
    // 保留 3D 路径更新（调试/奖励柜若再开 canvas 仍可用）
    this._updateLotus(dt);
    this._updateSmoke(dt);
  }

  _updateDomLotus(dt) {
    if (!this._domLotusPlaying || !this._domLotus) return;

    this._domLotusElapsedMs += dt * 1000;
    const { fadeInMs, holdMs, fadeOutMs, startScaleRatio } =
      INCENSE_GREETING_CONFIG.lotus;
    const fadeInEnd = fadeInMs;
    const holdEnd = fadeInEnd + holdMs;
    const fadeOutEnd = holdEnd + fadeOutMs;
    const t = this._domLotusElapsedMs;
    const el = this._domLotus;

    if (t <= fadeInEnd) {
      const p = easeOutQuad(t / fadeInMs);
      el.style.opacity = String(p);
      const scale = startScaleRatio + (1 - startScaleRatio) * p;
      el.style.transform = `scale(${scale}) translateY(0)`;
    } else if (t <= holdEnd) {
      el.style.opacity = '1';
      el.style.transform = 'scale(1) translateY(0)';
    } else if (t <= fadeOutEnd) {
      const p = easeInOutQuad((t - holdEnd) / fadeOutMs);
      el.style.opacity = String(1 - p);
      el.style.transform = `scale(1) translateY(${-24 * p}px)`;
    } else {
      this._disposeDomLotus();
    }
  }

  _updateDomSmoke(dt) {
    for (let i = this._domParticles.length - 1; i >= 0; i--) {
      const p = this._domParticles[i];
      p.age += dt;
      const lifeT = p.age / p.life;
      if (lifeT >= 1) {
        p.el.remove();
        this._domParticles.splice(i, 1);
        continue;
      }
      const fade =
        lifeT < 0.15 ? lifeT / 0.15 : lifeT > 0.7 ? (1 - lifeT) / 0.3 : 1;
      p.x += (p.vx * dt) / 10;
      p.y += (p.vy * dt) / 10;
      p.el.style.left = `${p.x}%`;
      p.el.style.top = `${p.y}%`;
      p.el.style.opacity = String(Math.max(0, Math.min(1, fade * 0.85)));
      p.el.style.transform = `scale(${1 + lifeT * 0.35})`;
    }

    if (!this._domSmokePlaying) return;

    this._domSmokeElapsedMs += dt * 1000;
    const { count, spawnSpreadMs, effectDurationMs } =
      INCENSE_GREETING_CONFIG.particles;

    while (
      this._domSmokeSpawned < count &&
      this._domSmokeElapsedMs >= (this._domSmokeSpawned / count) * spawnSpreadMs
    ) {
      this._spawnDomParticle();
      this._domSmokeSpawned += 1;
    }

    if (
      this._domSmokeElapsedMs >= effectDurationMs &&
      this._domParticles.length === 0
    ) {
      this._domSmokePlaying = false;
    }
  }

  _updateLotus(dt) {
    if (!this._lotusPlaying || !this._lotusSprite || !this._lotusMaterial) return;

    this._lotusElapsedMs += dt * 1000;
    const { fadeInMs, holdMs, fadeOutMs, fadeOutLift, startScaleRatio, targetHeight } =
      INCENSE_GREETING_CONFIG.lotus;

    const fadeInEnd = fadeInMs;
    const holdEnd = fadeInEnd + holdMs;
    const fadeOutEnd = holdEnd + fadeOutMs;
    const t = this._lotusElapsedMs;

    if (t <= fadeInEnd) {
      const p = easeOutQuad(t / fadeInMs);
      this._lotusMaterial.opacity = p;
      const scale = THREE.MathUtils.lerp(targetHeight * startScaleRatio, targetHeight, p);
      this._lotusSprite.scale.set(scale * this._lotusAspect, scale, 1);
      this._lotusSprite.position.copy(this._lotusBasePos);
    } else if (t <= holdEnd) {
      this._lotusMaterial.opacity = 1;
      this._lotusSprite.scale.set(targetHeight * this._lotusAspect, targetHeight, 1);
      this._lotusSprite.position.copy(this._lotusBasePos);
    } else if (t <= fadeOutEnd) {
      const p = easeInOutQuad((t - holdEnd) / fadeOutMs);
      this._lotusMaterial.opacity = 1 - p;
      this._lotusSprite.position.copy(this._lotusBasePos);
      this._lotusSprite.position.y += fadeOutLift * p;
    } else {
      this._disposeLotusSprite();
      this._lotusPlaying = false;
    }
  }

  _disposeLotusSprite() {
    if (!this._lotusSprite) return;

    this._lotusSprite.visible = false;
    this._lotusMaterial.opacity = 0;
    this.scene.remove(this._lotusSprite);
    this._lotusMaterial.map = null;
    this._lotusMaterial.dispose();
    this._lotusSprite = null;
    this._lotusMaterial = null;
  }

  _updateSmoke(dt) {
    for (let i = this._activeParticles.length - 1; i >= 0; i--) {
      if (!this._activeParticles[i].update(dt)) {
        this._activeParticles.splice(i, 1);
      }
    }

    if (!this._smokePlaying) return;

    this._smokeElapsedMs += dt * 1000;
    const { count, spawnSpreadMs, effectDurationMs } = INCENSE_GREETING_CONFIG.particles;

    while (
      this._smokeSpawned < count &&
      this._smokeElapsedMs >= (this._smokeSpawned / count) * spawnSpreadMs
    ) {
      this._spawnSmokeParticle();
      this._smokeSpawned += 1;
    }

    if (this._smokeElapsedMs >= effectDurationMs && this._activeParticles.length === 0) {
      this._smokePlaying = false;
    }
  }

  _spawnSmokeParticle() {
    this._spawnPos.copy(randomPointInView(this.camera));

    let particle = this._particlePool.find((p) => !p.active);
    if (!particle) {
      particle = new SmokeParticle(this._smokeTexture, this._smokeGroup);
      this._particlePool.push(particle);
    }

    particle.spawn(this._spawnPos);
    this._activeParticles.push(particle);
  }

  /**
   * @deprecated 调试入口已迁移至 EmotionController.createDebugUI()，
   * 请通过 playEmotion('incenseComplete') 触发。
   * @param {HTMLElement} _container
   * @param {import('../core/EmotionController.js').EmotionController} [emotionController]
   */
  createDebugButton(_container, emotionController) {
    if (emotionController?.playEmotion) {
      emotionController.playEmotion('idle');
      window.setTimeout(() => emotionController.playEmotion('incenseComplete'), 560);
      return null;
    }
    console.warn(
      '[IncenseGreeting.createDebugButton] 已弃用：请使用 EmotionController.createDebugUI() / playEmotion("incenseComplete")'
    );
    return null;
  }
}
