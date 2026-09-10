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
