// 职责：多姿态 GLB 预加载、bounding box 归一化对齐、顺序式 canvas 明暗切换。
// 过渡在 2D canvas 层做明暗，3D 模型始终保持不透明，规避 PBR+shader 半透明发暗伪影。

import * as THREE from 'three';
import { loadGLTF } from '../utils/Loaders.js';
import { configurePBRTextures } from '../utils/configurePBRTextures.js';
import { easeInOutQuad } from '../utils/Easing.js';

/** @typedef {'IDLE_CLOSED_EYES'|'SLEEPING'|'IDLE_SMILING'|'CELEBRATING'|'T_POSE'} PoseKey */

export const POSE_KEYS = {
  IDLE_CLOSED_EYES: 'IDLE_CLOSED_EYES',
  SLEEPING: 'SLEEPING',
  IDLE_SMILING: 'IDLE_SMILING',
  CELEBRATING: 'CELEBRATING',
  T_POSE: 'T_POSE'
};

const POSE_ASSETS = {
  // 默认闭眼坐禅：灰棉麻袈裟 + 深红镶边（gltf-transform Draco+WebP，~300KB）
  [POSE_KEYS.IDLE_CLOSED_EYES]: '/models/tiger-meditate-closed.glb',
  [POSE_KEYS.SLEEPING]: '/models/tiger-sleeping.glb',
  [POSE_KEYS.IDLE_SMILING]: '/models/tiger-meditate-smile.glb',
  [POSE_KEYS.CELEBRATING]: '/models/tiger-happy-jump.glb',
  [POSE_KEYS.T_POSE]: '/models/tiger-stand-eyes-closed.glb'
};

// 顺序式过渡总时长（ARCHITECTURE.md 要求 0.3–0.5 秒，含短暂停顿可略超至 ~0.5s）
const TRANSITION_TOTAL_MS = 500;
// 阶段一：旧模型渐隐（45%）
const FADE_OUT_MS = Math.round(TRANSITION_TOTAL_MS * 0.45);
// 阶段间短暂停顿（10%，约 50ms，营造节奏感而非卡顿）
const PAUSE_MS = TRANSITION_TOTAL_MS - FADE_OUT_MS * 2;
// 阶段二：新模型渐显（45%）
const FADE_IN_MS = FADE_OUT_MS;

// 归一化后的统一高度（与 TigerCharacter 现有缩放基准一致）
const TARGET_HEIGHT = 1.0;
// 脚底对齐的目标地面 Y（mount 节点局部坐标）
const GROUND_Y = 0;

// 尺寸基准姿态：SLEEPING（睡着了）。
// 理由：用户确认睡着态尺寸正确；坐/立姿态在脑袋宽度对齐后仍需额外放大，
// 才能与睡着态视觉尺寸一致（见 SIT_STAND_SIZE_BOOST）。
const REFERENCE_POSE_KEY = POSE_KEYS.SLEEPING;
// 坐/立姿态相对脑袋宽度基准的额外整体放大比例（用户标定 +40%）
const SIT_STAND_SIZE_BOOST = 1.4;

/**
 * 测量模型头部区域宽度（取包围盒顶部 35% 顶点在 X 轴上的跨度）。
 * @param {THREE.Object3D} root
 */
function measureHeadWidth(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y <= 0.001) return size.x;

  const headMinY = box.min.y + size.y * 0.65;
  let minX = Infinity;
  let maxX = -Infinity;
  let found = false;
  const vertex = new THREE.Vector3();

  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;

    const positions = child.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(child.matrixWorld);
      if (vertex.y >= headMinY) {
        minX = Math.min(minX, vertex.x);
        maxX = Math.max(maxX, vertex.x);
        found = true;
      }
    }
  });

  return found ? maxX - minX : size.x;
}

/**
 * 测量头部区域中心（取包围盒顶部 35% 顶点的平均位置）。
 * @param {THREE.Object3D} root
 * @returns {{ x: number, y: number, z: number }}
 */
