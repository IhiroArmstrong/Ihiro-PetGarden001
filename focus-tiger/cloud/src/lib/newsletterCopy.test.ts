import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	newsletterListUnsubscribeHeaders,
	newsletterUnsubscribePageCopy,
	newsletterWelcomeCopy,
	renderNewsletterUnsubscribeHtml,
} from "./newsletterCopy.ts";

describe("newsletterWelcomeCopy", () => {
	const url = "https://example.com/api/newsletter/unsubscribe?token=abc";

	it("en has no purchase CTA and includes unsubscribe URL", () => {
		const copy = newsletterWelcomeCopy({ locale: "en", unsubscribeUrl: url });
		assert.equal(copy.subject, "A quiet note from Yin");
		assert.match(copy.text, /occasional list/);
		assert.match(copy.text, /Unsubscribe anytime/);
		assert.equal(copy.text.includes(url), true);
		assert.equal(/buy now|unlock now|don't miss/i.test(copy.text), false);
		assert.match(copy.html, /<a href=/);
	});

	it("List-Unsubscribe headers use the same URL", () => {
		const headers = newsletterListUnsubscribeHeaders(url);
		assert.equal(headers["List-Unsubscribe"], `<${url}>`);
		assert.equal(
			headers["List-Unsubscribe-Post"],
			"List-Unsubscribe=One-Click",
		);
	});

	it("ja / zh stay quiet and include URL", () => {
		const ja = newsletterWelcomeCopy({ locale: "ja", unsubscribeUrl: url });
		assert.match(ja.subject, /阿寅/);
		assert.equal(ja.text.includes(url), true);
		assert.equal(/今すぐ|購入/.test(ja.text), false);
		const zh = newsletterWelcomeCopy({ locale: "zh", unsubscribeUrl: url });
		assert.match(zh.subject, /阿寅/);
		assert.equal(zh.text.includes(url), true);
	});
});

describe("unsubscribe page", () => {
	it("ok vs invalid copy", () => {
		assert.match(
			newsletterUnsubscribePageCopy({ locale: "en", ok: true }).title,
			/unsubscribed/i,
		);
		assert.match(
			newsletterUnsubscribePageCopy({ locale: "en", ok: false }).title,
			/no longer valid/i,
		);
		const html = renderNewsletterUnsubscribeHtml({ locale: "ja", ok: true });
		assert.match(html, /配信を停止しました/);
		assert.match(html, /<!doctype html>/i);
	});
});
