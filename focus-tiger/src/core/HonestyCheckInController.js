/**
 * Honesty Check-in 编排 + DORMANT 惰性同步。
 *
 * - 不调用 ReminderQuotaManager（用户主动发起，不占共享提醒池）
 * - 零完成 / 新用户开场默认 Idle；DORMANT 由「距上次专注结束 ≥ DORMANT_IDLE_HOURS」惰性判定
 * - 未达标 Rise：记专注结束时刻 → Idle；2h 后再 sync 可进 DORMANT
 * - Honesty 从 DORMANT 唤醒仍走 dormantWake（E1–E7）
 */

import { STATES } from './StateManager.js';
import { EMOTION_KEYS } from './EmotionController.js';
import { shouldEnterDormantIdle } from './dormantTrigger.js';
import { DORMANT_IDLE_MS } from '../utils/Constants.js';

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
   * @param {import('./FocusSessionEndStore.js').FocusSessionEndStore} deps.focusSessionEndStore
   * @param {import('./StateManager.js').StateManager} deps.stateManager
   * @param {import('./EmotionController.js').EmotionController} deps.emotionController
   * @param {HonestyCheckInUI} deps.ui
   * @param {(level: number) => void} [deps.applyFocusGlow]
   * @param {() => void} [deps.clearFocusGlow]
   * @param {() => void} [deps.onCheckInComplete] 补登仪式结束（记账）后；桥接 CTA 挂这里
   * @param {(detail: { durationMinutes: number }) => void} [deps.onPracticeDay]
   *   计时达标或 Honesty 记账后标记练习日（光点圈 + 当日累计分钟）
   * @param {(detail: { durationMinutes: number }) => void} [deps.onSessionRecorded]
   *   完成写入后（计时 / Honesty）；留存 `first_session_complete` 挂这里
   * @param {() => void} [deps.notifyUser] 非模态提示（如 toast）；pending 丢失 abort 时由 main 注入文案
   * @param {() => void} [deps.notifyRecorded] 补登成功记账后的轻量确认（如 toast）；abort 不得调用
   * @param {() => boolean} [deps.isIdleEntryBlocked]
   *   外部叠层占用（如 Honesty 桥接 Yes/No）时禁止再出示入口；防 dock 钮盖住桥接
   * @param {() => Date} [deps.now]
   * @param {number} [deps.dormantIdleMs]
   */
  constructor({
    store,
    focusSessionEndStore,
    stateManager,
    emotionController,
    ui,
    applyFocusGlow = () => {},
    clearFocusGlow = () => {},
    onCheckInComplete = () => {},
    onPracticeDay = () => {},
    onSessionRecorded = () => {},
    notifyUser = () => {},
    notifyRecorded = () => {},
    isIdleEntryBlocked = () => false,
    now = () => new Date(),
    dormantIdleMs = DORMANT_IDLE_MS
  }) {
    this.store = store;
    this.focusSessionEndStore = focusSessionEndStore;
    this.stateManager = stateManager;
    this.emotionController = emotionController;
    this.ui = ui;
    this.applyFocusGlow = applyFocusGlow;
    this.clearFocusGlow = clearFocusGlow;
    this.onCheckInComplete = onCheckInComplete;
    this.onPracticeDay = onPracticeDay;
    this.onSessionRecorded = onSessionRecorded;
    this.notifyUser = notifyUser;
    this.notifyRecorded = notifyRecorded;
    this.isIdleEntryBlocked = isIdleEntryBlocked;
    this.now = now;
    this.dormantIdleMs = dormantIdleMs;
    /** @type {number | null} */
    this._pendingMinutes = null;
    this._busy = false;
    /** 点开 Honesty 至桥接结束（或 abort 后离开）期间为 true，入口保持隐藏 */
    this._checkInFlowOpen = false;

    this.ui.handlers = {
      onPromptClick: () => this._onPromptClick(),
      onDurationSelect: (minutes) => this._onDurationSelect(minutes),
      onBreathComplete: () => this._onBreathComplete(),
      onIdleEntryClick: () => this.openDurationChoices()
    };
  }

  /** App 就绪 / 回前台：惰性同步 DORMANT ↔ Idle。 */
  onAppReady() {
    this.syncDormantState();
  }

  /**
   * 正常计时达标完成时写入同一套完成记录，并离开 DORMANT（若有）。
   * @param {number} durationMinutes
   */
  onTimedSessionCompleted(durationMinutes) {
    this.focusSessionEndStore.recordSessionEnded();
    const entry = this.store.recordCompletion(durationMinutes);
    this.onPracticeDay({ durationMinutes });
    if (entry) {
      this.onSessionRecorded({ durationMinutes: entry.durationMinutes });
    }
    this.ui.hide();
    this.endCheckInFlow();
    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }
    this.syncIdleEntry();
  }

  /**
   * 用户主动结束且未达标：不写完成记录、无失败文案；记专注结束 → Idle。
   */
  onIncompleteSessionEnded() {
    this.focusSessionEndStore.recordSessionEnded();
    this.ui.hide();
    this.endCheckInFlow();
    this.clearFocusGlow();

    if (
      this.stateManager.state === STATES.FOCUSING ||
      this.stateManager.state === STATES.CELEBRATE ||
      this.stateManager.state === STATES.DORMANT
    ) {
      this.stateManager.setState(STATES.IDLE);
    }
    this.syncDormantState();
  }

  /**
   * 惰性判定是否应处于 DORMANT；在 App 就绪、回前台、Rise 结束后调用。
   * @param {object} [_options] 保留兼容；showPrompt* 已废弃
   */
  syncDormantState(_options = {}) {
    if (this._busy || this._checkInFlowOpen) {
      this.syncIdleEntry();
      return;
    }

    const state = this.stateManager.state;
    if (state === STATES.FOCUSING || state === STATES.CELEBRATE) {
      this.syncIdleEntry();
      return;
    }

    const shouldDormant = shouldEnterDormantIdle({
      lastEndedAt: this.focusSessionEndStore.getLastEndedAt(),
      nowMs: this.focusSessionEndStore.now().getTime(),
      idleMs: this.dormantIdleMs
    });

    if (shouldDormant) {
      if (state !== STATES.DORMANT) {
        this.stateManager.setState(STATES.DORMANT);
      }
    } else if (state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }

    this.syncIdleEntry();
  }

  /**
   * Honesty Check-in 入口：Idle 时始终显示小钮（含零完成开局），点进时长三选一。
   * 点开后至桥接 Yes/No（或 abort 离开）期间入口保持隐藏。
   */
  syncIdleEntry() {
    const canShow =
      !this._busy &&
      !this._checkInFlowOpen &&
      !this.isIdleEntryBlocked() &&
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

  /**
   * 桥接 Yes/No / 取消后调用：结束补登占用，允许再出示 Honesty 入口。
   * 不自行 sync UI——由 main `syncHonestyIdleEntry` 在叠层状态就绪后统一投影。
   */
  endCheckInFlow() {
    this._busy = false;
    this._checkInFlowOpen = false;
    this._pendingMinutes = null;
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
    this._checkInFlowOpen = true;
    this.ui.hideIdleEntry();
    // 取消进行中的呼吸计时，避免 force 重开后 onBreathComplete 带着空 pending 触发
    this.ui.hide();
    this.ui.showDurationChoices();
  }

  /** @param {number} minutes */
  _onDurationSelect(minutes) {
    if (this._busy) return;
    this._busy = true;
    this._checkInFlowOpen = true;
    this._pendingMinutes = minutes;
    this.ui.hideIdleEntry();

    if (this.stateManager.state === STATES.DORMANT) {
      this.emotionController.playEmotion(EMOTION_KEYS.DORMANT_WAKE, {
        holdPose: true
      });
    }
    this.ui.startBreathGuide(HONESTY_BREATH_MS);
  }

  _onBreathComplete() {
    const minutes = this._pendingMinutes;
    this._pendingMinutes = null;

    if (!Number.isFinite(minutes) || minutes <= 0) {
      console.warn(
        '[HonestyCheckIn] breath complete without pending minutes; aborting record'
      );
      this._busy = false;
      this.clearFocusGlow();
      this.ui.hide();
      // 兜底：非模态提示 + 重开时长三选一（禁止白屏/卡住；禁止静默记 30 分钟）
      this.notifyUser();
      this.openDurationChoices({ force: true });
      return;
    }

    const entry = this.store.recordCompletion(minutes);
    this.onPracticeDay({ durationMinutes: minutes });
    if (entry) {
      this.onSessionRecorded({ durationMinutes: entry.durationMinutes });
    }
    this.clearFocusGlow();
    // 保持 _busy：入口须藏到桥接 Yes/No（endCheckInFlow）；否则会叠住 Yes/No
    this.ui.hideIdleEntry();

    if (this.stateManager.state === STATES.DORMANT) {
      this.stateManager.setState(STATES.IDLE);
    }

    this.ui.hide();
    // 轻量确认（类似微仪式 toast）；须在桥接前，abort 路径不得调用
    this.notifyRecorded();
    this.onCheckInComplete();
  }
}
