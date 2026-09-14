# Task Brief · Electron 官网 DMG 自动更新器（点一下装补丁）

> **状态（2026-09-12）**：产品口径已拍板；**本回合只锁 Brief，无运行时。**  
> 挂线：Epic **#5** / **#631** `mac-dmg-release`（不另开 Epic）。  
> 壳已拍板 Electron（#326）；窗口/托盘步骤 A/B 已接线。**禁止**借本任务重开 Electron vs Tauri 选型。  
> 实现须另口令（建议：「开工桌面更新器 MVP」）。第一份**对外收费/官网直销** DMG **发出去之前**必须带上检查更新的代码——老包没有这段逻辑，以后永远弹不出 Update。

---

## 拍板（硬）

| 项 | 口径 |
|---|---|
| **要不要做** | **要。** 官网直销 DMG 没有商店更新托底；对 bug / 安全补丁 / 后续功能是地基，不是锦上添花。 |
| **壳** | **只走已拍板的 Electron + electron-builder。** Tauri updater 不评估、不对比、不写进实现。成熟度只作「为何不重开选型」的一句附录。 |
| **MVP 用户路径** | 检测到新版本 → 空闲时左下芯片（有更新才出现）→ 后台下载 → **用户确认后**重启安装。 |
| **Web 芯片** | `#263` 继续只管浏览器「点一下刷新」。壳内 **继续隐藏** `version.json` + `reload`（`shouldRevealSoftUpdatePrompt` 的 `desktopShell` 门闩不得拆掉）。电脑版芯片语义 = **换安装包**，禁止刷新冒充。 |
| **打断** | Focus / Arrival / Reflection / 微仪式 / 庆祝：**不弹窗、不强刷、不抢主 CTA。** 下载可在后台；**安装/重启必须等空闲且用户点了**（MVP）。 |
| **付费** | 与 Stripe / entitlement **解耦**；会员与免费同一更新路径。禁止用更新推销茶 / Membership。 |
| **静默更新** | MVP **不做**后台装好再强行重启。 |
| **差分更新** | MVP **不要求**；但验收必须记下「一次代码补丁实际要下多少字节」，禁止假装即时。 |
| **V8 字节码** | 同 Epic 可后排。**更新器比字节码更挡第一份收费 DMG。** |

**一句话**：第一份正式电脑安装包必须自己会检查更新；提示气质对齐网页左下芯片，点击动作换成下载并重启安装。

---

## 冲突扫描（实现前 · 本回合文档）

对照 `SCENARIO_TESTS.md`。本回合无运行时。实现口令时须再扫一遍（尤其场景 B / AB）。

| 相邻场景 / 口径 | 结论 |
|---|---|
| **Web 轻量更新芯片**（#263 · 左下 `#ft-soft-update-prompt`） | **无冲突（职责切开）**。网页 = 刷新前端；电脑 = 换包。同一视觉槽，**互斥**：`desktopShell` 时不得露出 reload 芯片。 |
| **Focusing / Arrival / Honesty / Reflection / 微仪式** | **无冲突（强度）**。更新提示弱于一炷香；忙时隐藏，与现网软更新 `busySession` 同级。禁止比 Recover / 走神回归更重。 |
| **场景 AB / SB-18 托盘收起** | **无冲突（须守）**。检查更新、下载、芯片出现 **不得**把 hide-to-tray 当成走神。对照：窗口可见时切 App 仍走场景 B。 |
| **PWA 任务六 / Service Worker** | **无冲突**。壳内不注册现有 SW；本项不是 PWA 更新。 |
| **Support / Stripe** | **无冲突**。更新不解锁内容、不走 Checkout。 |

语气：观察式短句（「有新版本可用」）；禁止 FOMO、倒计时、评判「你还在用旧版」。与 `PRINCIPLES.md` / Web 软更新 Brief 对齐。

---

## 共用机制核对

- **overlayBusy**：电脑更新芯片 **不是**新的 sceneAnim 忙碌源，**不得**挡住 Sit / 摸头 / 进睡 / 切语问候。它只是 z=22 Idle chrome（与 `?` 同带）。揭示条件复用（或对称复制）`shouldRevealSoftUpdatePrompt` 的 `busySession` 门闩：忙则隐藏芯片，芯片本身不把会话标忙。`OVERLAY_SOURCES.SOFT_UPDATE` 今日无独立 `OVERLAY_SOURCE_CONTRACTS` 行——实现时若登记，须在 `SHARED_RESOURCES.md` §4.1 写 **「不计入 sceneAnim overlayBusy；无例外项要挡的动画」**。  
- **HUD 呼吸驱动**：不触及。更新器不接 `overlayBreathing` / 计时。  
- **z-index / Idle 常驻 chrome dim**：复用 `#ft-soft-update-prompt`（z=22，在 `?` 上方）。**不**新开更高层。开 growth / 日签等 z17 遮罩时：与现表「软更新芯片」同一结论——默认未列入 `overlayBackdrop` dim；实现本 MVP **不要**顺手改 dim 名单。禁止抬到 Support FAB / 倾听耳（z=24）之上。

