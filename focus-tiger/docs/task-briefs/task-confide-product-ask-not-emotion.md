# Task Brief · 产品问不得进情绪路径（从 CR-11 拆出）

> **状态（2026-10-17）**：**规格待点头**。PO 已书面同意拆、同意先写本说明；**点头本文件才许改发送链**。本 PR 只锁规格与书面锁，不改 `focus-tiger/src`。  
> **类别**：**B 类**（会改变用户听到的倾诉回复来源）。  
> **跟进号**：**CR-52**。不是 CR-11、不是 CR-45、不是 CR-47 的重做。  
> **分支建议**：规格本支 `docs/confide-cr52-product-ask-not-emotion`；实现另口令「按 CR-52 Brief 开工」用 `fix/confide-product-ask-not-emotion`。  
> **交叉**：[`task-confide-routing-holdout-caliber-split.md`](./task-confide-routing-holdout-caliber-split.md) · [`task-confide-product-ask-operational-gate.md`](./task-confide-product-ask-operational-gate.md)（CR-47）· [`task-confide-mixed-emotion-then-product.md`](./task-confide-mixed-emotion-then-product.md)（CR-45）· [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md) 场景 AE · [`CONFIDE_STATUS.md`](../CONFIDE_STATUS.md) G2

---

## 0. 大白话（给拍板用）

有人在问产品怎么用（例如旅程页累计时长，目录里已有 `KB-FUNC-0012`），问法稍偏就会先被送去情绪陪伴，短答没有开口的机会。这是**顺序**问题，不是分数门槛问题。

整套路由一次打分改到用户能听到的回复上（CR-11）继续等它自己的关单。这一刀只做一件事：**已经确认是「操作问法 ∧ 产品对象」的句子，不得进情绪语料 / 观察翼。** 对上卡就念短答，对不上就诚实空态。

不重新出题。英文未见卷继续封存。修完、本刀验收过了，再用那份卷看「产品问进情绪」是不是 0 句。

---

## 一、拍板锁（点头即锁）

1. **只用已有的窄信号** `isConfideOperationalProductAskShape`（CR-47 操作问法）**并且**要有产品对象（目录命中是充分条件，不是唯一条件）。**不用**已停的「是不是在问产品」宽影子维（仓外 `voided-ask-intent-shadow-STOP.md`）。  
2. **不调 0.01。** 不加新关键词、不加当天问法名单（`PRINCIPLES.md` R-Confide-No-Symptom-List）。  
3. **安全转介、指向他人的攻击路由仍最先。** 本刀插在它们之后、情绪桶之前。  
4. **不接 CR-45 合并回应。** 贴边混合句用户这一刀仍然听不到「先情绪再产品」；那是 CR-45 live，仍等 CR-11。  
5. **不切 CR-11 仲裁 live。** 函数 A 一次打分仍是影子。  
6. **窄屏 / 网页仍不 generate**（CR-40）。本刀在那些表面上仍只改「语料 vs 短答/空态」，不新开生成。

### 接线顺序（实现须照此，本 PR 不写代码）

现网伤人岔路有两处，都要堵，且都只在「操作问法 ∧ 产品对象」为真时：

| 口子 | 今天 | 本刀 |
|---|---|---|
| `confideClassify` 情绪桶 | 情绪短语先命中 → 语料，产品闸根本轮不到 | 安全 / 攻击之后：若操作问法 ∧ 产品对象 → 视为 fallback，交给产品闸 |
| `resolveProductKnowledgeGateAction` 的 `lifeOrMoodSkip` | 生活分或中文情绪否决更高 → `skip`，即使已是操作问法 | 操作问法 ∧ 产品对象时不得因这两项 `skip`；对上卡 `hit`，否则 `honesty` |

目录已经过「这张卡答的是这一问」的短答，今天就会先念，本刀不改这条。

**禁止**只凭形状（`怎么办` / `how do I`）抬进产品闸。没有产品对象的倾诉（例如在问怎么睡着、怎么办才好过）必须仍走情绪或生成。

### 误伤句会听到什么

被误判成「操作问法 ∧ 产品对象」的情绪句：

- 目录命中且过事实门 → 念该条**短答**（功能说明书口吻）。  
- 否则 → 诚实空态，英文现网句是：*Yin doesn't keep a manual for that. Open Help Center from the menu, or email hello@twinsology.com.* 中文 / 日文见 [`confide-product-knowledge-honesty.json`](../../src/locales/slices/confide-product-knowledge-honesty.json)。

