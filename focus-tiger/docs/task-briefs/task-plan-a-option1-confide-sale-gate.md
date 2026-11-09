# Task Brief · 方案 A 选项 1：安装包前已购也不开倾诉，评审通过前不售 Pro / 陪伴加购

> **状态（2026-11-09）**：**已点头** — PO 书面：**第四卡（Pro）与第五卡（Lifetime 陪伴加购）均不再开新结账**；已订阅 / 已购记录保留，不撤销，不做自动退款。点头前不改 `focus-tiger/src`；点头后按下方「交付顺序」开实现旁支。  
> **类**：**B**。会改客人能不能看见倾诉，以及 Support 里能不能买 Pro / 陪伴加购。  
> **基线**：`origin/develop@c93f657f`（含 [#1639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1639) Brief 初稿、[#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) 已合）。倾诉产品挂载 `CONFIDE_USER_MOUNT_ENABLED` 仍是 false。  
> **依据**：T98（倾诉默认关闭时的入口盘点）[`audit/findings/2026-11-08/confide-mount-off-entry-inventory.md`](../audit/findings/2026-11-08/confide-mount-off-entry-inventory.md)。该盘点已合 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633)。  
> **PO 书面（2026-11-09）**：第一份安装包发出前，已经买了陪伴的人也不开倾诉；倾诉评审（V2）通过前，不售 Pro 与陪伴加购（**新结账**关闭）。  
> **实现**：点头后另开旁支，用 Composer 2.5 改代码。**[#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) 已合 develop**（「想聊聊」死路 T92 提示）；本旁支不得再 cherry-pick 或重复那笔 diff。

## 一句话目标

挂载仍关着的时候，付过钱也不能打开倾诉；没买过的 **Pro（第四卡）与陪伴加购（第五卡）** 不再出现可新开的结账。已经买过的卡留下、变淡，不能再付款。服务端与安装包不得用旧接口或 URL 参数绕过。

## 现在的地面事实

对照 **当前** `origin/develop` 上的代码，不是对照术语表措辞：

- `canOpenConfidePanel` 在 `companionGeneration === true` 且安全语料通过时，**即使挂载是 false 也返回 true**（`confideUserVisibilityGate.js`）。
- 宽屏菜单在 `companionGeneration` 为真时仍插入倾诉行（`idleChromeOrchestration.js`），测试名就叫「挂载关着也显示」。
- `isCompanionEntitled` 为真的条件是：Pro 订阅有效，或终身陪伴加购有效，或实验室参数 `?companionEntitled=1` / `?entitlementMock=pro`。它只表示「账上有陪伴」，**本 Brief 不改这个函数的购买判断逻辑**；但须在 **生产构建** 禁用 URL 参数伪造（见下文「生产构建 · QA 参数」）。
- 第五卡：已买圣所终身、且不是 Pro 时，`showAddon === true`。没买加购时按钮仍可结账；买完后卡片留下并淡化（`supportPaidCardPresentation.js`）。
- 第四卡 Pro 文案现在写成「另加桌面端本机倾诉」。第五卡文案写成「一次性解锁本机阿寅」。网页底注写成解锁后可以在电脑上倾诉。
- Worker 仍暴露 `POST /api/create-pro-checkout-session` 与 `POST /api/create-companion-addon-checkout-session`；仅藏 UI 不够，旧客户端或脚本可直连。

T98 写过：若对外说「安装包用户进不了倾诉」，对已购宽屏不成立。本决定把那条例外收掉。术语表仍写「已购陪伴宽屏仍可开倾诉」——那是盘点当时的事实，**本 Brief 与实现旁支都不改术语表**。实现合并后须**另开治理 docs PR** 更正该句（见「交付顺序」）。

## 已购与 Stripe 核对（Brief 政策输入）

**政策（本 Brief）**：不撤销本地 / 云端已购记录；**本刀不做自动退款**。若 Live 出现非零笔数，Support 口径与（若需要）法务确认退款渠道由 PO 在合实现前拍板；**当前侧面证据支持按「零笔或极低」写法起草**。

| 来源 | 2026-11-09 结果 | 说明 |
|---|---|---|
| 生产 `SANCTUARY_KV` 前缀 `companion-addon:` | **0** 键 | `wrangler kv key list` · 加购 confirm/webhook 邮箱索引 |
| 生产 `MEMBERSHIP_KV` 前缀 `membership:` | **0** 键 | 含 `confirm-pro-session` 写入的 Pro 订阅索引 |
| Stripe Dashboard **Live** / Stripe CLI | **本机 CLI 无 API key**（`~/.config/stripe/config.toml` 未写入 test_mode_key / live_mode_key） | PO 须在终端完成 `stripe login` 或 Dashboard 核对 Price **`price_1U6EB1FuIhgJPGLiuciuX1to`**（Pro）、**`price_1U6GnXFuIhgJPGLiNlXs0IKe`**（加购）之 **paid** Checkout |

Tracker 里第四 / 五卡人工验收多写 **Stripe Test**；KV 为零不代表 Dashboard Live 绝对为零，但实现旁支可按「无已知 Live 加购 KV 行」写已购边缘状态。

## 范围（in）

- 挂载为 false 时，`companionGeneration` **不能**再让 `canOpenConfidePanel` / 倾听耳 / 宽屏倾诉行变成可开。安全语料仍须通过；阶段仍须是 idle。
- **未购** Pro：**不出现可新开的第四卡结账**（不出现可点 CTA，或根本不渲染可购第四卡——实现二选一，须与 `npm run test:payment-contract` 一致）。
- **未购** 陪伴加购：第五卡不出现，不能新开加购结账。
- **已购** Pro / 已购陪伴加购：对应卡仍在、淡化、按钮不可点，不能再开 Stripe；本地已购记录保留，不撤销。
- 第四卡、第五卡、网页底注及 **文案全盘**（见下）：三语说明倾诉**现在不对客人打开**；不出现「解锁即可倾诉」「另加本机倾诉可立即使用」等承诺。
- 新句子写 `src/locales/slices/` 一片（en / zh / ja 同键），覆盖总账旧键。不改 `en.json` / `zh.json` / `ja.json`。
- **服务端关闸**：`POST /api/create-pro-checkout-session` 与 `POST /api/create-companion-addon-checkout-session` 在闸门开启时返回 **410**（或项目内与 `practiceBackupWritesDisabled` 同形的统一 JSON），文案对客诚实（暂未开放售卖）。**须 redeploy Worker** 后才算生效。
- **生产构建 · QA 参数**：`?confide=1`、`?companionEntitled=1`、`?entitlementMock=pro`（及文档列出的相关 mock）在 **非开发构建** 必须**不生效**（不得借此开面板或伪造 Pro）。开发 / `MODE=development` / Playwright 开发构建可保留。须核实桌面结账深链 **`focus-tiger://app`**（及现有 `navigateDesktopCheckoutReturn` 路径）**不得**把上述 query 带进可发布安装包。实现旁支加单测或 e2e：**生产构建**下带这些 query 仍不能开倾诉 / 不能伪造 entitlement。
- 实验室（仅开发构建）：`?confide=1` 在 idle 仍可打开面板。这不是对客入口。
- **求助出口**：倾诉对客人全关后，**T14 倾诉卡内常驻求助链无人可见**；客人危机出口依赖 [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637)「想聊聊」toast（**T92 求助句**）与语音等——实现前抽样核对 en/zh/ja 为 T92 文案，不单依赖 Ledger 旧描述。
- 同一实现旁支改下面会红的测试预期，并改 `SCENARIO_TESTS.md` 里「终身后第五卡可点」「已购宽屏出现倾诉行」「未购可点 Pro」等句子。

### 文案全盘（实现旁支必做检索）

除第四卡、第五卡、Support 网页底注外，**检索**（rg / 审计脚本）所有客人可见面：隐私页、产品简介卡、帮助中心切片、官网 / 营销静态页、商店说明（若有）。任何语言不得仍承诺「现已可倾诉 / local AI chat 已开放」。命中清单贴实现 PR；本 Brief 不逐条枚举。

## 范围（out）

- 不把 `CONFIDE_USER_MOUNT_ENABLED` 改成 true。不宣布评审已通过。
- 不改 `isCompanionEntitled` 的**购买记录**读写语义，不删已购缓存，不做自动退款。
- 不重做 [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637)（已合）；本旁支不改 T92 toast 逻辑，除非付款契约强制。
- 不改第四卡与第五卡「已是 Pro 则不显示加购卡」的互斥。
- 不改 Support 按钮层级、遮罩、玻璃卡 z-index，不给 Support 模态写 inline z-index。
- 不改术语表、任务总表、问题账本已有行（**治理 PR 另开**）。
- 不新开后台下载或别的网络请求（410 路由不算新下载）。

## 第四卡与第五卡：PO 锁定（2026-11-09）

两卡溢价核心都关联「本机倾诉」。倾诉对已购也不开，**继续按原价卖新单**在欧美合规与客诉上风险高；**停新结账可逆**，已卖难收回。

| 卡 | 新结账 | 已购 |
|---|---|---|
| 第四卡 Pro | **关闭** | 记录保留；卡按现有已购规则隐藏或淡化；**Stripe 订阅账单不由本刀取消** |
| 第五卡 陪伴加购 | **关闭** | 卡保留、淡化、不可再付 |

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 网页，未买终身，未买 Pro | Support | **不见可新开 Pro 的第四卡**（或见卡但 CTA 不可点且不调 checkout API）。不见第五卡。无「现在能倾诉」文案 | `supportPaidCardPresentation.test.js`；付款契约 |
| 网页或电脑，已买终身，未买加购 | Support | 圣所卡淡化。第五卡不出现。没有加购结账 | 同上 |
| 已买加购 | Support | 第五卡仍在、淡化、按钮不可点。文案说明购买还在，倾诉入口还没对客人打开。点按钮不开 Stripe | 已有淡化测试；文案片 |
| 已买 Pro | 宽屏电脑，无 harness query | 账上仍算已购陪伴。菜单、耳朵、面板都不出现倾诉 | `confideUserVisibilityGate.test.js` · `desktopCompanionL1.test.js` |
| 已买加购 | 同上 | 同上。已购不等于能开 | 同上 |
| 宽屏电脑，生成层为真，挂载 false | Idle ⋯ | 没有倾诉行 | `desktopCompanionL1.test.js` · `idleChromeOrchestration.test.js` |
| 窄屏 | 抽屉 | 仍没有桌面倾诉行 | 现有窄屏测试保持 |
| `?confide=1`，idle | **仅开发构建** | 面板可以打开 | harness 测试保持 |
| `?confide=1`，**生产构建** | idle | **不**因 query 开面板 | **本刀新增** |
| `?companionEntitled=1` / `?entitlementMock=pro`，**生产构建** | 无 `?confide=1` | 不伪造已购、不开客人倾诉入口 | **本刀新增** |
| 直连 Worker | `POST create-pro` / `create-companion-addon` | **410**（部署后） | cloud 路由单测 |
| en / zh / ja | 第四卡、已购第五卡、网页底注、求助相关 | 同一含义；日文不留英文原句 | 文案片；`npm run locale:slices` |
| 请茶 / 会员 / 圣所 | Support | 结账与已购淡化与现在相同 | 付款契约必须仍绿 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 未购第五卡 | 没有这张卡，点不到 | — |
| 未购第四卡 Pro | 没有可购第四卡，点不到 | — |
| 已购第五卡按钮 | 按钮不可点，不跳转付款 | 不写新的购买 |
| 已购第四卡 | 按现有已购 Pro 规则（隐藏或淡化），不跳转新结账 | — |
| 倾诉菜单行、倾听耳 | 挂载关着时不渲染，没有可点的空按钮 | — |
| 实验室 `?confide=1`（开发构建） | 与现在相同，idle 打开面板 | — |

按设计点不到的入口是「不画出来」，不是点了没反应。不新增静默白名单条目。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 已买加购 | 卡留下、淡化、不能再付款。购买记录还在 |
| 已买 Pro | 第四卡按现有规则隐藏（已购不再卖第二次）。倾诉仍不开；**订阅续费仍由 Stripe 处理** |
| 已买终身且已是 Pro | 仍不显示第五卡（现有互斥）。不新开加购结账 |
| 加购 / Pro 付款已在进行、人还在回跳页 | 允许把**已完成**的 session 记成已购并淡化。禁止从 Support 再开**新** checkout |
| 旧版客户端调 checkout API | Worker **410**，无 Stripe URL |
| 窄屏 / 低配 / 网页 | 本来就没有桌面倾诉行。保持 |
| 专注中、到来、有其它遮罩 | 即使开发 harness，生产构建也不能开。保持 |
| 安全语料不通过 | 不能开。保持 |
| 三语 | 不出现「即将开放」「限时」这类催促 |

## 共用机制核对

本次不新建可点击叠层，不改 Support 模态的样式表层（大卡保持登记表上的层级，不得写成 inline）。不触及 overlayBusy，不触及 HUD 呼吸驱动。Support 右上按钮、遮罩、请茶、会员、圣所点击目标不改层级。第四 / 五卡只改「未购不可购」与已购淡化；**第四卡 CTA**（`[data-testid=yin-support-pro-cta]`）与 **第五卡** 同属受保护路径。

## 受保护付款路径

- 第四卡：`#yin-support-pro-card` · `[data-testid=yin-support-pro-cta]` · `POST /api/create-pro-checkout-session`
- 第五卡：`#yin-support-companion-addon-card` · `[data-testid=yin-support-companion-addon-cta]` · `POST /api/create-companion-addon-checkout-session`

- 作用于：未购不得新开结账；已购仍淡化且不可点。
- 包含受保护路径：**是**（两卡 + 两路由）。
- 排除：不改右上 Support FAB、不改遮罩、不改请茶 / 会员 / 圣所 / z-index。

实现旁支完成前须跑 `cd focus-tiger && npm run test:payment-contract`。没跑或失败，不得写成已修好。Worker 410 变更 **deploy 后**须在 PR 或 Tracker 记 Version id。

## 不涉及后台网络

不新增自动拉取。少掉的是客人点第四 / 五卡才会发起的 checkout。已付回跳 confirm 沿用现有路径（**不**封 `confirm-pro-session` / `confirm-companion-addon-session`，否则误伤已在途付款）。

## 冲突扫描

对照了 Support 付款场景（终身之后第五卡出现并可点，直到买完才淡化；网页有本地陪伴说明）和桌面宽屏倾诉行（生成层开着就出现，即使挂载关着）。

- 强度：少两张可购卡、少一行菜单。没有比恢复练习更重的新步骤。
- 语气：说明只陈述「现在不对客人打开」。不责备、不催买。
- 职责：付钱买陪伴，和「倾诉对客人开着」，不再写成同一件事。实现旁支改 `SCENARIO_TESTS.md` 对应句；本 Brief 文件不改该文件正文。

不新开倾诉面板，所以不改睡觉时打开倾诉要不要叫醒。那条仍留给真正打开倾诉的时候。

## 实现时预期会变的测试

点头后的代码旁支至少改这些预期（撤掉「已购 / 生成层可以在挂载关时打开」就会红，红了才算锁住）：

- `confideUserVisibilityGate.test.js`：`companionGeneration: true`、挂载 false、idle、安全语料通过 → 改为不能开。耳朵显隐与它一致。开发构建下 `?confide=1` 用例保持；**补生产构建下 query 无效**。
- `desktopCompanionL1.test.js`：挂载关闭仍显示倾诉行 → 不显示；「生成层在 idle 能开」→ 不能开。
- `idleChromeOrchestration.test.js`：挂载 false 时宽屏也不显示倾诉行。
- `supportPaidCardPresentation.test.js`：已买终身未购加购 → `showAddon === false`；已买加购 → 仍 `showAddon === true` 且淡化；**未购 Pro 不可展示可点第四卡**。
- `focus-tiger/cloud`：`createProCheckoutSession` / `createCompanionAddonCheckoutSession` 闸门单测（410 体例）。

若付款契约或菜单契约还断言「未购加购卡 / 未购 Pro 卡可点」，同一旁支改掉，不另开 PR。

## 冲突与死路

- 无同内容的实现 PR。盘点 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633) 已合，只读。
- [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) **已合**（T92 toast）；本旁支禁止重复或回滚该行为。

## 交付顺序（PO 2026-11-09）

1. **本 Brief 增补**（docs PR，#1639 后续）— 已点头口径落盘。  
2. **实现旁支**：闸门、第四 / 五卡 UI、文案、测试、双 checkout **410** → `npm run test:payment-contract`。  
3. **部署 Worker**，验证 410 与在途 confirm 仍可用；记 Version。  
4. **治理 docs PR**：`GLOSSARY.md` 等更正「已购宽屏可开倾诉」等与产品不一致句。  
5. 其后：签名公证核实、B1、T93/T95（不在本 Brief 范围）。
