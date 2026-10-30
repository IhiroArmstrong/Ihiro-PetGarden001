# Task Brief · T67 共修纪念画发放（出卡 · 不出货架）

> **状态**：**待点头**。未点头不得写 `focus-tiger/src/**`。点头 **≠** 立刻画图、**≠** 立刻合发放。  
> **代号**：**T67**（人话：练习里真有一来一回之后，留下一张永远不进货架的画）。槽位 **可选** · 状态 **排队中**。  
> **类**：**B 类**（坐完后出卡、珍藏只读区能看见；用户看得见）。过 **T55** 契约（含 **C-11**）。  
> **依赖**：**T66** 场次接合账 **#1478** 已在 `origin/develop`（`6f5b7945`）。方向锁 [`CO_PRACTICE_GIFT_ART.md`](../CO_PRACTICE_GIFT_ART.md)（#1472）。  
> **不是**：**T66** 再补账。**不是** 货架 / Stripe / 请茶谢礼。**不是** 成长旅程阶段奖。**不是** 「Yin 学会了你」。**不是** **T54** 研究分享内容。

## 0. 大白话

T66 已经能对上「这场问过没有、你应了没有、同一场坐完没有」，也能记下出示的默认分钟。这一刀才是发画：条件够了，安静出一张永远不进商店的画；关得掉；以后在珍藏里还能看见。

**这一刀还不锁门槛数字。** 数字必须看合入后的真实账。如果「只是练得久」和「真有一来一回」分不开，本 Brief 作废，不花钱画 3～5 张图，也不写发放代码。

## 1. 开工闸（硬）

同时满足才允许新 Chat 写 `src/`（口令「按 T67 Brief 开工」）：

1. **本 Brief 已点头**（含变体矩阵 / 点击反馈 / 边缘状态 / 共用机制核对）。  
2. **分布已看过，且能分开**：用合入 T66 **之后**产生的本机账（带 `sessionId` 的邀请行 + 出示默认分钟流水），经 DEV `window.__coPracticeJoinLedgerSummary()`（`?product=1` 控制台）看到：存在「A 分钟已经很高、B 接合日仍是 0」与「B 接合日 ≥ 1」不是同一批。分不开 → **止损**，口令「开工共修纪念画」继续 **不执行**。  
3. **画稿已入库**：3～5 张独立 kebab-case 预览图已在仓库（见 §4）。未入库不得合发放 PR。  
4. **门槛数字已补进本 Brief 一节并再点头**（A 分钟错开 35/360/720/2160；B 窗口独立日；C 带宽/样本/比例）。未补节不得把夹具数字写进产品发放常量。

本治理 PR 合入 **≠** 已发画。

## 2. 目标与非目标

### 2.1 目标

1. **v2 合取发放**：`A ∧ B ∧ C`。禁止纯 A。Honesty 补登不得冒充同一场 B（沿用 T66：补登无接合）。  
2. **一次一张**：发过不收回；中断练习不撤画。同一次完成最多一张画。与芥子印 / 修行纪念印同一仪式队列时，**本卡排在它们之后**。  
3. **出卡强度不超过** 每日首次 `Celebrating`：可关；不挡 `⋯` 菜单逃生舱。  
4. **礼物轨独立 id**：永不进入 `artEditionCatalog` 在售套；禁止把请茶谢礼 id 当练习礼物。  
5. **归档**：Yin's Collections（`#yin-coin-panel`）增加「收到的画」只读区。不进 `#art-collection-panel` 货架。请茶谢礼仍不进珍藏抽屉——视觉可以像，入口必须分开。  
6. **本机键** `focus-tiger.co-practice-gift-art.v1` 进 `FOCUS_TIGER_LOCAL_STORAGE_KEYS` 与删除所有数据。T58「忘掉」**不**撤已发的画（忘掉清的是适应/下场/T66 流水，不是纪念物）。**不进** `T54_RESEARCH_RECEIVE_FIELDS`。**不进**练习云备份。导入备份是否带走：与成长旅程阶段下限 **同一口令后定**；未定前只写本机。