---

## 产品状态机（MVP 必须收口失败态）

禁止只做成功路径。可点控件不得对应静默 `return`（回归锁）。

| 状态 | 用户看见 | 可点后 0–1 秒 | 退出 |
|---|---|---|---|
| **无更新 / 无网探测失败** | **无入口**（静默；与 Web 无网一致） | — | — |
| **available** | 左下芯片（版本号） | 进入 downloading；芯片立刻变成下载中（进度或「Downloading…」），禁止点了没反应 | — |
| **downloading** | 进度或明确「正在下载」；控件禁用或改为不可重复触发 | 已在下 → 保持进度，禁止再开第二条下载 | 失败 → failed |
| **readyToInstall** | 芯片改为可点「重启安装」类观察句 | 空闲则开始退出并安装；若此时已变忙 → **不重启**，芯片留下等空闲 | — |
| **failed**（下载中断 / 校验失败 / 安装失败） | 芯片仍在，观察式失败句；**Retry** 与 **Not now** 都可见 | Retry → 立刻回到 downloading 反馈；Not now → 进入 skipped | 禁止卡死在「看起来能点、点了没反应」 |
| **skipped** | 本会话隐藏该版本入口 | — | 冷启动或发现**更新的**版本号后再出现 |

「Not now / 跳过这次」= 退出路径，不是把入口做成死循环。跳过 **不得**写成 FOMO（无「最后机会」）。

点击三问（实现 PR 必答）：

1. 点 Update / Retry 后 0–1 秒内必须看到下载中或失败句，不得空白。  
2. 无网探测失败属设计静默（无入口）；**点了之后的失败不在静默白名单**，必须有句 + Retry / Not now。新静默若需要，先挂 `SILENT_BEHAVIORS.md` 再做。  
3. 冲突扫描见上节。

---

## 强制 vs 可选（架构预留 · MVP 不实现强制）

更新清单（`latest-mac.yml` 或我方包装字段）预留 **`urgency`: `optional` | `required`**。

| 档 | MVP | 以后（安全高危） |
|---|---|---|
| **optional** | 唯一行为：用户确认才重启 | 仍是默认 |
| **required** | **读到也当 optional**（可 `console` 记一笔，禁止换交互） | 仍 **禁止**在 Focusing / Arrival 中途强杀。允许：空闲后改为「必须更新才能继续用电脑版」的确认卡（仍观察式、无倒计时羞辱）；会话中只保留角标，等 Rise。 |

预留目的：以后加强制档时 **不要推翻**「芯片 + 忙时不重启」骨架。本任务 **禁止**实现强制卡。

---

## 工程草图（实现口令时）

1. **库**：`electron-updater` + 现有 `electron-builder`。依赖进 `focus-tiger/desktop/`，**禁止**装进产品 Web `dependencies`（与脚手架同一条：Web CI 不拉 Chromium）。  
2. **发布源（官网直销）**：MVP 用 GitHub Releases 或自建静态桶（`generic` provider）托管 `latest-mac.yml` + zip/dmg。feed **必须**签名校验，禁止「能下就不验」。  
3. **渠道**：打包时写入 `FT_UPDATE_CHANNEL`（或等价）：`direct` | `setapp` | `mas`。**仅 `direct` 跑自建更新。** Setapp / Mac App Store 包 **编译期关掉** `autoUpdater`（不是运行时「尽量不 check」）。见下方发布检查清单。  
4. **签名 / 公证**：前后版本同一 Apple Team ID；更新包本身走 notarize。无证书时代码可合，**不得**声称收费 DMG 已可发。  
5. **包体**：`sprites` / `audio` 仍 `extraResources`（约 1.1 GiB）。代码补丁应尽量只动 asar；素材变了才动大资源。MVP 允许整包更新，但 TRACKER **必须记录一次真实下载体积**。差分 / blockmap 后做。  
6. **后台网络三问**（`BACKGROUND_NETWORK.md`，实现 PR 必答，不另开标准）：  
   - **Q1** 开机/回前台 check：须避开 Arrival / Honesty / Reflection 叠化、Idle 呼吸刚开始、精灵预加载；建议 Idle 稳定后再发（可对标练习备份 2.5s + busy 门闩）。Focusing **不**轮询。  
   - **Q2** 清单未变不得反复写盘；只更新「上次检查时间」类标记。  
   - **Q3** 慢网不得卡 Idle 呼吸 / 叠化；失败静默无入口。  
