/**
 * Worker bindings. Empty for stubs; extend when KV / secrets land.
 *
 * TODO: RATE_LIMIT_KV: KVNamespace — shared rate-limit counters across isolates
 *
 * Response shapes must stay aligned with docs/CLOUD_CONFIG_V1.md and
 * src/core/softScheduleConfig.js (path B — stub unwired; typecheck guards drift).
 */
export interface Env {
	// Reserved for future bindings.
}

/** Provisional request bodies — A1–A4. */
export interface DailyMessageRequest {
	/** BCP-47 / app locale, e.g. "en" | "zh" */
	locale: string;
	/** Client local calendar day YYYY-MM-DD */
	localDate: string;
	/** Optional slot; tech verify default "tech_verify" */
	slot?: string;
}

export interface EmotionWeightRequest {
	/** EmotionController key, e.g. "celebrating" | "idle" */
	emotionKey: string;
	/** Session phase hint, e.g. "arrive" | "focus" | "recover" | "reflect" | "idle" */
	sessionPhase: string;
}

/** A2: messageKey only (copy body stays in client locales). */
export interface DailyMessageResponse {
	schemaVersion: number;
	messageKey: string;
	variantSeed: string;
}

/** A4 form 2: weight table for client-side weighted pick. */
export interface EmotionWeightVariant {
	id: string;
	weight: number;
}

export interface EmotionWeightResponse {
	schemaVersion: number;
	variants: EmotionWeightVariant[];
}
