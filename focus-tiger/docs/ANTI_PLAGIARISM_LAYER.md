# 防剽窃层 · Anti-Plagiarism Layer

> **状态（2026-09-02）**：产品方向锁 · **本文件无新运行时**。  
> **拍板**：凡客观上有「难复制的表 / 闭包变换只存在服务器、客户端只拿 overlay、没网用本地冻结表」作用的云切片，统称 **防剽窃层**。  
> **本文件禁止被解读成**：一次把 Quiet Line / YPE V2 / Confide 句库全部改运行时；须分 PR。口令队列见 §5。

交叉引用（只引用、不复述细则）：

| 文档 | 职责 |
|---|---|
| `PROCESS.md` Backlog「云端品味层」 | 权重 + 日签池现网 v1 |
| `YIN_PERSONALIZATION_ENGINE.md` | YPE 编排 / Consent / Pack 形状 |
| `task-briefs/task-l2-personalization-algorithm.md` | YPE V1 五键→Pack 闭包 |
| `task-briefs/task-quiet-line-copy-overlay.md` | Quiet Line 句包 overlay（下一刀运行时） |
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
| Memory ranking、Speak probability | 留 L0/L1；**≠** Pack |

**支付云 ≠ 品味云 ≠ YPE 云 ≠ 备份云。** 它们都可以「在云上」，但只有上表「算」的才叫防剽窃层。

---

## 3. 准入四问（扩成员须同时过）

一项要纳入本层须 **同时** 过：

1. **改错代价**：会不会让用户用不了、错扣/少给钱或点？会 → 不上本层。  
2. **点击路径**：是否必须在用户点击 / 开口当下用到（不能等网；0–1 秒接收反馈）？是 → 不上本层（可 overlay 缓存，不可挡 Sit / Confide Send）。  
3. **钱与权益**：是否定价 / 门槛 / `isEntitled` / Stripe / 发点？是 → 走支付云，不走本层。  
4. **本地同一张表**：没网能否用本地副本；认不了的 `schemaVersion` / 键集合能否静默丢掉？不能 → 不上本层。

品味层 Backlog 的四问与本条 **同一把尺**；扩池改形须升 `schemaVersion` 并同步本地兜底。

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
5. **现状（2026-09-03）**：**生产分叉**——① Worker `DAILY_ZEN_QUOTE_1`（en）= `The world and I were never two.`；git locale / 客户端冻表仍为 `Soft light…`。② Worker `CONFIDE_COMPANION_PRESENCE`（en）= `Yin is still here. We can stay like this — nothing needs to begin.`；git locale / 客户端冻表仍为 `Yin is here. We can stay like this — no need to begin.`。日文 / boundary / corpus 未分叉。YPE V1 仍无秘密闭包。

权威交叉：`PROCESS.md` Backlog「云端品味层」· `YIN_PERSONALIZATION_ENGINE.md` §E · `task-ype-v2-secret-transform.md`。

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
| **3** | Confide 句库/模板 overlay | 「开工 Confide 句库 overlay」 | **本旁支运行时**（`/api/confide-copy`；生产须「部署」） |
| **后排** | 日签 14→N；伸懒腰 / 好奇池 overlay | 另口令 | 场景见 §6 · **不开工** |

**运行时下一刀**：生产 Redeploy（须口令「部署」）后再谈现网分叉。序 1–3 源码本刀已齐。日签扩容 / 伸懒腰 / 好奇仍后排。

---

## 6. 后排池 · 用户场景（不是开工令）

这三项都过四问，但是 **调手感权重 / 扩文学句**，不是新入口。

| 外号 | 用户实际碰到什么 |
|---|---|
| **日签 14→N** | 一场练习结束，Reflection 卡**底部**那句 Daily Wisdom（与菜单 **A Quiet Line / 今日静语** 分池）。现在 en/ja 各冻 14 个 id。扩 N = 同一位置句子变多、同日仍锁一句；**不是** Quiet Line 明信片。 |
| **伸懒腰池** | 计时中途点 **Rise**，阿寅播加权池：约 60% 伸懒腰箕坐 / 25% 喝茶 / 15% 看书，然后 Reflection。上云只调这三档权重，不改动画文件。 |
| **好奇池** | Idle 里鼠标靠近停几秒，极低概率耳摇或张望。上云只调这些 Idle 彩蛋权重，不改 Sit。 |

挥手点播（珍藏）**不是**本层。
