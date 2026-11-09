# T98 · 倾诉默认关闭时的入口盘点（只读）

> 2026-11-08 · 基线 `origin/develop@173365f3`（已含 #1632）。  
> 类：A 类只读。不改产品代码。  
> PO 已选 **方案 A**：第一份安装包保持倾诉产品挂载关闭；V2 变成「打开倾诉的门槛」，不再当安装包门槛。

本盘点核对方案 A 的三个前提。结论：**前提 1 成立；前提 2 目前不成立（有死路）；前提 3 已列清。**

## 1. 安装包构建里开关的实际默认值

| 开关 | 默认 | 证据 |
|---|---|---|
| 产品挂载 `CONFIDE_USER_MOUNT_ENABLED` | **false**（源码常量，不是环境变量） | `src/core/confide/confideUserVisibilityGate.js`：注释写明 MVP 保持 false；单测 `confideUserVisibilityGate.test.js` 锁死 `=== false` |
| QA 入口 `?confide=1` | 可开面板，**不等于**对客挂载 | 同文件 `isConfideDevHarness` |
| 电脑宽屏陪伴生成层 | **可以绕过产品挂载** | `canOpenConfidePanel`：若 `companionGeneration === true` 且安全语料 ok，即使挂载 false 也允许开面板 |

电脑宽屏陪伴层何时为 true：

- 有桌面壳 companion 桥（Electron preload）
- 窗口宽度 ≥ 480
- **并且** `isCompanionEntitled`：Pro 订阅有效，或 Lifetime 陪伴加购有效，或 QA harness / mock 查询参数

因此：

- **网页 / 未付费陪伴**的安装路径：菜单与耳朵默认不出现倾诉行（产品挂载关）。
- **第一份 Mac 安装包、宽屏、已购 Pro 或陪伴加购**：Idle ⋯ 会出现倾诉行（`idle-confide-desktop`），即使产品挂载仍是 false。这不是「公开倾诉给所有人」，但是对已购陪伴的电脑用户，倾诉**已经是真实入口**。

方案 A 若写成「第一份 DMG 用户进不了倾诉」，对未购陪伴成立；对已购陪伴的宽屏电脑用户**不成立**。账本不得把这两群写成同一句话。

## 2. 会跳到倾诉的入口，挂载关闭时会发生什么

`ConfideToYinUI.open()`：若构造时带了 `canOpen`，且 `canOpen()` 为 false，则 **直接 return，无可见反馈**。

| 入口 | 挂载 false 时 | 死路？ |
|---|---|---|
| Idle ⋯ / 抽屉倾诉行 | 网页与窄屏不渲染该行 | 否（看不见） |
| 宽屏倾听耳 / 窄屏倾诉钮 | `shouldShowConfideEarChrome` = `canOpenConfidePanel`，不能开则隐藏 | 否（看不见） |
| `⌘+E` | `confideAllowed` 与可开面板同一闸；不允许则快捷键不应触发 | 否（闸在绑定层） |
| Electron 宽屏 + 已购陪伴 | `companionGeneration` 为真 → **会打开倾诉** | 否；这是真实打开，不是死路 |
| 沉思问询「想聊聊」 | `onCrisis` 无条件 `confideToYinUI.open()` | **是**。未购陪伴、无 `?confide=1` 时 `open()` 静默失败：按钮可点，面板不出现 |
| 语音危机「转倾诉」 | B6 记在 `yinVoiceCommandEntry.js`；本盘点在当前树未再打开该文件名（现网语音门在 `voiceCommandGate.js`，该文件不含转倾诉） | **未在本回合复读**。不得写成已核实无死路 |

方案 A 的门槛「所有入口无死路」**现在还没做到**。最小缺口：沉思问询「想聊聊」。未核实项：语音危机转倾诉。

## 3. 默认构建里还有哪些 AI 生成入口

| 入口 | 默认对客？ | 是否自由生成 |
|---|---|---|
| 倾诉 L2 生成 | 仅当倾诉面板已打开，且桌面生成层 ready、路由为 fallback | 是。电脑宽屏已购陪伴时面板可开，故这是第一份 DMG **已购陪伴用户**的真实暴露面 |
| 反思陪伴（第二面镜子） | **实验室** `?reflectionCompanion=1`，注释写明 NOT shipping | 否（默认关） |
| 语音指令 | 电脑宽屏英文 UI 可出现；分类封闭指令 | 否，不走生成模型 |
| Moment Whisper / Arrival / Breath 等 | 产品方向锁 MUST NOT ENTER | 否，固定句 |
| 系统 TTS | 朗读已有回复 | 否 |
| 个人记忆「记住」 | 倾诉内规则摘要 | 否 |

**未发现**云端大模型调用（沿用 B6；本盘点未重扫全仓网络串）。

## 4. 对方案 A 与六条门槛的读法

PO 改写后的六条门槛，按本盘点：

1. 倾诉默认关闭，且所有入口无死路 → **默认关闭：对未购陪伴成立；对已购陪伴宽屏不成立。无死路：未满足。**
2. 其他 AI 入口盘点 → **本文件即结论**；默认构建里对客自由生成 = 已打开的倾诉 L2。
3. T93 经 B5 增量复核 → 未在本盘点做。
4. B2 对签名公证和更新通道给出结论 → 未在本盘点做。
5. T95 完成 → 未在本盘点做。
6. 书面说明：倾诉未开启，V2 作为开启条件 → 本治理 PR 写入账本；**须同时写清已购陪伴宽屏例外**，否则说明不诚实。

## 5. 不做

- 不翻 `CONFIDE_USER_MOUNT_ENABLED`
- 不修沉思问询死路（另开修复，建议与 R2L-02 分开）
- 不把 V2 写成已通过
