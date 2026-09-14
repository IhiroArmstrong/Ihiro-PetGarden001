# Remote parameterization candidates — full-project audit

> **Status**: Audit (2026-09-12) + **PO lock** (same day, after #717). No runtime in this document.  
> **Scope**: `focus-tiger/src` + `focus-tiger/cloud/src` (production paths). Tests, e2e timeouts, CSS `font-weight`, locale copy, and media assets are **out**.  
> **Criteria SSOT**: Task Brief「全项目扫描——哪些算法/参数适合做远程参数化」§1（五条须同时满足才建议远程化）。  
> **Related**: `GROWTH_METRICS_CHARTER.md` · `ANTI_PLAGIARISM_LAYER.md` · `FOCUS_COINS.md` · `tasteLayerSync.js` / `growthMetricsConfigSync.js`

---

## 0. How to read this list

| 建议 | 含义 |
|---|---|
| **远程化** | 五条同时成立；值得排进下一批（仍须单独 Brief，禁止本文件当开工令） |
| **已试点** | 远程通道已存在；本审计不重复开工 |
| **伪远程** | 已走云 API，但数值仍在 Worker **源码冻表**，改仍要 `wrangler deploy` |
| **不建议** | 至少一条不成立，或属于 Brief §3 排除项 |
| **产品判断** | 数值可调，但第 2 条（会反复改）或经济/纪念语义未拍；不要默认开工 |
| **这次不做** | **评估过、显式跳过本批**（不是遗漏）。以后翻文档不得当成「漏扫」再开刀 |

**发版摩擦**列：`client` = 改了要重新构建前端；`wrangler` = 改了要部署 Worker；`KV` = 改 KV 即可（仍须冻表兜底）；`env` = 环境变量 / Secrets。

扫描方法：全大写常量、`tunable` / `可调` 注释、threshold/cap/weight/limit、以及 Brief 点名的搁置项。未把每一个毫秒动画时长都列成一行——同类归并，并在 §4 写明排除桶。

---

## 1. 品味层是否「伪远程化」——明确判断

**是。** `/api/emotion-weight`（`cloud/src/routes/emotionWeight.ts`）把 `tasteLayerFreeze.ts` 里的加权池和 `TASTE_HONESTY_LONG_MIN_MINUTES` **原样返回**。客户端已有 overlay（`tasteLayerSync.js` + 冻表兜底 + schema 校验），但 Worker **没有**独立 KV 绑定可读可写的灵魂数字。改权重仍要改 git + `wrangler deploy`。这与成长度量试点（`GROWTH_METRICS_KV`）不对齐。

句包类（Daily Wisdom / Quiet Line / Calm Action / Confide copy）同样是 Worker 源码冻表 + overlay，但那是**内容管理**，本清单按 Brief §3 **不纳入参数化候选**。

---

## 2. 候选清单（产品数值）

判据列顺序：①数值非结构 · ②会反复调 · ③不直接判到账 · ④离线须冻表 · ⑤改了要发版。

| 候选参数 | 当前位置 | 发版摩擦 | ① | ② | ③ | ④ | ⑤ | 建议 |
|---|---|---|---|---|---|---|---|---|
| `dailyScoreCapMinutes`（180；夹具 60–480） | `scoreDailyCap.js` + `growthMetricsConfigOverlay.js` + `cloud/.../growthMetricsConfigKv.ts` | KV（冻表 180 仍在 git） | ✓ | ✓ | ✓ | ✓ | ✓（冻表） | **已试点**。独立 Brief 推进中；本清单不重复开工。 |
| 品味层加权池：Rise 60/25/15、Welcome 60/40、轻量完成 70/30/8 | `sceneAnimationDispatcher.js` 冻表 ∪ `tasteLayerFreeze.ts` | wrangler（API 已通、无 KV） | ✓ | ✓ | ✓ | ✓ | ✓ | **远程化**（优先）。把冻表搬进 KV（或品味专用绑定），客户端 overlay **已存在**，只需 Worker 真分叉。 |
| Honesty 长坐门槛 `HONESTY_LONG_MIN_MINUTES` / `TASTE_HONESTY_LONG_MIN_MINUTES` = 30 | 同上两端 | wrangler | ✓ | ✓ | ✓ | ✓ | ✓ | **远程化**（与权重同域，勿另开管道）。 |
| Stretch 池 60/40；Curiosity `CURIOSITY_CHANCE`=0.05；`LIFE_COOLDOWN_MS`=1h | 仅 `sceneAnimationDispatcher.js`（**未**进 `tasteLayerFreeze`） | client | ✓ | △ | ✓ | ✓ | ✓ | **这次不做**（2026-09-12 PO）。未进品味冻表，与「权重进 KV」不是同批自然延伸。评估过；禁止当遗漏。 |
| 莲花池阶梯：首朵 25m、早段步长 25、早段末枚 5、后段 45、环容量 12 | `lotusPondMath.js`（注释已写 tunable） | client | ✓ | ✓ | ✓ | ✓ | ✓ | **远程化**（第二优先，可并入 `GROWTH_METRICS_KV` 而不是新绑定）。公式形状（分段函数）不动，只搬系数。 |
| 莲花螺旋几何（origin / rInner / 金角 137.5 / 断点 480px） | `lotusPondMath.js` `LOTUS_POND_SPIRAL*` | client | ✓ | ✗ | ✓ | ✓ | ✓ | **不建议**。布局/美术一次定稿；远程化收益低且易在窄屏打到脸上。 |
| MilestoneGlow 节点 7 / 21 / 100 天 | `MilestoneGlowStore.js` `MILESTONE_GLOW_STREAK_NODES` | client | ✓ | △ | ✓ | ✓ | ✓ | **产品判断 · 暂不搬**（2026-09-12 PO）。无反复改的证据；② 的反面。改节点会改变「已播过」语义，真要动时再写迁移。 |
| 徽章枚数步长 `floor(score / 3)` 的 **3**；免费 min1/max9；付费 min3 | `practiceBadgeAward.js` / `tipKindnessBadges.js` / `sanctuaryBadges.js` | client | ✓ | △ | ✓ | ✓ | ✓ | **产品判断 · 暂不搬**（2026-09-12 PO）。没改过、没人提要改。`/60` 仍是结构排除；`/3` 仍是节奏系数。 |
| 芥子须弥解锁 `score ≥ 21` | `mustardSeedSeal.js` ← `memorialSealDirectory` | client | ✓ | △ | ✓ | ✓ | ✓ | **产品判断 · 暂不搬**（2026-09-12 PO）。growth-metrics 清单曾标适合远程化；**现在不提前动**。真要调时并入 `GROWTH_METRICS_KV`。 |
| 静思典藏各印 `scoreThreshold` 30/45/60… | `memorialSealCatalogCa.js` | client | ✓ | ✗ | ✓ | ✓ | ✓ | **不建议**。目录级内容门槛，跟文案一起走内容管理，不走参数 KV。 |
| 寅币日封顶 36 / 3 / 12 / 48；Stay 5m=1；半速 10m=1；仪式点 2/1/3 | `focusCoinsLedger.js` | client | ✓ | ✓ | △ | ✓ | ✓ | **产品判断**（经济轨 · 排序 ③）。PO：寅币可花出去，调封顶 = 虚拟通胀/紧缩，与体验权重性质不同；**禁止**与 ①② 顺手同批改。须单独 Brief + 稀缺感评估（清供 8 件）。不要和花园 score 封顶混进同一 JSON 而不加域前缀。 |
| 寅币 SKU 价（如须弥座 360）与 `SUMERU_MIN_LIFETIME_MINUTES`=600 | `focusCoinsLedger.js` | client | ✓ | △ | △ | ✓ | ✓ | **不建议**（本层）。价目是商品表，不是调参；远程改价还要防客户端伪造发放。 |
| Sit 时长 chips 10/15/25/45；默认 chip 10；HUD 软顶 25 | `focusDuration.js` / `FOCUS_SESSION_DEFAULT_MINUTES` | client | ✓ | ✗ | ✓ | ✓ | ✓ | **不建议**。2026-08-18 已拍板；改芯片是产品规格不是运营旋钮。 |
| across-tools 闲置 30 分钟 | `FocusSession.js` `ACROSS_TOOLS_IDLE_THRESHOLD_MS` | client | ✓ | ✗ | ✓ | ✓ | ✓ | **不建议**。注释写可调，上线后无改记录。 |
| 深夜窗 23:00–06:00 | `lateNightHour.js` | client | ✓ | △ | ✓ | ✓ | ✓ | **产品判断**。时区/文化敏感，更像规格。 |
| Focus Circle：≥60s 才留痕；圈上限 8；昵称 16 | `focusCircleWitness.js` / Worker `focusCircleKv.ts` | client+wrangler | ✓ | ✗ | ✓ | △ | ✓ | **不建议**。刚拍过的社交规格；服务端人数上限可留 Worker 常量。 |
| Confide 练习事实窗 14 天 / 最少 3 场 | `confidePracticeFacts.js` | client | ✓ | △ | ✓ | ✓ | ✓ | **产品判断**。偏 L0 陪伴启发式，不是花园旋钮。 |
| YPE L2：`YPE_MIN_SAMPLE_COMPLETIONS`=10；常回 0.6；常反思 0.4；pack TTL 7d | `cloud/.../ypePersonalizationAlgorithm.ts` | wrangler | △ | △ | ✓ | ✗（L2 本就在云） | ✓ | **不建议**。接近算法结构 + 防剽窃「秘密变换」；改阈值应走算法版本，不是运营 KV。 |
| 展示价 `MEMBERSHIP_PRICE_DISPLAY` 6.99 / Sanctuary 89.99 | `membershipCheckout.js` / `SanctuaryUnlockUI.js` | client | ✓ | △ | ✗ | ✓ | ✓ | **不建议**。须与 Stripe Price 一致；走支付配置，不走本层 overlay。 |
| Stripe webhook 宽容 300s；会员宽限 7 天 | `cloud/.../stripe.ts` / `membershipKv.ts` | wrangler | ✓ | ✗ | ✗ | n/a | ✓ | **不建议**（Brief §3 排除到账逻辑；宽限属支付政策）。 |

---

## 3. 已知搁置项 —— 按五条重评

| 项 | 结论 |
|---|---|
| 品味层 Worker 源码常量 | **远程化（优先 · 已拍）**。伪远程已证实；优先理由含消除「已经在云上很安全」的认知误区。 |
| Stretch / 好奇概率 / 一小时冷却 | **这次不做**（2026-09-12 PO）。评估过。 |
| MilestoneGlow 7/21/100 | **产品判断 · 暂不搬**（2026-09-12 PO）。② 弱；另有「已播放节点」迁移。 |
| 徽章步长 `/3`、芥子门槛 21 | **产品判断 · 暂不搬**（2026-09-12 PO）。芥子真要调时并入 `GROWTH_METRICS_KV`。 |
| 寅币日封顶 36/3/12/48 | **产品判断**。经济轨，单独 Brief + 通胀评估；**不要**跟 ①② 同批。 |
| 莲花池阶梯（growth-metrics Brief 未列的系数） | **远程化（第二优先 · 已拍）**。并入现有花园 KV，不另起绑定（仍须 persona fixtures）。 |

---

## 4. 明确排除桶（不逐条开行）

| 桶 | 例子 | 原因 |
|---|---|---|
| 公式形状 | `score = days + floor(minutes/60)` | Brief ① |
| 内容/文案/素材 | locale、Daily Wisdom / Quiet Line / Calm Action / Confide 句包、徽章图、诗词 | Brief §3 |
| 到账判定 | Stripe webhook、entitlement 是否 paid、Checkout Session | Brief ③ |
| 观感契约已锁 | `CAPCUT_DISSOLVE_MS`=1000、Idle 呼吸×2 pingpong、眨眼 seam=0 | ② 弱 + 回归锁「已好清单」 |
| 3D / 指针遗留 | `POINTER_INTERACTION_CONFIG`、`DYNAMIC_MOTION_CONFIG`、`INCENSE_GREETING_CONFIG` | 主线 2D；调这些不改变用户现网体验优先级 |
| 光影/叠层毫秒 | `LightProgression` 1500/5000、各类 UI `FADE_MS` | 一次定稿的运动设计 |
| 基建/配额 | overlay 超时 2500ms、备份 debounce、OTP TTL、rateLimit 60/min、KV TTL、schemaVersion | 工程常数；可用 env，不是产品远程参数 |
| 键名/枚举 | storage keys、emotion key 列表、SKU id | 改了是迁移，不是调参 |

---

## 5. 客户端 overlay 是否值得抽成通用模块

**值得，但不要为本审计实现。**

现成两套几乎同构：

- `tasteLayerSync.js`：timeout 2500 · 等 Arrival/Honesty 最多 20s · `?tasteLayer=0` · schema 拒收 · 冻表相同则不写盘  
- `growthMetricsConfigSync.js`：同一套超时/等待/查询参数/`postCloudJson`

再加一个域（品味 KV、莲花阶梯）如果再复制，会第三次踩 `RB-20260820-L330`（overlay 与 Arrival CapCut 抢带宽）。

建议形态（工作量大约 **0.5–1 天**，含把现有两处改成调用方）：一个小 helper，参数化 `queryParam`、`schemaVersion`、`parse`、`matchesFreeze`、`timeoutMs`、`waitApplyMs`、`canApply`。**不要**做成「任意 JSON 远程配置中心」——域仍要分 KV / schema，防剽窃层禁止把灵魂数字和支付记录混绑定。

**我认为最合理的（2026-09-12 PO 已锁）**：只有成长度量一个真实案例时**不要**抽通用配置中心。等品味层 KV 也跑通、两个真实案例摆在那，再抽公共逻辑。不要先抽抽象再找第三域。

---

## 6. 下一批顺序（2026-09-12 PO 已拍 · 仍须口令「开工」）

本文件**不是**开工令。实现须新 Chat + 口令，一次一刀。

1. **品味权重 + Honesty 30 分钟门槛 → KV**（伪远程一次打穿）。**不含** Stretch / 好奇 / 1h 冷却。优先理由：管道复用之外，还要消除「看起来已在云上、其实改数字仍要发版」的认知误区。  
2. **莲花阶梯系数 → 已有 `GROWTH_METRICS_KV`**（花园轨顺水推舟，不另起炉灶）。  
3. **寅币日封顶** 单独经济 Brief（虚拟通胀；慢一点动）。

**本批明确不做**：Stretch 池 / `CURIOSITY_CHANCE` / `LIFE_COOLDOWN_MS`；MilestoneGlow 7/21/100；徽章 `/3`；芥子 21（真要调再并入花园 KV）。通用 overlay helper 等 ① 跑通后再议。

禁止：一次把上表全部塞进一个超级 JSON；禁止把 ③ 跟 ①② 顺手改。
