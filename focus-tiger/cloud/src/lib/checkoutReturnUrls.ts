/**
 * Stripe Checkout success/cancel URLs for Web vs Electron shell.
 *
 * Web uses Worker vars (e.g. http://127.0.0.1:5173/?product=1&pro_session=…).
 * Electron opens Checkout externally; return must deep-link into the shell
 * (`focus-tiger://app`) so entitlement lands in the desktop origin storage.
 */

export const DESKTOP_CHECKOUT_ORIGIN = "focus-tiger://app";

/**
 * @param {unknown} body Parsed JSON POST body (may be null).
 */
export function isDesktopReturnSurface(body: unknown): boolean {
	if (!body || typeof body !== "object") return false;
	return (body as { returnSurface?: unknown }).returnSurface === "desktop";
}

/**
 * Rewrite a configured Web success/cancel URL for the desktop custom protocol.
 *
 * @param {string} webUrl Worker env template URL.
 * @param {unknown} returnSurface `desktop` when Checkout started from Electron.
 */
export function resolveCheckoutReturnUrl(
	webUrl: string,
	returnSurface: unknown,
): string {
	const trimmed = String(webUrl || "").trim();
	if (!trimmed || returnSurface !== "desktop") return trimmed;
	try {
		const parsed = new URL(trimmed);
		const tail = `${parsed.pathname}${parsed.search}${parsed.hash}`;
		return `${DESKTOP_CHECKOUT_ORIGIN}${tail.startsWith("/") ? tail : `/${tail}`}`;
	} catch {
		return trimmed.replace(/^https?:\/\/[^/?#]+/, DESKTOP_CHECKOUT_ORIGIN);
	}
}
