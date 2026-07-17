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
   */
  constructor({
    store,
    stateManager,
    emotionController,
    ui,
    applyFocusGlow = () => {},
    clearFocusGlow = () => {}
  }) {
    this.store = store;
    this.stateManager = stateManager;
    this.emotionController = emotionController;
    this.ui = ui;
    this.applyFocusGlow = applyFocusGlow;
    this.clearFocusGlow = clearFocusGlow;
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
    this.ui.showDurationChoices();
  }

  /** @param {number} minutes */
  _onDurationSelect(minutes) {
    if (this._busy) return;
    this._busy = true;
    this._pendingMinutes = minutes;
    // 呼吸引导期间保持 sleeping 循环；结束后再播放“睡 → 醒”的专属过渡。
    this.ui.startBreathGuide(HONESTY_BREATH_MS);
  }

  _onBreathComplete() {
    const minutes = this._pendingMinutes ?? 30;
    this._pendingMinutes = null;

    this.store.recordCompletion(minutes);

    const glow = focusLevelForHonestyMinutes(minutes);
    this.applyFocusGlow(glow);
    this.emotionController.playEmotion(EMOTION_KEYS.DORMANT_WAKE, {
      focusLevel: glow,
      onComplete: () => {
        this.clearFocusGlow();
        this.stateManager.setState(STATES.IDLE);
      }
    });

    this.ui.showThanks();
    this._busy = false;
  }
}
