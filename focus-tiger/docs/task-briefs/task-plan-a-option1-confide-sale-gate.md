# Task Brief · 方案 A 选项 1：安装包前已购也不开倾诉；第四卡与第五卡都先停新结账

> **状态（2026-11-10）**：**实现已合 develop**（[#1646](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1646) · merge `ec0e9faa`）。客户端闸门、两张卡、文案、Worker **源码** 410 默认关都在共用版本里。**生产 Worker 尚未 Redeploy** → 线上接口仍可能新开结账。Sandbox 已付流水是开发自测，**真实客户 0；Live 笔数不适用**。安装包 QA 参数：源码 + 单测已核对，**不是**签名安装包实测。本文件取代已合并的 [#1639](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1639)，并吸收 [#1641](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1641) / [#1642](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1642) / [#1651](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1651)。  
> **类**：**B**。会改客人能不能看见倾诉，以及 Support 里能不能新买 Pro、能不能新买陪伴加购。  
> **基线**：`origin/develop@ec0e9faa`（含 #1646）。上一版写的 `d54f11a8` / OPEN 旁支已过期。  
> **依据**：T98（倾诉默认关闭时的入口盘点）[`audit/findings/2026-11-08/confide-mount-off-entry-inventory.md`](../audit/findings/2026-11-08/confide-mount-off-entry-inventory.md)。该盘点已合 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633)；盘点当时的「已购宽屏可开」已被 #1646 代码闸收掉。  
> **PO 书面（2026-11-09 晚）**  
> - 选项 1：**是**。第一份安装包发出前，已经买了陪伴的人也不开倾诉。  
> - 第五卡：倾诉评审（V2）通过前，不新售陪伴加购。已买过的留下、变淡、不能再付款。  
> - 第四卡：**也先停新结账**。判断只看一件事：去掉本机倾诉之后，剩下的会员进阶是否仍值这个价。你这次的默认是「不确定或偏少，先停」。若日后书面确认「仍值这个价」，再改口继续卖。停售可逆；卖出去再收回不可逆。  
> - 已订阅的人：线上笔数出来后，如有活跃订阅，由你决定是否通知、提供取消或退款、或暂停收款。在这句决定之前，不取消、不拦截续订，也先不选定通知或退款方案。  
> **实现**：**沿用 #1646 为唯一实现分支，不再拆成 Worker / 客户端两个 PR。** 产品尚未发布，没有线上客户会继续买，拆 PR 的理由不成立。勿再开同内容旁支。

## 一句话目标

挂载仍关着的时候，付过钱也不能打开倾诉。第五卡不再新售。第四卡不再新开 Pro 结账。已经订着的 Pro 继续有效，续订照旧。已经买过的加购留下、变淡、不能再付款。服务端新结账默认关闭：变量缺失或读失败也拒绝，不能悄悄恢复。已订阅的人仍能从会员管理入口取消订阅、更新付款方式。线上笔数出来后，如有活跃订阅，由你决定是否通知、提供取消或退款、或暂停收款。这一刀先不选定那个方案，也不自动退款。

## 与 #1639 的差别

#1639 把第四卡锁成「继续卖，文案改成现在买了也不会出现倾诉」。2026-11-09 晚你改口：第四卡也先停新结账。下面各节按这句改口写。#1639 里没写的七处门槛写在「开工前仍须单独完成的核对」。

## 合入后的地面事实（2026-11-10）

对照 `origin/develop@ec0e9faa`（#1646 已合）：

- `canOpenConfidePanel`：挂载 false 时，已购陪伴 / 生成层 **不能**再打开面板（实验室仅 `isClientQaHarnessAllowed`）。
- 宽屏菜单 / 倾听耳：挂载关着时不插入倾诉行。
- Support：未购不渲染可新开的第四卡 / 第五卡；已购加购卡淡化。会员 **$6.99** 卡仍卖，文案不含倾诉。
- Worker 源码：`POST /api/create-pro-checkout-session` 与 `create-companion-addon-checkout-session` 走 `isPlanAOption1NewCheckoutDisabled`（缺变量 / 非 `true`/`1` → 410）。`create-membership-checkout-session`、`create-membership-portal-session`、`confirm-pro-session`、webhook **未**走该闸。开关每次请求读 `env`，无模块缓存。
- 沙箱自测：默认关后 Pro / 加购会 410。本地或测试环境须设 Worker 变量 **`PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED=true`**（或 `1`）才能走通付款。**切 Live 密钥之前，该变量不得为开。**
- 生产 Worker **未** Redeploy：客户端已关、线上接口未关。

