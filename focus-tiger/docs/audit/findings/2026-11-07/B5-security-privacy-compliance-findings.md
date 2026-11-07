# B5 · 安全、隐私与合规 — 审计发现（基线轮）

- 基准：[`AUDIT_BASELINE.md`](../../AUDIT_BASELINE.md) v1.1 · Brief：[`briefs/B5-security-privacy-compliance.md`](../../briefs/B5-security-privacy-compliance.md)
- 事实底稿：[`facts/2026-11-06/`](../../facts/2026-11-06/INDEX.md)（第 0 轮，#1586）+ 本目录 `evidence/`（B5 补跑，见 §0.2）
- 审计基线：`origin/develop` @ `ec0fc0c7`（含 #1581 基准包、#1586 事实底稿）
- 审计日期：2026-11-07 · 方式：**只读**（未改产品代码、未改任务账）
- 用户可见产品名：**Samatia**（仓库与代码标识仍为 Focus Tiger）
- 复核状态：全部条目 **未复核**（第 2 轮须由独立会话复核 P1）
- 本报告**不出具法律意见**；合规结论统一写「对照 XX：存在/不存在缺口」，法律判断见 §9「法务确认项」。

---

## 0. 摘要

### 0.1 否决项判定表（V1 / V3 / V4）

| 否决项 | 判定 | 检状态 | 一句话依据 | 证据指针 |
|---|---|---|---|---|
| **V1** 未经同意的外传 | **通过** | 已检（静态代码级）；运行时抓包 **未检** | 所有带**用户数据**的上传（研究计数、个人化信号、付费漏斗计数、云备份）均在本地同意开关之后；云备份整体被写死关闭。默认开启的网络请求只带语言、日期、随机会话 id，不含用户内容。 | §2 网络清单、§3 同意对照；9-05 |
| **V3** 用户安装产物中已知可利用且未缓解的高危漏洞 | **通过（暂定）** | 已检（依赖扫描 + 调用路径） | 桌面端生产依赖有 2 严重 / 2 高危，Electron 运行时本身也落在官方修复范围之外；但在当前威胁模型（渲染进程只加载本地打包内容、隔离+沙箱、外链与 IPC 有白名单）下**未找到外部可触发路径**。不构成否决，但风险高，见 9-02、9-03。 | §6；`evidence/npm-audit-desktop-*.json` |
| **V4** 用户数据无可恢复路径 | **通过** | 已检 | 应用内有「偏好设置 → 备份与恢复」本地 JSON 导出/导入；桌面改名后旧数据仍留在旧目录，未被删除。 | §5；9-01 |
| V4 特别项：改名导致「像进度清空」的应用内提示 | **未满足 → 登记 P1 风险（非否决）** | 已检 | T87-B 改了桌面 `appId`/`productName`，数据目录随之变化；「用改名前备份恢复」只写在测试台账，应用内无任何提示。 | 9-01 |

V2（危机路由）归 B6，本报告不判定。

### 0.2 本轮补齐的事实底稿缺口

第 0 轮底稿有两处缺口，B5 只读补跑或登记：

1. `facts/2026-11-06/npm-audit-desktop.json` 为 **0 字节**（无法解析）。B5 在 `focus-tiger/desktop` 只读补跑 `npm audit --package-lock-only`（全部依赖 / `--omit=dev` 两份）与 `focus-tiger/cloud` 的 `--omit=dev`，原始输出放在 [`evidence/`](evidence/)。
2. `facts/2026-11-06/INDEX.md` 列出的 `crisis-related-unit-tests.log` **不在目录内**。属 B6 输入，本报告仅登记（9-13），不补跑。

### 0.3 维度 ⑨ 评分（仅已检子集）

| 维度 | 权重 | 检状态 | 得分（已检子集） | 通过线 | 是否过线 |
|---|---:|---|---:|---|---|
| ⑨ 安全、隐私与合规 | 10% | **部分已检**（见 §10 覆盖率） | **2** | ≥3 且无否决项 | **否**（无否决项触发，但得分 < 3） |

打分理由（推断）：同意门闸、OTP、Stripe 签名、Electron IPC 隔离等**做法存在且有单测**；但有 3 条 P1（改名迁移无提示、Electron 运行时过旧、模型下载无完整性校验）和多条披露/撤回缺口，且桌面依赖未进 CI 审计——属于「有做法但不稳定」，不到「稳定可复现」。

### 0.4 发现一览

| 编号 | 级别 | 标题 | 成本 | 影响面 |
|---|---|---|---|---|
| 9-01 | **P1** | 桌面改名后数据目录变化，应用内无「用旧备份恢复」提示 | S | 已安装旧版的桌面用户 |
| 9-02 | **P1** | Electron 37.10.3 落在官方修复范围外；桌面依赖不在 CI 审计内 | M | 全部桌面用户 |
| 9-03 | **P1** | 本地模型下载无哈希校验、引用可变分支、含第三方镜像 | S | 启用本地陪伴的桌面用户 |
| 9-04 | P2 | 限流 key 可被任意 Bearer 头绕过，且计数仅存于单实例内存 | S | 云接口（OTP/邮件） |
| 9-05 | P2 | 启动时自动发起的「品味层/成长度量」请求未在隐私页披露 | S | 全部联网用户 |
| 9-06 | P2 | 关闭研究/漏斗开关后，云端已收数据不删除 | M | 打开过开关的用户 |
| 9-07 | P2 | 渲染进程无 CSP（内容安全策略） | S | 全部桌面用户 |
| 9-08 | P2 | 无专业密钥扫描器进 CI（本轮启发式扫描未命中） | S | 内部 |
| 9-09 | P2 | 无「非儿童产品」用户可见声明 | S | 全部用户 |
| 9-10 | P2 | 隐私说明未列第三方服务/子处理者 | S | 全部用户 |
| 9-11 | P3 | 仓库内 Worker 配置为本地开发值（CORS 源、回跳地址） | S | 内部 / 部署 |
| 9-12 | P3 | `node-llama-cpp` 默认可能触发源码构建（拉入 simple-git 严重项） | S | 启用本地陪伴的桌面用户 |
| 9-13 | P3 | 第 0 轮事实底稿两处文件缺失 / 为空 | S | 内部 |
| 9-14 | P3 | 倾诉观察日志（jsonl）主进程不校验结构、不轮转 | S | 桌面用户（本地） |
| 9-15 | P3 | 休眠中的云备份为按邮箱明文存储；启用前须补加密与文案 | M | 将来启用时全部备份用户 |

