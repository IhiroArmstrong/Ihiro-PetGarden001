# Task Brief · Electron 桌面端侧陪伴（窄范围生成例外）

> **状态（2026-08-20）**：政策已拍板（含 **仅宽屏 ⋯**）。L0 探针 **#336 已合**。**不开 L1**（须口令）。Stripe Pro Price 已记；**Checkout 未接**。Pro 含 Base + 本地智能体。Lifetime 用户要 AI → 另订 Pro（付推理；不必再买 Base）。  
> **定位权威**：`PRODUCT_POSITIONING.md`「禅意倾听者」（2026-08-10 检索不生成 **仍有效**；本文件只执行 2026-08-18 **窄例外**）。  
> **Web Confide**：`task-confide-to-yin-v1.md`（检索路径不变；禁止把本例外做进 `src/`）。  
> **壳**：`task-electron-desktop-scaffold.md`（步骤 A/B **不含**本功能；不得绑进托盘验收）。

---

## 拍板（硬 · 2026-08-18）

**批复措辞（须原样遵守，禁止改写成「全面允许生成」）**：

> **仅限桌面端受约束生成、其余场景仍然检索不生成。**

| 0.4 问 | 批复 |
|---|---|
| 是否修订「禅意倾听者」 | **窄例外，不是废止。** Web / PWA / 已审仪式文案仍检索不生成。 |
| 入口 | 与 Confide **合并成一个** Idle 菜单项。禁止「倾诉」和「AI 阿寅」并排。**端侧生成只出现在宽屏 ⋯**（`≥480px`）。窄屏抽屉 **不出现**该能力。 |
| 触发 | **仅用户主动、仅 Idle。** 不主动开口。 |
| 视口 | **仅宽屏。** 手机 / PWA / Capacitor / Electron 窄窗（抽屉壳）都不跑本地智能体。 |

用户需求可以开这个口子；**不能**拿本次批准扩大到别的场景。

---

## 冲突扫描（已拍板）

对照 `SCENARIO_TESTS.md`。人设 / 职责曾与 2026-08-10 红线冲突；强度上聊天面板重于 Whisper / Recover。拍板后的边界：

| 相邻 | 三轴 | 拍板后 |
|---|---|---|
| Confide | 职责 | **同一入口**；桌面多一层最后兜底生成 |
| Y Whisper / X Recover / B Re-focus / P 提醒 / Arrival / Reflection | 语气 + 强度 | **不得**生成；继续已审文案 |
| X / X2 轻触阿寅 | 职责 | **不**改成聊天 |
| AA / AB | 职责 | 不是托盘、不是 PiP；不挡步骤 B |

正面案例格式见 `FEATURE_CONFLICT_REVIEW.md`「检索不生成 vs 桌面陪伴」。

---

## 技术（已认可 · 不再开选型会）

| 项 | 口径 |
|---|---|
| 运行时 | **node-llama-cpp**，仅 Electron **主进程**（或 utility / 子进程）。禁止渲染进程。 |
| 模型文件 | **不进 DMG**；首次打开入口时下载到 userData |
| 默认型号 | L0 实测后再锁。候选起点 Qwen3-0.6B Q4；不在 L0 前争论 0.6B vs 1.7B |
| Focusing | **卸载模型**，释放统一内存 |
| 隔离 | 代码只放 `focus-tiger/desktop/`（如 `companion/`）。Web / PWA **不** feature-detect。无 `window.desktopShell.companion` **或当前为窄屏壳（≤479）** 则 **不注册** 生成能力（窄屏 Confide 检索仍走 Web v1，不进 llama） |
| 体积 | 原生库增量约 30–50 MB（arm64）；模型另下 ~0.5 GB 量级 |

tok/s 文献数不是本机实测。L0 不过关 → 停，改模型或放弃入口。

---

## 路由（实现时锁死）

```text
0 安全 safety_redirect（固定转介句；模型不调用）
  → 1 产品仪式（Arrival / Whisper / Recover / Re-focus / 提醒 / Reflection……已审 i18n）
  → 2 Confide 语料桶（anxious / tired / stuck / sad / scattered）
  → 3 仅 Electron **且宽屏**：自由倾诉短生成
```