在倾诉场景里，这两种都比陪伴差。所以下面有数字上限；超了就不上线，而不是靠文案把空态写得更软（本刀不改空态金句）。

---

## 二、点头前误伤计数（只报数字 · 已跑）

**材料**：已停宽影子笔记点名的同一批作废中文卷 `sealed-b-v2` / `b-v5` / `b-v6`（仓外，不占额）。计数脚本只读 `isConfideOperationalProductAskShape` + 现网 `confideClassify`，**不**重跑宽维 embedding，**不**打印原句。

**读数日**：2026-10-17。b-v6 句型偏整齐，与停笔记同一句提醒：不当成「已经干净」。

| 范围 | n | 窄信号命中 | 其中现网已进情绪桶（本刀会改口的上界） |
|---|---|---|---|
| 倾诉三类合计 `life-emotion` ∪ `chitchat` ∪ `mixed-emotion-dominant` | 484 | **16（3.3%）** | **3（0.6%）** |
| 其中 `chitchat` | 162 | 5（3.1%） | 0 |
| 其中 `life-emotion` | 162 | 10（6.2%） | 3（1.9%） |
| 其中 `mixed-emotion-dominant` | 160 | 1（0.6%） | 0 |
| 权重较高的 b-v2+b-v5 · `life-emotion` | 102 | 10（9.8%） | 3（2.9%） |

对照：已停宽维在笔记里写的是「和函数 A 做或会把闲聊拉到 85% 以下」。**那条不用。** 窄信号在同一批作废卷上低一个数量级。

`life-emotion` 上「形状命中但现网仍是 fallback」还有约 10%（b-v2/b-v5）。那些句今天已经能进产品闸；本刀若误把「仅形状」当成产品对象，它们可能从生成改成空态。故实现必须 **∧ 产品对象**，并在实现 PR 用同一作废集再跑一遍「接线后 `data-source` 会改口」的计数（仍只报数字、不回写原句）。

### 误伤上限（超过则不上线）

在 **`life-emotion` ∪ `chitchat`**（不含贴边混合类）上：

1. **规格点头可用本表**：现网情绪桶会被本刀改口的上界 **3/324（0.9%）**，低于下面的线。  
2. **实现 PR 关单**：同一作废三文件上，因本刀而**新**从陪伴（情绪语料或 generate）改成短答或诚实空态的句数 **≤ 5%**，且每个文件不超过 **4 句**。超过 → 不上线，收紧「产品对象」判定（仍禁止加话题关键词），另报数字。  
3. 宽维影子**不得**为凑这个数而重开。

徽章类不走这条误伤分母；徽章硬闸见第四节。

---

## 三、变体矩阵（A10）

同一入口：倾诉卡 Share / Enter。本刀改的是**回复来源**，不是新练习或付款。

| 变体 | 入口 / 前置 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| en Electron 宽屏 · embedding ready | 操作问法 ∧ 产品对象（含目录外功能） | 0–1 秒内发送钮按压/「正在听」；回复 `product_knowledge` 或 `product_knowledge_honesty`，**禁止** `corpus` 情绪桶 / 观察翼 | 本刀补单测；e2e 沿用诚实空态 spec |
| zh / ja 同入口 | 同上 | 同源规则；空态用对应 locale 金句 | 单测 locale 切片已有空态句 |
| Web / 窄屏（CR-40） | 同上 | 仍不 generate；产品问不得改口成情绪 `corpus` | 单测 / Web harness 不生成 |
| embedding 未 ready | 操作问法 ∧ 产品对象 | 冷启动同一套问法：有卡短答，无卡空态，不得干等后再进情绪桶 | 单测 `embeddingState !== 'ready'` |
| 安全 / 攻击句 | 危机或指向他人 | **仍** `safety_redirect` / `aggression_toward_others`，本刀不可达 | 已有 AE 单测，本刀加「不得被操作问法抢走」 |

---

## 四、点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 倾诉 Share 或 textarea Enter | 发送钮按压 / disabled；已有等待或「正在听」；随后 `[data-testid=confide-to-yin-reply]` 出现。本刀只改 `data-source` / 文案来源，不新加静默 | 不写盘 |

无可点击新控件。设计上没有新的静默。