无 P0。顶部不标 🚩。

---

## 1. 数据地图

| 数据类别 | 来源 | 用途 | 存储位置 | 是否离设备 | 保留期 | 删除路径 |
|---|---|---|---|---|---|---|
| 练习记录（Journey Log、练习日、里程碑、仪式、芥子印、莲池、成长阶段） | 用户练习 | 本地展示与成长 | 浏览器/Electron `localStorage` | 否（云备份被写死关闭，见 9-15） | 本地无期限 | 应用内重置 / 卸载 |
| 倾诉（Confide）对话、反思、Yin 个人记忆 | 用户输入 | 本地陪伴 | `localStorage`；桌面本地模型目录 | 否（`PRIVACY_SHEET_AI_INFERENCE`；YPE 文案写明不发送） | 本地无期限 | 重置 / 卸载 |
| 倾诉观察遥测（无自由文本） | 芯片点击 / 分享来源 | 本地观察 | `localStorage` 环形 500 条 + 桌面 `userData/companion-l2/*.jsonl` | 否 | jsonl 无上限（9-14） | 卸载 / 手删 |
| 本地备份文件 | 用户主动导出 | 迁移 / 恢复 | 用户选择的位置（明文 JSON，文案已说明） | 否（用户自己保管） | 用户控制 | 用户控制 |
| Quiet Together 在场 | 打坐开始/结束 | 共享灯笼计数 | Worker KV（`lanternPresenceKv`） | **是**：随机会话 id + 动作，**默认开启**，可在隐私页关闭 | 心跳型短时 | 关闭开关即停止 |
| 共修圈（Focus Circle）成员与在场 | 用户主动建/加圈 | 圈内在场 | Worker KV | **是**：圈 id、成员 id、日期键与时区 | 见 KV 实现（未逐项核对 TTL） | 退圈 |
| 品味层 / 成长度量配置拉取 | 启动自动 | 拉取当日文案与权重 | 不存用户数据 | **是**：语言 + 本地日期 + 固定字段；隐含 IP | — | 无（`?tasteLayer=0` 仅调试） |
| 付费意愿漏斗计数 | Support 面板事件 | 改进支持流程 | Worker KV | **是**，**默认关闭**，需开关 | 服务端 90 天 TTL | 关闭后不再上传；**已传数据不删**（9-06） |
| T54 研究计数 | 计时打坐结束 | 研究 | Worker `T54_RESEARCH_KV` | **是**，**默认关闭**，需开关 | **无 TTL** | **无删除路由**（9-06） |
| YPE 云端个人化信号 | 结构化计数 | 个性化 | Worker KV | **是**，**默认关闭**，需开关 | 见 KV | 关闭即发删除请求（已实现） |
| 邮件订阅 | 用户填写邮箱 | 通讯 | Worker KV + Resend | 是，用户主动 | 至退订 | 退订链接删除 |
| 购买 / 会员权益 | Stripe Checkout | 解锁权益 | Stripe + Worker KV | 是，用户主动 | Stripe 侧 + KV | 未核对用户侧删除（法务项） |
| 邮箱恢复 OTP | 用户主动 | 恢复购买 | Worker `OTP_KV`（只存哈希） | 是，用户主动 | 600 秒 | 过期自动 |
| 本地模型文件 | 启用本地陪伴时下载 | 本地推理 | `Application Support/Focus Tiger/companion-l0` | 下载请求会把 IP 暴露给 Hugging Face / hf-mirror | 本地 | 卸载 / 手删 |

---

## 2. 网络请求清单

客户端路径集合沿用第 0 轮 [`NETWORK_AND_CONSENT_CROSSCHECK.md`](../../facts/2026-11-06/NETWORK_AND_CONSENT_CROSSCHECK.md) §2；B5 补充每条的**触发条件与实际 Body**（静态代码）：

