#!/usr/bin/env bash
# Agent 回合结束时：若有未提交改动，提醒同步节奏（不自动 commit/push）。
# 通过 followup_message 仅在 loop_count=0 时触发一次，避免死循环。
set -euo pipefail

input="$(cat)"
loop_count="$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("loop_count",0))' 2>/dev/null || echo 0)"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

dirty=0
if [[ -n "$(git status --porcelain 2>/dev/null || true)" ]]; then
  dirty=1
fi

if [[ "$dirty" -eq 1 && "$loop_count" -eq 0 ]]; then
  python3 - <<'PY'
import json
msg = (
  "【Git 同步提醒｜非自动 push】工作区有未提交改动。"
  "若本回合是实质性 Task：请更新 focus-tiger/docs/PROCESS.md「当前进度速览」，"
  "然后 git commit；仅在用户明确要求时再用 ./scripts/git-sync-safe.sh --push。"
  "禁止 post-commit 自动 push。"
)
print(json.dumps({"followup_message": msg}, ensure_ascii=False))
PY
else
  echo '{}'
fi