### 2.2 非目标

- 不改 T57 邀请何时出现、T58 变安静、T59 文案、T66 记账形状。  
- 不锁定本页尚未填写的 A/B/C 数字。  
- 不把觉照邀请、收工邀请算进 B。  
- 不把时长条「用默认档坐完」算进 B。  
- 不把 C 通过写成「Yin 学会了你 / 已适配」。C 仍是节奏稳定代理。  
- 不改货架 Worker、不走 Stripe、不要邮箱。  
- 不上研究分享。不做概率掉落、倒计时、仅剩几张。

## 3. 发放判定（形状已锁 · 数字后补）

读口只用 T66 已合函数，禁止另造第二套账：

| 条件 | 读什么 | 本刀 |
|---|---|---|
| **A** | `scoreEligibleLifetimeMinutes` 本机高水位（每天 180 封顶） | 门槛错开阶段点；数字后补 |
| **B** | `countCoPracticeBJoinDaySketches`（专注中 `away`/`extend`/`long-sit` **accepted** **且** 同一 `sessionId` 计时坐完；每天最多 1 个日历日；数独立日不是连续日） | 窗口长度与日数后补。无 `sessionId` 的旧行永远不算 |
| **C** | `evaluateCoPracticeRhythmStableProxy`（关适应 / 种类暂停 → 不可用＝假） | 带宽 / N / 比例后补。**验收禁句**：学会了你 |

**冷却**：上一张发放日之后，须再满足**该档**的 B 窗口（数字后补）。  

**档**：第 1～第 4 张（可做成 3 或 5，点头时锁张数）A/B/C 逐档略升。Persona 形状沿用方向锁：`steady-light` 能拿到第 1 张；`single-binge` / `single-binge-extreme` 拿不到；`deep-weekly` 能拿到。

## 4. 礼物目录（独立于货架）

建议新文件：`src/core/coPracticeGiftArtCatalog.js`（实现时）。**禁止**复用 `artCollectionCatalog` / 请茶谢礼 `artId`。

建议 id（点头时可改名，不得与在售套撞车）：

| 顺序 | id | 用户侧标题（切片） | 预览 |
|---|---|---|---|
| 1 | `together-walk-dawn` | 待点头补 en/zh/ja 画名 + 一句短故事 | `public/ui/co-practice-gift-art/together-walk-dawn.png` |
| 2 | `together-walk-rain` | 同上 | `…/together-walk-rain.png` |
| 3 | `together-walk-lamp` | 同上 | `…/together-walk-lamp.png` |
| 4 | `together-walk-snow` | 同上 | `…/together-walk-snow.png` |

v1 文案只许说练过、留下一张、一起走的一张。禁：晋级、金星、够格、Keep the streak、共修分、适配、懂你、共修成功。用户侧 **不显示**「共修纪念画」分类名。

画稿未入库前，实现旁支可以写目录与单测夹具，**不得**把空路径当用户可见出卡合入。

## 5. 出卡与归档

### 5.1 出卡时机

计时达标完成仪式（含每日首次 Celebrating 若有）→ 芥子须弥若出 → 修行纪念印若出 → **若本场可发且本场尚未出过画** → 本卡。Continue / 关闭 → 再进 Reflection。未达标 Rise：不出。

### 5.2 出卡 UI

新玻璃卡（建议 `CoPracticeGiftArtCardUI.js`）。暖米玻璃，禁止深色厚卡。预览 + 画名 + 一句短故事 + 关闭。可保存 PNG **仅当** 本机已有该预览文件（与纪念印同类）；没有高清桶、不下载在售套原图。

### 5.3 归档

`#yin-coin-panel`（Yin's Collections）增加只读「收到的画」。空态一句「还没有一起走的一张」，不留白大玻璃。不提供 Buy / Stripe。宽屏继续不挡阿寅（T42）。

