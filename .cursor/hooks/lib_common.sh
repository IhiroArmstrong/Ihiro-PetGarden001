#!/usr/bin/env bash
# Shared helpers for token-guardrail hooks. Requires: jq

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOOK_DIR/config.json"
STATE_ROOT="$HOOK_DIR/state"
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

limits_for_tier() {
  local tier="$1" soft hard
  case "$tier" in
    large)
      soft=$(cfg tool_soft_limit_large 64)
      hard=$(cfg tool_hard_limit_large 80)
      ;;
    impl)
      soft=$(cfg tool_soft_limit_impl 40)
      hard=$(cfg tool_hard_limit_impl 50)
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