function measureHeadCenter(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const headMinY = box.min.y + size.y * 0.65;
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let count = 0;
  const vertex = new THREE.Vector3();

  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;

    const positions = child.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(child.matrixWorld);
      if (vertex.y >= headMinY) {
        sumX += vertex.x;
        sumY += vertex.y;
        sumZ += vertex.z;
        count++;
      }
    }
  });

  if (!count) {
    const center = box.getCenter(new THREE.Vector3());
    return { x: center.x, y: center.y, z: center.z };
  }

  return { x: sumX / count, y: sumY / count, z: sumZ / count };
}

/**
 * 标准对齐：X 用顶点质心，Y 脚底贴地，Z 用包围盒中心。
 * @param {THREE.Object3D} root
 */
function computeStandardOffset(root) {
  const alignedBox = new THREE.Box3().setFromObject(root);
  const centroidX = measureCentroidX(root);

  return {
    x: -centroidX,
    y: GROUND_Y - alignedBox.min.y,
    z: -(alignedBox.min.z + alignedBox.max.z) / 2
  };
}

/**
 * T-Pose 专用：头部中心对齐画面垂直中轴（Y 轴），脚底贴地，尺寸与其他坐/立姿态一致。
 * @param {THREE.Object3D} root
 */
function computeTPoseOffset(root) {
  const alignedBox = new THREE.Box3().setFromObject(root);
  const headCenter = measureHeadCenter(root);

  return {
    x: -headCenter.x,
    y: GROUND_Y - alignedBox.min.y,
    z: -(alignedBox.min.z + alignedBox.max.z) / 2
  };
}

/**
 * 收集模型的材质引用，初始化为不透明渲染路径（静止时最亮、最清晰）。
 * @param {THREE.Object3D} root
 * @returns {THREE.Material[]}
 */
function collectMaterials(root) {
  const materials = [];

  root.traverse((child) => {
    if (!child.isMesh) return;

    const meshMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    meshMaterials.forEach((material) => {
      if (!material) return;
      material.transparent = false;
      material.depthWrite = true;
      material.opacity = 1;
      material.needsUpdate = true;
      materials.push(material);
    });
  });

  return materials;
}

/**
 * X 轴顶点质心：以顶点平均位置代表“视觉重心”。
 * 相比包围盒中点，质心几乎不受尾巴/袈裟下摆等“又薄又偏”的附属造型拉扯，
 * 更贴近肉眼判断的居中位置。
 * @param {THREE.Object3D} root
 */
function measureCentroidX(root) {
  let sum = 0;
  let count = 0;
  const vertex = new THREE.Vector3();

  root.updateMatrixWorld(true);
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    const positions = child.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i).applyMatrix4(child.matrixWorld);
      sum += vertex.x;
      count++;
    }
  });

  return count ? sum / count : 0;
}

export class PoseManager {
  /**
   * @param {THREE.Object3D} mountNode 老虎挂载点（scene mounts.tiger）
   */
  constructor(mountNode) {
    this.mountNode = mountNode;
    /** @type {Map<PoseKey, THREE.Object3D>} */
    this._roots = new Map();
    /** @type {Map<PoseKey, THREE.Material[]>} */
    this._materials = new Map();
    /** @type {PoseKey} */
    this._activePoseKey = POSE_KEYS.IDLE_CLOSED_EYES;
    /** @type {Array<{poseKey: PoseKey, path: string, rawHeadWidth: number, referenceHeadWidth: number, sizeBoost: number, scaleFactor: number, positionOffset: {x:number,y:number,z:number}, xAlign: {method: string, bboxCenterX: number, centroidX: number}}>} */
    this.alignmentRecords = [];
    /** @type {((root: THREE.Object3D) => void) | null} */
    this._onPoseChange = null;
    /** @type {boolean} */
    this._isTransitioning = false;
    /**
     * 顺序式过渡状态：fadeOut → pause → fadeIn，任意时刻仅一个模型 visible 且 opacity>0。
     * @type {{ fromKey: PoseKey | null, toKey: PoseKey, canvasStart: number, phase: 'fadeOut'|'pause'|'fadeIn', phaseStartTime: number } | null}
     */
    this._transition = null;
    /** @type {number | null} */
    this._rafId = null;
    /** canvas 当前明暗度（1=全亮），过渡在 2D 层完成，不碰 3D 材质 opacity */
    this._canvasOpacity = 1;
    /** 2D 主线时强制隐藏 3D canvas，避免透明精灵后露出垫底 */
    this._forceCanvasHidden = false;
  }

