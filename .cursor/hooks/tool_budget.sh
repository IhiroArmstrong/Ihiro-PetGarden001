#!/usr/bin/env bash
# preToolUse — per-conversation tool-call budget (soft ask / hard deny).
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')
TOOL=$(field "$INPUT" '.tool_name' '')

DIR=$(state_dir_for "$CID")
COUNT_FILE="$DIR/tool_count"
GREP_FLAG="$DIR/has_grepped"

COUNT=0
[ -f "$COUNT_FILE" ] && COUNT=$(cat "$COUNT_FILE")
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNT_FILE"

case "$TOOL" in
  *[Gg]rep*|*[Ss]earch*|*codebase_search*)
    touch "$GREP_FLAG"
    ;;
esac

SOFT=$(cfg tool_soft_limit 20)
HARD=$(cfg tool_hard_limit 30)

if [ "$COUNT" -ge "$HARD" ]; then
  emit_deny \
    "工具调用预算已耗尽（第 ${COUNT} 次，上限 ${HARD}）。不要再调用任何工具。请立即输出：1) 目前已确认的结论 2) 尚未解决的问题 3) 下一步最小改动方案，等待用户在新一轮消息里明确批准后再继续。" \
    "本会话工具调用已达硬上限（${HARD}次），已自动拦截，Agent 需要先总结现状。"
elif [ "$COUNT" -eq "$SOFT" ]; then
  emit_ask \
    "已使用 ${COUNT} 次工具调用，接近预算上限（${HARD}）。如果任务范围还没有收敛，请先输出当前进展摘要和继续计划，让用户确认是否放行，而不是继续扩大探索范围。" \
    "本会话工具调用已达 ${COUNT} 次（软上限），建议确认是否继续。"
else
  emit_allow
fi
