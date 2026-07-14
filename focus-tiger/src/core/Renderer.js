// 职责：只负责 renderer / camera / lights 的初始化，不涉及场景内容。

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  SCENE_TONE_MAPPING_EXPOSURE,
  SCENE_LIGHT_HEMISPHERE,
  SCENE_LIGHT_AMBIENT,
  SCENE_LIGHT_MAIN,
  SCENE_LIGHT_FILL
} from '../utils/Constants.js';

export function createRenderer(container, canvas = null) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas ?? undefined,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = SCENE_TONE_MAPPING_EXPOSURE;
  if (!canvas) {
    container.appendChild(renderer.domElement);
  }

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.8, 4);
  camera.lookAt(0, 0.6, 0);

  const hemisphereLight = new THREE.HemisphereLight(0xfff8f0, 0xe8e6e1, SCENE_LIGHT_HEMISPHERE);
  const ambientLight = new THREE.AmbientLight(0xffffff, SCENE_LIGHT_AMBIENT);
  const mainLight = new THREE.DirectionalLight(0xffffff, SCENE_LIGHT_MAIN);
  mainLight.position.set(3, 5, 4);
  const fillLight = new THREE.DirectionalLight(0xfff4e8, SCENE_LIGHT_FILL);
  fillLight.position.set(-2, 2, -1);

  const lights = [hemisphereLight, ambientLight, mainLight, fillLight];

  function onResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  window.addEventListener('resize', onResize);

  return { renderer, camera, lights, onResize };
}

/** 为 PBR 材质提供环境反射（无 HDR 文件时用程序化室内环境） */
export function setupSceneEnvironment(renderer, scene) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const environment = new RoomEnvironment();
  scene.environment = pmremGenerator.fromScene(environment).texture;

  environment.dispose();
  pmremGenerator.dispose();
}
