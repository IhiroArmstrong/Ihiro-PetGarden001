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
