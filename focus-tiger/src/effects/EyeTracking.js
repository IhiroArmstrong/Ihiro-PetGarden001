/**
 * EyeTracking —— **已废弃**（2026-07-19）。
 *
 * 原方案：独立瞳孔图层（含 `pupil-left.png` / `pupil-right.png`）阻尼跟随鼠标。
 * 用户实测确认瞳孔叠图错位（楔形/月牙状色块），已决定放弃、不再返工。
 * 权威结论见 `docs/CORE_LOOP.md`「已废弃：EyeTracking 实时瞳孔跟随鼠标」。
 *
 * 本文件保留空壳 API，避免旧调用崩溃；不创建 DOM、不绑定指针、不绘制任何瞳孔。
 * Idle 离散张望（gaze-p1~p4）走 `IdleOrchestrator` PNG 序列，与本模块无关。
 */

/** @deprecated 配置已无运行时效果；保留键名仅防旧引用。 */
export const EYE_TRACKING_CONFIG = Object.freeze({
  abandoned: true,
  pupilLeftUrl: '',
  pupilRightUrl: '',
  pupilImageUrl: ''
});

/**
 * @param {object} [_deps]
 */
export class EyeTracking {
  constructor(_deps = {}) {
    this._enabled = false;
  }

  /** @returns {boolean} */
  isEnabled() {
    return false;
  }

  /** @param {boolean} [_enabled] */
  setEnabled(_enabled) {
    this._enabled = false;
  }

  /** @param {unknown} [_player] */
  setSpritePlayer(_player) {}

  bind() {}

  unbind() {}

  /** @param {number} [_delta] */
  update(_delta) {}
}
