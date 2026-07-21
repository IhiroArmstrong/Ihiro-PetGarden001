/**
 * Worker bindings. Empty for stubs; extend when KV / secrets land.
 *
 * TODO: RATE_LIMIT_KV: KVNamespace — shared rate-limit counters across isolates
 */
export interface Env {
	// Reserved for future bindings.
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
