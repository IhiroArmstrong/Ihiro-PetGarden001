/**
 * Honesty 补登仪式结束后的桥接邀请（独立于 Honesty 本身）。
 *
 * - 不自动开计时 / 不自动开 Ambient
 * - Yes → 调用方启动完整 Arrival Practice
 * - No / 取消 → 回到 idle；当天不再弹出
 *
 * 定稿：docs/HONESTY_BRIDGE_CTA.md
 */

/** 与 HonestyCheckInUI.showThanks 自动收起时长对齐。 */
export const HONESTY_THANKS_MS = 3200;

/**
 * 是否应在补登完成后安排桥接邀请。
 * @param {{ hasShownToday: boolean, busy?: boolean }} flags
 */
export function shouldOfferHonestyBridge({ hasShownToday, busy = false }) {
  if (busy) return false;
  return hasShownToday !== true;
}

export class HonestyBridgeCtaController {
  /**
   * @param {object} deps
   * @param {import('./HonestyBridgeStore.js').HonestyBridgeStore} deps.store
   * @param {{ show: () => void, hide: () => void }} deps.ui
   * @param {() => void} deps.onAccept  Yes → 完整 Arrival（由 main 接线）
   * @param {() => void} [deps.onDecline] No / 忽略
   * @param {number} [deps.thanksMs]
   * @param {(ms: number, fn: () => void) => number} [deps.schedule]
   * @param {(id: number) => void} [deps.cancelSchedule]
   */
  constructor({
    store,
    ui,
    onAccept,
    onDecline = () => {},
    thanksMs = HONESTY_THANKS_MS,
    schedule = (ms, fn) => window.setTimeout(fn, ms),
    cancelSchedule = (id) => window.clearTimeout(id)
  }) {
    this.store = store;
    this.ui = ui;
    this.onAccept = onAccept;
    this.onDecline = onDecline;
    this.thanksMs = thanksMs;
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
   * 等 thanks 文案条结束后再出现（同系非模态延续）。
   */
  onHonestyCheckInComplete() {
    if (
      !shouldOfferHonestyBridge({
        hasShownToday: this.store.hasShownToday()
      })
    ) {
      return;
    }

    this.cancelPending();
    const generation = ++this._pendingGeneration;
    this._pendingTimer = this.schedule(this.thanksMs, () => {
      this._pendingTimer = null;
      if (generation !== this._pendingGeneration) return;
      this._reveal();
    });
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
    this._visible = false;
    this.ui.hide();
  }

  isVisible() {
    return this._visible;
  }

  _reveal() {
    if (this.store.hasShownToday()) return;
    this.store.markShown();
    this._visible = true;
    this.ui.show();
  }

  /** @param {boolean} accepted */
  _answer(accepted) {
    this._visible = false;
    this.ui.hide();
    if (accepted) {
      this.onAccept();
      return;
    }
    this.onDecline();
  }
}
