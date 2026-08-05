# Task Brief · logged-debt batch #1 / #3 / #4

**分支**：`fix/logged-debt-batch-134`  
**worktree**：`…-wt-logged-debt-batch-134`  
**来源**：`LOGGED_NOT_FIXED_AUDIT.md` 分析师答复（2026-08-05）——纯缺陷小改三条合成一批，**不含** #5 文案 / #2 Hints 再设计 / #6 Recover Brief。

---

## 范围（仅此）

| 审计 # | 做什么 | 不做什么 |
|---|---|---|
| **#1** | `completionPending` 时 Sit/Rise **禁用**（或不可点），禁止「可点但静默 return」 | 不改完成反馈动画本身 |
| **#3** | `playEmotion`：`!started` 统一 `console.warn`；hold 调试 key 抽成导出示 SSOT + 单测 | 不改情绪优先级 / 不重写编排 |
| **#4** | Visibility `gap-*` 四行收成 `locked`（补窄/宽锚点或承认宽屏 visible 已够） | 不跑全量 visibility CI 本地长守；用 changed-spec / smoke |

## 已好清单（不变量）

- Companion 点选门闩 / Arrival 回流契约不变  
- Idle 呼吸→眨眼不闪  
- 微仪式期间 Sit 已禁用路径仍可用  
- `docs:check` 机器块仍绿  

## 验收

- `npm run test:smoke`  
- `npm run test:e2e:changed --` 相关 spec（completion / visibility 锚点 / companion）  
- `TEST_TRACKER` 登记；`EDGE_CASES` #5 / #17–19 标已排期或已修；审计表 #1/#3/#4 建议列更新  

## 刻意不做

- #5 SessionComplete 观察式文案  
- #2 Hints 整体再设计 Brief  
- #6 主动 Recover Brief  
