#!/usr/bin/env bash
# Setup GitHub Projects v2 board for Focus Tiger task lines.
# Requires: gh >= 2.94, token scopes project + read:project
# Usage: ./focus-tiger/scripts/setup-task-line-project-board.sh

set -euo pipefail

OWNER="IhiroArmstrong"
REPO="IhiroArmstrong/Ihiro-PetGarden001"
PROJECT_TITLE="Focus Tiger 开发任务线看板"
TASK_LINE_FIELD="任务线"
# Group by Labels is unsupported in Projects V2 UI/API; use 任务线 single-select.
VIEW_NAME="按任务线分组"

# Epic #627-647 (skip #16 slot) + audit/slice #648-650
ISSUES=(
  627 628 629 630 631 632 633 634 635 636 637
  638 639 640 641 642 643 644 645 646 647
  648 649 650
)

die() { echo "ERROR: $*" >&2; exit 1; }

need_scope() {
  if ! gh project list --owner "$OWNER" --limit 1 >/dev/null 2>&1; then
    die "gh token missing project scope. Run: gh auth refresh -h github.com -s project,read:project"
  fi
}

need_scope

echo "==> Creating project (or reusing if title exists)..."
EXISTING_NUM=$(gh project list --owner "$OWNER" --format json --limit 100 \
  | jq -r --arg t "$PROJECT_TITLE" '.projects[] | select(.title==$t) | .number' | head -1)

if [[ -n "$EXISTING_NUM" && "$EXISTING_NUM" != "null" ]]; then
  PROJECT_NUM="$EXISTING_NUM"
  echo "    Reusing existing project #$PROJECT_NUM"
else
  PROJECT_NUM=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json | jq -r .number)
  echo "    Created project #$PROJECT_NUM"
fi

PROJECT_ID=$(gh project view "$PROJECT_NUM" --owner "$OWNER" --format json | jq -r .id)
PROJECT_URL="https://github.com/users/$OWNER/projects/$PROJECT_NUM"
echo "    URL: $PROJECT_URL"

echo "==> Ensuring fields..."
FIELD_JSON=$(gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json)
STATUS_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="状态") | .id' | head -1)
WAVE_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="排期波次") | .id' | head -1)

if [[ -z "$STATUS_FIELD_ID" || "$STATUS_FIELD_ID" == "null" ]]; then
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" \
    --name "状态" --data-type "SINGLE_SELECT" \
    --single-select-options "待细化,进行中,阻塞,完结"
  FIELD_JSON=$(gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json)
  STATUS_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="状态") | .id')
  echo "    Created field: 状态"
else
  echo "    Field exists: 状态"
fi

if [[ -z "$WAVE_FIELD_ID" || "$WAVE_FIELD_ID" == "null" ]]; then
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" \
    --name "排期波次" --data-type "SINGLE_SELECT" \
    --single-select-options "可并行,待解锁"
  FIELD_JSON=$(gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json)
  WAVE_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="排期波次") | .id')
  echo "    Created field: 排期波次"
else
  echo "    Field exists: 排期波次"
fi

WAVE_PARALLEL_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="排期波次") | .options[] | select(.name=="可并行") | .id')
WAVE_BLOCKED_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="排期波次") | .options[] | select(.name=="待解锁") | .id')

TASK_LINE_OPTIONS=(
  core-practice rituals-custom-share social-circle monetization-tiers
  mac-dmg-release focus-coin-collections five-moments-expansion
  personalization-engine local-ai-operating reset-return wisdom-pools
  onboarding-goal-questions confide-ai-ritual yin-evolution i18n
  local-data-import-export journey-log marketing-site art-polish
  anti-plagiarism-layer phase1-a-b-c-testing audit-cold-start
)
TASK_LINE_FIELD_ID=$(echo "$FIELD_JSON" | jq -r --arg n "$TASK_LINE_FIELD" '.fields[] | select(.name==$n) | .id' | head -1)

if [[ -z "$TASK_LINE_FIELD_ID" || "$TASK_LINE_FIELD_ID" == "null" ]]; then
  gh project field-create "$PROJECT_NUM" --owner "$OWNER" \
    --name "$TASK_LINE_FIELD" --data-type "SINGLE_SELECT" \
    --single-select-options "$(IFS=,; echo "${TASK_LINE_OPTIONS[*]}")"
  FIELD_JSON=$(gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json)
  TASK_LINE_FIELD_ID=$(echo "$FIELD_JSON" | jq -r --arg n "$TASK_LINE_FIELD" '.fields[] | select(.name==$n) | .id')
  echo "    Created field: $TASK_LINE_FIELD"
else
  echo "    Field exists: $TASK_LINE_FIELD"
fi

line_slug_for_issue() {
  local n="$1"
  case "$n" in
    648) echo "audit-cold-start" ;;
    *) gh issue view "$n" --repo "$REPO" --json labels \
      --jq '[.labels[].name | select(startswith("line:"))][0] // "" | sub("^line:"; "")' ;;
  esac
}

option_id_for_slug() {
  local slug="$1"
  echo "$FIELD_JSON" | jq -r --arg n "$TASK_LINE_FIELD" --arg s "$slug" \
    '.fields[] | select(.name==$n) | .options[] | select(.name==$s) | .id' | head -1
}

