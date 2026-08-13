import { errorJson, json } from "../lib/http";
import {
	isPlausibleNewsletterEmail,
	newsletterUnsubscribeUrl,
	normalizeNewsletterEmail,
	upsertNewsletterSubscriber,
} from "../lib/newsletterKv";
import { newsletterWelcomeCopy, newsletterListUnsubscribeHeaders } from "../lib/newsletterCopy";
import { sendTransactionalEmail } from "../lib/resend";
import type { Env } from "../types";

/**
 * POST /api/newsletter/subscribe
 * Body: { email, locale? }
 * Valid email → { ok: true } (idempotent; no enumeration of existing).
 * Welcome mail is waitUntil / fire-and-forget (same timing posture as OTP).
 */
export async function handleSubscribeNewsletter(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	if (!env.NEWSLETTER_KV) {
		return errorJson(503, "misconfigured", "NEWSLETTER_KV not bound");
	}

	let emailRaw = "";
	let localeRaw: unknown;
	try {
		const body = (await request.json()) as {
			email?: unknown;
			locale?: unknown;
		};
		if (typeof body?.email === "string") emailRaw = body.email;
		localeRaw = body?.locale;
	} catch {
		return errorJson(400, "invalid_json", "JSON body required");
	}

	if (!isPlausibleNewsletterEmail(emailRaw)) {
		return errorJson(400, "invalid_email", "email looks invalid");
	}
	const email = normalizeNewsletterEmail(emailRaw);

	const { record, created } = await upsertNewsletterSubscriber({
		kv: env.NEWSLETTER_KV,
		email,
		locale: localeRaw,
	});

	if (created) {
		const apiKey = (env.RESEND_API_KEY || "").trim();
		const from = (
			env.NEWSLETTER_FROM ||
			env.RESEND_FROM ||
			""
		).trim();
		if (apiKey && from) {
			const origin = new URL(request.url).origin;
			const unsubscribeUrl = newsletterUnsubscribeUrl({
				origin,
				token: record.unsubToken,
			});
			const copy = newsletterWelcomeCopy({
				locale: record.locale,
				unsubscribeUrl,
			});
			ctx.waitUntil(
				sendTransactionalEmail({
					apiKey,
					from,
					to: email,
					subject: copy.subject,
					text: copy.text,
					html: copy.html,
					headers: newsletterListUnsubscribeHeaders(unsubscribeUrl),
				}).then((r) => {
					if (!r.ok) {
						console.error("[newsletter] resend failed", {
							detail: r.detail,
						});
					}
				}),
			);
		} else {
			console.warn(
				"[newsletter] RESEND_API_KEY / NEWSLETTER_FROM missing; welcome not emailed",
			);
		}
	}

	return json({ ok: true });
}