第 3 层约束：短句；承接不建议；不诊断；不呼吸指令；不教练清单；超长截断。生成失败 → 走 Confide `fallback` 语料，不空白、不重试死循环。

文字优先；**不含**语音。

---

## 体验（未实现时先锁契约）

- 点菜单：0–100ms 接收反馈 + 面板淡入（对齐 Journey Log / Confide 玻璃卡，**不要** Whisper 气泡）。
- 未下载 / 加载中：面板内可见进度或铺垫句；禁止哑点击。
- 低配（内存不足或探测失败）：**不提供该能力**（宽屏 ⋯ 不出现生成行）；不在 Web / 窄屏做降级。
- 窄屏壳（≤479 / 375 抽屉）：**没有**本地智能体。已在宽屏打开生成面板后拖窄 → **关掉生成层**，不把对话塞进抽屉。
- 危机命中：只用 Confide 安全文案。

---

## 工作量分级（实现顺序）

| 级 | 做什么 | 停点 |
|---|---|---|
| **L0** | 主进程加载小模型；记 M1 8GB / M2 16GB 的 RSS、TTFT、tok/s、Focusing 是否掉帧 | 失败则不上入口 |
| **L1** | desktop-only 面板 + 下载进度 + IPC；Focusing 卸载 | 无阿寅人设调优也可 |
| **L2** | 四层路由 + 人设约束；**内部多轮对话**，把跑偏案例攒下来调 prompt | **禁止**一过 L0/L1 就给真实用户 |
| **L3** | 崩溃隔离、门槛、许可声明；考虑随收费 DMG | 不早于步骤 B；不早于定位口径已合入 |

口令「开工桌面陪伴 L0」已下达；本切片只交 **L0 探针**，仍 **不等于** 产品入口。

### L0 怎么跑（本机 Mac）

```text
npm --prefix desktop install
npm run desktop:companion-l0
```

- 首次会下载约 0.5 GB GGUF 到 `~/Library/Application Support/Focus Tiger/companion-l0/`（**不进 git、不进 DMG**）。
- 报告 JSON 写到同一目录 `report-*.json`，并打印 `verdict`。
- **不上** Idle ⋯ / 抽屉入口；`preload` 仍只有既有壳 IPC。
- 跳过窗口（只测加载，不采 rAF）：`FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`
- 勿与口令「开工同坐点 L0」混在同一句话里。

L0 数字出来之前 **不锁型号、不排 L1 面板**。

### 分析师跟进（2026-08-18 · 硬）+ 豁免（2026-08-19）

M5 16GB 过闸 **≠** 「大多数用户机型可行」。真正的瓶颈机型是 **8GB 统一内存 / 8GB Windows 本**。

- **Focusing 掉帧（M5 · 2026-08-18 用户肉眼）**：双终端下 **无可见影响 / 无卡顿**。
- **M1 8GB**：仍未测。**2026-08-19 用户书面豁免**这条探针数据（公开资料 + M5 RSS≈882 MB：0.6B Q4 数字门槛大概率过；Focusing 整机压力仍是假设）。豁免 **只**让探针进 `develop`，**不**等于允许开 L1。
- 在 L1 之前：
  - **禁止**锁死 Qwen3-0.6B
  - **禁止**开 L1 / 人设 / 选型会
  - **低配默认不出入口**（Mac 与 Windows 同样：检测到总内存 ≤8.5 GiB 则不注册生成行）

`Idle rAF p95 Δ` 只是探针自己对主循环的干扰，**不能**代替肉眼看 Sit→Focusing 呼吸是否顿挫。`desktop:companion-l0` **会跑完即退**，不能单独完成这项人工测。

**Focusing 掉帧（本机、几分钟）** — 两个终端：

1. 产品窗（**不要**带 `FT_COMPANION_L0`）：`npm run desktop:dev` → Sit → Focusing，看阿寅呼吸。
2. 另开终端、Focusing 已开始后：`FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`（子进程加载 ≈0.9 GB 再卸载，**本命令不开窗**）。盯的是终端 1 那个产品窗：加载中 / **dispose 那几百毫秒** 呼吸有没有可见顿挫。

### 低配购买 vs Focus Tiger Pro（2026-08-19–20）