下面「现在的地面事实」是 **#1646 合入前** 的快照，保留作对照，不再代表 develop。

## 现在的地面事实

2026-11-09 晚对照当时 `origin/develop` 重读（**合入前**），不是对照术语表，也不是对照 `ead9213d`：

- `canOpenConfidePanel` 在 `companionGeneration === true` 且安全语料通过时，**即使挂载是 false 也返回 true**（`confideUserVisibilityGate.js`）。挂载 false 挡不住已购宽屏。
- 宽屏菜单在 `companionGeneration` 为真时仍插入倾诉行（`idleChromeOrchestration.js`），测试名就叫「挂载关着也显示」。
- `isCompanionEntitled` 为真的条件是：Pro 订阅有效，或终身陪伴加购有效，或实验室参数 `?companionEntitled=1` / `?entitlementMock=pro`。它只表示「账上有陪伴」，**本 Brief 不改这个函数的购买判断逻辑**；但须在 **生产构建** 禁用 URL 参数伪造（见下文「生产构建 · QA 参数」）。
- 第五卡：已买圣所终身、且不是 Pro 时，`showAddon === true`。没买加购时按钮仍可结账；买完后卡片留下并淡化（`supportPaidCardPresentation.js`）。
- 第四卡 Pro 文案现在写成「另加桌面端本机倾诉」。第五卡文案写成「一次性解锁本机阿寅」。网页底注写成解锁后可以在电脑上倾诉。
- Worker 仍暴露 `POST /api/create-pro-checkout-session` 与 `POST /api/create-companion-addon-checkout-session`；仅藏 UI 不够，旧客户端或脚本可直连。
- [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) **已合并**。打开被拒时，`onOpenBlocked` 会取 `confideOpenBlockedUserMessage`，这句话走 T92 求助句（`formatConfideSafetyResourceGuidance`）。入口登记里，沉思问询「想聊聊」标的是「必须给出这句」。语音危机转倾诉、帮助中心转倾诉在同一份登记里仍写着 **未核实**。本说明不把这两条写成已经盖住。

T98 写过：若对外说「安装包用户进不了倾诉」，对已购宽屏不成立。#1646 把那条例外收掉。术语表旧句「已购陪伴宽屏仍可开倾诉」是盘点当时的事实，由本治理 docs PR 更正。

## 已购与 Stripe 核对（Brief 政策输入）

**政策（本 Brief）**：不撤销本地 / 云端已购记录；**本刀不做自动退款**。产品尚未发布：Sandbox 全是开发自测，**真实客户为 0**。退款、通知、活跃订阅在发布前不处理。CSV **勿 commit**（含邮箱）；下文只留汇总数字。

金额与产品对应已对照 `wrangler.jsonc` Price ID + 客户端标价常量（`MEMBERSHIP_PRICE_DISPLAY` / `FOCUS_TIGER_PRO_PRICE_DISPLAY` / `INFRA_SNAPSHOT`），**不是**只凭 CSV 空 metadata 列推断：

| Price ID（`wrangler.jsonc` vars） | 产品 | 标价 | Sandbox 已付笔数 |
|---|---|---|---|
| `price_1U6EB1FuIhgJPGLiuciuX1to` | Pro（第四卡） | US$12.99/月 | 19 |
| `price_1U6GnXFuIhgJPGLiNlXs0IKe` | 陪伴加购（第五卡） | US$29.99 一次 | 1 |
| `price_1U2r5lFuIhgJPGLiEPOhJbst` | 会员 / Base（仍在卖） | US$6.99/月 | 21 |
| `price_1U22T4FuIhgJPGLiT0hcEWxY` | 圣所终身 | US$89.99 一次 | 8 |
| `price_1U4nanFuIhgJPGLidoTdxobW` | 请茶 | US$4.99 | 3 |

Sandbox 导出另有 $9.95 × 1、$9.99 × 1（metadata `art-collection` 1），**不是** Pro / 会员 / 加购。

