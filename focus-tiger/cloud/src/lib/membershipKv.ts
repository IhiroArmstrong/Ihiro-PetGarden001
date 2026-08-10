/**
 * Yin Membership · subscription · KV schema (email → membership record).
 * Key: membership:{normalizedEmail}
 * Reverse index: membership-sub:{subscriptionId} → normalizedEmail
 * Separate from tip:{email} / sanctuary:{email}.
 */

/**
 * Aligns with client `ENTITLEMENT_GRACE_MS` (entitlementState.js).
 * Used by verify-membership so post-expiry window cannot be infinite-refreshed.
 */
export const MEMBERSHIP_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export const MEMBERSHIP_PLAN_ID = "yin-membership";

export type MembershipRecord = {
	active: true;
	periodEndsAt: string;
	planId: string;
	/** Original Checkout Session id — do not rewrite on renewal invoices. */
	receiptId: string;
	subscriptionId: string;
	/**
	 * Ops-only observability (support). Not used for entitlement decisions.
	 */
	lastPaymentFailedAt?: string;
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

export function membershipSubKvKey(subscriptionId: string): string {
	return `membership-sub:${subscriptionId.trim()}`;
}

/**
 * True while now is before periodEndsAt + 7-day grace (inclusive of in-period).
 */
export function isMembershipWithinVerifyWindow(
	periodEndsAt: string,
	nowMs: number = Date.now(),
): boolean {
	const ends = Date.parse(periodEndsAt);
	if (Number.isNaN(ends)) return false;
	return nowMs < ends + MEMBERSHIP_GRACE_MS;
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
		const record: MembershipRecord = {
			active: true,
			periodEndsAt: o.periodEndsAt,
			planId:
				typeof o.planId === "string" && o.planId
					? o.planId
					: MEMBERSHIP_PLAN_ID,
			receiptId: o.receiptId,
			subscriptionId: o.subscriptionId,
		};
		if (
			typeof o.lastPaymentFailedAt === "string" &&
			o.lastPaymentFailedAt
		) {
			record.lastPaymentFailedAt = o.lastPaymentFailedAt;
		}
		return record;
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
	const payload: MembershipRecord = {
		active: true,
		periodEndsAt: record.periodEndsAt,
		planId: record.planId,
		receiptId: record.receiptId,
		subscriptionId: record.subscriptionId,
	};
	if (record.lastPaymentFailedAt) {
		payload.lastPaymentFailedAt = record.lastPaymentFailedAt;
	}
	await kv.put(membershipKvKey(email), JSON.stringify(payload));
}

export async function deleteMembership(
	kv: KVNamespace,
	email: string,
): Promise<void> {
	await kv.delete(membershipKvKey(email));
}

export async function writeMembershipSubIndex(
	kv: KVNamespace,
	subscriptionId: string,
	email: string,
): Promise<void> {
	const id = subscriptionId.trim();
	if (!id.startsWith("sub_")) return;
	await kv.put(membershipSubKvKey(id), normalizeEmail(email));
}

export async function readMembershipSubIndex(
	kv: KVNamespace,
	subscriptionId: string,
): Promise<string | null> {
	const id = subscriptionId.trim();
	if (!id.startsWith("sub_")) return null;
	const raw = await kv.get(membershipSubKvKey(id));
	if (!raw || typeof raw !== "string") return null;
	const email = normalizeEmail(raw);
	return isPlausibleEmail(email) ? email : null;
}

export async function deleteMembershipSubIndex(
	kv: KVNamespace,
	subscriptionId: string,
): Promise<void> {
	const id = subscriptionId.trim();
	if (!id.startsWith("sub_")) return;
	await kv.delete(membershipSubKvKey(id));
}

/** Write membership record + subscriptionId → email reverse index. */
export async function upsertActiveMembership(
	kv: KVNamespace,
	email: string,
	record: MembershipRecord,
): Promise<void> {
	await writeMembership(kv, email, record);
	await writeMembershipSubIndex(kv, record.subscriptionId, email);
}

/** Hard revoke: delete email record + reverse index (Prompt 9 option A). */
export async function revokeMembership(
	kv: KVNamespace,
	email: string,
	subscriptionId?: string | null,
): Promise<void> {
	const existing = await readMembership(kv, email);
	await deleteMembership(kv, email);
	const subId = (subscriptionId || existing?.subscriptionId || "").trim();
	if (subId) await deleteMembershipSubIndex(kv, subId);
}
