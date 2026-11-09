# Task Brief · 方案 A 选项 1：安装包前已购也不开倾诉，评审通过前不售陪伴加购

> **状态（2026-11-09）**：**待点头**。点头前不改 `focus-tiger/src`。  
> **类**：**B**。会改客人能不能看见倾诉，以及 Support 里能不能买陪伴加购。  
> **基线**：`origin/develop@ead9213d`。倾诉产品挂载 `CONFIDE_USER_MOUNT_ENABLED` 仍是 false。  
> **依据**：T98（倾诉默认关闭时的入口盘点）[`audit/findings/2026-11-08/confide-mount-off-entry-inventory.md`](../audit/findings/2026-11-08/confide-mount-off-entry-inventory.md)。该盘点已合 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633)。  
> **PO 书面（2026-11-09）**：第一份安装包发出前，已经买了陪伴的人也不开倾诉；倾诉评审（V2）通过前，不售陪伴加购。  
> **实现**：点头后另开旁支，用 Composer 2.5 改代码。不要叠在死路修复 [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) 上。

## 一句话目标

挂载仍关着的时候，付过钱也不能打开倾诉；没买过的陪伴加购不再出现可购买的第五卡。已经买过的第五卡留下，变淡，不能再付款。

## 现在的地面事实

对照 `origin/develop` 上的代码，不是对照术语表措辞：

- `canOpenConfidePanel` 在 `companionGeneration === true` 且安全语料通过时，**即使挂载是 false 也返回 true**（`confideUserVisibilityGate.js`）。
- 宽屏菜单在 `companionGeneration` 为真时仍插入倾诉行（`idleChromeOrchestration.js`），测试名就叫「挂载关着也显示」。
- `isCompanionEntitled` 为真的条件是：Pro 订阅有效，或终身陪伴加购有效，或实验室参数 `?companionEntitled=1` / `?entitlementMock=pro`。它只表示「账上有陪伴」，**本 Brief 不改这个函数的真假**。
- 第五卡：已买圣所终身、且不是 Pro 时，`showAddon === true`。没买加购时按钮仍可结账；买完后卡片留下并淡化（`supportPaidCardPresentation.js`）。
- 第四卡 Pro 文案现在写成「另加桌面端本机倾诉」。第五卡文案写成「一次性解锁本机阿寅」。网页底注写成解锁后可以在电脑上倾诉。

T98 写过：若对外说「安装包用户进不了倾诉」，对已购宽屏不成立。本决定把那条例外收掉。术语表仍写「已购陪伴宽屏仍可开倾诉」——那是盘点当时的事实，**本 Brief 与实现旁支都不改术语表**。改账本另开治理文档。

## 范围（in）

- 挂载为 false 时，`companionGeneration` **不能**再让 `canOpenConfidePanel` / 倾听耳 / 宽屏倾诉行变成可开。安全语料仍须通过；阶段仍须是 idle。
- 未购陪伴加购：第五卡不出现，不能新开加购结账。
- 已购陪伴加购：第五卡仍在，淡化，按钮不可点，不能再开 Stripe。本地已购记录保留，不撤销。
- 第四卡 Pro **继续可结账**（见下方「我认为最合理的」）。三语说明改成：会员进阶层还在；本机倾诉现在不对客人打开，买了也不会出现倾诉入口。
- 网页底注同样改成「现在还没对客人打开」，不再写「解锁后就能倾诉」。
- 新句子写 `src/locales/slices/` 一片（en / zh / ja 同键），覆盖总账旧键。不改 `en.json` / `zh.json` / `ja.json`。
- 实验室 `?confide=1` 在 idle 仍可打开面板。这不是对客入口。
- 同一实现旁支改下面会红的测试预期，并改 `SCENARIO_TESTS.md` 里「终身后第五卡可点」「已购宽屏出现倾诉行」的对应句子。

## 范围（out）

