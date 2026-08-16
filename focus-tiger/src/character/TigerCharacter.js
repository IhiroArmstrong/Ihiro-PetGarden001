/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：老虎模型的加载与渲染控制（颜色/材质驱动）。

import * as THREE from 'three';
import {
  COLORS,
  TIGER_BRIGHTNESS_BOOST,
  TIGER_SATURATION_BOOST,
  TIGER_ENV_MAP_INTENSITY,
  TIGER_ROUGHNESS_HIGHLIGHT_REDUCTION,
  TIGER_SPECULAR_INTENSITY_MAX
} from '../utils/Constants.js';
import { loadGLTF } from '../utils/Loaders.js';
import { playAction as playActionImpl } from './Actions.js';

/*
 * GLB 材质结构检查结果（tiger.glb，压缩后 1.66MB，Draco+KTX2）：
 * - 网格：1 个 Mesh（node_0），约 50K 面
 * - 材质：MeshStandardMaterial（Material.001），doubleSided
 *   - map（baseColorTexture）：texture_pbr_20250901
 *   - normalMap：texture_pbr_20250901_normal
 *   - metalnessMap + roughnessMap：metallic-roughness 合并贴图
 * - 动画：gltf.animations 为空，无骨骼动画 clip
 *
 * 方案选择：贴图较复杂，采用 onBeforeCompile 渐变映射（Gradient Remap），
 * 保留贴图亮度层次，按 focusLevel 在原色/金色调间 mix（0% = 原图色，100% = 金色）。
 */

const CLIP_NAME_ALIASES = {
  SIT: ['SIT', 'Sit', 'Idle', 'Breathing', '打坐'],
  CHEER: ['CHEER', 'Cheer', 'cheer', '欢呼'],
  DOZE: ['DOZE', 'Doze', 'Sleep', '打瞌睡'],
  BLINK: ['BLINK', 'Blink', '眨眼'],
  WAKE_UP: ['WAKE_UP', 'WakeUp', 'Wake', '唤醒']
};


export class TigerCharacter {
  constructor(mountNode) {
    this.mountNode = mountNode;
    this.mixer = null;
    this.clips = {};
    this._model = null;
    this._materials = [];
    this._focusLevel = 0;
  }

  async load(glbPath, renderer) {
    const gltf = await loadGLTF(glbPath, renderer);
    this._model = gltf.scene;

    this._applyShadersToRoot(this._model);

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
    }

    this.mixer = new THREE.AnimationMixer(this._model);

    gltf.animations.forEach((clip) => {
      this.clips[clip.name] = clip;
    });

    Object.entries(CLIP_NAME_ALIASES).forEach(([actionKey, names]) => {
      if (this.clips[actionKey]) return;
      const match = names.find((name) => this.clips[name]);
      if (match) this.clips[actionKey] = this.clips[match];
    });

    while (this.mountNode.children.length > 0) {
      this.mountNode.remove(this.mountNode.children[0]);
    }

    const box = new THREE.Box3().setFromObject(this._model);
    const size = box.getSize(new THREE.Vector3());
    const targetHeight = 1.0;
    const scale = targetHeight / Math.max(size.y, 0.001);
    this._model.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(this._model);
    this._model.position.y = -scaledBox.min.y;
    this._model.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
    this._model.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;

    this.mountNode.add(this._model);
    this.setFocusLevel(this._focusLevel);
  }

  /** 绑定 PoseManager：为全部姿态模型应用原色→金 shader，并跟踪当前可见模型。 */
  bindPoseManager(poseManager) {
    poseManager.forEachModel((root) => {
      this._applyShadersToRoot(root);
    });

    this._model = poseManager.getActiveRoot();
    poseManager.setOnPoseChange((root) => {
      this._model = root;
    });
    this.setFocusLevel(this._focusLevel);
  }

  _applyShadersToRoot(root) {
    root.traverse((child) => {
      if (!child.isMesh) return;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material?.isMeshStandardMaterial) {
          this._tuneMaterialHighlights(material);
          this._applyFocusShader(material);
          this._materials.push(material);
        }
      });
    });
  }

  _tuneMaterialHighlights(material) {
    const baseRoughness = material.roughness ?? 1;
    material.roughness = THREE.MathUtils.clamp(
      baseRoughness + (1 - baseRoughness) * TIGER_ROUGHNESS_HIGHLIGHT_REDUCTION,
      0,
      1
    );
    material.envMapIntensity =
      (material.envMapIntensity ?? 1) * TIGER_ENV_MAP_INTENSITY;
    // MeshPhysicalMaterial 默认 specularIntensity=1 易抬高高光发白
    if ('specularIntensity' in material) {
      material.specularIntensity = Math.min(
        material.specularIntensity ?? 1,
        TIGER_SPECULAR_INTENSITY_MAX
      );
    }
    material.needsUpdate = true;
  }

  // TODO(奖励柜任务): 本 shader 的"本体色随 uFocusLevel 混入金色"做法已违反
  // 2026-07-15 确立的视觉原则（本体固有色恒定，见 DESIGN.md「视觉状态」章节）。
  // 3D 资产迁入奖励柜场景时重构为：本体色固定，改用 Fresnel Rim Light 边缘高光
  // + 提升 envMapIntensity / 降低 roughness + 金色光环 mesh 承接环境反射。
  // 当前 3D 主线已让位于 2D PNG 序列，本代码保留不动。
  _applyFocusShader(material) {
    const goldTint = new THREE.Color(COLORS.focusGoldFull);

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uFocusLevel = { value: this._focusLevel };
      shader.uniforms.uGoldTint = { value: goldTint };
      shader.uniforms.uBrightnessBoost = { value: TIGER_BRIGHTNESS_BOOST };
      shader.uniforms.uSaturationBoost = { value: TIGER_SATURATION_BOOST };

      shader.fragmentShader = `
        uniform float uFocusLevel;
        uniform vec3 uGoldTint;
        uniform float uBrightnessBoost;
        uniform float uSaturationBoost;
      ${shader.fragmentShader}`;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        vec3 originalColor = diffuseColor.rgb;
        originalColor = mix(vec3(lum), originalColor, uSaturationBoost);
        originalColor = clamp(originalColor * uBrightnessBoost, 0.0, 1.0);
        vec3 goldTinted = uGoldTint * (0.35 + lum * 0.65);
        goldTinted = mix(vec3(dot(goldTinted, vec3(0.299, 0.587, 0.114))), goldTinted, uSaturationBoost);
        goldTinted = clamp(goldTinted * uBrightnessBoost, 0.0, 1.0);
        diffuseColor.rgb = mix(originalColor, goldTinted, uFocusLevel);
        `
      );

      material.userData.focusShader = shader;
    };

    material.customProgramCacheKey = () => 'tiger_focus_remap_v3';
  }

  setFocusLevel(level) {
    this._focusLevel = THREE.MathUtils.clamp(level, 0, 1);
    this._materials.forEach((material) => {
      const shader = material.userData.focusShader;
      if (shader) {
        shader.uniforms.uFocusLevel.value = this._focusLevel;
      }
    });
  }

  playAction(actionName) {
    playActionImpl(this, actionName);
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  getWorldPosition(target = new THREE.Vector3()) {
    if (this._model) {
      return this._model.getWorldPosition(target);
    }
    return this.mountNode.getWorldPosition(target);
  }
}
