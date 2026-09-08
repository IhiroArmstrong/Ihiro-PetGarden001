# 防剽窃层 · Anti-Plagiarism Layer

> **状态（2026-09-06）**：产品方向锁 · **本文件无新运行时**。  
> **拍板**：凡客观上有「难复制的表 / 闭包变换只存在服务器、客户端只拿 overlay、没网用本地冻结表」作用的云切片，统称 **防剽窃层**。  
> **两把尺**：§3 **准入四问**（能不能放进本层）与 §3.2 **值得保护四测**（该不该花保护资源）必须分开；过准入 ≠ 值得。原则指针见 `PRINCIPLES.md`「云端防剽窃与护城河」。  
> **本文件禁止被解读成**：一次把 Quiet Line / YPE V2 / Confide 句库全部改运行时；须分 PR。口令队列见 §5。

交叉引用（只引用、不复述细则）：

| 文档 | 职责 |
|---|---|
| `PROCESS.md` Backlog「云端品味层」 | 权重 + 日签池现网 v1 |
| `YIN_PERSONALIZATION_ENGINE.md` | YPE 编排 / Consent / Pack 形状 |
| `task-briefs/task-l2-personalization-algorithm.md` | YPE V1 五键→Pack 闭包 |
| `task-briefs/task-quiet-line-copy-overlay.md` | Quiet Line 句包 overlay（**#543 已合**） |
| `task-briefs/task-ype-v2-secret-transform.md` | YPE V2 秘密变换 + `algorithmVersion` |
| `task-briefs/task-confide-copy-overlay.md` | Confide 句库/模板 overlay |
| `BACKGROUND_NETWORK.md` | 非点击拉取三问 |
| `MVP_PRODUCT_DEFINITION.md` | 云同步须明示同意 |

**编号注意**：品味云、YPE 云仍是 **Worker 上的不同路由 / KV**。防剽窃层是 **概念与准入尺**，不是把支付、备份、漏斗并进同一条 API。

---

## 1. 一句话

> **最难复制的知识和算法只存在服务器；客户端只得到运行所需的结果；没网时核心体验不得消失。**

这不是 DRM，也不是「别人绝对无法复制」。播放器、PNG 序列、Sit 门闩、Confide 路由仍在客户端。保护的是 **调度表、句池、长期个人化闭包**。

---

## 2. 什么算、什么不算

### 算（防剽窃层成员）

| 切片 | 云上秘密 | 客户端得到 | 离线 |
|---|---|---|---|
| **品味云** | Dispatcher 权重、日签/文案池正文 | `schemaVersion` overlay | 本地冻结表 |
| **YPE 云** | 五键→Pack 变换（V1 回声；V2 才是秘密闭包） | PersonalizationStatePack | 无 Pack → L0/L1 |
| **Quiet Line 句包** | 今日静语混合池正文 | 同品味层 overlay 形态 | 本机 `DAILY_ZEN_QUOTE` ∪ insight 种子（源码 **#543**；生产 Redeploy 另册） |
| **Confide 句库/模板**（源码本刀） | 已审回复句正文 | 句 overlay | 本机 locale / corpus 冻结表 |
| **YPE `algorithmVersion`**（随 V2） | 只存在服务器的算法世代 | **不下发**；Pack 形状不变 | 本机不认识的 Pack 字段整包丢 |

### 不算（禁止塞进本层）

| 系统 | 为何 |
|---|---|
| Stripe / entitlement / 寅币发点 | 支付云；过不了准入③ |
| 练习备份 / OTP | 可靠性，不是 IP |
| 意愿漏斗 ingest | 匿名计数，不是手感表 |
| Idle / CapCut / 精灵播放器 | 永远本地 |
| Confide 路由、E′、CI 白名单、Tool Registry、Qwen | 开口须 0–1 秒；Memory / 原文默认不上云 |
| Confide `aggression_toward_others` 等安全分类 / 危机转介 | **安全功能**，不是商业秘密；语料可 overlay，分类器本身不算本层 |
| Memory ranking、Speak probability | 留 L0/L1；**≠** Pack |
| Calm Action Wisdom 70 条 CMS | 内容型候选；**尚未接线** → 先长出运行时，再谈 overlay（§3.2②） |

