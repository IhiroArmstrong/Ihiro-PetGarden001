/**
 * Practice study weekly rows (CO_PRACTICE_RESEARCH_KV only — not T54 / YPE / backup).
 */

import { isCoPracticeResearchStudyId } from "./coPracticeResearchStudyId.ts";

export const CO_PRACTICE_RESEARCH_KV_PREFIX = "cpr:v1";

const ISO_WEEK_RE = /^[0-9]{4}-W[0-9]{2}$/;

export function coPracticeResearchRowKey(studyId: string, week: string): string {
	return `${CO_PRACTICE_RESEARCH_KV_PREFIX}:${studyId}:${week}`;
}

export function coPracticeResearchStudyPrefix(studyId: string): string {
	return `${CO_PRACTICE_RESEARCH_KV_PREFIX}:${studyId}:`;
}

export function isCoPracticeResearchWeekKey(week: unknown): week is string {
	return typeof week === "string" && ISO_WEEK_RE.test(week.trim());
}

export function parseCoPracticeResearchRowKey(
	key: string,
): { studyId: string; week: string } | null {
	if (!key.startsWith(`${CO_PRACTICE_RESEARCH_KV_PREFIX}:`)) return null;
	const rest = key.slice(CO_PRACTICE_RESEARCH_KV_PREFIX.length + 1);
	const colon = rest.indexOf(":");
	if (colon <= 0) return null;
	const studyId = rest.slice(0, colon);
	const week = rest.slice(colon + 1);
	if (!isCoPracticeResearchStudyId(studyId)) return null;
	if (!isCoPracticeResearchWeekKey(week)) return null;
	return { studyId, week };
}
