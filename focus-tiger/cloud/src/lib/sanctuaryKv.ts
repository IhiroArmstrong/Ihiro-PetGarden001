/**
 * Yin's Sanctuary · Lifetime · KV schema (email → unlock record).
 * Key: sanctuary:{normalizedEmail}
 * Separate from tip:{email} — never treat tip records as unlock.
 */

export type SanctuaryRecord = {
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

export function sanctuaryKvKey(email: string): string {
	return `sanctuary:${normalizeEmail(email)}`;
}

export function parseSanctuaryRecord(raw: string | null): SanctuaryRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<SanctuaryRecord>;
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
					: "yin-sanctuary-lifetime",
		};
	} catch {
		return null;
	}
}

export async function readSanctuary(
	kv: KVNamespace,
	email: string,
): Promise<SanctuaryRecord | null> {
	const raw = await kv.get(sanctuaryKvKey(email));
	return parseSanctuaryRecord(raw);
}

export async function writeSanctuary(
	kv: KVNamespace,
	email: string,
	record: SanctuaryRecord,
): Promise<void> {
	await kv.put(sanctuaryKvKey(email), JSON.stringify(record));
}
