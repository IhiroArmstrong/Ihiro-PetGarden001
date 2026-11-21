#!/usr/bin/env bash
# CI 用：带 Tn 的 PR 必须改了文档，或明确勾选「无需改文档」并写明原因。
# 需要环境变量: PR_TITLE PR_BODY PR_HEAD_REF BASE_SHA HEAD_SHA
set -euo pipefail
export LC_ALL=C.UTF-8

# 本仓库实际路径：队列/任务文档在 focus-tiger/docs/（含 task-entries、tracker-entries）。
# 功能 PR 禁止改 TASKS.md 已有段与 GLOSSARY 热点；改 task-entries 即算已同步文档。
DOC_PATTERNS=(
  '^AGENTS\.md$'
  '^WORKFLOW\.md$'
  '^docs/'
  '^focus-tiger/docs/'
  '^\.cursor/rules/'
  '^\.github/PULL_REQUEST_TEMPLATE\.md$'
)

: "${PR_TITLE:=}"; : "${PR_BODY:=}"; : "${PR_HEAD_REF:=}"
: "${BASE_SHA:?需要 BASE_SHA}"; : "${HEAD_SHA:?需要 HEAD_SHA}"

fail() { echo "::error title=task-doc-sync::$*"; echo "❌ $*"; exit 1; }

# 1) 提取 Task ID（分支名 + 标题 + 描述里「任务 ID：」开头的那一行）
# 正文随口出现「任务ID」不算。PETS73 不会被认成 T73。
ids="$(printf '%s\n%s\n%s\n' "$PR_HEAD_REF" "$PR_TITLE" \
        "$(printf '%s\n' "$PR_BODY" | grep -E '^[[:space:]]*[-*]?[[:space:]]*任务 ?ID[[:space:]]*[：:]' || true)" \
  | grep -oiE '(^|[^A-Za-z0-9])T[0-9]+' | sed -E 's/^[^Tt]+//' | tr 't' 'T' | sort -u || true)"

if [ -z "$ids" ]; then
  echo "ℹ️ 分支/标题/描述中无 Tn，跳过检查。"
  exit 0
fi
echo "检测到任务：$(echo $ids)"

# 2) diff 里有没有文档改动
pattern="$(IFS='|'; echo "${DOC_PATTERNS[*]}")"
changed="$(git diff --name-only "${BASE_SHA}...${HEAD_SHA}")"
doc_changed="$(printf '%s\n' "$changed" | grep -E "$pattern" || true)"

# 3) 解析 PR 描述里的勾选项
sync_checked=0; skip_checked=0
printf '%s\n' "$PR_BODY" | grep -qE '^[[:space:]]*[-*] \[[xX]\].*已同步文档' && sync_checked=1
printf '%s\n' "$PR_BODY" | grep -qE '^[[:space:]]*[-*] \[[xX]\].*无需改文档' && skip_checked=1

reason="$(printf '%s\n' "$PR_BODY" | grep -E '原因[：:]' | head -1 \
          | sed -E 's/.*原因[：:][[:space:]]*//; s/[[:space:]]+$//' || true)"

# 4) 判定
if [ -n "$doc_changed" ]; then
  echo "✅ 已包含文档改动："; printf '%s\n' "$doc_changed" | sed 's/^/   - /'
  [ "$sync_checked" -eq 1 ] || echo "⚠ 建议在 PR 描述勾选「已同步文档」。"
  exit 0
fi

# 没有文档改动
if [ "$sync_checked" -eq 1 ]; then
  fail "PR 勾选了「已同步文档」，但 diff 中没有任何文档改动（${pattern}）。请真正更新 $(echo $ids) 在文档中的状态（优先 focus-tiger/docs/task-entries/），或改勾「无需改文档」并写明原因。"
fi

if [ "$skip_checked" -eq 1 ]; then
  case "$reason" in
    ''|待填|xxx|XXX|无|-|…|TBD) fail "勾选了「无需改文档」，但没有写明原因（在「原因：」后填写，至少 6 个字）。" ;;
  esac
  [ "${#reason}" -ge 6 ] || fail "「无需改文档」的原因太短（${#reason} 字），请写清楚为什么本 PR 不影响 $(echo $ids) 的文档状态。"
  echo "✅ 已声明无需改文档，原因：${reason}"
  exit 0
fi

fail "PR 涉及 $(echo $ids)，但没有文档改动，也没有声明豁免。请二选一：(1) 在本 PR 内更新 task-entries / tracker-entries（不要改 TASKS.md 已有段；GLOSSARY 热点走独立 docs PR）；(2) 在 PR 描述勾选「本 PR 无需改文档」并填写原因。"
