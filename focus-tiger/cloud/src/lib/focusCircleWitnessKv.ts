/** Focus Circle Gentle Witness traces per circle in TIP_KV. */

import { isFocusCircleMemberId } from "./focusCircleKv.ts";

export const FOCUS_CIRCLE_WITNESS_SCHEMA_VERSION = 1;
export const FOCUS_CIRCLE_WITNESS_TTL_MS = 24 * 60 * 60 * 1000;
export const FOCUS_CIRCLE_WITNESS_MAX_TRACES = 8;

export type WitnessTraceRespond = {
	memberId: string;
	phraseKey: string;
	at: number;
};

export type WitnessTrace = {
	traceId: string;
	memberId: string;
	phraseKey: string;
	createdAt: number;
	respond?: WitnessTraceRespond;
};

export type FocusCircleWitnessRecord = {
	schemaVersion: number;
	traces: WitnessTrace[];
};

export function circleWitnessKvKey(circleId: string): string {
	return `circle:v1:witness:${circleId.trim()}`;
}

export function pruneWitnessTraces(
	traces: WitnessTrace[],
	nowMs: number,
	ttlMs = FOCUS_CIRCLE_WITNESS_TTL_MS,
): WitnessTrace[] {
	const cutoff = nowMs - ttlMs;
	return traces.filter((row) => {
		if (!row || typeof row !== "object") return false;
		if (!isFocusCircleMemberId(row.memberId)) return false;
		if (typeof row.traceId !== "string" || !row.traceId) return false;
		if (typeof row.phraseKey !== "string" || !row.phraseKey) return false;
		const createdAt = Number(row.createdAt);
		return Number.isFinite(createdAt) && createdAt >= cutoff;
	});
}

function trimWitnessTraces(traces: WitnessTrace[]): WitnessTrace[] {
	if (traces.length <= FOCUS_CIRCLE_WITNESS_MAX_TRACES) return traces;
	const sorted = [...traces].sort((a, b) => a.createdAt - b.createdAt);
	return sorted.slice(sorted.length - FOCUS_CIRCLE_WITNESS_MAX_TRACES);
}

export function applyWitnessLeave(
	traces: WitnessTrace[],
	memberId: string,
	phraseKey: string,
	traceId: string,
	nowMs: number,
): WitnessTrace[] {
	const pruned = pruneWitnessTraces(traces, nowMs);
	const next: WitnessTrace = {
		traceId,
		memberId,
		phraseKey,
		createdAt: nowMs,
	};
	return trimWitnessTraces([...pruned, next]);
}

export function applyWitnessRespond(
	traces: WitnessTrace[],
	traceId: string,
	memberId: string,
	phraseKey: string,
	nowMs: number,
): { traces: WitnessTrace[]; outcome: "ok" | "not_found" | "already_responded" } {
	const pruned = pruneWitnessTraces(traces, nowMs);
	const idx = pruned.findIndex((row) => row.traceId === traceId);
	if (idx < 0) {
		return { traces: pruned, outcome: "not_found" };
	}
	const row = pruned[idx];
	if (row.respond) {
		return { traces: pruned, outcome: "already_responded" };
	}
	const updated: WitnessTrace = {
		...row,
		respond: { memberId, phraseKey, at: nowMs },
	};
	const out = [...pruned];
	out[idx] = updated;
	return { traces: out, outcome: "ok" };
}

export type WitnessPeekTrace = {
	traceId: string;
	phraseKey: string;
	hasResponded: boolean;
	respondPhraseKey?: string;
};

export function buildWitnessPeekTraces(
	traces: WitnessTrace[],
	nowMs: number,
	excludeMemberId?: string,
): WitnessPeekTrace[] {
	const pruned = pruneWitnessTraces(traces, nowMs);
	const out: WitnessPeekTrace[] = [];
	for (const row of pruned) {
		if (excludeMemberId && row.memberId === excludeMemberId) continue;
		out.push({
			traceId: row.traceId,
			phraseKey: row.phraseKey,
			hasResponded: Boolean(row.respond),
			...(row.respond ? { respondPhraseKey: row.respond.phraseKey } : {}),
		});
	}
	return out;
}

export function parseFocusCircleWitnessRecord(
	raw: string | null,
): FocusCircleWitnessRecord {
	if (!raw) {
		return {
			schemaVersion: FOCUS_CIRCLE_WITNESS_SCHEMA_VERSION,
			traces: [],
		};
	}
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return {
				schemaVersion: FOCUS_CIRCLE_WITNESS_SCHEMA_VERSION,
				traces: [],
			};
		}
		const o = parsed as Record<string, unknown>;
		const traces = Array.isArray(o.traces)
			? (o.traces as WitnessTrace[])
			: [];
		return {
			schemaVersion: FOCUS_CIRCLE_WITNESS_SCHEMA_VERSION,
			traces,
		};
	} catch {
		return {
			schemaVersion: FOCUS_CIRCLE_WITNESS_SCHEMA_VERSION,
			traces: [],
		};
	}
}
