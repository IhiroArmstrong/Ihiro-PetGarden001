/**
 * In-memory KV stub + restore OTP unit tests.
 * Run: cd focus-tiger/cloud && npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	consumeRestoreOtp,
	hashRestoreOtpCode,
	issueRestoreOtp,
	parseRestoreOtpRecord,
	RESTORE_OTP_MAX_ATTEMPTS,
	RESTORE_OTP_RESEND_COOLDOWN_SEC,
	restoreOtpKey,
} from "./restoreOtp.ts";

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

describe("restoreOtp", () => {
	const pepper = "test-pepper";
	const email = "tea@example.com";
	const purpose = "sanctuary" as const;

	it("issues hashed challenge and consumes matching code once", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_000;
		const issued = await issueRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			nowSec: now,
		});
		assert.equal(issued.ok, true);
		if (!issued.ok) return;
		assert.match(issued.code, /^\d{6}$/);
		const raw = await kv.get(restoreOtpKey(purpose, email));
		const rec = parseRestoreOtpRecord(raw);
		assert.ok(rec);
		assert.equal(rec!.codeHash.includes(issued.code), false);
		const expectedHash = await hashRestoreOtpCode({
			pepper,
			purpose,
			email,
			code: issued.code,
		});
		assert.equal(rec!.codeHash, expectedHash);

		const ok = await consumeRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			code: issued.code,
			nowSec: now + 10,
		});
		assert.deepEqual(ok, { ok: true });
		assert.equal(await kv.get(restoreOtpKey(purpose, email)), null);

		const again = await consumeRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			code: issued.code,
			nowSec: now + 11,
		});
		assert.equal(again.ok, false);
	});

	it("rejects wrong code and locks after max attempts", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_100;
		const issued = await issueRestoreOtp({
			kv,
			pepper,
			purpose: "membership",
			email,
			nowSec: now,
		});
		assert.equal(issued.ok, true);
		if (!issued.ok) return;

		for (let i = 0; i < RESTORE_OTP_MAX_ATTEMPTS - 1; i++) {
			const r = await consumeRestoreOtp({
				kv,
				pepper,
				purpose: "membership",
				email,
				code: "000000",
				nowSec: now + i + 1,
			});
			assert.equal(r.ok, false);
		}
		const last = await consumeRestoreOtp({
			kv,
			pepper,
			purpose: "membership",
			email,
			code: "000000",
			nowSec: now + 20,
		});
		assert.equal(last.ok, false);
		assert.equal(await kv.get(restoreOtpKey("membership", email)), null);
	});

	it("enforces resend cooldown", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_200;
		const first = await issueRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			nowSec: now,
		});
		assert.equal(first.ok, true);
		const second = await issueRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			nowSec: now + RESTORE_OTP_RESEND_COOLDOWN_SEC - 1,
		});
		assert.deepEqual(second, { ok: false, reason: "cooldown" });
		const third = await issueRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			nowSec: now + RESTORE_OTP_RESEND_COOLDOWN_SEC,
		});
		assert.equal(third.ok, true);
	});

	it("rejects expired code", async () => {
		const kv = new MemoryKv() as unknown as KVNamespace;
		const now = 1_700_000_300;
		const issued = await issueRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			nowSec: now,
		});
		assert.equal(issued.ok, true);
		if (!issued.ok) return;
		const r = await consumeRestoreOtp({
			kv,
			pepper,
			purpose,
			email,
			code: issued.code,
			nowSec: now + 601,
		});
		assert.deepEqual(r, { ok: false, reason: "invalid_or_expired_code" });
	});
});
