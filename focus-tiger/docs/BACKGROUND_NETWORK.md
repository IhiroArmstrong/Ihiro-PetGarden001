# BACKGROUND_NETWORK.md — 非用户点击的网络请求（实现前门禁）

创建日期：2026-08-22  
权威路径：`focus-tiger/docs/BACKGROUND_NETWORK.md`  
索引：`RULES_INDEX.md` → `background-network`

地位：与 `INTERACTION_FEEDBACK_PRINCIPLES.md` / `FEATURE_CONFLICT_REVIEW.md` **平级**的实现前门禁。  
目的：自动同步、后台拉配置、开机检查等**不是用户点了才发**的请求，不得和动效抢主线程、不得无条件重写本地副本。

交叉引用（只引用、不复述）：

| 文档 | 分工 |
|---|---|
| [`INTERACTION_FEEDBACK_PRINCIPLES.md`](./INTERACTION_FEEDBACK_PRINCIPLES.md) | 用户**点了**之后 0–1 秒看见什么 |
| [`FEATURE_CONFLICT_REVIEW.md`](./FEATURE_CONFLICT_REVIEW.md) | 实现前用户路径冲突扫描 |
| [`SILENT_BEHAVIORS.md`](./SILENT_BEHAVIORS.md) | 设计静默白名单 |
| [`RISK_MITIGATION_PLAYBOOK.md`](./RISK_MITIGATION_PLAYBOOK.md) | 多模块穿透怎么切片；**不**代替本条三问 |

---

## 何时适用

**新增或修改**下列任一请求时，写代码 / 改权威运行时文档 **之前**必须在开工回复与 **PR 描述**里回答下方三问：

- 自动同步、定时 flush、空库恢复  
- 开机 / 回前台拉配置、版本清单、品味层 overlay  
- 后台预取、首次模型下载（用户打开入口后自动开始的大文件也算）  
- Service Worker / 软更新探测等非按钮触发的 `fetch`

**通常不适用**（仍答点击三问，见 `interaction-feedback`）：

- 用户点了 Enable / Send code / Checkout / Restore / Save image 才发出的请求  
- 纯文档、机器块刷新、与用户路径无关的索引 → PR 写 **「不涉及后台网络」**

不确定算不算「非用户点击」→ **按适用来答**，不要用「请求很快」跳过。

---

## 实现前三问（强制）

适用于**非用户主动点击触发**的网络请求。用户点了才发的路径不走本条。

### Q1 · 时机是否撞上动效窗口

这个请求的触发时机，是否和任何动效密集的转场窗口重叠（Arrival / Honesty / Reflection 的叠化转场、Idle 呼吸循环开始、精灵预加载阶段）？

- **重叠** → 必须显式排到该窗口之后再发起。  
- **禁止**假设「网络请求快，应该来得及」。

### Q2 · 未变化时是否重写本地

数据未变化时，是否会重复写入本地存储？

- 必须做成 **内容相同则跳过写入，只更新一个 cloud-ok 标记**。  
- **禁止**无条件覆盖存一份新副本。

### Q3 · 失败 / 慢会不会卡动效

这条请求失败/慢，是否会让任何正在播放的动效卡顿或掉帧？

- 须在**低速网络模拟**下实测一次动效流畅度。  
- **禁止**只测「请求本身成功与否」。

三问任一条答不上 → **不得**开工改运行时。

---

## 2026-08-22 现网触点自查

对照口令点名的三条，外加已接线的相邻开机拉取。本表是审计，**不是**本回合修复。

### 1. 练习备份同步（已接线 · 本旁支已错峰 · 慢网人工仍待）

| 问 | 结论 |
|---|---|
| 触发 | **本旁支（`fix/practice-backup-background-network`）**：Idle 进入后约 **2500ms** `forceSoon` 上传；壳就绪且精灵预加载之后约 **2500ms** 空库恢复，且看 busy。用户 Enable / OTP / 关备份仍是点击触发，不算本条。 |
| Q1 | **已错峰（本旁支）**。busy 含 Focusing / Celebrate、Arrival 开着、Honesty 时长/呼吸/致谢、以及 `postSessionOverlayActive`。叠层 busy 会短重试；Focusing 不轮询。禁止假设请求很快。 |
| Q2 | **已做到（本旁支）**。白名单 JSON 相同则跳过 `setItem`；快照指纹相同则不 PUT，只刷新 opt-in 的 cloud-ok（`lastUploadAt` / `lastUploadFingerprint`）。 |
| Q3 | **单元已锁 busy 期间不发请求**；低速网 Idle 呼吸 / Arrival 叠化流畅度仍须人工（TRACKER 碎片）。 |

修复任务：`docs/task-briefs/task-practice-backup-background-network.md`  
口令：「开工练习备份后台网络修复」

### 2. Quiet Line / Confide 句包（已接线 · 并进品味层预取 · 生产须部署）

