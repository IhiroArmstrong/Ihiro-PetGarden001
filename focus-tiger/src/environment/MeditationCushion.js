// 职责：禅意蒲团/打坐台——静止参照物，衬托老虎悬浮与呼吸效果。

import * as THREE from 'three';

/** 蒲团尺寸与材质（与 Scene.js 中 TIGER_MOUNT_Y 配合定位） */
export const MEDITATION_CUSHION_CONFIG = {
  bodyRadiusTop: 0.87,
  bodyRadiusBottom: 0.96,
  bodyHeight: 0.135,
  rimRadiusTop: 0.99,
  rimRadiusBottom: 1.02,
  rimHeight: 0.033,
  /** 较深暖橙色，与袈裟朱红区分、作为清晰地面参照 */
  bodyColor: '#d9722d',
  rimColor: '#c05820',
  roughness: 0.9,
  metalness: 0
};

/**
 * 创建蒲团组（独立于老虎 mount，保持静止）。
 * 顶面与 PoseManager GROUND_Y=0 在 mount 局部空间对齐，即世界坐标 tigerMountY。
 * @param {number} tigerMountY mounts.tiger 的世界 Y（默认 0.15）
 */
export function createMeditationCushion(tigerMountY) {
  const {
    bodyRadiusTop,
    bodyRadiusBottom,
    bodyHeight,
    rimRadiusTop,
    rimRadiusBottom,
    rimHeight,
    bodyColor,
    rimColor,
    roughness,
    metalness
  } = MEDITATION_CUSHION_CONFIG;

  const group = new THREE.Group();
  group.name = 'meditation-cushion';

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness,
    metalness
  });
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: rimColor,
    roughness: roughness + 0.02,
    metalness
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadiusTop, bodyRadiusBottom, bodyHeight, 56),
    bodyMaterial
  );
  body.castShadow = false;
  body.receiveShadow = true;

  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(rimRadiusTop, rimRadiusBottom, rimHeight, 56),
    rimMaterial
  );
  rim.castShadow = false;
  rim.receiveShadow = true;

  const topSurfaceY = tigerMountY;
  body.position.y = topSurfaceY - bodyHeight / 2;
  rim.position.y = topSurfaceY - rimHeight / 2 - 0.004;

  group.add(body, rim);
  return group;
}
