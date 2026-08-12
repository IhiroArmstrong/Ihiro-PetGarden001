/**
 * Thin Resend transactional email helper (OTP / future newsletter welcome).
 * Uses fetch — no Resend npm SDK (Workers-friendly).
 */

export type SendTransactionalEmailResult =
	| { ok: true; id?: string }
	| { ok: false; detail: string };

export async function sendTransactionalEmail(opts: {
	apiKey: string;
	from: string;
	to: string;
	subject: string;
	text: string;
}): Promise<SendTransactionalEmailResult> {
	const apiKey = (opts.apiKey || "").trim();
	const from = (opts.from || "").trim();
	const to = (opts.to || "").trim();
	if (!apiKey || !from || !to) {
		return { ok: false, detail: "resend_misconfigured" };
	}

	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				authorization: `Bearer ${apiKey}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: [to],
				subject: opts.subject,
				text: opts.text,
			}),
		});
		const data = (await res.json().catch(() => null)) as {
			id?: string;
			message?: string;
			name?: string;
		} | null;
		if (!res.ok) {
			const detail =
				(data && (data.message || data.name)) || `resend_http_${res.status}`;
			return { ok: false, detail: String(detail) };
		}
		return { ok: true, id: typeof data?.id === "string" ? data.id : undefined };
	} catch (err) {
		const detail = err instanceof Error ? err.message : "resend_fetch_failed";
		return { ok: false, detail };
	}
}

export function restoreOtpEmailCopy(opts: {
	purpose: "sanctuary" | "membership" | "practice-backup";
	code: string;
	ttlMinutes: number;
}): { subject: string; text: string } {
	if (opts.purpose === "practice-backup") {
		return {
			subject: "Practice memory backup code",
			text: [
				`Your Focus Tiger practice-memory backup code is: ${opts.code}`,
				``,
				`It expires in about ${opts.ttlMinutes} minutes.`,
				`If you did not request this, you can ignore this email.`,
			].join("\n"),
		};
	}
	const product =
		opts.purpose === "sanctuary" ? "Yin's Sanctuary" : "Yin Membership";
	return {
		subject: `${product} restore code`,
		text: [
			`Your ${product} restore code is: ${opts.code}`,
			``,
			`It expires in about ${opts.ttlMinutes} minutes.`,
			`If you did not request this, you can ignore this email.`,
		].join("\n"),
	};
}