| 请求 | 触发 | Body 关键字段 | 默认 | 证据 |
|---|---|---|---|---|
| `POST /api/emotion-weight` | 启动后自动 | `emotionKey:'Idle'`、`sessionPhase:'arrive'`、schema | 开 | `src/core/tasteLayerSync.js:396-404` |
| `POST /api/daily-message`、`quiet-line`、`confide-copy`、`calm-action-copy`、`companion-channel-copy` | 启动后自动 | `locale`、`localDate` | 开 | `src/core/tasteLayerSync.js:407-433`；门闸 `:91-99`（仅看是否有云地址） |
| `POST /api/growth-metrics-config` | 启动后自动 | `clientSchema` | 开 | `src/core/growthMetricsConfigSync.js:147-167` |
| `POST /api/lantern-presence` | 打坐中心跳 | `schemaVersion`、`action`、随机 `sessionId` | **开（可关）** | `src/core/quietTogetherPresence.js:134-150`；默认值 `src/core/quietTogetherPreference.js:18-25` |
| `POST /api/focus-circle` | 已加入共修圈时 | `circleId`、`memberId`、`viewerDayKey`、`viewerTimeZone` | 用户主动加入 | `src/core/focusCirclePresence.js:168-182` |
| `POST /api/monetization-funnel-ingest` | 开关打开后节流上传 | 随机 `clientId`、计数、事件（已清洗） | 关 | `src/core/monetizationFunnelUpload.js:117-131` |
| `POST /api/t54-research-ingest` | 计时打坐结束，且同意 | 随机 `localResearchCode`、状态字段（白名单） | 关 | `src/core/t54ResearchUpload.js:34-50` |
| `POST /api/ype-personalization-ingest` / `delete` | 同意后 / 关闭时 | `ypeProfileId`、结构化 `signals` | 关 | `src/core/ypePersonalizationSync.js:98-160, 242-252` |
| `POST /api/practice-backup/*` | **永不**（写死关闭） | 邮箱、设备令牌、快照 | 关（代码常量） | `src/core/practiceBackup/practiceBackupCloudEnabled.js:11`；`practiceBackupSync.js:208,235,320` |
| `POST /api/newsletter/subscribe`、`restore/request-otp`、`create-*-checkout-session`、`confirm-*`、`verify-*`、`membership-entitlement` | 用户点击 | 邮箱 / Stripe session id / 权益令牌 | 用户主动 | Worker 路由 `cloud/src/index.ts:118-690` |
| 模型文件 GET（Hugging Face，失败回落 hf-mirror.com） | 启用本地陪伴、本地无模型时 | — | 随功能 | `desktop/companion/l0ModelProfiles.js:37-68`；`l0Download.js:208` |
| 自动更新 feed | 仅当环境变量 `FT_UPDATE_FEED_URL` 设置 | — | 未配置即不请求 | `desktop/updater/updaterRuntime.js:59-65` |
| `/version.json` | 网页版同源 | — | — | `src/main.js:1237`（同源，不离开产品域） |

传输：默认云地址为 `https://focus-tiger-cloud.ihiro.workers.dev`（TLS，`src/core/cloudApiClient.js:14-15`）；桌面端经主进程 IPC 转发，路径限定 `/api/` 前缀且拒绝 `..`（`desktop/ipcGuard.js:14-21`；`desktop/main.js:627-635`）。

**未检**：运行时抓包（浏览器 DevTools / 桌面代理）核对实际 Body 与静态代码一致。建议第 2 轮或发布门禁前补一次。

---

## 3. 同意与请求对照表

| 数据流 | 代码门闸 | 用户可见说明（en key） | 三语齐全 | 撤回后停止上传 | 撤回后云端删除 | 对照结论 |
|---|---|---|---|---|---|---|
| T54 研究计数 | `hasT54ResearchConsent`（`t54ResearchLedger.js:154-158`） | `T54_RESEARCH_CONSENT_LABEL/HINT`（slice） | en/zh/ja 各 2 键 | 是 | **否**（无删除路由） | 同意有效；撤回删除缺口（9-06） |
| YPE 个人化 | `isYpeCloudPersonalizationConsentEnabled` | `PRIVACY_SHEET_YPE_OPT_IN_*`（含「什么离开设备/留在设备」五条） | 是 | 是 | **是**（`onYpeCloudPersonalizationConsentDisabled`） | 无缺口 |
| 付费漏斗计数 | `isMonetizationFunnelOptInEnabled` | `PRIVACY_SHEET_FUNNEL_OPT_IN_LABEL/HINT` | 是 | 是 | **否**（`setMonetizationFunnelOptIn` 仅改本地，`monetizationFunnelOptIn.js:139-161`；服务端 90 天 TTL） | 撤回删除缺口（9-06） |
| Quiet Together | `isQuietTogetherEnabled`（默认开） | `PRIVACY_SHEET_QUIET_TOGETHER_HINT`、`PRIVACY_SHEET_DEFAULT_STORAGE` 明写「默认开、仅随机会话 id」 | 是 | 是 | 心跳型，无持久用户数据 | 已披露的默认开启；**法务确认项**（默认开启是否需事先同意） |
| 品味层 / 成长度量 | 仅检查是否配置云地址 | **隐私页未提及** | — | 不适用 | 不适用 | 披露缺口（9-05），不构成 V1（无用户内容） |
| 云练习备份 | 代码常量 `false` | `PRIVACY_SHEET_CLOUD`：「目前不提供云备份」 | 是 | 不适用 | 不适用 | 与实际一致 |
| 本地 AI / 语音输入 | 无上传路径 | `PRIVACY_SHEET_AI_INFERENCE`；`NSMicrophoneUsageDescription`（`desktop/package.json`） | 是 | 不适用 | 不适用 | 与静态代码一致；运行时 **未检** |

三语一致性：上表 key 在 en/ja/zh 三份 locale 均存在（逐键存在性检查）。**语义一致性未逐句比对**（ja/zh 长度约为 en 的 1/3–1/2，属语言差异，未发现缺失段落，但未做母语核对）→ 交 B4b。

用户主动备份寄送：当前产品内**唯一**的备份是本地 JSON 导出（用户自己保存文件），不经网络。云备份按钮在代码里被隐藏（`src/ui/JourneyLogUI.js:406-408`）。

