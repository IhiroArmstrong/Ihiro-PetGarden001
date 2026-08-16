/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { EMOTION_KEYS } from './EmotionController.js';
import {
  SCENE_ANIM_EVENTS,
  resolveSceneAnimation
} from './sceneAnimationDispatcher.js';

/**
 * 为一次计时达标会话选择且只触发一个完成反馈。
 * 里程碑节点 → MilestoneGlow（压制同刻 Celebrating，庆祝戳仍由调用方记账）；
 * 否则：当日尚未 Celebrating → 完整庆祝；已庆祝过 → 轻量同档池（sessionComplete / nod / blink）。
 * （与「是否已有完成记录」解耦：Honesty 补登不占庆祝戳。）
 *
 * @param {object} options
 * @param {boolean} options.hasCelebratedToday 本次触发前，当日是否已播过 Celebrating
 * @param {boolean} [options.preferMilestoneGlow] 本场应播里程碑金辉
 * @param {import('./EmotionController.js').EmotionController} options.emotionController
 * @param {() => void} options.startCelebrating
 * @param {() => void} [options.startMilestoneGlow]
 * @param {() => void} options.onComplete
 * @param {() => number} [options.random]
 * @returns {string} emotion key played / started
 */
export function triggerSessionCompletionFeedback({
  hasCelebratedToday,
  preferMilestoneGlow = false,
  emotionController,
  startCelebrating,
  startMilestoneGlow,
  onComplete,
  random = Math.random
}) {
  if (preferMilestoneGlow && typeof startMilestoneGlow === 'function') {
    startMilestoneGlow();
    return EMOTION_KEYS.MILESTONE_GLOW;
  }

  if (!hasCelebratedToday) {
    startCelebrating();
    return EMOTION_KEYS.CELEBRATING;
  }

  const decision = resolveSceneAnimation({
    event: SCENE_ANIM_EVENTS.SESSION_COMPLETE_LIGHT,
    sessionState: 'IDLE',
    random
  });
  const key = decision.emotionKey || EMOTION_KEYS.SESSION_COMPLETE;
  emotionController.playEmotion(key, { onComplete });
  return key;
}
