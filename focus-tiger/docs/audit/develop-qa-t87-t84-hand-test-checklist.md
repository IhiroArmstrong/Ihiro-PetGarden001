# T87 · T77 · T78 · T81–T84 · develop QA 关单级手测

> 环境：**develop QA worktree** · Vite `:5173`（见 [`WORKFLOW.md`](../../WORKFLOW.md) `qa-develop-worktree`）。  
> 自动化已跑：见治理 PR 描述 · `node --test` T87/T77/T78/T81 契约集。  
> 人只补：观感、叠层、未同意不上传。

## T87 稳定偏好（`stable-prefs.v1`）

1. 空状态：首次选 Focus 分钟并开练 → 本地写入 `focus-tiger.stable-prefs.v1`（备份导出含 `stable_prefs` 段）。
2. 改选再开练 → 滚动计票更新；L2 在约定入口可说常做分钟（不说疗效）。
3. 「不是这样」/ 忘掉路径 → 不再当常做配置推销续练位。

## T77 续练位

1. 已有稳定 Focus 配置时，会话起点见 `[data-testid=co-practice-continue-slot]`（续练按钮）。
2. 点续练 → 用常做配置一键开练（v1 **无**时段词文案）。
3. 窄屏 / 宽屏专注中续练位服从叠层仲裁（不挡付款/Support 受保护路径）。

## T78 Breath / Companion

1. Breath：选非常用分钟并完成一次计时 → 写入稳定 Breath 维度（与 Focus 分轨）。
2. Companion：切换稳定模式 → 再次开练沿用；与 T77 续练位不打架。

## T82 研究共修同意（Practice Study）

1. 偏好菜单 → **practice-study**（独立入口；**不在** Privacy 勾选里藏开关）。
2. 未同意：面板说明完整；**不应**发起周汇总上传。
3. 同意并保存 → `focus-tiger.co-practice-research-consent.v1` 为真。

## T83 首次坐后轻提示

1. 全新 journey（或清相关键）完成**第一次**有效坐 → 出现研究定位邀请（不打断安全/付款叠层）。
2. 关闭后按产品规则不再骚扰。

## T84 问号与隐私三层

1. 同意面板 / Help 问号 → 见 Practice Study 定位句 + 隐私政策三层（无疗效/临床断言）。
2. 与 [`PRIVACY_NOTICE.md`](../PRIVACY_NOTICE.md) 研究段落一致。

## T81 上传（仅同意 + 调度）

1. 同意为真且到达周调度窗口 → 客户端组包仅白名单字段（无倾诉原文）。
2. 撤回同意 → 不再 POST；ledger/schedule 键行为与单测 golden 一致。

## 贴回模板（PO / 手测）

```
develop QA 树路径：
T87/T77/T78/T81–T84 手测：✅ / ❌ / 未跑
备注（叠层/文案/上传）：
自动化 node --test：✅ / ❌
```