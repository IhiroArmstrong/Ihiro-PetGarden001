#!/usr/bin/env bash
# Hard-deny Cursor IDE Browser MCP (cursor-ide-browser) to cut Agent token + energy cost.
# Wired from beforeMCPExecution (+ optional preToolUse MCP matcher). failClosed in hooks.json.
# Override: user must temporarily disable this hook entry (same pattern as deny-subagent).
set -euo pipefail

input="$(cat)"

python3 -c '
import json, sys, re

try:
    d = json.load(sys.stdin)
except Exception:
    d = {}

server = str(
    d.get("server")
    or d.get("mcp_server")
    or d.get("serverName")
    or d.get("server_name")
    or ""
)
tool = str(
    d.get("toolName")
    or d.get("tool_name")
    or d.get("tool")
    or d.get("name")
    or ""
)
# preToolUse may pass tool_type / toolName like "MCP: cursor-ide-browser / browser_navigate"
blob = " ".join(
    str(d.get(k) or "")
    for k in (
        "server",
        "mcp_server",
        "serverName",
        "server_name",
        "toolName",
        "tool_name",
        "tool",
        "name",
        "tool_type",
        "command",
        "url",
    )
).lower()

is_ide_browser = bool(
    re.search(r"cursor-ide-browser", blob)
    or re.search(r"\bbrowser_(navigate|snapshot|click|type|fill|lock|tabs|cdp|take_screenshot|hover|select_option|press_key|scroll|drag|get_bounding_box|highlight|mouse_click_xy)\b", blob)
    or (server.lower() in ("cursor-ide-browser", "cursor-browser") and tool)
)

if not is_ide_browser:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

detail = (server or "cursor-ide-browser") + "/" + (tool or "unknown")
print(json.dumps({
    "permission": "deny",
    "user_message": "Cursor IDE Browser MCP blocked by project hook (browser-energy). Preview in Safari with the local URL; for narrow viewports use Safari Responsive Design Mode (or real phone). To allow IDE Browser temporarily, disable .cursor/hooks deny-ide-browser-mcp this turn.",
    "agent_message": "deny-ide-browser-mcp: blocked " + detail + ". Do not retry browser_* / cursor-ide-browser. Give the user a local URL for Safari; narrow QA via Safari Responsive Design Mode or Playwright e2e — never IDE Browser.",
}))
raise SystemExit(2)
' <<<"$input"
exit $?
