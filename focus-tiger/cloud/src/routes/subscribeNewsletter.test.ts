import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handleSubscribeNewsletter } from "./subscribeNewsletter.ts";
import {
	newsletterSubscriberKvKey,
	parseNewsletterRecord,
} from "../lib/newsletterKv.ts";
import type { Env } from "../types.ts";

class MemoryKv {
	store = new Map<string, string>();
	async get(key: string): Promise<string | null> {
		return this.store.has(key) ? this.store.get(key)! : null;
	}
	async put(key: string, value: string): Promise<void> {
		this.store.set(key, value);
	}
	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

function envWithKv(kv: MemoryKv, extra: Partial<Env> = {}): Env {
	return {
		TIP_KV: kv as unknown as KVNamespace,
		SANCTUARY_KV: kv as unknown as KVNamespace,
		MEMBERSHIP_KV: kv as unknown as KVNamespace,
		OTP_KV: kv as unknown as KVNamespace,
		PRACTICE_BACKUP_KV: kv as unknown as KVNamespace,
		NEWSLETTER_KV: kv as unknown as KVNamespace,
		RESEND_API_KEY: "re_test",
		NEWSLETTER_FROM: "Yin <hello@twinsology.com>",
		...extra,
	};
}

const ctx = { waitUntil() {} } as unknown as ExecutionContext;

function subscribeRequest(email: string): Request {
	return new Request("https://focus-tiger-cloud.ihiro.workers.dev/api/newsletter/subscribe", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ email, locale: "en" }),
	});
}

describe("handleSubscribeNewsletter", () => {
	it("sends welcome on first subscribe and records welcomeSentAt", async () => {
		const kv = new MemoryKv();
		let sends = 0;
		const res = await handleSubscribeNewsletter(
			subscribeRequest("friend@example.com"),
			envWithKv(kv),
			ctx,
			{
				sendEmail: async (opts) => {
					sends += 1;
					assert.equal(opts.to, "friend@example.com");
					assert.match(opts.from, /hello@twinsology\.com/);
					return { ok: true, id: "msg_new" };
				},
			},
		);
		assert.equal(res.status, 200);
		assert.equal((await res.json() as { ok?: boolean }).ok, true);
		assert.equal(sends, 1);
		const stored = parseNewsletterRecord(
			await kv.get(newsletterSubscriberKvKey("friend@example.com")),
		);
		assert.ok(stored?.welcomeSentAt);
	});

	it("does not return ok when Resend rejects the welcome (no silent submitted)", async () => {
		const kv = new MemoryKv();
		const res = await handleSubscribeNewsletter(
			subscribeRequest("friend@example.com"),
			envWithKv(kv),
			ctx,
			{
				sendEmail: async () => ({ ok: false, detail: "validation_error" }),
			},
		);
		assert.equal(res.status, 502);
		const body = (await res.json()) as { error?: string };
		assert.equal(body.error, "welcome_unsent");
		const stored = parseNewsletterRecord(
			await kv.get(newsletterSubscriberKvKey("friend@example.com")),
		);
		assert.ok(stored);
		assert.equal(stored!.welcomeSentAt, undefined);
	});

	it("retries welcome for an existing KV row that never recorded a send", async () => {
		const kv = new MemoryKv();
		await kv.put(
			newsletterSubscriberKvKey("friend@example.com"),
			JSON.stringify({
				schemaVersion: 1,
				email: "friend@example.com",
				subscribedAt: "2026-08-15T00:00:00.000Z",
				locale: "en",
				unsubToken: "a".repeat(32),
			}),
		);
		let sends = 0;
		const res = await handleSubscribeNewsletter(
			subscribeRequest("friend@example.com"),
			envWithKv(kv),
			ctx,
			{
				sendEmail: async (opts) => {
					sends += 1;
					assert.equal(opts.from.includes("hello@twinsology.com"), true);
					assert.equal(opts.from.includes("restore@"), false);
					return { ok: true, id: "msg_1" };
				},
			},
		);
		assert.equal(res.status, 200);
		assert.equal(sends >= 1, true);
		const stored = parseNewsletterRecord(
			await kv.get(newsletterSubscriberKvKey("friend@example.com")),
		);
		assert.ok(stored?.welcomeSentAt);
	});

	it("skips a second letter once welcomeSentAt is set", async () => {
		const kv = new MemoryKv();
		await kv.put(
			newsletterSubscriberKvKey("friend@example.com"),
			JSON.stringify({
				schemaVersion: 1,
				email: "friend@example.com",
				subscribedAt: "2026-08-15T00:00:00.000Z",
				locale: "en",
				unsubToken: "a".repeat(32),
				welcomeSentAt: "2026-08-15T01:00:00.000Z",
			}),
		);
		let sends = 0;
		const res = await handleSubscribeNewsletter(
			subscribeRequest("friend@example.com"),
			envWithKv(kv),
			ctx,
			{
				sendEmail: async () => {
					sends += 1;
					return { ok: true, id: "should_not" };
				},
			},
		);
		assert.equal(res.status, 200);
		assert.equal(sends, 0);
	});
});
