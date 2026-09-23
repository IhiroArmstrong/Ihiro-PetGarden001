#!/usr/bin/env python3
"""
Focus Tiger™ is a product of Twinsology.
Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.

Audit open PRs whose E2E-related CI checks are failure / pending / cancelled.

Read-only report — never closes or merges PRs.

Usage (from repo root or focus-tiger/):
  python3 focus-tiger/scripts/audit-open-pr-e2e.py
  cd focus-tiger && python3 scripts/audit-open-pr-e2e.py

Options:
  --baseline REF     Git ref for "behind" count (default: develop)
  --stale-threshold  Commits behind baseline for auto-close heuristic (default: 100)
  --json             Emit machine-readable JSON instead of markdown tables
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

E2E_CHECK_PATTERNS = (
    r"e2e",
    r"pr-smoke",
    r"visibility",
    r"playwright",
    r"full e2e",
)

BEHIND_CLOSE_THRESHOLD_DEFAULT = 100

ABANDONED_KEYWORDS = (
    "deprecated",
    "obsolete",
    "superseded",
    "废弃",
    "已废弃",
    "do not merge",
    "replaced by",
)

DEPENDABOT_BRANCH_PREFIX = "dependabot/"


@dataclass
class PrRow:
    num: int
    title: str
    updated: str
    branch: str
    base: str
    behind_develop: int
    diff_type: str
    e2e_status: str
    category: str
    reason: str
    is_draft: bool = False
    is_dependabot: bool = False
    has_e2e_issue: bool = False
    has_e2e_files: bool = False
    has_src_files: bool = False
    merged_to_baseline: bool = False


def run(cmd: str, cwd: Path) -> Optional[str]:
    result = subprocess.run(
        cmd,
        shell=True,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def is_e2e_check(name: str, workflow: str) -> bool:
    haystack = f"{name} {workflow}".lower()
    return any(re.search(pat, haystack) for pat in E2E_CHECK_PATTERNS)


def classify_diff_type(files: list[str]) -> str:
    if not files:
        return "empty"

    has_src = any(
        f.startswith("focus-tiger/src/")
        or f.startswith("focus-tiger/public/")
        or f.endswith(".vue")
        for f in files
    )
    has_e2e = any(
        f.startswith("focus-tiger/e2e/") or "playwright" in f for f in files
    )
    has_dep = any(
        f.endswith("package.json")
        or f.endswith("package-lock.json")
        or "dependabot" in f.lower()
        for f in files
    )

    doc_like = []
    for f in files:
        if f.startswith("focus-tiger/docs/") or f.startswith(".cursor/"):
            doc_like.append(f)
            continue
        if f.endswith(".md") and not has_src:
            doc_like.append(f)

    if has_src:
        return "src-changed"
    if has_e2e and not has_src:
        return "e2e-only"
    if has_dep and not has_src and not has_e2e:
        return "dependency"
    if len(doc_like) == len(files):
        return "docs-only"
    if has_dep:
        return "dependency"
    return "mixed"


def is_docs_or_dependency_only(diff_type: str) -> bool:
    """Stale auto-close: docs-only or dependency bump (per PROCESS agreement)."""
    return diff_type in ("docs-only", "dependency")


def e2e_issue_flags(checks: list[dict]) -> tuple[bool, bool, bool, bool]:
    if not checks:
        return False, False, False, False

    success = any(
        c.get("status") == "COMPLETED" and c.get("conclusion") == "SUCCESS"
        for c in checks
    )
    failed = any(
        c.get("status") == "COMPLETED"
        and c.get("conclusion") in ("FAILURE", "TIMED_OUT", "ACTION_REQUIRED")
        for c in checks
    )
    pending = any(
        c.get("status") in ("IN_PROGRESS", "QUEUED", "PENDING", "WAITING")
        for c in checks
    )
    cancelled_only = (
        not success
        and not failed
        and not pending
        and all(
            c.get("conclusion") in ("CANCELLED", "SKIPPED", "NEUTRAL", None)
            for c in checks
            if c.get("status") == "COMPLETED"
        )
    )
    has_issue = failed or pending or cancelled_only
    return has_issue, success, failed, cancelled_only


def format_e2e_status(checks: list[dict]) -> str:
    if not checks:
        return "无 E2E 检查"
    parts = []
    for c in checks:
        name = c.get("name", "?")
        state = c.get("conclusion") or c.get("status") or "?"
        parts.append(f"{name}={state}")
    return "; ".join(parts)


def classify_pr(
    *,
    behind: int,
    stale_threshold: int,
    diff_type: str,
    has_e2e_files: bool,
    has_src_files: bool,
    is_draft: bool,
    is_dependabot: bool,
    is_abandoned: bool,
    merged_to_baseline: bool,
    has_e2e_issue: bool,
    e2e_failed: bool,
) -> tuple[str, str]:
    if not has_e2e_issue:
        if is_draft:
            return "建议关闭", "Draft PR"
        if merged_to_baseline:
            return "建议关闭", f"分支已合入 baseline，PR 可关"
        if behind > stale_threshold and is_docs_or_dependency_only(diff_type):
            return "建议关闭", f"落后 develop {behind} commits + {diff_type}"
        if is_abandoned:
            return "建议关闭", "标题/描述含废弃信号"
        return "—", "E2E 全绿"

    if is_dependabot:
        return "建议关闭", "Dependabot PR：等 bot 重开（不救）"

    if merged_to_baseline:
        return "建议关闭", "分支已合入 baseline，PR 可关"

    if is_draft:
        return "建议关闭", "Draft PR"

    if is_abandoned:
        return "建议关闭", "标题/描述含废弃信号"

    if behind > stale_threshold and is_docs_or_dependency_only(diff_type):
        return "建议关闭", f"落后 develop {behind} commits + {diff_type}"

    if behind > stale_threshold and diff_type == "src-changed":
        return (
            "需人工判断:功能是否已被覆盖",
            f"落后 develop {behind} commits，含 src 改动，先确认功能是否仍有效",
        )

    if has_src_files and not has_e2e_files:
        return "需重新生成 E2E", "改了产品代码但 PR 无 e2e 文件"

    if has_e2e_files:
        return "需重跑 E2E", "PR 含 e2e 改动，失败多为 flaky/需重跑"

    if e2e_failed:
        return "需重跑 E2E", "E2E 失败/未完成，rebase develop 后重跑"

    return "需重跑 E2E", "E2E 被取消未完成，需重跑"


def fetch_open_prs(repo_root: Path) -> list[dict]:
    raw = run(
        "gh pr list --state open --limit 500 --json "
        "number,title,updatedAt,headRefName,baseRefName,body,labels,isDraft,statusCheckRollup",
        repo_root,
    )
    if not raw:
        print("ERROR: gh pr list failed (is gh authenticated?)", file=sys.stderr)
        sys.exit(1)
    return json.loads(raw)


def audit_prs(
    repo_root: Path,
    baseline: str,
    stale_threshold: int,
) -> list[PrRow]:
    run(f"git fetch origin {baseline} --quiet", repo_root)

    rows: list[PrRow] = []
    for pr in fetch_open_prs(repo_root):
        num = pr["number"]
        branch = pr["headRefName"]
        base = pr["baseRefName"]
        title = pr["title"]
        body = pr.get("body") or ""
        is_draft = bool(pr.get("isDraft"))
        is_dependabot = branch.lower().startswith(DEPENDABOT_BRANCH_PREFIX)

        run(f"git fetch origin {branch} --quiet 2>/dev/null", repo_root)

        behind_raw = run(
            f"git rev-list --count origin/{branch}..origin/{baseline} 2>/dev/null",
            repo_root,
        )
        behind = int(behind_raw) if behind_raw and behind_raw.isdigit() else -1

        merged = (
            subprocess.run(
                f"git merge-base --is-ancestor origin/{branch} origin/{baseline}",
                shell=True,
                cwd=repo_root,
            ).returncode
            == 0
        )

        e2e_checks = [
            c
            for c in (pr.get("statusCheckRollup") or [])
            if is_e2e_check(c.get("name", ""), c.get("workflowName", ""))
        ]
        has_issue, _, e2e_failed, _ = e2e_issue_flags(e2e_checks)

        diff_raw = run(f"gh pr diff {num} --name-only 2>/dev/null", repo_root) or ""
        files = [line for line in diff_raw.splitlines() if line.strip()]
        diff_type = classify_diff_type(files)
        has_e2e_files = diff_type in ("e2e-only",) or any(
            f.startswith("focus-tiger/e2e/") for f in files
        )
        has_src_files = diff_type == "src-changed"

        text = f"{title} {body}".lower()
        is_abandoned = any(k in text for k in ABANDONED_KEYWORDS)

        category, reason = classify_pr(
            behind=behind,
            stale_threshold=stale_threshold,
            diff_type=diff_type,
            has_e2e_files=has_e2e_files,
            has_src_files=has_src_files,
            is_draft=is_draft,
            is_dependabot=is_dependabot,
            is_abandoned=is_abandoned,
            merged_to_baseline=merged,
            has_e2e_issue=has_issue,
            e2e_failed=e2e_failed,
        )

        rows.append(
            PrRow(
                num=num,
                title=title,
                updated=(pr.get("updatedAt") or "")[:10],
                branch=branch,
                base=base,
                behind_develop=behind,
                diff_type=diff_type,
                e2e_status=format_e2e_status(e2e_checks),
                category=category,
                reason=reason,
                is_draft=is_draft,
                is_dependabot=is_dependabot,
                has_e2e_issue=has_issue,
                has_e2e_files=has_e2e_files,
                has_src_files=has_src_files,
                merged_to_baseline=merged,
            )
        )

    rows.sort(key=lambda r: r.num, reverse=True)
    return rows


def print_markdown_report(rows: list[PrRow], baseline: str, stale_threshold: int) -> None:
    e2e_rows = [r for r in rows if r.has_e2e_issue]
    green_rows = [r for r in rows if not r.has_e2e_issue]

    print(f"# Open PR E2E 盘点（baseline: `{baseline}`）\n")
    print(f"- Open PR 总数: **{len(rows)}**")
    print(f"- E2E 有问题: **{len(e2e_rows)}**")
    print(f"- E2E 全绿: **{len(green_rows)}**")
    print(f"- 陈旧阈值: 落后 `{baseline}` > **{stale_threshold}** commits\n")

    if e2e_rows:
        print("## E2E failure / pending / cancelled\n")
        print(
            "| PR | 标题 | 更新 | 落后 develop | diff 类型 | E2E 状态 | 建议分类 | 理由 |"
        )
        print("|---:|---|---|---:|---|---|---|---|")
        for r in e2e_rows:
            title = r.title.replace("|", "\\|")[:70]
            e2e = r.e2e_status.replace("|", "\\|")[:60]
            reason = r.reason.replace("|", "\\|")[:80]
            print(
                f"| #{r.num} | {title} | {r.updated} | {r.behind_develop} "
                f"| {r.diff_type} | {e2e} | **{r.category}** | {reason} |"
            )
        print()

        counts = Counter(r.category for r in e2e_rows)
        print("### 分类汇总（E2E 有问题）\n")
        for cat, n in counts.most_common():
            nums = ", ".join(f"#{r.num}" for r in e2e_rows if r.category == cat)
            print(f"- **{cat}**: {n} — {nums}")
        print()

    if green_rows:
        print("## E2E 全绿（参考）\n")
        print("| PR | 标题 | 落后 develop | diff 类型 | 备注 |")
        print("|---:|---|---:|---|---|")
        for r in green_rows:
            title = r.title.replace("|", "\\|")[:60]
            print(
                f"| #{r.num} | {title} | {r.behind_develop} | {r.diff_type} | {r.category} |"
            )
        print()

    manual = [r for r in rows if r.category.startswith("需人工判断")]
    if manual:
        print("## 需人工判断（含 src 改动 + 落后阈值）\n")
        for r in manual:
            print(f"- **#{r.num}** {r.title} — {r.reason}")
        print()

    print("> 本脚本只输出报告，不执行关闭/合并。")


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit open PR E2E CI status")
    parser.add_argument(
        "--baseline",
        default="develop",
        help="Git ref for behind-count (default: develop)",
    )
    parser.add_argument(
        "--stale-threshold",
        type=int,
        default=BEHIND_CLOSE_THRESHOLD_DEFAULT,
        help=f"Commits behind baseline for auto-close heuristic (default: {BEHIND_CLOSE_THRESHOLD_DEFAULT})",
    )
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()

    repo_root = repo_root_from_script()
    rows = audit_prs(repo_root, args.baseline, args.stale_threshold)

    if args.json:
        payload = {
            "baseline": args.baseline,
            "stale_threshold": args.stale_threshold,
            "total_open": len(rows),
            "e2e_issues": sum(1 for r in rows if r.has_e2e_issue),
            "rows": [r.__dict__ for r in rows],
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print_markdown_report(rows, args.baseline, args.stale_threshold)


if __name__ == "__main__":
    main()
