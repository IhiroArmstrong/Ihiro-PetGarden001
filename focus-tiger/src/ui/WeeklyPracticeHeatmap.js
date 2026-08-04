/**
 * Idle-only 7-day practice heatmap (presence, not a scoreboard).
 * Lit when totalMinutes === null (legacy unknown) or totalMinutes > 0.
 * Dim quiet days — soft panel wash, never warning red / exclamation copy.
 */

export const WEEKLY_PRACTICE_HEATMAP_DAYS = 7;

/**
 * @param {number | null | undefined} totalMinutes
 * @returns {boolean}
 */
export function isPracticeDayLit(totalMinutes) {
  if (totalMinutes === null) return true;
  const n = Number(totalMinutes);
  return Number.isFinite(n) && n > 0;
}

/**
 * @param {{ date: string, totalMinutes: number | null }[]} days
 * @returns {{ date: string, lit: boolean }[]}
 */
export function buildWeeklyHeatmapCells(days) {
  if (!Array.isArray(days)) return [];
  return days.map((d) => ({
    date: String(d?.date ?? ''),
    lit: isPracticeDayLit(d?.totalMinutes)
  }));
}

const STYLE_ID = 'weekly-practice-heatmap-styles-v4';

export class WeeklyPracticeHeatmap {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    /** @type {HTMLElement | null} */
    this.cluster = null;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {HTMLElement[]} */
    this.cellEls = [];
    this._visible = false;
    this._injectStyles();
    this._build();
  }

  /** 供提醒设置等旁挂控件加入同一左下角簇。 */
  getClusterEl() {
    return this.cluster;
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible === true;
  }

  /**
   * @param {object} opts
   * @param {boolean} opts.visible  only Idle
   * @param {{ date: string, totalMinutes: number | null }[]} opts.days
   */
  render({ visible, days }) {
    if (!this.root) return;
    const show = Boolean(visible);
    if (show !== this._visible) {
      this._visible = show;
      this.root.hidden = !show;
      this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
    if (!show) return;

    const cells = buildWeeklyHeatmapCells(days);
    for (let i = 0; i < this.cellEls.length; i += 1) {
      const el = this.cellEls[i];
      const cell = cells[i];
      if (!cell) {
        el.dataset.lit = '0';
        el.dataset.date = '';
        continue;
      }
      el.dataset.date = cell.date;
      el.dataset.lit = cell.lit ? '1' : '0';
    }
  }

  dispose() {
    this.cluster?.remove();
    this.cluster = null;
    this.root = null;
    this.cellEls = [];
  }

  _build() {
    this.cluster = document.createElement('div');
    this.cluster.id = 'weekly-practice-heatmap-cluster';
    this.cluster.className = 'weekly-practice-heatmap-cluster';

    this.root = document.createElement('div');
    this.root.id = 'weekly-practice-heatmap';
    this.root.className = 'weekly-practice-heatmap';
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
    this.root.setAttribute('role', 'presentation');

    for (let i = 0; i < WEEKLY_PRACTICE_HEATMAP_DAYS; i += 1) {
      const cell = document.createElement('span');
      cell.className = 'weekly-practice-heatmap__cell';
      cell.dataset.lit = '0';
      cell.dataset.date = '';
      this.root.appendChild(cell);
      this.cellEls.push(cell);
    }

    this.cluster.appendChild(this.root);
    this.container.appendChild(this.cluster);
  }

  _injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .weekly-practice-heatmap-cluster {
        position: absolute;
        left: 16px;
        /*
         * Idle 左下微组件：热力 + 时钟 + ? 同簇。
         * 须在 home 三球带之上（球高 ~80 + dock 底边 ~36 + 缝），
         * 否则球/蒲团会盖住簇与 weekly-heatmap mint hint。
         */
        bottom: calc(36px + 88px + 20px);
        z-index: 12;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 8px 10px 8px 12px;
        border-radius: 18px;
        background: rgba(255, 252, 245, 0.42);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(139, 115, 85, 0.1);
        box-shadow: 0 4px 18px rgba(44, 31, 20, 0.05);
        pointer-events: none;
        overflow: visible;
      }
      /*
       * 窄屏 P1（≤479 / 375）：居中 dock 会盖住原左下簇（z16 > z12）。
       * 改挂到左上 HUD 下方，避开四钮 dock / ActionBar；桌面（≥480）仍用原 bottom。
       */
      @media (max-width: 479px) {
        .weekly-practice-heatmap-cluster {
          top: calc(12px + 72px + 10px);
          bottom: auto;
          left: 12px;
          padding: 6px 8px;
          gap: 8px;
        }
      }
      .weekly-practice-heatmap {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
        padding: 0;
        border-radius: 0;
        background: transparent;
        border: none;
        box-shadow: none;
        pointer-events: none;
        overflow: visible;
      }
      .weekly-practice-heatmap[hidden] {
        display: none !important;
      }
      .weekly-practice-heatmap__cell {
        width: 12px;
        height: 12px;
        border-radius: 4px;
        box-sizing: border-box;
        /* Quiet day: soft wash on chrome — not a “missed” mark */
        background: var(--color-ink-faint, rgba(46, 43, 40, 0.1));
        border: 1px solid transparent;
      }
      .weekly-practice-heatmap__cell[data-lit="1"] {
        /* Soft presence — cushion accent token, never highlight/red */
        background: var(--color-accent, #b5623a);
        border-color: transparent;
        opacity: 0.78;
      }
    `;
    document.head.appendChild(style);
  }
}