---

## 4. 产品与合规声明

| 检查项 | 结论 | 证据 |
|---|---|---|
| 非医疗 / wellness 声明用户可见 | **存在** | `?` 简介卡：`HINT_APP_PURPOSE_WELLNESS_TITLE/SUMMARY/BODY`（「不是医疗器械、不是心理治疗或诊断……」），en/ja/zh 三语存在；隐私页 `PRIVACY_SHEET_WELLNESS_NOTE` + 跳转链接。**截图未检**（本轮未起预览，按能耗规则不开 IDE 浏览器）。 |
| 非儿童产品声明 | **不存在**（9-09） | en/ja/zh locale 与根目录 `PRIVACY_NOTICE.md` 中未找到 child / minor / 年龄相关表述。按 Brief，**不建议**新增年龄闸；仅建议补一句声明。 |

---

## 5. V4 与备份恢复

**事实**：

- 本地导出/导入存在：「偏好设置 → 备份与恢复」，范围见 `PRIVACY_SHEET_EXPORT_IMPORT`；覆盖脚本 `audit:local-backup-coverage` 输出 31 个导出键 / 99 个重置键（第 0 轮 [`BACKUP_RESTORE_WALKTHROUGH.md`](../../facts/2026-11-06/BACKUP_RESTORE_WALKTHROUGH.md)）。
- T87-B（commit `ccaa28c2`，PR #1568 已合）把 `desktop/package.json:48-49` 的 `appId` 从 `com.twinsology.focus-tiger` 改为 `com.twinsology.samatia`、`productName` 从 `Focus Tiger` 改为 `Samatia`。commit 说明原文：「without migrating user data」。Electron 的 `userData`（含渲染进程 `localStorage`）随 `productName` 落在 `Application Support/<productName>`，因此改名后的首次启动会读到**空目录**。
- 本地模型目录刻意保留旧名 `Focus Tiger/companion-l0`（`desktop/companion/l0ModelDir.js:15`），说明团队已意识到路径变化，但只对模型做了处理。
- 「进度像空了是预期，用开刀前导出的备份恢复」只出现在 `docs/TEST_TRACKER.md`（T87-B 行）。locale 中无 rename / migrate / previous data 类提示（三语检索为空）。

**判定**：V4 **通过**（旧数据仍在旧目录；本地导入可恢复）。V4 特别项 **未满足**，登记 **P1**（9-01）。

---

## 6. V3 依赖、许可证与供应链

### 6.1 漏洞扫描结果

| 产物 | 范围 | critical | high | moderate | 来源 |
|---|---|---:|---:|---:|---|
| 网页练习壳 `focus-tiger/` | 全部 | 0 | 0 | 3（eslint/minimatch，开发依赖） | `facts/2026-11-06/npm-audit-focus-tiger.json` |
| 桌面 `focus-tiger/desktop/` | 全部 | 2 | 8 | 6 | [`evidence/npm-audit-desktop-all.json`](evidence/npm-audit-desktop-all.json) |
| 桌面 `focus-tiger/desktop/` | `--omit=dev` | 2 | 2 | 0 | [`evidence/npm-audit-desktop-omit-dev.json`](evidence/npm-audit-desktop-omit-dev.json) |
| Worker `focus-tiger/cloud/` | `--omit=dev` | 0 | 0 | 0 | [`evidence/npm-audit-cloud-omit-dev.json`](evidence/npm-audit-cloud-omit-dev.json) |

> 注：Electron 在 `desktop/package.json:44` 是 devDependency，但其运行时**随安装包分发**，`--omit=dev` 视图会漏掉它——必须看「全部」视图。

### 6.2 进入安装产物的高危项与可利用性

| 包（锁文件版本） | 级别 | 是否进安装包 | 合理威胁模型下可利用？ | 缓解 |
|---|---|---|---|---|
| `electron` 37.10.3（direct） | high（多条，含 macOS `moveToApplicationsFolder` AppleScript 注入、Service Worker 伪造 `executeJavaScript` 回包等；npm 给出的修复范围为 >42.11.15） | **是**（运行时） | **未找到路径**：代码不调用 `moveToApplicationsFolder`；渲染进程只加载 `focus-tiger://app` 本地打包内容，`contextIsolation/nodeIntegration:false/sandbox:true`（`desktop/main.js:565-567`），导航与新窗口被拦（`:583-600`）。`executeJavaScript` 仅在 L0 基准探针中使用（`desktop/companion/l0Main.js:27`）。 | 部分；**大版本过旧本身是 P1**（9-02） |
| `simple-git`（经 `node-llama-cpp` 3.20.0） | critical ×2 | 是（`asarUnpack: node_modules/node-llama-cpp/**`） | **未找到路径**：漏洞需攻击者控制 git 参数或环境变量；`node-llama-cpp` 仅在源码构建时调用 git，参数不受外部输入 | 9-12 |
| `js-yaml`（经 `electron-updater`） | high（CPU DoS） | 是 | 低：只解析更新 feed，且 feed 仅在设置环境变量时启用 | — |

**V3 判定**：**通过（暂定）**。理由：没有找到「外部输入可达 + 无缓解」的高危路径。该判定依赖当前「渲染进程不加载远程内容」这一架构前提，第 2 轮复核须重点核对（例如品味层下发文案是否进入 `innerHTML`——本轮未逐一核对，`src/ui` 有多处 `innerHTML =` 赋值）。

### 6.3 许可证

