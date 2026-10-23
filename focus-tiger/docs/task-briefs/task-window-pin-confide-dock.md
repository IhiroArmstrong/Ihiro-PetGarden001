# Task Brief · T41 窗口置顶 + 倾诉贴边

> **状态（2026-10-23）**：PO 书面「按 T41 出 Brief」然后「按 T41 开工」，并明示 **开工前无需 Brief 点头**，本回合连贯执行。  
> **类**：**B**（电脑版窗口是否盖住别的 App；宽屏倾诉卡位置会改）。  
> **代号**：**T41**（电脑版十二条对照 #5 · 执行序 1）。  
> **分支**：`feature/t41-window-pin-confide-dock` · 基线 `origin/develop`（含 #1382）。

## 一句话

电脑版可以「始终在最前」。宽屏打开倾诉时，卡片贴底或靠右，中间留给阿寅；窄屏仍可居中。设置继续用现有暖米玻璃卡，不做成系统 Sheet。

## 已经定下的做法

1. **置顶（仅 Electron 壳）**  
   - 开关默认 **关**。  
   - 入口两处同一状态：托盘勾选；Preferences 玻璃卡勾选。  
   - 写入 `userData/always-on-top.json`；下次启动仍生效。  
   - Web / Safari `:5173` **不出现**该行、不置顶。  
   - **不是**悬浮标记（T 对照里的贴边小老虎）、**不是** Document PiP。

2. **倾诉贴边（Web + Electron 同一套 CSS）**  
   - `≤479`：保持现网居中贴底（窄手机允许盖住更多画面）。  
   - `480–899`：底部一条，高度不超过约视口 42%，阿寅上半身留空。  
   - `≥900`：靠右栏，中线左侧留给阿寅。  
   - 遮罩仍用现网 `#confide-to-yin-backdrop`（z=17 · `SB19_HOLD`）；本刀只改卡的几何，不改发送链、不改付款、不改 Help Center（那是 **T42**）。

3. **设置形态**  
   - 置顶面板复用暖米玻璃（`glassPanelStyles`），贴右下，像语音播报卡。  
   - 禁止 `NSPanel` / 系统 Preferences Sheet。

## 冲突扫描（`SCENARIO_TESTS.md`）

| 相邻 | 三轴 | 结论 |
|---|---|---|
| **场景 AE** 倾诉 | 职责 | **无冲突（改几何）**。仍从耳 / ⋯ / 抽屉打开同一张卡；只是宽屏不再居中盖脸。发送、检索、危机竖线不变。 |
| **场景 AA / AK** PiP · Float Yin | 职责 | **无冲突（切开）**。置顶是主窗口 `alwaysOnTop`，不是页内 PiP，不是 Focusing 小窗。 |
| **场景 AB / SB-18** 托盘 | 职责 | **无冲突（须守）**。置顶开着时红叉仍 hide 到托盘，不是走神。托盘「显示」仍唤出主窗。 |
| **Support / 场景 Q** 付款 | 强度 | **无冲突**。不改 Support FAB、三卡、Checkout。置顶卡不是付款入口。 |
| **T42** 次级弹窗不盖脸 | 职责 | **无冲突（分刀）**。本刀只动倾诉卡 + 置顶。帮助中心等其它宽屏弹窗留给 T42。 |
| **T38** 倾听坐姿 | 职责 | **无冲突（帮忙）**。贴边后才看得到倾听动画；本刀不改 Idle 配置。 |

强度：默认关置顶，不比 Recover 更重。人设：不监工、不加说教文案。

## 共用机制核对

- **overlayBusy**：不新增叠层源。倾诉仍走现网 `withIdleOverlayOccupancySync`。核对后确认问候 / 切语不被本刀挡住。  
- **HUD 呼吸驱动**：不碰计时。核对后确认 Focusing HUD 呼吸仍由现网驱动者表负责。  
- **z-index / dim**：核对 `Z_INDEX.md` Idle 常驻 chrome。倾诉遮罩仍 z=17，Support FAB / Ambient 音符 / 倾听耳（z=24）继续走 `overlayBackdrop` idle-chrome dim。新增 `#always-on-top-preference-panel` 登记 **z=18**（玻璃卡带），与 `#confide-to-yin-card` 同带；**不** inline 压 Support 26。  
- **新建可点击叠层**：置顶卡与 `#system-tts-preference` 同类偏好卡，**不**进 `OVERLAY_UI_SURFACE` / overlayBusy。Esc / 点空白自关。不新增 dim。

## 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Web 宽屏 ≥900 · 开倾诉 | `?product=1&confide=1` 点耳 | 0–1s 内卡靠右；中线左侧无卡 | `confideDockPlacement.test.js` · e2e `confide-wide-dock.spec.js` |
| Web 480–899 · 开倾诉 | 视口 700 | 0–1s 内卡贴底；上半屏留给阿寅 | 同上 e2e |
| Web ≤479 · 开倾诉 | 375 | 仍可居中贴底 | e2e 375 可见卡 |
| Electron · 置顶默认 | 冷启动托盘 | 「始终在最前」未勾；窗口不置顶 | `alwaysOnTopPolicy.test.js` |
| Electron · 托盘勾上 | 托盘 | 0–1s 窗口浮在其它 App 上；玻璃卡开关同步勾 | 人工 · Mac |
| Electron · 玻璃卡勾上 | ⋯ Preferences → Keep in front | 0–1s 开关变 On；托盘同步 | 单测 IPC 契约 + 人工 |
| Electron · 关掉 | 托盘或卡 | 0–1s 不再置顶 | 人工 |
| Web | `:5173` ⋯ Preferences | **无** Keep in front 行 | `idleChromeOrchestration.test.js` |
| 付款卡 | Support | 仍居中；本刀不改 | 不跑 payment-contract（未碰受保护路径） |

## 点击反馈（0–1 秒）（A14）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 开倾诉 | 宽屏卡出现在右或底，不是脸前正中 | 不写盘 |
| 关倾诉 | 卡与遮罩消失 | 不写盘 |
| 托盘「始终在最前」勾上 | 勾选立刻变；窗口浮到其它 App 之上 | 成功写 `always-on-top.json`；失败勾选弹回 |
| 托盘取消 | 立刻不再置顶 | 同上 |
| Preferences 玻璃卡开关 | 0–1s 见 On/Off；失败见失败句、开关弹回 | 经 IPC 写盘 |
| 玻璃卡 Close | 卡立刻关 | 不写盘 |

## 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 窗口已藏进托盘再开置顶 | 先显示主窗，再置顶 |
| 写盘失败 | 开关弹回；见失败句；不哑点击 |
| 窄 Electron 窗 ≤479 | 倾诉仍可居中；置顶菜单仍可出现（壳级，与宽度无关） |
| 全屏静坐（T43 未做） | 本刀不改全屏；置顶开着时系统全屏行为保持 Electron 默认 |
| 其它玻璃卡开着再开倾诉 | 倾诉几何仍贴边；不改 Support 居中 |

## 范围（out）

- **T42** 帮助中心 / Arrival / Reflect / 其它次级弹窗。  
- **T38** Idle 倾听配置。  
- **T43** 适中窗 / 全屏静坐。  
- 不改发送链、不改付款、不改菜单逃生舱。

## 验收

- `cd focus-tiger && npm run test:smoke`（含新单测）。  
- 手测：Electron 托盘置顶；宽屏 1280 开倾诉阿寅脸不被卡挡住。
