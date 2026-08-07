import type { Env } from "../types";

/** Resolve allowed Origin for browser calls (not webhook). */
export function resolveAllowedOrigin(env: Env, request: Request): string | null {
	const configured = (env.ALLOWED_ORIGIN || "").trim();
	const requestOrigin = request.headers.get("origin");
	if (!configured) {
		// Dev convenience: echo request Origin when unset (local wrangler).
		return requestOrigin;
	}
	if (requestOrigin && requestOrigin === configured) {
		return configured;
	}
	// Non-browser (curl) or same-origin tooling — still advertise configured origin.
	return configured;
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
