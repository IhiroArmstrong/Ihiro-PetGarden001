/**
 * Honesty Check-in / DORMANT 唤醒编排。
 *
 * - 不调用 ReminderQuotaManager（用户主动发起，不占共享提醒池）
 * - 未达标起身（Rise）：回到 DORMANT（若当日仍零完成），无失败/未完成类文案
 */

import { STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';

/** 与 HonestyCheckInUI.HONESTY_BREATH_MS 保持一致。 */
export const HONESTY_BREATH_MS = 10_000;

/** 所选时长 → 临时 focusLevel 占位（Rim Light 重构前对接既有 FocusVisualizer）。 */
export function focusLevelForHonestyMinutes(minutes) {
  if (minutes >= 30) return 1;
  if (minutes >= 20) return 0.7;
  if (minutes >= 10) return 0.4;
  return 0.3;
}

export class HonestyCheckInController {
  /**
   * @param {object} deps
   * @param {import('./DailyCompletionStore.js').DailyCompletionStore} deps.store
   * @param {import('./StateManager.js').StateManager} deps.stateManager
   * @param {import('./EmotionController.js').EmotionController} deps.emotionController
   * @param {HonestyCheckInUI} deps.ui
   * @param {(level: number) => void} [deps.applyFocusGlow]
   * @param {() => void} [deps.clearFocusGlow]
   * @param {() => void} [deps.onCheckInComplete] 补登仪式结束（记账 + 离 DORMANT）后；桥接 CTA 挂这里
   */
  constructor({
    store,
    stateManager,
    emotionController,
    ui,
    applyFocusGlow = () => {},
    clearFocusGlow = () => {},
    onCheckInComplete = () => {}
  }) {
    this.store = store;
    this.stateManager = stateManager;
    this.emotionController = emotionController;
    this.ui = ui;
    this.applyFocusGlow = applyFocusGlow;
    this.clearFocusGlow = clearFocusGlow;
    this.onCheckInComplete = onCheckInComplete;
    /** @type {number | null} */
    this._pendingMinutes = null;
    this._busy = false;

    this.ui.handlers = {
      onPromptClick: () => this._onPromptClick(),
      onDurationSelect: (minutes) => this._onDurationSelect(minutes),
      onBreathComplete: () => this._onBreathComplete()
    };
  }

  /** App 就绪后调用：按当日完成记录进入/离开 DORMANT，并在需要时展示可忽略提示。 */
  onAppReady() {
    this.syncDormantState({ showPromptIfDormant: true });
  }

  /**
   * 正常计时达标完成时写入同一套完成记录，并离开 DORMANT。
   * @param {number} durationMinutes
   */
  onTimedSessionCompleted(durationMinutes) {
    this.store.recordCompletion(durationMinutes);
    this.ui.hide();
    this._busy = false;
    this._pendingMinutes = null;
    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }
  }

  /**
   * 用户主动结束且未达标：不写完成记录、无失败文案；
   * 若当日仍零完成则保持/回到 DORMANT。
   */
  onIncompleteSessionEnded() {
    this.ui.hide();
    this._busy = false;
    this._pendingMinutes = null;
    this.clearFocusGlow();

    if (!this.store.hasCompletedToday()) {
      this.stateManager.setState(STATES.DORMANT);
      return;
    }

    if (
      this.stateManager.state === STATES.FOCUSING ||
      this.stateManager.state === STATES.CELEBRATE ||
      this.stateManager.state === STATES.DORMANT
    ) {
      this.stateManager.setState(STATES.IDLE);
    }
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.showPromptIfDormant]
   */
  syncDormantState({ showPromptIfDormant = false } = {}) {
    if (this.store.hasCompletedToday()) {
      if (this.stateManager.state === STATES.DORMANT) {
        this.stateManager.setState(STATES.IDLE);
      }
      this.ui.hide();
      return;
    }

    if (
      this.stateManager.state !== STATES.FOCUSING &&
      this.stateManager.state !== STATES.CELEBRATE
    ) {
      this.stateManager.setState(STATES.DORMANT);
    }

    if (showPromptIfDormant && !this._busy) {
      this.ui.showPrompt();
    }
  }

  _onPromptClick() {
    if (this._busy) return;
    if (this.stateManager.state === STATES.FOCUSING) return;
    this.openDurationChoices();
  }

  /**
   * 直接打开「补登多久」三选一（不经 Sit with Yin / 不经可忽略提示）。
   * 调试面板「Honesty唤醒」与提示点击共用此入口。
   * @param {{ force?: boolean }} [options] force：打断进行中的呼吸引导并重开
   */
  openDurationChoices({ force = false } = {}) {
    if (this.stateManager.state === STATES.FOCUSING) return;
    if (this.stateManager.state === STATES.CELEBRATE) return;
    if (this._busy && !force) return;

    this._busy = false;
    this._pendingMinutes = null;

    // 仪式需要睡态视觉；与 Sit with Yin / Arrival 无关。
    if (this.stateManager.state !== STATES.DORMANT) {
      this.stateManager.setState(STATES.DORMANT);
    }

    this.ui.showDurationChoices();
  }

  /** @param {number} minutes */
  _onDurationSelect(minutes) {
    if (this._busy) return;
    this._busy = true;
    this._pendingMinutes = minutes;

    // 倒计时开始：立刻播 dormant-wake 坐起并定格末帧；
    // 暂不接闭眼坐禅呼吸（转场衔接不成，2026-07-19）。
    this.emotionController.playEmotion(EMOTION_KEYS.DORMANT_WAKE, {
      holdPose: true
    });
    this.ui.startBreathGuide(HONESTY_BREATH_MS);
  }

  _onBreathComplete() {
    const minutes = this._pendingMinutes ?? 30;
    this._pendingMinutes = null;

    this.store.recordCompletion(minutes);
    this.clearFocusGlow();
    this.ui.showThanks();
    this._busy = false;

    // 已在坐姿（dormant-wake 末帧定格）；补登完成只需离开 DORMANT。
    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }

    // 桥接 CTA 独立于补登：仅仪式路径触发，不由此开计时。
    this.onCheckInComplete();
  }
}
