import { EMOTION_KEYS } from './EmotionController.js';

/**
 * 为一次达标会话选择且只触发一个完成反馈。
 * 当日已有完成记录时走轻量 SessionComplete；否则让 StateManager 启动 Celebrating。
 *
 * @param {object} options
 * @param {boolean} options.hasCompletedToday 记录本次会话前，当日是否已有完成
 * @param {import('./EmotionController.js').EmotionController} options.emotionController
 * @param {() => void} options.startCelebrating
 * @param {() => void} options.onComplete
 * @returns {'celebrating' | 'sessionComplete'}
 */
export function triggerSessionCompletionFeedback({
  hasCompletedToday,
  emotionController,
  startCelebrating,
  onComplete
}) {
  if (!hasCompletedToday) {
    startCelebrating();
    return EMOTION_KEYS.CELEBRATING;
  }

  emotionController.playEmotion(EMOTION_KEYS.SESSION_COMPLETE, { onComplete });
  return EMOTION_KEYS.SESSION_COMPLETE;
}
