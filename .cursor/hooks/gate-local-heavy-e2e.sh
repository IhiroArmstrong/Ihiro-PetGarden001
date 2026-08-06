#!/usr/bin/env bash
# Deny local heavy Playwright / multi-spec e2e in Agent shells (permission: deny).
# Wired from beforeShellExecution. Soft-docs alone are not enough (e2e-local-budget).
#
# Precedent: this repo's other beforeShellExecution / MCP hooks already parse
# stdin JSON with python3 (gate-full-e2e-dispatch.sh, gate-destructive-shell.sh,
# deny-subagent-start.sh, deny-ide-browser-mcp.sh).
#
# Known limitation (intentionally not solved this round):
#   The matcher counts *.spec.* filenames across the *entire* shell command string.
#   Chaining two each-compliant one-spec invocations with && or ; — e.g.
#     npm run test:e2e:changed -- e2e/a.spec.js && npm run test:e2e:changed -- e2e/b.spec.js
#   — will FALSE-POSITIVE deny (2 specs visible in one string).
#   Workarounds: run one command per Agent tool call; or RUN_E2E_LOCAL=true.
#   Opposite gap: obfuscation / env-built paths may FALSE-NEGATIVE; npm script
#   budget in run-e2e-changed.js remains the durable gate for npm run paths.
set -euo pipefail

input="$(cat)"
cmd="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' <<<"$input")"

python3 - "$cmd" <<'PY'
import json, sys, re

cmd = sys.argv[1]


def allow(msg=None):
    out = {"permission": "allow"}
    if msg:
        out["agent_message"] = msg
    print(json.dumps(out))
    raise SystemExit(0)


def deny(user, agent):
    print(
        json.dumps(
            {
                "permission": "deny",
                "user_message": user,
                "agent_message": agent,
            }
        )
    )
    raise SystemExit(0)


# Escape hatch in the command string (npm/scripts still print console warn)
if re.search(r"\bRUN_E2E_LOCAL\s*=\s*true\b", cmd):
    allow("gate-local-heavy-e2e: RUN_E2E_LOCAL=true — allowed; scripts must warn.")

# Always-allowed local smoke paths
if re.search(r"\bnpm\s+run\s+test:e2e:smoke\b", cmd):
    allow()
if re.search(r"\bnpm\s+run\s+test:pr-smoke\b", cmd):
    allow()
if re.search(r"\bnpm\s+run\s+test:e2e:install\b", cmd):
    allow()

# Full / visibility via npm — deny locally (package guard is backup)
if re.search(r"\bnpm\s+run\s+test:e2e:visibility\b", cmd):
    deny(
        "test:e2e:visibility is CI-only. Use push/PR CI, or RUN_E2E_LOCAL=true.",
        "gate-local-heavy-e2e: blocked test:e2e:visibility (e2e-local-budget).",
    )
# Bare test:e2e (not test:e2e:*)
if re.search(r"\bnpm\s+run\s+test:e2e\b", cmd) and not re.search(
    r"\bnpm\s+run\s+test:e2e:", cmd
):
    deny(
        "Full test:e2e is CI-only. Local: test:e2e:smoke or test:e2e:changed -- <one spec>.",
        "gate-local-heavy-e2e: blocked full test:e2e (e2e-local-budget).",
    )

# changed: allow only if exactly 1 *.spec.* appears in the whole command string
# (see header Known limitation for && / ; chaining false-positives).
if re.search(r"\bnpm\s+run\s+test:e2e:changed\b", cmd):
    specs = re.findall(r"\S+\.spec\.(?:js|ts|mjs|cjs)\b", cmd, flags=re.I)
    # bare e2e/ or e2e directory without a *.spec.* file → deny
    has_bare_e2e_dir = bool(
        re.search(r"(?:^|\s)(?:\./)?e2e/??(?:\s|$)", cmd)
    ) and not specs
    if has_bare_e2e_dir or len(specs) != 1:
        deny(
            "Local test:e2e:changed hard cap = 1 *.spec.* file per shell string. "
            "Push multi-spec to CI, or RUN_E2E_LOCAL=true. "
            "Note: chaining two one-spec commands with &&/; also trips this gate.",
            "gate-local-heavy-e2e: blocked multi/empty-spec test:e2e:changed (e2e-local-budget).",
        )
    allow()

# Direct playwright / npx playwright test
if re.search(r"\b(?:npx\s+)?playwright\s+test\b", cmd, re.I):
    # allow the fixed smoke file set used by test:e2e:smoke
    if re.search(r"product-shell\.smoke\.spec\.js", cmd) and re.search(
        r"scenario-a\.companion\.spec\.js", cmd
    ):
        allow("gate-local-heavy-e2e: allow smoke-shaped playwright invocation.")
    specs = re.findall(r"\S+\.spec\.(?:js|ts|mjs|cjs)\b", cmd, flags=re.I)
    if len(specs) == 1:
        allow()
    deny(
        "Direct playwright test with 0 or >1 specs is blocked locally. "
        "Use npm run test:e2e:changed -- <one spec>, or RUN_E2E_LOCAL=true.",
        "gate-local-heavy-e2e: blocked heavy/direct playwright test (e2e-local-budget).",
    )

allow()
PY
