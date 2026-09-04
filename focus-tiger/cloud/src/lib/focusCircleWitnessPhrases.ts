/** Frozen phrase pool for Gentle Witness (刀 2c). Client locale keys must match. */

export const FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS = Object.freeze([
	"FOCUS_CIRCLE_WITNESS_LEAVE_1",
	"FOCUS_CIRCLE_WITNESS_LEAVE_2",
	"FOCUS_CIRCLE_WITNESS_LEAVE_3",
	"FOCUS_CIRCLE_WITNESS_LEAVE_4",
	"FOCUS_CIRCLE_WITNESS_LEAVE_5",
	"FOCUS_CIRCLE_WITNESS_LEAVE_6",
	"FOCUS_CIRCLE_WITNESS_LEAVE_7",
] as const);

export const FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS = Object.freeze([
	"FOCUS_CIRCLE_WITNESS_RESPOND_1",
	"FOCUS_CIRCLE_WITNESS_RESPOND_2",
	"FOCUS_CIRCLE_WITNESS_RESPOND_3",
	"FOCUS_CIRCLE_WITNESS_RESPOND_4",
	"FOCUS_CIRCLE_WITNESS_RESPOND_5",
] as const);

const LEAVE_SET = new Set<string>(FOCUS_CIRCLE_WITNESS_LEAVE_PHRASE_KEYS);
const RESPOND_SET = new Set<string>(FOCUS_CIRCLE_WITNESS_RESPOND_PHRASE_KEYS);

export function isWitnessLeavePhraseKey(key: string): boolean {
	return LEAVE_SET.has(key);
}

export function isWitnessRespondPhraseKey(key: string): boolean {
	return RESPOND_SET.has(key);
}
