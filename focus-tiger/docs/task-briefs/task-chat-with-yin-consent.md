# Task Brief · Chat with Yin 改名 + 首次强制同意

> **Class:** B（用户可见名称、打开倾诉路由前的强制勾选）。  
> **Status:** PO locked 2026-11-15（「按这份开工」）。  
> **指令全文：** 仓库根目录 `chat-with-yin-consent-instructions.md`（实现旁支以本 Brief 为准）。

## Done line

1. 英文可见名 **Chat with Yin**，日文 **寅と話す**，中文仍 **向阿寅倾诉**。代码标识符与 `data-testid` 不改。Help Center / 说明书短答同步英文名。  
2. 首次打开须三项分开勾选后才能聊天；本机键 `focus-tiger.confide-consent.v1`；不进练习备份；无云端用户表。  
3. 日语入口继续隐藏；同意代码三语齐全。不替代 safety-01 / T14 / Wellness 卡。

## Variant matrix (A10)

| 变体 | 预期 |
|---|---|
| en Idle 首次 | 同意框；未勾全不可发送 |
| 勾全确认 | 写盘成功后可聊 |
| 暂不使用 / Esc | 离开、无记录 |
| ja UI | 入口仍隐；文案可单测 |
| zh | 产品名仍「向阿寅倾诉」 |

## Click / edges (A14)

打开入口 0–1s 见同意框。未勾全点确认见红字。勾全见输入。写盘失败可见错误可重试。

Payment / Sit vs Breath: **skip** — 本刀不加商品或练习种类。

## Shared overlay

同意层在 `#confide-to-yin-card` 内，不新开全局 z，不碰 `#yin-support-modal`。
