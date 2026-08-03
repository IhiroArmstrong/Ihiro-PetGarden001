# Task Brief · Hints 视觉护栏试点（④）

**日期**：2026-08-03  
**状态**：试点实现中  
**分支**：`feature/hints-visual-guardrail-pilot-2026-08-03`  
**所属**：`HINTS_WIRING.md` §八 ④ · 与 Backlog「Hints anchor e2e bounding rect」合并试点  
**拍板依据**：用户书面——有意义、中等风险则安排；用自动化早抓尖角偏移 / mint→奶油色等**机械回归**；**不**替代人工观感验收。

---

## 一句话目标

给关键 Hints chrome 加一层 **抗 flaky 的机械护栏**，使「改字体 / z-index / 窄宽 remap / 玻璃泡样式」时，尖角偏了半厘米、薄荷绿褪成奶油色这类回归在 CI 上尽早红——**观感是否合格仍以 TEST_TRACKER 人工书面为准**。

---

## 选型（为何不是「全页截图」）

| 方案 | 抓 tip 偏移 | 抓 mint→奶油 | flaky 风险 | 本试点 |
|---|---|---|---|---|
| A. 全页 PNG（含 Yin 序列） | 可 | 可 | **高**（动画帧） | ❌ 不做 |
| B. 仅 tip 元件软快照 + `animations: 'disabled'` | 可（色/形） | tip 本体可 | **中** | ✅ 1 条基线 |
| C. Mint RGB / 几何 boundingBox 契约 | 几何可 | mint 可 | **低** | ✅ 主护栏 |
| D. Chromatic / 第三方视觉 SaaS | 可 | 可 | 中 + 运维成本 | ❌ 暂不引入 |

**结论**：以 **C 为主、B 为辅**；明确 **人工验收仍是观感关单权威**（禁止用「有快照了」冲淡 TEST_TRACKER）。

---

## 已好清单（不变量）

1. 既有 e2e 契约仍绿：`onboarding-remedy-contract` / `wide-idle-more-menu` / `micro-ritual`。  
2. Mint 产品色仍为 `#6db3a0`（右上音符 `has-hint-mint::after`）。  
3. Tip 气泡仍为薄荷绿渐变（`#eef6f1` → `#dceae2`），**不是**奶油帮 `?` 钮那套 `#fff8ec` / `#f0dfc4`。  
4. `help-affordance` tip 尖角侧对准「?」（placement `right` / tip `left`）。  
5. **不**改产品运行时行为；仅加测试 + 文档口径。

## 保护面

- Idle / Sit / Arrival / Emotion 序列观感  
- 全量 e2e 时长（本试点单文件，进 `test:e2e:changed` / 后续再决定是否进 smoke）

## 契约锁法

| 契约 | 锁法 |
|---|---|
| 音符 mint 为绿系 `#6db3a0` 邻域，非奶油米黄 | e2e computedStyle RGB |
| `help-affordance` tip 在「?」右侧且水平邻接 | e2e boundingBox |
| tip 气泡表面薄荷绿（非奶油帮） | e2e soft `toHaveScreenshot`（仅 bubble） |
| 观感关单 / 触屏键盘故事 | **仍人工** · TEST_TRACKER |

---

## ✅ 本任务要做

1. Brief（本文件）+ `HINTS_WIRING` / `PROCESS` / `TEST_TRACKER` / `ONBOARDING_HINTS` 口径更新。  
2. `e2e/hints-visual-guardrail.spec.js` + 必要 helper；生成 tip 软快照基线并入库。  
3. 本地 `test:e2e:changed -- e2e/hints-visual-guardrail.spec.js` 绿后 commit；开 PR → develop。

## ❌ 本任务明确不做

- ❌ 全页 / Yin 入镜快照  
- ❌ 立刻覆盖全部 hintId（先关键：mint + help tip；后续按簇扩）  
- ❌ 宣称「有快照 = 可关人工行」  
- ❌ 引入 Chromatic 等第三方  
- ❌ viewport-context 壳层解耦（⑤）

---

## 验收

- 本地：本 spec 全绿（含 tip 软快照 PNG，darwin）。  
- CI：默认跑 **mint RGB + tip 几何 + tip 面板色**（跨平台）；软快照默认跳过（防 darwin/linux AA flaky），需要时 `FT_HINTS_SOFT_SNAP=1` + 提交对应平台基线。  
- 更新软快照须显式 `--update-snapshots` 且 PR 说明「为何改基线」。  
- 人工：本轮**不**邀关单级观感验收（无产品行为变更）；TRACKER 登记自动化护栏行。
