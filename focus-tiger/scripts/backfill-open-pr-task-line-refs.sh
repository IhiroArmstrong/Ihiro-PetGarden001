#!/usr/bin/env bash
# Append `Closes #NNN` to open PRs missing task-line refs.
# Requires: repo Settings → General → Issues → auto-close OFF (see WORKFLOW.md git-pr-task-line-ref).
# Mapping is heuristic from changed paths/titles; review before re-running.
# Requires: gh token scope repo
# Usage: ./focus-tiger/scripts/backfill-open-pr-task-line-refs.sh [--dry-run]

set -euo pipefail

REPO="IhiroArmstrong/Ihiro-PetGarden001"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# PR number | task-line issue (see task-lines-issue-map.md)
MAPPINGS=(
  "558|630"
  "559|630"
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

echo "==> Backfilling open PR task-line refs on $REPO"
echo "    (Closes populates Projects Linked pull requests; requires auto-close OFF)"
for row in "${MAPPINGS[@]}"; do
  pr="${row%%|*}"
  issue="${row##*|}"
  state=$(gh pr view "$pr" --repo "$REPO" --json state -q .state 2>/dev/null || echo "MISSING")
  if [[ "$state" != "OPEN" ]]; then
    echo "  #$pr: not open ($state), skip"
    continue
  fi
  append_ref "$pr" "$issue"
done

echo ""
echo "Note: PR #384 (Cursor usage monitor) has no product task line — assign manually if needed."
