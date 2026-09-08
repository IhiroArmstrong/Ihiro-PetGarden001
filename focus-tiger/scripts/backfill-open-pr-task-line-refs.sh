#!/usr/bin/env bash
# Append `Relates to #NNN` to open PRs missing task-line refs.
# Mapping is heuristic from changed paths/titles; review before re-running.
# Requires: gh token scope repo
# Usage: ./focus-tiger/scripts/backfill-open-pr-task-line-refs.sh [--dry-run]

set -euo pipefail

REPO="IhiroArmstrong/Ihiro-PetGarden001"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# PR number | Epic issue (see task-lines-issue-map.md)
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
  local pr="$1" epic="$2"
  local body new_body
  body=$(gh pr view "$pr" --repo "$REPO" --json body -q .body)
  if echo "$body" | grep -qiE 'Relates to #[0-9]+|Closes #[0-9]+'; then
    echo "  #$pr: already referenced, skip"
    return 0
  fi
  new_body="${body}

Relates to #${epic}"
  if $DRY_RUN; then
    echo "  #$pr → would add Relates to #${epic}"
  else
    gh pr edit "$pr" --repo "$REPO" --body "$new_body" >/dev/null
    echo "  #$pr → Relates to #${epic} ✓"
  fi
}

echo "==> Backfilling open PR task-line refs on $REPO"
for row in "${MAPPINGS[@]}"; do
  pr="${row%%|*}"
  epic="${row##*|}"
  state=$(gh pr view "$pr" --repo "$REPO" --json state -q .state 2>/dev/null || echo "MISSING")
  if [[ "$state" != "OPEN" ]]; then
    echo "  #$pr: not open ($state), skip"
    continue
  fi
  append_ref "$pr" "$epic"
done

echo ""
echo "Note: PR #384 (Cursor usage monitor) has no product task line — assign manually if needed."
echo "After refs are added, linked PRs may need gh project item-add if workflow did not retro-add them."