| 问 | 结论 |
|---|---|
| 触发 | `prefetchTasteLayer` 在 `waitUntilCanApply` 之后 `Promise.all`：`/api/quiet-line` + **`/api/confide-copy`**（与权重/日签同槽；`?tasteLayer=0` 全关）。**不**在 Confide Send 热路径发请求。 |
| Q1 | 与品味层同一错峰：`canApply` 看 Arrival / Honesty / Reflection chrome；仍可能与精灵预加载窗口相邻（错峰债务见 §4，本 PR **不**顺手改开机时机）。 |
| Q2 | overlay 仅内存；冻表相同只标 cloud-ok，不另存副本。 |
| Q3 | 失败/超时用本地句；Send 0–1s 不待网。低速网 Idle 呼吸仍须人工（TRACKER）。 |

运行时 Brief：`task-quiet-line-copy-overlay.md` · `task-confide-copy-overlay.md`。禁止和开机预取错峰 / YPE 混同一个 PR。

### 3. Electron 桌面陪伴首次模型下载（已接线 · 有残余风险 · 单独修复任务）

| 问 | 结论 |
|---|---|
| 触发 | 用户打开宽屏 Confide 后 `ensureReady()` → 子进程 `ensureGgufDownloaded`。不是冷启动自动下。`FT_COMPANION_L0=1` 是探针，不是产品路径。 |
| Q1 | 入口在 Idle Confide 卡淡入。下载在 **Node 子进程**，不和 Arrival / Honesty / Reflection 叠化同窗。仍与 **Idle 呼吸**同屏。 |
| Q2 | 磁盘侧已跳过：文件存在且 ≥ `L0_MODEL_MIN_BYTES` 则 `downloaded: false`。无 localStorage 副本。 |
| Q3 | **未按本条实测**。L0 曾记 Focusing hitch「无可见影响」，那是模型已在盘、测的是推理/卸载，**不是**首次大文件慢网下载时 Idle 是否掉帧。 |

修复任务：`docs/task-briefs/task-companion-first-download-hitch.md`  
口令：「开工陪伴首次下载卡顿核验」

### 4. 相邻 · 开机品味层预取（已接线 · 有风险 · 单独修复任务）

口令没点名，但是已接线的同类后台请求。

| 问 | 结论 |
|---|---|
| 触发 | `init()` **第一行之后立刻** `prefetchTasteLayer`（`/api/emotion-weight` + `/api/daily-message`，2.5s 超时）。发生在 `poseManager.preload` / `spritePlayer.preload` **之前**。切语言再拉一次。 |
| Q1 | **重叠精灵预加载**。也早于 Idle 呼吸第一拍。 |
| Q2 | overlay 在内存（`setTasteWeightOverlay`），**不**写 localStorage。本问通过。 |
| Q3 | 失败降级本地表，不挡 Sit。仍**未**在低速网下测预加载 / 首段 Idle 是否掉帧。 |

同窗还有软更新 `GET /version.json`（壳就绪立刻 + 回前台）。一并核验，不必拆第四条。

修复任务：`docs/task-briefs/task-taste-layer-boot-prefetch-defer.md`  
口令：「开工品味层开机预取错峰」

### 5. Quiet Together / Global Lanterns（本旁支接线 · 生产须部署）

| 问 | 结论 |
|---|---|
| 触发 | Idle/Arrive **peek** 推迟约 2500ms；Sit 后 **heartbeat** 推迟约 2500ms，之后 45s。Honesty / Reflection / Focusing 为 busy（Arrival 开着仍允许 peek）。Rise / 完成 / 关开关 / `pagehide` → leave。 |
| Q1 | 已错峰。禁止与 Arrival/Honesty CapCut、Idle 首段呼吸同步发。Focusing 内不画灯火。 |
| Q2 | 人数未变不刷新 DOM。偏好只在用户拨开关时写入。 |
| Q3 | 失败隐藏灯火，不挡 Sit。慢网 Idle 呼吸仍须人工。 |

Brief：`task-quiet-together-lanterns-mvp.md`。

---

## 修复任务怎么排（本回合只立项）

**我认为最合理的是：先修练习备份，再错峰品味层开机预取，最后核验陪伴首次下载。**（`RULES_INDEX` → `recommend-most-reasonable`）

- 练习备份会在 **每个已同意用户的每次回 Idle** 发请求并写盘，和呼吸循环撞车面最大。  
- 品味层开机预取和精灵预加载同窗，但失败已降级、不写盘。  
- 陪伴下载要用户先开 Confide、已在子进程、磁盘已跳过；缺的是慢网动效证。  
- Quiet Line 句包 overlay **#543 已合**。YPE V2 本旁支只改 ingest **响应 Pack** 与客户端校验，不新开请求。

禁止把三条修进行为塞进本门禁 PR。

---

## PR / 开工怎么答

触及适用请求时，PR 增加 **「后台网络三问」** 小节，逐条写 Q1–Q3（时机、写盘、慢网动效）。  
不涉及 → 写 **「不涉及后台网络」**。
