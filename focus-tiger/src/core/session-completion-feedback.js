import { EMOTION_KEYS } from './EmotionController.js';

/**
 * 为一次计时达标会话选择且只触发一个完成反馈。
 * 里程碑节点 → MilestoneGlow（压制同刻 Celebrating，庆祝戳仍由调用方记账）；
 * 否则：当日尚未 Celebrating → 完整庆祝；已庆祝过 → 轻量 SessionComplete。
 * （与「是否已有完成记录」解耦：Honesty 补登不占庆祝戳。）
 *
 * @param {object} options
 * @param {boolean} options.hasCelebratedToday 本次触发前，当日是否已播过 Celebrating
 * @param {boolean} [options.preferMilestoneGlow] 本场应播里程碑金辉
 * @param {import('./EmotionController.js').EmotionController} options.emotionController
 * @param {() => void} options.startCelebrating
 * @param {() => void} [options.startMilestoneGlow]
 * @param {() => void} options.onComplete
 * @returns {'celebrating' | 'sessionComplete' | 'milestoneGlow'}
 */
export function triggerSessionCompletionFeedback({
  hasCelebratedToday,
  preferMilestoneGlow = false,
  emotionController,
  startCelebrating,
  startMilestoneGlow,
  onComplete
}) {
  if (preferMilestoneGlow && typeof startMilestoneGlow === 'function') {
    startMilestoneGlow();
    return EMOTION_KEYS.MILESTONE_GLOW;
  }

  if (!hasCelebratedToday) {
    startCelebrating();
    return EMOTION_KEYS.CELEBRATING;
  }

  emotionController.playEmotion(EMOTION_KEYS.SESSION_COMPLETE, { onComplete });
  return EMOTION_KEYS.SESSION_COMPLETE;
}
