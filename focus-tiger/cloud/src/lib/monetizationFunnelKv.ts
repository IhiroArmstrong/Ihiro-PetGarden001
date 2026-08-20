/** Monetization funnel aggregate keys in TIP_KV (never under `tip:`). */

export const FUNNEL_EVENT_NAMES = [
	"support_open",
	"support_cta",
	"checkout_start",
	"checkout_complete",
	"checkout_cancel",
] as const;

export const FUNNEL_TRACKS = ["tea", "sanctuary", "membership"] as const;

export const FUNNEL_LAYOUTS = ["tea-first", "sanctuary-first"] as const;

export type FunnelLayout = (typeof FUNNEL_LAYOUTS)[number];

export function funnelKvKey(day: string, clientId: string): string {
	return `funnel:v1:${day}:${clientId}`;
}

export function parseFunnelLayout(value: unknown): FunnelLayout | null {
	return value === "tea-first" || value === "sanctuary-first" ? value : null;
}

/**
 * Count keys: name; `name:track`; `name:layout`; `name:track:layout`.
 * Keep in sync with `src/core/monetizationIntentFunnel.js`.
 */
export function isAllowedFunnelCountKey(k: string): boolean {
	if (!k) return false;
	const parts = k.split(":");
	if (parts.length < 1 || parts.length > 3) return false;
	if (!(FUNNEL_EVENT_NAMES as readonly string[]).includes(parts[0])) return false;
	if (parts.length === 1) return true;
	const secondOk =
		(FUNNEL_TRACKS as readonly string[]).includes(parts[1]) ||
		parseFunnelLayout(parts[1]) !== null;
	if (!secondOk) return false;
	if (parts.length === 2) return true;
	return (
		(FUNNEL_TRACKS as readonly string[]).includes(parts[1]) &&
		parseFunnelLayout(parts[2]) !== null
	);
}
