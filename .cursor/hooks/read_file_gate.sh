#!/usr/bin/env bash
# beforeReadFile — large files require a prior Grep/search in this conversation.
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')
FILE=$(field "$INPUT" '.file_path' '')

[ -z "$FILE" ] && emit_allow
[ ! -f "$FILE" ] && emit_allow

LIMIT=$(cfg large_file_lines 800)
LINES=$(wc -l < "$FILE" 2>/dev/null | tr -d ' ')
[ -z "$LINES" ] && LINES=0

if [ "$LINES" -le "$LIMIT" ]; then
  emit_allow
fi

DIR=$(state_dir_for "$CID")
GREP_FLAG="$DIR/has_grepped"

if [ -f "$GREP_FLAG" ]; then
  emit_allow
else
  emit_deny \
    "文件 ${FILE} 有 ${LINES} 行，超过 ${LIMIT} 行阈值。请先用 Grep / codebase_search 定位关键行号区间，再按行号范围读取，不要整份读取大文件。" \
    "已拦截对大文件（${FILE}，${LINES} 行）的整份读取，要求 Agent 先检索再读片段。"
fi
