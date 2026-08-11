/**
 * Seasonal Theme Engine · Phase 3 barrel (Christmas shippable; gates on).
 */

export {
  SEASONAL_CALENDAR,
  getSeason,
  seasonalLookupTablesMaxYear
} from './seasonalCalendar.js';
export {
  SEASONAL_THEME_USER_ENABLED,
  isSeasonKillSwitched,
  isSeasonalThemeGateOpen,
  seasonalDevHarnessId,
  __setSeasonKillSwitchForTests
} from './seasonalThemeVisibilityGate.js';
export {
  resolveActiveSeasonalTheme,
  isSeasonInWindow,
  seasonMatchesRegion,
  pickHighestPrioritySeason,
  computeSeasonWindow
} from './resolveActiveSeasonalTheme.js';
export {
  resolveAnchorIsoForYear,
  nthWeekdayOfMonth,
  calendarPartsInTimeZone,
  addDaysIso
} from './dateRules.js';
export {
  lookupSolarTermDate,
  SOLAR_TERM_DATES_BY_YEAR,
  solarTermLookupMaxYear
} from './solarTermLookup.js';
export {
  assessLookupHorizon,
  LOOKUP_HORIZON_YEARS,
  LOOKUP_WARN_REMAINING_YEARS
} from './lookupHorizon.js';
export {
  CHRISTMAS_CORPUS,
  isChristmasCorpusOk,
  pickChristmasLineForDay,
  seasonalLineText
} from './christmasCorpus.js';
export {
  parseMockDateIso,
  dateFromMockIso,
  resolveSeasonalNow,
  sniffRegionFromLanguage
} from './seasonalClock.js';
export { bootSeasonalThemeChrome } from './bootSeasonalThemeChrome.js';
export {
  SEASONAL_WHISPER_STORAGE_KEY,
  shouldShowSeasonalWhisper,
  markSeasonalWhisperShown
} from './seasonalWhisperGate.js';
