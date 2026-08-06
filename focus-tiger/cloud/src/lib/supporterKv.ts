/**
 * Founder Supporter Pack · KV schema (email → purchase record).
 * Key: supporter:{normalizedEmail}
 */

export type SupporterRecord = {
	purchased: true;
	purchasedAt: string;
	receiptId: string;
};

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

/** Loose shape check — not full RFC; enough to reject empty / garbage. */
export function isPlausibleEmail(email: string): boolean {
	const e = normalizeEmail(email);
	if (e.length < 3 || e.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function supporterKvKey(email: string): string {
	return `supporter:${normalizeEmail(email)}`;
}

export function parseSupporterRecord(raw: string | null): SupporterRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<SupporterRecord>;
		if (o?.purchased !== true) return null;
		if (typeof o.purchasedAt !== "string" || !o.purchasedAt) return null;
		if (typeof o.receiptId !== "string" || !o.receiptId) return null;
		return {
			purchased: true,
			purchasedAt: o.purchasedAt,
			receiptId: o.receiptId,
		};
	} catch {
		return null;
	}
}

export async function readSupporter(
	kv: KVNamespace,
	email: string,
): Promise<SupporterRecord | null> {
	const raw = await kv.get(supporterKvKey(email));
	return parseSupporterRecord(raw);
}

export async function writeSupporter(
	kv: KVNamespace,
	email: string,
	record: SupporterRecord,
): Promise<void> {
	await kv.put(supporterKvKey(email), JSON.stringify(record));
}
