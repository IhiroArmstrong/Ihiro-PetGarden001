// 职责：定义所有可播放的动作枚举与占位播放函数。

import * as THREE from 'three';

export const ACTIONS = Object.freeze({
  SIT: 'SIT',
  CHEER: 'CHEER',
  DOZE: 'DOZE',
  BLINK: 'BLINK',
  WAKE_UP: 'WAKE_UP'
});

export function playAction(tigerCharacter, actionName) {
  const clip = tigerCharacter.clips[actionName];
  if (!clip) {
    console.warn(
      `未找到动作clip: ${actionName}，请检查GLB实际的animation clip命名`
    );
    return;
  }

  const action = tigerCharacter.mixer.clipAction(clip);
  action.reset();

  if (actionName === ACTIONS.CHEER) {
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
  }

  action.play();
}
