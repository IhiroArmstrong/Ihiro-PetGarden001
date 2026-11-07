# Task Brief · 深链 + Shortcuts 食谱

> **状态（2026-11-07）**：**待 PO 点头** · 纯文档 · **无运行时**。  
> **人话**：让外部一键打开 App 并开始一场白名单练习；练习结束后可选「记入健康」——只走用户自己装的快捷指令，不读健康数据、不做 iOS 原生壳。  
> **类**：实现时为 **B 类**（会改启动路径、结束画面按钮、设置开关）。本 PR 只锁 Brief。  
> **槽位建议**：可选 · 点头后才「立即做」。**本 PR 不改** [`GLOSSARY.md`](../GLOSSARY.md) / [`SCHEDULING_GLOSSARY.md`](../SCHEDULING_GLOSSARY.md)（热点文件）。建议治理会话另登 T 号（勿抢并行审计可能占用的 T89）。  
> **git 依据（开工前再核）**：`origin/develop` 上 **没有** 深链开坐 / Shortcuts Health 回写的 OPEN 或 MERGED 实现 PR（2026-11-07 `gh pr list` 检索为空）。  
> **不是**：**T49** 换原生壳。**不是** HealthKit / Capacitor。**不是** 读睡眠/HRV。**不是** Ritual Recipe 阶段 1 的 **B1**（官方 `templateId` 开坐，见 [`task-ritual-recipe-phase1.md`](./task-ritual-recipe-phase1.md)）。**不是** T44 全局快捷键扩面。**不是** 账号 / OAuth / 云。**不是** `.ics` 导出（见姊妹 Brief [`task-ics-reminder-export.md`](./task-ics-reminder-export.md)，依赖本 Brief 的 URL 字段）。

**口令（点头后）**：`按深链 Shortcuts Brief 开工解析层`（先 A 刀单测，禁止一 PR 做完 Web+Electron+Health 按钮）。

---

## 0. 大白话

现在 App 只能人进来再点开始。这一份书是把「从日历、快捷指令、桌面协议直接开始一场短练习」写成规则：只许几种练习、几种分钟数；忙着倾诉或付款时不许硬开；健康分钟只在你点了按钮之后、用你自己装的快捷指令去写。这份书本身不改 App。点头之后才能写代码。

---

## 1. 拍板已经锁死（本 Brief 不得推翻）

| 项 | 口径 |
|---|---|
| iOS 原生壳 | **暂不进路线图**（与 **T49** 不换网页壳一致） |
| Apple Health | **只写、不读**；只走 Shortcuts 回写 Mindful Minutes；不做 HealthKit |
| 账号 / OAuth / 云 | **不做** |
| 本功能定位 | Never-Cloud / 本地动作路由。防剽窃层 **不算**（过不了准入：不是云上秘密表） |

---

## 2. 地面真相（对照仓库，勿凭记忆改口）

| 项 | 事实 |
|---|---|
| Web 查询风格 | 产品壳已用 `?product=1`、`?focusCircle=0`、实验室/QA 种子。本功能 **沿用 query**，建议键 `start` + `min`（例 `?product=1&start=sit&min=5`） |
| Electron 协议 | **已经注册** `focus-tiger`（带连字符）。生产 origin = `focus-tiger://app`。`app.setAsDefaultProtocolClient('focus-tiger')` + `open-url` / `second-instance` |
| 现网协议用途 | 结账回跳：`isDesktopCheckoutReturnUrl` 只要 `protocol=focus-tiger:` 且 `host=app` 即为真，随后 `navigateDesktopCheckoutReturn`。**练习深链必须走同一 origin，不得新注册 `focustiger://`**，否则会和第二套协议、沙盒 origin、结账回跳抢车 |
| 解析缺口 | 今日 `open-url` **只**喂给结账函数；非结账 query 会被忽略。本任务要把分发器扩成：结账参数仍走结账；白名单 `start`/`min` 走练习路由；其余丢弃 |
| 空格开坐 | **T44** Idle 空格 = Sit（含 Arrival）。深链应落到 **同一内部 action**，不得另写一套 begin |
| 提醒族 | `focus-tiger.reminder-preference.v1` = `{ hour, minute }`；应用内横幅，不走浏览器 Notification。本 Brief **不改**提醒判定 |
| 冷启动 | **T76**：`arrivalGateReady === false` 时 Sit 仍先走到达。深链不得跳过第一幕，除非 PO 另拍（见 §6） |
| Ritual Recipe B1 | 未实现；将来只许官方 `templateId`。本 Brief **禁止**提前接收任意 `templateId` |

