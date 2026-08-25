/**
 * Minimal Stripe REST + webhook signature helpers (no stripe npm).
 * Workers-friendly: fetch + Web Crypto HMAC-SHA256.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/** Reject webhook signatures older than this (Stripe default guidance ≈ 5 min). */
export const STRIPE_WEBHOOK_TOLERANCE_SEC = 300;

export type StripeCheckoutMode = "payment" | "subscription";

export type StripeCheckoutSession = {
	id: string;
	url: string | null;
	mode?: string;
	payment_status?: string;
	subscription?: string | { id?: string } | null;
	customer_email?: string | null;
	customer_details?: { email?: string | null } | null;
	metadata?: Record<string, string> | null;
};

export type StripeSubscriptionItem = {
	id?: string;
	/** Basil+ (e.g. 2025-03-31 / 2026-*.dahlia): period lives on the item, not the Subscription. */
	current_period_end?: number;
	current_period_start?: number;
	price?: { id?: string } | null;
};

export type StripeSubscription = {
	id: string;
	status?: string;
	/** Pre-Basil API versions only; removed on Subscription in Basil+. */
	current_period_end?: number;
	cancel_at_period_end?: boolean;
	customer?: string | { id?: string; email?: string | null } | null;
	metadata?: Record<string, string> | null;
	items?: {
		data?: Array<StripeSubscriptionItem | null> | null;
	} | null;
};

export type StripeCustomer = {
	id: string;
	email?: string | null;
};

export type StripeInvoice = {
	id?: string;
	subscription?: string | { id?: string } | null;
	customer_email?: string | null;
	customer?: string | { id?: string; email?: string | null } | null;
	attempt_count?: number;
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
	return createCheckoutSession({
		...opts,
		mode: "payment",
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
	return createCheckoutSession({
		...opts,
		mode: "payment",
		metadata: { product: "sanctuary", itemId: "yin-sanctuary-lifetime" },
	});
}

export async function createMembershipCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}): Promise<StripeCheckoutSession> {
	const membershipMeta = {
		product: "membership",
		planId: "yin-membership",
	};
	return createCheckoutSession({
		...opts,
		mode: "subscription",
		metadata: membershipMeta,
		/** Copied onto the Subscription so invoice/subscription webhooks can identify product. */
		subscriptionMetadata: membershipMeta,
	});
}

export async function createProCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}): Promise<StripeCheckoutSession> {
	const proMeta = {
		product: "pro",
		planId: "focus-tiger-pro",
	};
	return createCheckoutSession({
		...opts,
		mode: "subscription",
		metadata: proMeta,
		subscriptionMetadata: proMeta,
	});
}

export async function createCompanionAddonCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
}): Promise<StripeCheckoutSession> {
	return createCheckoutSession({
		...opts,
		mode: "payment",
		metadata: {
			product: "companion-addon",
			itemId: "companion.addon.lifetime",
		},
	});
}

/**
 * Shared Checkout Session create — Tip/Sanctuary use payment; Membership uses subscription.
 */
