#!/usr/bin/env python3
"""巡检：文档里某行同时出现「Tn」和「待做/立即做/…」类字样，而 Tn 在 develop 上已有合并 PR → 疑似过期。
用法: python3 scripts/audit-task-docs.py --out report.md
退出码: 0 = 无发现；3 = 有疑似过期条目
"""
import argparse
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from task_lib import ID_RE, fetch_prs, group_by_task  # noqa: E402

# 本仓库：队列/任务文档在 focus-tiger/docs/；根目录还有 WORKFLOW / AGENTS。
DOC_GLOBS = [
    "focus-tiger/docs/**/*.md",
]
EXCLUDE = {
    "docs/STATUS.md",
    "focus-tiger/docs/GLOSSARY_CHANGELOG.md",
    "focus-tiger/docs/SCHEDULING_CHANGELOG.md",
    "focus-tiger/docs/RULES_INDEX.md",
}
# 与 GLOSSARY 状态词对齐。不含「搁置/未排期」。
# 「按…开工」只在口令/队列句里有用；整行若已写「不执行 / 勿再开 / 已合」则跳过。
STALE_RE = re.compile(
    r"待做|立即做|Brief 已点头|待开工|按.{0,12}开工|进行中"
)
SKIP_LINE_RE = re.compile(
    r"不执行|勿再开|不以.{0,12}立即做|已合入|已由 #\d+|文档已过期"
)

ap = argparse.ArgumentParser()
ap.add_argument("--out", default="audit-report.md")
args = ap.parse_args()

g = group_by_task(fetch_prs())
files = sorted({f for pat in DOC_GLOBS for f in glob.glob(pat, recursive=True)} - EXCLUDE)

findings = []
for f in files:
    with open(f, encoding="utf-8", errors="replace") as fh:
        for n, line in enumerate(fh, 1):
            if not STALE_RE.search(line):
                continue
            if SKIP_LINE_RE.search(line) and len(line) < 240:
                continue
            for m in ID_RE.finditer(line):
                window = line[max(0, m.start() - 80) : m.end() + 80]
                if not STALE_RE.search(window):
                    continue
                if SKIP_LINE_RE.search(window):
                    continue
                tid = "T" + m.group(1)
                merged = g.get(tid, {}).get("merged", [])
                if merged:
                    prs = ", ".join(f"#{p['number']}" for p in merged[-4:])
                    findings.append((f, n, tid, prs, line.strip()[:120]))

lines = ["# 文档状态巡检：疑似过期条目", ""]
if findings:
    lines += [
        f"发现 **{len(findings)}** 处：文档里仍写「待做/立即做/开工…」，但该任务在 develop 上已有合并 PR。",
        "注意：Tn 可能分多刀，请读 PR 判断是否真的过期；确认过期的，同一个 PR 内改掉。",
        "",
        "| 文件:行 | 任务 | 已合并 PR | 该行内容 |",
        "|---|---|---|---|",
    ]
    for f, n, tid, prs, txt in findings:
        safe = txt.replace("|", "\\|")
        lines.append(f"| `{f}:{n}` | {tid} | {prs} | {safe} |")
else:
    lines.append("未发现疑似过期条目 ✅")
lines.append("")

# GitHub issue body 上限约 64KiB；超长时截断并在文首说明。
MAX_CHARS = 60000
text = "\n".join(lines) + "\n"
if len(text) > MAX_CHARS:
    cut = text[:MAX_CHARS].rsplit("\n", 1)[0]
    text = (
        cut
        + f"\n\n…截断：共 {len(findings)} 处，此处仅列出前段。完整表在 Actions 日志或本地 `python3 scripts/audit-task-docs.py`。\n"
    )

with open(args.out, "w", encoding="utf-8") as fh:
    fh.write(text)
print(f"扫描 {len(files)} 个文件，疑似过期 {len(findings)} 处", file=sys.stderr)
sys.exit(3 if findings else 0)
