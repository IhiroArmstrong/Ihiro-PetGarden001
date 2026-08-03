// 职责：把 StateManager 的状态变化翻译成情绪表现。
// 仅通过 EmotionController.playEmotion() 触发视觉，不直接调用 PoseManager / DynamicMotion。
// 本类绝不自行存储/维护专注状态，只持有对 stateManager / emotionController 的引用。

import { STATES } from './StateManager.js';
import {
  CAPCUT_DISSOLVE_MS,
  EMOTION_KEYS
} from './EmotionController.js';
import { isRiseInterruptHoldEmotion } from './sceneAnimationDispatcher.js';

export class MoodController {
  /**
   * @param {import('./StateManager.js').StateManager} stateManager
   * @param {import('./EmotionController.js').EmotionController} emotionController
   * @param {object} [hooks]
   * @param {() => void} [hooks.onCelebrateComplete] Celebrating 2D 弧线播完并已回归 idle 后回调
   */
  constructor(stateManager, emotionController, { onCelebrateComplete } = {}) {
    this.emotionController = emotionController;
    this.onCelebrateComplete =
      typeof onCelebrateComplete === 'function' ? onCelebrateComplete : null;
    stateManager.onChange((state) => this.handleStateChange(state));
  }

  handleStateChange(state) {
    if (state === STATES.IDLE || state === STATES.FOCUSING) {
      if (state === STATES.IDLE) {
        const current = this.emotionController.getCurrentEmotionKey();
        if (
          current === 'haloBreathing' ||
          current === 'dormantWake' ||
          isRiseInterruptHoldEmotion(current)
        ) {
          return;
        }
      }
      const current = this.emotionController.getCurrentEmotionKey();
      if (
        current === 'idle' &&
        this.emotionController.idleOrchestrator?.isActive?.()
      ) {
        return;
      }
      this.emotionController.playEmotion(EMOTION_KEYS.IDLE);
      return;
    }

    if (state === STATES.CELEBRATE) {
      this.emotionController.playEmotion(EMOTION_KEYS.CELEBRATING, {
        onComplete: () => {
          this.onCelebrateComplete?.();
        }
      });
      return;
    }

    if (state === STATES.DORMANT) {
      // 仅在实际发生「非 DORMANT → DORMANT」转换时触发（StateManager 同态 setState 为 no-op）。
      this._playDormantEntryVisual();
      return;
    }

    // TODO(Task 2): FOCUSING / 庆祝后 Smiling 与日期戳的完整映射
  }

  _playDormantEntryVisual() {
    this.emotionController.playEmotion(EMOTION_KEYS.CLOAK_SLEEP, {
      onComplete: () => {
        this.emotionController.playEmotion(EMOTION_KEYS.SLEEPING, {
          crossFadeMs: CAPCUT_DISSOLVE_MS
        });
      }
    });
  }
}
