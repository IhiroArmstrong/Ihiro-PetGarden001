/**
 * Minimal Stripe REST + webhook signature helpers (no stripe npm).
 * Workers-friendly: fetch + Web Crypto HMAC-SHA256.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/** Reject webhook signatures older than this (Stripe default guidance ≈ 5 min). */
export const STRIPE_WEBHOOK_TOLERANCE_SEC = 300;

export type StripeCheckoutSession = {
	id: string;
	url: string | null;
	mode?: string;
	payment_status?: string;
	customer_email?: string | null;
	customer_details?: { email?: string | null } | null;
	metadata?: Record<string, string> | null;
};

function formBody(params: Record<string, string>): string {
	const parts: string[] = [];
	for (const [k, v] of Object.entries(params)) {
		parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
	}
	return parts.join("&");
}

export async function createTipCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}): Promise<StripeCheckoutSession> {
	return createOneTimeCheckoutSession({
		...opts,
		metadata: { product: "tip" },
	});
}

export async function createSanctuaryCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}): Promise<StripeCheckoutSession> {
	return createOneTimeCheckoutSession({
		...opts,
		metadata: { product: "sanctuary", itemId: "yin-sanctuary-lifetime" },
	});
}

async function createOneTimeCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
	metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
	const params: Record<string, string> = {
		mode: "payment",
		"line_items[0][price]": opts.priceId,
		"line_items[0][quantity]": "1",
		success_url: opts.successUrl,
		cancel_url: opts.cancelUrl,
	};
	if (opts.customerEmail) {
		params.customer_email = opts.customerEmail;
	}
	if (opts.metadata) {
		for (const [k, v] of Object.entries(opts.metadata)) {
			params[`metadata[${k}]`] = v;
		}
	}

	const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${opts.secretKey}`,
			"content-type": "application/x-www-form-urlencoded",
		},
		body: formBody(params),
	});

	const data = (await res.json()) as StripeCheckoutSession & {
		error?: { message?: string };
		metadata?: Record<string, string>;
	};
	if (!res.ok) {
		const msg = data.error?.message || `Stripe HTTP ${res.status}`;
		throw new Error(msg);
	}
	if (!data.id || !data.url) {
		throw new Error("Stripe session missing id or url");
	}
	return data;
}

/**
 * Retrieve a Checkout Session (server-side confirm for Sanctuary unlock).
 */
export async function retrieveCheckoutSession(opts: {
	secretKey: string;
	sessionId: string;
}): Promise<
	StripeCheckoutSession & {
		metadata?: Record<string, string> | null;
	}
> {
	const id = opts.sessionId.trim();
	if (!id.startsWith("cs_")) {
		throw new Error("invalid_session_id");
	}
	const res = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(id)}`, {
		method: "GET",
		headers: {
			authorization: `Bearer ${opts.secretKey}`,
		},
	});
	const data = (await res.json()) as StripeCheckoutSession & {
		error?: { message?: string };
		metadata?: Record<string, string> | null;
	};
	if (!res.ok) {
		const msg = data.error?.message || `Stripe HTTP ${res.status}`;
		throw new Error(msg);
	}
	return data;
}

function parseStripeSignatureHeader(header: string): {
	t: string;
	v1: string[];
} | null {
	const parts = header.split(",").map((p) => p.trim());
	let t = "";
	const v1: string[] = [];
	for (const part of parts) {
		const eq = part.indexOf("=");
		if (eq < 0) continue;
		const k = part.slice(0, eq);
		const v = part.slice(eq + 1);
		if (k === "t") t = v;
		else if (k === "v1") v1.push(v);
	}
	if (!t || v1.length === 0) return null;
	return { t, v1 };
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
	return [...new Uint8Array(sig)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return diff === 0;
}

/**
 * Verify Stripe-Signature header against raw body.
 * @returns true if any v1 signature matches within tolerance.
 */
export async function verifyStripeWebhookSignature(opts: {
	payload: string;
	signatureHeader: string | null;
	webhookSecret: string;
	nowSec?: number;
	toleranceSec?: number;
}): Promise<boolean> {
	if (!opts.signatureHeader) return false;
	const parsed = parseStripeSignatureHeader(opts.signatureHeader);
	if (!parsed) return false;

	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const tolerance = opts.toleranceSec ?? STRIPE_WEBHOOK_TOLERANCE_SEC;
	const ts = Number(parsed.t);
	if (!Number.isFinite(ts) || Math.abs(now - ts) > tolerance) {
		return false;
	}

	const signedPayload = `${parsed.t}.${opts.payload}`;
	const expected = await hmacSha256Hex(opts.webhookSecret, signedPayload);
	return parsed.v1.some((candidate) => timingSafeEqualHex(candidate, expected));
}

export function emailFromCheckoutSession(
	session: StripeCheckoutSession,
): string | null {
	const fromDetails = session.customer_details?.email;
	if (typeof fromDetails === "string" && fromDetails.trim()) {
		return fromDetails.trim();
	}
	if (typeof session.customer_email === "string" && session.customer_email.trim()) {
		return session.customer_email.trim();
	}
	return null;
}
