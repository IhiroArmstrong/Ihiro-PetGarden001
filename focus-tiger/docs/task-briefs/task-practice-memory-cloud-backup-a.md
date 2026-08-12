# Task Brief · 练习记忆 · 云端快照备份 / 恢复（免费 A）

> **状态（2026-08-12）**：产品口径已拍板（#266 · tip `4698348`）；**本 Brief 已立项**。  
> **范围修订（Prompt 11.5 · 2026-08-12）**：白名单扩为 **6 key 统一快照**（新增 `entitlement-ownership` / `ritual-completions` / `mustard-seed-seal`）；机制 = 一次序列化、一次 put/get，不拆多条同步链。  
> **运行时**：未接线；须用户口令「开工练习记忆备份 A」后再开 `feature/practice-memory-cloud-backup-a`。  
> **权威**：`PROCESS.md` Backlog「练习记忆云端备份」· `FREE_PAID_MATRIX`「练习记忆 · 云端快照备份 / 恢复」。

## 目标

用户**无需手动点备份**：在已绑邮箱 + 明示同意 + 有网时，练习史 / Journey Log 等「不该丢」数据**定期或会话后静默上传**云端快照；本机被 Safari/ITP 静默清库或清机后，能**恢复最近一次备份**。

解决的是「不出问题」（可靠性），**不是**多端实时无缝陪伴（那是 **B · 付费可后排**）。

## 拍板摘要（勿再议）

| 项 | 口径 |
|---|---|
| 档位 | **免费 A**；禁止把防丢失做成付费墙 |
| 模型 | 本机权威日常写入 → 定期/会话后静默快照 → 空库/清机恢复最近一次 |
| 首版不做 | 实时双向同步、多端冲突合并、CRDT |
| 身份 | **唯一复用邮箱 OTP**（与付费 restore **一套身份、两种用途**）；禁止匿名 device id |
| 未绑邮箱 | **无云端兜底**；须**温和、非打断**提示（例 Journey Log 角落引导）；禁止弹窗打断主路径 |
| 离线 | 核心练习路径仍可离线；无网/未绑 → 本机照常，只是没有云兜底 |
| 与 v1.1 云端算法 | **分开**（daily-message / emotion-weight 等）；勿混同一 Task |

## 覆盖清单（Prompt 11.5 白名单锁定）

> **机制**：六个 key **打成一份** `practice memory snapshot` → **一次**序列化、**一次** `put` / **一次** `get` 整包恢复。**禁止**按 store 拆多条同步链。

| 纳入快照（必含） | Key | 备注 |
|---|---|---|
| Journey Log | `focus-tiger.journey-log.v1` | 用户可见「旅程」 |
| 练习日 / 热力图 | `focus-tiger.practice-days.v1` | 「练习史」主载体 |
| 里程碑已播戳 | `focus-tiger.milestone-glow.v1` | 防重复庆祝丢失后重播尴尬 |
| 持久 ownership | `focus-tiger.entitlement-ownership.v1` | **硬包含**：订阅到期仍永久可看的本机证据；支付 OTP **不**写回此 key；丢了会破坏商业红线 |
| 进阶仪式完成 trail | `focus-tiger.ritual-completions.v1` | 同批；与 Focus/Journey 分轨的仪式留痕 |
| 芥子须弥纪念印 | `focus-tiger.mustard-seed-seal.v1` | 同批；防「已揭示」丢失后再弹 |

| 默认**不**纳入（纯本机 / 另桶） | 原因 |
|---|---|
| hints / 冷却 / 当日门闩 / onboarding seen | 可重建；丢了不伤「记忆」叙事 |
| tip-jar / **`entitlement-cache.v1`**（lifetime/subscription 活态） / membership-device | 另有支付 OTP restore；**勿与练习快照混桶**（ownership ≠ cache） |
| Ambient 偏好、语言等设置 | 可另议；首版不做 |

实现 PR 若要增删字段，须在 PR 描述写清并同步本 Brief 表；**不得**在未修订本表的情况下只备份 Journey Log。

## 工程草图（实现时）

### 客户端

