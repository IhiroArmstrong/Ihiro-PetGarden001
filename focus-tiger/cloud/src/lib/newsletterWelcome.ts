/**
 * Stay in touch welcome delivery.
 * Newsletter has no OTP-style timing side-channel, so the route awaits Resend
 * instead of waitUntil + { ok: true } (that combo marked local submitted
 * even when the letter never left).
 *
 * From stays NEWSLETTER_FROM (hello@). Never fall back to restore@.
 */

import type { SendTransactionalEmailResult } from "./resend";

export type NewsletterWelcomePlan = "skip" | "misconfigured" | "send";

export function resolveNewsletterWelcomePlan(opts: {
	welcomeSentAt?: string;
	apiKey: string;
	from: string;
}): NewsletterWelcomePlan {
	if (opts.welcomeSentAt && opts.welcomeSentAt.trim()) return "skip";
	const apiKey = (opts.apiKey || "").trim();
	const from = (opts.from || "").trim();
	if (!apiKey || !from) return "misconfigured";
	return "send";
}

type SendEmailFn = (opts: {
	apiKey: string;
	from: string;
	to: string;
	subject: string;
	text: string;
	html?: string;
	headers?: Record<string, string>;
}) => Promise<SendTransactionalEmailResult>;

/**
 * Try RFC 8058 List-Unsubscribe headers first. If Resend 400s the payload
 * (the deferred curl-400 path), retry the same letter without custom headers
 * so the body unsubscribe URL still arrives.
 */
export async function deliverNewsletterWelcome(opts: {
	sendEmail: SendEmailFn;
	apiKey: string;
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string;
	headers: Record<string, string>;
}): Promise<SendTransactionalEmailResult> {
	const base = {
		apiKey: opts.apiKey,
		from: opts.from,
		to: opts.to,
		subject: opts.subject,
		text: opts.text,
		html: opts.html,
	};
	const withHeaders = await opts.sendEmail({
		...base,
		headers: opts.headers,
	});
	if (withHeaders.ok) return withHeaders;
	console.error("[newsletter] resend with List-Unsubscribe headers failed", {
		detail: withHeaders.detail,
	});
	return opts.sendEmail(base);
}
