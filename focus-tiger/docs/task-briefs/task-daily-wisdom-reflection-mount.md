# Task Brief · Daily Wisdom 挂 Reflection + Sanctuary 静默印花

> **状态（2026-08-11）**：待排期 · 用户拍板要做。  
> **目的**：把已完成的 `<daily-wisdom>` 挂到 Reflect（专注结束 / Honesty 补登后的 Reflection）；免费用户见基础句；Sanctuary / Membership 用户见**委婉隐蔽**的专属印花层——付费价值可感，但不把共鸣句改成推销。  
> **原则**：`PRINCIPLES` 经济可持续；**澄清**旧「Reflection 禁付费 CTA」口径（见下）。

## 「禁付费 CTA」澄清（2026-08-11）

| 仍禁止 | 允许（本任务鼓励） |
|---|---|
| 共鸣短句 / echo 里塞「Buy Tea / Unlock now / 不买就怎样」 | Reflection **底部**静静展示 Daily Wisdom |
| 硬拦截：不付费就不让关 Reflection | `isEntitled`（lifetime∪subscription）时，Wisdom 卡带 **Sanctuary 手绘/高颜值印花**（美术库静帧） |
| FOMO 倒计时 | 未付费：基础卡；印花位可极淡 lock / 「Sanctuary」微标，点按打开 **既有** Support Modal（可忽略） |

> 旧 Brief `task-reflection-echo-copy-pool.md` 的「禁止塞 Buy Tea / Sanctuary CTA **进共鸣句**」**仍然有效**。  
> **不是**禁止一切付费感知；禁止的是把观察式陪伴改成硬推销。

## 产品契约

| 项 | 口径 |
|---|---|
| 挂载点 | Tiger Reflection Moment 卡片**底部**（共鸣句之下或旁）；Honesty 完成后若进 Reflection 同样可见 |
| 文案池 | **继续** `content.daily-wisdom`；与 Quiet Line **分池** |
| 免费 | 基础 Wisdom 句；完整温暖 |
| B | 同句 + 专属印花/边饰（用户将提供或从美术库选）；读 `isEntitled`，**零** tip 耦合 |
| 未授权点印花位 | 可选：打开 Support（可关）；**禁止**挡 Continue / Skip |
| i18n | 既有 Wisdom en/ja；chrome 键对齐 |

## 实现要点（将来）

1. Reflection UI `import` + 挂 `<daily-wisdom>`（或等价渲染）。  
2. 印花：`public/ui/...` kebab-case；`isEntitled` 分支样式。  
3. 单测：挂载可见；free vs entitled 印花差；Skip Reflection 不要求 Wisdom。  
4. `FREE_PAID_MATRIX`：Daily Wisdom → 部分接线改「已接线（Reflection）」；可增 B 印花行。  
5. TEST_TRACKER 新行 + 更新 Daily Wisdom 旧行落点。

## 保护面

- Quiet Line 菜单存图不变。  
- echo 文案池不改成推销。  
- 窄屏 375 Reflection 可滚动、不挡主球。

## 建议分支

`feature/daily-wisdom-reflection-mount`

## 分阶段（若一次过大）

1. **Phase A**：只挂免费句（激活闲置）。  
2. **Phase B**：Sanctuary 印花（素材到位后；可同 PR 若素材已入）。
