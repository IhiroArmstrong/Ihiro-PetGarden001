/**
 * Stay in touch · transactional welcome + unsubscribe page copy.
 * Quiet companion voice — no FOMO, no streaks, no purchase CTA.
 */

import type { NewsletterLocale } from "./newsletterKv";

export function newsletterListUnsubscribeHeaders(
	unsubscribeUrl: string,
): Record<string, string> {
	return {
		"List-Unsubscribe": `<${unsubscribeUrl}>`,
		"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
	};
}

export function newsletterWelcomeCopy(opts: {
	locale?: NewsletterLocale;
	unsubscribeUrl: string;
}): { subject: string; text: string; html: string } {
	const locale = opts.locale || "en";
	const url = opts.unsubscribeUrl;
	if (locale === "ja") {
		const subject = "阿寅からの、ときどきのお便り";
		const text = [
			"こんにちは。",
			"",
			"阿寅の、ときどきのお便りリストに入りました。連続記録も、売り込みもありません。この宛先を書いたからといって、Focus Tiger の練習や解除は何も変わりません。",
			"",
			"小さな近況、季節の一言、坐ってみる価値のある練習——送る理由があるときだけ届きます。届かない日も、それでよいのです。",
			"",
			"配信停止はいつでも:",
			url,
			"",
			"阿寅",
			"Focus Tiger",
		].join("\n");
		return { subject, text, html: newsletterWelcomeHtml(text, url) };
	}
	if (locale === "zh") {
		const subject = "阿寅偶尔会写信来";
		const text = [
			"你好。",
			"",
			"你已在阿寅偶尔写信的名单上。没有连续打卡，也没有推销。留下这个邮箱，不会改变 Focus Tiger 的练习或任何解锁。",
			"",
			"只有值得写的时候才会寄出——一点近况、一句时节、一次值得坐下来的练习。某封没读，也完全可以。",
			"",
			"随时退订：",
			url,
			"",
			"阿寅",
			"Focus Tiger",
		].join("\n");
		return { subject, text, html: newsletterWelcomeHtml(text, url) };
	}
	const subject = "A quiet note from Yin";
	const text = [
		"Hello.",
		"",
		"You're on Yin's occasional list. There is no streak to keep, and nothing in Focus Tiger changes because you wrote this address.",
		"",
		"When there is something worth sending — a small update, a seasonal note, a practice worth sitting with — it will arrive here. Skipping a letter is also fine.",
		"",
		"Unsubscribe anytime:",
		url,
		"",
		"Yin",
		"Focus Tiger",
	].join("\n");
	return { subject, text, html: newsletterWelcomeHtml(text, url) };
}

function newsletterWelcomeHtml(text: string, unsubscribeUrl: string): string {
	const escaped = escapeHtml(text).replace(/\n/g, "<br>\n");
	const href = escapeHtml(unsubscribeUrl);
	return [
		`<!doctype html><html><body style="font-family:Georgia,serif;line-height:1.55;color:#2c1f14">`,
		`<p>${escaped}</p>`,
		`<p style="margin-top:1.5em;font-size:0.92em"><a href="${href}">Unsubscribe</a></p>`,
		`</body></html>`,
	].join("");
}

export function newsletterUnsubscribePageCopy(opts: {
	locale?: NewsletterLocale;
	ok: boolean;
}): { title: string; body: string } {
	const locale = opts.locale || "en";
	if (!opts.ok) {
		if (locale === "ja") {
			return {
				title: "リンクが無効です",
				body: "この配信停止リンクは使えないか、すでに停止済みです。",
			};
		}
		if (locale === "zh") {
			return {
				title: "链接无效",
				body: "这条退订链接不可用，或已经退订过了。",
			};
		}
		return {
			title: "This link is no longer valid",
			body: "The unsubscribe link is missing, expired, or already used.",
		};
	}
	if (locale === "ja") {
		return {
			title: "配信を停止しました",
			body: "この宛先へは、もうお便りしません。Focus Tiger の練習はそのままです。",
		};
	}
	if (locale === "zh") {
		return {
			title: "已退订",
			body: "阿寅不会再写信到这个邮箱。练习与解锁都不受影响。",
		};
	}
	return {
		title: "You've been unsubscribed",
		body: "Yin won't write to this address again. Your practice in Focus Tiger is unchanged.",
	};
}

export function renderNewsletterUnsubscribeHtml(opts: {
	locale?: NewsletterLocale;
	ok: boolean;
}): string {
	const copy = newsletterUnsubscribePageCopy(opts);
	const title = escapeHtml(copy.title);
	const body = escapeHtml(copy.body);
	return `<!doctype html>
<html lang="${opts.locale || "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;background:#f4efe6;color:#2c1f14;font-family:Georgia,serif">
  <main style="max-width:28rem;margin:18vh auto;padding:1.5rem;line-height:1.55">
    <h1 style="font-size:1.25rem;font-weight:600">${title}</h1>
    <p>${body}</p>
  </main>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
