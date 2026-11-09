/**
 * Plan A option 1: new Pro / companion add-on checkout stays off unless explicitly enabled.
 * Missing or unreadable env → refuse (fail closed).
 */
import { errorJson } from "./http";

export const PLAN_A_NEW_CHECKOUT_ERROR = "plan_a_new_checkout_disabled";

/** @param {{ PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED?: string }} env */
export function isPlanAOption1NewCheckoutDisabled(
	env: { PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED?: string },
): boolean {
	try {
		const raw = env?.PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED;
		if (raw === "true" || raw === "1") return false;
		return true;
	} catch {
		return true;
	}
}

export function planAOption1NewCheckoutDisabledJson() {
	return errorJson(
		410,
		PLAN_A_NEW_CHECKOUT_ERROR,
		"New Pro and companion add-on checkout are not open right now.",
	);
}
