/**
 * Seasonal Theme · calendar config (Phase 2: Christmas instance + schema placeholders).
 * Engines must not branch on season id — only read this table.
 *
 * @see docs/task-briefs/task-seasonal-theme-engine-v1.md
 */

/**
 * @typedef {import('./dateRules.js').DateRule} DateRule
 * @typedef {{
 *   poses?: string[],
 *   background?: string,
 *   copyPoolId?: string
 * }} SeasonAssets
 * @typedef {{
 *   id: string,
 *   nameKey: string,
 *   dateRule: DateRule,
 *   windowDaysBefore: number,
 *   windowDaysAfter: number,
 *   regions?: string[],
 *   timezone: string,
 *   priority: number,
 *   assets: SeasonAssets,
 *   subscriberOnly: boolean,
 *   contentReady: boolean
 * }} SeasonConfig
 */

/** Western Easter ISO days (lookup-table · ≥10y from 2026). */
const EASTER_WESTERN_BY_YEAR = Object.freeze({
  2026: '2026-04-05',
  2027: '2027-03-28',
  2028: '2028-04-16',
  2029: '2029-04-01',
  2030: '2030-04-21',
  2031: '2031-04-13',
  2032: '2032-03-28',
  2033: '2033-04-17',
  2034: '2034-04-09',
  2035: '2035-03-25',
  2036: '2036-04-13'
});

/**
 * Official seasons. Global holidays use America/New_York (§5.2.1).
 * Phase 3: Christmas contentReady true + winter wash; other seasons still false.
 * @type {readonly SeasonConfig[]}
 */
export const SEASONAL_CALENDAR = Object.freeze([
  {
    id: 'christmas',
    nameKey: 'SEASON_CHRISTMAS',
    dateRule: { type: 'fixed', month: 12, day: 25 },
    windowDaysBefore: 7,
    windowDaysAfter: 1,
    timezone: 'America/New_York',
    priority: 100,
    assets: {
      poses: [],
      background: 'winter-quiet-wash',
      copyPoolId: 'christmas'
    },
    subscriberOnly: true,
    contentReady: true
  },
  {
    id: 'new-years-day',
    nameKey: 'SEASON_NEW_YEARS_DAY',
    dateRule: { type: 'fixed', month: 1, day: 1 },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'America/New_York',
    priority: 70,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'valentines-day',
    nameKey: 'SEASON_VALENTINES_DAY',
    dateRule: { type: 'fixed', month: 2, day: 14 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    timezone: 'America/New_York',
    priority: 70,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'easter-western',
    nameKey: 'SEASON_EASTER',
    dateRule: { type: 'lookup-table', datesByYear: EASTER_WESTERN_BY_YEAR },
    windowDaysBefore: 1,
    windowDaysAfter: 0,
    timezone: 'America/New_York',
    priority: 70,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'mothers-day-us',
    nameKey: 'SEASON_MOTHERS_DAY',
    dateRule: { type: 'nth-weekday', month: 5, weekday: 0, n: 2 },
    windowDaysBefore: 3,
    windowDaysAfter: 0,
    regions: ['US', 'CA'],
    timezone: 'America/New_York',
    priority: 80,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'fathers-day-us',
    nameKey: 'SEASON_FATHERS_DAY',
    dateRule: { type: 'nth-weekday', month: 6, weekday: 0, n: 3 },
    windowDaysBefore: 3,
    windowDaysAfter: 0,
    regions: ['US', 'CA', 'GB'],
    timezone: 'America/New_York',
    priority: 80,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'halloween',
    nameKey: 'SEASON_HALLOWEEN',
    dateRule: { type: 'fixed', month: 10, day: 31 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    timezone: 'America/New_York',
    priority: 70,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'thanksgiving-us',
    nameKey: 'SEASON_THANKSGIVING_US',
    dateRule: { type: 'nth-weekday', month: 11, weekday: 4, n: 4 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    regions: ['US'],
    timezone: 'America/New_York',
    priority: 90,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'thanksgiving-ca',
    nameKey: 'SEASON_THANKSGIVING_CA',
    dateRule: { type: 'nth-weekday', month: 10, weekday: 1, n: 2 },
    windowDaysBefore: 2,
    windowDaysAfter: 0,
    regions: ['CA'],
    timezone: 'America/Toronto',
    priority: 90,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'new-years-eve',
    nameKey: 'SEASON_NEW_YEARS_EVE',
    dateRule: { type: 'fixed', month: 12, day: 31 },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'America/New_York',
    priority: 70,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'chunfen',
    nameKey: 'SEASON_CHUNFEN',
    dateRule: { type: 'solar-term', termId: 'chunfen' },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'Asia/Shanghai',
    priority: 40,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'xiazhi',
    nameKey: 'SEASON_XIAZHI',
    dateRule: { type: 'solar-term', termId: 'xiazhi' },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'Asia/Shanghai',
    priority: 40,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'qiufen',
    nameKey: 'SEASON_QIUFEN',
    dateRule: { type: 'solar-term', termId: 'qiufen' },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'Asia/Shanghai',
    priority: 40,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  },
  {
    id: 'dongzhi',
    nameKey: 'SEASON_DONGZHI',
    dateRule: { type: 'solar-term', termId: 'dongzhi' },
    windowDaysBefore: 0,
    windowDaysAfter: 0,
    timezone: 'Asia/Shanghai',
    priority: 40,
    assets: {},
    subscriberOnly: true,
    contentReady: false
  }
]);

/**
 * @param {string} seasonId
 * @returns {SeasonConfig | null}
 */
export function getSeason(seasonId) {
  return SEASONAL_CALENDAR.find((s) => s.id === seasonId) ?? null;
}

/**
 * Max year across all lookup-table dateRule entries.
 * @returns {number}
 */
export function seasonalLookupTablesMaxYear() {
  let max = 0;
  for (const s of SEASONAL_CALENDAR) {
    if (s.dateRule?.type !== 'lookup-table') continue;
    for (const y of Object.keys(s.dateRule.datesByYear || {}).map(Number)) {
      if (y > max) max = y;
    }
  }
  return max;
}
