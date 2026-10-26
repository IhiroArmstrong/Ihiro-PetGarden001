# Task Brief · T54 研究数据分享开关（改进产品层）

> **状态（2026-10-25）**：Brief **待 PO 点头**。点头后才许改 Privacy 运行时。  
> **代号**：**T54** 阶段 2 第二刀。口令「按 T54 研究同意 Brief 开工」= 实现本页。口令「开工 T54」「做 90 天实验」**仍不执行**。  
> **类**：**B**（Privacy 页新增可见开关与文案）。  
> **从属**：阶段 1 SSOT [`task-t54-stage1-preregistration.md`](./task-t54-stage1-preregistration.md) §9.3 同意分层里的 **「改进产品」**；影子流水 [`task-t54-stage2-shadow-pipeline.md`](./task-t54-stage2-shadow-pipeline.md)（#1423 / #1430 已合）。数字与白名单字段以阶段 1 为准，本刀不得改口。

## 一句话目标

在现有 **?** → Privacy 页里，紧挨「支持阿寅」流程开关，加一个**默认关闭**的研究数据分享开关。打开后才允许把白名单计数字段送到自有接收口；关掉或不点则永不上送。本机计时专注流水继续默默记账，不弹窗。阿寅对用户说的话完全不变。不开 90 天实验。

## 已拍板

1. 本刀只做阶段 1 的 **改进产品** 同意层。  
2. **参加对照**（含「我已满 18 岁」）、**对外发表**、招呼文案、抽签、入组横幅 = **不做**。  
3. 控件形态对齐漏斗：Privacy 内 **checkbox**，默认关；不是独立弹窗、不是阿寅对话里的同意条。  
4. 漏斗 / YPE 云端个人化 / 练习备份同意继续独立；打开本开关不得连带打开它们。  
5. 文案禁止写「已证明有效」、禁止写「不带任何隐私痕迹」、禁止把本机研究代号说成完全匿名。

## 冲突扫描

对照场景 **W**（? / Privacy）、漏斗 opt-in、YPE opt-in、练习备份、Honesty 桥接、T50 摘要、T51 邀请、T52 打卡。

| 轴 | 判断 |
|---|---|
| **a. 强度** | 与漏斗开关同级，轻于 RCT 同意页，无新打断。须留在可滚动 Privacy body 内，不得裁切。 |
| **b. 语气** | 观察式、可选、可关。禁止诊疗 / 训练模型 / 已验证。 |
| **c. 职责** | 不替代漏斗、不替代备份、不替代 RCT 入组、不替代招呼。只打开「改进产品」上送门闩。 |

本刀无用户路径冲突。招呼刀须另 Brief 再扫与 Honesty 桥接的职责重叠。

## 范围（in）

1. Privacy `#onboarding-privacy-sheet` 在 `#privacy-monetization-funnel-opt-in` **之后**插入 `#privacy-t54-research-opt-in`（`data-testid=privacy-t54-research-opt-in-toggle`）。  
2. 写入已有键 `focus-tiger.t54-research-consent.v1`：`{ granted: boolean, consentedAt: string | null, layer: "product_improve" }`。未勾选或缺字段 = 未同意。  
3. 上送门闩改为：**已同意本层** 且云端接收口已配置 → 计时专注结束后可 POST 白名单。不再要求实验室查询参数 `t54ResearchUpload=1` 才能发（该参数可留作调试，**仍不得**在未同意时绕过）。  
4. 关掉开关：立刻视为未同意，之后永不上送。本机流水仍可追加。若本刀没有删除云端研究代号的现成接口，**不得假装已删**；记入下一刀。  
5. 文案走 `src/locales/slices/t54-research-consent.json`（en / zh / ja 同片），**禁止**改 `en.json` / `zh.json` / `ja.json` 总表。  
6. 实现 PR 同步 [`PRIVACY_NOTICE.md`](../PRIVACY_NOTICE.md) 一句可选分享说明，与漏斗段并列。  
7. 单测：默认关；勾选后 `hasT54ResearchConsent` 为真；未同意时实验室参数仍不能 POST；与漏斗键互不改写。  
8. e2e 或现有 Privacy 契约加一行：默认未勾；勾选 0–1 秒内方块勾上。

## 范围（out）

