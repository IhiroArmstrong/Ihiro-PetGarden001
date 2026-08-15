import { errorJson, json } from "../lib/http.ts";
import {
	isPlausibleNewsletterEmail,
	markNewsletterWelcomeSent,
	newsletterUnsubscribeUrl,
	normalizeNewsletterEmail,
	upsertNewsletterSubscriber,
} from "../lib/newsletterKv.ts";
import { newsletterWelcomeCopy, newsletterListUnsubscribeHeaders } from "../lib/newsletterCopy.ts";
import {
	deliverNewsletterWelcome,
	resolveNewsletterWelcomePlan,
} from "../lib/newsletterWelcome.ts";
import { sendTransactionalEmail } from "../lib/resend.ts";
import type { Env } from "../types.ts";

export type SubscribeNewsletterDeps = {
	sendEmail?: typeof sendTransactionalEmail;
};

/**
 * POST /api/newsletter/subscribe
 * Body: { email, locale? }
 * Valid email → { ok: true } only after welcome is skipped (already sent) or Resend accepts.
 * Unsent welcome is retried on later submits (legacy KV rows have no welcomeSentAt).
 */
export async function handleSubscribeNewsletter(
	request: Request,
	env: Env,
	_ctx: ExecutionContext,
	deps: SubscribeNewsletterDeps = {},
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

	const { record } = await upsertNewsletterSubscriber({
		kv: env.NEWSLETTER_KV,
		email,
		locale: localeRaw,
	});

	const apiKey = (env.RESEND_API_KEY || "").trim();
	const from = (env.NEWSLETTER_FROM || "").trim();
	const plan = resolveNewsletterWelcomePlan({
		welcomeSentAt: record.welcomeSentAt,
		apiKey,
		from,
	});

	if (plan === "skip") {
		return json({ ok: true });
	}
	if (plan === "misconfigured") {
		console.warn(
			"[newsletter] RESEND_API_KEY / NEWSLETTER_FROM missing; welcome not emailed",
		);
		return errorJson(
			503,
			"misconfigured",
			"welcome mail is not configured",
		);
	}

	const origin = new URL(request.url).origin;
	const unsubscribeUrl = newsletterUnsubscribeUrl({
		origin,
		token: record.unsubToken,
	});
	const copy = newsletterWelcomeCopy({
		locale: record.locale,
		unsubscribeUrl,
	});
	const sendEmail = deps.sendEmail || sendTransactionalEmail;
	const sent = await deliverNewsletterWelcome({
		sendEmail,
		apiKey,
		from,
		to: email,
		subject: copy.subject,
		text: copy.text,
		html: copy.html,
		headers: newsletterListUnsubscribeHeaders(unsubscribeUrl),
	});
	if (!sent.ok) {
		console.error("[newsletter] resend failed", { detail: sent.detail });
		return errorJson(502, "welcome_unsent", sent.detail || "resend_failed");
	}

	await markNewsletterWelcomeSent({
		kv: env.NEWSLETTER_KV,
		email,
	});
	return json({ ok: true });
}