| 来源 | 2026-11-09 / 2026-11-10 结果 | 说明 |
|---|---|---|
| 生产 `SANCTUARY_KV` 前缀 `companion-addon:` | **0** 键 | `wrangler kv key list` |
| 生产 `MEMBERSHIP_KV` 前缀 `membership:` | **0** 键 | 含 `confirm-pro-session` 写入的 Pro 索引 |
| Stripe Dashboard **Live** | **不适用**（产品未发布；流水全是 Sandbox 自测） | 日后切 Live 密钥前：确认 `PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED` **不是**开 |
| Stripe **Sandbox** 已付导出 | **54** 行，全部 Paid；退款 0；日期 2026-08-10–2026-10-30；邮箱 2 个（51+3 行）。$12.99：19 笔 / 7 客户；$6.99：21 笔 / 8 客户，与 $12.99 客户无重叠 | **只写汇总。不入库 CSV、不写邮箱。** |

Tracker 里第四 / 五卡人工验收多写 **Stripe Test**。Sandbox 活跃订阅先不处理。

## 范围（in）

- 挂载为 false 时，`companionGeneration` **不能**再让 `canOpenConfidePanel` / 倾听耳 / 宽屏倾诉行变成可开。安全语料仍须通过；阶段仍须是 idle。
- **未购** Pro：**不出现可新开的第四卡结账**（不出现可点 CTA，或根本不渲染可购第四卡——实现二选一，须与 `npm run test:payment-contract` 一致）。
- **未购** 陪伴加购：第五卡不出现，不能新开加购结账。
- **已购** Pro：在你对活跃订阅作出决定之前，**不取消、续订不因关闭开关失败**。第四卡按现有「已订阅不再卖第二次」处理。倾诉仍不开。这不是最终处理：线上笔数出来后，如有活跃订阅，由你决定是否通知、提供取消或退款、或暂停收款。
- **会员管理入口保留**：`[data-testid=yin-membership-manage]` 仍打开 `POST /api/create-membership-portal-session`（Stripe 顾客门户：取消订阅、更新付款方式）。关闭开关不得挡住这条。实现时加测试锁住它仍能返回门户地址。第四卡现网没有单独的管理按钮，不得用「停新结账」把这条门户一起关掉。
- **已购** 陪伴加购：对应卡仍在、淡化、按钮不可点，不能再开 Stripe；本地已购记录保留，不撤销，不在这刀退款。
- 第四卡、第五卡、网页底注及 **文案全盘**（见下）：三语说明倾诉**现在不对客人打开**；不出现「解锁即可倾诉」「另加本机倾诉可立即使用」等承诺。
- 新句子写 `src/locales/slices/` 一片（en / zh / ja 同键），覆盖总账旧键。不改 `en.json` / `zh.json` / `ja.json`。
- **服务端关闸（先做，单独一个请求）**：`POST /api/create-pro-checkout-session` 与 `POST /api/create-companion-addon-checkout-session` 默认关闭。变量缺失或读取失败时，新结账一律拒绝；重新打开必须有人明确操作，不能因为开关丢了就悄悄恢复。拒绝用 **410**（或与 `practiceBackupWritesDisabled` 同形的统一 JSON），对客是一句「现在不新开」，不是原始错误。旧版客户端或脚本也拿不到付款地址。续订不走这两条接口。`create-membership-portal-session` 不关。**Worker 部署之后**才算线上接口已关；只改客户端要写成「客户端已关、线上接口未关」。
- **客户端（后做，另一个请求）**：收到「已关闭」时，0–1 秒内给一句说明，不显示原始错误。闸门、第四卡、第五卡、三语文案、生产构建下 QA 参数不生效的测试、文案全盘检索，都在这一支。
- **生产构建 · QA 参数**：`?confide=1`、`?companionEntitled=1`、`?entitlementMock=pro`（及文档列出的相关 mock）在 **非开发构建** 必须**不生效**（不得借此开面板或伪造 Pro）。开发 / `MODE=development` / Playwright 开发构建可保留。须核实桌面结账深链 **`focus-tiger://app`**（及现有 `navigateDesktopCheckoutReturn` 路径）**不得**把上述 query 带进可发布安装包。实现旁支加单测或 e2e：**生产构建**下带这些 query 仍不能开倾诉 / 不能伪造 entitlement。
- 实验室（仅开发构建）：`?confide=1` 在 idle 仍可打开面板。这不是对客入口。
- **求助出口**：倾诉对客人全关后，**T14 倾诉卡内常驻求助链无人可见**。客人危机出口依赖 [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637)「想聊聊」提示（**T92 求助句**）。语音危机和帮助中心是否也带这句，只读核对与代码并行；没核对完不得写成已核对。
- 客户端那个请求改下面会红的界面测试预期，并改 `SCENARIO_TESTS.md` 里「终身后第五卡可点」「已购宽屏出现倾诉行」「未购可点 Pro」等句子。服务端那个请求只改结账路由和会员门户仍可开的测试。

