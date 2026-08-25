/**
 * AI Companion Lifetime add-on · KV schema (email → unlock record).
 * Key: companion-addon:{normalizedEmail}
 * Stored in SANCTUARY_KV (same binding as Lifetime; separate key prefix).
 */

/** Must match client `companionAddonSku.js` COMPANION_ADDON_LIFETIME_SKU. */
export const COMPANION_ADDON_LIFETIME_ITEM_ID = "companion.addon.lifetime";

export type CompanionAddonRecord = {
	unlocked: true;
	unlockedAt: string;
	receiptId: string;
	itemId: string;
};

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function isPlausibleEmail(email: string): boolean {
	const e = normalizeEmail(email);
	if (e.length < 3 || e.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function companionAddonKvKey(email: string): string {
	return `companion-addon:${normalizeEmail(email)}`;
}

export function parseCompanionAddonRecord(
	raw: string | null,
): CompanionAddonRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<CompanionAddonRecord>;
		if (o?.unlocked !== true) return null;
		if (typeof o.unlockedAt !== "string" || !o.unlockedAt) return null;
		if (typeof o.receiptId !== "string" || !o.receiptId) return null;
		return {
			unlocked: true,
			unlockedAt: o.unlockedAt,
			receiptId: o.receiptId,
			itemId:
				typeof o.itemId === "string" && o.itemId
					? o.itemId
					: COMPANION_ADDON_LIFETIME_ITEM_ID,
		};
	} catch {
		return null;
	}
}

export async function readCompanionAddon(
	kv: KVNamespace,
	email: string,
): Promise<CompanionAddonRecord | null> {
	const raw = await kv.get(companionAddonKvKey(email));
	return parseCompanionAddonRecord(raw);
}

export async function writeCompanionAddon(
	kv: KVNamespace,
	email: string,
	record: CompanionAddonRecord,
): Promise<void> {
	await kv.put(companionAddonKvKey(email), JSON.stringify(record));
}
