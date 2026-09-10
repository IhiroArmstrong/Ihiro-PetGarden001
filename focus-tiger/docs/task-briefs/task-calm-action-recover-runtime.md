# Task Brief · Calm Action Wisdom · Recover 运行时（第一刀）

> **状态（2026-09-09）**：**已合 `develop`**（PR [#625](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/625) · tip `1767995`）；人工验收仍见 `docs/tracker-entries/feature-calm-action-recover-runtime.md`。  
> **父排期**：`taste-layer-calm-action-roadmap.md` · **C1**。  
> **内容 SSOT**：`CALM_ACTION_WISDOM.md`（Recover 段 S/M · 约 14 条 hero）。  
> **用户拍板**：Recover 第一刀；Arrive 第二刀（C1 关单后立刻排）。

## 一句话

在 **Active Recover 打断回来之后**，从 Calm Action **Recover 池**抽一条 S/M 许可句，展示在**独立表面**（卡/次屏）；**不替换**现网 `ACTIVE_RECOVER_*` / `REFOCUS_*` 观察式 toast。

## 已拍板

1. **分池**：Calm Action ≠ Quiet Line ≠ Daily Wisdom ≠ toast 语料。  
2. **语气**：许可、降门槛；观察式 toast **保持原样**（`EMOTION_BIBLE.md`）。  
3. **第一刀只接 Recover**——验证选取/展示/降级机制；overlay **本 PR 不做**（见 roadmap Layer D）。  
4. **权重表生产分叉不做**（roadmap D3）。  
5. 中文 zh 仅 CMS；产品面 **en + ja**。

## 冲突扫描（开工前必填）

对照 `SCENARIO_TESTS` Active Recover / Re-focus / Rise 后 Reflection。

| 轴 | 预期 |
|---|---|
| **a. 强度** | 追加句 ≤ toast 干扰；可 Skip / 自动淡出（待 UI 拍板） |
| **b. 语气** | 行动池许可句；禁止临床标签 / 教练腔 |
| **c. 职责** | ≠ `ACTIVE_RECOVER_*`；≠ Moment Whisper；≠ Reflection echo |

**Arrive 叠层风险本 Brief 不涉及**——故选 Recover 作首次验证（用户 2026-09-07 书面）。

## 实现范围（PR 须交付）

- [ ] Recover 池读取：`CALM_ACTION_WISDOM.md` Recover 段 id → locale 或内联 CMS 表（与项目现有内容加载方式一致）  
- [ ] 选取策略：同日锁 / session 锁（与 Daily Wisdom 不同 key；Brief 定名）  
- [ ] 展示表面：Recover 流程内**新容器**（具体 DOM 位待实现前对照 `LIGHT_PROGRESSION_DESIGN` / Recover 现有 UI）  
- [ ] 离线：无网仍从本地 CMS 表出句  
- [ ] 失败：无句可出 → 静默，不挡 Recover 主路径  
- [ ] 单测：池 id 边界；空池降级  
- [ ] e2e（375）：Recover 路径可见一句 Calm Action 文案（断言 data-testid 或稳定文案前缀）

## 后台网络

**本 PR 不接 overlay**。若预留 hook，须答 `BACKGROUND_NETWORK.md` 三问；默认 **零新增 fetch**。

## 保护面（必复测）

- Re-focus toast 仍出、文案仍为观察式  
- Rise → Reflection 主路径  
- Honesty / Sit 门闩不受影响  
- Idle 呼吸节奏不变  

## 不做

- Arrive / Focus 标语 / Transition / Reflect 接线（C2+）  
- Calm Action overlay / Worker 新路由  
- 日签 14→N  
- 修改 `ACTIVE_RECOVER_*` / `REFOCUS_*` 键  
- 生产权重分叉  

## 验收

1. 本地 Recover 完整路径：打断 → 回来 → toast +（新）Calm Action 句  
2. 回流：同 session 第二场 Recover 行为符合锁策略  
3. `npm run test:smoke` + 新增 e2e 绿  
4. TRACKER 登记「待人工测试」  
5. §7：push + CI 绿后声称关单 → 触发 roadmap **C2 Arrive** 排期
