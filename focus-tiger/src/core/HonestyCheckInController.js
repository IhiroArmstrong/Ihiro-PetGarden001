/**
 * Honesty Check-in 编排。
 *
 * - 不调用 ReminderQuotaManager（用户主动发起，不占共享提醒池）
 * - 开场 / 零完成默认基底为 Idle（闭目坐禅），不再自动进 DORMANT 睡态
 * - 未达标起身（Rise）：若当日仍零完成 → 回 Idle（无失败/未完成类文案）
 * - DORMANT / dormantWake 仍保留给调试「睡着了」路径
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
   * @param {() => void} [deps.onCheckInComplete] 补登仪式结束（记账）后；桥接 CTA 挂这里
   * @param {() => void} [deps.onPracticeDay] 计时达标或 Honesty 记账后标记练习日（光点圈）
   */
  constructor({
    store,
    stateManager,
    emotionController,
    ui,
    applyFocusGlow = () => {},
    clearFocusGlow = () => {},
    onCheckInComplete = () => {},
    onPracticeDay = () => {}
  }) {
    this.store = store;
    this.stateManager = stateManager;
    this.emotionController = emotionController;
    this.ui = ui;
    this.applyFocusGlow = applyFocusGlow;
    this.clearFocusGlow = clearFocusGlow;
    this.onCheckInComplete = onCheckInComplete;
    this.onPracticeDay = onPracticeDay;
    /** @type {number | null} */
    this._pendingMinutes = null;
    this._busy = false;

    this.ui.handlers = {
      onPromptClick: () => this._onPromptClick(),
      onDurationSelect: (minutes) => this._onDurationSelect(minutes),
      onBreathComplete: () => this._onBreathComplete(),
      onIdleEntryClick: () => this.openDurationChoices()
    };
  }

  /** App 就绪后调用：零完成保持 Idle + 可忽略 Honesty 提示；有完成则离任何残留 DORMANT。 */
  onAppReady() {
    this.syncDormantState({ showPromptIfZeroCompletions: true });
    this.syncIdleEntry();
  }

  /**
   * 正常计时达标完成时写入同一套完成记录，并离开 DORMANT（若有）。
   * @param {number} durationMinutes
   */
  onTimedSessionCompleted(durationMinutes) {
    this.store.recordCompletion(durationMinutes);
    this.onPracticeDay();
    this.ui.hide();
    this._busy = false;
    this._pendingMinutes = null;
    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }
    this.ui.hideIdleEntry();
  }

  /**
   * 用户主动结束且未达标：不写完成记录、无失败文案；
   * 若当日仍零完成则回 Idle（闭目坐禅），不再落入 Sleeping。
   */
  onIncompleteSessionEnded() {
    this.ui.hide();
    this._busy = false;
    this._pendingMinutes = null;
    this.clearFocusGlow();
    this.ui.hideIdleEntry();

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
   * @param {boolean} [options.showPromptIfZeroCompletions]
   * @param {boolean} [options.showPromptIfDormant] 兼容旧调用名
   */
  syncDormantState({
    showPromptIfZeroCompletions = false,
    showPromptIfDormant = false
  } = {}) {
    const showPrompt = showPromptIfZeroCompletions || showPromptIfDormant;

    if (this.store.hasCompletedToday()) {
      if (this.stateManager.state === STATES.DORMANT) {
        this.stateManager.setState(STATES.IDLE);
      }
      this.ui.hide();
      this.syncIdleEntry();
      return;
    }

    this.ui.hideIdleEntry();

    // 产品口径（2026-07-21）：开场 / 零完成默认 Idle 闭目坐禅，不上 Sleeping。
    // 若残留 DORMANT（调试睡着后），收回 Idle——补登进行中勿打断。
    if (
      !this._busy &&
      this.stateManager.state === STATES.DORMANT &&
      this.stateManager.state !== STATES.FOCUSING &&
      this.stateManager.state !== STATES.CELEBRATE
    ) {
      this.stateManager.setState(STATES.IDLE);
    }

    if (showPrompt && !this._busy) {
      this.ui.showPrompt();
    }
  }

  /**
   * 同日再补登入口：仅当日已有完成、且空闲无叠层仪式时显示。
   * 首次零完成走自动 Honesty 提示，不显示本入口。
   */
  syncIdleEntry() {
    const canShow =
      this.store.hasCompletedToday() &&
      !this._busy &&
      this.ui.phase === 'hidden' &&
      this.stateManager.state !== STATES.FOCUSING &&
      this.stateManager.state !== STATES.CELEBRATE &&
      this.stateManager.state !== STATES.DORMANT;
    if (canShow) {
      this.ui.showIdleEntry();
      return;
    }
    this.ui.hideIdleEntry();
  }

  _onPromptClick() {
    if (this._busy) return;
    if (this.stateManager.state === STATES.FOCUSING) return;
    this.openDurationChoices();
  }

  /**
   * 直接打开「补登多久」三选一（不经 Sit with Yin / 不经可忽略提示）。
   * 调试面板「Honesty唤醒」、零完成提示点击、同日再补登入口共用。
   * @param {{ force?: boolean }} [options] force：打断进行中的呼吸引导并重开
   */
  openDurationChoices({ force = false } = {}) {
    if (this.stateManager.state === STATES.FOCUSING) return;
    if (this.stateManager.state === STATES.CELEBRATE) return;
    if (this._busy && !force) return;

    this._busy = false;
    this._pendingMinutes = null;
    this.ui.hideIdleEntry();

    // 不再为补登强制切入 Sleeping；已在 Idle 则保持坐姿。
    // 仅当调试已处于 DORMANT 时，选时长才播 dormantWake。

    this.ui.showDurationChoices();
  }

  /** @param {number} minutes */
  _onDurationSelect(minutes) {
    if (this._busy) return;
    this._busy = true;
    this._pendingMinutes = minutes;
    this.ui.hideIdleEntry();

    // 仅从睡态补登才播 dormant-wake；开场 Idle / 同日再补登只走呼吸引导。
    if (this.stateManager.state === STATES.DORMANT) {
      this.emotionController.playEmotion(EMOTION_KEYS.DORMANT_WAKE, {
        holdPose: true
      });
    }
    this.ui.startBreathGuide(HONESTY_BREATH_MS);
  }

  _onBreathComplete() {
    const minutes = this._pendingMinutes ?? 30;
    this._pendingMinutes = null;

    this.store.recordCompletion(minutes);
    this.onPracticeDay();
    this.clearFocusGlow();
    this._busy = false;

    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }

    // 立刻让位桥接 CTA（Welcome 文案改由桥接面板顶部轻量回显）。
    this.ui.hide();
    this.onCheckInComplete();
    // 桥接关闭前先不显示再补登入口；main 在 bridge hide/decline 时再 sync。
  }
}
