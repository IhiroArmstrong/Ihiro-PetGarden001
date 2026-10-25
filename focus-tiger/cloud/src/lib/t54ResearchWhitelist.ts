/**
 * Keep in sync with src/core/t54ResearchReceive.js
 */

export const T54_RESEARCH_RECEIVE_FIELDS = [
	"studyId",
	"arm",
	"localResearchCode",
	"enrolledAt",
	"firstEligibleSilence",
	"observationStatus",
	"returnedWithin14d",
	"daysUntilReturn",
	"satWithin6h",
	"exited",
] as const;

const FIELD_SET = new Set<string>(T54_RESEARCH_RECEIVE_FIELDS);

export function pickT54ResearchReceiveFields(body: unknown): {
	accepted: Record<string, unknown>;
	dropped: string[];
	ok: boolean;
	reason?: string;
} {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return { accepted: {}, dropped: [], ok: false, reason: "invalid_body" };
	}
	const accepted: Record<string, unknown> = {};
	const dropped: string[] = [];
	for (const key of Object.keys(body as Record<string, unknown>)) {
		if (FIELD_SET.has(key)) {
			accepted[key] = (body as Record<string, unknown>)[key];
		} else {
			dropped.push(key);
		}
	}
	return { accepted, dropped, ok: true };
}
