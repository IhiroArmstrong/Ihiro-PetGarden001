#!/usr/bin/env bash
# Agent 回合结束时：若有未提交改动，通过 macOS 系统通知提醒同步节奏。
# 始终返回空 JSON，不使用 followup_message，避免自动启动额外模型回合。
set -euo pipefail

cat >/dev/null

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]]; then
  /usr/bin/osascript >/dev/null 2>&1 <<'APPLESCRIPT' || true
display notification "工作区有未提交改动。实质性 Task 完成后请更新 PROCESS.md 并 commit；仅在明确要求时 push。" with title "Focus Tiger · Git 同步提醒"
APPLESCRIPT
fi

echo '{}'
