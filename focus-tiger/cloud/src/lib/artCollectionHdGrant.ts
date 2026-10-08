/**
 * Short-lived capability for one verified art purchase.
 * The raw token is returned once. KV stores only an HMAC of it.
 */

import { findArtCollectionWork } from "./artCollectionCatalog.ts";
import { isArtPieceOwned, readArtCollection } from "./artCollectionKv.ts";

export const ART_HD_GRANT_TTL_SEC = 10 * 60;

export type ArtHdGrantRecord = {
	email: string;
	artId: string;
	hdId: string;
	receiptId: string;
	expiresAt: number;
};

function bytesToToken(bytes: Uint8Array): string {
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
	return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function artHdObjectKey(hdId: string): string {
	if (!/^hd-[a-z]{2}-\d{2}$/.test(hdId)) return "";
	return `private/art-hd/${hdId}.png`;
}

function grantKvKey(tokenHash: string): string {
	return `art-hd-grant:${tokenHash}`;
}

export function parseArtHdGrant(raw: string | null): ArtHdGrantRecord | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<ArtHdGrantRecord>;
		const email = typeof parsed.email === "string" ? parsed.email : "";
		const artId = typeof parsed.artId === "string" ? parsed.artId : "";
		const hdId = typeof parsed.hdId === "string" ? parsed.hdId : "";
		const receiptId = typeof parsed.receiptId === "string" ? parsed.receiptId : "";
		const expiresAt = Number(parsed.expiresAt);
		if (!email || !artId || !hdId || !receiptId || !Number.isFinite(expiresAt)) return null;
		return { email, artId, hdId, receiptId, expiresAt: Math.floor(expiresAt) };
	} catch {
		return null;
	}
}

export async function issueArtHdGrant(opts: {
	kv: KVNamespace;
	pepper: string;
	email: string;
	artId: string;
	receiptId: string;
	nowSec?: number;
}): Promise<{ url: string; expiresAt: number } | null> {
	const pepper = (opts.pepper || "").trim();
	const work = findArtCollectionWork(opts.artId);
	const receiptId = String(opts.receiptId || "");
	if (!pepper || !work || !receiptId.startsWith("cs_")) return null;
	const record = await readArtCollection(opts.kv, opts.email);
	const piece = record.items[work.id];
	if (!isArtPieceOwned(record, work.id) || !piece || piece.receiptId !== receiptId) {
		return null;
	}
	const tokenBytes = new Uint8Array(32);
	crypto.getRandomValues(tokenBytes);
	const token = bytesToToken(tokenBytes);
	const tokenHash = await hmacSha256Hex(pepper, `art-hd-grant:${token}`);
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const expiresAt = now + ART_HD_GRANT_TTL_SEC;
	const stored: ArtHdGrantRecord = {
		email: opts.email.trim().toLowerCase(),
		artId: work.id,
		hdId: work.hdId,
		receiptId,
		expiresAt,
	};
	await opts.kv.put(grantKvKey(tokenHash), JSON.stringify(stored), {
		expirationTtl: ART_HD_GRANT_TTL_SEC,
	});
	return { url: `/api/art-collection-hd?t=${token}`, expiresAt };
}

export async function takeArtHdGrant(opts: {
	kv: KVNamespace;
	pepper: string;
	token: string;
	nowSec?: number;
}): Promise<
	| { ok: true; grant: ArtHdGrantRecord; tokenHash: string }
	| { ok: false; reason: "misconfigured" | "invalid" | "expired" | "revoked" }
> {
	const pepper = (opts.pepper || "").trim();
	const token = String(opts.token || "").trim();
	if (!pepper) return { ok: false, reason: "misconfigured" };
	if (!token) return { ok: false, reason: "invalid" };
	const tokenHash = await hmacSha256Hex(pepper, `art-hd-grant:${token}`);
	const key = grantKvKey(tokenHash);
	const grant = parseArtHdGrant(await opts.kv.get(key));
	if (!grant) return { ok: false, reason: "invalid" };
	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	if (grant.expiresAt < now) {
		await opts.kv.delete(key);
		return { ok: false, reason: "expired" };
	}
	const record = await readArtCollection(opts.kv, grant.email);
	const piece = record.items[grant.artId];
	if (
		!isArtPieceOwned(record, grant.artId) ||
		!piece ||
		piece.receiptId !== grant.receiptId
	) {
		await opts.kv.delete(key);
		return { ok: false, reason: "revoked" };
	}
	return { ok: true, grant, tokenHash };
}

export async function consumeArtHdGrant(kv: KVNamespace, tokenHash: string): Promise<void> {
	await kv.delete(grantKvKey(tokenHash));
}
