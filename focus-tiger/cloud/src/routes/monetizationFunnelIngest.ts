/**
 * Monetization funnel ingest — anonymous opt-in aggregates.
 * Stored in TIP_KV under `funnel:v1:` (never under `tip:`).
 */

import { errorJson, json } from "../lib/http";
import { funnelKvKey } from "../lib/monetizationFunnelKv";
import type { Env } from "../types";

const SCHEMA_VERSION = 1;
const MAX_EVENTS = 20;
const MAX_COUNTS = 40;
const MAX_CLIENT_ID = 80;

const ALLOWED_EVENTS = new Set([
	"support_open",
	"support_cta",
	"checkout_start",
	"checkout_complete",
	"checkout_cancel",
]);

const ALLOWED_TRACKS = new Set(["tea", "sanctuary", "membership"]);

const ALLOWED_SOURCES = new Set([
	"fab",
	"support-modal",
	"card",
	"return",
	"tip-jar",
	"sanctuary-card",
	"membership-card",
	"dev",
]);

export { funnelKvKey };

function utcDay(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) {
		return new Date().toISOString().slice(0, 10);
	}
	return d.toISOString().slice(0, 10);
}

function sanitizeCounts(raw: unknown): Record<string, number> | null {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
	const out: Record<string, number> = {};
	for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
		if (Object.keys(out).length >= MAX_COUNTS) break;
		if (typeof k !== "string" || !k) continue;
		const base = k.includes(":") ? k.slice(0, k.indexOf(":")) : k;
		if (!ALLOWED_EVENTS.has(base)) continue;
		if (k.includes(":")) {
			const track = k.slice(k.indexOf(":") + 1);
			if (!ALLOWED_TRACKS.has(track)) continue;
		}
		const n = Number(v);
		if (!Number.isFinite(n) || n <= 0) continue;
		out[k] = Math.min(Math.floor(n), 1_000_000);
	}
	return out;
}

function sanitizeEvents(raw: unknown): object[] | null {
	if (!Array.isArray(raw)) return null;
	const out: object[] = [];
	for (const row of raw.slice(-MAX_EVENTS)) {
		if (!row || typeof row !== "object" || Array.isArray(row)) continue;
		const r = row as Record<string, unknown>;
		const name = typeof r.name === "string" ? r.name : "";
		if (!ALLOWED_EVENTS.has(name)) continue;
		const track =
			r.track === "tea" || r.track === "sanctuary" || r.track === "membership"
				? r.track
				: null;
		const source =
			typeof r.source === "string" && ALLOWED_SOURCES.has(r.source)
				? r.source
				: null;
		out.push({
			at: typeof r.at === "string" ? r.at.slice(0, 40) : "",
			name,
			track,
			source,
		});
	}
	return out;
}

/**
 * POST /api/monetization-funnel-ingest
 * Body: { schemaVersion, clientId, consentedAt?, uploadedAt, counts, events }
 */
export async function handleMonetizationFunnelIngest(
	request: Request,
	env: Env,
): Promise<Response> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorJson(400, "invalid_json", "Request body must be valid JSON");
	}
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return errorJson(400, "invalid_body", "Request body must be a JSON object");
	}
	const o = body as Record<string, unknown>;

	if (o.schemaVersion !== SCHEMA_VERSION) {
		return errorJson(400, "bad_schema", "Unsupported schemaVersion");
	}
	const clientId =
		typeof o.clientId === "string" ? o.clientId.trim().slice(0, MAX_CLIENT_ID) : "";
	if (!clientId || clientId.length < 8) {
		return errorJson(400, "bad_client_id", "clientId required");
	}
	const uploadedAt =
		typeof o.uploadedAt === "string" && o.uploadedAt
			? o.uploadedAt.slice(0, 40)
			: new Date().toISOString();
	const consentedAt =
		typeof o.consentedAt === "string" && o.consentedAt
			? o.consentedAt.slice(0, 40)
			: null;

	const counts = sanitizeCounts(o.counts);
	const events = sanitizeEvents(o.events);
	if (!counts || !events) {
		return errorJson(400, "bad_payload", "counts/events invalid");
	}

	const day = utcDay(uploadedAt);
	const key = funnelKvKey(day, clientId);
	const record = {
		schemaVersion: SCHEMA_VERSION,
		clientId,
		consentedAt,
		uploadedAt,
		day,
		counts,
		events,
	};

	try {
		await env.TIP_KV.put(key, JSON.stringify(record), {
			expirationTtl: 60 * 60 * 24 * 90, // 90 days
		});
	} catch {
		return errorJson(500, "kv_write_failed", "Could not store funnel snapshot");
	}

	return json({ ok: true, key, day });
}