### 文案全盘（实现旁支必做检索）

除第四卡、第五卡、Support 网页底注外，**检索**（rg / 审计脚本）所有客人可见面：隐私页、产品简介卡、帮助中心切片、官网 / 营销静态页、商店说明（若有）。任何语言不得仍承诺「现已可倾诉 / local AI chat 已开放」。命中清单贴实现 PR；本 Brief 不逐条枚举。

## 范围（out）

- 不把 `CONFIDE_USER_MOUNT_ENABLED` 改成 true。不宣布评审已通过。
- 不改 `isCompanionEntitled` 的**购买记录**读写语义，不删已购缓存，不做自动退款。
- 不在笔数出来之前承诺退款，也不在这刀里做退款。
- 不取消已有 Pro 订阅，不拦截续订。
- 不把沉思问询、语音、帮助中心的提示再做一遍。#1637 已在共用版本里。本旁支不 cherry-pick 那笔提交，不重做 T92 toast 逻辑，除非付款契约强制。
- 不改第四卡与第五卡「已是 Pro 则不显示加购卡」的互斥。
- 不改 Support 按钮层级、遮罩、玻璃卡 z-index，不给 Support 模态写 inline z-index。
- 不改任务总表、问题账本已有行。术语表 T98 句与 B3 看板由本治理 PR 更正。
- 不新开后台下载或别的网络请求（410 路由不算新下载）。
- 不把 Sandbox 自测写成 Live 客户。上表只留汇总数字。

## 第四卡：已锁的做法

第四卡多出来的价钱，主要就是「本机倾诉」。倾诉对已购也不开。

**已锁：先停新结账。** 未订阅的人不能新开 Pro 付款。开关默认关闭：变量缺失或读取失败时也拒绝；重新打开必须有人明确操作。

已订阅的人付的溢价，主要就是现在不可用的本机倾诉，继续扣费有消费者保护方面的风险。**先不选定方案。** 线上笔数出来后，如有活跃订阅，由你决定是否通知、提供取消或退款、或暂停收款。在这句决定之前，不取消、续订照旧，只是临时状态。

订阅过期后再订阅，算新结账，会被拦住。有效订阅要取消或更新付款方式，走会员管理入口，不走新结账。

先前 #1639 建议继续卖、只改文案。那条不再执行。只有你日后书面写明「去掉倾诉后，剩下的会员进阶仍值这个价」，才恢复新结账。

| 卡 | 新结账 | 已购 |
|---|---|---|
| 第四卡 Pro | **关闭** | 记录保留；卡按现有已购规则隐藏或淡化；**Stripe 订阅账单不由本刀取消** |
| 第五卡 陪伴加购 | **关闭** | 卡保留、淡化、不可再付 |

两卡溢价核心都关联「本机倾诉」。**停新结账可逆**，已卖难收回。

## 开工前仍须单独完成的核对

下面七处已经写进本说明。三条核对不必全部做完再开工。真正挡住写代码的，只有安装包参数那一条（只读，做完立刻可以贴开工句）。线上笔数、语音和帮助中心可以并行，不挡代码，但挡住退款说明和「已核对」这几个字。没做完的，不得写成已核对。

