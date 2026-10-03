/**
 * Practice-memory snapshot KV helpers (PRACTICE_BACKUP_KV only).
 */

export const PRACTICE_BACKUP_SCHEMA_VERSION = 2;

/** Legacy cloud snapshot (6 keys). Read still accepted. */
export const PRACTICE_BACKUP_V1_STORE_KEYS = [
	"focus-tiger.journey-log.v1",
	"focus-tiger.practice-days.v1",
	"focus-tiger.milestone-glow.v1",
	"focus-tiger.entitlement-ownership.v1",
	"focus-tiger.ritual-completions.v1",
	"focus-tiger.mustard-seed-seal.v1",
] as const;

export const PRACTICE_BACKUP_V2_STORE_KEYS = [
	...PRACTICE_BACKUP_V1_STORE_KEYS,
	"focus-tiger.lotus-pond.v1",
	"focus-tiger.growth-journey-stage.v1",
] as const;

export const PRACTICE_BACKUP_STORE_KEYS = PRACTICE_BACKUP_V2_STORE_KEYS;

export const PRACTICE_BACKUP_MAX_BYTES = 64 * 1024;

export type PracticeBackupStoreKey =
	(typeof PRACTICE_BACKUP_V2_STORE_KEYS)[number];

export type PracticeBackupSnapshot = {
	schemaVersion: number;
	savedAt: string;
	stores: Record<string, unknown | null>;
};

export function practiceBackupStoreKeysForSchemaVersion(
	schemaVersion: number,
): readonly string[] | null {
	if (schemaVersion === 1) return PRACTICE_BACKUP_V1_STORE_KEYS;
	if (schemaVersion === PRACTICE_BACKUP_SCHEMA_VERSION) {
		return PRACTICE_BACKUP_V2_STORE_KEYS;
	}
	return null;
}

export function practiceBackupSnapshotKvKey(email: string): string {
	return `practice-backup:v1:${email.trim().toLowerCase()}`;
}

export function isPracticeBackupStoreKey(k: string): k is PracticeBackupStoreKey {
	return (PRACTICE_BACKUP_V2_STORE_KEYS as readonly string[]).includes(k);
}

/**
 * Validate client snapshot shape. Rejects extra/missing store keys.
 * Accepts cloud schema v1 (6 keys) and v2 (8 keys).
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
	const schemaVersion = o.schemaVersion;
	if (typeof schemaVersion !== "number") {
		return { ok: false, reason: "unsupported schemaVersion" };
	}
	const expectedKeys = practiceBackupStoreKeysForSchemaVersion(schemaVersion);
	if (!expectedKeys) {
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
	if (keys.length !== expectedKeys.length) {
		return { ok: false, reason: "stores must contain exactly whitelist keys" };
	}
	const stores: Record<string, unknown | null> = {};
	for (const key of expectedKeys) {
		if (!(key in storesIn)) {
			return { ok: false, reason: `missing store key ${key}` };
		}
		stores[key] = storesIn[key] ?? null;
	}
	for (const key of keys) {
		if (!expectedKeys.includes(key)) {
			return { ok: false, reason: `unknown store key ${key}` };
		}
	}
	const snapshot: PracticeBackupSnapshot = {
		schemaVersion,
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
