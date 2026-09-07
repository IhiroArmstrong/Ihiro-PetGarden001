#!/usr/bin/env bash
# Setup GitHub Projects v2 board for Focus Tiger task lines.
# Requires: gh >= 2.94, token scopes project + read:project
# Usage: ./focus-tiger/scripts/setup-task-line-project-board.sh

set -euo pipefail

OWNER="IhiroArmstrong"
REPO="IhiroArmstrong/Ihiro-PetGarden001"
PROJECT_TITLE="Focus Tiger 开发任务线看板"
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
LABELS_FIELD_ID=$(echo "$FIELD_JSON" | jq -r '.fields[] | select(.name=="Labels") | .id' | head -1)

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

if [[ -z "$LABELS_FIELD_ID" || "$LABELS_FIELD_ID" == "null" ]]; then
  # Labels is a built-in field; re-fetch if missing
  LABELS_FIELD_ID=$(gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json \
    | jq -r '.fields[] | select(.name=="Labels") | .id')
fi

echo "==> Adding ${#ISSUES[@]} issues..."
WAVE_RESULTS=()
for N in "${ISSUES[@]}"; do
  URL="https://github.com/$REPO/issues/$N"
  ITEM_ID=$(gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$URL" --format json 2>/dev/null | jq -r '.id' || true)
  if [[ -z "$ITEM_ID" || "$ITEM_ID" == "null" ]]; then
    # Already added — look up item id
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
  WAVE_RESULTS+=("#$N → $WAVE")
  echo "    #$N: $WAVE"
done

echo "==> Creating table view grouped by Labels (if not exists)..."
VIEWS_JSON=$(gh api "users/$OWNER/projectsV2/$PROJECT_NUM/views" 2>/dev/null || echo '{"views":[]}')
EXISTING_VIEW=$(echo "$VIEWS_JSON" | jq -r --arg n "$VIEW_NAME" '.views[]? | select(.name==$n) | .id' | head -1)

if [[ -n "$EXISTING_VIEW" && "$EXISTING_VIEW" != "null" ]]; then
  echo "    View exists: $VIEW_NAME"
else
  REST_FIELDS=$(gh api "users/$OWNER/projectsV2/$PROJECT_NUM/fields?per_page=100")
  LABELS_REST_ID=$(echo "$REST_FIELDS" | jq -r '.[] | select(.data_type=="labels") | .id' | head -1)
  VISIBLE_REST=$(echo "$REST_FIELDS" | jq '[.[] | select(.name=="Title" or .name=="状态" or .name=="排期波次" or .name=="Labels") | .id]')
  gh api "users/$OWNER/projectsV2/$PROJECT_NUM/views" \
    --method POST \
    --input - <<EOF
{
  "name": "$VIEW_NAME",
  "layout": "table",
  "group_by": [$LABELS_REST_ID],
  "visible_fields": $VISIBLE_REST
}
EOF
  echo "    Created view: $VIEW_NAME (grouped by Labels / line:* labels)"
fi

echo ""
echo "========== SUMMARY =========="
echo "Project: $PROJECT_URL"
echo "Fields: 状态 ✓ | 排期波次 ✓ (状态留空，请手动标注)"
echo "Items: ${#ISSUES[@]} issues"
echo ""
echo "排期波次判定:"
printf '  %s\n' "${WAVE_RESULTS[@]}"
echo "=============================="
