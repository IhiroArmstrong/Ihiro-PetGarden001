# Task Brief · 本地电脑版壳选型（Mac DMG）

> **状态（2026-08-16 拍板）**：首发 **Mac DMG 壳 = Electron**（打包器默认 **electron-builder**）。  
> **本回合只锁口径，不写脚手架、不产 DMG。**  
> 权威落点：本 Brief + `PROCESS.md` Backlog「本地桌面 APP 打包」。  
> 触发：产品要「现有 Web 代码库变成 Mac DMG」（`PROCESS` 触发 B）。

---

## 拍板（硬）

| 项 | 口径 |
|---|---|
| **首发桌面壳** | **Electron**（自带 Chromium；主进程薄包装；渲染进程 = 现有 Vite `dist`） |
| **首发打包器** | **electron-builder** → macOS **DMG**（公证 / `notarytool` 走其现成钩子） |
| **首发平台** | **Mac**（Apple Silicon 优先；Intel / universal 在脚手架 Task 再定） |
| **Tauri** | **不**作 v1 电脑版壳；**日后性能优化备选**（RAM / 电池有实测痛点再评估） |
| **Capacitor** | **不**用于桌面窗口包装；留给**未来手机原生壳**（HealthKit / Health Connect） |
| **PWA / 薄壳** | **保留**为 Web「添加到主屏幕」增强（任务六已合）；**不是**电脑版终局 |
| **v1.0.0 Web** | **不变**：默认交付仍是纯 Web；Electron 是「要桌面包」时的包装路径，不推翻 Browser First |
| **本回合不做** | `desktop/` 脚手架、签名证书、公证 CI、自动更新器、托盘常驻 |

**一句话**：对「能不能第一时间上线 Mac DMG」这个目标，**稳妥比轻量更重要**；本仓库资源体积已经很大，Electron 自带 Chromium 的体积税相对可接受。

---

## 冲突扫描（实现前 · 本回合文档）

对照 `SCENARIO_TESTS.md`。本回合**无运行时、无可点击控件**。

| 相邻场景 / 口径 | 结论 |
|---|---|
| **任务六 PWA**（添加到主屏幕；故事仍不进正式场景） | **无冲突**。PWA 继续服务浏览器安装；Electron 是另条电脑版安装包。禁止把任务六改写成「已是最终电脑版」。 |
| **场景 AA Idle Document PiP** | **无冲突**。AA 仍是浏览器实验探针，**不是**系统托盘 / 关窗口常驻。Electron 日后碰巧带 Chromium，PiP 在 DMG 里**可能**能用，但**不**等于已做桌宠；加大投入仍看使用记录。 |
| **Focusing Immersive Presence · Float Yin** | **无冲突**。计时浮窗仍是页内实验，不是 Electron 壳。 |
| **Browser First / 健康 Capacitor** | **无冲突**。手机壳、HealthKit 仍非 v1、仍默认 Capacitor；不并入本条。 |

强度 / 叙事：没有新用户路径，不改变 Sit / Arrival / Honesty / 付费双轨。

---

## 本产品约束（选型必须贴着这些，而不是抽象对比）

现有栈：`Vite` + `Lit` + 2D PNG 序列主线 + 氛围音频 + 用户自传 mp3/m4a + `localStorage` 练习记忆 + Stripe Checkout（系统浏览器）+ Playwright **Chromium** e2e。人工主测浏览器是 **Safari**。

本机 `public/` 量级（2026-08-16 工作区实测，约数）：

| 路径 | 约 |
|---|---|
| `public/sprites/` | **836 MiB** |
| `public/audio/` | **189 MiB** |
| `public/` 合计 | **~1.1 GiB** |

结论：**安装包体积的主因是精灵与音频，不是壳。** Electron 多带的 Chromium（量级约 100–200 MiB）相对 1.1 GiB 资源是次要项。Tauri「壳只有几兆」的宣传优势在本仓库**几乎兑现不了用户可感的下载瘦身**。

其它硬约束：

- 团队是 **JS/CSS 前端**；没有 Rust 主线人力。
- 目标是 **尽快有可分发的 Mac 窗口**，不是先做最省内存的壳。
- 核心路径 **v1.0.0 纯本地**（不把练习绑死在云请求上）。
- 自动更新器、菜单、用户数据目录等适配面 **选型后另开脚手架**；Web 轻提示（#263）继续只管浏览器刷新，不冒充补丁包。

---

## 候选对照

### 1. Electron（采用）

| 面 | 对本仓库 |
|---|---|
| 技术栈 | 主进程 Node/Electron；渲染层 **原样吃 Vite `dist`**，不必重写 Lit / `EmotionController` / 精灵播放器 |
| 引擎 | 自带 Chromium → 与 **Playwright e2e 同源**，少一层「CI 绿、包装后 Safari 引擎又出岔」 |
| Mac 交付 | `electron-builder` 的 `dmg` + `@electron/notarize` / `notarytool` 案例极多 |
| 适配面 | `file://` vs 自定义协议、原生菜单、窗口生命周期、日后 `electron-updater` 都有现成文章 |
| 代价 | 内存 / 电池高于系统 WebView；安装包固定多带一份 Chromium |