| 产物 | 分布 | 备注 |
|---|---|---|
| 网页（生产） | BSD-3-Clause 5、MIT 2、UNLICENSED 1 | UNLICENSED 为本项目自身 |
| 桌面（生产） | MIT 99、ISC 15、BlueOak-1.0.0 6、Python-2.0 1、(BSD-2/MIT/Apache-2.0) 1、UNLICENSED 1 | 未见 GPL/AGPL 类强传染许可证；模型权重许可证（Gemma / Qwen）**未检** → 法务确认项 |

### 6.4 锁文件与 CI

- 三个包均有 `package-lock.json`。
- `.github/workflows/dependency-audit.yml` 每周一跑 `npm audit --audit-level=high`，但 `working-directory: focus-tiger`——**只覆盖网页端**，不覆盖 `desktop/` 与 `cloud/`（9-02）。

---

## 7. 密钥扫描

| 范围 | 方法 | 结果 |
|---|---|---|
| 当前树 `origin/develop`（排除 `package-lock.json`） | `git grep -E`，11 类格式：Stripe live/test/restricted key、Stripe webhook secret、AWS access key、PEM 私钥头、GitHub 经典/细粒度 token、Resend key、Slack token、Google API key | **未发现** |
| 历史提交（`--all`，4074 个 commit，`0dde442c..ec0fc0c7`） | `git log -E -G`（同上 11 类） | **未发现** |
| 已跟踪的环境文件 | `git ls-files` | 仅 `focus-tiger/.env.example`、`focus-tiger/cloud/.env.example`；密钥类键均无值 |
| 配置中的非密钥标识 | `cloud/wrangler.jsonc` | 含 Stripe Price ID 与 KV 绑定（非密钥，属公开标识） |

第 0 轮的 `git log -G` 命中为文档性文字，非真实密钥（见 [`SECRET_SCAN_HEURISTIC.md`](../../facts/2026-11-06/SECRET_SCAN_HEURISTIC.md)）。本轮仍是**启发式**扫描，不能替代 gitleaks / trufflehog（9-08）。

---

## 8. STRIDE 威胁表

| 边界 | S 仿冒 | T 篡改 | R 抵赖 | I 信息泄露 | D 拒绝服务 | E 权限提升 |
|---|---|---|---|---|---|---|
| **本地应用（Electron）** | 外链仅放行 https / loopback（`ipcGuard.js:29-44`） | 自定义协议用 `safeResolveUnder` 防目录穿越（`main.js:203-228`）；**模型文件无完整性校验**（9-03） | 不适用 | `localStorage` 与导出文件为明文（已在文案中说明）；无 CSP（9-07） | 观察日志无上限（9-14） | 隔离 + 沙箱；IPC `cloud-post` 限 `/api/`；Electron 版本过旧（9-02） |
| **上传接口（Worker）** | OTP 6 位（`getRandomValues`）、10 分钟、单码 5 次、60 秒冷却、每邮箱每小时 5 次（`restoreOtp.ts:6-10, 38-43, 209-235`）；T54 无鉴权（随机 UUID 作 key，猜中不现实） | 输入白名单（T54 `pickT54ResearchReceiveFields`；备份 `parsePracticeBackupSnapshot` 拒绝多余键） | 无审计日志（基线轮不要求） | 日志只记 `purpose`/`detail`，不记邮箱与用户内容（`requestRestoreOtp.ts:118-129`） | 限流可绕过 + 单实例内存（9-04） | CORS 仅回显配置源（`cors.ts:12-27`）；仓库配置为本地源（9-11） |
| **支付订阅（Stripe）** | Webhook HMAC + 时间容差 + 常数时间比较（`cloud/src/lib/stripe.ts:670-710`） | 权益确认以 Stripe session 为准 | Stripe 侧留存 | 邮箱交由 Stripe | Webhook 300/分钟/IP | 已购 Lifetime 不再开结账（受保护路径，未改） |
| **AI 调用** | 不适用（本地推理） | 模型来自 HF / hf-mirror 可变引用（9-03） | 不适用 | 倾诉内容不出设备（静态）；**运行时未抓包** | 本地资源 | `node-llama-cpp` 子进程；源码构建路径（9-12） |

---

## 9. 法务确认项（独立成段）

以下仅陈述工程事实与对照缺口，法律结论须由法务给出：

1. **Quiet Together 默认开启**：打坐时发送随机会话 id（服务端可见 IP）。对照 GDPR 第 6 条合法性基础 / ePrivacy 终端访问规则：是否可依「正当利益」默认开启，还是需事先同意。
2. **启动时自动配置拉取**（9-05）：不含用户内容但暴露 IP、语言、本地日期。对照 GDPR 第 13 条透明度：隐私页存在**未披露缺口**。
3. **撤回后的删除**（9-06）：付费漏斗计数保留 90 天、T54 研究计数无期限且无删除路由。对照 GDPR 第 17 条删除权 / 第 7(3) 条撤回同意：**存在缺口**（随机 id 属假名化数据，是否仍属个人数据须法务判断）。
4. **子处理者清单**（9-10）：Cloudflare（Workers/KV/日志，`wrangler.jsonc` `observability.enabled:true`）、Stripe、Resend、Hugging Face 与 hf-mirror.com（模型下载）。对照 GDPR 第 28 条 / 第 13(1)(e) 条：隐私说明**未列出**。hf-mirror.com 为非官方第三方镜像，跨境传输须单独评估。
5. **用户权利**：访问/导出（本地导出，无缺口）；删除（本地重置无缺口；云端见第 3 条）；对 Stripe / 邮件订阅数据的访问与删除请求路径仅有邮箱 `hello@twinsology.com`（`PRIVACY_SHEET_RIGHTS`）。对照 CCPA「知情/删除」请求渠道：工程上**存在可用渠道**，流程未检。
6. **儿童**（9-09）：无非儿童声明。对照 COPPA / GDPR 第 8 条：是否需要声明由法务定；工程侧**不建议**新增年龄闸。
7. **支付与订阅**：欧盟消费者 14 天撤回权、数字内容即时履行的放弃确认、订阅取消路径（已有 `create-membership-portal-session`）。本轮未检文案。
8. **模型权重许可证**（Gemma、Qwen）与 Gemma 使用政策的再分发义务：未检。
9. **医疗声明**的措辞是否满足目标市场（美国 FDA 一般健康类产品指引、欧盟 MDR 边界）：工程侧已有声明，措辞充分性由法务定。

