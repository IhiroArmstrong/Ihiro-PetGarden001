# Task Brief · T45 静坐画面

> **状态（2026-10-23）**：PO 书面同意「无声场」落地走已排队的 T39 / T45 / T47；**T39 代码已合 #1393**。本刀是三刀里**第二刀**（藏跳动数字）。点头前 **禁止**改 `src/`。  
> **类**：**B**（坐下后屏幕上不再一直跳分秒）。  
> **代号**：**T45**（电脑版十二条对照 #4 · 执行序 8）。  
> **拍板句**（[`GLOSSARY.md`](../GLOSSARY.md) 不得改口）：无尽坐留给不想看压力的人。另做「静坐画面」：老虎在、时间在后台跑，结束用系统通知或老虎轻轻动一下，屏幕上不一直跳数字。不另加「是否显示时间」开关。  
> **不是**：T47（收控件）、T44（空格 / 快捷键 / 系统通知实现）、T39（铃）、T50（影子摘要）、再加看表开关。

## 一句话

定时坐下时，阿寅还在，表还在走，屏幕上不再跳 `MM:SS`。坐完用现成的轻量完成动作告诉你到了。不想被分钟压着的人，继续用无尽坐。

## 地面真相（`origin/develop` · 2026-10-23 · behind 以开工 Chat 再跑 freshness）

1. 左上 `#focus-hud` 在 Focusing 时 **可见**（可见性契约 `focusing-focus-hud-visible`）。`#hud-time` 每秒改字；注释写「Digits muted until hover」，DOM 仍在走。  
2. 固定时长走倒计时语义；桌面 Open-ended 走正计时 + 目标行「不限时长」。Web **没有** Open-ended chip。  
3. HUD 金环 / 同坐条 / 连胜点仍在；`SHARED_RESOURCES` §4.2 要求主循环继续推 elapsed（**本刀藏可见数字，不拆驱动**）。  
4. 达标已有 `Celebrating`（当日首次）或 `SessionComplete`（同日后续）。Rise 未达标走既有收尾。系统通知 **现网没有**（T44 排队中）。  
5. T50 Brief 写「倒计时照旧」只约束 **T50 旁支不得改 HUD**；不是禁止本刀做无声场。

## 已经定下的做法

1. **范围。** 正式 `FocusSession` 计时同坐（含 Breath 共用这场会话、含桌面 Open-ended）。微仪式 / 进阶仪式 overlay 的 HUD **不改**。  
2. **可见数字。** Focusing 期间 `#hud-time`、`#hud-session-target` 里的分秒、`#hud-level` 百分数 **视觉隐藏**。金环、同坐条、状态词（如 Focusing）可留。禁止悬停再把跳动数字露出来（那仍是看表）。  
3. **后台仍跑。** `FocusSession` elapsed / 达标 / 暂停 / 休眠扣除 / 24h 封顶 **一字不改**。`#hud-time` 可继续写 DOM（给 e2e / 读屏用 `aria-hidden` 或等价：读屏也不得每秒报时）。  
4. **不新开关。** 禁止 Preferences / Soundscape / HUD 上出现「是否显示时间」。想看压力用无尽坐；想看结束结果用 Reflection / 完成反馈。  
5. **无尽坐保留。** Open-ended chip、90 分钟 / 3 小时温和提示、24h 自动结束 **保留**。正计时数字同样藏。  
6. **结束怎么知道。** 本刀 **不实现** 系统通知（留给 T44）。达标走现网 `Celebrating` / `SessionComplete`（老虎轻轻动一下）。未达标 Rise：现网收尾，不新造动效。  
7. **文案。** 不写「为你关掉了时钟」推销句。  
8. **实现时登记** `SILENT_BEHAVIORS` **SB-20**：Focusing 期间分秒视觉不跳 = 有意静默，不是 HUD 坏了。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Web 固定 10/15/25/45 | Sit → Focusing | 金环可在；不见跳动 `MM:SS`；表仍会在目标分钟达标 | 单测：Focusing live view 数字 `hidden`；e2e：`#hud-time` 不可见但仍 focusing |
| Electron 同上 | 同左 | 同左 | 同左 |
| Electron Open-ended | 桌面 chip | 正计时数字同样藏；目标「不限时长」也不作为跳动秒；90m/3h 提示仍可出 | 现有 nudge 测保留；补「数字 hidden」 |
| Breath 短档 | 左球 Breath | 与 Focusing 同一场 HUD 规则 | 与 Focus 同一 pref/HUD |
| 窄屏 375 | Focusing | HUD 仍在契约位置，只藏数字 | 现有 `375 Focusing restores FocusHUD` 改为「HUD 根可见、time 不可见」 |
| 宽屏 | 同左 | 无视口分叉 | 记「无分叉」 |
| 当日首次达标 | 坐满 | `Celebrating`，无结束铃依赖（T39 已关默认铃） | 不改情绪键 |
| 同日第二场达标 | 坐满 | `SessionComplete`（SB-09） | 不改 |
| Rise 早退 | 中途 | 现网未完成收尾；仍无补结束铃 | 不改 Rise 语义 |
| 微仪式 breath | overlay | **数字规则不套用** | 现有 ritual HUD 测不变 |
| 多语言 | en / ja（zh draft） | 无新句；隐藏与 locale 无关 | 跳过文案 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| Sit / 模式点选 | 与现网相同进入 Focusing；差别只是随后不见跳秒 | 不因本刀写盘 |
| Rise | 0–1s 内仍是 Rise 收尾（按钮本身由 T47 管显隐；本刀不藏 Rise） | 不因本刀写盘 |
| HUD 悬停 | **不得**把 `MM:SS` 露出来 | — |