- 不把 `CONFIDE_USER_MOUNT_ENABLED` 改成 true。不宣布评审已通过。
- 不改 `isCompanionEntitled` 的购买判断，不删已购缓存，不做退款。
- 不修沉思问询「想聊聊」点了没面板。那是死路，留在 [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637)。本旁支不包含那笔提交。
- 不改第四卡与第五卡「已是 Pro 则不显示加购卡」的互斥。
- 不改 Support 按钮层级、遮罩、玻璃卡 z-index，不给 Support 模态写 inline z-index。
- 不改术语表、任务总表、问题账本已有行。
- 不新开后台下载或别的网络请求。

## 第四卡：本 Brief 锁的做法

第四卡多出来的价钱，主要就是「本机倾诉」。倾诉对已购也不开，所以文案不能再说现在就能用。

**我认为最合理的是：第四卡继续卖，文案改诚实。** 你这次只拍了「不售陪伴加购」（第五卡）。第四卡还带着会员进阶层，整张下架会把没买终身的人的 Pro 入口一起收掉，超出这次决定。

较弱的做法：第四卡也先下架，直到评审通过。只有你书面改口时才这么做。点头「按这份 Brief 开工」= 按上一段，第四卡仍可结账。

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 网页，未买终身，未买 Pro | Support | 见第四卡，不见第五卡。第四卡文案不说现在能倾诉。点第四卡仍走现有结账（0–1 秒内按钮不可再点，随后离开去付款） | `supportPaidCardPresentation.test.js`；付款契约 |
| 网页或电脑，已买终身，未买加购 | Support | 圣所卡淡化。第五卡不出现。没有加购结账 | 同上；预期从「出现可点第五卡」改为「不出现」 |
| 已买加购 | Support | 第五卡仍在、淡化、按钮不可点。文案说明购买还在，倾诉入口还没对客人打开。点按钮不开 Stripe | 已有淡化测试保留；文案片 |
| 已买 Pro | 宽屏电脑，无 `?confide=1` | 账上仍算已购陪伴。菜单、耳朵、面板都不出现倾诉 | `confideUserVisibilityGate.test.js` · `desktopCompanionL1.test.js` |
| 已买加购 | 同上 | 同上。已购不等于能开 | 同上 |
| 宽屏电脑，生成层为真，挂载 false | Idle ⋯ | 没有倾诉行 | `desktopCompanionL1.test.js` · `idleChromeOrchestration.test.js` |
| 窄屏 | 抽屉 | 仍没有桌面倾诉行 | 现有窄屏测试保持 |
| `?confide=1`，idle | 实验室 | 面板可以打开 | 现有 harness 测试保持 |
| `?confide=1`，专注中 | 实验室 | 仍不能开 | 现有测试保持 |
| `?companionEntitled=1` 且没有 `?confide=1` | 实验室 | 账上算已购，对客入口仍不开 | 本刀补一条闸门测试 |
| en / zh / ja | 第四卡、已购第五卡、网页底注 | 同一含义。日文不留英文原句 | 文案片；`npm run locale:slices` |
| 请茶 / 会员 / 圣所 | Support | 结账与已购淡化与现在相同 | 付款契约必须仍绿 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 未购第五卡 | 没有这张卡，点不到 | — |
| 已购第五卡按钮 | 按钮不可点，不跳转付款 | 不写新的购买 |
| 第四卡未购按钮 | 与现在相同：按下后按钮不可再点，然后去结账 | 成功 / 失败仍走现有 Pro 回跳，本刀不改 |
| 倾诉菜单行、倾听耳 | 挂载关着时不渲染，没有可点的空按钮 | — |
| 实验室 `?confide=1` | 与现在相同，idle 打开面板 | — |

