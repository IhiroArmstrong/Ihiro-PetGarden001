# Task Brief · Electron 桌面脚手架（Mac DMG）

> **状态（2026-08-17 立项）**：壳已拍板 Electron（#326 · tip `fe5b76a`）。本 Brief 是**实现脚手架的验收规格**。  
> **产品前提**：Web 仍是主力获客与最快变现；桌面是 Web **之上**的付费渠道（愿意为「真 App」多付钱），并为以后 Setapp / MAS 铺路。禁止为桌面牺牲 Web 体验或开发优先级。  
> **选型权威**：`task-desktop-shell-electron.md`。本文件管「怎么搭、什么叫做完」。  
> **触发**：#326 合入 + 分析师书面（2026-08-17）锁定托盘分层与四条 P0 技术债。

---

## 一句话目标

在**不改 Web 主路径语义**的前提下，加一条 Electron 薄壳：本机可开窗口跑现有 Vite `dist`；**对外收费的第一颗 DMG** 必须带托盘常驻 + 关主窗口后台运行，并且付费/云请求在壳里真能打通。

---

## 冲突扫描（实现前）

对照 `SCENARIO_TESTS.md`。分析师已书面同意托盘分层；本 Brief 把旧「脚手架不引托盘」改掉，避免两份文档互斥。

| 相邻 | 三轴 | 结论 |
|---|---|---|
| **场景 B** Re-focus（切标签/切 App） | 职责 | **无冲突（须对齐）**。B 仍管「用户去了别的前台」。托盘收起 **不是**走神。新场景 **AB** + **SB-18**。 |
| **场景 AA** Idle Document PiP | 职责 | **无冲突**。AA 仍是浏览器实验探针，**不是**托盘。禁止把 PiP 升级成关 App 常驻。 |
| **场景 Q** Stripe Checkout | 职责 | **无冲突（须适配）**。Web 仍可 `location.assign`；壳内 **必须** `openExternal`，否则整窗变成 Stripe 标签。 |
| **任务六 PWA** | 职责 | **无冲突**。SW 只服务官网；壳内不注册。 |
| **场景 X** 主动 Recover | 强度 | **无冲突**。托盘不代替点阿寅。 |

正面案例（扫描格式）：见 `FEATURE_CONFLICT_REVIEW.md`「正面案例 · 托盘 vs 旧 Brief」。

---

## 托盘分层（硬 · 2026-08-17）

| 交付物 | 托盘 + 关窗后台 |
|---|---|
| **第一颗能跑的窗口**（本机 `desktop:dev` / 未公证 `.app`） | **可以没有**（先验证协议、资源、付费外开） |
| **第一颗对外收费 / 官网上架的 DMG** | **必须有**。没有托盘 = 用户多付钱只换到一个图标，相对 Web 说服力不够 |

禁止：把场景 AA PiP 当成托盘的替代；禁止关窗即 `app.quit()` 作为收费 DMG 的默认行为（托盘菜单须有明确「退出」）。

---

## P0 验收（缺一不可 · 不能「窗口能开就算完成」）

分析师 2026-08-17：下列四条必须进**第一版脚手架验收范围**，禁止留到「以后再说」。

### P0-1 · Stripe `openExternal`（验收清单第一条）

- Tip / Sanctuary / Membership 在壳内点 Checkout → **0–1 秒内**系统浏览器打开 Stripe，**Electron 窗口不得被导航走**。
- 付完后的回跳：自定义 URL scheme 或「回 App 点 Restore / OTP」须有一条可测路径；禁止付完找不到产品。
- **未做到 = 脚手架未完成**（付费硬阻断）。

### P0-2 · `AttentionSignals` 不得把托盘隐藏当成走神

- 与场景 B 同类坑，触发源从「切标签」变成「收进托盘」。
- Focusing · Here & Now：点窗口关闭/收到托盘，停留 **>60s** 再从托盘打开 → **不得**出 Re-focus toast / `nod-bow`（**SB-18**）。
- 计时与氛围乐 **继续**。
- 对照：窗口仍可见时切到**另一个 Mac App** 停留 >60s 再回来 → 仍走场景 B（Here & Now 应 Re-focus）。
- 契约锁进场景 **AB**；实现须改 `AttentionSignals`（或壳侧注入「hide-to-tray ≠ away」），禁止只在主进程 hide、渲染层当 `document.hidden` 走神。

### P0-3 · CORS / origin 稳定性（禁静默失败）

