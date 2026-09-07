# 给 Cursor 的批量建库 Prompt（最终合并版）

> 使用方法：草案已入库 `focus-tiger/docs/planning/task-lines-epic-draft.md`。把下面这整段交给 Cursor 执行（幂等：label `--force`、Issue 按标题跳过已存在）。

---

## 0. 前置检查

先执行 `gh --version`，确认 ≥ 2.94.0（需要 `--blocked-by` / `--parent` 原生支持）。低于这个版本就先提醒我升级，不要用 `gh api` 硬绕。

## 1. 先建全部 label（幂等，可重复跑）

```bash
# 21 条线的 label（对应 slug，跳过已作废的 #16）
gh label create "line:core-practice" --color "1D76DB" --description "Sit & Breath & Honesty 基础练习" --force
gh label create "line:rituals-custom-share" --color "1D76DB" --description "Rituals + 自定义 Ritual + 分享至 Circle" --force
gh label create "line:social-circle" --color "1D76DB" --description "Social & Circle" --force
gh label create "line:monetization-tiers" --color "1D76DB" --description "Support Yin & Stripe 支付/付费层级管理" --force
gh label create "line:mac-dmg-release" --color "1D76DB" --description "苹果 DMG 发布准备" --force
gh label create "line:focus-coin-collections" --color "1D76DB" --description "Focus Coin & Collections" --force
gh label create "line:five-moments-expansion" --color "1D76DB" --description "Five Moments 场景功能扩充" --force
gh label create "line:personalization-engine" --color "1D76DB" --description "Yin's Personalization Engine 算法层" --force
gh label create "line:local-ai-operating" --color "1D76DB" --description "Local AI Operating 层" --force
gh label create "line:reset-return" --color "1D76DB" --description "Ground Exercise & Reset and Return" --force
gh label create "line:wisdom-pools" --color "1D76DB" --description "金句库/三池 + 逐步接线" --force
gh label create "line:onboarding-goal-questions" --color "1D76DB" --description "Onboarding 提问" --force
gh label create "line:confide-ai-ritual" --color "1D76DB" --description "Confide 与 AI 仪式应用" --force
gh label create "line:yin-evolution" --color "1D76DB" --description "Yin Evolution：终身分钟莲花池" --force
gh label create "line:i18n" --color "1D76DB" --description "多语言（全局兼容约束）" --force
gh label create "line:local-data-import-export" --color "1D76DB" --description "本地数据导入导出" --force
gh label create "line:journey-log" --color "1D76DB" --description "Journey Log" --force
gh label create "line:marketing-site" --color "1D76DB" --description "市场官网" --force
gh label create "line:art-polish" --color "1D76DB" --description "美术优化（全局兼容约束）" --force
gh label create "line:anti-plagiarism-layer" --color "1D76DB" --description "防剽窃层" --force
gh label create "line:phase1-a-b-c-testing" --color "1D76DB" --description "Local AI Phase 1A/1B/1C 验收（挂在 confide-ai-ritual 下）" --force

# 类型 label
gh label create "type:epic" --color "5319E7" --description "Epic Issue，代表一条长期开发任务线" --force
gh label create "type:audit" --color "B60205" --description "短命审计/收口条目，解锁下游线开工口令" --force
gh label create "type:slice" --color "FBCA04" --description "Epic 下的具体切片子 Issue" --force
```

## 2. 批量建 21 个 Epic Issue

读取 `docs/planning/task-lines-epic-draft.md` 里的"线一览表"。对表里 #1–#22（**跳过 #16**，它已作废，合并进 #8）逐行执行：

1. **幂等检查**：先 `gh issue list --search "in:title [线] {线名}"`，如果标题已存在就跳过，不要建重复 Issue。
2. 不存在则：
   ```
   gh issue create \
     --title "[线] {线名}" \
     --body "<用文件里的 Epic Issue 正文模板渲染>" \
     --label "line:{slug}" --label "type:epic"
   ```
   渲染规则：把该行"Epic 级关系"列的内容拆进模板对应的 耦合/兼容/排期建议 字段；"串行依赖"和"被谁依赖"两个字段**默认写"无"**（唯一例外是 #12 和 #2，见第 3 步，先留空占位，等第 3 步建完依赖节点后回填）。
3. 记录每条创建后的 issue 号，回填一份 `docs/planning/task-lines-issue-map.md`（线名 → issue 号），后面挂 Project 看板要用。

## 3. 处理仅有的两处真先后关系

**A. Onboarding 提问 blocked by 冷启动第一幕审计**

```bash
gh issue create \
  --title "[审计] 冷启动第一幕审计" \
  --body "收口后解锁 Onboarding 提问 Epic 开工口令" \
  --label "type:audit"
# 记下返回的 issue 号为 AUDIT_NUM
gh issue edit <Onboarding提问的issue号> --add-blocked-by AUDIT_NUM
```

**B. Rituals 分享切片 blocked by Circle 可分享基建切片**

```bash
gh issue create \
  --title "[切片] Circle 可分享基建" \
  --parent <social-circle的issue号> \
  --label "line:social-circle" --label "type:slice"
# 记下返回的 issue 号为 CIRCLE_SHARE_NUM

gh issue create \
  --title "[切片] Ritual 分享到 Circle" \
  --parent <rituals-custom-share的issue号> \
  --blocked-by CIRCLE_SHARE_NUM \
  --label "line:rituals-custom-share" --label "type:slice"
```

自定义 Ritual 本身不建子 Issue、不受此依赖影响，仍挂在 #2 Epic 下正常并行。

**除以上两处，不要给任何 Epic 加 `--blocked-by` 或 `--blocking`。**

## 4. 收尾

把 `docs/planning/task-lines-issue-map.md` 更新完整后，跑完把创建结果（成功 / 跳过 / 失败）汇总给我看一遍，**不要静默执行完就结束**——尤其是失败项（常见原因：label 没建成功、issue 号填错），要能一眼看出哪几条需要我手动补。
