# Task Brief · 倾诉贴边暂时停用 + 倾诉卡禁拖

> **状态（2026-10-29）**：PO 书面同意「最合理项」并口令 **「立刻开工、无需点头、连贯执行」**。  
> **类**：**B**（倾诉卡位置与能否拖走）。  
> **分支**：`fix/confide-dock-suspend-no-drag` · 基线 `origin/develop`。

## 一句话

宽屏倾诉卡恢复各宽度**居中**（可能再次挡住阿寅倾听姿态）；倾诉卡**不能**被鼠标拖走。保留 T41 窗口置顶；保留 T42 帮助中心/成长旅程详情靠边。T41「宽屏倾诉不挡脸」在账本上记 **暂时停用**；恢复须单独开刀，**不得**以 lip-sync / 口型同步为恢复条件（产品长期禁止角色口型）。

## 范围

| 做 | 不做 |
|---|---|
| `confidePanelDockPlacement()` 恒 `center`；Confide 样式去掉 `wideSecondaryDockCss` | 回滚 T41 置顶 / Electron always-on-top |
| 倾诉 `#confide-to-yin-card` 不进玻璃卡拖动手柄 | 改 T42 断点 / Help Center / 旅程详情靠边 |
| 回归测 + e2e + tracker / task / issue 旁路 | 改 Confide 发送链 / T38 倾听坐姿逻辑 |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 相邻 | 结论 |
|---|---|
| **AE** 倾诉 | 几何回退；发送/危机/睡态唤醒不变 |
| **T38** 倾听坐姿 | **已知 trade-off**：居中会挡脸；TEST_TRACKER 与十二条对照 #1 记「贴边暂时停用」 |
| **T42** Help / 旅程 | **无冲突**；仍用 `confideDockPlacement` 断点 |
| **Support / 付款** | **无冲突** |

## 点击反馈（0–1 秒）

- 开倾诉：仍 0–1s 淡入；位置居中，**无** grab 光标、空白区拖不动。
- 置顶开关：不变。

## 变体矩阵（A10）

| 变体 | 预期 |
|---|---|
| ≤479 / 480–899 / ≥900 Web | `data-dock=center`；卡水平居中 |
| Electron 宽屏 | 同 Web 几何；置顶仍独立 |
| Help Center ≥900 | 仍 `data-dock=right`（T42 回归） |

## 账本（暂时停用）

- **T41 倾诉贴边**：[`issue-entries/fix-confide-dock-suspend-no-drag.md`](../issue-entries/fix-confide-dock-suspend-no-drag.md) · 十二条 #5 改善句仍 SSOT，执行态 **暂时停用贴边** 至 PO 另开恢复 PR。
- 恢复条件：倾听姿态可见性等产品拍板；**禁止**写「等 lip-sync」。

## 验收

- `confideDockPlacement.test.js` · `glassCardDeck.test.js` · `npm run test:smoke`
- `npm run test:e2e:changed -- e2e/confide-wide-dock.spec.js`
- `npm run test:payment-contract`（玻璃卡共享层）
