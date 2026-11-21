#!/usr/bin/env bash
# 用法: scripts/task-preflight.sh T73
# 作用: 开工前查询 develop 上是否已有该任务的合并记录。
# 退出码: 0 = 未发现已合并记录；10 = 发现已合并记录（请先读 PR 判断范围是否已覆盖）
# 环境变量: BASE_BRANCH（默认 develop）
set -uo pipefail
export LC_ALL=C.UTF-8

TASK="${1:?用法: scripts/task-preflight.sh T73}"
TASK="$(printf '%s' "$TASK" | tr 't' 'T')"
BASE="${BASE_BRANCH:-develop}"
RE="(^|[^A-Za-z0-9])${TASK}([^0-9]|$)"
export TASK_RE="$RE"
hits=0

echo "▶ 预检 ${TASK}（基线 origin/${BASE}）"
git fetch origin --prune --quiet || echo "⚠ git fetch 失败，结果可能不是最新"

echo
echo "── [1] origin/${BASE} 上的 commit（标题/正文含 ${TASK}）"
commits="$(git log "origin/${BASE}" -i -E --grep="$RE" --pretty='%h %ad %s' --date=short | head -30)"
if [ -n "$commits" ]; then echo "$commits"; hits=$((hits + $(printf '%s\n' "$commits" | wc -l))); else echo "（无）"; fi

echo
echo "── [2] 已合并 PR（base=${BASE}）"
if command -v gh >/dev/null 2>&1; then
  merged="$(gh pr list --state merged --base "$BASE" --search "$TASK" --limit 100 \
    --json number,title,body,mergedAt,url \
    --jq '.[] | select((.title + " " + (.body // "")) | test(env.TASK_RE; "i"))
          | "#\(.number)  \(.mergedAt[:10])  \(.title)\n      \(.url)"' 2>/dev/null)"
  if [ -n "$merged" ]; then echo "$merged"; hits=$((hits + $(printf '%s\n' "$merged" | grep -c '^#'))); else echo "（无）"; fi

  echo
  echo "── [3] 未合并的 open PR（不得另开同内容旁支）"
  open="$(gh pr list --state open --search "$TASK" --limit 50 \
    --json number,title,body,headRefName,url \
    --jq '.[] | select((.title + " " + (.body // "") + " " + .headRefName) | test(env.TASK_RE; "i"))
          | "#\(.number)  [\(.headRefName)]  \(.title)\n      \(.url)"' 2>/dev/null)"
  if [ -n "$open" ]; then echo "$open"; else echo "（无）"; fi
else
  echo "⚠ 未安装 gh，跳过 PR 查询（仅凭 commit 结果判断不充分，请手动查 GitHub）"
fi

echo
echo "── [4] 远程分支"
br="$(git branch -r 2>/dev/null | grep -iE "$RE" || true)"
[ -n "$br" ] && echo "$br" || echo "（无）"

echo
if [ "$hits" -gt 0 ]; then
  cat <<MSG
⚠ 发现 ${TASK} 的已合并记录。请：
  1) 读上面 PR 的标题/描述/改动文件，判断是否已覆盖本次请求的具体范围（Tn 可能分多刀）；
  2) 若已覆盖 → 停止实现；同一轮内修复所有仍写「待做/立即做」的文档并开 docs PR；
  3) 回复第一行写：预检结论：${TASK}（范围）已由 #xxxx 合入 develop，不重开实现；文档已过期。
MSG
  exit 10
else
  echo "✅ develop 上无 ${TASK} 相关合并记录，可按口令开工（回复第一行注明预检结果）。"
  exit 0
fi
