#!/usr/bin/env bash
# Hard gate for remote-affecting / destructive git & gh commands.
# Wired from beforeShellExecution (works in Allowlist and Auto-review; not soft classifier steering).
# Matcher in hooks.json should already filter; this script always returns "ask".
set -euo pipefail

input="$(cat)"
cmd="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' <<<"$input")"

python3 -c 'import json,sys
cmd=sys.argv[1]
print(json.dumps({
  "permission": "ask",
  "user_message": "This git/gh command can affect a remote or destroy local state. Confirm before running.",
  "agent_message": "gate-destructive-shell: approval required for: " + cmd[:240],
}))' "$cmd"
