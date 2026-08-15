import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	deliverNewsletterWelcome,
	resolveNewsletterWelcomePlan,
} from "./newsletterWelcome.ts";

describe("resolveNewsletterWelcomePlan", () => {
	it("skips when welcome already recorded", () => {
		assert.equal(
			resolveNewsletterWelcomePlan({
				welcomeSentAt: "2026-08-15T00:00:00.000Z",
				apiKey: "re_test",
				from: "Yin <hello@twinsology.com>",
			}),
			"skip",
		);
	});

	it("retries send when the address is on the list but never emailed", () => {
		assert.equal(
			resolveNewsletterWelcomePlan({
				apiKey: "re_test",
				from: "Yin <hello@twinsology.com>",
			}),
			"send",
		);
	});

	it("does not pretend success when Resend is unconfigured", () => {
		assert.equal(
			resolveNewsletterWelcomePlan({
				apiKey: "",
				from: "Yin <hello@twinsology.com>",
			}),
			"misconfigured",
		);
		assert.equal(
			resolveNewsletterWelcomePlan({
				apiKey: "re_test",
				from: "  ",
			}),
			"misconfigured",
		);
	});
});

describe("deliverNewsletterWelcome", () => {
	it("retries without custom headers after a header 400", async () => {
		/** @type {string[]} */
		const attempts = [];
		const result = await deliverNewsletterWelcome({
			sendEmail: async (opts) => {
				attempts.push(opts.headers ? "headers" : "plain");
				if (opts.headers) {
					return { ok: false, detail: "validation_error" };
				}
				return { ok: true, id: "msg_plain" };
			},
			apiKey: "re_test",
			from: "Yin <hello@twinsology.com>",
			to: "friend@example.com",
			subject: "A quiet note from Yin",
			text: "Hello.",
			html: "<p>Hello.</p>",
			headers: {
				"List-Unsubscribe": "<https://example.com/unsub>",
				"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
			},
		});
		assert.deepEqual(attempts, ["headers", "plain"]);
		assert.deepEqual(result, { ok: true, id: "msg_plain" });
	});

	it("does not fall back to restore@ on failure", async () => {
		const froms = [];
		await deliverNewsletterWelcome({
			sendEmail: async (opts) => {
				froms.push(opts.from);
				return { ok: false, detail: "domain_error" };
			},
			apiKey: "re_test",
			from: "Yin <hello@twinsology.com>",
			to: "friend@example.com",
			subject: "A quiet note from Yin",
			text: "Hello.",
			html: "<p>Hello.</p>",
			headers: { "List-Unsubscribe": "<https://example.com/unsub>" },
		});
		assert.deepEqual(froms, [
			"Yin <hello@twinsology.com>",
			"Yin <hello@twinsology.com>",
		]);
	});
});
