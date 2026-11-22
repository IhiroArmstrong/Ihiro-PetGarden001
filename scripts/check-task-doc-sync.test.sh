#!/usr/bin/env bash
# Local fixture tests for scripts/check-task-doc-sync.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHECK="$ROOT/scripts/check-task-doc-sync.sh"
fail=0

run_case() {
  local name="$1"
  local expect="$2"
  local mutate="$3"
  local title="$4"
  local body="$5"
  local href="$6"
  local tmp
  tmp="$(mktemp -d)"
  git -C "$tmp" init -q
  git -C "$tmp" config user.email t@example.com
  git -C "$tmp" config user.name t
  mkdir -p "$tmp/focus-tiger/docs/task-entries" "$tmp/src"
  echo a > "$tmp/src/a.js"
  echo d > "$tmp/focus-tiger/docs/task-entries/t73.md"
  git -C "$tmp" add .
  git -C "$tmp" commit -qm base
  local base
  base="$(git -C "$tmp" rev-parse HEAD)"
  bash -lc "cd \"$tmp\" && $mutate"
  git -C "$tmp" add -A
  git -C "$tmp" commit -qm head --allow-empty
  local head
  head="$(git -C "$tmp" rev-parse HEAD)"
  local out rc
  set +e
  out="$(
    cd "$tmp" && \
    PR_TITLE="$title" PR_BODY="$body" PR_HEAD_REF="$href" BASE_SHA="$base" HEAD_SHA="$head" \
      bash "$CHECK" 2>&1
  )"
  rc=$?
  set -e
  rm -rf "$tmp"
  if [ "$rc" -eq "$expect" ]; then
    echo "PASS $name (exit $rc)"
  else
    echo "FAIL $name expected $expect got $rc"
    echo "$out"
    fail=1
  fi
}

run_case skip-no-id 0 'echo x >> src/a.js' 'chore: tidy' '任务 ID：无' 'docs/ci'
run_case pets73-not-t73 0 'echo x >> src/a.js' 'fix PETS73' '任务 ID：无' 'fix/pets73'
run_case prose-task-id-not-counted 0 'echo x >> src/a.js' 'chore: tidy' $'正文随口写任务ID和 T73 不算\n' 'docs/ci'
run_case t73-no-docs 1 'echo x >> src/a.js' '[Logic] T73 impl' $'任务 ID：T73\n' 'feature/t73-x'
run_case t73-with-entry 0 'echo done >> focus-tiger/docs/task-entries/t73.md' '[Logic] T73 impl' $'任务 ID：T73\n- [x] 已同步文档（task-entries）' 'feature/t73-x'
run_case t73-skip-reason 0 'echo x >> src/a.js' '[Logic] T73 impl' $'任务 ID：T73\n- [x] 本 PR 无需改文档\n  - 原因：仅改测试夹具不影响任务状态' 'feature/t73-x'
run_case t73-skip-short 1 'echo x >> src/a.js' '[Logic] T73 impl' $'任务 ID：T73\n- [x] 本 PR 无需改文档\n  - 原因：无' 'feature/t73-x'
run_case t73-fake-sync 1 'echo x >> src/a.js' '[Logic] T73 impl' $'任务 ID：T73\n- [x] 已同步文档（task-entries）' 'feature/t73-x'

if [ "$fail" -ne 0 ]; then
  echo "check-task-doc-sync tests failed"
  exit 1
fi
echo "all check-task-doc-sync tests passed"
