# Task Brief · 一份事实源、多个出口（知识库 + Help Center）

> **状态（2026-11-12）**：**设计已锁**（PO 书面：两条闸、probe 测试、菜单对照红在代码表、Practice Study / Mindflow 先草稿不入库）。  
> **类**：分刀。第 1–2、5 刀偏 **A**（目录字段、CI、文档口径）；第 1 刀回填帮助正文与第 3–4 刀成稿属 **B**（用户看得见的帮助文 / 可能被阿寅念的短答）。  
> **分支建议**：`docs/kb-help-single-source-brief`（本 Brief）→ 实现另开 `feature/kb-help-single-source-*`。  
> **不是**：把 Help Center 和倾诉合成一张卡。**不是** T84。**不是** T93 / T99 插队。**不是** 从 Epic / PR 正文起草说明书。

口令「按 `task-kb-help-single-source.md` 开工第 *N* 刀」= 点头后的**新 Chat** + 独立旁支。本文件只锁口径；本 PR **不写** `src/`。

交叉引用：[`product-knowledge-base.md`](../product-knowledge-base.md) · [`task-kb-scaled-production.md`](./task-kb-scaled-production.md)（本 Brief **修正**其「不做人可浏览帮助中心」与「两层手册」）· [`task-user-help-center.md`](./task-user-help-center.md)（本 Brief **修正**其「单独手写 manifest、不整库暴露」为「由目录字段生成」）· [`task-help-center-platform-health.md`](./task-help-center-platform-health.md)（#1691 已合，游离 `HELP-*` 须回填）· [`MENU_CHROME_CENSUS.md`](../MENU_CHROME_CENSUS.md) §2.3 · [`kb-live-gap-audit.md`](../kb-live-gap-audit.md) · [`task-co-practice-research-privacy-help.md`](./task-co-practice-research-privacy-help.md)（T84）

---

## 一句话目标

产品事实只写进**一份**已审目录。阿寅念不念、帮助中心给不给人看，用**两个出口字段**决定。急救稿进不了这份文件。菜单有没有漏登记，用代码表对照，缺了 CI 就红。

---

## 大白话（给拍板核对）

用户看到两处说明：一张可翻的帮助中心，和（电脑宽屏）阿寅偶尔念的一句短答。以前容易写成三份稿：文档、倾诉目录、帮助文案。以后只改目录；帮助文从目录生成。阿寅不该念操作课或隐私长文时，目录里仍留这篇，只是关掉「阿寅可检索」。没审过的、急救长脚本，连目录文件都不进。

---

## 产品拍板（2026-11-12）

| 项 | 口径 |
|---|---|
| 界面 | **两套出口**（帮助中心给人翻；倾诉给阿寅念）。**禁止**合成一份给人看的说明书。 |
| 事实源 | `src/core/confide/productKnowledgeCatalog.json`（人审底稿仍在 `product-knowledge-base.md`，禁止第三份手写帮助正文） |
| 出口字段 | 每条必填 **`yinMayRetrieve`**（阿寅可检索）与 **`helpCenterVisible`**（帮助中心可见） |
| 仅帮助中心 | 已通过 + `yinMayRetrieve: false` + `helpCenterVisible: true` + **必须在目录 JSON 里** |
| 急救 / 未审 | **整条不进**目录 JSON。硬闸。不靠字段区分。 |
| 0006 | 回填进目录：阿寅不检索、帮助可见。检索问法仍走 0011+0001。 |
| Safari / Health | #1691 已合的两篇回填进目录，同样仅帮助中心；删掉「只存在于帮助 locale / catalog.js」的游离正文 |
| 测试闸 | 阿寅不检索的条目，**任何问法**都不得被 `probeProductKnowledgeCatalog`（及正式检索路径）命中。字段只是约定，**测试才是闸**。 |
| 菜单对照 | CI **红灯**。对照 `listSecondaryChromeEntries` 的 `proxy` ↔ `kbLiveEntryRegistry.js`。**不**对照 `MENU_CHROME_CENSUS.md` 的 Markdown 表。 |
| 豁免名单 | 从普查 **§2.3** 起步，不要另发明一份；第 2 刀在 `origin/develop` **逐条核实**后再写入代码豁免表。 |
| Sound | 已有菜单行 `sound`、已有登记 `kb-live-sound`、**未链** catalog。已有 `KB-FUNC-0037`（角落音符 / 闲置屏音乐，现网标 cross-cutting）。第 3 刀先核是否链 0037 并改指路，**禁止叠第二条**。 |
| Mindflow / Practice Study | **草稿不入库**。机器核：默认关、备份白名单、不含倾诉原文。成稿入库条件 = **T84 点头**（PO 倾向；不要「Help 先上、政策后补」除非另有书面）。 |
| Language | 不动（仍待产品确认范围）。 |
| 邮箱找回 | `account` / `idle-account-email-restore` **已是菜单真入口**。第 2 刀必须登记，否则 CI 一上就红。**文案等行为稳定再写**（T93 未关单）。 |
| 内部手册 | 第三出口，最松；路径仍 `docs/internal-handbook/`。**不进**目录 JSON。 |
| 正文原料 | 只信 locale / 规则源码 / 菜单代码表。禁止 Epic、PR 叙述、测试步骤当说明书。 |