  /**
   * 预加载全部姿态 GLB，完成归一化对齐后加入场景（默认仅基准姿态可见）。
   * @param {THREE.WebGLRenderer} renderer
   */
  async preload(renderer) {
    const entries = Object.entries(POSE_ASSETS);
    const loaded = await Promise.all(
      entries.map(async ([poseKey, path]) => {
        const gltf = await loadGLTF(path, renderer);
        configurePBRTextures(gltf.scene, renderer);
        return { poseKey, path, root: gltf.scene };
      })
    );

    const rawHeadWidths = new Map();
    const rawHeights = new Map();
    for (const { poseKey, root } of loaded) {
      const box = new THREE.Box3().setFromObject(root);
      rawHeights.set(poseKey, box.getSize(new THREE.Vector3()).y);
      rawHeadWidths.set(poseKey, measureHeadWidth(root));
    }

    const sleepingHeadWidth = rawHeadWidths.get(REFERENCE_POSE_KEY) ?? 1;
    const sleepingHeightScale =
      TARGET_HEIGHT / Math.max(rawHeights.get(REFERENCE_POSE_KEY) ?? TARGET_HEIGHT, 0.001);
    const referenceHeadWidth = sleepingHeadWidth * sleepingHeightScale;

    const scaledEntries = loaded.map(({ poseKey, path, root }) => {
      const rawHeadWidth = rawHeadWidths.get(poseKey) ?? sleepingHeadWidth;
      let scaleFactor = referenceHeadWidth / Math.max(rawHeadWidth, 0.001);
      const sizeBoost = poseKey === REFERENCE_POSE_KEY ? 1 : SIT_STAND_SIZE_BOOST;
      scaleFactor *= sizeBoost;
      root.scale.setScalar(scaleFactor);

      return { poseKey, path, root, rawHeadWidth, sizeBoost, scaleFactor };
    });

    this.alignmentRecords = [];

    for (const entry of scaledEntries) {
      const isTPose = entry.poseKey === POSE_KEYS.T_POSE;
      const positionOffset = isTPose
        ? computeTPoseOffset(entry.root)
        : computeStandardOffset(entry.root);
      entry.root.position.set(positionOffset.x, positionOffset.y, positionOffset.z);

      const alignedBox = new THREE.Box3().setFromObject(entry.root);
      const bboxCenterX = (alignedBox.min.x + alignedBox.max.x) / 2;
      const centroidX = measureCentroidX(entry.root);

      this._registerAlignedPose(entry, positionOffset, {
        method: isTPose ? 'head+foot' : 'centroid',
        bboxCenterX: Number(bboxCenterX.toFixed(4)),
        centroidX: Number(centroidX.toFixed(4)),
        referenceHeadWidth
      });
    }

    return this.alignmentRecords;
  }

  /**
   * @param {{ poseKey: PoseKey, path: string, root: THREE.Object3D, rawHeadWidth: number, sizeBoost: number, scaleFactor: number }} entry
   * @param {{ x: number, y: number, z: number }} positionOffset
   * @param {{ method: string, bboxCenterX: number, centroidX: number, referenceHeadWidth: number }} xAlign
   */
  _registerAlignedPose(entry, positionOffset, xAlign) {
    const { poseKey, path, root, rawHeadWidth, sizeBoost, scaleFactor } = entry;

    this.alignmentRecords.push({
      poseKey,
      path,
      rawHeadWidth,
      referenceHeadWidth: xAlign.referenceHeadWidth,
      sizeBoost,
      scaleFactor,
      positionOffset: { ...positionOffset },
      xAlign: {
        method: xAlign.method,
        bboxCenterX: xAlign.bboxCenterX,
        centroidX: xAlign.centroidX
      }
    });

    root.visible = poseKey === this._activePoseKey;
    root.userData.poseKey = poseKey;
    this._roots.set(poseKey, root);
    this._materials.set(poseKey, collectMaterials(root));
    this.mountNode.add(root);
  }