按设计点不到的入口是「不画出来」，不是点了没反应。不新增静默白名单条目。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 已买加购 | 卡留下、淡化、不能再付款。购买记录还在 |
| 已买 Pro | 第四卡按现有规则隐藏（已购不再卖第二次）。倾诉仍不开 |
| 已买终身且已是 Pro | 仍不显示第五卡（现有互斥）。不新开加购结账 |
| 加购付款已经发生、人还在回跳页 | 允许把这笔已经付的记成已购并淡化。禁止从卡上再开一笔新结账 |
| 窄屏 / 低配 / 网页 | 本来就没有桌面倾诉行。保持 |
| 专注中、到来、有其它遮罩 | 即使实验室参数在，也不能开。保持 |
| 安全语料不通过 | 不能开。保持 |
| 三语 | 不出现「即将开放」「限时」这类催促 |

## 共用机制核对

本次不新建可点击叠层，不改 Support 模态的样式表层（大卡保持登记表上的层级，不得写成 inline）。不触及 overlayBusy，不触及 HUD 呼吸驱动。Support 右上按钮、遮罩、请茶、会员、圣所、第四卡的点击目标不改层级。第五卡只改未购时是否出现、已购时是否仍淡化且不能再结账。

## 受保护付款路径

第五卡是受保护路径：`#yin-support-companion-addon-card`、`[data-testid=yin-support-companion-addon-cta]`、结账 `/api/create-companion-addon-checkout-session`。

- 作用于：这张卡的显示，以及「未购不得新开结账」。
- 包含受保护路径：是。
- 排除：不改右上 Support 按钮、不改遮罩、不改第四卡结账函数、不改已购淡化的禁用规则、不改 z-index。

实现旁支完成前须跑 `cd focus-tiger && npm run test:payment-contract`。没跑或失败，不得写成已修好。

## 不涉及后台网络

不新增自动请求。少掉的是客人点第五卡才会发生的结账。已付回跳确认沿用现有路径。

## 冲突扫描

对照了 Support 付款场景（终身之后第五卡出现并可点，直到买完才淡化；网页有本地陪伴说明）和桌面宽屏倾诉行（生成层开着就出现，即使挂载关着）。

- 强度：少一张可购买的卡、少一行菜单。没有比恢复练习更重的新步骤。
- 语气：说明只陈述「现在不对客人打开」。不责备、不催买。
- 职责：付钱买陪伴，和「倾诉对客人开着」，不再写成同一件事。这和现在的场景句子相反。你已在 2026-11-09 决定收掉例外。实现旁支改那些场景句子。本 Brief 文件不改 `SCENARIO_TESTS.md`。

不新开倾诉面板，所以不改睡觉时打开倾诉要不要叫醒。那条仍留给真正打开倾诉的时候。

## 实现时预期会变的测试

点头后的代码旁支至少改这些预期（撤掉「已购 / 生成层可以在挂载关时打开」就会红，红了才算锁住）：

- `confideUserVisibilityGate.test.js`：`companionGeneration: true`、挂载 false、idle、安全语料通过 → 改为不能开。耳朵显隐与它一致。`CONFIDE_USER_MOUNT_ENABLED === false` 与 `?confide=1` 的用例保持。
- `desktopCompanionL1.test.js`：标题为挂载关闭仍显示倾诉行的用例，改为不显示；「生成层在 idle 能开」改为不能开。专注中、安全语料失败、窄屏不漏行，保持。
- `idleChromeOrchestration.test.js`：「desktop companionGeneration shows Confide on wide-more only」在挂载 false 时改为宽屏也不显示该行。
- `supportPaidCardPresentation.test.js`：已买终身但 `addonActive` 不是 true → `showAddon === false`。已买加购 → 仍 `showAddon === true` 且淡化。

若付款契约或菜单契约还断言「未购加购卡可点」，同一旁支改掉，不另开 PR。

## 冲突与死路

- 无同内容的实现 PR。盘点 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633) 已合，那是只读，不是这一刀。
- [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) 仍开着，只处理「点了想聊聊但倾诉开不了」的提示。禁止把那笔提交 cherry-pick 进本旁支，也禁止在本旁支里顺手做那个提示。
