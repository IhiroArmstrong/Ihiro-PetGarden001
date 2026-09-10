#!/usr/bin/env bash
# Append `Closes #NNN` to PRs missing task-line refs.
# Requires: repo Settings → General → Issues → auto-close OFF (see WORKFLOW.md git-pr-task-line-ref).
# Mapping is heuristic from changed paths/titles; review before re-running.
# Skip: Dependabot / deps-dev bump PRs (no task line); see WORKFLOW.md git-pr-task-line-ref rule 4.
# Requires: gh token scope repo
# Usage:
#   ./focus-tiger/scripts/backfill-open-pr-task-line-refs.sh [--dry-run]
#   ./focus-tiger/scripts/backfill-open-pr-task-line-refs.sh --merged [--dry-run]

set -euo pipefail

REPO="IhiroArmstrong/Ihiro-PetGarden001"
DRY_RUN=false
SCAN_MERGED=false

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --merged) SCAN_MERGED=true ;;
    *)
      echo "Unknown arg: $arg" >&2
      echo "Usage: $0 [--merged] [--dry-run]" >&2
      exit 1
      ;;
  esac
done

# PR number | task-line issue (see task-lines-issue-map.md)
MAPPINGS=(
  "593|630"
  "595|642"
  "596|642"
  "597|630"
  "598|644"
  "600|646"
  "601|648"
  "602|637"
  "616|630"
  "617|630"
  "626|636"
  # 2026-09-09 backfill: marketing-site (#644) + wisdom-pools (#637)
  "663|644"
  "664|644"
  "665|637"
  "667|644"
  "668|644"
  "669|637"
  "670|637"
  "671|644"
  "672|637"
)

append_ref() {
  local pr="$1" issue="$2"
  local body new_body
  body=$(gh pr view "$pr" --repo "$REPO" --json body -q .body)
  if echo "$body" | grep -qiE 'Closes #[0-9]+'; then
    echo "  #$pr: already has Closes, skip"
    return 0
  fi
  if echo "$body" | grep -qiE 'Relates to #[0-9]+'; then
    echo "  #$pr: has Relates to — migrate manually (Relates to → Closes one line)"
    return 0
  fi
  new_body="${body}

Closes #${issue}"
  if $DRY_RUN; then
    echo "  #$pr → would add Closes #${issue}"
  else
    gh pr edit "$pr" --repo "$REPO" --body "$new_body" >/dev/null
    echo "  #$pr → Closes #${issue} ✓"
  fi
}

want_state="OPEN"
if $SCAN_MERGED; then
  want_state="MERGED"
fi

echo "==> Backfilling ${want_state} PR task-line refs on $REPO"
echo "    (Closes populates Projects Linked pull requests; requires auto-close OFF)"
for row in "${MAPPINGS[@]}"; do
  pr="${row%%|*}"
  issue="${row##*|}"
  state=$(gh pr view "$pr" --repo "$REPO" --json state -q .state 2>/dev/null || echo "MISSING")
  if [[ "$state" != "$want_state" ]]; then
    echo "  #$pr: not $want_state ($state), skip"
    continue
  fi
  append_ref "$pr" "$issue"
done

echo ""
echo "Note: PR #384 (Cursor usage monitor) has no product task line — assign manually if needed."
