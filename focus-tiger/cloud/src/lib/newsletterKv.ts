/**
 * Stay in touch · newsletter list (NEWSLETTER_KV only).
 * Not Resend Audiences. Separate from tip / sanctuary / membership / OTP.
 *
 * Keys:
 *   newsletter:v1:{email} → subscriber record (includes unsub token)
 *   newsletter-unsub:v1:{token} → { email } reverse index
 */

export const NEWSLETTER_SCHEMA_VERSION = 1;

export type NewsletterLocale = "en" | "ja" | "zh";

export type NewsletterRecord = {
	schemaVersion: number;
	email: string;
	subscribedAt: string;
	locale: NewsletterLocale;
	unsubToken: string;
};

export function normalizeNewsletterEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function isPlausibleNewsletterEmail(email: string): boolean {
	const e = normalizeNewsletterEmail(email);
	if (e.length < 3 || e.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export function newsletterSubscriberKvKey(email: string): string {
	return `newsletter:v1:${normalizeNewsletterEmail(email)}`;
}

export function newsletterUnsubKvKey(token: string): string {
	return `newsletter-unsub:v1:${token.trim()}`;
}

export function normalizeNewsletterLocale(raw: unknown): NewsletterLocale {
	if (raw === "ja" || raw === "zh" || raw === "en") return raw;
	return "en";
}

export function parseNewsletterRecord(raw: string | null): NewsletterRecord | null {
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as Partial<NewsletterRecord>;
		if (o?.schemaVersion !== NEWSLETTER_SCHEMA_VERSION) return null;
		if (typeof o.email !== "string" || !o.email) return null;
		if (typeof o.subscribedAt !== "string" || !o.subscribedAt) return null;
		if (typeof o.unsubToken !== "string" || o.unsubToken.length < 16) {
			return null;
		}
		return {
			schemaVersion: NEWSLETTER_SCHEMA_VERSION,
			email: normalizeNewsletterEmail(o.email),
			subscribedAt: o.subscribedAt,
			locale: normalizeNewsletterLocale(o.locale),
			unsubToken: o.unsubToken,
		};
	} catch {
		return null;
	}
}

export function generateUnsubscribeToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	let hex = "";
	for (const b of bytes) hex += b.toString(16).padStart(2, "0");
	return hex;
}

export async function readNewsletterSubscriber(
	kv: KVNamespace,
	email: string,
): Promise<NewsletterRecord | null> {
	const raw = await kv.get(newsletterSubscriberKvKey(email));
	return parseNewsletterRecord(raw);
}

export async function readNewsletterEmailByToken(
	kv: KVNamespace,
	token: string,
): Promise<string | null> {
	const raw = await kv.get(newsletterUnsubKvKey(token));
	if (!raw) return null;
	try {
		const o = JSON.parse(raw) as { email?: unknown };
		if (typeof o.email !== "string" || !o.email) return null;
		return normalizeNewsletterEmail(o.email);
	} catch {
		return null;
	}
}

/**
 * Insert subscriber. If already present, return existing (no token rotate,
 * no second welcome).
 */
export async function upsertNewsletterSubscriber(opts: {
	kv: KVNamespace;
	email: string;
	locale?: unknown;
	nowIso?: string;
	token?: string;
}): Promise<{ record: NewsletterRecord; created: boolean }> {
	const email = normalizeNewsletterEmail(opts.email);
	const existing = await readNewsletterSubscriber(opts.kv, email);
	if (existing) {
		return { record: existing, created: false };
	}
	const record: NewsletterRecord = {
		schemaVersion: NEWSLETTER_SCHEMA_VERSION,
		email,
		subscribedAt: opts.nowIso || new Date().toISOString(),
		locale: normalizeNewsletterLocale(opts.locale),
		unsubToken: (opts.token || generateUnsubscribeToken()).trim(),
	};
	await opts.kv.put(newsletterSubscriberKvKey(email), JSON.stringify(record));
	await opts.kv.put(
		newsletterUnsubKvKey(record.unsubToken),
		JSON.stringify({ email }),
	);
	return { record, created: true };
}

export async function removeNewsletterSubscriberByToken(
	kv: KVNamespace,
	token: string,
): Promise<{ removed: boolean; email?: string }> {
	const trimmed = String(token || "").trim();
	if (trimmed.length < 16) return { removed: false };
	const email = await readNewsletterEmailByToken(kv, trimmed);
	if (!email) return { removed: false };
	const existing = await readNewsletterSubscriber(kv, email);
	await kv.delete(newsletterUnsubKvKey(trimmed));
	if (existing) {
		await kv.delete(newsletterSubscriberKvKey(email));
		if (existing.unsubToken && existing.unsubToken !== trimmed) {
			await kv.delete(newsletterUnsubKvKey(existing.unsubToken));
		}
	}
	return { removed: true, email };
}

export function newsletterUnsubscribeUrl(opts: {
	origin: string;
	token: string;
}): string {
	const origin = opts.origin.replace(/\/+$/, "");
	return `${origin}/api/newsletter/unsubscribe?token=${encodeURIComponent(opts.token)}`;
}
