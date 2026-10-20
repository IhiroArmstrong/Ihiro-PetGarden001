#!/usr/bin/env bash
# Merge origin/develop into open PR branches that GitHub reports as CONFLICTING.
# Semantic conflicts in queue docs must be resolved manually — script aborts those merges.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"
git fetch origin develop

MANUAL_LIST="${TMPDIR:-/tmp}/pr-queue-manual-merge.txt"
: > "$MANUAL_LIST"

while read -r num branch; do
  [[ -n "$num" ]] || continue
  echo "=== PR #$num ($branch) ==="
  git fetch origin "$branch"
  work="tmp-merge-develop-$branch"
  git worktree remove "$REPO_ROOT/../.wt-batch-$num" 2>/dev/null || true
  wt="$REPO_ROOT/../.wt-batch-$num"
  git worktree add -B "$work" "$wt" "origin/$branch"
  pushd "$wt" >/dev/null
  if git merge origin/develop --no-edit; then
    git push origin "HEAD:$branch"
    echo "#$num pushed after clean merge"
  else
    echo "#$num needs manual queue-doc alignment:"
    git diff --name-only --diff-filter=U || true
    git merge --abort
    echo "$num $branch" >> "$MANUAL_LIST"
  fi
  popd >/dev/null
  git worktree remove "$wt" --force 2>/dev/null || true
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
