// 职责：把 StateManager 的状态变化翻译成情绪表现。
// 仅通过 EmotionController.playEmotion() 触发视觉，不直接调用 PoseManager / DynamicMotion。
// 本类绝不自行存储/维护专注状态，只持有对 stateManager / emotionController 的引用。

import { STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';

export class MoodController {
  /**
   * @param {import('./StateManager.js').StateManager} stateManager
   * @param {import('./EmotionController.js').EmotionController} emotionController
   */
  constructor(stateManager, emotionController) {
    this.emotionController = emotionController;
    stateManager.onChange((state) => this.handleStateChange(state));
  }

  handleStateChange(state) {
    if (state === STATES.CELEBRATE) {
      this.emotionController.playEmotion(EMOTION_KEYS.CELEBRATING);
      return;
    }

    // TODO(Task 2): FOCUSING / DORMANT / 庆祝后 Smiling 与日期戳的完整映射
  }
}
