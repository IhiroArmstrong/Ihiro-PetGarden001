# 成长旅程详情

> **状态**：已开工 · 2026-10-09 PO 书面「按这份说明开工」  
> **依据**：[`GROWTH_JOURNEY.md`](../GROWTH_JOURNEY.md) 详情 · [`GROWTH_JOURNEY_IMPLEMENTATION.md`](../GROWTH_JOURNEY_IMPLEMENTATION.md) 第 4 节

点左下热力簇上面那一行，一秒内打开一张安静的纸，停在下半屏，不盖住阿寅的脸。Esc 或点纸外面关掉。开始专注时先收起。热力格子仍然不能点。

纸上是一条横线，五个阶段名，一个圆点，旁边「你在这里」。圆点与首页短轨迹同一套。不写百分比。线下面用现有的下一小步；融入不写下一小步。累计时间用真实分钟，可以是 0。不写近九十天来过几天，不写练了几次。节奏用已记下的练习日画点；空档标「歇过 / paused」；空档后再练标「你回来了 / You returned」。阿寅那句「你又回来了」不印在这张纸上。

不涉及后台网络。

## 共用机制核对

本次新增只读叠层 `GrowthJourneyDetailUI`，挂在与旅程记录同类的玻璃卡上（`derive`，`#growth-journey-detail`，z 18；遮罩 z 17）。没有写入，`mutationFeedback` 三键均为 `na`。打开时 `growthJourneyDetailOpen` 计入 sceneAnim overlayBusy（`blocksEnterSleep`），切语问候会被它挡住，与 Journey Log 相同，不另开 language 式例外。遮罩走 `overlayBackdrop` 默认 dim：Support FAB、Ambient 静音、倾听耳变暗仍可点；`?` 与软更新芯片不新列入 dim。
