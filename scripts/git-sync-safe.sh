#!/usr/bin/env bash
# 推送前安全体检 + 可选 push（默认只检查，不推送）。
# 用法：
#   ./scripts/git-sync-safe.sh           # 只报告
#   ./scripts/git-sync-safe.sh --push    # 体检通过后再 git push
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0

echo "=== git status ==="
git status -sb
echo

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "当前分支: $BRANCH"
if [[ "$BRANCH" == "develop" || "$BRANCH" == "main" ]]; then
  echo "❌ 当前在受保护主干（$BRANCH）。禁止直推 origin/$BRANCH；请先切到 feature/* / fix/* / docs/* 等旁支再同步。"
  FAIL=1
fi
echo

AHEAD="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"
BEHIND="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
echo "相对 origin/main: ahead=$AHEAD behind=$BEHIND"
echo

echo "=== 推送前风险扫描 ==="

# 暂存区或工作区是否夹带不该进库的路径
SUSPECT_PATTERNS='node_modules/|\.tools/|\.DS_Store|\.env$|\.env\.|/dist/|\.vite/'
if git status --porcelain | grep -E "$SUSPECT_PATTERNS" >/dev/null 2>&1; then
  echo "❌ 发现可疑路径出现在 status 中（应确保被 .gitignore 挡住且勿手动 add）："
  git status --porcelain | grep -E "$SUSPECT_PATTERNS" || true
  FAIL=1
else
  echo "✓ status 中未见 node_modules / .tools / .env / dist 等"
fi

# 已追踪超大文件警告（>15MB）
echo
echo "已追踪文件中体积 >15MB 的项（若有请评估是否该用 LFS 或移出）："
OVERSIZED=0
while IFS= read -r -d '' f; do
  if [[ -f "$f" ]]; then
    size=$(wc -c <"$f" | tr -d ' ')
    if [[ "$size" -gt 15728640 ]]; then
      echo "  ⚠ $f ($size bytes)"
      OVERSIZED=1
    fi
  fi
done < <(git ls-files -z)
if [[ "$OVERSIZED" -eq 0 ]]; then
  echo "  （无）"
fi

# 提醒未提交改动
if [[ -n "$(git status --porcelain)" ]]; then
  echo
  echo "⚠ 工作区仍有未提交改动。建议先 commit 再 push。"
fi

echo
if [[ "${1:-}" == "--push" ]]; then
  if [[ "$FAIL" -ne 0 ]]; then
    echo "体检未通过，已中止 push。"
    exit 1
  fi
  echo "=== git push（仅当前旁支） ==="
  git push -u origin HEAD
  echo "✓ push 完成；进 develop/main 须另开 PR（--base develop），禁止直推主干"
else
  echo "仅体检。若要推送到 GitHub（旁支），请确认无误后执行："
  echo "  ./scripts/git-sync-safe.sh --push"
  echo "然后开/更新 base=develop 的 PR；禁止 git push origin develop|main"
fi
