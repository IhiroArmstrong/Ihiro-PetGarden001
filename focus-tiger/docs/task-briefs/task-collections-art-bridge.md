# Task Brief · 珍藏第一次得到器物后的艺术品入口

> **状态（2026-10-08）**：PO 书面同意并口令「立刻开工」。  
> **目的**：第一次在阿寅的珍藏里真正得到一件器物时，在那次成功卡上出现一句安静的英文。可以关掉。旁边的按钮打开 Yin's Art Collection。第二次、第三次不再出现。

## 产品契约

| 项 | 口径 |
|---|---|
| 时机 | 结缘成功，且本机还没看过这句。称号类器物没有原有的仪式卡时，第一次也用同一张成功卡。 |
| 句子 | If you enjoy pieces like this, more digital artworks are in Yin's Art Collection. You can open it here. |
| 按钮 | Open Yin's Art Collection。点后打开现有艺术品面板。 |
| 关掉 | Close。关掉后不再自动弹出。 |
| 次数 | 一出现就记下。以后再得到器物，不再出现这句。 |
| 不混 | 不写进珍藏列表，不改「这不是商店」。不说 collectible，不说「更多同样的这些」。 |

日文界面用同一句的日文，避免语言包缺键。英文界面用上面这句原文。

## 不做

- 每次打开珍藏都挂一条。
- 请茶谢礼后再提示。
- 把珍藏器物说成可以购买。

## 共用机制核对

本次不新建叠层，句子留在已有 `#yin-coin-panel` 成功卡内（z=18）。不改 overlayBusy、不改 HUD 呼吸驱动、不改 z≥17 遮罩 dim。点开艺术品沿用已有 `#art-collection-panel`。本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

## 点击后 0–1 秒

- **Open Yin's Art Collection**：按钮按下略缩，随后珍藏面板收起，Yin's Art Collection 打开。
- **Close**：成功卡立刻收起。
- 结缘本身仍是本机记账，没有挂起态。失败时不出现这张卡。

## 冲突扫描

对照场景 AC（Yin's Collections 抽屉：不是商店）。提示不进商店列表，只在第一次成功卡上，并打开另一个面板。职责不并进同一入口。