---

## 3. 深链契约（Web 与 Electron 同一内部 action）

### 3.1 URL

| 端 | 形状 | 例 |
|---|---|---|
| Web（Safari / 本机 Vite） | 现有页 origin + query | `https://<host>/?product=1&start=sit&min=5` |
| Electron | 已有自定义 origin + 同 query | `focus-tiger://app/?product=1&start=sit&min=5` |

**禁止**第二套 scheme。Shortcuts / 日历 / Alfred 文档一律写 `focus-tiger://app/…`（桌面）或 https query（网页）。

### 3.2 动作白名单（硬规则）

| 键 | 允许值 | 其它 |
|---|---|---|
| `start` | `sit` · `breath` · `micro` | 大小写不敏感；未知 → **整条丢弃** |
| `min` | `1` · `3` · `5` · `10` · `20` | 非整数 / 不在表 → **整条丢弃** |
| 其它键 | 忽略（`product` 等现网键仍按现网） | 不得因多带 `confide=` 就开倾诉 |

语义：

- `sit` → 与 Idle 点 Sit / T44 空格同一内部 `start-arrival` / Companion 开表路径（时长预选 = `min`，**本场覆盖**，不写回稳定偏好，除非已有 T87 规则要求——本刀 **不写回** `stable-prefs`）
- `breath` → 现网一分钟呼吸类微仪式入口；`min` 不在白名单则丢弃（即使 Breath 现网固定 1 分钟：只接受 `min=1`，其它分钟丢弃，避免假装支持）
- `micro` → 现网 MicroRitual 白名单时长；不在表则丢弃

**实现前须在 PR 把 `breath` / `micro` 映射到现网具体 UI 函数名**（点名 `MicroRitualUI` / Honesty 呼吸 **禁止**混进 Confide）。若现网 Breath 没有独立「N 分钟」参数，**不得发明**；Brief 推荐：`breath` 仅 `min=1`，其余分钟拒绝。

我认为最合理的是：**Sit 支持全表分钟；Breath / micro 只接受现网真实存在的时长，否则丢弃。** 弱方案是把任意分钟硬塞进 Breath（会编造产品没有的仪式）。

### 3.3 深链不得触发（硬规则）

未知动作、以及下列意图，**一律丢弃**（不导航、不写盘、不打开叠层）：

- Confide 内容 / 打开倾诉 / 朗读
- 读取任何本机账本、Memory、练习备份、Health
- 支付、Support 三卡、Checkout
- 备份 / 删除 / 重置 / 设置修改（含提醒时分、适应开关）
- Ritual Recipe 任意 `templateId`（留给日后 B1）

丢弃时：若 App 已在前台，**0–1 秒内**须有非指责轻提示（locale 切片，en/ja 可发、zh 草稿）——「这个链接这边用不上」；不得静默 `return`（不在 `SILENT_BEHAVIORS` 则算 bug）。冷启动尚未挂 UI 时允许只打开发布页、不提示，但须在 e2e 锁「未开始练习」。

### 3.4 安全

- 解析在 **纯函数**（建议 `parsePracticeDeepLink(search)`），单测锁白名单。
- Query 不得执行脚本；只读字符串枚举。
- Electron `open-url` 仍 `preventDefault`；先结账识别（现有 `pro_session` / 桌面回跳键），再练习白名单，否则忽略。
- **不涉及后台网络**：深链不 `fetch`。Health 按钮是用户点击后跳 `shortcuts://`（见 §5）。

---

## 4. BACKGROUND_NETWORK 三问 + 防剽窃层分类

| 问 | 结论 |
|---|---|
| 是否非点击网络 | **否**。解析本地 URL；Shortcuts 跳转由用户点按钮。PR 写 **「不涉及后台网络」** |
| 防剽窃层 | **不算**。本地路由，不是云上秘密表 / overlay（对照 [`ANTI_PLAGIARISM_LAYER.md`](../ANTI_PLAGIARISM_LAYER.md)「不算」表：Idle / Sit 门闩属本地） |
| Never-Cloud | **是**。无账号、无 OAuth、不上传分钟数到自有服务器 |

---

## 5. Shortcuts 食谱

**发布方式（推荐）**：第一版用 **文档内手动创建步骤**（可复制）。iCloud 分享链接作为可选附件，须 PO 用自己的 Apple ID 生成后贴进 Help；Agent **不得**伪造 iCloud 链。Help Center 问卡可后续挂（本 Brief 不强制同 PR 改 Help）。

