/**
 * Practice-memory snapshot KV helpers (PRACTICE_BACKUP_KV only).
 */

export const PRACTICE_BACKUP_SCHEMA_VERSION = 1;
export const PRACTICE_BACKUP_MAX_BYTES = 64 * 1024;

export const PRACTICE_BACKUP_STORE_KEYS = [
	"focus-tiger.journey-log.v1",
	"focus-tiger.practice-days.v1",
	"focus-tiger.milestone-glow.v1",
	"focus-tiger.entitlement-ownership.v1",
	"focus-tiger.ritual-completions.v1",
	"focus-tiger.mustard-seed-seal.v1",
] as const;

export type PracticeBackupStoreKey =
	(typeof PRACTICE_BACKUP_STORE_KEYS)[number];

export type PracticeBackupSnapshot = {
	schemaVersion: number;
	savedAt: string;
	stores: Record<string, unknown | null>;
};

export function practiceBackupSnapshotKvKey(email: string): string {
	return `practice-backup:v1:${email.trim().toLowerCase()}`;
}

export function isPracticeBackupStoreKey(k: string): k is PracticeBackupStoreKey {
	return (PRACTICE_BACKUP_STORE_KEYS as readonly string[]).includes(k);
}

/**
 * Validate client snapshot shape. Rejects extra/missing store keys.
 */
export function parsePracticeBackupSnapshot(
	raw: unknown,
):
	| { ok: true; snapshot: PracticeBackupSnapshot }
	| { ok: false; reason: string } {
	if (!raw || typeof raw !== "object") {
		return { ok: false, reason: "snapshot must be an object" };
	}
	const o = raw as Record<string, unknown>;
	if (o.schemaVersion !== PRACTICE_BACKUP_SCHEMA_VERSION) {
		return { ok: false, reason: "unsupported schemaVersion" };
	}
	if (typeof o.savedAt !== "string" || !o.savedAt.trim()) {
		return { ok: false, reason: "savedAt required" };
	}
	if (!o.stores || typeof o.stores !== "object" || Array.isArray(o.stores)) {
		return { ok: false, reason: "stores required" };
	}
	const storesIn = o.stores as Record<string, unknown>;
	const keys = Object.keys(storesIn);
	if (keys.length !== PRACTICE_BACKUP_STORE_KEYS.length) {
		return { ok: false, reason: "stores must contain exactly whitelist keys" };
	}
	const stores: Record<string, unknown | null> = {};
	for (const key of PRACTICE_BACKUP_STORE_KEYS) {
		if (!(key in storesIn)) {
			return { ok: false, reason: `missing store key ${key}` };
		}
		stores[key] = storesIn[key] ?? null;
	}
	for (const key of keys) {
		if (!isPracticeBackupStoreKey(key)) {
			return { ok: false, reason: `unknown store key ${key}` };
		}
	}
	const snapshot: PracticeBackupSnapshot = {
		schemaVersion: PRACTICE_BACKUP_SCHEMA_VERSION,
		savedAt: o.savedAt.trim(),
		stores,
	};
	const encoded = JSON.stringify(snapshot);
	if (encoded.length > PRACTICE_BACKUP_MAX_BYTES) {
		return { ok: false, reason: "snapshot too large" };
	}
	return { ok: true, snapshot };
}

export async function putPracticeBackupSnapshot(
	kv: KVNamespace,
	email: string,
	snapshot: PracticeBackupSnapshot,
): Promise<void> {
	await kv.put(
		practiceBackupSnapshotKvKey(email),
		JSON.stringify(snapshot),
	);
}

export async function getPracticeBackupSnapshot(
	kv: KVNamespace,
	email: string,
): Promise<PracticeBackupSnapshot | null> {
	const raw = await kv.get(practiceBackupSnapshotKvKey(email));
	if (!raw) return null;
	try {
		const parsed = parsePracticeBackupSnapshot(JSON.parse(raw));
		return parsed.ok ? parsed.snapshot : null;
	} catch {
		return null;
	}
}

export async function deletePracticeBackupSnapshot(
	kv: KVNamespace,
	email: string,
): Promise<boolean> {
	const key = practiceBackupSnapshotKvKey(email);
	const existing = await kv.get(key);
	await kv.delete(key);
	return Boolean(existing);
}
