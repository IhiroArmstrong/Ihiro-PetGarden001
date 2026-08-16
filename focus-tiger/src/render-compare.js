/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// 最小对比场景：同一 GLB + 与主场景一致的 renderer/光照/贴图配置，无对齐/预加载/fog/shader。

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { configurePBRTextures } from './utils/configurePBRTextures.js';

const MODEL_PATH = '/models/tiger-meditate-closed.glb';

async function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e8e6e1');

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(environment).texture;
  environment.dispose();
  pmremGenerator.dispose();

  scene.add(new THREE.HemisphereLight(0xfff8f0, 0xe8e6e1, 0.65));
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
  mainLight.position.set(3, 5, 4);
  scene.add(mainLight);
  const fillLight = new THREE.DirectionalLight(0xfff4e8, 0.9);
  fillLight.position.set(-2, 2, -1);
  scene.add(fillLight);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.8, 4);
  camera.lookAt(0, 0.6, 0);

  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);
  const ktx2 = new KTX2Loader();
  ktx2.setTranscoderPath('/basis/');
  ktx2.detectSupport(renderer);
  loader.setKTX2Loader(ktx2);

  const gltf = await new Promise((resolve, reject) => {
    loader.load(MODEL_PATH, resolve, undefined, reject);
  });

  const model = gltf.scene;
  configurePBRTextures(model, renderer);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(1.0 / Math.max(size.y, 0.001));
  const scaledBox = new THREE.Box3().setFromObject(model);
  model.position.y = -scaledBox.min.y;
  model.position.x = -(scaledBox.min.x + scaledBox.max.x) / 2;
  model.position.z = -(scaledBox.min.z + scaledBox.max.z) / 2;
  model.position.y += 0.15;

  scene.add(model);

  window.__renderCompareReady = true;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  window.addEventListener('resize', onResize);

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}

init().catch((error) => {
  console.error('render-compare 初始化失败:', error);
});
