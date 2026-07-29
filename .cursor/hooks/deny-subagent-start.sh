#!/usr/bin/env bash
# Hard-deny Task / subagent spawns to control Fast Request / token cost.
# Wired from subagentStart (+ optional preToolUse Task). failClosed in hooks.json.
set -euo pipefail

input="$(cat)"
sub_type="$(python3 -c 'import json,sys
try:
  d=json.load(sys.stdin)
except Exception:
  d={}
print(d.get("subagent_type") or d.get("tool_name") or d.get("tool_type") or "unknown")
' <<<"$input")"

python3 -c 'import json,sys
sub=sys.argv[1]
print(json.dumps({
  "permission": "deny",
  "user_message": "Subagent/Task blocked by project hook (agent-token-cost). Do the work in the parent agent, or temporarily disable .cursor/hooks deny-subagent if you explicitly need a subagent this turn.",
  "agent_message": "deny-subagent-start: blocked subagent_type/tool=" + sub + ". Continue in the parent agent. Do not retry Task/explore/shell subagents.",
}))' "$sub_type"
exit 2
