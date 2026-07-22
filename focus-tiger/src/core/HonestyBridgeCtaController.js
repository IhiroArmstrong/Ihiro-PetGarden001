/**
 * Honesty 补登仪式结束后的桥接邀请（独立于 Honesty 本身）。
 *
 * - 不自动开计时 / 不自动开 Ambient
 * - Yes → 调用方启动完整 Arrival Practice
 * - No / 忽略 → 回到 idle；不二次挽留
 * - **每次**补登完成后都可出现（不限当日一次）
 * - 补登结束后**立刻**出现（不再空等 thanks 3.2s）
 *
 * 定稿：docs/HONESTY_BRIDGE_CTA.md
 */

/**
 * 是否应在补登完成后安排桥接邀请。
 * @param {{ busy?: boolean }} flags
 */
export function shouldOfferHonestyBridge({ busy = false } = {}) {
  return busy !== true;
}

export class HonestyBridgeCtaController {
  /**
   * @param {object} deps
   * @param {import('./HonestyBridgeStore.js').HonestyBridgeStore} [deps.store] 可选；仅诊断/兼容，不再做当日限频
   * @param {{ show: () => void, hide: () => void }} deps.ui
   * @param {() => void} deps.onAccept  Yes → 完整 Arrival（由 main 接线）
   * @param {() => void} [deps.onDecline] No / 忽略
   * @param {() => void} [deps.onShown] 面板已展示（供 main 收起会挡 Yes/No 的 Idle 入口）
   * @param {() => void} [deps.onHidden] 面板关闭（Yes/No/cancel）；供 main `endCheckInFlow`
   * @param {(event: string) => void} [deps.trackEvent] 留存占位（shown / accepted）
   * @param {(ms: number, fn: () => void) => number} [deps.schedule]
   * @param {(id: number) => void} [deps.cancelSchedule]
   */
  constructor({
    store = null,
    ui,
    onAccept,
    onDecline = () => {},
    onShown = () => {},
    onHidden = () => {},
    trackEvent = () => {},
    schedule = (ms, fn) => window.setTimeout(fn, ms),
    cancelSchedule = (id) => window.clearTimeout(id)
  }) {
    this.store = store;
    this.ui = ui;
    this.onAccept = onAccept;
    this.onDecline = onDecline;
    this.onShown = onShown;
    this.onHidden = onHidden;
    this.trackEvent = trackEvent;
    this.schedule = schedule;
    this.cancelSchedule = cancelSchedule;
    /** @type {number | null} */
    this._pendingTimer = null;
    /** @type {number} */
    this._pendingGeneration = 0;
    this._visible = false;

    this.ui.handlers = {
      onYes: () => this._answer(true),
      onNo: () => this._answer(false)
    };
  }

  /**
   * Honesty 呼吸结束、已记账并离开 DORMANT 后调用。
   * 立刻展示桥接（与补登面板同位置接续，不空等）。
   */
  onHonestyCheckInComplete() {
    if (!shouldOfferHonestyBridge({})) return;

    this.cancelPending();
    this._reveal();
  }

  /** 取消尚未出现的邀请（例如用户已点 Sit / 开 Arrival）。 */
  cancelPending() {
    this._pendingGeneration += 1;
    if (this._pendingTimer != null) {
      this.cancelSchedule(this._pendingTimer);
      this._pendingTimer = null;
    }
  }

  hide() {
    this.cancelPending();
    const wasVisible = this._visible;
    this._visible = false;
    this.ui.hide();
    if (wasVisible) this.onHidden();
  }

  isVisible() {
    return this._visible;
  }

  _reveal() {
    this._visible = true;
    // 诊断用：记录「曾展示过」，但不再据此拦截同日再次出现
    this.store?.markShown?.();
    this.trackEvent('dormant_bridge_shown');
    this.ui.show();
    // 须在 isVisible=true 之后：收起 dock 上会叠住 Yes/No 的入口（如一分钟呼吸）
    this.onShown();
  }

  /** @param {boolean} accepted */
  _answer(accepted) {
    const wasVisible = this._visible;
    this._visible = false;
    this.ui.hide();
    if (wasVisible) this.onHidden();
    if (accepted) {
      this.trackEvent('dormant_bridge_accepted');
      this.onAccept();
      return;
    }
    this.trackEvent('dormant_bridge_declined');
    this.onDecline();
  }
}
