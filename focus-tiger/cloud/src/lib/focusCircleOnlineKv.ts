/** Who still has the app open in a circle. Separate from sitting lanterns. */

import {
	applyCirclePresenceHeartbeat,
	applyCirclePresenceLeave,
	countCircleSittingSessions,
	type CircleSittingSessions,
} from "./focusCirclePresenceKv.ts";

/** Miss two heartbeats and the person drops off the count. */
export const FOCUS_CIRCLE_ONLINE_TTL_MS = 50_000;

export function circleOnlineKvKey(circleId: string): string {
	return `circle:v1:online:${circleId.trim()}`;
}

export function applyCircleOnlineHeartbeat(
	sessions: CircleSittingSessions,
	memberId: string,
	nowMs: number,
): CircleSittingSessions {
	return applyCirclePresenceHeartbeat(
		sessions,
		memberId,
		nowMs,
		FOCUS_CIRCLE_ONLINE_TTL_MS,
	);
}

export function applyCircleOnlineLeave(
	sessions: CircleSittingSessions,
	memberId: string,
	nowMs: number,
): CircleSittingSessions {
	return applyCirclePresenceLeave(sessions, memberId, nowMs);
}

export function countCircleOnline(
	sessions: CircleSittingSessions,
	nowMs: number,
): number {
	return countCircleSittingSessions(sessions, nowMs);
}
