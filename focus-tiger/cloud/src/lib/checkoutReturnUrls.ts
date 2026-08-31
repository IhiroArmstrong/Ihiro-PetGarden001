/**
 * Stripe Checkout success/cancel URLs for Web vs Electron shell.
 *
 * Web uses Worker vars (e.g. http://127.0.0.1:5173/?product=1&pro_session=…).
 * Electron opens Checkout externally; return must deep-link into the shell
 * (`focus-tiger://app`) so entitlement lands in the desktop origin storage.
 */

export const DESKTOP_CHECKOUT_ORIGIN = "focus-tiger://app";
export const DESKTOP_CHECKOUT_BRIDGE_PATH = "/checkout/desktop-return";

/**
 * @param {unknown} body Parsed JSON POST body (may be null).
 */
export function isDesktopReturnSurface(body: unknown): boolean {
	if (!body || typeof body !== "object") return false;
	return (body as { returnSurface?: unknown }).returnSurface === "desktop";
}

/**
 * Rewrite a configured Web success/cancel URL for the desktop shell.
 *
 * Stripe accepts https URLs reliably; direct `focus-tiger://` redirects from
 * Stripe often fail in the system browser. The bridge page deep-links into the
 * Electron shell with a manual fallback link.
 *
 * @param {string} webUrl Worker env template URL.
 * @param {unknown} returnSurface `desktop` when Checkout started from Electron.
 * @param {string} bridgeOrigin Worker origin, e.g. `https://focus-tiger-cloud.ihiro.workers.dev`
 */
export function resolveCheckoutReturnUrl(
	webUrl: string,
	returnSurface: unknown,
	bridgeOrigin: string,
): string {
	const trimmed = String(webUrl || "").trim();
	if (!trimmed || returnSurface !== "desktop") return trimmed;
	const origin = String(bridgeOrigin || "").trim().replace(/\/+$/, "");
	if (!origin) return trimmed;
	try {
		const parsed = new URL(trimmed);
		const bridge = new URL(DESKTOP_CHECKOUT_BRIDGE_PATH, `${origin}/`);
		bridge.search = parsed.search;
		return bridge.toString();
	} catch {
		return trimmed;
	}
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost"]);

/**
 * Loopback Vite origins only (`http://127.0.0.1:5174`). Production hosts
 * stay on Worker env URLs — never an open redirect.
 */
export function isLoopbackWebOrigin(origin: string): boolean {
	try {
		const parsed = new URL(origin);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return false;
		}
		return LOOPBACK_HOSTS.has(parsed.hostname);
	} catch {
		return false;
	}
}

export function checkoutPageOriginFromBody(body: unknown): string {
	if (!body || typeof body !== "object") return "";
	const raw = (body as { pageOrigin?: unknown }).pageOrigin;
	if (typeof raw !== "string") return "";
	return raw.trim().replace(/\/+$/, "");
}

/**
 * Keep `{CHECKOUT_SESSION_ID}` unencoded: do not round-trip through URL().
 */
export function rewriteCheckoutReturnPageOrigin(
	webUrl: string,
	pageOrigin: string,
): string {
	const trimmed = String(webUrl || "").trim();
	const origin = String(pageOrigin || "").trim().replace(/\/+$/, "");
	if (!trimmed || !origin) return trimmed;
	let templateOrigin = "";
	try {
		templateOrigin = new URL(trimmed).origin;
	} catch {
		return trimmed;
	}
	if (
		!isLoopbackWebOrigin(templateOrigin) ||
		!isLoopbackWebOrigin(origin)
	) {
		return trimmed;
	}
	if (templateOrigin === origin) return trimmed;
	if (!trimmed.startsWith(templateOrigin)) return trimmed;
	return `${origin}${trimmed.slice(templateOrigin.length)}`;
}

/**
 * Desktop → Worker HTTPS bridge. Web Vite → same loopback port as the tab.
 */
export function resolveSessionReturnUrls(
	successUrl: string,
	cancelUrl: string,
	parsedBody: unknown,
	request: Request,
): { successUrl: string; cancelUrl: string } {
	const bridgeOrigin = new URL(request.url).origin;
	if (isDesktopReturnSurface(parsedBody)) {
		return {
			successUrl: resolveCheckoutReturnUrl(
				successUrl,
				"desktop",
				bridgeOrigin,
			),
			cancelUrl: resolveCheckoutReturnUrl(cancelUrl, "desktop", bridgeOrigin),
		};
	}
	const pageOrigin = checkoutPageOriginFromBody(parsedBody);
	return {
		successUrl: rewriteCheckoutReturnPageOrigin(successUrl, pageOrigin),
		cancelUrl: rewriteCheckoutReturnPageOrigin(cancelUrl, pageOrigin),
	};
}
