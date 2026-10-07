/**
 * Yin's Art Collection ownership.
 * Key: art-collection:{normalizedEmail}
 * Stored in SANCTUARY_KV. Separate prefix from sanctuary and companion add-on.
 *
 * Refund keeps the purchase row with revokedAt set; HD must not be served after revoke.
 */

import { findArtCollectionWork } from "./artCollectionCatalog.ts";
import {
	artGrantIds,
	decideEditionRelease,
	decideEditionSale,
	editionSoldKey,
	findArtEditionSet,
} from "./artEditionCatalog.ts";

export type ArtCollectionPiece = {
	ownedAt: string;
	receiptId: string;
	revokedAt?: string;
};

export type ArtCollectionRecord = {
	items: Record<string, ArtCollectionPiece>;
};

export type ArtCollectionPurchaseIndex = {
	email: string;
	artId: string;
	receiptId?: string;
};

export function normalizeArtEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function artCollectionKvKey(email: string): string {
	return `art-collection:${normalizeArtEmail(email)}`;
}

export function artCollectionReceiptIndexKey(receiptId: string): string {
	return `art-collection-receipt:${receiptId}`;
}

export function artCollectionChargeIndexKey(chargeId: string): string {
	return `art-collection-charge:${chargeId}`;
}

export function emptyArtCollectionRecord(): ArtCollectionRecord {
	return { items: {} };
}

export function parseArtCollectionPurchaseIndex(
	raw: string | null,
): ArtCollectionPurchaseIndex | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as {
			email?: unknown;
			artId?: unknown;
			receiptId?: unknown;
		};
		const email =
			typeof parsed.email === "string" ? normalizeArtEmail(parsed.email) : "";
		const artId = typeof parsed.artId === "string" ? parsed.artId : "";
		if (!email || !findArtCollectionWork(artId)) return null;
		const receiptId =
			typeof parsed.receiptId === "string" && parsed.receiptId.startsWith("cs_")
				? parsed.receiptId
				: undefined;
		return receiptId ? { email, artId, receiptId } : { email, artId };
	} catch {
		return null;
	}
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
				const revokedAtRaw = (value as { revokedAt?: unknown }).revokedAt;
				const revokedAt =
					typeof revokedAtRaw === "string" && revokedAtRaw.trim()
						? revokedAtRaw
						: undefined;
				if (!ownedAt || !receiptId) continue;
				items[id] = revokedAt ? { ownedAt, receiptId, revokedAt } : { ownedAt, receiptId };
			}
		}
		return { items };
	} catch {
		return emptyArtCollectionRecord();
	}
}

export function isArtPieceOwned(
	record: ArtCollectionRecord,
	artId: string,
): boolean {
	const piece = record.items[artId];
	return Boolean(piece && !piece.revokedAt);
}

export function grantArtPiece(
	record: ArtCollectionRecord,
	artId: string,
	ownedAt: string,
	receiptId: string,
): ArtCollectionRecord {
	if (!findArtCollectionWork(artId) || !ownedAt || !receiptId) return record;
	const existing = record.items[artId];
	if (existing && !existing.revokedAt) return record;
	return {
		items: {
			...record.items,
			[artId]: { ownedAt, receiptId },
		},
	};
}

export function grantArtPurchase(
	record: ArtCollectionRecord,
	artId: string,
	ownedAt: string,
	receiptId: string,
): ArtCollectionRecord {
	const ids = artGrantIds(artId, Boolean(findArtCollectionWork(artId)));
	let next = record;
	for (const id of ids) {
		next = grantArtPiece(next, id, ownedAt, receiptId);
	}
	return next;
}

export async function noteEditionSale(
	kv: KVNamespace,
	artId: string,
	alreadyOwned: boolean,
): Promise<"ok" | "closed" | "skip"> {
	const set = findArtEditionSet(artId);
	if (!set || alreadyOwned) return "skip";
	const raw = await kv.get(editionSoldKey(set.id));
	const sold = raw ? Number(raw) : 0;
	const decision = decideEditionSale(Number.isFinite(sold) ? sold : 0, set.editionLimit);
	if (!decision.ok) return "closed";
	await kv.put(editionSoldKey(set.id), String(decision.next));
	return "ok";
}

export async function noteEditionRelease(
	kv: KVNamespace,
	artId: string,
	wasOwned: boolean,
): Promise<void> {
	const set = findArtEditionSet(artId);
	if (!set || !wasOwned) return;
	const raw = await kv.get(editionSoldKey(set.id));
	const sold = raw ? Number(raw) : 0;
	await kv.put(
		editionSoldKey(set.id),
		String(decideEditionRelease(Number.isFinite(sold) ? sold : 0)),
	);
}

export function revokeArtPiece(
	record: ArtCollectionRecord,
	artId: string,
	revokedAt: string,
	receiptId?: string,
): ArtCollectionRecord {
	const piece = record.items[artId];
	if (!piece || piece.revokedAt) return record;
	if (receiptId && piece.receiptId !== receiptId) return record;
	return {
		items: {
			...record.items,
			[artId]: { ...piece, revokedAt },
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

export async function indexArtCollectionPurchase(
	kv: KVNamespace,
	opts: { email: string; artId: string; receiptId: string; chargeId?: string },
): Promise<void> {
	const email = normalizeArtEmail(opts.email);
	const receiptPayload = JSON.stringify({ email, artId: opts.artId });
	await kv.put(artCollectionReceiptIndexKey(opts.receiptId), receiptPayload);
	if (opts.chargeId?.startsWith("ch_")) {
		await kv.put(
			artCollectionChargeIndexKey(opts.chargeId),
			JSON.stringify({
				email,
				artId: opts.artId,
				receiptId: opts.receiptId,
			}),
		);
	}
}

export async function applyArtCollectionRevoke(
	kv: KVNamespace,
	opts: { email: string; artId: string; receiptId?: string; revokedAt: string },
): Promise<{ stored: boolean; reason?: string }> {
	const email = normalizeArtEmail(opts.email);
	const record = await readArtCollection(kv, email);
	const wasOwned = isArtPieceOwned(record, opts.artId);
	const ids = artGrantIds(opts.artId, Boolean(findArtCollectionWork(opts.artId)));
	let next = record;
	for (const id of ids) {
		next = revokeArtPiece(next, id, opts.revokedAt, opts.receiptId);
	}
	if (next === record) {
		return { stored: false, reason: "not_found_or_already_revoked" };
	}
	await writeArtCollection(kv, email, next);
	await noteEditionRelease(kv, opts.artId, wasOwned);
	return { stored: true };
}

export function artCollectionHasPieces(record: ArtCollectionRecord): boolean {
	return Object.values(record.items).some((piece) => piece && !piece.revokedAt);
}
