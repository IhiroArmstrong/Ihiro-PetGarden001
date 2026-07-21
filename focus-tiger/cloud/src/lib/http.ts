export function json(
	data: unknown,
	status = 200,
	headers: HeadersInit = {},
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			...headers,
		},
	});
}

export function errorJson(
	status: number,
	code: string,
	detail: string,
): Response {
	return json({ error: code, detail }, status);
}
