/**
 * Membership device token unit tests.
 * Run: cd focus-tiger/cloud && npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	hashMembershipDeviceToken,
	MEMBERSHIP_DEVICE_TOKEN_TTL_SEC,
	mintMembershipDeviceToken,
	membershipDeviceKvKey,
	verifyMembershipDeviceToken,
} from "./membershipDeviceToken.ts";

class MemoryKv {
	store = new Map<string, string>();
	async get(key: string): Promise<string | null> {
		return this.store.has(key) ? this.store.get(key)! : null;
	}
	async put(
		key: string,
		value: string,
		_opts?: { expirationTtl?: number },
	): Promise<void> {
		this.store.set(key, value);
	}
	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}
}

describe("membershipDeviceToken", () => {
	const pepper = "test-pepper-device";
	const email = "member@example.com";

	it("mints opaque token and verifies matching email", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_000;
		const minted = await mintMembershipDeviceToken({
			kv,
			pepper,
			email,
			subscriptionId: "sub_test",
			nowSec: now,
		});
		assert.equal(minted.ok, true);
		if (!minted.ok) return;
		assert.ok(minted.deviceToken.length >= 32);
		assert.equal(minted.email, email);
		assert.equal(minted.expiresAt, now + MEMBERSHIP_DEVICE_TOKEN_TTL_SEC);

		const tokenHash = await hashMembershipDeviceToken(pepper, minted.deviceToken);
		assert.ok(await kv.get(membershipDeviceKvKey(tokenHash)));

		const ok = await verifyMembershipDeviceToken({
			kv,
			pepper,
			email,
			deviceToken: minted.deviceToken,
			nowSec: now + 60,
		});
		assert.equal(ok.ok, true);
		if (!ok.ok) return;
		assert.equal(ok.record.subscriptionId, "sub_test");
	});

	it("rejects wrong email and expired tokens", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_000;
		const minted = await mintMembershipDeviceToken({
			kv,
			pepper,
			email,
			nowSec: now,
		});
		assert.equal(minted.ok, true);
		if (!minted.ok) return;

		const mismatch = await verifyMembershipDeviceToken({
			kv,
			pepper,
			email: "other@example.com",
			deviceToken: minted.deviceToken,
			nowSec: now + 10,
		});
		assert.equal(mismatch.ok, false);
		if (mismatch.ok) return;
		assert.equal(mismatch.reason, "email_mismatch");

		const expired = await verifyMembershipDeviceToken({
			kv,
			pepper,
			email,
			deviceToken: minted.deviceToken,
			nowSec: now + MEMBERSHIP_DEVICE_TOKEN_TTL_SEC + 1,
		});
		assert.equal(expired.ok, false);
		if (expired.ok) return;
		assert.equal(expired.reason, "expired");
	});

	it("fails mint when pepper missing", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const minted = await mintMembershipDeviceToken({
			kv,
			pepper: "",
			email,
		});
		assert.deepEqual(minted, { ok: false, reason: "misconfigured" });
	});
});
