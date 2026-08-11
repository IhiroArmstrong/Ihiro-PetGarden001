import { errorJson, json } from "../lib/http";
import type { Env } from "../types";

const KEY_PREFIX = "analytics:monetization-funnel:";
const MAX_KEYS_IN_BODY = 40;
const MAX_COUNT = 1_000_000;

type IngestBody = {
	schemaVersion?: unknown;
	installId?: unknown;
	counts?: unknown;
};

/**
 * Opt-in monetization funnel aggregates (counts only).
 * v1 storage: TIP_KV prefix (migrate to FUNNEL_KV later).
 */
export async function handleMonetizationFunnelIngest(
	request: Request,
	env: Env,
): Promise<Response> {
	let body: IngestBody;
	try {
		body = (await request.json()) as IngestBody;
	} catch {
		return errorJson(400, "invalid_json", "Body must be JSON");
	}

	if (body.schemaVersion !== 1) {
		return errorJson(400, "bad_schema", "schemaVersion must be 1");
	}
	const installId =
		typeof body.installId === "string" ? body.installId.trim() : "";
	if (!installId || installId.length > 80 || !/^[\w.-]+$/.test(installId)) {
		return errorJson(400, "bad_install_id", "installId invalid");
	}
	if (!body.counts || typeof body.counts !== "object" || Array.isArray(body.counts)) {
		return errorJson(400, "bad_counts", "counts object required");
	}

	const entries = Object.entries(body.counts as Record<string, unknown>);
	if (entries.length === 0 || entries.length > MAX_KEYS_IN_BODY) {
		return errorJson(400, "bad_counts", "counts size out of range");
	}

	/** @type {Record<string, number>} */
	const delta: Record<string, number> = {};
	for (const [k, v] of entries) {
		if (!/^[a-z0-9_.:-]{1,64}$/i.test(k)) {
			return errorJson(400, "bad_counts_key", `invalid key ${k}`);
		}
		const n = Number(v);
		if (!Number.isFinite(n) || n <= 0 || n > MAX_COUNT) {
			return errorJson(400, "bad_counts_value", `invalid value for ${k}`);
		}
		delta[k] = Math.floor(n);
	}

	const day = new Date().toISOString().slice(0, 10);
	const dayKey = `${KEY_PREFIX}day:${day}`;
	const installKey = `${KEY_PREFIX}install:${installId}`;

	const prevDayRaw = await env.TIP_KV.get(dayKey);
	let dayCounts: Record<string, number> = {};
	if (prevDayRaw) {
		try {
			const parsed = JSON.parse(prevDayRaw) as { counts?: Record<string, number> };
			if (parsed?.counts && typeof parsed.counts === "object") {
				dayCounts = { ...parsed.counts };
			}
		} catch {
			dayCounts = {};
		}
	}
	for (const [k, v] of Object.entries(delta)) {
		dayCounts[k] = Math.min(MAX_COUNT, (dayCounts[k] || 0) + v);
	}
	await env.TIP_KV.put(
		dayKey,
		JSON.stringify({ day, counts: dayCounts, updatedAt: new Date().toISOString() }),
	);

	await env.TIP_KV.put(
		installKey,
		JSON.stringify({
			installId,
			lastDelta: delta,
			updatedAt: new Date().toISOString(),
		}),
	);

	return json({ ok: true, stored: true, day });
}
