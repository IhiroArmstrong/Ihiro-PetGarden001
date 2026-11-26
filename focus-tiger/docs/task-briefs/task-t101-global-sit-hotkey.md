# Task Brief · T101 全局快捷键开坐

> **状态**：**已合 develop（#1882）** · PO 2026-11-26 改口可进 12/8。  
> **代号**：**T101**。人话：电脑已开着或收在菜单栏时，按一组全系统快捷键就能开始坐。  
> **槽位**：**P1 · 已完成**。  
> **类**：实现时 **B 类**。  
> **硬条款（2026-11-26 改口）**：**可以进 2026-12-08 首包**。对用户没有坏处；原「搅浑留存对照」让路。  
> **不是**：**T44** 窗口内空格。**不是** **T10** `Control+Shift+Y`。**不是** 登录时自动开。**不是** **T49**。

**口令**：`按 T101 Brief 开工全局开坐快捷键` = **不执行**（#1882 已合）。可进 12/8。

---

## 0. 大白话

窗口在前台时，空格已经能开始。还缺的是：你在别的软件里按一下也能坐下。默认键必须躲开旁白（VoiceOver）常用的 Control+Option，也不得抢走按键说话。键必须能自己改。12 月 8 日那份安装包**含**本功能（PO 2026-11-26 改口）。

---

## 1. 地面真相

| 项 | 事实 |
|---|---|
| 窗口内开坐 | **T44** #1410：Idle 空格 = Sit |
| 全局已注册 | 仅 `Control+Shift+Y` → 唤窗 + 按键说话（**T10**） |
| 深链 | `start=sit` 已合 #1675/#1678/#1681 |
| VoiceOver | 苹果文档：默认修饰键是 **Caps Lock 或 Control+Option**（[VO 键盘命令](https://support.apple.com/guide/voiceover/control-your-mac-with-keyboard-commands-vo2681/mac)）。WAI-ARIA 也写明 macOS 避免 Control+Option + 任意键（WordPress Gutenberg [#11154](https://github.com/WordPress/gutenberg/issues/11154) 实锤） |
| 入账 PR | #1875 已合 `e23cddd1`（2026-11-23） |

---

## 2. 拍板已锁（2026-11-24）

1. **禁止**任何默认或出厂备选键同时包含 **Control 与 Option**（即躲开 VO 修饰键）。  
2. **禁止**占用 **`Control+Shift+Y`**（T10）。改键 UI 也不得提供这一项。  
3. **必须可自定义**（第一刀 Preferences，不是第二刀）。登记失败 → 0–1 秒内提示去改键，不得静默。  
4. **默认键（查冲突后）**：**`Command+Control+Shift+S`**（⌃⇧⌘S，Sit）。依据见 §2.1。  
5. 行为：托盘或前台 → 与点 Sit / 深链 `start=sit` 同一内部 action；默认本场 5 分钟，不写回稳定偏好。忙 → **拒绝** + 轻提示。T76 未过 → 唤窗 defer 一次。已 Quit → 无效。本刀不做 Login Item。网页无全局键。  
6. **首包**：见文首硬条款。

我认为最合理的默认是 **Command+Control+Shift+S**。弱方案：首次使用强制自设（多一步，削弱「一键」）；Control+Option+S（PO 已否，旁白冲突）。

### 2.1 默认键冲突表（2026-11-24 查）

| 组合 | 结论 |
|---|---|
| Control+Option+S（旧稿） | **禁用**。VO 默认修饰 = Control+Option |
| Control+Shift+Y | **禁用**。T10 |
| Command+S / Command+Shift+S | 系统保存 / 另存。本默认**另加 Control**，不是这两项 |
| VO-Command-Shift-S | 旁白「找上一个同类项」，VO = Control+**Option**，故是 ⌃⌥⌘⇧S，**不是** ⌃⇧⌘S |
| 系统辅助功能 Control-Option-Command-8 等 | 都带 Option；本默认**不带 Option** |
| 截屏 Command+Shift+3/4/5 | 无 Control |

实现时 `globalShortcut.register` 失败仍须走改键，不得换回 Control+Option。

---

## 3. 明确不做

- 改 T44 / T10；开机自启；网页热键  
- 进 12/8 首包；托盘今日分钟（**T102**）

---

## 4. 共用机制核对

- **overlayBusy**：开坐计入与点 Sit 相同 busy 源。忙则拒绝。语言面板开着时仍拒绝。  
- **HUD 呼吸**：成功开坐后仍走现网 Sit 表；不新接 overlayBreathing。  
- **z / dim**：无新遮罩。Preferences 改键走现有设置卡，不盖 Support FAB。  
- **新建可点击叠层**：无新 `OVERLAY_UI_SURFACE` 行。改键控件挂现网 Preferences。

---

## 5. 变体矩阵（A10）

| 变体 | 预期 |
|---|---|
| Idle + 默认键 | ≤1s 进入与点 Sit 同类到达/开表 |
| 已改成自定义键 | 只响应新键；旧默认失效 |
| 试图设成 Control+Shift+Y | 拒绝保存 + 提示 |
| overlayBusy | 不开坐；轻提示 |
| T76 未完成 | 先到达/四选，再应用一次 |
| 注册失败 | 提示改键；不开坐 |
| 已 Quit | 系统吞键；Help 写明已知限制 |
| 网页 | 无本键 |

---

## 6. 点击反馈（0–1 秒）（A14）

| 入口 | 0–1 秒 |
|---|---|
| 合法全局键 | 与点 Sit 相同；必要时唤主窗 |
| busy | 轻提示「这边正忙」 |
| 改键保存成功 | 开关/字段即时显示新组合 |
| 改键非法 / 登记失败 | 回弹 + 失败句 |

设计静默：未运行时系统吞键 = Help 诚实写明，不算 SB。

---

## 7. 边缘状态（A14）

第二显示器 / 他 App 全屏：仍应唤出或拒绝有提示。专注中再按：拒绝。无障碍：改键控件有可见文案 + `data-testid`。

---

## 8. 冲突扫描

相邻：T10、T44、深链 Sit、T76、场景 AB、T95 首包。职责 = Sit 的外部手柄。强度不得重于点 Sit。**无职责打架**；语音键不得共用。首包数据面：本刀不进 12/8。

---

## 9. 验收

单测：默认键 = Command+Control+Shift+S；拒绝 Control+Option 与 Control+Shift+Y。本机 Electron：他 App 前台按键能开坐。CI 不跑 GUI。
