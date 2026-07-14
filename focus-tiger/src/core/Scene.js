// 职责：场景图组装——老虎挂载点。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';
import { createMeditationCushion } from '../environment/MeditationCushion.js';

/** 老虎挂载点世界 Y，与 PoseManager GROUND_Y=0 配合：模型脚底落在此高度 */
export const TIGER_MOUNT_Y = 0.15;

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.ambienceFog);

  const tiger = new THREE.Object3D();
  tiger.position.y = TIGER_MOUNT_Y;
  tiger.userData.isTigerMount = true;
  scene.add(tiger);

  const cushion = createMeditationCushion(TIGER_MOUNT_Y);
  scene.add(cushion);

  return {
    scene,
    mounts: {
      tiger
    }
  };
}
