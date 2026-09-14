/**
 * Taste-layer weight remote params (TASTE_LAYER_KV only).
 * @see docs/taste-layer-kv-changelog.md
 */

import {
	TASTE_HONESTY_LONG_MIN_MINUTES,
	TASTE_LAYER_SCHEMA_VERSION,
	TASTE_LIGHT_COMPLETE_POOL,
	TASTE_RISE_INTERRUPT_POOL,
	TASTE_WELCOME_POOL,
	type TasteWeightedEntry,
} from "./tasteLayerFreeze.ts";

export const TASTE_LAYER_CONFIG_KV_KEY = "taste-layer:v1:params";

const RISE_KEYS = new Set(["riseStretchCasual", "teaDrinking", "bookReading"]);
const WELCOME_KEYS = new Set(["magicBookReading", "nodGreeting"]);
const LIGHT_KEYS = new Set([
	"sessionComplete",
	"mindfulAcknowledge",
	"parrotEarVisit",
]);

export const TASTE_HONESTY_LONG_MIN_MIN = 1;
export const TASTE_HONESTY_LONG_MIN_MAX = 180;

export type TasteLayerConfigV1 = {
	schemaVersion: 1;
	riseInterruptPool: TasteWeightedEntry[];
	welcomePool: TasteWeightedEntry[];
	lightCompletePool: TasteWeightedEntry[];
	honestyLongMinMinutes: number;
};

function parseWeightedPool(
	raw: unknown,
	allowed: Set<string>,
): TasteWeightedEntry[] | null {
	if (!Array.isArray(raw) || raw.length !== allowed.size) return null;
	const out: TasteWeightedEntry[] = [];
	const seen = new Set<string>();
	for (const entry of raw) {
		if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
			return null;
		}
		const o = entry as Record<string, unknown>;
		const key = o.key;
		const weight = o.weight;
		if (typeof key !== "string" || !allowed.has(key) || seen.has(key)) {
			return null;
		}
		if (!Number.isFinite(weight) || Number(weight) < 0) return null;
		seen.add(key);
		out.push({ key, weight: Number(weight) });
	}
	if (seen.size !== allowed.size) return null;
	const total = out.reduce((sum, e) => sum + e.weight, 0);
	if (total <= 0) return null;
	if (out.some((e) => /celebrat/i.test(e.key))) return null;
	return out;
}

function normalizeHonestyLongMinMinutes(value: unknown): number | null {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	const floored = Math.floor(n);
	if (floored < TASTE_HONESTY_LONG_MIN_MIN) return null;
	if (floored > TASTE_HONESTY_LONG_MIN_MAX) return null;
	return floored;
}

export function parseTasteLayerConfigRecord(
	raw: string,
): TasteLayerConfigV1 | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return null;
		}
		const o = parsed as Record<string, unknown>;
		if (o.schemaVersion !== TASTE_LAYER_SCHEMA_VERSION) return null;
		const riseInterruptPool = parseWeightedPool(
			o.riseInterruptPool,
			RISE_KEYS,
		);
		const welcomePool = parseWeightedPool(o.welcomePool, WELCOME_KEYS);
		const lightCompletePool = parseWeightedPool(
			o.lightCompletePool,
			LIGHT_KEYS,
		);
		const honestyLongMinMinutes = normalizeHonestyLongMinMinutes(
			o.honestyLongMinMinutes,
		);
		if (
			!riseInterruptPool ||
			!welcomePool ||
			!lightCompletePool ||
			honestyLongMinMinutes == null
		) {
			return null;
		}
		return {
			schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
			riseInterruptPool,
			welcomePool,
			lightCompletePool,
			honestyLongMinMinutes,
		};
	} catch {
		return null;
	}
}

export function tasteLayerConfigFreeze(): TasteLayerConfigV1 {
	return {
		schemaVersion: TASTE_LAYER_SCHEMA_VERSION,
		riseInterruptPool: TASTE_RISE_INTERRUPT_POOL,
		welcomePool: TASTE_WELCOME_POOL,
		lightCompletePool: TASTE_LIGHT_COMPLETE_POOL,
		honestyLongMinMinutes: TASTE_HONESTY_LONG_MIN_MINUTES,
	};
}

export async function readTasteLayerConfig(
	kv: KVNamespace,
): Promise<TasteLayerConfigV1> {
	const raw = await kv.get(TASTE_LAYER_CONFIG_KV_KEY);
	if (!raw) return tasteLayerConfigFreeze();
	return parseTasteLayerConfigRecord(raw) ?? tasteLayerConfigFreeze();
}