echo "==> Adding ${#ISSUES[@]} issues..."
WAVE_RESULTS=()
for N in "${ISSUES[@]}"; do
  URL="https://github.com/$REPO/issues/$N"
  ITEM_ID=$(gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$URL" --format json 2>/dev/null | jq -r '.id' || true)
  if [[ -z "$ITEM_ID" || "$ITEM_ID" == "null" ]]; then
    ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$OWNER" --format json --limit 200 \
      | jq -r --argjson n "$N" '.items[] | select(.content.type=="Issue" and .content.number==$n) | .id' | head -1)
  fi
  [[ -n "$ITEM_ID" && "$ITEM_ID" != "null" ]] || die "Failed to add or find item for #$N"

  BLOCKED=$(gh issue view "$N" --repo "$REPO" --json blockedBy --jq '.blockedBy.totalCount')
  if [[ "$BLOCKED" -gt 0 ]]; then
    WAVE="待解锁"
    OPT_ID="$WAVE_BLOCKED_ID"
  else
    WAVE="可并行"
    OPT_ID="$WAVE_PARALLEL_ID"
  fi
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$WAVE_FIELD_ID" --single-select-option-id "$OPT_ID"

  LINE_SLUG=$(line_slug_for_issue "$N")
  if [[ -n "$LINE_SLUG" ]]; then
    LINE_OPT_ID=$(option_id_for_slug "$LINE_SLUG")
    [[ -n "$LINE_OPT_ID" && "$LINE_OPT_ID" != "null" ]] || die "No 任务线 option for slug: $LINE_SLUG (#$N)"
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$TASK_LINE_FIELD_ID" --single-select-option-id "$LINE_OPT_ID"
  fi

  WAVE_RESULTS+=("#$N → $WAVE | 任务线=$LINE_SLUG")
  echo "    #$N: $WAVE | 任务线=$LINE_SLUG"
done

echo "==> Linking repository to project..."
gh project link "$PROJECT_NUM" --owner "$OWNER" --repo "$REPO" 2>/dev/null || true
echo "    Linked: $REPO"

echo "==> Ensuring table view '$VIEW_NAME'..."
LINKED_PR_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="Linked pull requests") | .id' | head -1)
LABELS_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="Labels") | .id' | head -1)
VIEW_ID=$(gh api graphql -f query="
  query {
    user(login: \"$OWNER\") {
      projectV2(number: $PROJECT_NUM) {
        views(first: 20) { nodes { id name } }
      }
    }
  }" | jq -r --arg n "$VIEW_NAME" '.data.user.projectV2.views.nodes[] | select(.name==$n) | .id' | head -1)

if [[ -z "$VIEW_ID" || "$VIEW_ID" == "null" ]]; then
  VIEW_ID=$(gh api graphql -f query="
    mutation {
      createProjectV2View(input: {
        projectId: \"$PROJECT_ID\"
        name: \"$VIEW_NAME\"
        layout: TABLE_LAYOUT
        configuration: {
          visibleFieldIds: [\"$TASK_LINE_FIELD_ID\", \"$STATUS_FIELD_ID\", \"$WAVE_FIELD_ID\", \"$LINKED_PR_FIELD_ID\", \"$LABELS_FIELD_ID\"]
        }
      }) {
        projectV2View { id name }
      }
    }" | jq -r '.data.createProjectV2View.projectV2View.id')
  echo "    Created view: $VIEW_NAME"
else
  echo "    Reusing view: $VIEW_NAME"
fi

gh api graphql -f query="
  mutation {
    updateProjectV2View(input: {
      viewId: \"$VIEW_ID\"
      filter: \"is:issue\"
      configuration: {
        visibleFieldIds: [\"$TASK_LINE_FIELD_ID\", \"$STATUS_FIELD_ID\", \"$WAVE_FIELD_ID\", \"$LINKED_PR_FIELD_ID\", \"$LABELS_FIELD_ID\"]
      }
    }) {
      projectV2View { id name filter }
    }
  }" >/dev/null
echo "    View filter: is:issue (Linked pull requests column fills when PR body uses Closes #NNN; auto-close must be OFF — see WORKFLOW.md)"

echo "==> Project workflows (enable in UI if any missing)..."
gh api graphql -f query="
  query {
    user(login: \"$OWNER\") {
      projectV2(number: $PROJECT_NUM) {
        workflows(first: 20) { nodes { name enabled } }
      }
    }
  }" | jq -r '.data.user.projectV2.workflows.nodes[] | "    \(if .enabled then "✓" else "○" end) \(.name)"'

echo ""
echo "==> Manual UI step (API cannot set Group by):"
echo "    Open $PROJECT_URL → view '$VIEW_NAME' → Group by → $TASK_LINE_FIELD"
echo "    Enable workflow: Pull request linked to issue (new PRs auto-add to board)"

echo ""
echo "========== SUMMARY =========="
echo "Project: $PROJECT_URL"
echo "Fields: 状态 ✓ | 排期波次 ✓ | $TASK_LINE_FIELD ✓ (状态留空，请手动标注)"
echo "View: $VIEW_NAME ✓ (filter is:issue; Linked pull requests ← Closes #NNN in PR body)"
echo "Repo link: $REPO ✓"
echo "Items: ${#ISSUES[@]} issues"
echo ""
echo "排期波次判定:"
printf '  %s\n' "${WAVE_RESULTS[@]}"
echo "=============================="
