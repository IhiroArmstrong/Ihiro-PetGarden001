#!/usr/bin/env python3
"""Ingest 哥窑分组1010G1/G2 into edition previews + HD masters (repo root folders)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # focus-tiger/
REPO = Path(__file__).resolve().parents[3]  # main repo (哥窑分组1010G*)
INGEST = ROOT / "scripts" / "process-art-collection-ingest.py"

G1 = REPO / "哥窑分组1010G1"
G2 = REPO / "哥窑分组1010G2"

# jimeng stem -> (set_id, sheet_id, hd_id) — order matches sorted filenames in each folder.
G1_ROWS = [
    ("2151", "ge-crackle-1010-g1", "ge-g1-hunting-stem-bowl", "hd-g1-01"),
    ("4192", "ge-crackle-1010-g1", "ge-g1-taotie-gu", "hd-g1-02"),
    ("4400", "ge-crackle-1010-g1", "ge-g1-beast-ring-hu", "hd-g1-03"),
    ("7060", "ge-crackle-1010-g1", "ge-g1-upright-ear-ding", "hd-g1-04"),
    ("8865", "ge-crackle-1010-g1", "ge-g1-dragon-zun", "hd-g1-05"),
]
G2_ROWS = [
    ("1911", "ge-crackle-1010-g2", "ge-g2-taotie-li", "hd-g2-01"),
    ("3101", "ge-crackle-1010-g2", "ge-g2-dragon-zun", "hd-g2-02"),
    ("3967", "ge-crackle-1010-g2", "ge-g2-hunting-stem-bowl", "hd-g2-03"),
    ("4223", "ge-crackle-1010-g2", "ge-g2-taotie-gu", "hd-g2-04"),
    ("6989", "ge-crackle-1010-g2", "ge-g2-crackle-fanghu", "hd-g2-05"),
]

HD_STAGING = ROOT / ".staging" / "ge-hd-masters"


def find_src(folder: Path, stem: str) -> Path:
    hits = [p for p in folder.glob("*.png") if stem in p.name]
    if len(hits) != 1:
        raise SystemExit(f"expected one file for {stem} in {folder}, got {len(hits)}")
    return hits[0]


def run_row(folder: Path, stem: str, set_id: str, sheet_id: str, hd_id: str) -> None:
    src = find_src(folder, stem)
    preview = (
        ROOT
        / "public"
        / "ui"
        / "art-collection"
        / set_id
        / f"preview-{sheet_id}.png"
    )
    master = HD_STAGING / f"{hd_id}.png"
    subprocess.run(
        [sys.executable, str(INGEST), str(src), str(preview), "--master-out", str(master)],
        check=True,
    )


def main() -> None:
    for stem, set_id, sheet_id, hd_id in G1_ROWS:
        run_row(G1, stem, set_id, sheet_id, hd_id)
    for stem, set_id, sheet_id, hd_id in G2_ROWS:
        run_row(G2, stem, set_id, sheet_id, hd_id)
    print("done", len(G1_ROWS) + len(G2_ROWS), "pieces")


if __name__ == "__main__":
    main()
