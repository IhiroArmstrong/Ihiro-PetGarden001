"""公共函数：从 GitHub 取 PR，并按 Tn 归类。
Tn 只从三处提取：PR 标题、分支名、描述里带「任务 ID」的那一行（避免正文随口提到 T73 造成误判）。
测试时可设 TASK_PRS_JSON=文件路径，跳过 gh 调用。
"""
import json
import os
import re
import subprocess

BASE = os.environ.get("BASE_BRANCH", "develop")
ID_RE = re.compile(r"(?<![A-Za-z0-9])[Tt](\d+)(?!\d)")
# 描述里的「任务 ID：Tn」行（必须以此开头，避免正文里随口出现"任务ID"造成误判）
TASK_LINE_RE = re.compile(r"^\s*[-*]?\s*任务 ?ID\s*[：:]")


def fetch_prs():
    f = os.environ.get("TASK_PRS_JSON")
    if f:
        with open(f, encoding="utf-8") as fh:
            return json.load(fh)
    out = subprocess.run(
        ["gh", "pr", "list", "--base", BASE, "--state", "all", "--limit", "1000",
         "--json", "number,title,body,headRefName,state,mergedAt,url"],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(out)


def task_ids(pr):
    body_lines = [l for l in (pr.get("body") or "").splitlines() if TASK_LINE_RE.match(l)]
    text = "\n".join([pr.get("title") or "", pr.get("headRefName") or ""] + body_lines)
    return sorted({"T" + m.group(1) for m in ID_RE.finditer(text)}, key=lambda s: int(s[1:]))


def group_by_task(prs):
    """返回 {Tn: {"merged": [pr...], "open": [pr...]}}"""
    g = {}
    for pr in prs:
        st = pr.get("state")
        if st not in ("MERGED", "OPEN"):
            continue
        for tid in task_ids(pr):
            slot = g.setdefault(tid, {"merged": [], "open": []})
            slot["merged" if st == "MERGED" else "open"].append(pr)
    for slot in g.values():
        slot["merged"].sort(key=lambda p: p.get("mergedAt") or "")
    return g
