/**
 * Membership device tokens — issued after confirm-membership-session or
 * OTP verify-membership. Opaque token; OTP_KV stores HMAC hash only.
 */

export const MEMBERSHIP_DEVICE_TOKEN_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

export type MembershipDeviceRecord = {
	email: string;
	subscriptionId: string | null;
	issuedAt: number;
	expiresAt: number;
};

function timingSafeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
	return [...new Uint8Array(sig)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/** URL-safe opaque token (no padding). */
export function generateMembershipDeviceToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function hashMembershipDeviceToken(
	pepper: string,
	token: string,
): Promise<string> {
	return hmacSha256Hex(pepper, `membership-device:${token}`);
}

export function membershipDeviceKvKey(tokenHash: string): string {
	return `membership-device:${tokenHash}`;
}

export function parseMembershipDeviceRecord(
	raw: string | null,
): MembershipDeviceRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<MembershipDeviceRecord>;
		if (typeof o.email !== "string" || !o.email.trim()) return null;
		const issuedAt = Number(o.issuedAt);
		const expiresAt = Number(o.expiresAt);
		if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return null;
		return {
			email: o.email.trim().toLowerCase(),
			subscriptionId:
				typeof o.subscriptionId === "string" && o.subscriptionId
					? o.subscriptionId
					: null,
			issuedAt: Math.floor(issuedAt),
			expiresAt: Math.floor(expiresAt),
		};
	} catch {
		return null;
	}
}

export type MintMembershipDeviceTokenResult =
	| { ok: true; deviceToken: string; email: string; expiresAt: number }
	| { ok: false; reason: "misconfigured" };

/**
 * Mint a device token bound to email (+ optional subscriptionId).
 */
export async function mintMembershipDeviceToken(opts: {
	kv: KVNamespace;
	pepper: string;
	email: string;
	subscriptionId?: string | null;
	nowSec?: number;
}): Promise<MintMembershipDeviceTokenResult> {
	const pepper = (opts.pepper || "").trim();
	if (!pepper) return { ok: false, reason: "misconfigured" };
	const email = opts.email.trim().toLowerCase();
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const deviceToken = generateMembershipDeviceToken();
	const tokenHash = await hashMembershipDeviceToken(pepper, deviceToken);
	const expiresAt = now + MEMBERSHIP_DEVICE_TOKEN_TTL_SEC;
	const record: MembershipDeviceRecord = {
		email,
		subscriptionId:
			typeof opts.subscriptionId === "string" && opts.subscriptionId
				? opts.subscriptionId
				: null,
		issuedAt: now,
		expiresAt,
	};
	await opts.kv.put(membershipDeviceKvKey(tokenHash), JSON.stringify(record), {
		expirationTtl: MEMBERSHIP_DEVICE_TOKEN_TTL_SEC,
	});
	return { ok: true, deviceToken, email, expiresAt };
}

export type VerifyMembershipDeviceTokenResult =
	| { ok: true; record: MembershipDeviceRecord }
	| {
			ok: false;
			reason: "misconfigured" | "invalid_token" | "email_mismatch" | "expired";
	  };

export async function verifyMembershipDeviceToken(opts: {
	kv: KVNamespace;
	pepper: string;
	email: string;
	deviceToken: string;
	nowSec?: number;
}): Promise<VerifyMembershipDeviceTokenResult> {
	const pepper = (opts.pepper || "").trim();
	if (!pepper) return { ok: false, reason: "misconfigured" };
	const token = String(opts.deviceToken || "").trim();
	if (!token || token.length < 16) {
		return { ok: false, reason: "invalid_token" };
	}
	const email = opts.email.trim().toLowerCase();
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const tokenHash = await hashMembershipDeviceToken(pepper, token);
	const record = parseMembershipDeviceRecord(
		await opts.kv.get(membershipDeviceKvKey(tokenHash)),
	);
	if (!record) return { ok: false, reason: "invalid_token" };
	if (record.expiresAt < now) {
		await opts.kv.delete(membershipDeviceKvKey(tokenHash));
		return { ok: false, reason: "expired" };
	}
	if (record.email !== email) {
		return { ok: false, reason: "email_mismatch" };
	}
	return { ok: true, record };
}