快捷指令 **固定英文名**（实现锁常量，用户改名则按钮失败并提示）：`Focus Tiger Log Mindful Minutes`。

### 5.1 一键开始 5 分钟 Sit

| 栏 | 内容 |
|---|---|
| 步骤 | 1. 打开快捷指令 → 新快捷指令。2. 动作「打开 URL」。3. URL：网页用线上 origin + `?product=1&start=sit&min=5`；Mac 电脑版用 `focus-tiger://app/?product=1&start=sit&min=5`。4. 保存。 |
| 用户操作 | 须自己保存该指令；主屏幕可加图标（iOS） |
| 已知限制 | 网页须已登录所在浏览器会话（本产品无账号，但须能打开同一 origin）。电脑版须已安装并注册协议。未装电脑版时 `focus-tiger://` 无响应 |

### 5.2 工作日定时提醒开始（Automation）

| 栏 | 内容 |
|---|---|
| 步骤 | 1. 自动化 → 特定时间 → 周一至周五。2. 运行「打开 URL」同 5.1。3. 询问运行：**建议开**（勿静默开练习，避免会议中突然坐下）。 |
| 用户操作 | iOS/iPadOS 自动化；Mac 快捷指令自动化可用性因系统版本而异，文档标「Mac 自动化待核实」 |
| 已知限制 | 系统可能弹「要运行吗」。**不是** App 内提醒族的替代；两边可并存，互不写盘 |

### 5.3 练习结束后「记入 Health」

| 栏 | 内容 |
|---|---|
| 产品 | Reflection / 微仪式结束画面出现按钮（**默认关**；Preferences 里开）。**必须用户手势**触发。禁止练习结束自动 `location = shortcuts://` |
| URL | `shortcuts://run-shortcut?name=Focus%20Tiger%20Log%20Mindful%20Minutes&input=text&text=<min>`。`text` **只**含整分钟数字（及可选练习类型短码 `sit`/`breath`/`micro`，逗号分隔，例 `5,sit`）。**禁止**情绪词、倾诉原文、Memory、姓名 |
| 快捷指令内 | 「记录健康样本」→ Mindful Minutes；数值 = 输入分钟；时段 = 现在往前推该分钟数（步骤写进食谱）。首次运行系统会要 Health 权限——那是 **用户与苹果** 之间的授权，不是 Focus Tiger OAuth |
| 开关 | 新 localStorage 键（须进 `localStateKeys` 白名单），默认 `false`。关：结束画面无按钮 |
| 平台 | **仅 iOS / iPadOS 承诺**。Mac：Health「记录健康样本」动作 **待核实、不承诺**（社区：Health 动作以 iOS 为先；Mac 无 Health App。真机前不得写「电脑版也能记入」） |

**他人验证（本 Brief 已搜，实现前须再搜一轮）：**

