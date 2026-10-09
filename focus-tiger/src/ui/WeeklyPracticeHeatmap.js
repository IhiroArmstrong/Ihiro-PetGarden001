/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Idle/Dormant 7-day practice heatmap (presence, not a scoreboard).
 * Rolling last 7 local days (oldest → newest); rightmost = today.
 * Lit when totalMinutes === null (legacy unknown) or totalMinutes > 0.
 * Dim quiet days — soft panel wash, never warning red / exclamation copy.
 * Each cell shows a weekday abbrev; today gets a soft outline ring.
 */

import { growthJourneyHomeLineModel } from '../core/growthJourneyHomeLine.js';
import { t } from '../locales/i18n.js';
import { subscribePracticeDataImported } from '../core/practiceBackup/practiceBackupLocalIo.js';

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
 * Local weekday index (0 = Sunday) from YYYY-MM-DD, or null if unparseable.
 * @param {string} dateKey
 * @returns {number | null}
 */
export function weekdayIndexFromDateKey(dateKey) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey ?? ''));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) {
    return null;
  }
  const dt = new Date(y, mo - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== mo - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt.getDay();
}

/**
 * @param {string} dateKey
 * @param {(key: string) => string} [translate]
 * @returns {string}
 */
export function heatmapDowLabel(dateKey, translate = t) {
  const idx = weekdayIndexFromDateKey(dateKey);
  if (idx == null) return '';
  return translate(`HEATMAP_DOW_${idx}`);
}

/**
 * @param {{ date: string, totalMinutes: number | null }[]} days
 * @param {string} [todayDate] YYYY-MM-DD; defaults to last row date when omitted
 * @returns {{ date: string, lit: boolean, today: boolean, dow: string }[]}
 */
export function buildWeeklyHeatmapCells(days, todayDate) {
  if (!Array.isArray(days)) return [];
  const todayKey =
    todayDate != null && String(todayDate) !== ''
      ? String(todayDate)
      : String(days[days.length - 1]?.date ?? '');
  return days.map((d) => {
    const date = String(d?.date ?? '');
    return {
      date,
      lit: isPracticeDayLit(d?.totalMinutes),
      today: Boolean(todayKey) && date === todayKey,
      dow: heatmapDowLabel(date)
    };
  });
}

const STYLE_ID = 'weekly-practice-heatmap-styles-v7';

export class WeeklyPracticeHeatmap {
  /**
   * @param {HTMLElement} container
   * @param {{ onOpenJourney?: () => void }} [handlers]
   */
  constructor(container, handlers = {}) {
    this.container = container;
    this._onOpenJourney = handlers.onOpenJourney ?? null;
    /** @type {HTMLElement | null} */
    this.cluster = null;
    /** @type {HTMLElement | null} */
    this.root = null;
    /** @type {HTMLElement[]} */
    this.dayEls = [];
    /** @type {HTMLElement[]} */
    this.cellEls = [];
    /** @type {HTMLElement[]} */
    this.dowEls = [];
    /** @type {HTMLElement | null} */
    this.journeyRow = null;
    /** @type {HTMLElement | null} */
    this.journeyText = null;
    /** @type {HTMLElement | null} */
    this.journeyDot = null;
    /** @type {HTMLElement | null} */
    this.furnitureRow = null;
    this._visible = false;
    this._journeyMinutes = 0;
    /** @type {unknown} */
    this._journeyFloor = null;
    /** @type {(() => { date: string, totalMinutes: number | null }[]) | null} */
    this._getImportDays = null;
    this._unsubPracticeImport = null;
    this._injectStyles();
    this._build();
  }

  /**
   * Re-read practice days after local import. Bind after PracticeDaysStore exists.
   * @param {() => { date: string, totalMinutes: number | null }[]} getDays
   */
  bindPracticeImportRefresh(getDays) {
    this._unsubPracticeImport?.();
    this._getImportDays = getDays;
    this._unsubPracticeImport = subscribePracticeDataImported(() => {
      if (!this._getImportDays || !this.root) return;
      this.render({
        visible: this._visible,
        days: this._getImportDays()
      });
    });
  }

  destroy() {
    this._unsubPracticeImport?.();
    this._unsubPracticeImport = null;
  }

  /** 供提醒设置等旁挂控件加入热力图那一排，不压到上面的旅程行。 */
  getClusterEl() {
    return this.furnitureRow;
  }

  /** @returns {boolean} */
  isVisible() {
    return this._visible === true;
  }

