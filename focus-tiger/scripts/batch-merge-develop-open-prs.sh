#!/usr/bin/env bash
# Merge origin/develop into open PR branches that GitHub reports as CONFLICTING.
# Semantic conflicts in queue docs must be resolved manually — script aborts those merges.
# If the only conflicts are docs:sync machine blocks, keep origin/develop and finish.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
git fetch origin develop

MANUAL_LIST="${TMPDIR:-/tmp}/pr-queue-manual-merge.txt"
: > "$MANUAL_LIST"

# Must match focus-tiger/scripts/docs-sync.js DOCS_SYNC_MACHINE_BLOCK_PATHS (repo-root paths).
is_docs_sync_machine_block() {
  case "$1" in
    focus-tiger/docs/ONBOARDING_HINTS.md|\
    focus-tiger/docs/HINTS_WIRING.md|\
    focus-tiger/docs/SHARED_RESOURCES.md|\
    focus-tiger/docs/ARCHITECTURE.md|\
    focus-tiger/docs/RULES_INDEX.md|\
    focus-tiger/docs/kb-live-entry-registry.md|\
    focus-tiger/docs/kb-live-gap-audit.md|\
    focus-tiger/docs/practice-aggregate-registry.md|\
    focus-tiger/docs/GROWTH_METRICS_CHARTER.md)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

unmerged_are_machine_blocks_only() {
  local f
  while IFS= read -r f; do
    [[ -z "$f" ]] && continue
    if ! is_docs_sync_machine_block "$f"; then
      return 1
    fi
  done
  return 0
}

push_branch() {
  local branch="$1"
  # pre-push startup smoke uses Playwright; empty sandbox cache breaks push.
  unset PLAYWRIGHT_BROWSERS_PATH || true
  git push origin "HEAD:${branch}"
}

while read -r num branch; do
  [[ -n "$num" ]] || continue
  echo "=== PR #$num ($branch) ==="
  git fetch origin "$branch"
  work="tmp-merge-develop-$branch"
  git worktree remove "$REPO_ROOT/../.wt-batch-$num" 2>/dev/null || true
  wt="$REPO_ROOT/../.wt-batch-$num"
  git worktree add -B "$work" "$wt" "origin/$branch"
  pushd "$wt" >/dev/null
  set +e
  git merge origin/develop --no-edit
  merge_rc=$?
  set -e
  if [[ "$merge_rc" -eq 0 ]]; then
    push_branch "$branch"
    echo "#$num pushed after clean merge"
  else
    unmerged="$(git diff --name-only --diff-filter=U)"
    printf '%s\n' "$unmerged"
    if [[ -n "$unmerged" ]] && printf '%s\n' "$unmerged" | unmerged_are_machine_blocks_only; then
      echo "#$num docs:sync machine blocks only — keep origin/develop"
      while IFS= read -r f; do
        [[ -z "$f" ]] && continue
        git checkout origin/develop -- "$f"
      done <<<"$unmerged"
      while IFS= read -r f; do
        [[ -z "$f" ]] && continue
        git add -- "$f"
      done <<<"$unmerged"
      git commit --no-edit -m "merge origin/develop; keep develop docs:sync machine blocks"
      push_branch "$branch"
      echo "#$num pushed after machine-block auto-resolve"
    else
      echo "#$num needs manual queue-doc alignment:"
      git diff --name-only --diff-filter=U || true
      git merge --abort
      echo "$num $branch" >> "$MANUAL_LIST"
    fi
  fi
  popd >/dev/null
  git worktree remove "$wt" --force 2>/dev/null || true
  git branch -D "$work" 2>/dev/null || true
done < <(
  gh pr list --state open --base develop --json number,headRefName,mergeable \
    --jq '.[] | select(.mergeable=="CONFLICTING") | "\(.number) \(.headRefName)"'
)

if [[ -s "$MANUAL_LIST" ]]; then
  echo "Manual merges required:"
  cat "$MANUAL_LIST"
  exit 1
fi

echo "Done — no CONFLICTING PRs left (or none were open)."
