/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 职责：管理 EffectComposer 和后处理 pass 链。
// 本任务只需要搭好 EffectComposer 骨架 + 一个基础 RenderPass，
// 灰→金 shader pass 的真正接入是 Task 1 的工作。

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // TODO(Task 1): 在此追加灰→金 ShaderPass，本任务不做

  return composer;
}
