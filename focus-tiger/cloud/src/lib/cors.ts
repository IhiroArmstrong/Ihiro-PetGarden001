import type { Env } from "../types";

/** Parse comma-separated ALLOWED_ORIGIN / ALLOWED_ORIGINS. */
export function parseAllowedOrigins(configured: string): string[] {
	return String(configured || "")
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
}

/** Resolve allowed Origin for browser calls (not webhook). */
export function resolveAllowedOrigin(env: Env, request: Request): string | null {
	const configured = (env.ALLOWED_ORIGIN || env.ALLOWED_ORIGINS || "").trim();
	const requestOrigin = request.headers.get("origin");
	if (!configured) {
		// Dev convenience: echo request Origin when unset (local wrangler).
		return requestOrigin;
	}
	const allowed = parseAllowedOrigins(configured);
	if (requestOrigin && allowed.includes(requestOrigin)) {
		return requestOrigin;
	}
	if (!requestOrigin && allowed.length > 0) {
		return allowed[0];
	}
	return null;
}

export function corsHeaders(
	origin: string | null,
	extra: HeadersInit = {},
): Headers {
	const h = new Headers(extra);
	if (origin) {
		h.set("access-control-allow-origin", origin);
		h.set("vary", "Origin");
	}
	h.set("access-control-allow-methods", "POST, OPTIONS");
	h.set(
		"access-control-allow-headers",
		"content-type, authorization",
	);
	h.set("access-control-max-age", "86400");
	return h;
}

export function withCors(response: Response, origin: string | null): Response {
	if (!origin) return response;
	const headers = new Headers(response.headers);
	headers.set("access-control-allow-origin", origin);
	headers.set("vary", "Origin");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export function preflightResponse(origin: string | null): Response {
	return new Response(null, {
		status: 204,
		headers: corsHeaders(origin),
	});
}
