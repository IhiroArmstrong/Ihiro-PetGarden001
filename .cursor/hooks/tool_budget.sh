#!/usr/bin/env bash
# preToolUse — explore-only tool-call budget (tiered soft ask / hard deny).
# Productive calls (StrReplace, bounded Read, git, smoke) are not counted and
# are never hard-denied by this hook.
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')
TOOL=$(field "$INPUT" '.tool_name' '')

DIR=$(state_dir_for "$CID")
COUNT_FILE="$DIR/tool_count"
GREP_FLAG="$DIR/has_grepped"
SNAPSHOT="探索快照（已读文件 / 已确认 / 已排除假设）"

case "$TOOL" in
  *[Gg]rep*|*[Ss]earch*|*codebase_search*)
    touch "$GREP_FLAG"
    ;;
esac

if is_productive_write "$TOOL"; then
  reset_explore_streak "$CID"
  emit_allow
fi

if ! is_explore_budgeted "$INPUT"; then
  emit_allow
fi

STREAK=$(read_explore_streak "$CID")
STREAK=$((STREAK + 1))
write_explore_streak "$CID" "$STREAK"

COUNT=0
[ -f "$COUNT_FILE" ] && COUNT=$(cat "$COUNT_FILE")
COUNT=$((COUNT + 1))
echo "$COUNT" > "$COUNT_FILE"

TIER=$(read_budget_tier "$CID" qa)
read -r SOFT HARD <<< "$(limits_for_tier "$TIER")"
STREAK_SOFT=$(cfg explore_streak_soft_limit 8)

if [ "$COUNT" -ge "$HARD" ]; then
  emit_deny \
    "探索类预算已耗尽（第 ${COUNT} 次，档位 ${TIER}，硬上限 ${HARD}）。禁止再 Grep/Glob/违规 Read。仍可 StrReplace、合规片段 Read、git、约定 smoke。不要新开 Chat / New Agent。若还需搜索，只在本对话发「继续 <任务>」重置探索计数。硬顶前须附完整${SNAPSHOT}。" \
    "本会话探索类调用已达硬上限（${COUNT}/${HARD}，档位 ${TIER}）。不要新开 Chat；在本对话发「继续 <任务>」可重置探索预算。改文件与 git 不受此闸。须附${SNAPSHOT}。"
elif [ "$STREAK" -ge "$STREAK_SOFT" ]; then
  emit_ask \
    "已连续 ${STREAK} 次探索无 StrReplace/Write（软停阈值 ${STREAK_SOFT}）。请先口头汇报完整${SNAPSHOT}与下一步计划。改文件 / git / 约定 smoke 不受阻。不要新开 Chat。" \
    "已连续 ${STREAK} 次探索未改文件。请先附${SNAPSHOT}再继续探索；或直接 StrReplace/Write 开工。"
elif [ "$COUNT" -eq "$SOFT" ]; then
  emit_ask \
    "探索类已达软上限（${COUNT} 次，档位 ${TIER}，软上限 ${SOFT}，硬上限 ${HARD}）。请先口头汇报完整${SNAPSHOT}与计划。改文件 / git / 约定 smoke 不受阻。不要新开 Chat。" \
    "本会话探索类调用已达 ${COUNT} 次（软上限 ${SOFT}，档位 ${TIER}）。请先附${SNAPSHOT}；不要新开 Chat。"
else
  emit_allow
fi
