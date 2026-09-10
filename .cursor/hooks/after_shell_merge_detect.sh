#!/usr/bin/env bash
# afterShellExecution — mark conversation after successful PR merge.
source "$(dirname "${BASH_SOURCE[0]}")/lib_common.sh"

INPUT=$(read_stdin_json)
CID=$(field "$INPUT" '.conversation_id' 'unknown')
COMMAND=$(field "$INPUT" '.command' '')
OUTPUT=$(field "$INPUT" '.output' '')

PATTERN=$(cfg merge_success_pattern 'Merged pull request|Squashed and merged')

if echo "$COMMAND $OUTPUT" | grep -Eiq "$PATTERN"; then
  DIR=$(state_dir_for "$CID")
  touch "$DIR/merged"
fi

echo '{}'
exit 0
