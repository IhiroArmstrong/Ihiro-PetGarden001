/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import * as THREE from 'three';

const COLOR_TEXTURE_KEYS = ['map', 'emissiveMap'];
const DATA_TEXTURE_KEYS = [
  'normalMap',
  'metalnessMap',
  'roughnessMap',
  'aoMap',
  'alphaMap'
];

/**
 * 为 GLB 材质的 PBR 贴图设置正确的 colorSpace 与各向异性过滤。
 * 仅在模型加载完成时调用一次。
 * @param {THREE.Object3D} object
 * @param {THREE.WebGLRenderer} renderer
 */
export function configurePBRTextures(object, renderer) {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  object.traverse((child) => {
    if (!child.isMesh) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!material) return;

      COLOR_TEXTURE_KEYS.forEach((key) => {
        const texture = material[key];
        if (!texture) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAnisotropy;
        texture.needsUpdate = true;
      });

      DATA_TEXTURE_KEYS.forEach((key) => {
        const texture = material[key];
        if (!texture) return;
        texture.anisotropy = maxAnisotropy;
      });
    });
  });
}
