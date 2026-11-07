/**
 * Keep in sync with src/core/coPracticeResearchEnums.js
 */

export const CO_PRACTICE_RESEARCH_SCHEMA_VERSION = 1;

export const CO_PRACTICE_RESEARCH_CHIP_IDS = [
	"forget_this",
	"dont_save_this",
	"practice_duration",
	"practice_compare",
] as const;

export const CO_PRACTICE_RESEARCH_ROUTE_CLASSES = [
	"help_center_redirect",
	"query_practice_duration",
	"language_not_yet_open",
] as const;

export const CO_PRACTICE_RESEARCH_LOCALES = ["en", "ja", "zh"] as const;
export const CO_PRACTICE_RESEARCH_PLATFORMS = ["web", "mac", "win"] as const;

export const CO_PRACTICE_RESEARCH_PRACTICE_KINDS = [
	"sit",
	"breath",
	"honesty",
	"micro",
] as const;

export const CO_PRACTICE_RESEARCH_TIME_SLOTS = [
	"morning",
	"afternoon",
	"evening",
	"lateNight",
] as const;

export const CO_PRACTICE_RESEARCH_COUNT_CAPS = {
	practiceBlock: 200,
	companion: 500,
	sitWithYin: 200,
	minutesWeek: 10080,
	tenureWeeks: 260,
	retentionDays: 365,
	comebacks: 7,
} as const;

const CHIP_SET = new Set<string>(CO_PRACTICE_RESEARCH_CHIP_IDS);
const ROUTE_SET = new Set<string>(CO_PRACTICE_RESEARCH_ROUTE_CLASSES);
const LOCALE_SET = new Set<string>(CO_PRACTICE_RESEARCH_LOCALES);
const PLATFORM_SET = new Set<string>(CO_PRACTICE_RESEARCH_PLATFORMS);

export function isAllowedChipId(key: string): boolean {
	return CHIP_SET.has(key);
}

export function isAllowedRouteClass(key: string): boolean {
	return ROUTE_SET.has(key);
}

export function isAllowedLocale(v: unknown): v is (typeof CO_PRACTICE_RESEARCH_LOCALES)[number] {
	return typeof v === "string" && LOCALE_SET.has(v);
}

export function isAllowedPlatform(
	v: unknown,
): v is (typeof CO_PRACTICE_RESEARCH_PLATFORMS)[number] {
	return typeof v === "string" && PLATFORM_SET.has(v);
}
