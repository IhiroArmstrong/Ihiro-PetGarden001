/** RFC 4122 UUID version 4 (practice study studyId). */

const UUID_V4_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isCoPracticeResearchStudyId(
	value: unknown,
): value is string {
	return typeof value === "string" && UUID_V4_RE.test(value.trim());
}

export function parseBearerStudyId(request: Request): string | null {
	const auth = request.headers.get("authorization");
	if (!auth) return null;
	const match = /^Bearer\s+(\S+)/i.exec(auth.trim());
	if (!match?.[1]) return null;
	const token = match[1].trim();
	return isCoPracticeResearchStudyId(token) ? token : null;
}
