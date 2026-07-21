import { errorJson } from "../lib/http";

/**
 * Hard-coded per-minute budget for local / single-isolate stubs.
 * TODO: move counters to Workers KV (or Durable Object) so limits are shared
 * across isolates and survive warm restarts. In-memory Map is isolate-local only.
 */
export const RATE_LIMIT_PER_MINUTE = 60;

const WINDOW_MS = 60_000;

type Bucket = {
	count: number;
	windowStart: number;
};

const buckets = new Map<string, Bucket>();

/** Prefer Bearer token; fall back to CF / proxy IP; last resort "anonymous". */
export function rateLimitKey(request: Request): string {
	const auth = request.headers.get("authorization");
	if (auth) {
		const match = /^Bearer\s+(\S+)/i.exec(auth.trim());
		if (match?.[1]) {
			return `token:${match[1]}`;
		}
	}

	const ip =
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip");

	if (ip) {
		return `ip:${ip}`;
	}

	return "anonymous";
}

/**
 * In-memory sliding fixed window: at most RATE_LIMIT_PER_MINUTE hits per key / minute.
 * Returns null if allowed; otherwise a 429 Response.
 */
export function enforceRateLimit(request: Request): Response | null {
	const key = rateLimitKey(request);
	const now = Date.now();
	let bucket = buckets.get(key);

	if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
		bucket = { count: 0, windowStart: now };
		buckets.set(key, bucket);
	}

	bucket.count += 1;

	if (bucket.count > RATE_LIMIT_PER_MINUTE) {
		const retryAfterSec = Math.max(
			1,
			Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000),
		);
		const res = errorJson(
			429,
			"rate_limited",
			`Too many requests; limit is ${RATE_LIMIT_PER_MINUTE} per minute`,
		);
		res.headers.set("retry-after", String(retryAfterSec));
		return res;
	}

	return null;
}

/** Test / local reset hook (not exposed on HTTP). */
export function __resetRateLimitForTests(): void {
	buckets.clear();
}