- **Windows 与 Mac 同样适用** 8GB 门槛（Windows 8GB 往往更紧：无 Metal，llama.cpp 常走 CPU）。
- 现货 Support 三卡（Tea **US$4.99** / Yin Membership = Stripe **Focus Tiger Base US$6.99/月** / Sanctuary Lifetime **US$89.99**）**现在仍不是**本地智能体入口。低配用户仍可买这三张——买的是 B 轨，**不会**因此打开被隐藏的本地模型入口。
- **仍禁止（假收费 / 低配覆盖）**：
  - L1 入口未开时卖「带本地智能体」并让人以为现在就能聊；
  - 让低配「知情后冒险购买、不能退款」来覆盖隐藏入口；
  - 买了 Pro 仍强行打开被隐藏入口。
- **Stripe（2026-08-20 用户书面）**：Dashboard 已有
  - **Focus Tiger Base** · US$6.99/月（现货 Membership Checkout 继续走 `STRIPE_MEMBERSHIP_PRICE_ID`；应用内文案仍可写 Yin Membership，改 UI 另开）；
  - **Focus Tiger Pro** · US$12.99/月 · Price ID **`price_1U6EB1FuIhgJPGLiuciuX1to`**（**已记入 `ENV_CONFIG` / `cloud/.env.example`；未进 Checkout 路由、未进 wrangler `vars`、未改三卡**）。
- **已拍板 · 档位关系（纠正 08-19 晚「互不含」）**：Pro **包含** Base 那套 B 轨（仪式 / 深库 / 节日主题 / 尊贵章）**加上**桌面本地智能体。Base / Membership **不含**本地智能体。Sanctuary Lifetime 仍只覆盖 B 轨、**不含**本地智能体（推理是持续成本）。禁止再让用户付 $12.99 还不含 $6.99 已买得的进阶内容。
- **Lifetime 用户若还要本地智能体（2026-08-20）**：B 轨已经买断，**不必再买 Base**。L1 入口开放后，再订 **Focus Tiger Pro US$12.99/月**——付的是持续推理成本；B 轨继续由 Lifetime 覆盖（`lifetime ∪ Pro`）。**不要**另开「Lifetime 专属更便宜 AI 加购」除非书面改价。**不要**让 Lifetime 免费送本地智能体。
- **谁能买 vs 谁能用（纠正「只有 Electron 才能见第四卡」）**：
  - **L0 / 本地模型测试本来就是 Electron 前提**：`npm run desktop:dev`、`desktop:companion-l0`。Safari `?product=1` **从未**加载 llama；那是 Web 产品壳（付费、Idle、内存说明不应出现）。
  - **L1 之后买 Pro**：Checkout 可以走 **Web / Safari**（与现货 Membership 同一套支付云），方便你继续用 Safari 测付款。
  - **L1 之后用本地智能体**：仍只 **Electron + 宽屏 + 非低配**。Web / 窄屏 / ≤8GB **没有生成入口**。低配若已购 Pro：B 轨照常可用，入口仍隐藏。
  - **现在**：Support **仍只三卡**；不接 Pro Checkout。
- 说明文案（英文默认）仍落在 Electron **安装 README**、点 **?** 的简介卡、以及 **Support Yin** 模态底部；Web / 手机 Safari **不出现**该内存块。

### 为什么必须 Electron（Web / Safari 没有本地 AI）

这是 2026-08-18 已拍板的窄例外，不是漏做：

- 模型跑在 **Electron 主进程** 的 `node-llama-cpp`（Metal / 本机 CPU），约 0.5 GB GGUF 下到 userData。Safari / 普通浏览器 **没有**这条原生库，也不能把主进程 llama 塞进 Web。
- 已禁止：WebLLM 进渲染进程、Ollama 当默认、PWA / 手机 / 窄屏抽屉跑本地智能体。
- 所以：**不带 Electron 壳 = 用户无法使用本地 AI。** Safari 测过的是 Web 产品（练习、Support、付款），不是 llama。

### 怎么测本地 AI（相对固定 QA 树 5173）

固定 QA 树 + Safari `http://127.0.0.1:5173/?product=1` **继续**测 Web / 关单故事。**不能**用 Safari 打开 5173 来测本地 AI。