  /**
   * 顺序式切换：canvas 整体变暗 → 短暂停顿并换模型 → canvas 整体变亮。
   * 3D 模型任意时刻保持不透明（visible 切换），彻底规避 PBR 半透明发暗/条纹伪影。
   * @param {PoseKey} poseKey
   */
  setPose(poseKey) {
    if (!this._roots.has(poseKey)) {
      console.warn(`[PoseManager] 未知姿态: ${poseKey}`);
      return;
    }

    if (!this._isTransitioning && poseKey === this._activePoseKey) return;
    if (this._isTransitioning && this._transition?.toKey === poseKey) return;

    this._cancelTransitionAnimation();

    let fromKey = null;
    let startPhase = 'fadeOut';
    let canvasStart = this._canvasOpacity;

    if (this._transition) {
      const { phase, fromKey: fk, toKey: tk } = this._transition;
      if (phase === 'fadeOut' && fk) {
        fromKey = fk;
      } else if (phase === 'fadeIn' && tk) {
        fromKey = tk;
      } else {
        startPhase = 'fadeIn';
        canvasStart = 0;
      }
    } else if (this._activePoseKey !== poseKey) {
      fromKey = this._activePoseKey;
      canvasStart = 1;
    }

    if (fromKey === poseKey && canvasStart >= 0.999) return;

    for (const [key] of this._roots) {
      this._hidePose(key);
    }

    if (fromKey && startPhase === 'fadeOut') {
      const fromRoot = this._roots.get(fromKey);
      fromRoot.visible = true;
      this._restoreOpaque(fromKey);
      this._setCanvasOpacity(canvasStart);
    } else {
      fromKey = null;
      startPhase = 'fadeIn';
      canvasStart = 0;
      this._setCanvasOpacity(0);
    }

    this._transition = {
      fromKey,
      toKey: poseKey,
      canvasStart,
      phase: startPhase,
      phaseStartTime: performance.now()
    };
    this._isTransitioning = true;

    if (startPhase === 'fadeIn') {
      const toRoot = this._roots.get(poseKey);
      toRoot.visible = true;
      this._restoreOpaque(poseKey);
    }

    this._rafId = requestAnimationFrame(() => this._animateTransition());
  }

  _cancelTransitionAnimation() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _animateTransition() {
    if (!this._transition) return;

    const now = performance.now();
    const { fromKey, toKey, canvasStart, phase, phaseStartTime } = this._transition;
    const phaseElapsed = now - phaseStartTime;

    if (phase === 'fadeOut') {
      const t = Math.min(phaseElapsed / FADE_OUT_MS, 1);
      this._setCanvasOpacity(canvasStart * (1 - easeInOutQuad(t)));

      if (t >= 1) {
        if (fromKey) {
          this._hidePose(fromKey);
        }
        this._setCanvasOpacity(0);
        this._transition.phase = 'pause';
        this._transition.phaseStartTime = now;
      }
    } else if (phase === 'pause') {
      if (phaseElapsed >= PAUSE_MS) {
        this._transition.phase = 'fadeIn';
        this._transition.phaseStartTime = now;
        const toRoot = this._roots.get(toKey);
        toRoot.visible = true;
        this._restoreOpaque(toKey);
        this._setCanvasOpacity(0);
      }
    } else if (phase === 'fadeIn') {
      const t = Math.min(phaseElapsed / FADE_IN_MS, 1);
      this._setCanvasOpacity(easeInOutQuad(t));

      if (t >= 1) {
        this._finishTransition(toKey);
        return;
      }
    }

    this._rafId = requestAnimationFrame(() => this._animateTransition());
  }

  _finishTransition(poseKey) {
    this._cancelTransitionAnimation();
    this._transition = null;
    this._isTransitioning = false;

    for (const [key] of this._roots) {
      this._hidePose(key);
    }

    const activeRoot = this._roots.get(poseKey);
    activeRoot.visible = true;
    this._restoreOpaque(poseKey);
    this._setCanvasOpacity(1);

    this._activePoseKey = poseKey;
    if (this._onPoseChange && activeRoot) {
      this._onPoseChange(activeRoot);
    }
  }

  _getCanvas() {
    return document.getElementById('scene-canvas');
  }

