#!/usr/bin/env bash
# beforeSubmitPrompt — PR merge gate + per-conversation tool-budget tier selection.
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')
PROMPT=$(field "$INPUT" '.prompt' '')

DIR=$(state_dir_for "$CID")
TIER_FILE=$(budget_tier_file "$CID")

if [ -f "$DIR/merged" ]; then
  jq -n \
    '{continue:false, userMessage:"这个会话对应的 PR 已经合并。按项目规则，请开一个新 Chat 继续下一步任务，避免历史上下文继续累积计费。"}'
  exit 2
fi

ACTION=$(classify_prompt_tier_action "$PROMPT")

case "$ACTION" in
  large)
    write_budget_tier "$CID" large
    reset_tool_count "$CID"
    rm -f "$DIR/continue_resume"
    ;;
  impl)
    write_budget_tier "$CID" impl
    reset_tool_count "$CID"
    rm -f "$DIR/continue_resume"
    ;;
  continue)
    if [ ! -f "$TIER_FILE" ]; then
      write_budget_tier "$CID" impl
    fi
    touch "$DIR/continue_resume"
    reset_tool_count "$CID"
    ;;
  unchanged)
    if [ ! -f "$TIER_FILE" ]; then
      write_budget_tier "$CID" qa
    fi
    ;;
esac

echo '{"continue":true}'
exit 0
