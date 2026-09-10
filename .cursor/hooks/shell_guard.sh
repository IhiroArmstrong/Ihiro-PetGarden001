#!/usr/bin/env bash
# beforeShellExecution — deny high-risk destructive shell patterns (rm -rf, etc.).
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
COMMAND=$(field "$INPUT" '.command' '')

PATTERN=$(cfg destructive_shell_pattern 'rm -rf|git reset --hard|git clean -fd')

if echo "$COMMAND" | grep -Eiq "$PATTERN"; then
  emit_deny \
    "命令 '${COMMAND}' 命中高风险模式，已拦截。如确实需要执行，请在消息里明确说明原因，由用户手动执行。" \
    "已拦截高风险 shell 命令：${COMMAND}"
else
  emit_allow
fi