---

## 10. 未检清单与覆盖率

分母 = Brief §4 检查项 16 条。

| 状态 | 数量 | 项 |
|---|---:|---|
| 已检 | 9 | 非儿童声明、数据地图、V1（静态）、数据最小化与日志、V4（含特别项）、STRIDE、V3、密钥扫描、同意与请求对照（门闸部分） |
| 部分已检 | 6 | 非医疗声明（缺截图）、同意撤回与三语（缺语义比对）、用户权利（缺流程）、传输与存储（缺 Cloudflare KV 静态加密确认）、接口安全（未逐条核对全部 40+ 路由的鉴权）、第三方与支付（仅工程面） |
| 未检 | 1 | 语音 / 本地 AI 高危操作（确认、误触发、越权）——仅核对了麦克风用途说明与「点按说话」文案 |

覆盖率：已检 9/16 = 56%；含部分已检 15/16 = 94%。

| 未检子项 | 缺什么 / 下一步 |
|---|---|
| 运行时抓包 | 桌面打包版 + 代理（或 DevTools Network）走一遍：启动、打坐、开/关各开关 |
| 非医疗声明截图 | en + ja 两语 `?` 简介卡截图（标 OS/分辨率/主题/语言） |
| 三语语义一致性 | 交 B4b 或母语者 |
| Worker 全路由鉴权 | 逐条列 `cloud/src/routes/*` 的鉴权与越权测试 |
| 语音操作越权 | 核对 `yinVoiceCommandRunner` 等是否有执行前确认、误唤醒防护 |
| 品味层文案渲染方式 | 核对下发字符串是否只经 `textContent`（关系到 V3 暂定判定） |

---

## 11. 发现条目

### 9-01 桌面改名后数据目录变化，应用内无「用旧备份恢复」提示
- 级别：**P1**
- 类型：事实 + 建议
- 检状态：已检
- 修复成本：S
- 影响面：部分场景（已装旧名 Focus Tiger 版本、升级到 Samatia 的桌面用户）
- 描述：T87-B 修改 `appId` / `productName` 且明确不迁移用户数据；首次以 Samatia 启动时 `localStorage` 为空，界面看起来像进度清空。恢复说明只在仓库文档。
- 证据：
  - `focus-tiger/desktop/package.json:48-49`；commit `ccaa28c2` 说明「without migrating user data」
  - `focus-tiger/desktop/companion/l0ModelDir.js:15`（模型目录刻意保留旧名）
  - `focus-tiger/docs/TEST_TRACKER.md` T87-B 行（「进度像空了是预期，用开刀前导出的备份恢复」）
  - 三语 locale 检索 rename / migrate / previous data / earlier backup 均无结果
- 影响：用户以为数据丢失，信任受损；可能直接卸载。数据实际仍在 `Application Support/Focus Tiger/`。
- 建议整改：首次启动检测旧目录存在且新目录为空时，在应用内提示「从改名前的备份恢复」，或一次性自动迁移（需另立 Brief，属用户可见改动）。
- 建议负责人：桌面壳负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-02 Electron 37.10.3 落在官方修复范围外；桌面依赖不在 CI 审计内
- 级别：**P1**
- 类型：事实 + 推断
- 检状态：已检
- 修复成本：M（大版本升级需回归桌面壳）
- 影响面：全部桌面用户
- 描述：锁文件 Electron 为 37.10.3，npm audit 给出的多条高危修复版本在 42.x 之后；CI 依赖审计只扫网页端。
- 证据：
  - `focus-tiger/desktop/package.json:44`；`desktop/package-lock.json` `node_modules/electron` = 37.10.3
  - [`evidence/npm-audit-desktop-all.json`](evidence/npm-audit-desktop-all.json)：critical 2 / high 8 / moderate 6
  - `.github/workflows/dependency-audit.yml`：`working-directory: focus-tiger`
- 影响：Chromium 引擎漏洞会持续累积；当前架构（只加载本地内容）压住了可利用性，但任何引入远程内容的改动都会让风险直接变现。
- 建议整改：升级到受支持的 Electron 大版本；把 `desktop/`（不加 `--omit=dev`，因 Electron 为 devDependency）与 `cloud/` 加入 `dependency-audit.yml`。
- 建议负责人：桌面壳负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-03 本地模型下载无哈希校验、引用可变分支、含第三方镜像
- 级别：**P1**
- 类型：事实 + 推断
- 检状态：已检
- 修复成本：S
- 影响面：启用本地陪伴的桌面用户
- 描述：GGUF 模型从 `huggingface.co/.../resolve/main/...` 下载，失败回落 `hf-mirror.com`；下载器只做断点续传、大小与 ETag 对齐，不校验内容哈希。模型随后由原生 llama.cpp 解析。
- 证据：
  - `focus-tiger/desktop/companion/l0ModelProfiles.js:37-38, 53-54, 67-68`；`l0EmbeddingProfiles.js:33-34`
  - `focus-tiger/desktop/companion/l0Download.js:208-240`；`companion/` 非测试文件中无 `sha256` / `createHash` / `integrity`
