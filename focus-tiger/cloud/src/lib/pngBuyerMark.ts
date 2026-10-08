/**
 * Writes a purchase receipt into PNG file info (tEXt).
 * The pixels stay unchanged. The mark is for matching an order, not for blocking viewing.
 */

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function crc32(bytes: Uint8Array): number {
	let c = ~0;
	for (let i = 0; i < bytes.length; i++) {
		c ^= bytes[i];
		for (let k = 0; k < 8; k++) {
			c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
		}
	}
	return ~c >>> 0;
}

function latin1(value: string): Uint8Array | null {
	const out = new Uint8Array(value.length);
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code > 255) return null;
		out[i] = code;
	}
	return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
	const typeBytes = latin1(type);
	if (!typeBytes || typeBytes.length !== 4) {
		throw new Error("bad_chunk_type");
	}
	const body = new Uint8Array(4 + data.length);
	body.set(typeBytes, 0);
	body.set(data, 4);
	const crc = crc32(body);
	const out = new Uint8Array(12 + data.length);
	const view = new DataView(out.buffer);
	view.setUint32(0, data.length);
	out.set(body, 4);
	view.setUint32(8 + data.length, crc);
	return out;
}

function isPng(bytes: Uint8Array): boolean {
	if (bytes.length < 8) return false;
	return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}

/** @returns null when the bytes are not a PNG or the note is not Latin-1. */
export function stampPngReceipt(png: Uint8Array, receiptId: string): Uint8Array | null {
	const note = String(receiptId || "").trim();
	if (!isPng(png) || !note) return null;
	const text = latin1(note);
	const keyword = latin1("Comment");
	if (!text || !keyword) return null;
	const data = new Uint8Array(keyword.length + 1 + text.length);
	data.set(keyword, 0);
	data[keyword.length] = 0;
	data.set(text, keyword.length + 1);
	const textChunk = chunk("tEXt", data);

	let offset = 8;
	let iend = -1;
	while (offset + 12 <= png.length) {
		const length = new DataView(png.buffer, png.byteOffset + offset, 4).getUint32(0);
		const type = String.fromCharCode(
			png[offset + 4],
			png[offset + 5],
			png[offset + 6],
			png[offset + 7],
		);
		const next = offset + 12 + length;
		if (next > png.length) return null;
		if (type === "IEND") {
			iend = offset;
			break;
		}
		offset = next;
	}
	if (iend < 0) return null;
	const out = new Uint8Array(png.length + textChunk.length);
	out.set(png.subarray(0, iend), 0);
	out.set(textChunk, iend);
	out.set(png.subarray(iend), iend + textChunk.length);
	return out;
}

export function pngHasReceipt(png: Uint8Array, receiptId: string): boolean {
	const note = String(receiptId || "");
	if (!note) return false;
	const encoded = latin1(`Comment\0${note}`);
	if (!encoded) return false;
	for (let i = 0; i <= png.length - encoded.length; i++) {
		let same = true;
		for (let j = 0; j < encoded.length; j++) {
			if (png[i + j] !== encoded[j]) {
				same = false;
				break;
			}
		}
		if (same) return true;
	}
	return false;
}