| # | 要写进说明的事 | 2026-11-10 |
|---|---|---|
| 1 | 服务端也关，而且默认关闭。变量缺失或读取失败时新结账一律拒绝。续订与会员管理入口不要受影响。Worker 部署后才算线上已关。 | **源码已合。** `isPlanAOption1NewCheckoutDisabled` 缺变量 / 非 true\|1 → 410；每次请求读 env。门户 / 会员新购 / confirm / webhook 未走该闸。单测未单独锁「门户在闸开时仍 200」。**生产 Worker 未部署。** |
| 2 | 核实安装包不接受 QA 参数，含深链。 | **源码 + 单测已核实（注入 `qaHarnessAllowed: false`）。** 结账回跳会转发 query；生产 harness 须忽略。**未**用真正 `MODE=production` 打包、**未**拆签名 `.dmg`。Electron 生产构建是否走该闸 = **未核实**。 |
| 3 | 查清线上模式笔数 / 活跃订阅。 | **Sandbox 54 笔自测；真实客户 0；Live 不适用。** 活跃订阅先不处理。 |
| 4 | 更正过期事实。 | **已更正**（文首 +「合入后的地面事实」）。#1641/#1642 与 #1646 后只保留这一份口径：Sandbox 自测、#1646 已合、Worker 未部署。 |
| 5 | 全盘检索倾诉 / 陪伴句子。 | **部分。** 切片 `plan-a-option1-support-sale-stop.json` 覆盖 Support Pro/加购。总账 `zh.json` 仍留旧 Pro 句，运行时切片覆盖。隐私页 / 帮助中心 / 官网未做完整客人面检索。 |
| 6 | 「想聊聊」、语音危机、帮助中心转倾诉都显示 T92 求助句。 | **部分。** 「想聊聊」经 `onOpenBlocked` → T92。`voiceCommandGate.js` **无** `confide` 字符串。帮助中心 `isHelpCenterAskDestinationReachable` 只判断问卡 DOM，**不**断言转倾诉失败时弹出 T92。入口登记这两行仍写未核实。 |
| 7 | 治理文档：术语表 + B3 看板。 | **本 PR。** |

## 变体矩阵

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| 网页，未买终身，未订阅 Pro | Support | **不见可新开 Pro 的第四卡**（或见卡但 CTA 不可点且不调 checkout API）。不见第五卡。无「现在能倾诉」文案 | `supportPaidCardPresentation.test.js`；付款契约 |
| 网页或电脑，已买终身，未买加购，未订阅 Pro | Support | 圣所卡淡化。第五卡不出现。第四卡不新开结账 | 同上 |
| 已订阅 Pro | Support | 第四卡按现有已订阅规则，不再卖第二次。订阅还在。菜单、耳朵、面板都不出现倾诉 | 已有已订阅呈现；闸门测试 |
| 已买加购 | Support | 第五卡仍在、淡化、按钮不可点。文案说明购买还在，倾诉入口还没对客人打开。点按钮不开 Stripe | 已有淡化测试；文案片 |
| 已买 Pro 或已买加购 | 宽屏电脑，无实验室参数 | 账上仍算已购陪伴。倾诉行、耳朵、面板都不出现 | `confideUserVisibilityGate.test.js` · `desktopCompanionL1.test.js` |
| 宽屏电脑，生成层为真，挂载 false | Idle ⋯ | 没有倾诉行 | `desktopCompanionL1.test.js` · `idleChromeOrchestration.test.js` |
| 窄屏 | 抽屉 | 仍没有桌面倾诉行 | 现有窄屏测试保持 |
| `?confide=1`，idle | **仅开发构建** | 面板可以打开 | harness 测试保持 |
| `?confide=1`，专注中 | **仅开发构建** | 仍不能开 | 现有测试保持 |
| `?confide=1`，**生产构建** | idle | **不**因 query 开面板 | **本刀新增** |
| `?companionEntitled=1` / `?entitlementMock=pro`，**生产构建** | 无 `?confide=1` | 不伪造已购、不开客人倾诉入口 | **本刀新增** |
| 安装包 / 生产构建 | 深链或启动参数带上述 QA 参数 | 参数不打开倾诉，也不假冒已购 | 生产构建测试；核对完成前不得写成已证实 |
| 直接调用 Pro 或加购结账接口 | 旧客户端或脚本；或开关变量缺失 / 读失败 | **410**，不是 Stripe 地址。默认就是拒绝 | 路由测试；付款契约 |
| 已订阅，点会员管理 | 会员卡 Manage | 仍打开顾客门户，可取消、可更新付款方式 | 锁 `yin-membership-manage` 与 `create-membership-portal-session` 仍成功 |
| 订阅已过期，想再订 | 第四卡或 Pro 新结账接口 | 算新结账，被拦住。不走会员门户的「再买一笔」 | 结账路由测试 |
| 客户端收到已关闭 | 第四卡或第五卡若仍点得到 | 0–1 秒内一句说明，不显示原始错误 | 付款契约；内联状态文案 |
| en / zh / ja | 第四卡停售说明、已购第五卡、网页底注、求助相关 | 同一含义。日文不留英文原句 | 文案片；`npm run locale:slices` |
| 请茶 / 会员 / 圣所 | Support | 结账与已购淡化与现在相同 | 付款契约必须仍绿 |
| 已有 Pro 订阅续订 | Stripe 续订 | 不取消、不因关闭开关失败 | 本刀不改续订路径；汇报里写明未改 |