---

## 目录 JSON 契约（第 1 刀必须落地）

现网文件头 `gate: "yin_may_retrieve:yes AND audit_status:approved"`，且**条目上没有**出口字段——等于「能进文件的默认都会被检索」。本 Brief 改成**逐条字段**。

每条至少：

| 字段 | 类型 | 规则 |
|---|---|---|
| `id` | 稳定 id | `KB-FUNC-*` / `KB-EDU-*`；回填后允许保留已上线的 `HELP-DEVICES-SAFARI` / `HELP-APPLE-HEALTH-LOG` 作为目录 id（避免问卡别名断裂） |
| `yinMayRetrieve` | boolean | `true` 才进入 Confide 索引 |
| `helpCenterVisible` | boolean | `true` 才进入 Help Center 生成器 |
| `shortAnswerEn` | string | 帮助中心正文与（若可检索）阿寅短答的同一事实句；仅帮助中心允许略长，仍禁止念急救引导语 |
| `keywords` | string[] | **仅** `yinMayRetrieve: true` 时参与打分；`false` 时即使误留关键词也不得命中（测试锁） |

合法组合：

| yinMayRetrieve | helpCenterVisible | 含义 |
|---|---|---|
| true | true | 默认同源：阿寅可念 + 帮助可翻 |
| false | true | 仅帮助中心 |
| true | false | **禁止**（阿寅能念、人却翻不到 = 两套事实）。CI 红。 |
| false | false | **禁止进文件**（等于内部废稿）。内部手册走自己的目录。 |

硬闸（`docs:check` 或 catalog 单测，缺一即红）：

1. 目录不得含 `KB-PSY-DRAFT-*`、不得含文档里 `审核状态` ≠ 已通过 的 id。  
2. `yinMayRetrieve === false` → `probeProductKnowledgeCatalog` 对关键词、标题、短答片段、常见问法 **都不得**返回该 `id`。正式 `retrieve` / 语义近邻同样跳过。  
3. `helpCenterVisible === true` 的每条，Help Center manifest 必须有对应文章（取代「凡 catalog 条目都有帮助文」的旧断言：改为「凡帮助可见才必须有」）。  
4. 帮助中心 locale 正文由生成器从目录写出；禁止再手写与目录并行的第二份 `HELP_*_BODY`（生成结果可提交，但源是目录）。

**0006 特例**：进文件；`yinMayRetrieve: false`；`helpCenterVisible: true`。阿寅问「呼吸练习在哪」仍只允许打到 **0011 / 0001**。Help Center 可保留左球盘点篇。登记表 `kb-live-help-center` 挂 0006 不再算「未批准」。

---

## 冲突扫描

相邻：场景 AX（Help Center）· AE（倾诉产品问）· W（问号简介）· 场景 O（菜单）。

| 轴 | 判断 |
|---|---|
| a. 强度 | 不新打断；帮助仍从已有入口打开。不把帮助全文塞进倾诉。**无强度错位。** |
| b. 语气 | 短答仍观察式指路；隐私条不抢 T84 定稿。**无语气冲突。** |
| c. 职责 | 目录 = 事实；Help Center = 浏览；Confide = 检索已审短答；问号卡仍只简介。T84 管隐私政策三层，本线不写政策成稿。**无职责重叠。** |

无用户路径？否。有路径，但本 PR 只锁 Brief。

---

## 刀序（一次一刀）

实现时**禁止**把 1–4 揉进同一个功能 PR。第 5 刀文档口径可与第 2 刀同批。

### 第 1 刀 · 两字段 + 回填（B 含帮助正文）

- 目录 schema：逐条 `yinMayRetrieve` / `helpCenterVisible`。现有可检索条目默认两字段皆 `true`（与现网「进文件即可检索 + 皆有帮助文」对齐）。  
- 回填：`KB-FUNC-0006`、`HELP-DEVICES-SAFARI`、`HELP-APPLE-HEALTH-LOG` → 仅帮助中心。  
- 生成器改为读 `helpCenterVisible`；删游离手写正文。  
- **probe / 检索跳过测试**必须同批合入（红绿对照：回填前若 0006 不在文件则先加夹具条目证明 `false` 不会被命中）。  
- 不改倾诉发送链、不改危机路由、不插队 T93。

