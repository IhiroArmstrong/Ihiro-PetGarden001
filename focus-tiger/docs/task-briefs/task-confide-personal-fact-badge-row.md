# Task Brief · 个人事实补徽章行（T31）

> **状态（2026-10-20）**：**PO 已点头开工**（口令「立刻开工」继续 T31；冻结前修徽章答错）。本文件锁规格并与实现同批。  
> **类别**：**B 类**（会改变倾诉可见回复：个人事实短答）。  
> **代号**：**T31**。占号仍是个人事实通道补行，交叉 **CR-06** 的「枚数未接到数据」；**不是**把「徽章能否当寅币」改成诚实空态那一刀。  
> **时限**：10/22–23 合入。合入后与 T29/T30 一并重跑黄金脚本英文 60 + 安全回归。  
> **分支**：`fix/confide-personal-fact-badge-row`（base = `origin/develop`，已含 T29 #1362）。**不**叠 T30。  
> **交叉**：[`confidePracticeFacts.js`](../../src/core/confide/confidePracticeFacts.js) · [`idlePracticeBadges.js`](../../src/core/idlePracticeBadges.js) · [`CONFIDE_NOW.md`](../CONFIDE_NOW.md)

---

## 0. 大白话

问「我有几枚徽章 / 我拿到哪些印记」时，应像「练了多久」一样，读这台设备已经记下的数，不要靠当天那句英文去猜，也不要把下载徽章、徽章当寅币的产品问抢走。

## 一、拍板锁

1. **改判定机制：从用户数据取数，不加当天问法表**（`R-Confide-No-Symptom-List`）。禁止把测到的原句写进 keywords / 拒收表。  
2. **形状 = 第一人称清点。** 问的是这台设备已经显示的枚数或「我有哪些」，对象是徽章 / 印记 / seal / imprint。数据源 = Idle 徽章行同一包（`syncAndReadIdleBadgePack`）。  
3. **个人事实在产品问之前。** `shouldAnswerWithPracticeFacts` 为真时不得进 KB / 跳转。安全通道仍先于个人事实（须 `FALLBACK`）。  
4. **产品操作形状不走本行。** 封闭集：download / 下载、focus coin / 寅币、how to get/earn/buy、可以做（徽章当别的用）。这些仍走现网产品路径（下载卡、诚实空态等）。  
5. **回复只报枚数，不报内部 id，不评判。** 空 = 还没有印记；有 = 这台设备上阿寅身边现在有 N 枚。不点名银章文件名。  
6. **不碰安全通道、不改 TTS、不改付款。**

**为什么这不是「按症状加徽章词」：** 练习时长早已用「问自己的累计」这一形状读 `practiceAggregate`。本刀只把同一形状接到徽章包。下载 / 当寅币用的是操作动词与对象，不是把「badge」做成话题黑名单。

## 二、做 / 不做

**做：**

- `PRACTICE_FACTS_KIND.BADGES`。  
- 单测：清点句走个人事实且读出 ≥3（请茶路径）；下载句、寅币句、how do I get 不走个人事实；危机句仍不偷。

**不做：**

- 不把「徽章是否可以做 focus coin」改成诚实空态（那是 CR-06 旧倾向，本刀不并）。  
- 不列每枚徽章的美术名。  
- 不改 1.7B、不放低 embedding。  
- 不做复述护栏、不做生成路径诊断（T32 / T33）。

## 三、变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期 | 自动化 |
|---|---|---|---|
| 英文枚数 | 倾诉 FALLBACK；请茶已记 | How many badges do I have? → 个人事实，报 N | 本刀补 |
| 英文哪些 | 同上 | Which badges have I earned? → 同一枚数句 | 本刀补 |
| 中文枚数 | 对照 | 我有几枚徽章 → 个人事实 | 本刀补 |
| 下载 | 宽屏 + bridge | Can I download my badge? → 仍可走 KB | 本刀补 + 现网 0036 |
| 寅币 | 同上 | 徽章是否可以做 focus coin → 不走个人事实 | 本刀补 |
| 危机 | 安全路由 | 求死句不得因徽章形状改道 | 现网 + 本刀护栏 |

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵只覆盖问法形状与已有徽章数据源。

## 四、点击反馈（0–1 秒）（A14）

本次无可点击交互改动，点击反馈节跳过。发送后等待指示与现网个人事实相同。

## 五、边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 本机 0 枚 | 空态句，不编造 |
| 请茶 / 免费练习已有印记 | 与 Idle 行同一计数 |
| 安全路由 | 不回答徽章 |
| embedding 未就绪 | 不依赖 embedding |

## 六、落地

1. `confidePracticeFacts.js`：徽章清点形状 + 产品操作排除 + `summarizeIdleBadgeFacts`。  
2. locale slice `confide-practice-badge-facts.json`。  
3. 现网工具 `QUERY_PRACTICE_DURATION` 已按 `shouldAnswerWithPracticeFacts` 执行，无需新 tool id。

## 七、冲突扫描（对照 `SCENARIO_TESTS.md`）

- **场景 AE 倾诉：** 强度与「练了多久」相同——一句短答，不新开面板。  
- **KB-FUNC-0036 下载徽章：** 下载操作形状排除，职责不抢。  
- **请茶 / Sanctuary 付款：** 只读已显示的印记，不开 Checkout。  
- **CR-06 寅币句：** 本刀不改那句的产品回复，只保证它不进个人事实。  
- **人设：** 观察式报数，不说「你很努力所以有徽章」。

**结论：** 无第二项待决。

## 八、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 九、验收

终端：徽章清点单测；下载 / 寅币不误伤；`npm run test:smoke`。  
关单：不声称黄金脚本 60 句已绿；10/24 与 T29/T30 一并重跑。
