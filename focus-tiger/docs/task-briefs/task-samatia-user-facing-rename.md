# Task Brief · 用户可见产品名改为 Samatia

> **状态（2026-11-05 · 修订 2 + PO 点头附言）**：**已点头**，可按本页开工。点头附言见文末「PO 点头（2026-11-05）」；实现以附言为准（A 拆 A1/A2、扫描分刀、等）。  
> **【新增】代号（待治理账本登记）**：**T87**（用户可见产品名改为 Samatia）。**不是** T86（官网字典与伦理审查，仍搁置 · 未排期）。**不是** 改仓库目录名。  
> **类**：**B**（窗口标题、问号卡、Support 付费卡、安装包 Dock/菜单栏、宣传站、结账页对外名都会变）。  
> **口令**：「按 T87 Brief 开工」= 实现**本修订版**已锁切片。口令「立刻开工」**不**跳过本 Brief。  
> **作废**：修订 1 末尾「回复开工即同意日文显示名 サマティア」——与 2026-11-05 日语拍板冲突，**不得再当默认**。

## 与上一稿的变化（修订 2）

1. 日语界面产品名改为拉丁文 **Samatia**；**サマティア 只做读音注**（问号卡第一行、日语官网首屏、商店说明）。  
2. 中文用户可见处一律 **Samatia**；**三摩莎 不进任何用户可见字符串**。  
3. 官方念法锁 **sa-MAH-tee-ah**（/səˈmɑː.ti.ə/，四音节）。词源不写进用户可见文案。  
4. 会员 Stripe 对外名与卡对齐：**Samatia · Yin Membership**，不用 Base。  
5. T87-D 改为改 Stripe **Product name**（顾客可见），并补 Public details 商家名与 statement descriptor。  
6. 补发布闸门、残留扫描、Electron 数据目录重置、域名落地、商标检索门禁。

## 一句话目标

用户看得见的产品名从 Focus Tiger 换成 **Samatia**（三语同一拉丁拼写）。内部仓库、代码路径、开发文档可以继续叫 Focus Tiger。阿寅仍是一只小老虎，只换产品名。

## 已拍板（2026-11-05 · PO）

1. 对外品牌拍板 **Samatia**（不是 Aekoos）。域 **samatia.net** 已解析到万网 DNS；**解析 ≠ 实名/邮箱验证完成**（见域名落地）。  
2. **内部**项目文档、代码、不便改的内部名可以继续用 Focus Tiger。  
3. **凡是面向用户、用户看得见的**都改成 Samatia：宣传官网、销售文案、安装包显示名、产品 UI、问号按钮信息、Stripe 顾客能看见的 Product name / 收据行。Price ID、metadata、planId 不动。  
4. 汉语暂定 **三摩莎** 只作**内部备忘**；产品与官网本轮 **无需汉语版**。用户可见中文（若语言开关仍在）写 **Samatia**，不写三摩莎。  
5. **日语界面也用拉丁文 Samatia**。サマティア **只做读音注**，不当产品名。  
6. 用户可见商标行写 **Samatia™**（替代问号卡 colophon 里的 Focus Tiger™）。可在应用内先用；**公开新域名之前**须过商标检索闸（T87-C）。  
7. 付费对外名：**Focus Tiger Pro → Samatia Pro**。会员对外名见下表，**不用 Base**。  
8. 目前 **没有真正用户、产品尚未发布** → Electron 显示名与应用 ID 都可以一次改干净；接受数据目录重置（见 T87-B）。  
9. 角色文案：「一只小老虎」等叙事 **保留意象**，只换产品名。词源 samatā **不写进**用户可见文案。

## 本 Brief 锁的默认（未另拍板则按此做）

