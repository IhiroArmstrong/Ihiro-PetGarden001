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
NEW_CHAT_CONTINUE=0

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
      NEW_CHAT_CONTINUE=1
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

if [ "$NEW_CHAT_CONTINUE" -eq 1 ]; then
  jq -n \
    '{continue:true, userMessage:"「继续」开在了新会话。按规则应在被硬顶的同一 Chat 里发「继续 <任务>」；新 Chat 只留给 PR 已合入或完全换题。本次仍放行，但会重新缴纳探索税。"}'
  exit 0
fi

echo '{"continue":true}'
exit 0
