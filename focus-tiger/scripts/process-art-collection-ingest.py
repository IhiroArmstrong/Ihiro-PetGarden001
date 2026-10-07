#!/usr/bin/env python3
"""Prepare Art Collection PNGs: strip AI watermark, cut out subject, transparent background."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


PREVIEW_SIZE = 480
BOTTOM_MARGIN = 28


def _corner_bg(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    samples = np.array(
        [
            rgb[0, 0],
            rgb[0, w - 1],
            rgb[h - 1, 0],
            rgb[h - 1, w - 1],
            rgb[0, w // 2],
            rgb[h - 1, w // 2],
        ],
        dtype=np.float32,
    )
    return np.median(samples, axis=0)


def _subject_mask(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    diff = np.sqrt(np.sum((rgb.astype(np.float32) - bg) ** 2, axis=2))
    mask = diff > 20

    # Top-left AI watermark band
    watermark = np.zeros((h, w), dtype=bool)
    watermark[: int(h * 0.09), : int(w * 0.2)] = True
    mask &= ~watermark

    # Drop isolated specks
    from scipy import ndimage

    mask = ndimage.binary_opening(mask, iterations=1)
    mask = ndimage.binary_closing(mask, iterations=2)
    return mask


def ingest_master(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3]
    bg = _corner_bg(rgb)
    mask = _subject_mask(rgb, bg)

    alpha = (mask.astype(np.uint8) * 255)
    alpha_img = Image.fromarray(alpha, mode="L").filter(ImageFilter.GaussianBlur(0.6))
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, mask=alpha_img)
    return _crop_transparent(out)


def _crop_transparent(im: Image.Image, pad: int = 8) -> Image.Image:
    arr = np.array(im)
    alpha = arr[:, :, 3] > 16
    if not alpha.any():
        return im
    rows = np.any(alpha, axis=1)
    cols = np.any(alpha, axis=0)
    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]
    r0 = max(0, r0 - pad)
    c0 = max(0, c0 - pad)
    r1 = min(arr.shape[0] - 1, r1 + pad)
    c1 = min(arr.shape[1] - 1, c1 + pad)
    return im.crop((c0, r0, c1 + 1, r1 + 1))


def to_preview(master: Image.Image, size: int = PREVIEW_SIZE) -> Image.Image:
    cw, ch = master.size
    max_h = int(size * 0.83)
    max_w = int(size * 0.88)
    scale = min(max_w / cw, max_h / ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    resized = master.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - nw) // 2
    y = size - nh - BOTTOM_MARGIN
    canvas.paste(resized, (x, y), resized)
    return canvas


def process_file(src: Path, preview_out: Path, master_out: Path | None = None) -> None:
    master = ingest_master(src)
    preview = to_preview(master)
    preview_out.parent.mkdir(parents=True, exist_ok=True)
    preview.save(preview_out, "PNG", optimize=True)
    if master_out is not None:
        master_out.parent.mkdir(parents=True, exist_ok=True)
        master.save(master_out, "PNG", optimize=True)
    transparent = int(np.sum(np.array(preview)[:, :, 3] > 16))
    print(f"{preview_out.name}: {preview.size} transparent_px={transparent}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("src")
    parser.add_argument("preview_out")
    parser.add_argument("--master-out")
    args = parser.parse_args()
    process_file(
        Path(args.src),
        Path(args.preview_out),
        Path(args.master_out) if args.master_out else None,
    )


if __name__ == "__main__":
    main()
