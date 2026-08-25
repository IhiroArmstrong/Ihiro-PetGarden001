/**
 * Shared entitlement restore OTP (Sanctuary + Membership).
 * Plaintext codes never stored — only HMAC hashes in OTP_KV.
 */

export const RESTORE_OTP_TTL_SEC = 600;
export const RESTORE_OTP_MAX_ATTEMPTS = 5;
/** Min gap between sends for the same email+purpose (KV-backed). */
export const RESTORE_OTP_RESEND_COOLDOWN_SEC = 60;
export const RESTORE_OTP_HOURLY_CAP = 5;

export type RestorePurpose = "sanctuary" | "membership" | "practice-backup" | "companion-addon";

export type RestoreOtpRecord = {
	codeHash: string;
	expiresAt: number;
	attempts: number;
	purpose: RestorePurpose;
	createdAt: number;
	/** Rolling window for hourly send cap. */
	sentAt: number[];
};

export function isRestorePurpose(v: unknown): v is RestorePurpose {
	return (
		v === "sanctuary" ||
		v === "membership" ||
		v === "practice-backup" ||
		v === "companion-addon"
	);
}

export function restoreOtpKey(purpose: RestorePurpose, email: string): string {
	return `restore-otp:${purpose}:${email.trim().toLowerCase()}`;
}

export function generateRestoreOtpCode(): string {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	const n = buf[0]! % 1_000_000;
	return String(n).padStart(6, "0");
}

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

export async function hashRestoreOtpCode(opts: {
	pepper: string;
	purpose: RestorePurpose;
	email: string;
	code: string;
}): Promise<string> {
	const email = opts.email.trim().toLowerCase();
	const code = String(opts.code || "").trim();
	return hmacSha256Hex(
		opts.pepper,
		`${opts.purpose}:${email}:${code}`,
	);
}

export function parseRestoreOtpRecord(raw: string | null): RestoreOtpRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<RestoreOtpRecord>;
		if (typeof o.codeHash !== "string" || !o.codeHash) return null;
		if (typeof o.expiresAt !== "number" || !Number.isFinite(o.expiresAt)) {
			return null;
		}
		if (
			o.purpose !== "sanctuary" &&
			o.purpose !== "membership" &&
			o.purpose !== "practice-backup" &&
			o.purpose !== "companion-addon"
		) {
			return null;
		}
		const attempts = Number(o.attempts);
		const createdAt = Number(o.createdAt);
		const sentAt = Array.isArray(o.sentAt)
			? o.sentAt.filter((n): n is number => typeof n === "number")
			: [];
		return {
			codeHash: o.codeHash,
			expiresAt: o.expiresAt,
			attempts:
				Number.isFinite(attempts) && attempts >= 0 ? Math.floor(attempts) : 0,
			purpose: o.purpose,
			createdAt:
				Number.isFinite(createdAt) && createdAt > 0
					? Math.floor(createdAt)
					: Math.floor(Date.now() / 1000),
			sentAt,
		};
	} catch {
		return null;
	}
}

export type IssueRestoreOtpResult =
	| { ok: true; code: string; record: RestoreOtpRecord }
	| { ok: false; reason: "cooldown" | "hourly_cap" };

/**
 * Create / rotate OTP challenge. Caller sends email asynchronously.
 */
export async function issueRestoreOtp(opts: {
	kv: KVNamespace;
	pepper: string;
	purpose: RestorePurpose;
	email: string;
	nowSec?: number;
}): Promise<IssueRestoreOtpResult> {
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const email = opts.email.trim().toLowerCase();
	const key = restoreOtpKey(opts.purpose, email);
	const prev = parseRestoreOtpRecord(await opts.kv.get(key));
	const sentAt = (prev?.sentAt || []).filter(
		(t) => now - t < 3600,
	);

	if (sentAt.length > 0) {
		const last = Math.max(...sentAt);
		if (now - last < RESTORE_OTP_RESEND_COOLDOWN_SEC) {
			return { ok: false, reason: "cooldown" };
		}
	}
	if (sentAt.length >= RESTORE_OTP_HOURLY_CAP) {
		return { ok: false, reason: "hourly_cap" };
	}

	const code = generateRestoreOtpCode();
	const codeHash = await hashRestoreOtpCode({
		pepper: opts.pepper,
		purpose: opts.purpose,
		email,
		code,
	});
	const record: RestoreOtpRecord = {
		codeHash,
		expiresAt: now + RESTORE_OTP_TTL_SEC,
		attempts: 0,
		purpose: opts.purpose,
		createdAt: now,
		sentAt: [...sentAt, now],
	};
	await opts.kv.put(key, JSON.stringify(record), {
		expirationTtl: RESTORE_OTP_TTL_SEC,
	});
	return { ok: true, code, record };
}

export type ConsumeRestoreOtpResult =
	| { ok: true }
	| {
			ok: false;
			reason:
				| "missing_code"
				| "invalid_or_expired_code"
				| "misconfigured";
	  };

/**
 * Verify + consume OTP. On success the challenge is deleted (one-time).
 */
export async function consumeRestoreOtp(opts: {
	kv: KVNamespace;
	pepper: string;
	purpose: RestorePurpose;
	email: string;
	code: string;
	nowSec?: number;
}): Promise<ConsumeRestoreOtpResult> {
	const pepper = (opts.pepper || "").trim();
	if (!pepper) {
		return { ok: false, reason: "misconfigured" };
	}
	const code = String(opts.code || "").trim();
	if (!/^\d{6}$/.test(code)) {
		return { ok: false, reason: "missing_code" };
	}

	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const email = opts.email.trim().toLowerCase();
	const key = restoreOtpKey(opts.purpose, email);
	const record = parseRestoreOtpRecord(await opts.kv.get(key));
	if (!record || record.purpose !== opts.purpose || record.expiresAt < now) {
		return { ok: false, reason: "invalid_or_expired_code" };
	}
	if (record.attempts >= RESTORE_OTP_MAX_ATTEMPTS) {
		await opts.kv.delete(key);
		return { ok: false, reason: "invalid_or_expired_code" };
	}

	const expected = await hashRestoreOtpCode({
		pepper,
		purpose: opts.purpose,
		email,
		code,
	});
	if (!timingSafeEqualHex(expected, record.codeHash)) {
		const nextAttempts = record.attempts + 1;
		if (nextAttempts >= RESTORE_OTP_MAX_ATTEMPTS) {
			await opts.kv.delete(key);
		} else {
			const ttl = Math.max(1, record.expiresAt - now);
			await opts.kv.put(
				key,
				JSON.stringify({ ...record, attempts: nextAttempts }),
				{ expirationTtl: ttl },
			);
		}
		return { ok: false, reason: "invalid_or_expired_code" };
	}

	await opts.kv.delete(key);
	return { ok: true };
}
