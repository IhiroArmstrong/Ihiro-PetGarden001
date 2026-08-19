/**
 * Worker bindings for Focus Tiger cloud API.
 *
 * Secrets (wrangler secret put — never commit values):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 *   RESEND_API_KEY, RESTORE_OTP_PEPPER
 *
 * Vars / wrangler.jsonc (non-secret):
 *   STRIPE_PRICE_ID, STRIPE_SANCTUARY_PRICE_ID, STRIPE_MEMBERSHIP_PRICE_ID
 *   STRIPE_PRO_PRICE_ID reserved in docs (price_1U6EB1FuIhgJPGLiuciuX1to) — no checkout yet
 *   STRIPE_COMPANION_ADDON_PRICE_ID reserved in docs (price_1U6GnXFuIhgJPGLiNlXs0IKe) — no checkout yet
 *   Checkout success/cancel URLs, ALLOWED_ORIGIN, RESEND_FROM, NEWSLETTER_FROM
 */
export interface Env {
	TIP_KV: KVNamespace;
	SANCTUARY_KV: KVNamespace;
	MEMBERSHIP_KV: KVNamespace;
	/** Restore OTP challenges only (not entitlement records). */
	OTP_KV: KVNamespace;
	/** Practice-memory snapshot blobs (not tip/sanctuary/membership/OTP). */
	PRACTICE_BACKUP_KV: KVNamespace;
	/** Stay in touch list (email + unsub token). Not Resend Audiences. */
	NEWSLETTER_KV: KVNamespace;

	STRIPE_SECRET_KEY?: string;
	STRIPE_WEBHOOK_SECRET?: string;
	RESEND_API_KEY?: string;
	/** HMAC pepper for restore OTP hashes (never log). */
	RESTORE_OTP_PEPPER?: string;

	STRIPE_PRICE_ID?: string;
	CHECKOUT_SUCCESS_URL?: string;
	CHECKOUT_CANCEL_URL?: string;

	/** Lifetime Sanctuary Price ID (separate from tip). */
	STRIPE_SANCTUARY_PRICE_ID?: string;
	SANCTUARY_CHECKOUT_SUCCESS_URL?: string;
	SANCTUARY_CHECKOUT_CANCEL_URL?: string;

	/** Yin Membership recurring Price ID (separate from tip / sanctuary). */
	STRIPE_MEMBERSHIP_PRICE_ID?: string;
	MEMBERSHIP_CHECKOUT_SUCCESS_URL?: string;
	MEMBERSHIP_CHECKOUT_CANCEL_URL?: string;
	/** Stripe Billing Portal return URL (Membership Manage). */
	MEMBERSHIP_PORTAL_RETURN_URL?: string;

	/** Exact browser Origin allowed for CORS, or comma-separated list. */
	ALLOWED_ORIGIN?: string;
	/** Optional alias of ALLOWED_ORIGIN (comma-separated). */
	ALLOWED_ORIGINS?: string;

	/** Resend From header, e.g. "Yin <restore@twinsology.com>". */
	RESEND_FROM?: string;
	/** Newsletter welcome From — hello@ only; never fall back to RESEND_FROM. */
	NEWSLETTER_FROM?: string;
}

/** Provisional request bodies — awaiting product review of field names. */
export interface DailyMessageRequest {
	/** BCP-47 / app locale, e.g. "en" | "zh" */
	locale: string;
	/** Client local calendar day YYYY-MM-DD (daily message keying) */
	localDate: string;
}

export interface EmotionWeightRequest {
	/** EmotionController / EMOTION_BIBLE key, e.g. "Idle" | "Celebrating" */
	emotionKey: string;
	/** Session phase hint, e.g. "arrive" | "focus" | "recover" | "reflect" */
	sessionPhase: string;
}

export interface DailyMessageResponse {
	schemaVersion: number;
	locale: string;
	pool: Array<{ id: string; text: string; attribution?: string }>;
	message: string;
	variantSeed: string;
}

export interface EmotionWeightResponse {
	schemaVersion: number;
	variant: string;
	weight: number;
	riseInterruptPool: Array<{ key: string; weight: number }>;
	welcomePool: Array<{ key: string; weight: number }>;
	lightCompletePool: Array<{ key: string; weight: number }>;
	honestyLongMinMinutes: number;
}

export interface CreateCheckoutSessionResponse {
	url: string;
}

export interface VerifySupporterResponse {
	tipped: boolean;
	lastTippedAt?: string;
}
