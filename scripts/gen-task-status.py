#!/usr/bin/env python3
"""由 GitHub PR 生成 docs/STATUS.md（只写事实：哪些 PR 已合并 / 进行中）。
用法: python3 scripts/gen-task-status.py [输出路径，默认 docs/STATUS.md]
输出不含时间戳，内容没变就不会产生 diff。
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from task_lib import BASE, fetch_prs, group_by_task  # noqa: E402

out_path = sys.argv[1] if len(sys.argv) > 1 else "docs/STATUS.md"
g = group_by_task(fetch_prs())


def fmt(prs, with_date):
    if not prs:
        return "—"
    items = []
    for p in prs:
        d = f" {p['mergedAt'][:10]}" if with_date and p.get("mergedAt") else ""
        items.append(f"[#{p['number']}]({p['url']}){d}")
    return "<br>".join(items)


lines = [
    "<!-- 本文件由 scripts/gen-task-status.py 自动生成，请勿手改 -->",
    "# 任务状态（自动生成）",
    "",
    f"数据来源：GitHub 上 base=`{BASE}` 的 PR；Tn 取自 PR 标题 / 分支名 / 描述中「任务 ID」一行。",
    "本表只陈述**事实**（有哪些 PR 已合并 / 进行中）。某个 Tn 的某一刀是否做完，请读对应 PR；",
    "**与本表冲突的手写文档状态，一律以本表为准。**",
    "",
    "| 任务 | 已合并 PR | 进行中 PR |",
    "|---|---|---|",
]
for tid in sorted(g, key=lambda s: -int(s[1:])):
    lines.append(f"| {tid} | {fmt(g[tid]['merged'], True)} | {fmt(g[tid]['open'], False)} |")
lines.append("")

os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
with open(out_path, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))
print(f"已写入 {out_path}：{len(g)} 个任务")
