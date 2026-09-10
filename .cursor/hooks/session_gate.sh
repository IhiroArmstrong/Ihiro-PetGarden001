#!/usr/bin/env bash
# beforeSubmitPrompt — block new messages after PR merge in this chat.
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')

DIR=$(state_dir_for "$CID")

if [ -f "$DIR/merged" ]; then
  jq -n \
    '{continue:false, userMessage:"这个会话对应的 PR 已经合并。按项目规则，请开一个新 Chat 继续下一步任务，避免历史上下文继续累积计费。"}'
  exit 2
else
  echo '{"continue":true}'
  exit 0
fi
