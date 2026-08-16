/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

let gltfLoaderInstance = null;

function createGLTFLoader(renderer) {
  if (gltfLoaderInstance) {
    return gltfLoaderInstance;
  }

  const loader = new GLTFLoader();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('/basis/');
  if (renderer) {
    ktx2Loader.detectSupport(renderer);
  }
  loader.setKTX2Loader(ktx2Loader);

  gltfLoaderInstance = loader;
  return loader;
}

export function loadGLTF(path, renderer) {
  const loader = createGLTFLoader(renderer);
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}

export function loadTexture(path) {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, undefined, reject);
  });
}