export async function createCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	mode: StripeCheckoutMode;
	customerEmail?: string;
	metadata?: Record<string, string>;
	/** When mode=subscription, written to subscription_data[metadata][…]. */
	subscriptionMetadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
	const params: Record<string, string> = {
		mode: opts.mode,
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
	if (opts.mode === "subscription" && opts.subscriptionMetadata) {
		for (const [k, v] of Object.entries(opts.subscriptionMetadata)) {
			params[`subscription_data[metadata][${k}]`] = v;
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

/** @deprecated Use createCheckoutSession — kept name for call-site clarity in history. */
export async function createOneTimeCheckoutSession(opts: {
	secretKey: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
	customerEmail?: string;
	metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
	return createCheckoutSession({
		...opts,
		mode: "payment",
	});
}

/**
 * Retrieve a Checkout Session (server-side confirm for Sanctuary / Membership).
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

/**
 * Retrieve a Subscription (period end + status for Membership confirm).
 */
export async function retrieveSubscription(opts: {
	secretKey: string;
	subscriptionId: string;
}): Promise<StripeSubscription> {
	const id = opts.subscriptionId.trim();
	if (!id.startsWith("sub_")) {
		throw new Error("invalid_subscription_id");
	}
	const res = await fetch(
		`${STRIPE_API}/subscriptions/${encodeURIComponent(id)}`,
		{
			method: "GET",
			headers: {
				authorization: `Bearer ${opts.secretKey}`,
			},
		},
	);
	const data = (await res.json()) as StripeSubscription & {
		error?: { message?: string };
	};
	if (!res.ok) {
		const msg = data.error?.message || `Stripe HTTP ${res.status}`;
		throw new Error(msg);
	}
	if (!data.id) {
		throw new Error("Stripe subscription missing id");
	}
	return data;
}

export function subscriptionIdFromCheckoutSession(
	session: StripeCheckoutSession,
): string | null {
	const raw = session.subscription;
	if (typeof raw === "string" && raw.startsWith("sub_")) return raw;
	if (raw && typeof raw === "object" && typeof raw.id === "string") {
		return raw.id.startsWith("sub_") ? raw.id : null;
	}
	return null;
}

/**
 * Resolve billing period end for Membership KV.
 * Stripe Basil+ (webhook API `2026-07-29.dahlia` etc.) removed top-level
 * `subscription.current_period_end`; it lives on `items.data[].current_period_end`.
 * Prefer top-level when present (older API), else max item end (multi-price safe).
 */
export function periodEndsAtFromSubscription(
	sub: StripeSubscription,
): string | null {
	const top = Number(sub.current_period_end);
	if (Number.isFinite(top) && top > 0) {
		return new Date(top * 1000).toISOString();
	}
	let max = 0;
	const items = sub.items?.data;
	if (Array.isArray(items)) {
		for (const item of items) {
			const end = Number(item?.current_period_end);
			if (Number.isFinite(end) && end > max) max = end;
		}
	}
	if (max <= 0) return null;
	return new Date(max * 1000).toISOString();
}

export function isActiveMembershipSubscriptionStatus(
	status: string | undefined | null,
): boolean {
	return status === "active" || status === "trialing";
}

export function isPastDueMembershipSubscriptionStatus(
	status: string | undefined | null,
): boolean {
	return status === "past_due" || status === "unpaid";
}

export function subscriptionIdFromInvoice(
	invoice: StripeInvoice,
): string | null {
	const raw = invoice.subscription;
	if (typeof raw === "string" && raw.startsWith("sub_")) return raw;
	if (raw && typeof raw === "object" && typeof raw.id === "string") {
		return raw.id.startsWith("sub_") ? raw.id : null;
	}
	return null;
}

export function customerIdFromStripeObject(obj: {
	customer?: string | { id?: string } | null;
}): string | null {
	const raw = obj.customer;
	if (typeof raw === "string" && raw.startsWith("cus_")) return raw;
	if (raw && typeof raw === "object" && typeof raw.id === "string") {
		return raw.id.startsWith("cus_") ? raw.id : null;
	}
	return null;
}

export function isMembershipProductMetadata(
	metadata: Record<string, string> | null | undefined,
): boolean {
	return metadata?.product === "membership";
}

export function isProProductMetadata(
	metadata: Record<string, string> | null | undefined,
): boolean {
	return metadata?.product === "pro";
}

export function isSubscriptionProductMetadata(
	metadata: Record<string, string> | null | undefined,
): boolean {
	return (
		isMembershipProductMetadata(metadata) || isProProductMetadata(metadata)
	);
}

/**
 * Retrieve a Customer (email for subscription/invoice webhooks).
 */
export async function retrieveCustomer(opts: {
	secretKey: string;
	customerId: string;
}): Promise<StripeCustomer> {
	const id = opts.customerId.trim();
	if (!id.startsWith("cus_")) {
		throw new Error("invalid_customer_id");
	}
	const res = await fetch(
		`${STRIPE_API}/customers/${encodeURIComponent(id)}`,
		{
			method: "GET",
			headers: {
				authorization: `Bearer ${opts.secretKey}`,
			},
		},
	);
	const data = (await res.json()) as StripeCustomer & {
		error?: { message?: string };
	};
	if (!res.ok) {
		const msg = data.error?.message || `Stripe HTTP ${res.status}`;
		throw new Error(msg);
	}
	if (!data.id) {
		throw new Error("Stripe customer missing id");
	}
	return data;
}

/**
 * Best-effort email from a Subscription object (+ optional Customer retrieve).
 */
export async function emailFromSubscription(opts: {
	secretKey: string;
	subscription: StripeSubscription;
}): Promise<string | null> {
	const nested = opts.subscription.customer;
	if (nested && typeof nested === "object") {
		if (typeof nested.email === "string" && nested.email.trim()) {
			return nested.email.trim();
		}
	}
	const customerId = customerIdFromStripeObject(opts.subscription);
	if (!customerId) return null;
	try {
		const customer = await retrieveCustomer({
			secretKey: opts.secretKey,
			customerId,
		});
		if (typeof customer.email === "string" && customer.email.trim()) {
			return customer.email.trim();
		}
	} catch {
		return null;
	}
	return null;
}

/**
 * Create a Stripe Billing Portal session URL for subscription self-serve.
 */
export async function createBillingPortalSession(opts: {
	secretKey: string;
	customerId: string;
	returnUrl: string;
}): Promise<{ id: string; url: string }> {
	const customerId = opts.customerId.trim();
	const returnUrl = opts.returnUrl.trim();
	if (!customerId.startsWith("cus_")) {
		throw new Error("invalid_customer_id");
	}
	if (!returnUrl) {
		throw new Error("missing_return_url");
	}
	const body = [
		`customer=${encodeURIComponent(customerId)}`,
		`return_url=${encodeURIComponent(returnUrl)}`,
	].join("&");
	const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${opts.secretKey}`,
			"content-type": "application/x-www-form-urlencoded",
		},
		body,
	});
	const data = (await res.json()) as {
		id?: string;
		url?: string;
		error?: { message?: string };
	};
	if (!res.ok) {
		throw new Error(data.error?.message || `Stripe HTTP ${res.status}`);
	}
	if (!data.id || !data.url) {
		throw new Error("Stripe portal session missing id or url");
	}
	return { id: data.id, url: data.url };
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

export type StripeWebhookVerifyFailureReason =
	| "missing_header"
	| "malformed_header"
	| "timestamp_out_of_tolerance"
	| "bad_signature";

export type StripeWebhookVerifyResult =
	| { ok: true }
	| { ok: false; reason: StripeWebhookVerifyFailureReason };

/**
 * Verify Stripe-Signature header against raw body (detailed result for logging).
 */
export async function verifyStripeWebhookSignatureDetailed(opts: {
	payload: string;
	signatureHeader: string | null;
	webhookSecret: string;
	nowSec?: number;
	toleranceSec?: number;
}): Promise<StripeWebhookVerifyResult> {
	if (!opts.signatureHeader) {
		return { ok: false, reason: "missing_header" };
	}
	const parsed = parseStripeSignatureHeader(opts.signatureHeader);
	if (!parsed) {
		return { ok: false, reason: "malformed_header" };
	}

	const now = opts.nowSec ?? Math.floor(Date.now() / 1000);
	const tolerance = opts.toleranceSec ?? STRIPE_WEBHOOK_TOLERANCE_SEC;
	const ts = Number(parsed.t);
	if (!Number.isFinite(ts) || Math.abs(now - ts) > tolerance) {
		return { ok: false, reason: "timestamp_out_of_tolerance" };
	}

	const signedPayload = `${parsed.t}.${opts.payload}`;
	const expected = await hmacSha256Hex(opts.webhookSecret, signedPayload);
	const match = parsed.v1.some((candidate) =>
		timingSafeEqualHex(candidate, expected),
	);
	if (!match) {
		return { ok: false, reason: "bad_signature" };
	}
	return { ok: true };
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
	const result = await verifyStripeWebhookSignatureDetailed(opts);
	return result.ok;
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