**支付云 ≠ 品味云 ≠ YPE 云 ≠ 备份云。** 它们都可以「在云上」，但只有上表「算」的才叫防剽窃层。

---

## 3. 准入四问（扩成员须同时过）

一项要纳入本层须 **同时** 过：

1. **改错代价**：会不会让用户用不了、错扣/少给钱或点？会 → 不上本层。  
2. **点击路径**：是否必须在用户点击 / 开口当下用到（不能等网；0–1 秒接收反馈）？是 → 不上本层（可 overlay 缓存，不可挡 Sit / Confide Send）。  
3. **钱与权益**：是否定价 / 门槛 / `isEntitled` / Stripe / 发点？是 → 走支付云，不走本层。  
4. **本地同一张表**：没网能否用本地副本；认不了的 `schemaVersion` / 键集合能否静默丢掉？不能 → 不上本层。

品味层 Backlog 的四问与本条 **同一把尺**；扩池改形须升 `schemaVersion` 并同步本地兜底。

**过本条只证明「放进本层不会踩离线 / 付钱 / 点击红线」。** 空壳、回声闭包、与冻表尚未分叉的表，都可以过四问，却仍然不值得当成「已保护的秘密」。是否投入保护资源 → §3.2。

---

## 3.1 冻表 = 公开兜底；现网表可密（2026-09-02 拍板）

「别人能拷走 App、很难拷走灵魂参数」**只有**在已部署 Worker 上的表 / 闭包与仓库冻表 **分叉之后**才成立。

| 层 | 进 git 的是什么 | 允许只活在已部署 Worker 的是什么 |
|---|---|---|
| **品味 / Quiet Line** | 本地冻结表（够用的离线手感、键集合、`schemaVersion` 兜底） | 权重数字、句池正文（同键；可与冻表不同） |
| **YPE** | Pack **形状**、V1 回声闭包、V2 **token 白名单**（验收锚） | V2 阈值与映射（`algorithmVersion`；**不下发** Pack） |

硬闸：

1. **冻表是公开兜底**，不是现网手感的副本义务。四问④要求没网仍有本地同一**张**表（同键 / 可静默丢未知版本），**不**要求数字永远等于生产。  
2. **现网一旦与 git 分叉**：禁止把灵魂数字再写回 `tasteLayerFreeze` / locale 冻池 / 本 Brief 的阈值表，当作「同步文档」。客户端继续带公开兜底即可。  
3. **扩形**（增删 key / 新 insight token / 新 `schemaVersion`）仍须升版本，并给客户端一份认得出的兜底；手感漂移走 Redeploy，不走把现网表贴进 git。  
4. **未知版本整包丢弃**（已有）：客户端不认识 → 本地冻表 / L0/L1；禁止崩、禁止挡 Sit。  
5. **现状（2026-09-03）**：**生产分叉**——① Worker `DAILY_ZEN_QUOTE_1`（en）= `The world and I were never two.`；git locale / 客户端冻表仍为 `Soft light…`。② Worker `CONFIDE_COMPANION_PRESENCE`（en）= `Yin is still here. We can stay like this — nothing needs to begin.`；git locale / 客户端冻表仍为 `Yin is here. We can stay like this — no need to begin.`。③ Worker `CONFIDE_BOUNDARY_RESPECT`（en）= `Nothing needs to be said. Yin is still here.`；git locale 仍 `We can leave it unspoken. Yin is here.`。ja / zh / corpus 未分叉。YPE V1 仍无秘密闭包。

权威交叉：`PROCESS.md` Backlog「云端品味层」· `YIN_PERSONALIZATION_ENGINE.md` §E · `task-ype-v2-secret-transform.md`。

---

## 3.2 值得保护四测（2026-09-06）

扩成员或争论「要不要上云防抄」时，在过 §3 之后 **再** 过下列四测。来源：2026-09-06 分析师框架；入库时补上 §3.1 兑现句与误归属闸。

1. **复制测试**：对手若拿到完整客户端，能不能一比一复刻同样手感？  
   - 价值在持续人工打磨（句库品味、编辑语气）→ **藏代码挡不住**；护城河是「我们一直在写、对方没有」。overlay 的意义是降低改句发版成本，不是把句子变成 DRM。  
   - 价值在一张可套用的权重表 / 规则表 / 闭包阈值 → **才真正需要云端表与 git 冻表分叉**（§3.1）。
