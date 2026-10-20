# Task Brief · 操作动词收紧（T30）

> **状态（2026-10-20）**：**PO 已点头开工**（冻结前修 how-to 过宽；口令「逐个立刻开工」）。本文件锁规格并与实现同批。  
> **类别**：**B 类**（会改变「跳转 / 短答 / 生成」）。  
> **代号**：**T30**。占号仍是 **CR-47** 问法闸切片，不是新的 CR。叠在 **T29**（#1362）之后，**单独 PR**。  
> **时限**：10/21–22 合入；合入后与 T29 一并重跑黄金脚本英文 60 + 安全回归。  
> **分支**：`fix/confide-operational-verb-tighten`（base = T29 旁支，合 T29 后再改指向 `develop`）。  
> **交叉**：[`task-confide-product-ask-operational-gate.md`](./task-confide-product-ask-operational-gate.md) · [`task-confide-object-normalize-redirect-tts.md`](./task-confide-object-normalize-redirect-tts.md) · [`CONFIDE_NOW.md`](../CONFIDE_NOW.md)

---

## 0. 大白话

有人问「怎么理解禅修 / 哲学」时，不该被指去 Help Center。那是想听陪伴说话，不是在找按钮。点哪里、怎么关提醒，仍要跳转。

## 一、拍板锁

1. **改判定机制，不加话题词表。** 禁止把 Zen / philosophy / meditation 写进 keywords、豁免句或拒收表（`R-Confide-No-Symptom-List`）。  
2. **封闭集合是「动词形状」，不是话题。** how-to 后面第一个动词若是认知动词（understand / know / comprehend / grasp / learn about / realize；中文：理解 / 知道 / 认识），则**不是**产品操作 → 走生成。  
3. **后面仍有界面定位或控制动词则保持产品路径。** 例：`how do I know where the backup is` 仍跳转。定位/控制词封闭集：where / which / button / menu / drawer / click / open / set / buy / turn / find / backup / back up / export / restore / enable / disable / reminder。  
4. **只影响产品闸与跳转。** 不碰安全通道、不改 TTS 危机静音。  
5. **黄金脚本不得误伤。** `How can I meditate?`、`How can I do some ground exercise`、`Where is …`、关提醒 / won't stop 仍按现网跳转或诚实空态。英文 38 句情绪 + gs-h01–h11 非跳转行仍 0 次跳转。

**为什么用认知动词集，而不是「操作动词白名单」单独砍掉 how can I：**  
白名单若只留 click / open / set / buy / back up，会把黄金脚本里的 `How can I meditate?`、`How to remind me to practice?`、`How long can I practice breathing?` 一并从跳转拿掉。那是误伤。认知动词集对准实测句 `How to understand Zen practice/philosophy`，形状可增、话题不可增。

**一句话：** understand / know 不是操作；click / where / turn 才是。

## 二、做 / 不做

**做：**

- 抽出 `isConfideCognitiveHowToShape`。  
- 认知 how-to：`classifyConfideProductAskRole` → `none`；操作问法 / 活动 how-to → false；闸 → `skip`（即使目录碰巧命中，也不得念卡、不得跳转）。  
- 单测锁：理解句生成；接地 / 冥想 how-to / 备份 where 仍产品路径。

**不做：**

- 不把 Zen / philosophy 当关键词。  
- 不改 1.7B、不改 embedding 阈值。  
- 不改危机 / 攻击路由。  
- 不做徽章、复述、生成质量（T31–T33）。

## 三、变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期 | 自动化 |
|---|---|---|---|
| 认知 how-to | 倾诉；问卡可点 | `How to understand Zen practice?` → 不跳转、不念卡、闸 skip | 本刀补 |
| 活动 how-to | 同上 | `How can I meditate?` 仍可跳转（黄金脚本） | 现网 + 本刀护栏 |
| 产品 how-to | 接地 / 关提醒 / where | 仍跳转或短答 | 黄金脚本 |
| 认知 + 定位 | `how do I know where the backup is` | 仍产品路径 | 本刀补 |
| 中文 | `如何理解练习` | skip | 本刀补 |
| 情绪 / 危机 | 黄金负例 | 0 跳转 | 黄金脚本 |

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵仅覆盖问法形状。

## 四、点击反馈（0–1 秒）（A14）

本次无可点击交互改动，点击反馈节跳过。发送后等待指示与现网相同；回复来源从 `help_center_redirect` 变为生成。

## 五、边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 目录碰巧命中练习词 | 认知 how-to 仍 skip，不念卡 |
| Help Center 不可达 | 认知 how-to 仍 skip，不改不可达逻辑 |
| embedding 未就绪 | 同一套认知形状 |

## 六、落地

1. `confideCognitiveHowTo.js`：上述两套封闭正则。  
2. 闸函数最前面：认知 how-to → `skip`（在 `catalogHit` 之前）。  
3. 活动 how-to / 操作问法：认知句返回 false。  
4. 禁止为当日原句加 keywords。

## 七、冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE / T23 跳转：** 强度不变——真操作问仍跳。认知问走生成，不把帮助中心当哲学课。  
- **CR-47 诚实空态：** `How can I meditate?` 仍不许现编步骤。  
- **黄金脚本 v1.1：** 跳转正例不得变 skip。  
- **人设：** 阿寅仍是陪伴，不讲课、不念说明书。

**结论：** 无第二项待决。

## 八、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 九、验收

- `How to understand Zen practice?` / `…/philosophy`：闸 skip，不跳转。  
- `How can I meditate?`、接地、关提醒、where 备份：不得变差。  
- `npm run test:smoke`；合入后英文 60 + 安全回归（与 T29 同批窗口）。

## 十、回滚

删认知形状短路，恢复「活动 how-to 即可跳转」。回归用例会红。