本次不新增可点击控件。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 无 localStorage | 仍藏数字（不是偏好） |
| 暂停 / 休眠 | 时长规则现网；恢复后仍藏数字 |
| Open-ended 24h 封顶 | 仍自动结束 + 完成动作 |
| 读屏 | 不得每秒朗读剩余/已经过秒 |
| 付款 / Support | 不触及 |
| T44 未做 | 无系统通知；完成靠老虎轻动。禁止本刀私接 `Notification` |
| T50 影子 | 可继续记 `actualSeconds`；不依赖可见数字 |

## 冲突扫描（`SCENARIO_TESTS.md`）

| 轴 | 判断 |
|---|---|
| 强度 | 少看表，比催促弱。结束仍有完成动作，不是把达标吞掉。 |
| 语气 | 不新增「你不该看表」文案。 |
| 职责 | 只藏正式同坐的跳动数字。不抢 T47 chrome、不抢 T44 通知、不抢 T50 影子、不改无尽坐入口。 |

相邻：场景 A/C HUD 在计时、场景 O Focusing 仍见 HUD 根、Open-ended TRACKER 行。无未决冲突。

## 共用机制核对

- **HUD 呼吸驱动（§4.2）**：正式 Focus 会话仍由既有主循环推 elapsed；本刀只改 **可见性**。微仪式 / RitualFlow → `overlayBreathing` **不改接线**。核对后：左上角根节点仍在 Focusing 出现；秒数走动改为对测试/内部，不对用户眼睛。  
- **overlayBusy**：不新增叠层；无例外要改。  
- **z≥17 遮罩**：不新增 dim。FocusHUD 层叠不改。  
- **新建可点击叠层**：无。  
- 后台网络：不涉及。受保护付款路径：**否**。

## 范围（out）

- 不实现 T47 / T44 / T39（已合）。  
- 不改金光呼吸物理、不改情绪序列。  
- 不加「显示时间」开关、不做悬停看表。  
- 不把 Open-ended 从桌面扩到 Web。

## 验收

- `cd focus-tiger && npm run test:smoke`（含 HUD live 数字 hidden + elapsed 仍增）。  
- 单条 e2e：改断言「Focusing 时 `#focus-hud` 可见且 `#hud-time` 不可见」；Open-ended 有入口则同断言。  
- 手测：Sit 25 分档 → 不见跳秒 → 坐满见完成动作。桌面 Open-ended → 不见正计时跳秒，90m 预览提示仍可出。Rise 中途仍可起身。

## 点头后开工

新 Chat · 旁支 `feature/t45-sitting-picture` · 基线 `origin/develop`。口令：「按 T45 Brief 开工」。可与 T47 **分 PR**；建议 T45 先合（数字），再合 T47（控件），避免同一 HUD/chrome 文件互抢。
