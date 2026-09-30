# Task Brief · 同坐中暂停与加时

> **状态**：PO 2026-09-30 书面「写 Brief 以及开发」。暂停和中途加时都要有按钮，并有语音。本文件即该次点头。

## 已拍板

| 项 | 口径 |
|---|---|
| 位置 | 专注进行中，左上计时器下方。不放在 Rise 旁边。 |
| 暂停 | 按钮 Pause。再点 Resume。只停住这一场的计时。不播放起身，不打开回想，不庆祝。 |
| 加时 | 按钮 Add 5 min。只加在有固定时长的同坐上。上限 90 分钟。不限时同坐不显示这个按钮。 |
| 语音 | 英语界面、电脑宽屏，按钮旁麦克风。句式：`Pause` / `Pause the timer` / `Pause this sit` / `Resume` / `Resume the timer` / `Add five minutes` / `Add 5 minutes` / `Add ten minutes` / `Add 10 minutes`。 |
| 结束 | 仍走已有 Rise，以及 Rise 旁「我坐完了」的麦克风。调整麦克风听到结束句，只提示去用 Rise。 |
| 离开页面 | 场景 E 的墙钟不因切走而暂停。这里的暂停必须是用户自己点或说。 |

## 点击后 0–1 秒

点 Pause：按钮立刻变成 Resume，并出现 “Paused. The clock is holding.”  
点 Resume：按钮回到 Pause，并出现 “Sitting again.”  
点 Add 5 min：出现 “Added 5 minutes…”；若已是 90 分钟，出现 “This sit is already 90 minutes.”  
不在白名单里的静默视为 bug。

## 冲突扫描

对照场景 C（Rise 未达标结束）、场景 E（切走不计暂停）、场景 X（点阿寅计时继续）、场景 T（开表前语音只负责开始）。暂停不调用 Rise。加时不重开一场。

## 共用机制核对

左上 HUD 的本场时间读 `FocusSession` 经过秒数；用户暂停会停住这个钟。overlay 呼吸驱动与 z≥17 遮罩不新增消费者。本次不新建可点击叠层，按钮留在既有 `#ui-overlay` 里。
