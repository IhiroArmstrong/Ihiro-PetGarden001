// 职责：把 StateManager 的状态变化翻译成情绪表现。
// 仅通过 EmotionController.playEmotion() 触发视觉，不直接调用 PoseManager / DynamicMotion。
// 本类绝不自行存储/维护专注状态，只持有对 stateManager / emotionController 的引用。

import { STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';

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
      // Honesty 唤醒后会立刻切到 IDLE，但视觉应停留在 halo-breathing 奖励；
      // 仅在用户主动开始专注（FOCUSING）或其它情绪打断时离开光环。
      if (state === STATES.IDLE) {
        const current = this.emotionController.getCurrentEmotionKey();
        // Rise 后 riseStretchCasual 箕坐定格（及调试 blinkBreathe pingpong）；Honesty 光环/睡醒也不被 IDLE 冲掉
        if (
          current === 'haloBreathing' ||
          current === 'dormantWake' ||
          current === 'riseStretchCasual' ||
          current === 'blinkBreathe'
        ) {
          return;
        }
      }
      // 已在闭目坐禅编排中则勿重启，否则呼吸×5→眨眼计数会被反复清零。
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
      this.emotionController.playEmotion(EMOTION_KEYS.SLEEPING);
      return;
    }

    // TODO(Task 2): FOCUSING / 庆祝后 Smiling 与日期戳的完整映射
  }
}
