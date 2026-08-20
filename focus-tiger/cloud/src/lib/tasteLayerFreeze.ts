export const TASTE_LAYER_SCHEMA_VERSION = 1 as const;

export type TasteWeightedEntry = { key: string; weight: number };

/** Local fallback freeze (2026-08-18). Must match sceneAnimationDispatcher.js. */
export const TASTE_RISE_INTERRUPT_POOL: TasteWeightedEntry[] = [
	{ key: "riseStretchCasual", weight: 60 },
	{ key: "teaDrinking", weight: 25 },
	{ key: "bookReading", weight: 15 },
];

export const TASTE_WELCOME_POOL: TasteWeightedEntry[] = [
	{ key: "magicBookReading", weight: 60 },
	{ key: "nodGreeting", weight: 40 },
];

export const TASTE_LIGHT_COMPLETE_POOL: TasteWeightedEntry[] = [
	{ key: "sessionComplete", weight: 70 },
	{ key: "mindfulAcknowledge", weight: 30 },
	{ key: "parrotEarVisit", weight: 8 },
];

export const TASTE_HONESTY_LONG_MIN_MINUTES = 30;