- 口令「开工 T54」所含：改招呼、「轻轻回来」、「更短的一坐」。  
- 90 天日历、RCT 入组、满 18 岁勾选、抽签、组别写入。  
- 对外发表同意。  
- 倾诉原句、情绪分数、付款信息、邮箱。  
- 改漏斗 / YPE / 备份开关的文案或默认值。  
- 受保护付款路径。

## 锁定文案（实现不得改口；点头后可微调标点）

**en**

- Label: `Share optional practice-effect counts (research)`  
- Hint: `Off by default. If you turn this on, we only receive de-identified counts about timed sits — for example whether a sit finished, and later whether you returned — plus a random research id that resets if you reinstall. No chat text, no email, and no payment details. This helps us improve the product. You can turn it off anytime.`

**zh**

- Label: `分享可选的练习效果计数（研究）`  
- Hint: `默认关闭。打开后，我们只会收到计时专注的去身份计数（例如有没有坐完、后来有没有回来），以及一个重装即作废的本机研究代号。没有倾诉原文、没有邮箱、没有付款信息。用来把产品做顺，随时可以关掉。`

**ja**

- Label: `任意の練習効果カウントを共有する（研究）`  
- Hint: `初期設定はオフです。オンにすると、時間を決めた坐の回数など（終えたか、あとで戻ったか）と、再インストールで消える研究用の番号だけが届きます。会話の原文、メール、支払い情報は送りません。製品をよくするためのものです。いつでもオフにできます。`

禁止子串（中英日均适用，大小写不敏感）：`training` / `train the model` / `已证明` / `不带您的任何隐私痕迹` / `intervention` / 临床病名。

## 变体矩阵

| 变体 | 入口 / 前置 | 预期 | 自动化 |
|---|---|---|---|
| 默认 | `?product=1` → ? → Privacy | 开关可见、未勾选；本机流水仍可记；无 POST | 单测 + Privacy 契约 |
| 打开 | 勾选本开关 | 0–1 秒内勾上；键 `granted:true`；漏斗/YPE 不变 | 单测 |
| 关闭 | 再点掉 | 0–1 秒内取消勾；之后不 POST | 单测 |
| 窄屏 375 | 同上 | 开关在可滚 body 内，不被裁切；Back 仍在 | 场景 W 步骤 |
| en / zh / ja | 同一入口 | 用上列锁定句；无禁词 | locale 切片 + 禁词单测 |
| Electron 与浏览器 | 同一 Privacy | 行为对齐，不另做系统权限框 | 单测即可 |

## 点击反馈（0–1 秒）

| 控件 | 0–1 秒 | 持久化 |
|---|---|---|
| 研究分享 checkbox 打开 | 方块勾上，hint 仍在 | 挂起：按下；成功：勾上且键已写；失败：勾回关、不弹错（与漏斗同级静默写盘） |
| 研究分享 checkbox 关闭 | 方块空 | 成功：键 `granted:false`；已发出的在途请求不强制打断画面 |

无新独立按钮。不新增 `SILENT_BEHAVIORS`；点空白关 Privacy 仍走场景 W 现网。

## 边缘状态

| 边缘状态 | 预期 |
|---|---|
| 从未打开过开关 | 视为未同意；实验室参数也不能 POST |
| 只开了漏斗 / YPE / 备份 | 本开关仍关；互不改写 |
| 接收口未配置或 503 | 不打扰画面；本地同意仍保留 |
| DEV 重置 | 清掉同意键，回到关 |
| 计时专注结束且未同意 | 可追加本机流水，零上送 |
| 诚实补登 / 一分钟呼吸 | 不因本开关改变「不算计时回来」口径 |

## 共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 新建遮罩。Privacy 仍用现有 sheet（场景 W）。新建可点击控件只在 sheet 内部 checkbox，不另起叠层。

## 后台网络

打开开关**本身**不发网（只写本机键）。之后若已同意：只在**计时专注结束**、且不在抵达 / Honesty / Reflection 叠化窗口内 POST 白名单（阶段 1 §9.3）。失败静默重试。内容相同则跳过重复写入。慢网不得卡住 Idle 呼吸。实验室未同意仍零请求。

## 开工闸

- 本 Brief 点头后，新 Chat 口令「按 T54 研究同意 Brief 开工」。  
- 实现旁支 **禁止**改 `GLOSSARY.md` / `SCHEDULING_GLOSSARY.md`。  
- 禁止同一 PR 改招呼或 RCT 同意页。  
- 不挡 10/31 验收勾选。
