import { json } from "../lib/http";
import {
	normalizeNewsletterLocale,
	readNewsletterEmailByToken,
	readNewsletterSubscriber,
	removeNewsletterSubscriberByToken,
} from "../lib/newsletterKv";
import { renderNewsletterUnsubscribeHtml } from "../lib/newsletterCopy";
import type { Env } from "../types";

function tokenFromRequest(request: Request): string {
	const url = new URL(request.url);
	const q = url.searchParams.get("token");
	if (q) return q.trim();
	return "";
}

function localeHint(request: Request): "en" | "ja" | "zh" {
	const url = new URL(request.url);
	const q = url.searchParams.get("locale");
	if (q === "ja" || q === "zh" || q === "en") return q;
	const accept = (request.headers.get("accept-language") || "").toLowerCase();
	if (accept.startsWith("ja")) return "ja";
	if (accept.startsWith("zh")) return "zh";
	return "en";
}

async function localeForToken(
	env: Env,
	token: string,
	fallback: "en" | "ja" | "zh",
): Promise<"en" | "ja" | "zh"> {
	if (!env.NEWSLETTER_KV || !token) return fallback;
	const email = await readNewsletterEmailByToken(env.NEWSLETTER_KV, token);
	if (!email) return fallback;
	const rec = await readNewsletterSubscriber(env.NEWSLETTER_KV, email);
	return rec ? rec.locale : fallback;
}

/**
 * GET /api/newsletter/unsubscribe?token=…  → HTML page (email link).
 * POST same path → JSON { ok: true } (RFC 8058 one-click).
 * Missing/unknown token still 200 (no enumeration); page explains invalid.
 */
export async function handleUnsubscribeNewsletter(
	request: Request,
	env: Env,
): Promise<Response> {
	const token = tokenFromRequest(request);
	const hint = localeHint(request);
	if (!env.NEWSLETTER_KV) {
		const html = renderNewsletterUnsubscribeHtml({ locale: hint, ok: false });
		return new Response(html, {
			status: 503,
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	}

	const locale = await localeForToken(env, token, hint);
	const result = await removeNewsletterSubscriberByToken(
		env.NEWSLETTER_KV,
		token,
	);
	const ok = result.removed === true;
	if (request.method === "POST") {
		return json({ ok: true });
	}
	const html = renderNewsletterUnsubscribeHtml({
		locale: normalizeNewsletterLocale(locale),
		ok,
	});
	return new Response(html, {
		status: 200,
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}
