#!/usr/bin/env bash
# [DISABLED 2026-07-21] 曾用于 Agent stop → macOS 系统通知提醒 Git 同步。
# 已从 `.cursor/hooks.json` 的 stop 列表移除；保留脚本便于日后按需重新挂回。
# 若重新启用：在 hooks.json 的 stop 中加入
#   { "command": ".cursor/hooks/remind-git-sync.sh" }
# 并确保始终只输出 `{}`，禁止 followup_message。
set -euo pipefail

cat >/dev/null
echo '{}'