测本地 AI 时，5173 仍可能被 **Electron 当渲染页**用，但你看的必须是 **Electron 窗口**：

1. **不要**同时让另一棵树占 5173（`desktop:dev` 会自己再起 Vite 等 5173）。若 QA Safari 正在测，先停那次 `dev:qa`，或等本轮 Web 测完。
2. 关单级 develop tip（本机 QA 树）：

```text
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm --prefix desktop install
npm run desktop:dev
```

3. 在弹出的 **Focus Tiger 桌面窗**里测 Idle / ? / Support 内存说明 / 将来的宽屏入口。**不要**用 Safari 连同一 5173 当「已经在测本地 AI」。
4. **L0 探针**（仍无产品入口；跑完即退）：

```text
cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger
npm --prefix desktop install
npm run desktop:companion-l0
```

跳过探针窗：`FT_COMPANION_L0_SKIP_WINDOW=1 npm run desktop:companion-l0`。Focusing hitch 仍用双终端（见上）。

测完停掉 Electron（`desktop:dev` 会一并停它拉起的 Vite）。再测 Web 关单时重新 `npm run dev:qa`。

### 开 L1 入口要什么（尚未安排）

L1 = 桌面宽屏面板 + 下载进度 + 主进程 IPC + Focusing 卸载。**仍不是**给真实用户的多轮人设（那是 L2）。

**条件（同时满足才开工 L1 代码）**：

1. 你当回合口令 **「开工桌面陪伴 L1」**（没有口令 = 不排、不写面板）。
2. L0 探针已在 `develop`（#336；M5 数字 + hitch 肉眼；8GB 书面豁免）。
3. **仍不锁** 0.6B；**仍不上** 真实用户生成；Pro Checkout 要等入口真能打开，否则假收费。
4. L2（四层路由 + 内部多轮攒跑偏）**禁止** L0/L1 一过就给真实用户。

**下一步（已写在 `PROCESS` 开工前优先级）**：挥手点播接线，**不是** L1。本回合不安排 L1。

---

## 明确不做

- 全面推翻「检索不生成」
- Web / PWA / `src/` 主线接入模型
- 主动开口、点阿寅聊天、用 Whisper/toast 做多轮
- 默认依赖 Ollama；WebLLM 进渲染进程
- 语音；把本功能绑进 Electron 步骤 A/B 验收
- 在窄屏抽屉 / 手机浏览器上跑或露出本地智能体（含「对等降级成 WebLLM」）
- 改 `SCENARIO_TESTS.md`（正式场景等 L2 后再议附录）

---

## 已好清单（实现时守住）

- `?product=1` 与 Safari / 窄屏路径零模型、零生成入口
- 宽屏 ⋯ 才允许注册端侧生成；窄屏抽屉即使在 Electron 里也没有该能力
- Confide v1 分类 / 安全阀 / 语料行为不因桌面例外而变
- 场景 B / X / Y / P 文案不被模型改写
- 收费 DMG 托盘（步骤 B）仍按脚手架 Brief

## 进度

- [x] L0 探针代码（download / load / generate / unload / Idle rAF 代理）；**产品入口仍不上**
- [x] L0 本机数字（**Apple M5 16GB · Metal**）：load ≈ 0.8s，TTFT ≈ 0.65s，≈ 116 tok/s，RSS 加载峰值 ≈ 0.9 GB，卸载后回落；Idle rAF p95 增量 ≈ 0.1ms。型号 **未锁**（只测了这一台）
- [x] L0 Focusing 掉帧（双终端：产品窗 Sit→Focusing + skip-window 探针卸载）— **2026-08-18 用户肉眼（M5）**：对 Focusing 的 Yin **无任何可见影响 / 无卡顿**
- [ ] L0 **M1 8GB** 同一探针（选型分水岭；未测。**不必现在找旧电脑**；缺数则低配默认不出入口、不锁 0.6B）
- [ ] L1 desktop-only **宽屏**面板 + 下载 UX + IPC — **8GB 未测不开**；窄屏不接线
- [ ] L2 四层路由 + 人设；内部多轮攒跑偏案例
- [ ] L3 崩溃隔离 / 门槛 / 许可；不早于步骤 B
