/**
 * YPE personalization profile KV (YPE_PERSONALIZATION_KV only).
 */

import {
	YPE_PROFILE_SCHEMA_VERSION,
	type PersonalizationStatePackV1,
	type YpeSignalsV1,
	sanitizeYpeSignalsV1,
	issuePersonalizationPackV1,
} from "./ypePersonalizationAlgorithm";

export type YpeProfileRecord = {
	schemaVersion: number;
	ypeProfileId: string;
	signals: YpeSignalsV1;
	pack: PersonalizationStatePackV1 | null;
	packVersion: number;
	updatedAt: string;
};

export function ypeProfileKvKey(ypeProfileId: string): string {
	return `ype:v1:${ypeProfileId.trim()}`;
}

export function parseYpeProfileRecord(raw: string): YpeProfileRecord | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return null;
		}
		const o = parsed as Record<string, unknown>;
		if (o.schemaVersion !== YPE_PROFILE_SCHEMA_VERSION) return null;
		const ypeProfileId =
			typeof o.ypeProfileId === "string" ? o.ypeProfileId.trim() : "";
		if (!ypeProfileId) return null;
		const signals = sanitizeYpeSignalsV1(o.signals);
		if (!signals) return null;
		const pack =
			o.pack && typeof o.pack === "object" && !Array.isArray(o.pack)
				? (o.pack as PersonalizationStatePackV1)
				: null;
		return {
			schemaVersion: YPE_PROFILE_SCHEMA_VERSION,
			ypeProfileId,
			signals,
			pack,
			packVersion:
				typeof o.packVersion === "number" && Number.isFinite(o.packVersion)
					? Math.floor(o.packVersion)
					: pack?.packVersion ?? 0,
			updatedAt:
				typeof o.updatedAt === "string" && o.updatedAt
					? o.updatedAt
					: new Date().toISOString(),
		};
	} catch {
		return null;
	}
}

export async function getYpeProfileRecord(
	kv: KVNamespace,
	ypeProfileId: string,
): Promise<YpeProfileRecord | null> {
	const raw = await kv.get(ypeProfileKvKey(ypeProfileId));
	if (!raw) return null;
	return parseYpeProfileRecord(raw);
}

export async function upsertYpeProfileSignals(
	kv: KVNamespace,
	opts: {
		ypeProfileId: string;
		signals: YpeSignalsV1;
		windowCompletionCount: number;
		now?: Date;
	},
): Promise<{ record: YpeProfileRecord; pack: PersonalizationStatePackV1 | null }> {
	const now = opts.now ?? new Date();
	const prev = await getYpeProfileRecord(kv, opts.ypeProfileId);
	const previousPackVersion = prev?.packVersion ?? 0;
	const pack = issuePersonalizationPackV1({
		signals: opts.signals,
		windowCompletionCount: opts.windowCompletionCount,
		previousPackVersion,
		now,
	});
	const record: YpeProfileRecord = {
		schemaVersion: YPE_PROFILE_SCHEMA_VERSION,
		ypeProfileId: opts.ypeProfileId,
		signals: opts.signals,
		pack,
		packVersion: pack?.packVersion ?? previousPackVersion,
		updatedAt: now.toISOString(),
	};
	await kv.put(ypeProfileKvKey(opts.ypeProfileId), JSON.stringify(record));
	return { record, pack };
}

export async function deleteYpeProfileRecord(
	kv: KVNamespace,
	ypeProfileId: string,
): Promise<boolean> {
	const key = ypeProfileKvKey(ypeProfileId);
	const existed = await kv.get(key);
	if (!existed) return false;
	await kv.delete(key);
	return true;
}
