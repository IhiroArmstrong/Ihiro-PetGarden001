#!/usr/bin/env bash
# Shared helpers for token-guardrail hooks. Requires: jq

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOOK_DIR/config.json"
STATE_ROOT="${FOCUS_TIGER_HOOK_STATE_ROOT:-$HOOK_DIR/state}"
mkdir -p "$STATE_ROOT"

cfg() {
  local key="$1" default="$2"
  local val
  val=$(jq -r --arg k "$key" '.[$k] // empty' "$CONFIG_FILE" 2>/dev/null)
  [ -z "$val" ] && val="$default"
  echo "$val"
}

read_stdin_json() {
  cat
}

field() {
  local json="$1" path="$2" default="${3:-}"
  local val
  val=$(echo "$json" | jq -r "$path // empty" 2>/dev/null)
  [ -z "$val" ] && val="$default"
  echo "$val"
}

safe_id() {
  echo "$1" | tr -c 'A-Za-z0-9_.-' '_'
}

state_dir_for() {
  local cid
  cid=$(safe_id "$1")
  local d="$STATE_ROOT/$cid"
  mkdir -p "$d"
  echo "$d"
}

emit_allow() {
  echo '{"permission":"allow"}'
  exit 0
}

emit_deny() {
  jq -n --arg a "$1" --arg u "$2" \
    '{permission:"deny", agentMessage:$a, userMessage:$u}'
  exit 2
}

emit_ask() {
  jq -n --arg a "$1" --arg u "$2" \
    '{permission:"ask", agentMessage:$a, userMessage:$u}'
  exit 0
}

budget_tier_file() {
  echo "$(state_dir_for "$1")/budget_tier"
}

read_budget_tier() {
  local cid="$1" default="${2:-qa}"
  local f
  f=$(budget_tier_file "$cid")
  if [ -f "$f" ]; then
    cat "$f"
  else
    echo "$default"
  fi
}

write_budget_tier() {
  local cid="$1" tier="$2"
  echo "$tier" > "$(budget_tier_file "$cid")"
}

reset_tool_count() {
  local cid="$1"
  echo "0" > "$(state_dir_for "$cid")/tool_count"
}

explore_streak_file() {
  echo "$(state_dir_for "$1")/explore_streak"
}

read_explore_streak() {
  local cid="$1" f val
  f=$(explore_streak_file "$cid")
  val=0
  [ -f "$f" ] && val=$(cat "$f")
  [ -z "$val" ] && val=0
  echo "$val"
}

write_explore_streak() {
  local cid="$1" streak="$2"
  echo "$streak" > "$(explore_streak_file "$cid")"
}

reset_explore_streak() {
  write_explore_streak "$1" 0
}

is_productive_write() {
  local tool="$1" n
  n=$(printf '%s' "$tool" | tr '[:upper:]' '[:lower:]')
  case "$n" in
    strreplace|write|*strreplace*|*write*)
      return 0
      ;;
  esac
  return 1
}

limits_for_tier() {
  local tier="$1" soft hard
  case "$tier" in
    large)
      soft=$(cfg tool_soft_limit_large 64)
      hard=$(cfg tool_hard_limit_large 80)
      ;;
    impl)
      soft=$(cfg tool_soft_limit_impl 40)
      hard=$(cfg tool_hard_limit_impl 64)
      ;;
    qa|*)
      soft=$(cfg tool_soft_limit_qa 22)
      hard=$(cfg tool_hard_limit_qa 28)
      ;;
  esac
  echo "$soft $hard"
}

classify_prompt_tier_action() {
  local prompt="$1"
  if echo "$prompt" | grep -qE '大任务'; then
    echo large
  elif echo "$prompt" | grep -qE '开工'; then
    echo impl
  elif echo "$prompt" | grep -qE '继续'; then
    echo continue
  else
    echo unchanged
  fi
}

# Pull a field from preToolUse JSON (tool_input / arguments / top-level).
json_tool_field() {
  local json="$1" key="$2"
  echo "$json" | jq -r --arg k "$key" '
    (.tool_input // {})[$k] // (.arguments // {})[$k] // .[$k] // empty
  ' 2>/dev/null
}

# 0 = this call counts against explore budget; 1 = productive / verify, skip count.
is_explore_budgeted() {
  local json="$1"
  local tool n path offset limit cmd thresh lines
  tool=$(field "$json" '.tool_name' '')
  n=$(printf '%s' "$tool" | tr '[:upper:]' '[:lower:]')

  case "$n" in
    grep|glob|*grep*|*glob*|*codebase_search*|websearch|webfetch|web_search|web_fetch|*searchconversations*|task)
      return 0
      ;;
  esac

  if printf '%s' "$n" | grep -qE '^(read|read_file|readfile)$'; then
    local short_thresh max_span has_offset has_limit read_span
    path=$(json_tool_field "$json" path)
    [ -z "$path" ] && path=$(json_tool_field "$json" file_path)
    offset=$(json_tool_field "$json" offset)
    limit=$(json_tool_field "$json" limit)
    if [ -z "$path" ] || [ ! -f "$path" ]; then
      return 1
    fi
    short_thresh=$(cfg short_file_lines 200)
    max_span=$(cfg max_productive_read_span 200)
    lines=$(wc -l < "$path" 2>/dev/null | tr -d ' ')
    [ -z "$lines" ] && lines=0
    if [ "$lines" -lt "$short_thresh" ]; then
      return 1
    fi
    has_offset=0
    has_limit=0
    [ -n "$offset" ] && [ "$offset" != "null" ] && has_offset=1
    [ -n "$limit" ] && [ "$limit" != "null" ] && has_limit=1
    if [ "$has_offset" -eq 0 ] && [ "$has_limit" -eq 0 ]; then
      return 0
    fi
    read_span=0
    if [ "$has_limit" -eq 1 ]; then
      read_span=$limit
    elif [ "$has_offset" -eq 1 ]; then
      read_span=$((lines - offset + 1))
      [ "$read_span" -lt 0 ] && read_span=0
    fi
    if [ "$read_span" -gt "$max_span" ]; then
      return 0
    fi
    return 1
  fi

  if printf '%s' "$n" | grep -qE '^(shell|bash|terminal)$'; then
    cmd=$(json_tool_field "$json" command)
    if printf '%s' "$cmd" | grep -qiE '(^|[;&|[:space:]])(rg|grep|egrep|fgrep|find|ag|ack)[[:space:]]'; then
      return 0
    fi
    if printf '%s' "$cmd" | grep -qiE 'git[[:space:]]+grep'; then
      return 0
    fi
    return 1
  fi

  return 1
}
