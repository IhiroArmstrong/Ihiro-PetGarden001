# Task Brief · T81 研究共修上传接口（周聚合 + 白名单）

> **状态（2026-11-03）**：**待点头**。点头前 **不得写 `src/`**。S0 文档冻结已在 T80 修订 PR。  
> **代号**：**T81**。人话：设备上先把一周练了几次算成几个数字，用随机编号发给我们自己的接口；接口只收白名单，多出来的字段扔掉，并用测试锁住。  
> **槽位**：可选。状态 **排队中**。  
> **类**：实现时 **A 类倾向**（无新可见同意 UI）。若本刀误加开关/文案 → 升 **B**，停工改走 **T82**。  
> **从属**：方案包 [`drafts/co-practice-research-data-pack-v0.1.md`](../drafts/co-practice-research-data-pack-v0.1.md) schema v1。  
> **不是**：**T54** `/api/t54-research-ingest`。**不是** T54 90 天。**不是** T82 同意页。口令「开工 T54」不执行。

口令「按 T81 Brief 开工」= Brief 点头后 **新 Chat** + 独立 worktree `feature/t81-co-practice-research-upload`。

---

## 0. 大白话

现在产品里只有 Privacy 里一个「改进产品」的计时计数开关（T54），字段也不是这套周汇总。本刀只做：本机按周算数、新接口收白名单、能按随机编号删除。用户还看不到新开关；没有同意就零上送。

---

## 1. 已拍板（方案包 v0.1；PO 改口前勿再问）

1. 第 0 层永不收集；未知字段丢弃；类型越界整包拒收。  
2. 只上传周聚合，不上传原始事件流。  
3. studyId = 设备生成的 UUIDv4，不从账号/邮箱/指纹派生；DELETE 的凭据就是它。  
4. 与 T54 路径、存储、同意键全部独立。  
5. 第一版无第 2 层问卷、无差分隐私噪声。  
6. 未同意（T82 未上线前视为未同意）永不上送。本刀可先用 DEV / 实验室键写同意夹具，**不得**在正式 Privacy 或安装流程露出。

---

## 2. 冲突扫描

相邻：T54 上送、漏斗、YPE、练习备份、Confide 发送链、练习结束 overlay。

| 轴 | 判断 |
|---|---|
| a. 强度 | 无新可见仪式。后台 POST 须避开 Arrival / Honesty / Reflection |
| b. 语气 | 本刀无用户句子 |
| c. 职责 | 新 ingest。禁止改 Confide 回复。禁止改 T54 白名单凑字段 |

无用户路径变更（夹具仅 DEV）。若把同意开关做进本刀 = 职责冲突，禁止。

---

## 3. 范围（in）

1. 本机周聚合器：按方案包 §2.2 从现网练习完成记录、Confide 打开/发送计数、允许的 chipId、功能类 route、开关快照，在设备上算出一周一条。不读倾诉原文、Memory、情绪词。  
2. 序列化器：同意页将来展示的 JSON **必须**走同一函数。  
3. Worker（**冻结路径**）：`POST /api/co-practice-research-ingest`。白名单 + 范围校验。未知字段 drop+counter。越界 400 整包拒收。  
4. `DELETE /api/co-practice-research-ingest/:studyId`（**路径参数**，不用请求 body）：studyId 即凭据；线上删；测试锁「删后 GET 不到」。  
5. 存储与 Stripe / entitlement / 账号 KV **命名空间隔离**。不写 IP、不写 User-Agent 到研究库。  
6. 客户端：已同意且配置了 API 时，每周最多一次，随机延后 0–24h；payload 指纹相同则跳过写盘与 POST。  
7. CI 五项（002 S4，必过）：  
   (a) 载荷 schema 里每个字符串字段必须是枚举（见 `research-payload.v1.schema.json`）；  
   (b) 依赖图：上传模块不得引用 Confide 原文、Memory、情绪标签模块；  
   (c) 未同意时零请求 e2e（含预取/探测/心跳）；  
   (d) 撤回后零请求且本机 studyId 已清除 e2e；  
   (e) 同意页预览与实际上传 golden 对比（同一序列化器；golden：[`research-payload.v1.golden.json`](../research/research-payload.v1.golden.json)）。  
   故意注入自由文本字段时 CI 必须红。  
8. `SHARED_RESOURCES.md` 补研究键；`BACKGROUND_NETWORK.md` 三问写在本 Brief 第 8 节，实现 PR 再答实测。