7. **IPC**：preload 白名单：`check` / `download` 进度 / `quitAndInstall` / 当前状态。渲染层只画芯片。  
8. **i18n**：`en` + `ja`（zh draft 可同步）；禁止硬编码业务句。  
9. **单测**：渠道关闸、busy 不揭示、failed 必须露出 Retry/Not now、`required` 在 MVP 映射为 optional、skip 后同版本不再揭示。主进程事件用 mock，不必两份公证包才能绿 CI。

---

## 验收：不发两个正式版也能测

自动更新不能等「两次官网发版」才发现坏了。分层如下。**合入更新器代码**以 A+B+C 为准；**第一份收费 DMG 出门**另加 D + 发布检查清单。

| 层 | 做什么 | 不要求 |
|---|---|---|
| **A · 纯函数 / 状态机** | 单测锁揭示门闩、失败退出、渠道、urgency 映射 | 真下载 |
| **B · UI 假通路** | DEV：`?forceDesktopUpdate=1` 或 IPC `desktop:fake-update` 驱动 available → downloading → failed / ready；人工看芯片与 0–1 秒反馈 | Apple 签名 |
| **C · 本地 generic feed** | 连续打两个 **version 递增** 的包，静态目录当 provider（本机 HTTP）。验证：旧包发现新包、下载、（若本机身份允许）quitAndInstall。无公证时至少锁到「下载完成 + 校验失败有 failed UI」 | 两个 **正式** notarized 号 |
| **D · 发版彩排** | 同一 Team ID 签 + notarize 的两次内部构建（可 GitHub pre-release / 未公开 tag） | 不得用未签名包冒充「用户机能装上」 |

Cloud Linux **不能**验 Mac 安装/公证（与脚手架相同）。CI 跑 A；B/C 在 Mac 工作树；D 挂发布周。

---

## 发布检查清单（可勾选 · 渠道冲突写进清单）

第一份官网 DMG **以及此后每次直销发版**须勾：

- [ ] 本包是 **`direct` 渠道**，且带检查更新 + 签名校验  
- [ ] 更新 feed URL 指向本渠道产物，**不是** Setapp / MAS 包  
- [ ] **若本包将上 Setapp**：自建 `autoUpdater` **已在该产物关闭**（编译期）；验收：装 Setapp 样包后左下 **永不**出现自建 Update  
- [ ] **若本包将上 Mac App Store**：同上，关自建更新  
- [ ] 签名 Team ID 与上一 `direct` 版一致；本包已 notarize  
- [ ] 本版下载体积已记入 TRACKER（代码-only vs 含 extraResources）  
- [ ] 忙时（至少 Focusing）芯片不出现、不重启  
- [ ] failed 路径：断网或坏 feed 时有 Retry / Not now，无哑点击  

清单权威落点：本 Brief + `TASKS.md` Epic #5 表。禁止只写在散文里（避免再出现「记录过时、清单勾不到」）。

---

## 明确不做（本 MVP）

- 重开 Electron vs Tauri / `tauri-plugin-updater`  
- 静默安装 + 强行重启  
- 差分 / 只推精灵包（可后排）  
- 系统推送「有新版」  
- Setapp / MAS / Windows / Linux 包  
- 用更新器推销付费  
- 实现 `urgency: required` 强制卡  
- 改 Web 软更新语义  
- 把检查更新绑进陪伴模型下载  

---

## 排期口令

- **本回合**：Brief + 交叉文档口径锁。  
- **下一刀（另口令）**：实现 MVP（建议「开工桌面更新器 MVP」）。  
- **挡第一份收费 DMG**：本 MVP + 公证/Team ID（用户侧，与写代码并行）。  

## 权威交叉

- 壳选型：`task-desktop-shell-electron.md`（#326）  
- 脚手架：`task-electron-desktop-scaffold.md`（更新器从「两步都不要做」改挂本 Brief）  
- Web 芯片：`task-web-soft-update-prompt.md`  
- 后台网络：`BACKGROUND_NETWORK.md`  
- 叠层 / z：`SHARED_RESOURCES.md` §4.1 · `Z_INDEX.md` Idle chrome  
- Epic：`TASKS.md`「苹果 DMG 发布准备」· `planning/task-lines-epic-draft.md` #5  
- 不打扰：`PRINCIPLES.md` · `INTERACTION_FEEDBACK_PRINCIPLES.md`  