| 项 | 默认 | 为何 |
|---|---|---|
| 英文 / 日文 / 中文显示名 | **Samatia**（拉丁文，同一拼写） | 一个名字走天下；colophon 专有名词三语共用 |
| 日文读音注 | **サマティア**，仅两处（A1）：问号简介卡**第一行** `Samatia（サマティア）`；**T87-C** 日语官网首屏。**商店说明**读音注归 **T87-C**。窗口标题、Support 卡、备份提示、Dock **只写 Samatia** | 避免第二官方名；商店文案随营销站 C 刀 |
| 官方念法 | **sa-MAH-tee-ah** · IPA **/səˈmɑː.ti.ə/**（四音节）。英文官网首屏与英文问号卡可加一行读音。**不用** /səˈmeɪ.ʃə/ | PO 原文两种念法里，与 サマティア 一致的是四音节 |
| 日文付费档 | **Samatia Pro** | 与英文同一字符串 |
| 商标行 | 三语 colophon 都写 **Samatia™** | 专有名词不译 |
| 汉语公开名 | 用户可见 **Samatia**；**禁止**切片或官网出现三摩莎 | 「三摩」近三摩地；免第三个公开名 |
| Membership 卡 UI | **保持 Yin Membership / 阿寅メンバーシップ / 阿寅会员** | 现网已是角色会员名 |
| Checkout 会员 Product name（D 刀） | **Samatia · Yin Membership**（**不用 Base**；与 Checkout 对齐，不与卡标题逐字相同） | 点卡进 Checkout 不得换另一个牌子 |
| ja/zh 卡名 vs Checkout | **接受落差**：卡上仍是角色会员名；Checkout/收据为 **Samatia · Yin Membership**。英文用户严格对齐；Yin/阿寅同一角色，不制造困惑 | PO 2026-11-05 附言 |
| Stripe Pro Product name | **Samatia Pro** | 与卡一致 |
| Stripe 内部区分 | **Product id / Price ID / metadata**；据 Stripe 文档 **`name` 为顾客可见 display name**，**未见**单独「内部产品名」字段。**D 刀**在 Dashboard 再确认 | 分析师核对 + Stripe 文档 |
| Public details 商家名 | 公开商家名登记 **Samatia**（DBA）；网址 **samatia.net** | 收据/客户门户商家行 |
| Statement descriptor | 优先 **SAMATIA**（须对应 DBA 或网址）。若被拒：前缀 TWINSOLOGY、后缀 SAMATIA（账单上常显示为 `TWINSOLOGY* SAMATIA`）。**只有 PO 能在 Dashboard 改** | Stripe：5–22 拉丁字符，须反映 DBA，不能只是服务描述 |
| Electron `productName` | **Samatia** | Dock / 菜单栏 / 安装包 |
| Electron `appId` | **`com.twinsology.samatia`** | 尚未发布 |
| 用户数据目录 | **接受重置**。开 T87-B 前本机先导出备份。**不写迁移代码** | productName 变了，旧进度/已购缓存会「消失」 |
| 备份格式标识 | **不改**校验逻辑与内部 format id；只改「无效文件」提示文案 | 旧备份仍能导入 |
| 内部 entitlement / planId | **保持** `focus-tiger-pro` 等 | 用户看不见 |
| 源码版权头 | **保持** `Focus Tiger™ is a product of Twinsology.` | 开发者文件头；残留扫描**白名单** |
| 宣传站主角名 | 页上 **Samatia™**；工作室仍 Twinsology | 公司名不是产品名 |
| 宣传站域名 | 产品 canonical **https://samatia.net/**；twinsology.com 产品页 **301 → samatia.net**；配 www 与 HTTPS。**禁止**改 twinsology.com 的 MX / SPF / DKIM / `hello@twinsology.com` | 发信域已锁 |
| samatia.net 邮件 | **不发信**。加拒发 SPF + DMARC 防冒用。不碰 twinsology.com 记录 | 域名落地 |
| 发布闸门 | **T87-A1/A2 + B + C + D 全部合入**且**全范围**残留扫描绿之前：**不发布、不公开新域名** | 避免应用已改名、安装包/官网仍叫旧名 |
| T86 | **不动** | 仍搁置 |

## 冲突扫描

对照场景 **W**（? / 简介 / Privacy / colophon）、场景 **Q**（Support 三卡 + Pro / 加购）、营销站 Stay in touch / Write to Yin、Electron 菜单栏与 Dock、付款回跳、Confide / Local AI 开口。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 只换可见字符串与安装包显示名，不增加点击、不新打断。读音注只加在指定三处，不加新控件。 |
| **b. 语气** | 安静、长期、有渊源。禁止 10 分钟治愈、街机 gamification、临床 Mental Health 名。禁止用户可见处讲词源。阿寅小老虎意象保留。 |
| **c. 职责** | 不替代 T86、不改付款金额与 Price ID、不把 Support 卡拖出受保护路径、不把练习壳挂到 samatia.net。 |

**无冲突疑点。** 相邻场景仍是同一入口，只是牌子换了。

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。  
Support 卡 **只改可见标题文案**，不改 `#yin-support-fab` / `#yin-support-modal` / `[data-testid=yin-support-pro-cta]` 选择器与结账 URL。若某刀误伤共享层，该刀必须跑 `npm run test:payment-contract`。

## 明确不做

- 不重命名仓库目录 `focus-tiger/`、npm 包名、Worker 主机名、localStorage 键。  
- 不改付款金额、Price ID、Checkout 是否接线。  
- 不改「一只小老虎 / Yin · 阿寅」角色叙事。  
- 不做汉语官网；不把三摩莎写进用户可见字符串。  
- 不把日语产品名做成第二官方拼写（サマティア 不是 Dock / 收据 / 标题上的名）。  
- 不写 Electron 用户数据目录迁移。  
- 不改备份文件内部格式标识 / 校验逻辑。  
- 不把 T86 伦理审查页提前做。  
- 不在功能 PR 改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md` / `TASKS.md` 总表。  
- 不改 twinsology.com 邮件 DNS。  
- 不把源码版权头批量改成 Samatia。  
- 不在 T87-A 做商标检索或公开 samatia.net。

## 范围切片（一 PR 一刀）

点头后按序开旁支，**禁止**一个 PR 同时改 UI + 安装包 + 营销站 + Stripe 控制台。

| 刀 | 名称 | 改什么 | 验收要点 |
|---|---|---|---|
| **T87-A1** | 应用内 locale + 文档 | locale **切片**覆盖 `APP_TITLE`、问号卡、colophon、Help Center 用户可见句、Support **Samatia Pro**、备份无效提示；**三语断言**；权威文档对外口径句 | 三语 UI 产品名均为 Samatia；日语问号**第一行**含 `Samatia（サマティア）`；英文问号可含 sa-MAH-tee-ah；colophon Samatia™ |
| **T87-A2** | 句池 / 提示词 + 分刀扫描 | 预生成句池与**会说出口的** Local AI / Confide 提示词；**分刀扩大**的残留扫描；封存评测 fixtures **白名单**；A2 合并后对受影响 Confide/句池评测跑**基线对比**（只应是名字变） | A2 扫描范围 = A1 表面 + 本刀产物；**D 刀全合后**扫描才是发布硬闸 |
| **T87-B** | 桌面安装包 | `productName`、`appId`、菜单栏 / 托盘 / 关于窗；**开刀前本机导出备份** | Dock / 菜单栏 / dmg·exe 显示 Samatia；旧备份仍能导入 |
| **T87-C** | 宣传站 + 域名 | 页上 Focus Tiger → Samatia；canonical / OG → samatia.net；日语首屏读音注；**商店说明**读音注；twinsology.com 产品页 301；www + HTTPS；samatia.net 拒发 SPF/DMARC | 页上 Samatia™；mailto 仍 `hello@twinsology.com`。**公开域名前**过商标检索 |
| **T87-D** | Stripe 顾客可见名 | Dashboard 改 **Product name**（会员 **Samatia · Yin Membership**、Pro **Samatia Pro**）；核对 Public details 商家名；statement descriptor **SAMATIA**。仓库只改若有硬编码的 Checkout 文案 | Checkout / 收据 / 客户门户不再出现 Focus Tiger；会员名与卡一致 |

**先做 T87-A1**，再 **T87-A2**。B/C/D 独立旁支 + 独立 PR。  
**发布：** A～D 全合 **且** 残留扫描绿之前，不发布、不把 samatia.net 当公开产品域名对外宣布。

## 文案落点（T87-A1 / A2）

- 新切片 `focus-tiger/src/locales/slices/samatia-display-name.json`（en / zh / ja 同键）。  
- **禁止**改 `en.json` / `zh.json` / `ja.json` 总表（只能切片覆盖）。  
- `APP_TITLE` 三语均为 `Samatia`。`jaCopyGuards` **保持**「专有名词可与英文相同」，**不为音译改门禁**。  
- 日语 `HINT_APP_PURPOSE_TITLE`（或简介卡第一行所用键）= `Samatia（サマティア）`。其它日语位置只写 Samatia。  
- 英文问号卡与英文官网首屏可加一行：`Pronounced sa-MAH-tee-ah`。  
- 中文切片覆盖旧「Focus Tiger」为 **Samatia**，**不得**写成三摩莎。  
- 知识库 / Help Center（A1）：`help-center.json` 等切片里用户可见句换 Samatia。**A2**：预生成句 / Confide 与 Local AI **用户听得到或看得到**的提示词。内部 id（`KB-FUNC-…`）不动。

## 变体矩阵（A10）

触及商品对外名、宽屏/Electron 标题、多语言入口。

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| en · Web | `?product=1` 标签 + 左下 `?` | 标题 Samatia；简介可含 sa-MAH-tee-ah；colophon `Samatia™` | colophon 单测改期望；本刀补 |
| ja · Web | Language → 日本語 后同一 `?` | 窗口标题 Samatia；简介**第一行** `Samatia（サマティア）`；colophon 拉丁文 Samatia™ | 本刀补 |
| zh 开关（若仍可切） | 切到中文 | 可见处 **Samatia** / Samatia™；**不得**出现 Focus Tiger 或三摩莎 | 切片键断言 + 残留扫描 |
| en · Support Pro | 未购 Pro，开 Support | 卡标题 **Samatia Pro** | `test:payment-contract` |
| ja · Support Pro | 同上 + 日语 | **Samatia Pro**（无片假名档名） | 本刀补 |
| Membership 卡 | 未购会员 | 仍 Yin Membership / 阿寅メンバーシップ；Checkout 为 **Samatia · Yin Membership**（D 刀） | 卡文案测；Checkout 手测归 D |
| Electron | `desktop:dev` / 包 | A 刀：`document.title` Samatia。B 刀：Dock / 关于窗 / 托盘 | A 测 APP_TITLE；B 测 package |
| 375 | 窄屏 `?` 滚到底 | colophon Samatia™；日语仍见第一行读音注 | 现有 onboarding e2e |

## 点击反馈（0–1 秒）（A14）

本次不新增控件，只改已有入口上的字。

| 控件 / 入口 | 点击后 0–1 秒内用户看到什么 | 持久化时：挂起 / 成功 / 失败 |
|---|---|---|
| 左下 `?` | 简介卡打开；en 标题 Samatia（可读音行）；ja 第一行 `Samatia（サマティア）`；colophon Samatia™ | — |
| Support FAB | 模态打开，Pro 卡 **Samatia Pro**；会员卡旧角色名 | 结账三态不改 |
| Language 切 ja | 标题立刻 Samatia；问号第一行出现读音注 | — |

## 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| 已购 Lifetime | Sanctuary 卡仍淡化；不得因改名再开 Stripe |
| 已购 Pro | Pro 卡淡化；标题 Samatia Pro |
| 网页非 Electron | Local AI 说明里的产品名改为 **Samatia**（日语也不改成片假名产品名） |
| 备份文件无效 | 提示写 Samatia；**校验与 format id 不变**，旧备份仍能导入 |
| T87-B 后本机数据「空了」 | 预期行为；用开刀前导出的备份恢复。不写迁移 |
| Stripe Product name 改完 | Checkout / 收据 / 客户门户用新 name；Price ID 不变 |
| 只合了 A、未合 B/C/D | **不得发布、不得公开新域名** |

## 残留扫描验收（守门 · 分刀扩大）

总表 JSON 不许改，漏覆盖就会留下 Focus Tiger。

- **T87-A1**：守门测试（若本 PR 引入）只扫 **A1 已改表面**（合并后的 locale 切片 + Help Center 切片 + `copyrightNotice` 常量）；**不**扫营销 HTML、Electron 配置、预生成句池、Confide/Local AI 提示词（尚未改）。  
- **T87-A2**：扩大至句池 + 会说出口的提示词；**白名单**须含：源码版权头、仓库路径 `focus-tiger/`、内部 planId / localStorage、本 Brief、内部文档「内部仓库名」句、**封存盲测 / 评测 fixtures**（不为改名改封存集）。A2 合并后跑 Confide/句池**基线对比**。  
- **T87-B/C/D 各刀**：每刀合并后扩大扫描范围至该刀产物（B：Electron 用户可见配置、通知/托盘/关于；C：营销 HTML、manifest；D：Checkout 硬编码文案）。  
- **发布硬闸**：**A1～A2 + B + C + D 全合**且全范围扫描绿，才允许发布。  
- **白名单之外**不得出现 `Focus Tiger` / `FocusTiger` / `フォーカス・タイガー` 等旧公开名（在**该刀已纳入扫描的范围**内）。

## 上线前外部事项（T87-C 公开域名前）

**不是律师意见。** PO 原文「samatia.com 已注册」「同领域同名 App 较少」**不等于**无冲突。

公开 samatia.net 当产品门面之前须完成：

1. 查 **samatia.com** 持有人。  
2. 在 USPTO、EUIPO、J-PlatPat 检索第 **9、41、42、44、45** 类。日语已用拉丁名，日本检索以 **Samatia** 一种写法为主。  
3. 搜 App Store 与 Google Play。  
4. 万网：确认注册人实名与邮箱验证未逾期。  

`Samatia™` 可在 T87-A 应用内出现；**公开新域名**是 C 刀闸门，不是 A 刀的事。

## 域名落地（T87-C · PO 核对）

- 「已解析到万网 DNS」≠ 实名/邮箱验证完成；建议在 C 刀前查控制台。  
- samatia.net 不发邮件：加拒发 SPF 与 DMARC，**不碰** twinsology.com。  
- twinsology.com 上的旧产品页 **301** 到 samatia.net；配 www 与 HTTPS。

## 权威文档（T87-A1 实现 PR 同步改对外口径，不改内部目录名）

T87-A1 实现 PR 须改这些**会指导对外文案**的句子（内部「Focus Tiger 仓库」说法可留）：

- `PRODUCT_POSITIONING.md` 对外品牌称呼  
- `EMOTION_BIBLE.md` / `PROCESS.md` 里「产品名统一为 Focus Tiger」的**对外**句 → 「对外 Samatia，内部仓库仍称 Focus Tiger」  
- `ONBOARDING_HINTS.md` colophon 行；问号第一行读音注  
- 营销站 Brief 交叉：产品门面转 samatia.net（T87-C 再改站）

**禁止**在本功能 PR 改队列账本。

## 测试

- 切片：`APP_TITLE` 三语 Samatia；日语问号第一行含 `（サマティア）`；中文可见处无三摩莎。  
- colophon / copyright / onboarding e2e 期望改为 Samatia™。  
- 残留扫描：白名单外无 Focus Tiger。  
- 触及 Support 标题时跑 `cd focus-tiger && npm run test:payment-contract`。  
- 本轮 **不** 跑全量 e2e。

## 点头含义（修订 2 + PO 附言）

若你回复「按这份 Brief 开工」（可附 PO 五条附言），视为同意本页已锁默认，包括日语拉丁名 + 读音注拍板、A1/A2 拆分、扫描分刀、ja/zh 会员卡与 Checkout 落差。

**不要**再引用修订 1 的「日文显示名 = サマティア」。

## PO 点头（2026-11-05）

> 按这份 Brief 开工；附：①扫描分刀扩范围，D 刀后才是硬闸；②A 拆 A1（locale+文档）与 A2（句池/提示词+扫描）；③封存评测集入白名单，A2 后跑一次基线对比；④「内部名」一句改为"据文档未见，D 刀确认"，「会出口」改「会说出口」；⑤商店说明归 T87-C，ja/zh 会员卡名与 Checkout 的落差接受。
