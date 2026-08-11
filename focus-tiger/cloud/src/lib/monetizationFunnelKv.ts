/** Monetization funnel aggregate keys in TIP_KV (never under `tip:`). */

export function funnelKvKey(day: string, clientId: string): string {
	return `funnel:v1:${day}:${clientId}`;
}