2. **成熟度测试**：现在有没有长出具体内容，还是空壳 / 占位 / 回声？空壳阶段保护的是「将来可能有价值的位置」，不是「现在已有的资产」。优先级：**先长内容，再锁**。
3. **性价比测试**：走已验证的异步 overlay / Pack / `algorithmVersion` 管道 → 成本低、不碰离线与隐私红线 → 即使对象暂时不厚，**顺手接管道可以**。若机制要牵动实时决策、账号身份、或牺牲离线 → 保护对象必须真正值钱，禁止用低门槛逻辑对待。
4. **可维护测试**：团队会不会持续改它（每周句库 / 不定期权重）？会 → 放云端有发版意义。基本定型、几年不改 → 放不放云端对防抄几乎无差，只增架构复杂度。

**兑现句（与 §3.1 同一把锁）**：overlay 管道已经接线，但现网数字/正文仍等于 git 冻表 → **复制测试尚未兑现**。此时「已上防剽窃层」只说明有管道，不说明有秘密。

禁止：

- 把 `algorithmVersion` / schema 管道本身算成「秘密」。它是让句池与闭包能低成本迭代的基础设施。  
- 把安全分类、支付、备份、Confide 路由塞进本层来凑「保护面」。  
- 在东西还没长出来之前，先开新的加密 / 身份 / 实时云决策去「锁住它」。

原则层一句：`PRINCIPLES.md`「云端防剽窃与护城河」。逐项判定见下表。

### 3.2.1 已收进本层的逐项（地面真相 · 2026-09-06）

> 实现状态以 `origin/develop` git 为准，不以 Brief 措辞为准。

| 项目 | ①复制 | ②成熟 | ③性价比 | ④可维护 | 结论 |
|---|---|---|---|---|---|
| 品味层 overlay（权重 + 日签 · **#349** 现网） | 权重表可一比一套；日签是内容资产 | 通过；权重仍接近冻表，日签持续可写 | 异步、已验证 | 权重改得少；句池会写 | **值得留管道**。权重要等与冻表分叉才算秘密；句池护城河是持续写 |
| Quiet Line 句包（**#543**；EN `DAILY_ZEN_QUOTE_1` 已生产分叉） | 内容型；现网句 ≠ git 冻表 | 通过 | 通过 | 通过 | **值得，且已有一处兑现的分叉**。分析师清单若只写「品味层 overlay」会漏这一行 |
| Confide 句库/模板 overlay（**#548**；在场 **#550** / boundary **#551** 已分叉） | 语气/措辞是编辑资产 | 通过 | 通过 | 通过 | **值得**；与 Quiet Line 同类。高危模板 EN 已分叉；ja/zh/corpus 多数字仍等于冻表 |
| `algorithmVersion` / overlay 版本管道 | 不适用（不是被保护内容） | 不适用 | 通过（成本低） | 通过 | **保留为管道**，不要算进「秘密清单」 |
| YPE V1（回声选档 + `patternInsights=[]`） | 没内容可复制 | 空壳 | — | — | **现在没有可保护的秘密** |
| YPE V2（**#545 源码已合**；白名单两 token；阈值 0.6/0.4 仍是 git 验收锚；生产须「部署」） | 闭包仍浅；阈值公开则复制测试未兑现 | 管道在、秘密薄；insight **默认不进** Confide L3 | 异步 Pack 通过 | 很少改 | **管道可留；不要当成已有护城河。** 分析师写「V2 尚未实现」已过时——过时的是「无运行时」，不是「无秘密」。等现网阈值与 git 分叉、且 insight 被真实消费，再谈锁 |
| Confide `aggression_toward_others` | 不适用 | 不适用 | 不适用 | — | **不算本层**（安全，不是 IP） |
| Calm Action Wisdom 70 CMS | 将来是内容型 | **无运行时** | 接线后走 overlay 则通过 | 会写 | **现在谈保护过早**；先接线，再套已验证 overlay |
| 后排：日签 14→N / 伸懒腰池 / 好奇池 | 句扩容=内容；两池=可套用权重 | 内容未扩 / 权重已在冻表 | 过 §3，低成本 | 看是否持续调 | **后排**。过准入 ≠ 因「防剽窃」提前开工 |

