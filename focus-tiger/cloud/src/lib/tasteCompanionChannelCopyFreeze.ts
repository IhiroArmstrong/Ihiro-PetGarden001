import pack from "../../../content/companion-channel-copy/en.json" with { type: "json" };
import type { CompanionChannelCopyResponse } from "../types";

export const COMPANION_CHANNEL_COPY_SCHEMA_VERSION = 1 as const;

type PackLine = {
	id?: unknown;
	text?: unknown;
	reviewed?: unknown;
	reviewer?: unknown;
	reviewerType?: unknown;
	reviewedOn?: unknown;
	contentHash?: unknown;
};

type PackChannel = {
	channelId?: unknown;
	subtypeId?: unknown;
	anchorId?: unknown;
	lines?: unknown;
};

type Pack = {
	schemaVersion?: unknown;
	locale?: unknown;
	overlayLive?: unknown;
	channels?: unknown;
};

const ALLOWED_CHANNELS = new Set([
	"session-end:observed-minutes",
	"awaken-invite:pause",
	"awaken-invite:extend",
	"refocus:acknowledge",
	"moment-whisper:arrive",
]);

function isPublishableLine(line: PackLine): boolean {
	return (
		line.reviewed === true &&
		String(line.reviewer || "").trim().length > 0 &&
		String(line.reviewerType || "").trim().length > 0 &&
		String(line.reviewedOn || "").trim().length > 0 &&
		String(line.contentHash || "").trim().length > 0 &&
		typeof line.id === "string" &&
		line.id.trim().length > 0 &&
		typeof line.text === "string" &&
		line.text.trim().length > 0
	);
}

/**
 * Deploy surface: only reviewed rows with reviewer name + hash fields.
 * overlayLive stays false until a written deploy.
 */
export function buildCompanionChannelCopyPayload(): CompanionChannelCopyResponse | null {
	const raw = pack as Pack;
	if (raw.schemaVersion !== COMPANION_CHANNEL_COPY_SCHEMA_VERSION) return null;
	if (raw.locale !== "en") return null;
	if (!Array.isArray(raw.channels)) return null;

	const channels: CompanionChannelCopyResponse["companionChannelCopy"]["channels"] =
		[];
	for (const channel of raw.channels as PackChannel[]) {
		const channelId = String(channel.channelId || "");
		const subtypeId = String(channel.subtypeId || "");
		const key = `${channelId}:${subtypeId}`;
		if (!ALLOWED_CHANNELS.has(key)) return null;
		const linesRaw = Array.isArray(channel.lines) ? channel.lines : [];
		const lines = [];
		for (const line of linesRaw as PackLine[]) {
			if (!isPublishableLine(line)) continue;
			lines.push({
				id: String(line.id),
				text: String(line.text),
				reviewed: true as const,
				reviewer: String(line.reviewer).trim(),
				reviewerType: String(line.reviewerType).trim(),
				reviewedOn: String(line.reviewedOn).trim(),
				contentHash: String(line.contentHash).trim(),
			});
		}
		if (lines.length === 0) return null;
		channels.push({
			channelId,
			subtypeId,
			anchorId: String(channel.anchorId || ""),
			lines,
		});
	}
	if (channels.length !== ALLOWED_CHANNELS.size) return null;

	return {
		schemaVersion: COMPANION_CHANNEL_COPY_SCHEMA_VERSION,
		locale: "en",
		overlayLive: false,
		companionChannelCopy: { channels },
		variantSeed: channels[0]?.lines[0]?.id ?? "0",
	};
}