  /**
   * 2D 主线序列临时接管角色画面时调整 3D 垫底可见度。
   * 保留内部 opacity 状态，使后续 setPose() 能从当前值平滑恢复。
   * @param {number} value 0–1
   */
  setCanvasOpacity(value) {
    this._setCanvasOpacity(value);
  }

  /**
   * 2D 主线已凑齐时强制隐藏 3D canvas，避免透明精灵后露出垫底模型。
   * 开启后 setPose 过渡也不会把 canvas 淡回可见。
   * @param {boolean} hidden
   */
  setCanvasHidden(hidden) {
    this._forceCanvasHidden = Boolean(hidden);
    if (this._forceCanvasHidden) {
      this._setCanvasOpacity(0);
    }
  }

  /** @returns {boolean} */
  isCanvasHidden() {
    return Boolean(this._forceCanvasHidden);
  }

  /** 在 canvas 层做 2D 明暗过渡，禁用 CSS transition 避免与 rAF 冲突 */
  _setCanvasOpacity(value) {
    const clamped = this._forceCanvasHidden
      ? 0
      : THREE.MathUtils.clamp(value, 0, 1);
    this._canvasOpacity = clamped;
    const canvas = this._getCanvas();
    if (canvas) {
      canvas.style.transition = 'none';
      canvas.style.opacity = String(clamped);
    }
  }

  _hidePose(poseKey) {
    const root = this._roots.get(poseKey);
    if (!root) return;
    root.visible = false;
  }

  /** 确保材质保持不透明渲染路径（过渡期间也不再改 transparent/opacity） */
  _restoreOpaque(poseKey) {
    const materials = this._materials.get(poseKey);
    if (!materials) return;

    materials.forEach((material) => {
      material.opacity = 1;
      material.transparent = false;
      material.depthWrite = true;
      material.needsUpdate = true;
    });
  }

  /** @returns {PoseKey} */
  getActivePoseKey() {
    return this._activePoseKey;
  }

  /**
   * 当前屏幕上实际可见的姿态 key（过渡期间跟随 fadeOut/fadeIn 阶段）。
   * 动态效果层应使用此值而非 getActivePoseKey()，避免 cross-fade 中
   * 新姿态已显示但 _activePoseKey 尚未更新的空窗期。
   * @returns {PoseKey}
   */
  getVisiblePoseKey() {
    if (this._transition) {
      const { phase, fromKey, toKey } = this._transition;
      if (phase === 'fadeOut' && fromKey) return fromKey;
      if (phase === 'fadeIn') return toKey;
      if (phase === 'pause') return toKey;
    }
    return this._activePoseKey;
  }

  /** @returns {THREE.Object3D | null} */
  getActiveRoot() {
    return this._roots.get(this._activePoseKey) ?? null;
  }

  /** @returns {THREE.Object3D | null} */
  getVisibleRoot() {
    const key = this.getVisiblePoseKey();
    return this._roots.get(key) ?? null;
  }

  /**
   * @param {(root: THREE.Object3D) => void} callback
   */
  setOnPoseChange(callback) {
    this._onPoseChange = callback;
  }

  /**
   * @param {(root: THREE.Object3D, poseKey: PoseKey) => void} callback
   */
  forEachModel(callback) {
    for (const [poseKey, root] of this._roots) {
      callback(root, poseKey);
    }
  }

  /**
   * @deprecated 调试面板已迁移至 EmotionController.createDebugUI()，
   * 上层请通过 playEmotion() 触发姿态，勿再直接调用本方法。
   * @param {HTMLElement} container
   * @param {import('../core/EmotionController.js').EmotionController} [emotionController]
   */
  createDebugUI(container, emotionController) {
    if (emotionController) {
      return emotionController.createDebugUI(container);
    }
    console.warn(
      '[PoseManager.createDebugUI] 已弃用：请使用 EmotionController.createDebugUI()'
    );
    return null;
  }

  /**
   * 显示/隐藏加载遮罩。
   * @param {boolean} visible
   */
  static setLoadingMaskVisible(visible) {
    const mask = document.getElementById('loading-mask');
    if (mask) {
      mask.style.display = visible ? 'flex' : 'none';
    }
  }
}
