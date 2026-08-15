/**
 * Newsletter KV contract tests.
 * Run: cd focus-tiger/cloud && npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	generateUnsubscribeToken,
	markNewsletterWelcomeSent,
	newsletterSubscriberKvKey,
	newsletterUnsubKvKey,
	newsletterUnsubscribeUrl,
	newsletterWelcomeStillDue,
	parseNewsletterRecord,
	readNewsletterSubscriber,
	removeNewsletterSubscriberByToken,
	upsertNewsletterSubscriber,
} from "./newsletterKv.ts";

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

describe("parseNewsletterRecord", () => {
	it("accepts v1 record and rejects junk", () => {
		const ok = parseNewsletterRecord(
			JSON.stringify({
				schemaVersion: 1,
				email: "Friend@Example.COM",
				subscribedAt: "2026-08-13T00:00:00.000Z",
				locale: "ja",
				unsubToken: "a".repeat(32),
			}),
		);
		assert.ok(ok);
		assert.equal(ok!.email, "friend@example.com");
		assert.equal(ok!.locale, "ja");
		assert.equal(ok!.welcomeSentAt, undefined);
		const withSend = parseNewsletterRecord(
			JSON.stringify({
				schemaVersion: 1,
				email: "a@b.co",
				subscribedAt: "2026-08-13T00:00:00.000Z",
				unsubToken: "a".repeat(32),
				welcomeSentAt: "2026-08-15T12:00:00.000Z",
			}),
		);
		assert.equal(withSend?.welcomeSentAt, "2026-08-15T12:00:00.000Z");
		assert.equal(parseNewsletterRecord(null), null);
		assert.equal(
			parseNewsletterRecord(
				JSON.stringify({
					schemaVersion: 1,
					email: "a@b.co",
					subscribedAt: "2026-08-13T00:00:00.000Z",
					unsubToken: "short",
				}),
			),
			null,
		);
	});
});

describe("upsert + unsubscribe", () => {
	it("creates once, idempotent second subscribe keeps token", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const first = await upsertNewsletterSubscriber({
			kv,
			email: " Yin@Example.com ",
			locale: "en",
			token: "t".repeat(32),
			nowIso: "2026-08-13T00:00:00.000Z",
		});
		assert.equal(first.created, true);
		assert.equal(first.record.email, "yin@example.com");
		assert.equal(
			await kv.get(newsletterSubscriberKvKey("yin@example.com")),
			JSON.stringify(first.record),
		);
		assert.equal(
			await kv.get(newsletterUnsubKvKey("t".repeat(32))),
			JSON.stringify({ email: "yin@example.com" }),
		);

		const second = await upsertNewsletterSubscriber({
			kv,
			email: "yin@example.com",
			locale: "ja",
			token: "other-token-should-not-apply-xxxxxxxx",
		});
		assert.equal(second.created, false);
		assert.equal(second.record.unsubToken, "t".repeat(32));
		assert.equal(second.record.locale, "en");
		assert.equal(newsletterWelcomeStillDue(first.record), true);
	});

	it("markNewsletterWelcomeSent writes welcomeSentAt without rotating token", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		await upsertNewsletterSubscriber({
			kv,
			email: "yin@example.com",
			token: "t".repeat(32),
		});
		const marked = await markNewsletterWelcomeSent({
			kv,
			email: "yin@example.com",
			nowIso: "2026-08-15T12:00:00.000Z",
		});
		assert.equal(marked?.welcomeSentAt, "2026-08-15T12:00:00.000Z");
		assert.equal(marked?.unsubToken, "t".repeat(32));
		assert.equal(newsletterWelcomeStillDue(marked!), false);
	});

	it("remove by token deletes both keys", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const token = "u".repeat(32);
		await upsertNewsletterSubscriber({
			kv,
			email: "leave@example.com",
			token,
		});
		const gone = await removeNewsletterSubscriberByToken(kv, token);
		assert.deepEqual(gone, { removed: true, email: "leave@example.com" });
		assert.equal(await readNewsletterSubscriber(kv, "leave@example.com"), null);
		assert.equal(await kv.get(newsletterUnsubKvKey(token)), null);
		const again = await removeNewsletterSubscriberByToken(kv, token);
		assert.equal(again.removed, false);
	});
});

describe("unsubscribe URL + token", () => {
	it("builds origin-relative unsubscribe URL", () => {
		assert.equal(
			newsletterUnsubscribeUrl({
				origin: "https://focus-tiger-cloud.ihiro.workers.dev/",
				token: "ab/c",
			}),
			"https://focus-tiger-cloud.ihiro.workers.dev/api/newsletter/unsubscribe?token=ab%2Fc",
		);
	});

	it("generateUnsubscribeToken is 64 hex chars", () => {
		const t = generateUnsubscribeToken();
		assert.match(t, /^[0-9a-f]{64}$/);
		assert.notEqual(generateUnsubscribeToken(), t);
	});
});
