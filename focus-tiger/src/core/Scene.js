// 职责：场景图组装——老虎挂载点。
// 默认闭眼坐禅 GLB（阿寅 · 单色暖浅灰棉麻禅修服/茶服风，无红边）已自带蒲团，故不再创建程序化 MeditationCushion。

import * as THREE from 'three';
import { COLORS } from '../utils/Constants.js';

/** 老虎挂载点世界 Y，与 PoseManager GROUND_Y=0 配合：模型脚底落在此高度 */
export const TIGER_MOUNT_Y = 0.15;

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.ambienceFog);

  const tiger = new THREE.Object3D();
  tiger.position.y = TIGER_MOUNT_Y;
  tiger.userData.isTigerMount = true;
  scene.add(tiger);

  return {
    scene,
    mounts: {
      tiger
    }
  };
}
