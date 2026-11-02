# 受限生成 · 阶段 0 结论页（warm/cold · 内存双基线 · 模型冻结）

> **状态**：**§4.1.1 已圈选（2026-11-01）** → **(A) 先评估预生成池**（评估稿已合 [#1531](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1531)）。**2026-11-02**：对比已点头走 **R**（#1533）。下一刀是 [扩库说明书](task-constrained-generation-expanded-retrieval-spec.md)，**不是** 路径 A 的 B 类实现 Brief。关卡 Brief 已条件点头并合入 develop（[PR #1492](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1492)）。阶段 0 脚手架已合（[PR #1529](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1529)）。对比：[池化 vs 扩库 vs 缩范围](task-constrained-generation-pool-vs-expanded-retrieval.md)。**禁止**阶段 1 红队（本圈选 **不是** 阶段 1 许可；选 R **也不是** 生成臂许可）。  
> **本刀**：文档 + 实验室脚手架。**零用户可见生成句**。不接线口通道。  
> **父 Brief**：[受限生成放行关卡](task-constrained-generation-release-gates.md)。  
> **类**：**A 类**。  
> **不是**：**T54** 90 天实验。**不是** 倾诉开放生成。**不是** 预生成池实现（路径 A 评估 ≠ 实现 Brief）。**不是** 阶段 1。

---

## 0. 大白话

关卡已经写死。模型冻结、热/冷判定、内存怎么量都已写清。实验室加载探针已跑：中位约三秒、九十五分位约三点八秒，还没开始编句。屏幕上的陪伴句仍然是仓库里的固定句。PO 已圈选「先评估预生成池」，评估稿已合；四通道各十次手测按分析师建议用代码路径代替，不当成放行当拍生成的证据。**下一步是扩库说明书，不是写本机池实现 Brief。阶段 1 继续禁止。**

---

## 1. 冲突扫描

对照场景 B（离开后再聚焦）、Y（结束低语）、觉照邀请、到达后安静句、倾诉、研究分享开关、陪伴契约。

| 轴 | 结论 |
|---|---|
| **强度** | 本刀无新点击、无新开口。 |
| **语气** | 不改文案。 |
| **职责** | 不替代安全线，不替代研究实验，不加第五条通道。 |

**无用户路径**（纯文档 + 默认关实验室脚本 + 未接线的 `modelWarm` 判定函数）。无未决冲突。

---

## 2. 模型冻结表（§10 · 抄自当时 `origin/develop`）

**抄表时刻**：2026-11-01 · `origin/develop` **`4688937d`**。换模 / 换量化 / 换解码 → **阶段 1 作废**。禁止把本表示例当以后的生产真相；合 develop 后默认键若变，须重抄。

| 字段 | 值 | 源 |
|---|---|---|
| `L0_DEFAULT_MODEL_KEY` | `gemma4-e4b` | [`l0ModelProfiles.js`](../../desktop/companion/l0ModelProfiles.js) |
| `modelId` | `Gemma-4-E4B-it-UD-Q4_K_XL` | 同上 `L0_MODEL_PROFILES['gemma4-e4b']` |
| GGUF `filename` | `Gemma-4-E4B-it-UD-Q4_K_XL-unsloth.gguf` | 同上 |
| `expectedBytes` | `4215695776` | 同上 |
| `minBytes` | `4000000000` | 同上 |
| `promptFamily` | `gemma` | 同上 |
| 回退键 | `gemma4-e4b-jc` · `qwen3-1.7b` | 同上；**本关卡评测不用回退键** |
| `L0_MAX_TOKENS` | `48` | [`l0Config.js`](../../desktop/companion/l0Config.js) |
| `L1_ENSURE_READY_TIMEOUT_MS` | `30000` | 同上 |
| `L2_MAX_TOKENS` | `48` | [`l2Persona.js`](../../desktop/companion/l2Persona.js) |
| `L2_GENERATE_TIMEOUT_MS` | `20000` | 同上 |
| 生产缓存目录（Darwin） | `~/Library/Application Support/Focus Tiger/companion-l0/` | [`l0ModelDir.js`](../../desktop/companion/l0ModelDir.js)；**不要**当实验室 dest 去改文件 |
| Web 浏览器 GGUF | **仍不立项** | 父 Brief §10 |

解码温度：现网 `node-llama-cpp` 会话未在 `l0Config` 另锁温度数字；阶段 1 须与当时 `openFreshChatSession` / `LlamaChatSession` 默认一致。**禁止**为本关卡另调温度。

---

## 3. `modelWarm` 判定口径（日志与阶段 1 共用）

| 项 | 口径 |
|---|---|
| 读口 | 桌面 companion 状态快照：`phase === 'ready'` 且 `focusing !== true` |
| 实现 | [`constrainedGenModelWarm.js`](../../src/core/constrainedGenModelWarm.js)（**未接线**任何开口） |
| 热 | `isConstrainedGenModelWarm(status) === true` |
| 冷 | 其余（`idle` / `loading` / `unloading` / `error` / 缺快照 / **正在专注**） |
| 冷回退 | `fallbackReason=cold-start`（**不得**记成 `timeout`） |
| 热超时 | 仅 `modelWarm=true` 且超过父 Brief §5.4.2 通道上限 → `timeout` |
| Focusing | `l1Runtime.setFocusing(true)` **立即 unload**（无 60s 宽限） |
| 闲置 unload | 关倾诉或壳隐藏后 **`COMPANION_UNLOAD_GRACE_MS = 60000`** 才 unload |

---

## 4. 交付物 A · warm/cold 表

### 4.1 代码路径预测（**不是**实测，禁止当放行依据）

| 通道 | 触发相对专注 | 预测 cold | 依据 |
|---|---|---|---|
| 专注中邀请 | **正在** `FOCUSING` | **高（近 100%）** | `main.js` 在 `FOCUSING` 调 `setFocusing(true)` → 立即 unload |
| 结束低语 | 专注**刚结束** | **高** | 会话中模型已被卸；结束开口时通常仍 cold |
| 离开后再聚焦 | 多在专注中或刚离开 | **高** | 同上 |
| 到达后安静句 | 到达后、专注前 | **中** | 若 60s 宽限内模型仍 resident 则可能 warm；冷启动 App 则为 cold |

与 §5.4.2 关系：冷通道的 p95 time-to-warm 只要 **> 该通道上限**（2500 / 3000 / 5000 ms），即标「当拍生成不可行（预见）」。实验室 load 往往是秒级，**预见会击穿**结束低语与到达句的 2.5–3s 线。

### 4.2 须填的实测表（各通道 ≥10 次 · Electron 宽屏 · 本表锁定 quant）

| 通道 | 触发时 `modelWarm` 读口 | cold 占比 | cold time-to-warm p50 / p95 (ms) | 与 §5.4.2 |
|---|---|---|---|---|
| 结束低语 | 上节口径 | 代码路径：**高冷**（非 40 次手测） | 加载探针 p50/p95 **3029 / 3848**（全通道共用下限） | 当拍不可行（预见） |
| 专注中邀请 | 上节口径 | 代码路径：**近 100% 冷** | 同上；且 focusing 禁止 generate | 当拍不可行（预见） |
| 离开后再聚焦 | 上节口径 | 代码路径：**高冷** | 同上 | 当拍不可行（预见） |
| 到达后安静句 | 上节口径 | 代码路径：**中**（专注前；或热或冷） | 同上；热时仍贴 3000ms 上限 | 当拍不可行（预见） |

**2026-11-01**：PO / 分析师书面 **跳过** 四通道各 10 次 Electron 手测。上表 **cold 占比** 来自代码路径（见 [预生成池评估 §3](task-constrained-generation-pregen-pool-eval.md)），**不是** 开口瞬间抽样比例。Node 探针只代替「加载要多久」，仍不能代替真实开口墙钟。圈选 (A) 后，阶段 2 也不再拿本表当拍延迟放行。

### 4.3 实验室 time-to-warm 探针（可代替「加载要多久」，**不能**代替 4.2）

系统 **终端.app**（Metal）：

```bash
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && npm run companion:constrained-gen-warm-cold
```

`FT_WARM_COLD_LOADS` 缺省 10（1–20）。结果：`/tmp/ft-l0-lab/constrained-gen-warm-cold-<epoch>.json`。只记 ms 与 RSS，**不记原文**。缺 GGUF 时 exit 2。

**已跑（2026-11-01 · 系统终端 · QA 树 Metal）**：`p50=3029ms` · `p95=3848ms` · `rssDeltaP50=2534.3MB` · `n=10`。JSON：`/tmp/ft-l0-lab/constrained-gen-warm-cold-1793546275951.json`（**不**提交 git）。局限见 [预生成池评估 §2.2](task-constrained-generation-pregen-pool-eval.md)：缓存偏乐观、只含加载。

---

## 5. 交付物 B · 内存双基线（一页说明）

| 基线 | 量什么 | 通过线 |
|---|---|---|
| **A · 冷机（模型未加载）** | 30 分钟计时专注：从 **未加载 GGUF** 到会话结束的 **RSS 峰值总增量** | **无** ≤200MB 线；必须报告 |
| **B · 已 resident** | 同机同会话，模型已加载且 resident：生成试点相对「仅检索、同 resident」的 **RSS 峰值增量** | **唯一通过线：≤ 200MB**（父 Brief §5.4.3） |

**为何只锁 B**：产品已决定承担 companion 常驻成本时，试点只问「再多一次短生成」贵不贵，不用 200MB 假装覆盖整包权重（E4B Q4 约 **4.2GB** 文件）。

**建议量法（阶段 2 前锁定，本回合不跑 30 分钟）：**

1. 机型：Apple Silicon · 参考 **16GB** · Electron 宽屏。  
2. 工具：`ps -o rss=` 对 Electron 主进程 + companion Node child（或 Instruments）。报告须写工具名。  
3. A：启动前确认 `phase !== 'ready'`，Sit 30 分钟，取 RSS 峰值 − 启动后未 load 的基线。  
4. B：先 `ensureReady` 等到 ready，再跑「仅检索」对照与「一次短 generate」对照，只比峰值差。  
5. 实验室 Node 探针的 `rssDeltaMb` **只作数量级**，**不是** B 线证据（进程模型不同）。

**本回合：口径已锁；A/B 数字未测。**

---

## 6. 一键关停 / 日志 / 披露（规格锁定，不画 UI）

沿用父 Brief §8–§9、§11。阶段 0 不实现开关。

**工程 kill switch（实现时）**：`FT_CONSTRAINED_GEN=off` 或 `?constrainedGen=0`；生产默认关。

**披露草稿（律师未签 · 不得进商店页）**：

> 试点时，个别短句可能由本机模型改写措辞；编不好就仍用原来的固定句。本机不保存你说的话或模型原文。随时可在隐私设置关掉。这不是心理治疗，也不是疗效证明。

对外句须律师看过 + locale 切片 + 契约扫描后才能进 App。本页作者不是律师。

---

## 7. PO 书面认可时的分支（三选一 · **已圈选**）

| 分支 | 何时选 | 对阶段 1 / 2 |
|---|---|---|
| **继续 · warm 实验室** | 四通道 cold 占比低，或可预 warm 且与用户路径等价 | **未选**（与专注立即卸载冲突） |
| **(B) 缩 scope** | 多数通道 cold 且当拍不可行 | **备选退路**（池评估失败时只留到达句） |
| **(A) 预生成池** | 多数 cold 但仍要变体 | **2026-11-01 已圈选：先评估**（#1531 已合）。**2026-11-02**：对比已点头走 **R**；路径 A 实现 Brief **冻结**（骨架暂存，见对比说明 §4.2）。也 **不得** 开始阶段 1 |

圈选依据：加载探针 p50/p95 已击穿多数通道预算 + 代码路径三通道近乎全冷。**圈选评估 ≠ 阶段 1 开工。选 R ≠ 可以写路径 A 实现 Brief。**

---

## 8. 验收（本阶段 0 PR）

- 冻结表有 `origin/develop` 短 SHA。  
- `modelWarm` 口径 + 单测；cold → `cold-start`。  
- 交付物 A 表头在；数字诚实标未测。  
- 交付物 B 双基线说明在；未假装已过 200MB。  
- 实验室探针默认关、无原文。  
- `git diff` **无** locale / 开口触发 / 付款路径。  
- 不改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。  
- TRACKER：本条验收的是阶段 0 准备页，**不代表**生成已上线。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 后台网络

不涉及后台网络。探针只读本地 GGUF，不下载（缺文件 exit 2）。