**已兑现价值的部分**：持续在写、且能不发版就改的内容型 overlay（品味/日签管道、Quiet Line、Confide 句），加上少数已与冻表分叉的现网句。YPE 与未分叉的权重表目前主要是管道，不是秘密。

### 3.2.2 兑现清单（现网 ≠ 冻表？· 2026-09-06）

问「这个东西已经进防剽窃层了吗」时，**先**问现网数字/正文是否仍等于 git 冻表（§3.1 兑现句）。  
**禁止**把「overlay 已接线」写成「秘密已在保护」。本表只登记地面真相；分叉后禁止把灵魂数字写回 freeze。

#### A · 真保护（现网 ≠ 冻表）

这三处才算「保护正在发生」：

| 键 | 现网（已部署 Worker） | git 冻表仍是 |
|---|---|---|
| Quiet Line `DAILY_ZEN_QUOTE_1`（en） | `The world and I were never two.` | `Soft light…` |
| Confide `CONFIDE_COMPANION_PRESENCE`（en） | `Yin is still here. We can stay like this — nothing needs to begin.` | `Yin is here. We can stay like this — no need to begin.` |
| Confide `CONFIDE_BOUNDARY_RESPECT`（en） | `Nothing needs to be said. Yin is still here.` | `We can leave it unspoken. Yin is here.` |

ja / zh / corpus **未**分叉。上列之外的 Quiet Line / Confide 键，现网仍等于冻表。

#### B · 已收进本层、尚未兑现（管道在 · 现网 = 冻表）

成员表（§2）里有名字，复制测试未兑现：

| 项目 | 为何仍是空管道 / 薄秘密 |
|---|---|
| 品味层 Dispatcher 权重（**#349**） | 可一比一套的表；现网仍接近冻表 |
| Honesty 分档阈值 | 同上；overlay 不改 `HonestyCheckInController` |
| 日签池 14 条（en/ja） | 管道在；正文未与冻表分叉（Quiet Line 另池，见 A） |
| Quiet Line 除 `DAILY_ZEN_QUOTE_1` en 外 | overlay **#543** 已合；其余键 = 冻表 |
| Confide 除在场/boundary EN 外 | overlay **#548** 已合；ja/zh/corpus = 冻表 |
| YPE V1 | 回声；无秘密闭包 |
| YPE V2（**#545** 源码已合） | 阈值 0.6/0.4 仍是 git 验收锚；insight 默认不进 Confide 开口；生产须「部署」才谈现网 |
| `algorithmVersion` / schema 管道 | **不是**被保护内容 |

#### C · 应该进入、尚未进入（关注清单 · 不开工令）

| 项目 | 缺的是什么 | 何时才算「进了」 |
|---|---|---|
| Dispatcher 权重 / Honesty 分档（**唯一算法型秘密候选**，除 YPE 外） | 管道已在 B；缺与冻表分叉的手感数字 | 现网权重/分档 ≠ git 冻表，且不再写回 freeze |
| YPE V2 非平凡闭包 | 源码在；缺现网阈值分叉 + insight 被真实消费 | 现网阈值 ≠ 验收锚，且 Confide/编排真用上 insight |
| Quiet Line / Confide 其余键与 ja/zh/corpus | 内容型；多数键还等于冻表 | 逐键现网 ≠ 冻表（不要求一次全部分叉） |
| Calm Action Wisdom 70 CMS | **无运行时** | 先接线，再套已验证 overlay；现在谈保护过早 |
| 后排：日签 14→N / 伸懒腰池 / 好奇池 | 过 §3；内容未扩 / 权重仍冻表 | 另口令。**禁止**只因为「属于防剽窃层」提前开工 |

#### D · 明确排除（不要进本层）

chrome 文案、Idle/CapCut/精灵播放器、Confide 路由 / Qwen / Tool Registry、支付/entitlement、练习备份、安全分类（含 `aggression_toward_others`）。

**一句话对照**：A = 已经进（真保护）。B = 名字在层里、秘密还没有。C = 该进真保护或该接线、现在还没有。D = 永远不算。

脚注（2026-09-08 · 分析师核对，不影响上表结论）：