**为何压过「轻量」**：本产品要稳的是序列帧、氛围乐、用户上传音频、localStorage 持久化。Electron 把这些当普通网页来跑；出问题能搜到十年积压的案例。

### 2. Tauri 2（日后备选，现在不采用）

更轻、用系统 **WKWebView**、Rust 壳。对「空白 Todo 应用」很香，对本仓库不合适的具体原因：

1. **体积优势被资源吃掉**（见上表）。
2. **WKWebView ≈ Safari 引擎、版本跟 macOS 走** —— 序列交叉淡化、音频、`<audio>` 分段请求在 WebKit 上已有已知坑（自定义 `asset://` 往往**不支持 Range**，大音频/用户曲容易播不了或不能 seek）。修这些要写 Rust 自定义协议，不是「包一层 HTML」。
3. **大前端资源打进 Tauri 二进制会爆内存 / 编不过**（上游对 ~1 GB `frontendDist` 有失败报告）。正路是 `resources` + asset protocol —— 等于第一周就要处理「精灵/音频怎么从包里读」，而 Electron 只需把 `public/` 跟 `dist` 一起打进 asar 或 extraResources。
4. **学习曲线**：纯前端团队要 rustc、allowlist、插件（dialog / fs / opener）。与「第一时间上线」相反。
5. **e2e 错位**：CI 锁的是 Chromium；Tauri Mac 包是 WebKit。要达到同等信心还得补 WebKit 套件。

**何时再打开**：DMG 已能日常用，且有**实测**证明 Electron 内存/发热不可接受（长时 Focusing）。重评估时仍须先证明音频 + 836 MiB 精灵在 WKWebView 上的加载方案，禁止只凭博客「Tauri 更轻」切栈。

### 3. Capacitor（明确排除桌面包装）

Capacitor 的胜场是 **调用移动端原生 API**（HealthKit Mindful Minutes、Health Connect、以后上商店）。用它包一个 Mac 窗口：生态与文档都按 iOS/Android 走，桌面是二等公民。

**分工不变**（2026-08-07 技术方向纪要）：

- 现在：Web +（要电脑版时）**Electron**
- 未来手机壳：默认 **Capacitor**
- 禁止：为了「一个壳打天下」把桌面和手机绑成同一套 Capacitor Electron 实验栈

### 4. PWA / 薄壳（不是终局）

「双击图标」成本最低，但：没有正规公证 DMG、没有稳定的离线安装包语义、与「本地可以跑的电脑版 APP」产品目标不对齐。任务六（manifest + network-only SW）**继续存在**，只服务浏览器。

---

## 脚手架 Task（尚未立项 · 勿在本 PR 开工）

下一独立 Task 建议最小集：

1. 独立目录（建议 `focus-tiger/desktop/` 或仓库根 `desktop/`），**禁止**把 Electron 依赖撒进产品 `src/`。
2. 主进程：`contextIsolation: true`、`nodeIntegration: false`、preload 只暴露白名单 API。
3. 加载 **Vite 生产 `dist`**（先 `npm run build`）；开发期可 `loadURL` 指向 Vite dev，但验收以生产包为准。
4. **Electron 内不注册** 现有 PWA service worker（或明确 no-op）——避免 Cache Storage 与包装器双轨。
5. `electron-builder`：`dmg`、`arm64` 优先；签名 / 公证需 Apple Developer ID（用户侧证书，不进仓库）。
6. 用户数据：沿用渲染进程 `localStorage` 作为 v1；**不要**第一周就迁原生 FS（练习记忆云快照路径不变）。
7. Stripe：继续 `shell.openExternal`（或等价）打开系统浏览器 Checkout，不在壳里嵌伪商店。
8. 真自动更新器（`electron-updater`）**另议**；Web 刷新芯片继续只服务浏览器。
9. 打包产物 CI（「安装包能启动」）在脚手架能在 CI 跑起来之后再写，见 `PROCESS` 发布前安全网。

**已好清单（脚手架开工时必须守住，本回合不改代码）**：

- 产品仍可纯 Web 打开（`?product=1`）；Electron 是加法。
- Sit / Arrival / Honesty / 付费双轨门闩不因壳而改语义。
- 不引入系统托盘常驻、不把场景 AA 升级成关 App 仍活的桌宠。
- 不把 HealthKit 写进 Electron。

---

## 不做（本决策）

- 本回合实现窗口 / DMG / CI 公证
- 把 v1 改成「只出 Mac 包、Web 下线」
- 为省内存现在切 Tauri
- 用 Capacitor 打 Mac
- 把 PWA 宣布为电脑版交付完成
- Mac App Store / Windows / Linux 安装包（可在 Mac DMG 跑通后再开）