1. **本机权威**：现有 store 读写路径不变；快照 = **一次性**只读导出上表 **6** 个 key（单一 payload，非六次独立上传）。  
2. **上传触发**（静默，不挡 UI）：  
   - 白名单内任一层有意义写入后（例 Focus/Journey append、claimOwned、仪式完成、纪念印揭示）→ debounce（建议 ≥5–15 min 或「本会话 Idle 一次」）后 **整包** put；  
   - 另可低频定时（例 24h 内最多 N 次）。  
   - Focus / Arrival / Reflection **进行中不抢网、不弹失败**。  
3. **恢复触发**：启动检测到「覆盖 keys 全空或明显被清」+ 已绑邮箱 → 拉最近**整包**快照写回 6 key（策略实现时单测锁：空库才自动恢复；非空本机优先，避免误覆盖）。  
4. **绑定引导 UI**：Journey Log 卡角落轻链「绑定邮箱可获得云端备份」（i18n）；点开走既有 OTP 流扩展 purpose，**非**新账号体系。  
5. **隐私**：上传前须明示同意（发什么、为何、多久）；未同意 = 不传。可与 Privacy sheet 短句对齐，禁止过度承诺「永不丢」。

### Worker（`focus-tiger/cloud/`）

1. **复用**现有 OTP / Resend / `OTP_KV` 纪律（限流、pepper、`waitUntil`）；扩展 `RestorePurpose` 或等价：`practice-backup`（命名实现时定，ASCII）。  
2. **新路由草图**（路径可微调）：  
   - `POST /api/practice-backup/put` — 已认证（email + deviceToken 或刚验 OTP）→ 写 KV 快照（建议独立 `PRACTICE_BACKUP_KV` 或明确前缀；TTL/配额立项时定，防滥用）。  
   - `POST /api/practice-backup/get` — 同上 → 返回最近快照。  
3. **禁止**：未 OTP/token 的裸邮箱读写；与 tip/sanctuary entitlement KV **混键**。  
4. **生产 redeploy**：与既有 OTP 同纪律——secrets 齐备后再部署；合 develop ≠ 已 redeploy。

### 测试 / 文档

- 单测：序列化白名单、debounce 门闩、空库才自动恢复、未同意不上传。  
- 可选 `test:e2e:changed --` 单 spec：mock Worker。  
- 同步：`SHARED_RESOURCES`、`cloud/README`、`PRIVACY_NOTICE` / 应用内 Privacy 句、`TEST_TRACKER` UI 行、`FREE_PAID_MATRIX` 接线状态。

## 明确不做（本 Brief）

- B 档多端无缝同步 / 近实时一致  
- 匿名 device id 跨端身份  
- 未明示同意就上传练习字段  
- 把 A 与 B 混成「一个同步开关」却不分免费/付费  
- 依赖本功能才能完成一炷香（核心路径仍纯本地）  
- 弹窗威胁「不绑就会丢数据」

## 排期口令

| 口令 | 含义 |
|---|---|
| （已完成）开 Brief / 立项 | 本文件 + 文档交叉引用 |
| **开工练习记忆备份 A** | 开 `feature/practice-memory-cloud-backup-a` 写运行时 |
| 评估练习记忆云端快照 | 只读评估 / 估工期，不写业务 |

## 验收（运行时实现后）

- **主路径**：绑邮箱 + 同意 → 白名单内有写入（含 Journey 与/或 ownership）→ 静默**整包**上传 → 清上述 6 key → 恢复后六者均在（尤其 `entitlement-ownership`）。  
- **回流**：未绑邮箱 → 角落引导可见、主路径可练；拒绝同意 → 不上传。  
- **保护**：Focus 中不弹失败；与 tip/Sanctuary restore **语义分立**（同一 OTP 基础设施，不同 purpose/KV）；**不得**用支付 restore 冒充 ownership 恢复。

## 权威交叉

- `PROCESS.md` 最近拍板 + Backlog「练习记忆云端备份」  
- `FREE_PAID_MATRIX.md` A 行「练习记忆 · 云端快照备份 / 恢复」  
- `SHARED_RESOURCES.md`（上表 6 key；勿与 `entitlement-cache.v1` 混淆）  
- `cloud/README.md`（OTP restore 既有路由）  
- `YIN_MEMBERSHIP.md` / entitlement restore（身份复用，勿复制第二套邮箱体系）  
- 相邻但**非本任务**：`PROCESS` Backlog「v1.1 云端算法」· B 多端无缝  