## 五、边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 危机 / 指向他人 | 本刀不改；竖线与转介句仍走 AE |
| 目录命中且过事实门 | 短答；含 AE 两锚 |
| 目录未命中的真产品问 | 诚实空态 + Help Center 指向；禁止 generate 现编步骤 |
| 仅形状、无产品对象 | 仍陪伴或生成，禁止空态 |
| 中文情绪否决本机开关开 | 真产品问仍不得 `skip` 进观察翼 |
| Stage 2b 仍 shadow | 本刀不把 2b 切 live |
| 徽章句 | 不得念寅币短答（硬闸保留） |

---

## 六、冲突扫描（对照场景 AE）

| 轴 | 相邻 | 判断 |
|---|---|---|
| 职责 | AE 两锚：接地练习 / A Quiet Line catalog 短答 | **无冲突**。必须仍短答，禁止改观察翼或空态。 |
| 职责 | AE「产品问未命中禁止 generate」 | **无冲突**。与 CR-47 同一窄定义；本刀补的是「也禁止改口成情绪语料」。 |
| 职责 | AE 情绪桶「太累了」/ depressed → corpus | **无冲突（有条件）**：无产品对象则仍语料。带「怎么关提醒」的混合操作问另走产品闸，不把纯疲倦句抬走。 |
| 职责 | AE 安全 / 攻击 | **无冲突**。仍最先。 |
| 强度 | 用户仍发一句等一句 | **无冲突**。 |
| 语气 | 空态金句不改 | **无冲突**。误伤体验靠上限拦住，不靠改口吻。 |

---

## 七、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

不涉及后台网络。

---

## 八、验收（CR-52 自己的关单 · 不再当 CR-11 前置）

实现合入前须同时：

1. **产品问不得进情绪路径**：作废中文卷（不占额）+ 实现会话另备的回归句（可写已公开锚，**禁止**把未见原句写入仓库）上，操作问法 ∧ 产品对象的句子进 `corpus` / 观察翼 / `generate` 当情绪陪伴的句数 **= 0**。短答对题率可另报，不得用细档绿掩盖这条红。  
2. **徽章不得念寅币短答**：`badge-yin-coin` 寅币短答句数 **= 0**（本刀不新改徽章逻辑，作冻表不退步）。  
3. **AE 两锚**各 1 句 catalog 短答（接地练习、A Quiet Line）。关单锁，不报通过率。  
4. 第二节误伤上限未破。  
5. 不调 0.01。冻表不退步。  
6. 英文未见卷 **仍封存**；本刀过关 **不等于** 占 `en/b-v6`。修完再另书面决定是否用那份卷复核硬闸 1。

单测（实现时）：`confideClassify` / `resolveProductKnowledgeGateAction` / 桌面路由锚。须含「撤掉顺序修复就会红」的回归：公开锚级别的产品问（旅程记录从哪看 / 接地练习）在情绪短语干扰下仍不得 `corpus`。

命令（实现时，本规格 PR 不跑产品测试）：`cd focus-tiger && node --test src/core/confide/confideProductKnowledgeSemantic.test.js src/core/confide/confideDesktopRoutingAnchors.test.js`，再 `npm run test:smoke`。

---

## 九、回滚

一键回到现状：实现须带显式开关（建议环境键 `FT_CONFIDE_PRODUCT_ASK_BLOCKS_EMOTION`，默认在合入后为 live；`off` / `shadow` = 恢复「情绪桶与 `lifeOrMoodSkip` 仍可在操作问法之前收工」）。关掉后，第八节硬闸 1 的回归应变红，用来确认回滚生效。不要用加关键词的方式回滚。

---

## 十、书面锁同步（与本 Brief 同 PR）

[`task-confide-routing-holdout-caliber-split.md`](./task-confide-routing-holdout-caliber-split.md)：

- 第三节第 4 条：带 C 两条硬闸改为 **CR-52 自己的验收**，不再当 CR-11 切 live 前置。CR-11 切 live 时仍不得把这两条弄红（冻表），但过关不绑在等 CR-11。  
- 第三节第 7 条：发送链除 CR-11 / CR-45 live 口令外，**允许**在「按 CR-52 Brief 开工」口令下改，且范围只限本节顺序，不得顺手接仲裁 live 或 CR-45 live。

---

## 十一、非目标

- 不改诚实空态金句、不改 0.01、不改安全层、不切 Stage 2b、不跑 `en/b-v6`、不重新出题。  
- 不把宽影子维接到发送链。重启宽维须另书面，且与本刀无关。  
- 不把带 A 三类结构天花板并进本刀。  
- 本文件点头 ≠ 实现已开工。
