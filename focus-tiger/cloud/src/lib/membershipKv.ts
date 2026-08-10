/**
 * Yin Membership · subscription · KV schema (email → membership record).
 * Key: membership:{normalizedEmail}
 * Separate from tip:{email} / sanctuary:{email}.
 */

export const MEMBERSHIP_PLAN_ID = "yin-membership";

export type MembershipRecord = {
	active: true;
	periodEndsAt: string;
	planId: string;
	receiptId: string;
	subscriptionId: string;
};

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function isPlausibleEmail(email: string): boolean {
	const e = normalizeEmail(email);
	if (e.length < 3 || e.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function membershipKvKey(email: string): string {
	return `membership:${normalizeEmail(email)}`;
}

export function parseMembershipRecord(
	raw: string | null,
): MembershipRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<MembershipRecord>;
		if (o?.active !== true) return null;
		if (typeof o.periodEndsAt !== "string" || !o.periodEndsAt) return null;
		if (typeof o.receiptId !== "string" || !o.receiptId) return null;
		if (typeof o.subscriptionId !== "string" || !o.subscriptionId) {
			return null;
		}
		return {
			active: true,
			periodEndsAt: o.periodEndsAt,
			planId:
				typeof o.planId === "string" && o.planId
					? o.planId
					: MEMBERSHIP_PLAN_ID,
			receiptId: o.receiptId,
			subscriptionId: o.subscriptionId,
		};
	} catch {
		return null;
	}
}

export async function readMembership(
	kv: KVNamespace,
	email: string,
): Promise<MembershipRecord | null> {
	const raw = await kv.get(membershipKvKey(email));
	return parseMembershipRecord(raw);
}

export async function writeMembership(
	kv: KVNamespace,
	email: string,
	record: MembershipRecord,
): Promise<void> {
	await kv.put(membershipKvKey(email), JSON.stringify(record));
}
