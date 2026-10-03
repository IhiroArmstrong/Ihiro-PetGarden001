/**
 * Yin's Art Collection ownership.
 * Key: art-collection:{normalizedEmail}
 * Stored in SANCTUARY_KV. Separate prefix from sanctuary and companion add-on.
 */

import { findArtCollectionWork } from "./artCollectionCatalog.ts";

export type ArtCollectionPiece = {
	ownedAt: string;
	receiptId: string;
};

export type ArtCollectionRecord = {
	items: Record<string, ArtCollectionPiece>;
};

export function normalizeArtEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function artCollectionKvKey(email: string): string {
	return `art-collection:${normalizeArtEmail(email)}`;
}

export function emptyArtCollectionRecord(): ArtCollectionRecord {
	return { items: {} };
}

export function parseArtCollectionRecord(raw: string | null): ArtCollectionRecord {
	if (!raw) return emptyArtCollectionRecord();
	try {
		const parsed = JSON.parse(raw) as { items?: unknown };
		const items: Record<string, ArtCollectionPiece> = {};
		if (parsed?.items && typeof parsed.items === "object") {
			for (const [id, value] of Object.entries(parsed.items)) {
				if (!findArtCollectionWork(id)) continue;
				if (!value || typeof value !== "object") continue;
				const ownedAt =
					typeof (value as { ownedAt?: unknown }).ownedAt === "string"
						? (value as { ownedAt: string }).ownedAt
						: "";
				const receiptId =
					typeof (value as { receiptId?: unknown }).receiptId === "string"
						? (value as { receiptId: string }).receiptId
						: "";
				if (!ownedAt || !receiptId) continue;
				items[id] = { ownedAt, receiptId };
			}
		}
		return { items };
	} catch {
		return emptyArtCollectionRecord();
	}
}

export function grantArtPiece(
	record: ArtCollectionRecord,
	artId: string,
	ownedAt: string,
	receiptId: string,
): ArtCollectionRecord {
	if (!findArtCollectionWork(artId) || !ownedAt || !receiptId) return record;
	if (record.items[artId]) return record;
	return {
		items: {
			...record.items,
			[artId]: { ownedAt, receiptId },
		},
	};
}

export async function readArtCollection(
	kv: KVNamespace,
	email: string,
): Promise<ArtCollectionRecord> {
	const raw = await kv.get(artCollectionKvKey(email));
	return parseArtCollectionRecord(raw);
}

export async function writeArtCollection(
	kv: KVNamespace,
	email: string,
	record: ArtCollectionRecord,
): Promise<void> {
	await kv.put(artCollectionKvKey(email), JSON.stringify(record));
}

export function artCollectionHasPieces(record: ArtCollectionRecord): boolean {
	return Object.keys(record.items).length > 0;
}
