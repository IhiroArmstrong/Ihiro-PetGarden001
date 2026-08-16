/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * SessionEndFlow —— 会话结束到反思环节的衔接协调。
 *
 * 时序约束（2026-07-16 已确认）：
 * - 正常完成：完成反馈（Celebrating 等）完整播放并回归基础坐姿后，
 *   留白 POST_FEEDBACK_PAUSE_MS 再淡入反思面板，不与粒子/庆祝同屏；
 * - 主动结束：不播放 IncenseComplete / Celebrating 等完成反馈
 *   （避免「尚未完成却播放完成反馈」的语义错误），回归坐姿后短暂留白即淡入。
 * - 意图回显：达标与未达标均传入 Reflection（意图与是否达标无关）。
 */

import { getStorage, setStorage } from '../utils/Storage.js';

export const POST_FEEDBACK_PAUSE_MS = 400;
export const MANUAL_END_PAUSE_MS = 300;
export const REFLECTION_MAX_SAVED = 5;
export const REFLECTION_STORAGE_KEY = 'focus-tiger.reflections.v1';

/**
 * 纯函数：追加一条反思记录并保留最近 N 条。
 * @param {object[]} existing
 * @param {object} entry
 * @param {number} [maxEntries]
 */
export function trimReflections(existing, entry, maxEntries = REFLECTION_MAX_SAVED) {
  const list = Array.isArray(existing) ? existing : [];
  return [...list, entry].slice(-maxEntries);
}

export class SessionEndFlow {
  /**
   * @param {object} deps
   * @param {import('../ui/TigerReflectionMoment.js').TigerReflectionMoment} deps.reflectionMoment
   * @param {() => number} [deps.now]
   */
  constructor({ reflectionMoment, now = () => Date.now() }) {
    this.reflectionMoment = reflectionMoment;
    this.now = now;
    this._pendingTimer = null;

    this.reflectionMoment.onDone = (result, hasAnyAnswer) => {
      // 全部跳过则不落任何记录；只保存非空答案，不做标签化或统计。
      if (!hasAnyAnswer) return;
      const entry = { createdAt: this.now(), ...result };
      const saved = trimReflections(
        getStorage(REFLECTION_STORAGE_KEY, []),
        entry
      );
      setStorage(REFLECTION_STORAGE_KEY, saved);
    };
  }

  /**
   * 会话结束统一入口。
   * @param {object} [options]
   * @param {boolean} [options.completed] 是否自然达标完成（决定留白时长；调用方须保证
   *   completed=true 时完成反馈已播放完毕、角色已回归基础坐姿）
   * @param {string} [options.intention] 本次会话 Choose 内容（可空；空则不回显）
   * @param {'icon' | 'typed' | string} [options.intentionSource]
   */
  onSessionEnded({
    completed = false,
    intention = '',
    intentionSource = 'typed'
  } = {}) {
    window.clearTimeout(this._pendingTimer);
    const pauseMs = completed ? POST_FEEDBACK_PAUSE_MS : MANUAL_END_PAUSE_MS;
    const echo = typeof intention === 'string' ? intention : '';
    this._pendingTimer = window.setTimeout(() => {
      this.reflectionMoment.open({
        intention: echo,
        intentionSource
      });
    }, pauseMs);
  }

  cancelPending() {
    window.clearTimeout(this._pendingTimer);
    this._pendingTimer = null;
  }
}