## 点击反馈（0–1 秒）

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化 |
|---|---|---|
| 未购第五卡 | 没有这张卡，点不到 | — |
| 未购第四卡 Pro | 没有可购第四卡，点不到 | — |
| 已购第五卡按钮 | 按钮不可点，不跳转付款 | 不写新的购买 |
| 已购第四卡 | 按现有已购 Pro 规则（隐藏或淡化），不跳转新结账 | 不新开订阅；已有订阅不删 |
| 倾诉菜单行、倾听耳 | 挂载关着时不渲染，没有可点的空按钮 | — |
| 实验室 `?confide=1`（开发构建） | idle 打开面板 | — |
| 安装包里的同一参数 | 不打开面板 | 不写已购 |

按设计点不到的入口是「不画出来」，不是点了没反应。不新增静默白名单条目。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 已买加购 | 卡留下、淡化、不能再付款。购买记录还在。不在这刀退款 |
| 已订阅 Pro | 在你决定之前：不取消，续订照旧。倾诉仍不开。最终是否通知、提供取消或退款、或暂停收款，等线上笔数 |
| 订阅过期后再订 | 算新结账，拦住 |
| 会员管理 Manage | 仍能打开门户。取消与更新付款方式不被关闭开关误伤 |
| 已买终身且已是 Pro | 仍不显示第五卡（现有互斥）。不新开加购结账，也不新开 Pro 结账 |
| 加购 / Pro 付款已在进行、人还在回跳页 | 允许把**已完成**的 session 记成已购并淡化。禁止从 Support 再开**新** checkout |
| 旧版客户端调 checkout API | Worker **410**，无 Stripe URL |
| 窄屏 / 低配 / 网页 | 本来就没有桌面倾诉行。保持 |
| 专注中、到来、有其它遮罩 | 即使开发 harness，生产构建也不能开。保持 |
| 安全语料不通过 | 不能开。保持 |
| 三语 | 不出现「即将开放」「限时」这类催促 |
| 线上已有购买，笔数还没查 | 说明里不写退款承诺，也不写「没有人买过」 |

## 共用机制核对

本次不新建可点击叠层，不改 Support 模态的样式表层（大卡保持登记表上的层级，不得写成 inline）。不触及 overlayBusy，不触及 HUD 呼吸驱动。Support 右上按钮、遮罩、请茶、会员、圣所的点击目标不改层级。第四 / 五卡只改「未购不可购」与已购淡化；**第四卡 CTA**（`[data-testid=yin-support-pro-cta]`）与 **第五卡** 同属受保护路径。

## 受保护付款路径

- 第四卡：`#yin-support-pro-card` · `[data-testid=yin-support-pro-cta]` · `POST /api/create-pro-checkout-session`
- 第五卡：`#yin-support-companion-addon-card` · `[data-testid=yin-support-companion-addon-cta]` · `POST /api/create-companion-addon-checkout-session`

- 作用于：未购不得新开结账；已购仍淡化且不可点。
- 包含受保护路径：**是**（两卡 + 两路由）。
- 排除：不改右上 Support FAB、不改遮罩、不改请茶 / 圣所 / z-index。会员卡的管理按钮与 `POST /api/create-membership-portal-session` **保留**，并加测试证明关闭开关没有把它变成拒绝。不改会员新购结账（`create-membership-checkout-session`）的开或关。

