/**
 * Worker bindings for Focus Tiger cloud API.
 *
 * Secrets (wrangler secret put — never commit values):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
 *
 * Vars / wrangler.jsonc (non-secret):
 *   STRIPE_PRICE_ID, CHECKOUT_SUCCESS_URL, CHECKOUT_CANCEL_URL, ALLOWED_ORIGIN
 */
export interface Env {
	TIP_KV: KVNamespace;

	STRIPE_SECRET_KEY?: string;
	STRIPE_WEBHOOK_SECRET?: string;

	STRIPE_PRICE_ID?: string;
	CHECKOUT_SUCCESS_URL?: string;
	CHECKOUT_CANCEL_URL?: string;
	/** Exact browser Origin allowed for CORS (e.g. http://127.0.0.1:5173). */
	ALLOWED_ORIGIN?: string;
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
	message: string;
	variantSeed: string;
}

export interface EmotionWeightResponse {
	variant: string;
	weight: number;
}

export interface CreateCheckoutSessionResponse {
	url: string;
}

export interface VerifySupporterResponse {
	tipped: boolean;
	lastTippedAt?: string;
}