chipId / route.class：**S0 已冻结**（方案包 §2.2 · [`DATA_DICTIONARY.md`](../research/DATA_DICTIONARY.md) · [`research-payload.v1.schema.json`](../research/research-payload.v1.schema.json)）。实现写成 `Object.freeze`，禁止再发明 `fallback` / `generate`。

切片（一 PR 一切片；模型以 Cursor 当前列表为准）：

| 切片 | 内容 | 模型 |
| --- | --- | --- |
| S1 | `buildWeeklyPayload` 无网络 | Composer 2.5 / Fast OFF |
| S3 | `POST /api/co-practice-research-ingest` · `DELETE /api/co-practice-research-ingest/:studyId` | Grok 4.6 / Medium / Fast OFF |
| S4 | CI 五项守门 | Grok 4.6 / Medium / Fast OFF |
| S5 | 周调度 0–24h | Composer 2.5 / Fast OFF |

顺序：S1 → S4(a)(b) → S3 → S4(c)(d)(e) → S5。S2 同意页走 **T82**。

## 4. 范围（out）

- 同意页、首次练习提示、问号、隐私政策正文（T82–T84）。  
- 改 T54 字段或把用户迁过去。  
- 寅币、广告、训练模型。  
- 受保护付款路径。  
- Confide 发送链 / 安全线。

---

## 5. 变体矩阵（A10）

本刀不新增练习种类、商品、对用户可见的多语言入口。实验室夹具可中英日 locale 字段，用户看不到。

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| 未同意 | 任何练习结束 | 零 POST | 单测 |
| 已同意 + 配置 API | 周边界后随机窗 | 一条白名单 JSON | 单测 |
| 未知字段 | POST 夹带 `transcript` | drop，不入库 | CI 必红若未过滤 |
| 越界 minutes | `minutes: 999999` | 整包 400 | 单测 |
| 重复周 | 同 studyId 同 week 两次 | 覆盖为一条 | 单测 |
| DELETE | 凭 studyId | 之后读不到 | 单测 |
| Electron / Web | 同一聚合器 | 行为同；platform 枚举不同 | 单测 |
| overlay 窗口 | Arrival/Honesty/Reflection 开着 | 不发；排到之后 | 单测调度 |

窄屏 / 付款：本刀无 UI。合规：无新可见多语言入口差异。

---

## 6. 点击反馈（A14）

本次无可点击交互改动，点击反馈节跳过。

## 7. 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 云 API 未配置 | 跳过 POST，不打扰画面 |
| POST 失败 | 静默重试；不卡动效 |
| 用户清成本机数据 | 研究 ID 与本机账本一并清 |
| T54 已同意、本项未同意 | 只走 T54 旧路径；本项零上送 |
| schemaVersion 未来值 | 整包丢弃 |

---

## 8. 后台网络三问（本刀会改非点击 POST）

1. **时机**：禁止与 Arrival / Honesty / Reflection 叠化、Idle 呼吸开始、精灵预加载重叠。排到 overlay 窗口之后；周上传再加 0–24h 抖动。  
2. **重复写盘**：payload 指纹相同则跳过本地 last-post 与 POST。  
3. **失败/慢**：失败不得打断正在播放的动效；低速网只允许后台失败，HUD 仍流畅。实现 PR 须按此实测，不能只测 HTTP 码。

## 9. 共用机制核对（COLLAB 七）

本刀**不**新开用户可见 overlay，**不**改 overlayBusy 消费者，**不**改 HUD 呼吸驱动，**不**改遮罩 dim。调度器只读现网 overlay 忙闲，忙则推迟 POST。无需改 `SHARED_RESOURCES.md` §4.1；须补 **localStorage 键**一行（研究 ID、周账本、last-post）。不碰 `#yin-support-modal`。

---

## 10. 验收

- [ ] 未知字段 fixture：accepted 不含该键。  
- [ ] 原文 / 情绪路由 / timestamp 键无法入库。  
- [ ] S4(a) 字符串字段皆为枚举。  
- [ ] S4(b) 上传模块不依赖 Confide 原文 / Memory / 情绪标签。  
- [ ] S4(c)(d) 未同意与撤回后零请求。  
- [ ] S4(e) 预览与实际上传同一序列化器。  
- [ ] 未同意零 POST（含实验室 query 不得绕过正式同意；DEV 夹具键须明显命名且默认关）。  
- [ ] DELETE 后读不到。  
- [ ] `npm run test:smoke` 绿。无新用户可见 e2e（无 UI）。  
- [ ] 文档：方案包 schema 与代码 freeze 数组一致。

## 11. 保护面（已好清单）

- T54 Privacy 开关与 `/api/t54-research-ingest` 行为不变。  
- Confide 发送与芯片填句不变。  
- 付款契约不变。