  /**
   * @param {object} opts
   * @param {boolean} opts.visible  only Idle
   * @param {{ date: string, totalMinutes: number | null }[]} opts.days
   * @param {string} [opts.todayDate]
   * @param {unknown} [opts.eligibleMinutes]
   * @param {unknown} [opts.stageFloor]
   */
  render(opts) {
    const { visible, days, todayDate } = opts;
    if (!this.root || !this.journeyRow || !this.journeyText || !this.journeyDot) {
      return;
    }
    const show = Boolean(visible);
    if (Object.prototype.hasOwnProperty.call(opts, 'eligibleMinutes')) {
      this._journeyMinutes = opts.eligibleMinutes;
    }
    if (Object.prototype.hasOwnProperty.call(opts, 'stageFloor')) {
      this._journeyFloor = opts.stageFloor;
    }
    if (show !== this._visible) {
      this._visible = show;
      this.root.hidden = !show;
      this.root.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
    this._paintJourney(show);
    if (!show) return;

    this.root.setAttribute('aria-label', t('HEATMAP_ARIA_WEEK'));

    const cells = buildWeeklyHeatmapCells(days, todayDate);
    for (let i = 0; i < this.cellEls.length; i += 1) {
      const el = this.cellEls[i];
      const dayEl = this.dayEls[i];
      const dowEl = this.dowEls[i];
      const cell = cells[i];
      if (!cell) {
        el.dataset.lit = '0';
        el.dataset.date = '';
        el.dataset.today = '0';
        if (dayEl) dayEl.dataset.today = '0';
        if (dowEl) dowEl.textContent = '';
        continue;
      }
      el.dataset.date = cell.date;
      el.dataset.lit = cell.lit ? '1' : '0';
      el.dataset.today = cell.today ? '1' : '0';
      if (dayEl) dayEl.dataset.today = cell.today ? '1' : '0';
      if (dowEl) {
        dowEl.textContent = cell.dow;
        dowEl.classList.toggle(
          'weekly-practice-heatmap__dow--today',
          cell.today
        );
      }
    }
  }

  dispose() {
    this.cluster?.remove();
    this.cluster = null;
    this.root = null;
    this.dayEls = [];
    this.cellEls = [];
    this.dowEls = [];
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
    this.root.setAttribute('role', 'img');
    this.root.setAttribute('aria-label', t('HEATMAP_ARIA_WEEK'));

    for (let i = 0; i < WEEKLY_PRACTICE_HEATMAP_DAYS; i += 1) {
      const day = document.createElement('div');
      day.className = 'weekly-practice-heatmap__day';
      day.dataset.today = '0';

      const cell = document.createElement('span');
      cell.className = 'weekly-practice-heatmap__cell';
      cell.dataset.lit = '0';
      cell.dataset.date = '';
      cell.dataset.today = '0';

      const dow = document.createElement('span');
      dow.className = 'weekly-practice-heatmap__dow';
      dow.setAttribute('aria-hidden', 'true');

      day.appendChild(cell);
      day.appendChild(dow);
      this.root.appendChild(day);
      this.dayEls.push(day);
      this.cellEls.push(cell);
      this.dowEls.push(dow);
    }

    this.journeyRow = document.createElement('button');
    this.journeyRow.type = 'button';
    this.journeyRow.className = 'growth-journey-home-line';
    this.journeyRow.hidden = true;
    this.journeyRow.dataset.testid = 'growth-journey-home-line';
    this.journeyRow.setAttribute('aria-hidden', 'true');
    this.journeyRow.addEventListener('click', () => {
      if (this.journeyRow?.hidden) return;
      this._onOpenJourney?.();
    });

    this.journeyText = document.createElement('span');
    this.journeyText.className = 'growth-journey-home-line__text';

    const track = document.createElement('span');
    track.className = 'growth-journey-home-line__track';
    track.setAttribute('aria-hidden', 'true');

    this.journeyDot = document.createElement('span');
    this.journeyDot.className = 'growth-journey-home-line__dot';
    track.appendChild(this.journeyDot);
    this.journeyRow.append(this.journeyText, track);

    this.furnitureRow = document.createElement('div');
    this.furnitureRow.className = 'weekly-practice-heatmap-cluster__row';
    this.furnitureRow.appendChild(this.root);

    this.cluster.append(this.journeyRow, this.furnitureRow);
    this.container.appendChild(this.cluster);
  }

  /**
   * @param {boolean} show
   */
  _paintJourney(show) {
    if (!this.journeyRow || !this.journeyText || !this.journeyDot) return;
    this.journeyRow.hidden = !show;
    this.journeyRow.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (!show) return;
    const line = growthJourneyHomeLineModel(
      this._journeyMinutes,
      this._journeyFloor,
      t
    );
    this.journeyText.textContent = line.text;
    this.journeyDot.style.left = `${line.position * 100}%`;
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
         * Idle 左下微组件：热力 + 时钟 + Idle PiP（Chromium）+ ? 同簇。
         * 须在 home 三球带之上（球高 ~80 + dock 底边 ~36 + 缝），
         * 否则球/蒲团会盖住簇与 weekly-heatmap mint hint。
         */
        bottom: calc(36px + 88px + 20px);
        z-index: 12;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: max-content;
        max-width: calc(100vw - 28px);
        gap: 6px;
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
          gap: 4px;
        }
        .weekly-practice-heatmap-cluster__row {
          gap: 8px;
        }
      }
      .weekly-practice-heatmap-cluster__row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .growth-journey-home-line {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        width: 0;
        min-width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 0;
        background: none;
        font: inherit;
        color: inherit;
        text-align: left;
        cursor: pointer;
        pointer-events: auto;
      }
      .growth-journey-home-line[hidden] {
        display: none !important;
      }
      .growth-journey-home-line__text {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 12px;
        line-height: 1.35;
        color: rgba(44, 31, 20, 0.72);
      }
      .growth-journey-home-line__track {
        position: relative;
        flex: 0 0 44px;
        height: 1px;
        background: rgba(44, 31, 20, 0.28);
      }
      .growth-journey-home-line__dot {
        position: absolute;
        top: 50%;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(44, 31, 20, 0.72);
        transform: translate(-50%, -50%);
      }
      .weekly-practice-heatmap {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
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
      .weekly-practice-heatmap__day {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        min-width: 14px;
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
      /* Today: soft ring — readable whether lit or dim; not a scoreboard badge */
      .weekly-practice-heatmap__cell[data-today="1"] {
        box-shadow: 0 0 0 1.5px rgba(181, 98, 58, 0.62);
        outline: none;
      }
      .weekly-practice-heatmap__dow {
        font-size: 8px;
        line-height: 1;
        letter-spacing: 0.02em;
        color: rgba(74, 58, 40, 0.42);
        font-weight: 500;
        user-select: none;
      }
      .weekly-practice-heatmap__dow--today {
        color: rgba(74, 58, 40, 0.78);
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }
}
