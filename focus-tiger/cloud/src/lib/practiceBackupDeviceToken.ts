/**
 * Practice-backup device tokens — issued after OTP verify.
 * Opaque token; OTP_KV stores HMAC hash only (separate prefix from membership).
 */

export const PRACTICE_BACKUP_DEVICE_TOKEN_TTL_SEC = 30 * 24 * 60 * 60; // 30 days

export type PracticeBackupDeviceRecord = {
	email: string;
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

export function generatePracticeBackupDeviceToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function hashPracticeBackupDeviceToken(
	pepper: string,
	token: string,
): Promise<string> {
	return hmacSha256Hex(pepper, `practice-backup-device:${token}`);
}

export function practiceBackupDeviceKvKey(tokenHash: string): string {
	return `practice-backup-device:${tokenHash}`;
}

export function parsePracticeBackupDeviceRecord(
	raw: string | null,
): PracticeBackupDeviceRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<PracticeBackupDeviceRecord>;
		if (typeof o.email !== "string" || !o.email.trim()) return null;
		const issuedAt = Number(o.issuedAt);
		const expiresAt = Number(o.expiresAt);
		if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return null;
		return {
			email: o.email.trim().toLowerCase(),
			issuedAt: Math.floor(issuedAt),
			expiresAt: Math.floor(expiresAt),
		};
	} catch {
		return null;
	}
}

export type MintPracticeBackupDeviceTokenResult =
	| { ok: true; deviceToken: string; email: string; expiresAt: number }
	| { ok: false; reason: "misconfigured" };

export async function mintPracticeBackupDeviceToken(opts: {
	kv: KVNamespace;
	pepper: string;
	email: string;
	nowSec?: number;
}): Promise<MintPracticeBackupDeviceTokenResult> {
	const pepper = (opts.pepper || "").trim();
	if (!pepper) return { ok: false, reason: "misconfigured" };
	const email = opts.email.trim().toLowerCase();
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const deviceToken = generatePracticeBackupDeviceToken();
	const tokenHash = await hashPracticeBackupDeviceToken(pepper, deviceToken);
	const expiresAt = now + PRACTICE_BACKUP_DEVICE_TOKEN_TTL_SEC;
	const record: PracticeBackupDeviceRecord = {
		email,
		issuedAt: now,
		expiresAt,
	};
	await opts.kv.put(
		practiceBackupDeviceKvKey(tokenHash),
		JSON.stringify(record),
		{ expirationTtl: PRACTICE_BACKUP_DEVICE_TOKEN_TTL_SEC },
	);
	return { ok: true, deviceToken, email, expiresAt };
}

export type VerifyPracticeBackupDeviceTokenResult =
	| { ok: true; record: PracticeBackupDeviceRecord; tokenHash: string }
	| {
			ok: false;
			reason: "misconfigured" | "invalid_token" | "email_mismatch" | "expired";
	  };

export async function verifyPracticeBackupDeviceToken(opts: {
	kv: KVNamespace;
	pepper: string;
	email: string;
	deviceToken: string;
	nowSec?: number;
}): Promise<VerifyPracticeBackupDeviceTokenResult> {
	const pepper = (opts.pepper || "").trim();
	if (!pepper) return { ok: false, reason: "misconfigured" };
	const token = String(opts.deviceToken || "").trim();
	if (!token || token.length < 16) {
		return { ok: false, reason: "invalid_token" };
	}
	const email = opts.email.trim().toLowerCase();
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const tokenHash = await hashPracticeBackupDeviceToken(pepper, token);
	const record = parsePracticeBackupDeviceRecord(
		await opts.kv.get(practiceBackupDeviceKvKey(tokenHash)),
	);
	if (!record) return { ok: false, reason: "invalid_token" };
	if (record.expiresAt < now) {
		await opts.kv.delete(practiceBackupDeviceKvKey(tokenHash));
		return { ok: false, reason: "expired" };
	}
	if (record.email !== email) {
		return { ok: false, reason: "email_mismatch" };
	}
	return { ok: true, record, tokenHash };
}

export async function revokePracticeBackupDeviceToken(opts: {
	kv: KVNamespace;
	pepper: string;
	deviceToken: string;
}): Promise<void> {
	const pepper = (opts.pepper || "").trim();
	const token = String(opts.deviceToken || "").trim();
	if (!pepper || !token) return;
	const tokenHash = await hashPracticeBackupDeviceToken(pepper, token);
	await opts.kv.delete(practiceBackupDeviceKvKey(tokenHash));
}