- 影响：上游仓库换文件、镜像被篡改或被劫持时，用户机器会加载未知二进制到原生解析器（GGUF 解析器历史上出现过内存安全问题）。
- 建议整改：固定到具体 commit 版本而非 `main`；内置每个模型的 SHA-256 并在加载前校验；评估是否保留第三方镜像。
- 建议负责人：本地 AI 负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-04 限流 key 可被任意 Bearer 头绕过，且计数仅存于单实例内存
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：云接口（OTP 请求、邮件订阅、结账创建）
- 描述：`rateLimitKey` 只要请求带 `Authorization: Bearer <任意值>` 就以该值为 key，不校验真伪；每次换一个值即可绕过按 IP 的限流。计数存于 isolate 内存 `Map`，跨实例不共享（代码 TODO 已承认）。
- 证据：`focus-tiger/cloud/src/middleware/rateLimit.ts:5-6, 39, 42-61`
- 影响：可放大 OTP / 欢迎邮件发送量（Resend 成本、发信信誉）。**已有缓解**：每邮箱每小时 5 封、单码 5 次尝试（`cloud/src/lib/restoreOtp.ts:7, 10`），所以单个受害邮箱被轰炸与 OTP 暴力破解均受限——故定 P2 而非 P1。
- 建议整改：限流 key 一律用 IP（或在 IP 之外叠加已验证的 token）；计数迁到 KV / Durable Object 或使用 Cloudflare 原生 Rate Limiting。
- 建议负责人：Worker 负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-05 启动时自动发起的「品味层 / 成长度量」请求未在隐私页披露
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：全部联网用户
- 描述：每次启动自动 POST 7 个接口，携带语言与本地日期，服务端可见 IP。隐私页「默认存储」与「我们不做的事」只提到 Quiet Together，未提这些请求。
- 证据：`src/core/tasteLayerSync.js:91-99, 396-433`；`src/core/growthMetricsConfigSync.js:147-167`；`PRIVACY_SHEET_DEFAULT_STORAGE`、`PRIVACY_SHEET_NOT_DO`（en.json）
- 影响：不构成 V1（无用户内容），但与「离线可用、默认不上传」的整体叙述有落差，欧美用户抓包时易被视为「偷偷联网」。
- 建议整改：在隐私页补一句「启动时会下载当日文案配置，只发送语言和日期」。文案改动属用户可见，须走 Brief。
- 建议负责人：隐私文案负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-06 关闭研究 / 漏斗开关后，云端已收数据不删除
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：M
- 影响面：打开过对应开关的用户
- 描述：YPE 关闭会发删除请求；付费漏斗关闭只改本地状态，服务端按 90 天 TTL 自然过期；T54 研究数据无 TTL、Worker 无删除路由。
- 证据：`src/core/monetizationFunnelOptIn.js:139-161`；`cloud/src/routes/monetizationFunnelIngest.ts:144`；`cloud/src/routes/t54ResearchIngest.ts:51-62`；对照 `src/core/ypePersonalizationSync.js:242-252`
- 影响：撤回同意的用户期望数据被删；漏斗开关文案「You can turn this off anytime」未说明已传数据如何处理。T54 90 天实验仍处搁置，但分享开关已合入（#1434），开关一旦可达就会产生无删除路径的数据。
- 建议整改：为漏斗与 T54 增加带随机 id 的删除路由，关闭时调用；或在文案中写明保留期。
- 建议负责人：Worker + 隐私文案负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-07 渲染进程无 CSP（内容安全策略）
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：全部桌面用户
- 描述：`index.html` 无 CSP meta；`desktop/main.js` 无 `onHeadersReceived` 注入 CSP；自定义协议直接返回文件。
- 证据：`rg "Content-Security-Policy" index.html` 无结果；`desktop/main.js:203-228`
- 影响：若将来出现注入（例如远程文案进入 `innerHTML`），没有第二道防线。
- 建议整改：在自定义协议响应或 meta 中加 `default-src 'self'` 起步的 CSP，`connect-src` 放行云 API。
- 建议负责人：桌面壳负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-08 无专业密钥扫描器进 CI
- 级别：P2
- 类型：事实 + 建议
- 检状态：已检
- 修复成本：S
- 影响面：内部
- 描述：本机未装 gitleaks / trufflehog；CI 工作流中无密钥扫描。本轮 11 类格式的启发式扫描（当前树 + 4074 个历史提交）未发现。
- 证据：§7；`.github/workflows/` 目录列表
- 建议整改：PR 级接入 gitleaks（或 GitHub secret scanning push protection），报告只存脱敏摘要。
- 建议负责人：仓库维护者
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-09 无「非儿童产品」用户可见声明
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：全部用户
- 描述：三语 locale 与 `PRIVACY_NOTICE.md` 均无儿童 / 年龄表述。
- 证据：§4 检索
- 建议整改：在隐私页或简介卡补一句「本产品不面向儿童」。**不建议**新增年龄闸（[假设] 无证据表明儿童是目标用户；验证方法：看营销站与应用商店分级设置）。
- 建议负责人：隐私文案负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-10 隐私说明未列第三方服务 / 子处理者
- 级别：P2
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：全部用户
- 描述：`PRIVACY_NOTICE.md`（129 行）与隐私页未提及 Cloudflare、Stripe、Resend、Hugging Face / hf-mirror.com。
- 证据：`rg -i "cloudflare|stripe|resend|hugging|subprocess|third part" PRIVACY_NOTICE.md` 无结果
- 建议整改：列出子处理者与用途；见法务确认项第 4 条。
- 建议负责人：隐私文案负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-11 仓库内 Worker 配置为本地开发值
- 级别：P3
- 类型：事实 + 推断
- 检状态：部分已检（未核对线上实际变量）
- 修复成本：S
- 影响面：内部 / 部署
- 描述：`wrangler.jsonc` 的 `ALLOWED_ORIGIN` 与各结账回跳地址都是 `http://127.0.0.1:5173`。桌面端经主进程请求无 Origin，CORS 不影响；但若同一配置部署到生产，网页版跨域与回跳会走本地地址。[推断] 线上可能用 dashboard 变量覆盖，未核对。
- 证据：`focus-tiger/cloud/wrangler.jsonc:140-158`；`cloud/src/lib/cors.ts:12-27`
- 建议整改：拆分 `env.production` 配置段，生产值进 wrangler 环境而非 dashboard 手改。
- 建议负责人：Worker 负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-12 `node-llama-cpp` 默认可能触发源码构建
- 级别：P3
- 类型：推断
- 检状态：已检
- 修复成本：S
- 影响面：启用本地陪伴的桌面用户
- 描述：`getLlama()` 均以默认参数调用；预编译二进制不匹配时会尝试从源码构建（经 simple-git 拉代码），这是 simple-git 两条 critical 进入安装包的原因。参数不受外部控制，未找到可利用路径。
- 证据：`desktop/companion/l1Hold.js:72`、`l1EmbeddingHold.js:82`、`l0Probe.js:73`；[`evidence/npm-audit-desktop-omit-dev.json`](evidence/npm-audit-desktop-omit-dev.json)
- 建议整改：打包版传 `build: "never"`，失败时走明确的降级提示。
- 建议负责人：本地 AI 负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-13 第 0 轮事实底稿两处文件缺失 / 为空
- 级别：P3
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：内部
- 描述：`npm-audit-desktop.json` 为 0 字节；`crisis-related-unit-tests.log` 在 INDEX 中列出但不存在。
- 证据：`facts/2026-11-06/` 目录列表
- 建议整改：治理会话补齐或在 INDEX 中标注；B5 已在本目录 `evidence/` 补跑桌面审计。危机日志由 B6 处理。
- 建议负责人：治理会话
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-14 倾诉观察日志（jsonl）主进程不校验结构、不轮转
- 级别：P3
- 类型：事实
- 检状态：已检
- 修复成本：S
- 影响面：桌面用户（本地）
- 描述：渲染进程声明「无用户自由文本」，但主进程 IPC 接收任意对象直接追加到 `userData/companion-l2/` 下的 jsonl，无字段白名单与大小上限。
- 证据：`src/core/confide/confideObservationTelemetry.js:6-10`；`desktop/companion/confideObservationLog.js:19-30`；`desktop/main.js:730-735`
- 影响：目前无外泄路径；将来如有人往 record 塞入文本，会悄悄落盘。与 B6 交叉引用（日志是否含个人内容）。
- 建议整改：主进程按事件类型做字段白名单；按大小轮转。
- 建议负责人：桌面壳负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