实现旁支完成前须跑 `cd focus-tiger && npm run test:payment-contract`。没跑或失败，不得写成已修好。Worker 410 变更 **deploy 后**须在 PR 或 Tracker 记 Version id。客户端改完而 Worker 未部署时，线上接口仍能新开结账，汇报里必须写成「客户端已关、线上接口未关」。

## 不涉及后台网络

不新增自动拉取。少掉的是客人点第四 / 五卡才会发起的 checkout。已付回跳 confirm 沿用现有路径（**不**封 `confirm-pro-session` / `confirm-companion-addon-session`，否则误伤已在途付款）。关闭开关是客人（或旧客户端）发起结账时的拒绝，不是后台轮询。

## 冲突扫描

对照了 Support 付款场景（终身之后第五卡出现并可点；第四卡仍可新开 Pro）和桌面宽屏倾诉行（生成层开着就出现，即使挂载关着）。

- 强度：少两张可购卡、少一行菜单。没有比恢复练习更重的新步骤。
- 语气：说明只陈述「现在不对新客人开放」。不责备、不催买、不写「即将开放」。
- 职责：付钱买 Pro 或加购，和「倾诉对客人开着」，不再写成同一件事。实现旁支改 `SCENARIO_TESTS.md` 对应句；本 Brief 文件不改该文件正文。

不新开倾诉面板，所以不改睡觉时打开倾诉要不要叫醒。那条仍留给真正打开倾诉的时候。

## 实现时预期会变的测试

开工后的代码旁支至少改这些预期（撤掉「已购 / 生成层可以在挂载关时打开」或「未订阅仍可新开 Pro」就会红，红了才算锁住）：

- `confideUserVisibilityGate.test.js`：`companionGeneration: true`、挂载 false、idle、安全语料通过 → 改为不能开。耳朵显隐与它一致。开发构建下 `?confide=1` 用例保持；**补生产构建下 query 无效**。
- `desktopCompanionL1.test.js`：挂载关闭仍显示倾诉行 → 不显示；「生成层在 idle 能开」→ 不能开。专注中、安全语料失败、窄屏不漏行，保持。
- `idleChromeOrchestration.test.js`：挂载 false 时宽屏也不显示倾诉行。
- `supportPaidCardPresentation.test.js`：已买终身未购加购 → `showAddon === false`；已买加购 → 仍 `showAddon === true` 且淡化；**未购 Pro 不可展示可点第四卡**。已订阅 Pro 的现有呈现保持。
- `focus-tiger/cloud`：两个新结账路由在开关缺失、读失败、以及明确关闭时都是 410。`create-membership-portal-session` 在同一套测试里仍能建门户。订阅过期后再调 Pro 新结账仍是 410。
- 生产构建：`?confide=1`、`?companionEntitled=1`、`?entitlementMock=pro` 不打开倾诉、不假冒已购。安装包深链的只读核对写进同一旁支的说明，核对完成前这组预期不得标成已证实。

若付款契约或菜单契约还断言「未购加购卡 / 未购 Pro 卡可点」，改到碰到那条断言的那一支，不另开第三支。

## 冲突与后续

- 实现 PR [#1646](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1646) **已合 develop**。盘点 [#1633](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1633) 已合，只读。#1639 是本文件的旧版，第四卡结论已被本节取代。勿再开同内容旁支。
- [#1637](https://github.com/IhiroArmstrong/Ihiro-PetGarden001/pull/1637) **已合**（T92 toast）；本旁支禁止重复或回滚该行为。

## 交付顺序（2026-11-10 更新）

1. **#1646 已合 develop。** 不再拆两个实现 PR，勿再开同内容旁支。  
2. **部署生产 Worker**（须口头「部署」）：之后才算线上接口已关。部署后记 Version id。  
3. **本治理 docs PR**：统一本说明（Sandbox 汇总、Price ID、七点状态）、术语表、B3 看板、RR-14。  
4. **仍未做完、方案 A 不能写成完成**：真正生产模式打包测 QA 参数；签名安装包深链；语音 / 帮助中心 T92；文案全盘检索。  
5. **其后另会话**：签名公证核实、T97 人选、T93 / T95、B4a/b、安装包五场景走查。不在本 PR。

沙箱测 Pro / 加购：在测试 Worker 设 `PLAN_A_OPTION1_NEW_CHECKOUT_ENABLED=true`。切 Live 密钥前确认该变量**不是**开（RR-14）。
