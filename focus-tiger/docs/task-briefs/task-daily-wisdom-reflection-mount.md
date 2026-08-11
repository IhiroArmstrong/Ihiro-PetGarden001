# Task Brief · Daily Wisdom 挂 Reflection + Sanctuary 静默印花

> **状态（2026-08-12）**：待排期 · **强制拆 Phase A / B**（用户 + 分析师拍板）。  
> **目的**：把已完成的 `<daily-wisdom>` 挂到 Reflect；免费用户见基础句；Sanctuary 用户见静默印花。  
> **原则**：`PRINCIPLES` 经济可持续 +「委婉 vs 硬推销」案例表。

## 「禁付费 CTA」澄清

| 仍禁止 | 允许 |
|---|---|
| 共鸣短句 / echo 里塞硬推销 | Reflection **底部**静静展示 Daily Wisdom |
| 不付费就不让关 Reflection | entitled 时 Wisdom 卡带 **静默印花** |
| FOMO 倒计时 | 未购：基础卡；印花位极淡微标 → 既有 Support（可忽略）；**不**挡 Continue / Skip |

> 静默印花偏留存、非获客主力——见 `PRINCIPLES` 诚实边界与 Backlog「付费转化路径梳理」。

## Phase 拆分（硬）

| Phase | 范围 | 分支建议 | 为何拆 |
|---|---|---|---|
| **A** | Reflection 底部挂**免费** Wisdom 句 | `feature/daily-wisdom-reflection-mount` | 风险低，立刻激活闲置资产；不被印花设计争论拖住 |
| **B** | Sanctuary **静默印花**视觉 + entitled 分支 | `feature/daily-wisdom-sanctuary-seal` | 「隐约但彰显」需反复调；与 Enso 同张力，单独验收 |

**禁止**把 B 塞进 A 同一 PR，除非用户当回合明确要求合并。

## 产品契约（两 Phase 共用）

| 项 | 口径 |
|---|---|
| 挂载点 | Reflection 卡片底部；Honesty→Reflection 同路径 |
| 文案池 | `content.daily-wisdom`；与 Quiet Line **分池** |
| i18n | 既有 Wisdom en/ja |

## 实现要点

### Phase A
1. 挂 `<daily-wisdom>` / 等价渲染。  
2. 单测：可见；Skip 不强制。  
3. TEST_TRACKER Phase A 行。

### Phase B
1. 印花素材 kebab-case；`isEntitled` 样式。  
2. 视觉规格开修前补一行直径/opacity（可对齐 Enso Brief 量级）。  
3. 单测：free vs entitled；点微标开 Support 可关。

## 保护面

- Quiet Line 不变；echo 不改成推销；375 可滚。

## 不做

- Phase A 夹带印花设计争论。  
- 硬拦截关面板。