### 9-15 休眠中的云备份为按邮箱明文存储
- 级别：P3
- 类型：事实
- 检状态：已检
- 修复成本：M
- 影响面：将来启用时全部备份用户（当前无人受影响）
- 描述：云备份前端被常量关闭，但 Worker 路由在线；快照以 `JSON.stringify` 存入 KV、key 由邮箱派生，无客户端加密。现有前端同意文案 `JOURNEY_LOG_BACKUP_PRIVACY` 未提加密，而 `PRIVACY_SHEET_CLOUD` 承诺上线前会「说明是否加密并征求同意」。
- 证据：`src/core/practiceBackup/practiceBackupCloudEnabled.js:6-11`；`cloud/src/lib/practiceBackupKv.ts:110-119`；`cloud/src/routes/putPracticeBackup.ts:45-67`（设备令牌 HMAC 校验，鉴权本身合理）
- 建议整改：启用前作为发布门禁：客户端加密或明确告知；同意文案补加密说明；考虑在开关关闭期间下线 Worker 写入路由。
- 建议负责人：备份负责人
- 关联任务账条目：待治理登记
- 复核状态：未复核

---

## 12. 已确认做得好的部分（供复核参考，不打分）

- 四条带用户数据的上传流全部在本地同意之后，且有单测覆盖门闸（`src/core/t54ResearchUpload.test.js`、`ypePersonalizationSync.test.js`、`monetizationFunnelOptIn.test.js`）。
- YPE 文案逐条说明「什么离开设备、什么留在设备、关闭后会怎样」，并实现关闭即删除。
- OTP 只存哈希、常数时间比较、冷却与每小时上限对外统一返回 `ok:true`（防枚举）。
- Stripe webhook 有签名校验与时间容差。
- Electron 窗口隔离 + 沙箱 + 导航拦截 + IPC 路径白名单；自定义协议防目录穿越。
- Worker 日志不含邮箱与用户内容。

---

## 13. 修订记录

| 日期 | 内容 | 会话 |
|---|---|---|
| 2026-11-07 | 初版（B5 基线轮，只读） | B5 独立会话 |