## 6. 冲突扫描

对照 [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md)：**AW**（货架 / 请茶原图 / 珍藏桥）、**AC**（珍藏不是商店）、成长旅程详情、芥子 / 纪念印出卡、场景 **T**（时长回显）、觉照 **T51**、**T52** 三态。与方向锁 §7 一致：

| 轴 | 判断 | 锁法 |
|---|---|---|
| **强度** | 出卡若比每日庆祝更吵或挡 ⋯ | 强度 ≤ Celebrating；可关；不挡菜单 |
| **语气** | 晋级 / 够格 / Yin 懂你 与观照者、C-11 冲突 | §4 禁词；C 禁适配句 |
| **职责** | 与纪念印、典藏同属「练到点出纪念物」——**已知重叠** | 无 B/C 则本线不值得做。礼物 id ≠ 货架 id。归档在珍藏只读区，不把珍藏改成商店 |

已知重叠写成接受条件，不是假装无重叠。无未决新冲突；**不**把重叠当成可以先发纯 A。

受保护付款路径：**不改** `#yin-support-fab` / `#yin-support-modal` / 结账 API / `supportPaidCardPresentation.js`。新卡不得进 `GLASS_CARD_KEEP_STYLESHEET_Z` 的 Support 豁免名单。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 计时 Sit 坐完且 A∧B∧C 且未发过第 1 张 | 完成仪式后 | 芥子/纪念印之后出本卡；0–1 秒内见画名；可关 | 本刀补单测队列序 + 一条 e2e 锚 |
| 仅 A（分钟够、B=0） | 坐完 | **不出画** | 单测：撤 B 则红 |
| 仅 accepted、当场未坐完 | 有 T57 无 actual | 不出 | 沿用 T66 读口 |
| Honesty 补登 | 补登完成 | 不出本画（无接合） | 单测 |
| 宽屏 ≥480 | 出卡 / 珍藏只读区 | 不挡阿寅；卡可关 | TRACKER 人工 + 宽屏步骤 |
| 窄屏 375 | 同上 | 不挡 ⋯；Esc 关最上一层 | TRACKER |
| en / zh / ja | 出卡与珍藏空态 | 切片三语；禁词不出现 | locale 切片 + 契约字面 |
| 已发过该档 | 再坐完 | 不出同一张；冷却未满不出下一张 | 单测 |
| Electron / 浏览器 | 同一入口 | 行为对齐 | 无壳专属分叉 |
| 已购 Art Collection 某套 | 出卡 | 礼物 id 不出现在货架已购态 | 单测 id 交集为空 |
| 请茶已付清谢礼 | 珍藏 | 谢礼不进「收到的画」；礼物不进请茶卡 | 单测分轨 |

触及练习结束出卡 + 多语言 + 宽窄，故矩阵必填。不新增付款 SKU。

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 出卡关闭 / Continue | 卡收起；若队列无下一张则进 Reflection 或回到 Idle | 发放已在出卡前写入；关卡不删画 |
| 出卡空白非按钮 | 无新层 | 非控件；不另挂 SB |
| ⋯ 在出卡期间 | 菜单仍可点（逃生舱） | 不写盘 |
| 珍藏「收到的画」一条 | 只读预览/画名；无 Stripe | 无新写盘 |
| 保存 PNG（若有文件） | 挂起 / 成功 / 失败三态（沿纪念印） | 不改发放账 |

## 边缘状态

| 边缘状态 | 预期（含 0–1 秒反馈） |
|---|---|
| 未达标 Rise | 不出卡 |
| 画稿文件 404 | 不得出空卡；本场跳过发放并记 TRACKER；禁止假装已赠 |
| 写盘失败 | 计时与邀请照旧；下次仍可发；不弹技术错 |
| 关适应 | C 假 → 不发 |
| 删除所有数据 | 键清空；珍藏该区空态 |
| T58 忘掉 | 已发的画仍在 |
| T54 分享开 | payload 不含本键与画 id |
| 练习云备份导入 | 未点头「带走」前：导入不恢复礼物账 |
| 与芥子同场都该出 | 先印后画；同场最多一张画 |
| Support / 付款大卡开着 | 本卡不得盖住或改 Support z |