- 官方：[Run a shortcut using a URL scheme on iPhone or iPad](https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios) 与 [Mac 版](https://support.apple.com/guide/shortcuts-mac/run-a-shortcut-from-a-url-apd624386f42/mac)：明确 `shortcuts://run-shortcut?name=&input=&text=`，并写「可用在网页浏览器」。
- 社区：网页 `<a href="shortcuts://…">` 在 Safari 可跑（[ale.today](https://ale.today/launching-shortcuts-from-a-web-page/)）。
- **未**找到「Focus Tiger / 任意 SPA 结束按钮 → 记入 Mindful Minutes」的完整第三方验收。Instagram 等 **内嵌 WKWebView** 常拦自定义协议；iOS 18.1 起用 Shortcuts 当「逃出内嵌浏览器」的招也有失效报告（[inapp-debugger#8](https://github.com/shalanah/inapp-debugger/issues/8)）。
- **结论**：Safari / 本机主屏打开的网页 **可以写进验收 D**；**微信 / Instagram 内嵌、以及 Electron 包里的页** 标已知失败面。Electron 结束按钮：若本机 Shortcuts URL 打不开，隐藏按钮或提示「请在 iPhone 上记」。

### 5.4 Raycast Quicklink / Alfred（无需官方扩展）

深链解析合入后，启动器只需打开与 §3.1 相同的 URL。**不必**单独做 Raycast Extension 或 Alfred workflow 二进制发布（与 [`task-ritual-recipe-phase1.md`](./task-ritual-recipe-phase1.md) 阶段 1「不做 Slack/Raycast 扩展」不矛盾：那是配方市场的范围，本条是 **Quicklink/URL 动作**，零维护）。

| 启动器 | 步骤 | 链接（电脑版示例） |
|---|---|---|
| **Raycast** | `Create Quicklink`（Raycast Manual · Quicklinks）→ Link 填 deeplink → Name 如 `Samatia · Sit 5m` → 可选热键 | `focus-tiger://app/?product=1&start=sit&min=5` |
| **Alfred** | Workflow → **Open URL** 或 **Custom Search** → URL 同上 | 同上 |
| **参数化** | Raycast Quicklink 支持 `{argument}` 占位；若要做「喊分钟数」，须 minutes 仍落在白名单 `1/3/5/10/20`，否则解析层丢弃 | 例：`…&min={argument name="Minutes"}`（实现前在 Help 写清表） |

**他人验证（2026-11-08 搜一轮）**：Raycast 官方文档列 deeplink（含 `shortcuts://`、`spotify://` 等）可直接作 Quicklink Link；未找到第三方完整验收 **`focus-tiger://` + 未注册协议的 Electron 包**。验收须 **层 C**：已安装 Samatia 电脑版且 `app.setAsDefaultProtocolClient('focus-tiger')` 已跑过。**未装壳**时点击无响应 = 已知限制，须在 Help 诚实写明。

**认为最合理的是**：食谱写 Raycast/Alfred 一行配置，**不**排「官方 Raycast 扩展」独立 Brief。弱方案是另写 TypeScript 扩展（维护 OAuth/版本与 Mac 人群重叠收益不成比例）。

### 5.5 将来 · Markdown 导出边界（占位 · 无运行时 · 等深链/日历有使用信号再写姊妹 Brief）

架构师与同事 2 均提到 Obsidian / 本地 vault。**本 Brief 不实现**；仅锁边界，避免将来 Brief 默认导出倾诉或 Memory。

| 默认导出 | 默认 **不**导出 |
|---|---|
| 本地日期 / 时区、练习类型（sit/breath/micro）、本场分钟数、可选「来自深链/日历」来源标记 | Confide 原文、Honesty 补登自由文本、Memory 摘要、姓名/邮箱、寅币/付款、T54 研究分享 payload |
| 格式：单文件 Markdown 或按日落盘到用户 **自选文件夹**（须文件选择器或路径设置，默认关） | 静默上传、Notion/Obsidian 插件 OAuth、云同步 |

**启用率信号**：仅本机计数（深链开坐次数、`.ics` 下载次数），沿用 [`RETENTION_FUNNEL.md`](../RETENTION_FUNNEL.md) 占位 `RetentionTelemetry` 模式；**禁止**在本产品线暗示云端 A/B 或 90 天实验对照（T54 90 天仍 **搁置**）。若日后汇总须走已有研究共修同意路径（T81+），**不得**另开上报通道。

---

## 6. 精灵通道 × 叠层仲裁（busy / 冷启动）— 待 PO 拍板

深链 **必须**走现网 `spriteChannelArbitration` + `overlayBusy` / `OVERLAY_SOURCE_CONTRACTS`，禁止直调 `playEmotion` 或绕过 `resolveSitClickWhenIdle`。

### 6.1 busy 时：拒绝 vs 排队

| 方案 | 行为 | 评价 |
|---|---|---|
| **A 拒绝（推荐）** | overlayBusy、Focusing、付款、Confide、庆祝占用精灵时：**不开始**；0–1 秒观察式提示「这边正忙，先结束再点链接」 | 与 T44 空格「门闩未过则不动作」同形；排队会在付款后突然开坐，惊吓大于省事 |
| B 排队 | 记一条 pending，busy 结束后自动开坐 | 弱：用户可能已离开；且深链会变成后台开始练习，违反「不静默开练」 |

**我认为最合理的是 A。** 只持有 **一条** pending：仅用于下面冷启动 defer，不用于付款/倾诉。

### 6.2 冷启动第一幕 / Arrival 门闩

| 方案 | 行为 |
|---|---|
| **A  defer（推荐）** | `arrivalGateReady === false`：照常播到达 / T76 四选（若该次冷启动需要）。门闩就绪后 **应用一次** 已解析的 `start`/`min`（用户不必再点链接）。四选卡仍要先完成——深链 **不得**跳过 T76 |
| B 跳过 Arrival | 深链直接 Focusing | **不合理**：拆冷启动契约 |
| C 丢弃 | 冷启动忽略 `start`，只打开 App | 弱：快捷指令用户会以为坏了 |

**我认为最合理的是 A。** 与「busy 拒绝」不矛盾：到达是产品第一幕，不是「忙」；付款/倾诉才是忙。

### 6.3 共用机制核对（结论句 · 禁止只打勾）

- **overlayBusy**：深链开坐计入与点 Sit 相同的 busy 源（Honesty / Reflection / Confide / Support / T79 卡等）。**不得**新增独立 snapshot 字段。语言面板开着时：深链仍走 A 拒绝（与切语问候例外无关——问候路径不得被本功能误伤，对照 `overlayBusyForLocaleGreeting`）。
- **HUD 呼吸**：成功开坐后呼吸驱动仍是现网 Sit / MicroRitual / RitualFlow 表；本功能 **不**新接 `overlayBreathing`。
- **z / dim**：深链本身无新遮罩。Health 按钮挂现网 Reflection 卡内，**禁止**新 fixed 全屏层；不得盖 Support FAB（对照 `Z_INDEX.md` Idle chrome）。
- **新建可点击叠层**：无新 overlay 状态。Health 钮不是新 `OVERLAY_UI_SURFACE` 行。Preferences 开关走现有设置卡。

---

## 7. 变体矩阵（A10）

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| Web Sit 5 | `?product=1&start=sit&min=5` Idle | ≤1s 进入与点 Sit 同等开表/到达；时长档 5 | 本刀 e2e |
| Web 未知 `start=hack` | 同上 Idle | 不开始练习；轻提示 | 单测 + e2e |
| Web `min=7` | Idle | 丢弃 | 单测 |
| Electron 同 query | `focus-tiger://app/?product=1&start=sit&min=5` | 与 Web 同一 action | 层 C 本机（CI 不跑 GUI） |
| 结账 URL 仍优先 | `focus-tiger://app/?product=1&pro_session=cs_test` | **只**结账回跳，忽略若被拼接的 `start` | 单测锁 `isDesktopCheckoutReturnUrl` 分发 |
| Breath 非 1 分 | `start=breath&min=5` | 丢弃（若现网无 5 分 Breath） | 单测 |
| 窄 375 / 宽 1280 | Web Sit 5 | 行为同；不挡 ⋯ | e2e 各一或复用菜单可达 |
| en / ja | 丢弃提示 / Health 钮 | locale 切片，不改总字典 | 切片键存在性 |
| Health 默认关 | iPhone 结束画面 | 无「记入」钮 | e2e |
| Health 开 + 手势 | 设置开 → 结束点钮 | 尝试 `shortcuts://`；内嵌 WebView 失败则课内/结束卡说明 | e2e 只锁点击尝试，不锁 Health 写入 |
| overlayBusy | Confide 开着贴深链 | 不开坐；提示忙 | e2e 或单测门闩 |
| 冷启动 | `arrivalGateReady` 假 + 深链 | 先到达/四选，再一次应用 | e2e |

---

## 8. 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 0–1 秒 | 持久化三态 |
|---|---|---|
| 合法深链（Idle） | 与点 Sit 相同：到达或开表可见 | 不写新盘（时长本场） |
| 非法深链 | 轻提示可见 | 不写盘 |
| busy 拒绝 | 轻提示「正忙」 | 不写盘 |
| Preferences「结束后可记入健康」 | 开关勾上/勾下即时 | pending → 成功勾选；`setItem` 失败 fail 回弹 |
| 结束卡「记入健康」 | 系统切到快捷指令或失败说明 | 无自有服务器；失败不重试静默 |

设计静默：无。busy 拒绝 **不是** SB；必须有提示。

---

## 9. 边缘状态（A14）

| 边缘 | 预期 |
|---|---|
| 未装快捷指令 | 点记入 → 系统失败或空跳；结束卡一句「请先按食谱装指令」；**不**崩 SPA |
| 非 iOS | 无按钮（或 Mac 文案「待核实」隐藏） |
| 内嵌浏览器 | 按钮可点；失败说明「请用 Safari 打开」 |
| 付款回跳 URL | 练习参数不得抢结账 |
| 第二场 Focusing | 深链拒绝 |
| 无障碍 | 按钮有可见文案 + `data-testid` |

---

## 10. 验收四层

| 层 | 谁做 | 绿的定义 | 门禁 |
|---|---|---|---|
| **A** | Agent | `parsePracticeDeepLink` 白名单单测；结账 URL 不分叉到开坐 | 无 A 不得开 B |
| **B** | Agent | Web e2e：合法开坐、非法丢弃、busy 拒绝、开关默认关 | 无 B 不得请用户测 D |
| **C** | Agent 本机 Electron | 协议打开电脑版并开坐；不破坏结账回跳 | CI 不代替；TRACKER 人工 |
| **D** | **仅 PO 真机** | iPhone Safari：食谱 5.1；结束钮调起快捷指令并在 Health 见 Mindful Minutes | **前三层绿之前禁止要求用户亲测**。请测前 Agent 须再搜「他人是否已验证网页→Health 样本」并附结论（本 Brief §5.3 为 2026-11-07 快照） |

---

## 11. 明确不做

- 全局快捷键扩面 / 改 T44 空格语义
- `x-callback-url` 回读快捷指令结果
- 读取 Health；HealthKit；Capacitor iOS 壳
- 云、OAuth、Slack、Notion、日历写 API
- 新 scheme `focustiger://`
- 静默回写 Health
- Ritual Recipe B1 `templateId`

---

## 12. 切片与开工门禁

| 刀 | 内容 | 类 | 依赖 |
|---|---|---|---|
| **本 PR** | 本 Brief | A 文档 | — |
| **A** | 解析纯函数 + 单测 + 分发器设计（不接线 UI） | A | Brief 点头 |
| **B** | Web 接线 + 开关 + 结束钮 + e2e | B | A |
| **C** | Electron `open-url` 分发（结账 ∪ 练习） | B | A；可与 B 分 PR |
| **D** | 食谱进 Help 或 `docs/` 用户步骤；真机 | — | A–C 绿 |

**开工门禁（缺一不可）**

1. PO 书面点头本 Brief（含 §6 busy=拒绝、冷启动=defer、Health **默认关**）。  
2. `gh pr list` 无同内容 OPEN 实现 PR。  
3. 冲突扫描仍为无职责打架（Sit 入口仍是 Sit；深链只是同一 action 的外部手柄）。  
4. **禁止** Redeploy。**禁止**改 GLOSSARY。  
5. 变体矩阵缺行 = 未锁。

---

## 13. 待 PO 拍板

> **地面真相（2026-11-08）**：说明书合并 PR [#1596](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1596) 已于 **2026-11-07** 合入 `develop`（`7c82e361`）。**点头 ≠ 已做进 App**；实现仍无 OPEN/MERGED 运行时 PR（开工前再 `gh pr list`）。  
> **合成 Agent + 分析师（2026-11-08）一致推荐**（PO 一行书面「点头」后视为锁，可抄进实现 PR 描述）：

1. busy：**拒绝**（付款/倾诉中不突然开坐）。  
2. 冷启动：**defer 一次**（先走完开场/T76，再应用链接里的时长；不跳过到达）。  
3. Health 按钮：**默认关**（设置里开；用户手势触发）。  
4. 第一刀实现：**只 Sit**；Breath/micro 等解析与白名单单测绿后再加。  
5. Epic：**挂栖居壳层 #793**，不新建「上下游整合」。  
6. Raycast/Alfred：**食谱 §5.4**，不单独扩展 Brief。  
7. Things / Notion / Slack / Zapier / iOS 原生壳：**继续不做**（与 §1 拍板一致）。  
8. Markdown 导出：**等深链 + 日历有人用再写姊妹 Brief**；边界见 §5.5。

仍须 PO 对 §13 第 1–4 条书面点头后，口令 `按深链 Shortcuts Brief 开工解析层` 才执行。

---

## 14. 冲突扫描（对照 `SCENARIO_TESTS.md`）

相邻：场景 Sit / Arrival（T76）、T44 空格、Honesty 补登、结账回跳、提醒横幅、Ritual Recipe B1（未做）、Support 付款。

| 轴 | 判断 |
|---|---|
| a. 强度 | 外部一键开坐 **不得重于** 主屏点 Sit。busy 拒绝轻提示 < 付款失败卡。Health 多一次可选点击，默认关，不比结束庆祝更重 |
| b. 语气 | 丢弃/忙碌提示观察式，不说「你不该用快捷指令」 |
| c. 职责 | 深链 = Sit 的外部手柄，**不是**新练习种类。Health 回写 ≠ 练习纸、≠ T54 研究分享、≠ Honesty「别处完成」。Recipe B1 仍按 `templateId`，本刀不抢 |

**结论：无须停写文档的冲突。** 实现前若第一刀含 Breath，须再扫 Honesty 呼吸职责。