### 第 2 刀 · 菜单代码表 ↔ 登记表 CI 红灯（A）

对照源：**只** `listSecondaryChromeEntries`（`idleChromeOrchestration.js`；普查文已写明这是菜单列表 SSOT）里出现的 `proxy`。

每个非豁免 `proxy` 必须在 `kbLiveEntryRegistry.js` 有一行。缺行 = CI 红（进 `docs:check` 或 `test:smoke` 契约切片，与现网 kb 审计同级，**不要**做成可忽略 warning）。

**豁免从 §2.3 起步（第 2 刀仍须在 develop 核实，不得把下表当未核实事实）：**

| §2.3 项 | 预期处理 |
|---|---|
| Sit / Rise、左球 Breath | 不是次级菜单 `proxy`。已有 `kb-live-sit` / `rise` / `breath` 等 home-ball 行则保持；**不要**为了 CI 再造菜单行。 |
| 窄屏 `?` | 豁免（简介，不是功能列表）。 |
| Help Center 快捷钮 | 豁免（与菜单 `help-center` 同一张卡）。 |
| 音符 / 环境音面板 | **角落入口豁免**；菜单行 `sound` **不豁免**。 |
| 左上日历 / 周热力图 | 豁免（不是次级菜单）。 |
| 倾听耳 | 豁免（快捷）；菜单 `confide` 不豁免。 |
| 桌面更新提示条 | 豁免。 |

**Sound 不要当成「登记漏项」。** 现网：`kb-live-sound` 已 live、无 `catalogKbIds` → 缺口审计的「无批准链接」。0037 已在目录且可检索，但正文写闲置屏控件、文档自称无独立菜单行。第 2 刀只保证 `sound` 继续登记；**链 0037 / 改指路留给第 3 刀**。

第 2 刀须在 develop 核实后再登记的菜单 `proxy`（代码里已有、登记表截至 Brief 撰写日未见对应 `kb-live-*`；**实现时重跑对照，以当时 develop 为准**）：

- `account`（邮箱找回真入口；只登记，不写帮助/短答）  
- `work-end`、`always-on-top`、`window-layout`、`input-rhythm`  
- `art-collection`、`newsletter`  
- `mustard-seed-seal` 与动态静思印 proxy（可标 entitlement / 解锁后）  

观察纸、Shortcuts、深链：若**不是** `listSecondaryChromeEntries` 的 `proxy`，第 2 刀 **不要**假登记成菜单行。需要覆盖时另开「非菜单存活面」登记（home-ball / 其它 surface），不塞进菜单 CI。

第 2 刀同批：补当时核实过的漏登行；把普查 **§2.2** 改为脚本生成或删除并指向代码表（消灭又一份会过期的手写对照）。§2.3 保留为人读豁免理由，须与代码豁免表互链。

审计文档「batch-2 存活面候选清零」等过期叙述：同批改成「以机器块为准；清零只指当时那一批」。

### 第 3 刀 · 五个点名菜单（B，含草稿例外）

缺口审计机器块（撰写日）点名：`contemplative-inquiry` · `sound` · `mindflow-nebula` · `presence-field` · `practice-study`。Language 仍不动。

| 行 | 做法 |
|---|---|
| Sound | 先核 0037 是否同一块环境音面板。是 → 链 `catalogKbIds` + 短答补一句 Preferences → Sound，不新 id。否 → 再起草，仍先问 PO。 |
| Sit with a question | 可进目录的功能短答（默认仅帮助中心；若会被自然问到再开检索）。 |
| Presence Field | 同上。 |
| Mindflow / Practice Study | **只出草稿**（`product-knowledge-base.md` 待审段或 `kb-po-review-queue.md`）。机器核默认关、备份白名单、不含倾诉原文。**不进**目录 JSON，直到 T84 点头。 |

### 第 4 刀 · 电脑壳与共修线（B）

默认 **仅帮助中心**。只有「用户会在倾诉里自然问到入口/限制」才把 `yinMayRetrieve` 打开。每条仍走权威源起草 + 语气抽查。邮箱找回文案仍等 T93 行为稳定。

### 第 5 刀 · 过期文档（可与第 2 刀同批）