1. **Dispatcher 权重 / Honesty 分档同时出现在 B 与 C，不是矛盾。** B 是 t0（名字已在成员表，现网仍等于冻表，严格不算已保护）；C 是 t1（等积累出冻表覆盖不了的差异化数字，再纳入真保护）。同一对象的两个镜头，不要合并或去重成一行。  
2. **YPE V1 只在 B、不进 C，不是漏项。** V1 契约就是回声选档 + `patternInsights=[]`，设计上不产生非平凡秘密，没有「等成熟」的未来态；接班的是 V2。禁止用「V1 怎么还没进」要求把它列入 C。

---

## 4. 不变量

- 核心 Sit / Rise / Idle / Confide Send **禁止**硬依赖云请求成功。  
- overlay 失败、超时、未知版本 → 静默本地。  
- 内容相同 → 不另存副本（`BACKGROUND_NETWORK` Q2；品味层 `RB-20260820-L330`）。  
- **禁止**默认上传 Confide 原文、Memory 摘要、Whisper 掩码。  
- **禁止**用完成率把陪伴档改成教练（YPE 选档仍用户优先）。  
- 后台预取须答 `BACKGROUND_NETWORK.md` 三问；禁止与精灵预加载 / Arrival·Honesty CapCut 抢主线程。  
- 生产 Worker Redeploy 仍须口令「部署」（`prod-worker-deploy`）。

---

## 5. 口令队列（2026-09-02）

用户已同意执行下列口令。**一次一任务**；本文件只锁次序与 Brief 指针。

| 序 | 任务 | 口令 | 本回合 |
|---|---|---|---|
| **0** | 本 SSOT 入库 | （概念纳入项目） | **#542 已合** |
| **1** | Quiet Line / 今日静语句包 overlay | 「开工 Quiet Line 句包 overlay」 | **#543 已合**（源码；生产 Redeploy 另须「部署」） |
| **2** | YPE V2 秘密变换 + 服务器 `algorithmVersion` | 「开工 YPE V2」 | **#545 已合 develop**（生产须「部署」） |
| **3** | Confide 句库/模板 overlay | 「开工 Confide 句库 overlay」 | **#548 已合**（`/api/confide-copy`） |
| **3b** | Confide 在场 EN 生产分叉 | 审定句 + 「部署」 | **#550 已合**（`CONFIDE_COMPANION_PRESENCE`） |
| **3c** | Confide boundary EN 生产分叉 | 审定句已锁 + 「部署」 | **#551 已合 + 生产 Redeploy**（`CONFIDE_BOUNDARY_RESPECT`） |
| **后排** | 日签 14→N；伸懒腰 / 好奇池 overlay | 另口令 | 场景见 §6 · **不开工** |
| **权重分叉** | Rise / 好奇 / Honesty 分档 | 有调参目标时 | **2026-09-07 拍板：暂不分叉** |

**执行排期 SSOT**：[`taste-layer-calm-action-roadmap.md`](./taste-layer-calm-action-roadmap.md)（Layer A–E · Recover→Arrive→overlay→后排）。

**运行时下一刀**：**Calm Action Recover**（口令「开工 Calm Action Recover」）。Confide 句 overlay 序 3 已齐。日签扩容 / 伸懒腰 / 好奇仍后排；权重分叉冻结至有 secret 调参目标。

---

## 6. 后排池 · 用户场景（不是开工令）

这三项都过准入四问，但是 **调手感权重 / 扩文学句**，不是新入口。是否开工仍须另口令，并过 §3.2（成熟度 / 可维护）；**禁止**只因为「属于防剽窃层」就提前做。

| 外号 | 用户实际碰到什么 |
|---|---|
| **日签 14→N** | 一场练习结束，Reflection 卡**底部**那句 Daily Wisdom（与菜单 **A Quiet Line / 今日静语** 分池）。现在 en/ja 各冻 14 个 id。扩 N = 同一位置句子变多、同日仍锁一句；**不是** Quiet Line 明信片。 |
| **伸懒腰池** | 计时中途点 **Rise**，阿寅播加权池：约 60% 伸懒腰箕坐 / 25% 喝茶 / 15% 看书，然后 Reflection。上云只调这三档权重，不改动画文件。 |
| **好奇池** | Idle 里鼠标靠近停几秒，极低概率耳摇或张望。上云只调这些 Idle 彩蛋权重，不改 Sit。 |

挥手点播（珍藏）**不是**本层。
