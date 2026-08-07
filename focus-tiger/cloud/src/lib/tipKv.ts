/**
 * Buy Yin a Tea · Tip Jar · KV schema (email → tip record).
 * Key: tip:{normalizedEmail}
 */

export type TipRecord = {
	tipped: true;
	tipCount: number;
	lastTippedAt: string;
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

export function tipKvKey(email: string): string {
	return `tip:${normalizeEmail(email)}`;
}

export function parseTipRecord(raw: string | null): TipRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<TipRecord> & {
			purchased?: boolean;
			purchasedAt?: string;
		};
		const tipped = o?.tipped === true || o?.purchased === true;
		if (!tipped) return null;
		const lastTippedAt =
			typeof o.lastTippedAt === "string" && o.lastTippedAt
				? o.lastTippedAt
				: typeof o.purchasedAt === "string" && o.purchasedAt
					? o.purchasedAt
					: null;
		if (!lastTippedAt) return null;
		if (typeof o.receiptId !== "string" || !o.receiptId) return null;
		const tipCount = Number(o.tipCount);
		return {
			tipped: true,
			tipCount:
				Number.isFinite(tipCount) && tipCount > 0 ? Math.floor(tipCount) : 1,
			lastTippedAt,
			receiptId: o.receiptId,
		};
	} catch {
		return null;
	}
}

export async function readTip(
	kv: KVNamespace,
	email: string,
): Promise<TipRecord | null> {
	const raw = await kv.get(tipKvKey(email));
	return parseTipRecord(raw);
}

export async function writeTip(
	kv: KVNamespace,
	email: string,
	record: TipRecord,
): Promise<void> {
	await kv.put(tipKvKey(email), JSON.stringify(record));
}