## 共用机制核对

- **overlayBusy**：新增出卡须登记 `OVERLAY_SOURCE_CONTRACTS` / `OVERLAY_UI_SURFACE` 一行（类比 `MustardSeedSealCardUI.js`）。默认计入 sceneAnim `overlayBusy`。**例外**：不得挡住菜单逃生舱（`⋯` / 抽屉抓手仍可点）。切语问候路径不经过本卡，无 languageOpen 同类误伤。  
- **HUD 呼吸驱动**：本卡无 breath 步，不接入 `overlayBreathing`；出卡期间正式 Focus 已结束，左上角不应被本卡改成 overlay 墙钟。  
- **z-index / 遮罩 dim**：新卡建议 z=18、遮罩 z=17，与芥子印同级玻璃卡，**低于** Support 模态 25/26 与 Sanctuary 26/27。打开时 Support FAB / 静音 / 倾听耳走 `overlayBackdrop` idle-chrome dim（对照 `Z_INDEX.md` Idle 常驻 chrome）。**不得**把 `#yin-support-modal` 写成 inline 18/19。  
- **新建可点击叠层**：结论句：`OVERLAY_UI_SURFACE` 将新增 `CoPracticeGiftArtCardUI.js` 一行；须含 `request*Slot` 或 derive、挂载、`mutationFeedback` 三键（关卡本身无云端 mutation；保存 PNG 若做则三态）。遮挡共存 e2e 至少锁「出卡时 ⋯ 仍可见」。

## 后台网络

不涉及非用户点击的网络请求。保存 PNG 为用户点击。不改货架 Worker。

## 验收

- 单测：A∧B∧C 才 grant；缺 B 或 C 不可用则不 grant。这条在只靠分钟发放时会红。  
- 单测：礼物 catalog id ∩ 在售 `artId` = ∅。这条在误用货架 id 时会红。  
- 单测：新键 ∈ 删除白名单；`clearAllFocusTigerLocalState` 后空。  
- 单测：T54 payload 不含本键。  
- 单测：备份八 key 不含本键。  
- 单测：仪式队列芥子 → 纪念印 → 本画。  
- 契约字面：出卡句子不得含懂你 / 适配 / 晋级。  
- e2e：一条完成入口锚（出卡可见 + ⋯ 仍在）。  
- TRACKER：出卡观感、宽窄、珍藏只读区「待人工测试」。  
- `npm run test:payment-contract`：本刀若未改付款选择器仍须跑一次证明未误伤。

## 分布怎么看（DEV · 不改界面）

合入 T66 的 QA / 产品壳：

1. 打开带 `?product=1` 的产品壳（5173 QA 树须已 sync 到含 #1478 的 tip）。  
2. 控制台执行 `window.__coPracticeJoinLedgerSummary()`。  
3. 看 `scoreEligibleLifetimeMinutes`（A）、`bJoinDaySketches`（B）、`rhythmStableProxy`（C 代理；`available:false` 当适应关）。  

**合入当天的旧账**：无 `sessionId` 的邀请行 **不算 B**，B 往往是 0——这只能说明「还没在新账上共修过」，**不能**证明分得开，也 **不能** 证明分不开。要下「分得开」结论，须在合入后真实坐过、且发生过专注中邀请被接受并坐完。

## 开工口令

- 「按 T67 Brief 开工」= **点头 + §1 四闸都过** 后 **新开 Chat**。  
- 「开工共修纪念画」在 §1 未过时 = **不执行写 src**。本回合只锁定本 Brief。  
- 实现旁支禁止改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。  
- 禁止同一 PR 改货架 Worker / 请茶谢礼 / T54 payload。
