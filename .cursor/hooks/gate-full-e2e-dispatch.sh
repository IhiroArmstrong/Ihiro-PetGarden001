#!/usr/bin/env bash
# Require user confirmation before dispatching full e2e (or long CI watches).
# Wired from beforeShellExecution. Matcher should already narrow candidates.
set -euo pipefail

input="$(cat)"
cmd="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' <<<"$input")"

python3 -c 'import json,sys,re
cmd=sys.argv[1]
# Long sleeps used to poll CI / hang the agent turn
if re.search(r"\bsleep\s+(?:[6-9]\d|\d{3,})\b", cmd):
  print(json.dumps({
    "permission": "ask",
    "user_message": "Long sleep detected — likely CI polling. Confirm only if you intentionally want the agent to wait.",
    "agent_message": "gate-full-e2e-dispatch: refuse long sleep polling; trigger once, return the run URL, stop.",
  }))
  raise SystemExit(0)
if re.search(r"gh\s+workflow\s+run\b", cmd, re.I) and re.search(r"e2e|full", cmd, re.I):
  print(json.dumps({
    "permission": "ask",
    "user_message": "This dispatches full/long e2e on GitHub Actions. Confirm before running.",
    "agent_message": "gate-full-e2e-dispatch: full e2e dispatch needs explicit user approval this turn.",
  }))
  raise SystemExit(0)
if re.search(r"gh\s+run\s+(?:watch|rerun)\b", cmd, re.I):
  print(json.dumps({
    "permission": "ask",
    "user_message": "gh run watch/rerun can burn agent turns. Confirm before running.",
    "agent_message": "gate-full-e2e-dispatch: do not watch long CI in-session; give the URL and stop.",
  }))
  raise SystemExit(0)
print(json.dumps({"permission": "allow"}))
' "$cmd"