- `task-kb-scaled-production.md`：非目标删掉「不做人可浏览帮助中心」；「两层手册」改为三出口（阿寅最严 / Help Center 中等 / 内部手册最松）。菜单 Playwright 遍历从「后刀」改为「第 2 刀代码对照已替代静态漏登」。  
- `kb-live-gap-audit.md`「下一步」表与机器块对齐。  
- `task-user-help-center.md`：帮助 manifest 改为目录生成。  
- `task-help-center-platform-health.md`：状态改为已合 #1691，正文归目录。  
- 不在本线改 `GLOSSARY.md`（治理会话另登代号）。

---

## 变体矩阵（A10）

第 1 刀回填帮助正文触及多语言与 Electron/Web（Health / Safari 既有问号块）。后续成稿刀同样 en/zh/ja。

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| en Help Center | `?product=1` → 帮助中心 | 0–1s 见目录；0006 / Safari / Health 可点开；正文与目录 `shortAnswerEn` 同源 | 本刀补：catalog→help 生成契约；既有 `helpCenterCatalog.test.js` 改断言 |
| zh / ja Help Center | 同上 | 切片键存在；不得只英 | locale 切片三语键 |
| Electron | 桌面壳 | 问号 Web 访问块仍隐藏（#1691 既有） | 既有平台测 |
| 宽/窄 Web | 浏览器 | Safari 篇可检索；问号摘要仍指 Help Center | 既有 `helpCenterAskSearch` alias |
| Confide 宽屏 | `?product=1&confide=1` 且倾诉可开 | `yinMayRetrieve: false` 的 id **不得**出现在 `data-source=product_knowledge` | **本刀必补** probe + 检索跳过；夹具含 0006 与 HELP 两篇关键词 |
| 倾诉问呼吸 | 同上 | 仍 0011 或 0001，不得 0006 | 既有矩阵 + 本刀补负例 |

---

## 点击反馈（0–1 秒）

本 Brief 实现刀不新增可点击控件。Help Center / 菜单行沿用现网：点主题 0–1s 见正文；点菜单 Sound 仍打开同一环境音面板。

持久化：本线不写盘。点击反馈：无新持久化控件。

---

## 边缘状态

| 边缘 | 预期 |
|---|---|
| 倾诉未挂载 / 窄屏无 Confide | 帮助中心仍可翻仅帮助中心篇；不得误以为阿寅会念 |
| 嵌入未 ready | 不改变现网诚实空态；本线不改路由闸 |
| T84 未点头 | Mindflow / Practice Study **不得**出现在目录 JSON / Help Center 成稿 |
| T93 邮箱通道关 / 商店渠道 | `account` 行可能不可点；登记仍在，帮助文案未写 |
| Language 条件出现 | 第 2 刀登记为 conditional；第 3 刀仍不起草 |
| 仪式未解锁 | 菜单行可锁；登记可标 entitlement-gated，不豁免漏登 |

---

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

后台网络：不涉及。  
受保护路径：不改 Support FAB / Stripe。会员菜单行维持打开既有会员卡。

---

## 明确不做

- 不合并两套界面。  
- 不让 Help Center 全文进入倾诉检索。  
- 不插队 T93 / T99。  
- 不从 Epic / PR / TRACKER 步骤起草正文。  
- 不把急救型标「仅帮助中心」混进目录。  
- 不把 CI 打在 Markdown 普查表上。  
- 不把 Sound 当漏登记（与缺短答链分开）。  
- 不在本线点头 T84、不开工 90 天实验。

---

## 验收（按刀勾）

**第 1 刀**

- [ ] 目录每条有两字段；禁止组合被测红。  
- [ ] 0006 + Safari + Health 在目录且 `yinMayRetrieve === false`。  
- [ ] probe / 正式检索：上述 id 对任何问法不命中。  
- [ ] 帮助中心可见篇由生成器出自目录；无游离第二份正文。  
- [ ] `kb-live-help-center` 挂 0006 不再落入「未批准 id」。

**第 2 刀**

- [ ] 非豁免 `proxy` 缺登记 → CI 红（不是 warning）。  
- [ ] 豁免表与 §2.3 互链，并附 develop 核实日期。  
- [ ] `account` 已登记。  
- [ ] §2.2 不再手写过期表。

**第 3–4 刀** 见上表。Mindflow / Practice Study 在 T84 前验收 = 「草稿在、目录无」。

---

## 开工闸

- 设计已锁。写 `src/` 仍须口令「按本 Brief 开工第 N 刀」+ 新 Chat + 独立旁支。  
- 第 1 刀 B 类：变体矩阵与 probe 测试不得省略。  
- 代号未进术语表前，PR 标题用本 Brief 文件名，不自造 T 号。