- 自定义协议（建议 `app://` 或 `focus-tiger://`）**固定**，禁止 `file://` 当生产 origin（localStorage / IndexedDB 升级会丢）。
- 壳内至少实测一次：**Checkout 会话创建**、**OTP**、**练习记忆云备份** 请求是否真发出且有可见结果（成功或明确错误）。禁止「点了没反应」（对齐 `INTERACTION_FEEDBACK_PRINCIPLES`）。
- Worker CORS / 主进程代理：选一种写进实现；漏测 = 哑点击级缺陷。

### P0-4 · 1.1 GiB 资源从第一天走 `extraResources`

- `public/sprites/`、`public/audio/`（及其它大静态资源）**不得**整包塞进 asar 当第一版「先跑通再拆」。
- JS/CSS（Vite `dist` 的 hashed 资源）可进 asar；精灵/音频走 `extraResources`（或等价旁路数据目录）。
- 目的：公证上传与启动 I/O；避免公证阶段才拆包再加 1–3 天。

---

## 范围

### 做

1. 独立目录 `focus-tiger/desktop/`（或仓库根 `desktop/`）。**禁止**把 `electron` 装进产品 `src/` 的运行时依赖，以免 Web CI `npm ci` 拉 Chromium。
2. 主进程：`contextIsolation: true`、`nodeIntegration: false`；preload 白名单：`openExternal`、`quit`、版本号；托盘阶段再加 `hide`/`show`。
3. 加载 Vite **生产** `dist`；`desktop:dev` 可指向 Vite `127.0.0.1:5173`。
4. Electron 内 **不注册** `public/sw.js`。
5. 隐藏 Web 软更新芯片（`version.json` + `reload` 对本地包无意义）；`electron-updater` **本 Task 不做**。
6. `electron-builder`：macOS `dmg`、**arm64 优先**；Hardened Runtime + JIT entitlements 预留（公证可本机有证书后再跑）。
7. 托盘（收费 DMG 必做）：模板图标、左键显示主窗、菜单含「显示 / 退出」；红灯关闭 = hide，不是 quit。
8. 单测：至少锁「托盘 hide ≠ away」（纯函数 / 门闩），失败用例：`hidden && hideReason===tray` → 不得 `onReturn` Re-focus。

### 明确不做（本 Task）

- Apple Developer 入会 / 公证 CI（证书在用户侧；与写窗口**并行**，见下）
- `electron-updater`、Setapp、MAS、Windows/Linux 包
- HealthKit / Capacitor
- 把练习记忆迁到原生 FS
- 改 Web 主路径门闩语义
- 把场景 AA 做成系统桌宠

---

## 已好清单（实现时必须守住）

- `?product=1` 纯 Web 路径不变。
- Sit / Arrival / Honesty / 付费双轨 **语义**不因壳而改（只改 Checkout 打开方式）。
- 场景 B 在 **Safari / 浏览器** 上行为不变。
- 场景 AA 仍是实验 PiP，入口规则不变。

---

## 建议命令（实现时）

```text
npm run desktop:dev     # Vite + Electron 加载 localhost
npm run desktop:build   # vite build && electron-builder --mac dmg --arm64
```

Web 的 `dev` / `build` / `preview` **禁止改语义**。

---

## 与账号审核并行

Apple Developer Program 审核是链路里最不可控的一段（个人约 1–2 天；公司 DUNS 常见再锁 1–4 周）。**写窗口与入会并行**；禁止「证书办完再开工」。主体用个人还是公司见用户拍板（影响 Setapp/MAS 一致性，不能当小事事后换）。

---

## 验收对照

| 项 | 怎样算过 |
|---|---|
| P0-1 | 壳内请茶/会员 Checkout 走系统浏览器；窗不丢 |
| P0-2 | 场景 AB 主路径 + 对照 B；SB-18 命中 |
| P0-3 | Checkout / OTP / 备份在壳内有可见成功或可见错误 |
| P0-4 | builder 配置精灵/音频在 extraResources；asar 内无整包 sprites+audio |
| Web | `npm run test:smoke` 仍绿；未把 electron 塞进产品 `dependencies` |
| 收费 DMG | 有托盘；关窗后台；托盘可退出 |

本 Cloud 环境是 Linux，**不能**在本机产出公证 Mac DMG；实现回合须在 Mac 上验 AB / 公证，或明确「仅提交目录与配置、Mac 验收另开」。
